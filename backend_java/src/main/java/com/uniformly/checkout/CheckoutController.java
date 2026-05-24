package com.uniformly.checkout;

import com.uniformly.addresses.Address;
import com.uniformly.addresses.AddressRepository;
import com.uniformly.cart.CartItem;
import com.uniformly.cart.CartItemRepository;
import com.uniformly.admin.AdminSseService;
import com.uniformly.common.NotFoundException;
import com.uniformly.orders.*;
import com.uniformly.payment.RazorpayService;
import com.uniformly.products.ProductVariant;
import com.uniformly.products.ProductVariantRepository;
import com.uniformly.users.User;
import com.uniformly.users.UserRepository;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.util.List;

@RestController
@RequestMapping("/api/v1/checkout")
public class CheckoutController {

    private final UserRepository users;
    private final AddressRepository addresses;
    private final CartItemRepository cartItems;
    private final OrderRepository orders;
    private final PaymentRepository payments;
    private final OrderStatusHistoryRepository statusHistory;
    private final ProductVariantRepository variantRepository;
    private final RazorpayService razorpayService;
    private final AdminSseService adminSseService;
    private final SecureRandom random = new SecureRandom();

    public CheckoutController(
            UserRepository users,
            AddressRepository addresses,
            CartItemRepository cartItems,
            OrderRepository orders,
            PaymentRepository payments,
            OrderStatusHistoryRepository statusHistory,
            ProductVariantRepository variantRepository,
            RazorpayService razorpayService,
            AdminSseService adminSseService
    ) {
        this.users = users;
        this.addresses = addresses;
        this.cartItems = cartItems;
        this.orders = orders;
        this.payments = payments;
        this.statusHistory = statusHistory;
        this.variantRepository = variantRepository;
        this.razorpayService = razorpayService;
        this.adminSseService = adminSseService;
    }

