package com.uniformly.orders;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;

    private String provider;

    @Column(name = "provider_payment_id")
    private String providerPaymentId;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(nullable = false)
    private String status;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    protected Payment() {
    }

    public Payment(Order order, String provider, BigDecimal amount, String status) {
        this.order = order;
        this.provider = provider;
        this.amount = amount;
        this.status = status;
    }
}
