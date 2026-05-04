package com.uniformly.cart;

import com.uniformly.common.NotFoundException;
import com.uniformly.products.Product;
import com.uniformly.products.ProductRepository;
import com.uniformly.products.ProductVariant;
import com.uniformly.products.ProductVariantRepository;
import com.uniformly.users.User;
import com.uniformly.users.UserRepository;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/cart")
@CrossOrigin(origins = "http://localhost:3000")
public class CartController {
    private final CartItemRepository cartItems;
    private final UserRepository users;
    private final ProductRepository products;
    private final ProductVariantRepository variants;

    public CartController(CartItemRepository cartItems, UserRepository users, ProductRepository products, ProductVariantRepository variants) {
        this.cartItems = cartItems;
        this.users = users;
        this.products = products;
        this.variants = variants;
    }

    @GetMapping
    public CartResponse getCart() {
        Long userId = com.uniformly.auth.SecurityUtils.getAuthenticatedUserId();
        return CartResponse.from(cartItems.findByUserIdOrderByCreatedAtDesc(userId));
    }

    @PostMapping("/items")
    public CartResponse addCartItem(
            @Valid @RequestBody AddCartItemRequest request
    ) {
        Long userId = com.uniformly.auth.SecurityUtils.getAuthenticatedUserId();
        User user = users.findById(userId).orElseThrow(() -> new NotFoundException("User not found"));
        Product product = products.findById(request.productId()).orElseThrow(() -> new NotFoundException("Product not found"));
        ProductVariant variant = variants.findById(request.variantId()).orElseThrow(() -> new NotFoundException("Product variant not found"));
        if (!variant.getProduct().getId().equals(product.getId())) {
            throw new IllegalArgumentException("Variant does not belong to product");
        }
        CartItem item = cartItems.findByUserIdAndVariantId(userId, variant.getId())
                .map(existing -> {
                    existing.setQuantity(existing.getQuantity() + request.quantity());
                    return existing;
                })
                .orElseGet(() -> new CartItem(user, product, variant, request.quantity()));
        cartItems.save(item);
        return getCart();
    }

    @PatchMapping("/items/{cartItemId}")
    public CartResponse updateCartItem(
            @PathVariable Long cartItemId,
            @Valid @RequestBody UpdateCartItemRequest request
    ) {
        Long userId = com.uniformly.auth.SecurityUtils.getAuthenticatedUserId();
        CartItem item = cartItems.findByIdAndUserId(cartItemId, userId)
                .orElseThrow(() -> new NotFoundException("Cart item not found"));
        item.setQuantity(request.quantity());
        cartItems.save(item);
        return getCart();
    }

    @DeleteMapping("/items/{cartItemId}")
    public CartResponse removeCartItem(
            @PathVariable Long cartItemId
    ) {
        Long userId = com.uniformly.auth.SecurityUtils.getAuthenticatedUserId();
        CartItem item = cartItems.findByIdAndUserId(cartItemId, userId)
                .orElseThrow(() -> new NotFoundException("Cart item not found"));
        cartItems.delete(item);
        return getCart();
    }

    @DeleteMapping
    @Transactional
    public CartResponse clearCart() {
        Long userId = com.uniformly.auth.SecurityUtils.getAuthenticatedUserId();
        cartItems.deleteByUserId(userId);
        return getCart();
    }

    public record AddCartItemRequest(
            @NotNull Long productId,
            @NotNull Long variantId,
            @NotNull @Min(1) Integer quantity
    ) {}

    public record UpdateCartItemRequest(
            @NotNull @Min(1) Integer quantity
    ) {}
}