    /**
     * Step 1 – Initialise checkout.
     *
     * For COD orders: creates the order immediately with PENDING payment status.
     * For online payment (UPI, Card, NetBanking, etc.): creates the order as PENDING,
     * creates a Razorpay order, and returns the Razorpay order ID + key ID so the
     * frontend can open the Razorpay payment modal.
     */
    @PostMapping("/init")
    @Transactional
    public CheckoutInitResponse initCheckout(@Valid @RequestBody CheckoutInitRequest request) {
        Long userId = com.uniformly.auth.SecurityUtils.getAuthenticatedUserId();
        User user = users.findById(userId).orElseThrow(() -> new NotFoundException("User not found"));
        Address address = addresses.findByIdAndUserId(request.addressId(), userId)
                .orElseThrow(() -> new NotFoundException("Address not found"));

        List<CartItem> items = cartItems.findByUserIdOrderByCreatedAtDesc(userId);
        if (items.isEmpty()) {
            throw new IllegalArgumentException("Cart is empty");
        }

        // ── Stock validation (pessimistic lock to prevent overselling) ──
        for (CartItem item : items) {
            ProductVariant variant = variantRepository.findByIdWithLock(item.getVariant().getId())
                    .orElseThrow(() -> new NotFoundException("Product variant not found"));
            if (variant.getStockQuantity() < item.getQuantity()) {
                throw new IllegalArgumentException(
                        "'" + item.getProduct().getName() + "' (" + variant.getSize() + "/" + variant.getColor()
                        + ") has only " + variant.getStockQuantity() + " unit(s) left in stock."
                );
            }
        }

        // ── Pricing ──
        BigDecimal subtotal = items.stream()
                .map(item -> item.getProduct().getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal shippingFee = BigDecimal.valueOf(70);
        BigDecimal gstAmount = BigDecimal.ZERO;
        BigDecimal total = subtotal.add(shippingFee).add(gstAmount);

        String orderNumber = generateOrderNumber();
        boolean isCod = "COD".equalsIgnoreCase(request.paymentMethod());

        // ── Create internal order (always PENDING until payment confirmed) ──
        Order order = new Order(user, address, orderNumber, subtotal, shippingFee, gstAmount, total, request.paymentMethod());
        items.forEach(item -> order.addItem(new OrderItem(order, item.getProduct(), item.getVariant(), item.getQuantity())));
        Order saved = orders.save(order);
        statusHistory.save(new OrderStatusHistory(saved, "PLACED", "Order placed"));

        if (isCod) {
            // COD: stock decremented immediately, admin confirms payment later
            decrementStock(items);
            cartItems.deleteByUserId(userId);
            payments.save(new Payment(saved, "COD", total, "PENDING"));
            adminSseService.notifyNewOrder(saved); // Real-time notification
            return new CheckoutInitResponse(saved.getId(), saved.getOrderNumber(), null, null, true);
        } else {
            // Online payment: create a Razorpay order; do NOT decrement stock yet
            String razorpayOrderId;
            try {
                razorpayOrderId = razorpayService.createOrder(total, saved.getOrderNumber());
            } catch (IllegalStateException e) {
                // Razorpay gateway error — rollback will happen via @Transactional
                throw new IllegalArgumentException("Payment gateway error. Please try again or use COD.");
            }
            saved.setRazorpayOrderId(razorpayOrderId);
            orders.save(saved);
            payments.save(new Payment(saved, request.paymentMethod(), total, "PENDING"));
            return new CheckoutInitResponse(saved.getId(), saved.getOrderNumber(), razorpayOrderId, razorpayService.getKeyId(), false);
        }
    }

    /**
     * Step 2 (online payments only) – Verify Razorpay signature and confirm payment.
     *
     * Razorpay calls the frontend with razorpay_order_id, razorpay_payment_id, razorpay_signature.
     * The frontend forwards them here. We verify HMAC SHA256 and mark the order PAID.
     */
    @PostMapping("/verify")
    @Transactional
    public OrderResponse verifyPayment(@Valid @RequestBody PaymentVerifyRequest request) {
        Long userId = com.uniformly.auth.SecurityUtils.getAuthenticatedUserId();

        Order order = orders.findByOrderNumberAndUserId(request.orderNumber(), userId)
                .orElseThrow(() -> new NotFoundException("Order not found"));

        if (!"PENDING".equals(order.getPaymentStatus())) {
            // Already processed — idempotent response
            return OrderResponse.from(order);
        }

        // Verify Razorpay HMAC signature
        boolean valid = razorpayService.verifySignature(
                request.razorpayOrderId(),
                request.razorpayPaymentId(),
                request.razorpaySignature()
        );

        if (!valid) {
            throw new IllegalArgumentException("Payment signature verification failed. Do not proceed.");
        }

        // ── Mark PAID and PLACED ──
        order.setPaymentStatus("PAID");
        if ("PAYMENT_FAILED".equals(order.getOrderStatus()) || "PENDING".equals(order.getOrderStatus())) {
            order.setOrderStatus("PLACED");
        }
        order.setRazorpayPaymentId(request.razorpayPaymentId());
        orders.save(order);

        adminSseService.notifyNewOrder(order); // Real-time notification

        // ── Decrement stock now that payment is confirmed ──
        List<CartItem> items = cartItems.findByUserIdOrderByCreatedAtDesc(userId);
        // Cart might already be cleared if init was COD; for online payments the cart is still there
        if (!items.isEmpty()) {
            decrementStock(items);
            cartItems.deleteByUserId(userId);
        }

        // Update payment record
        payments.findByOrderId(order.getId()).ifPresent(p -> {
            p.setStatus("PAID");
            p.setProviderPaymentId(request.razorpayPaymentId());
            payments.save(p);
        });

        return OrderResponse.from(order);
    }

    /**
     * Called by the frontend when Razorpay fires payment.failed.
     * Marks the order as PAYMENT_FAILED so it appears correctly in My Orders.
     * Stock is NOT decremented (was never decremented for online orders at init time).
     * Cart is NOT cleared — user can retry or choose COD.
     */
    @PatchMapping("/{orderNumber}/fail")
    @Transactional
    public void markPaymentFailed(@PathVariable String orderNumber) {
        Long userId = com.uniformly.auth.SecurityUtils.getAuthenticatedUserId();
        Order order = orders.findByOrderNumberAndUserId(orderNumber, userId)
                .orElseThrow(() -> new NotFoundException("Order not found"));

        // Only update if still PENDING — idempotent
        if ("PENDING".equals(order.getPaymentStatus())) {
            order.setOrderStatus("PAYMENT_FAILED");
            order.setPaymentStatus("FAILED");
            orders.save(order);

            payments.findByOrderId(order.getId()).ifPresent(p -> {
                p.setStatus("FAILED");
                payments.save(p);
            });

            statusHistory.save(new OrderStatusHistory(order, "PAYMENT_FAILED", "Payment failed at gateway"));
        }
    }

    // ── Helpers ──

    private void decrementStock(List<CartItem> items) {
        for (CartItem item : items) {
            ProductVariant variant = variantRepository.findByIdWithLock(item.getVariant().getId())
                    .orElseThrow(() -> new NotFoundException("Variant not found"));
            int newQty = variant.getStockQuantity() - item.getQuantity();
            if (newQty < 0) {
                throw new IllegalArgumentException("Insufficient stock for " + item.getProduct().getName());
            }
            variant.setStockQuantity(newQty);
            variantRepository.save(variant);
        }
    }

    private String generateOrderNumber() {
        return "UNF-" + Long.toString(Math.abs(random.nextLong()), 36).toUpperCase();
    }

    // ── Request / Response Records ──

    public record CheckoutInitRequest(
            @NotNull Long addressId,
            @NotBlank String paymentMethod
    ) {}

    public record CheckoutInitResponse(
            Long orderId,
            String orderNumber,
            String razorpayOrderId,   // null for COD
            String razorpayKeyId,      // null for COD
            boolean cod
    ) {}

    public record PaymentVerifyRequest(
            @NotBlank String orderNumber,
            @NotBlank String razorpayOrderId,
            @NotBlank String razorpayPaymentId,
            @NotBlank String razorpaySignature
    ) {}
}
