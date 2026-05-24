package com.uniformly.orders;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "order_cancellations")
public class OrderCancellation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String reason;

    @Column(name = "cancelled_by", nullable = false)
    private String cancelledBy;

    @Column(name = "refund_status")
    private String refundStatus;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    protected OrderCancellation() {
    }

    public OrderCancellation(Order order, Long userId, String reason, String cancelledBy, String refundStatus) {
        this.order = order;
        this.userId = userId;
        this.reason = reason;
        this.cancelledBy = cancelledBy;
        this.refundStatus = refundStatus;
    }
}
