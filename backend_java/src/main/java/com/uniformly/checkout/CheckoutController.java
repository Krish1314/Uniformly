package com.uniformly.checkout;

import com.uniformly.addresses.Address;
import com.uniformly.addresses.AddressRepository;
import com.uniformly.cart.CartItem;
import com.uniformly.cart.CartItemRepository;
import com.uniformly.common.NotFoundException;
import com.uniformly.orders.*;
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
@CrossOrigin(origins = "*")
public class CheckoutController {
    private final UserRepository users;
    private final AddressRepository addresses;
    private final CartItemRepository cartItems;
    private final OrderRepository orders;
    private final PaymentRepository payments;
    private final OrderStatusHistoryRepository statusHistory;
    private final SecureRandom random = new SecureRandom();

    public CheckoutController(UserRepository users, AddressRepository addresses, CartItemRepository cartItems, OrderRepository orders, PaymentRepository payments, OrderStatusHistoryRepository statusHistory) {
        this.users = users;
        this.addresses = addresses;
        this.cartItems = cartItems;
        this.orders = orders;
        this.payments = payments;
        this.statusHistory = statusHistory;
    }

    @PostMapping
    @Transactional
    public OrderResponse checkout(
            @Valid @RequestBody CheckoutRequest request
    ) {
        Long userId = com.uniformly.auth.SecurityUtils.getAuthenticatedUserId();
        User user = users.findById(userId).orElseThrow(() -> new NotFoundException("User not found"));
        Address address = addresses.findByIdAndUserId(request.addressId(), userId)
                .orElseThrow(() -> new NotFoundException("Address not found"));
        List<CartItem> items = cartItems.findByUserIdOrderByCreatedAtDesc(userId);
        if (items.isEmpty()) {
            throw new IllegalArgumentException("Cart is empty");
        }
        BigDecimal subtotal = items.stream()
                .map(item -> item.getProduct().getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal shippingFee = BigDecimal.valueOf(70);
        BigDecimal gstAmount = BigDecimal.ZERO;
        BigDecimal total = subtotal.add(shippingFee).add(gstAmount);
        Order order = new Order(user, address, generateOrderNumber(), subtotal, shippingFee, gstAmount, total, request.paymentMethod());
        items.forEach(item -> order.addItem(new OrderItem(order, item.getProduct(), item.getVariant(), item.getQuantity())));
        Order saved = orders.save(order);
        payments.save(new Payment(saved, request.paymentMethod(), total, "PAID"));
        statusHistory.save(new OrderStatusHistory(saved, "PLACED", "Order has been placed"));
        cartItems.deleteByUserId(userId);
        return OrderResponse.from(saved);
    }

    public record CheckoutRequest(
            @NotNull Long addressId,
            @NotBlank String paymentMethod
    ) {}

    private String generateOrderNumber() {
        return "UNF-" + Long.toString(Math.abs(random.nextLong()), 36).toUpperCase();
    }
}
