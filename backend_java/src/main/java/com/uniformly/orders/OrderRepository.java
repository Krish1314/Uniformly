package com.uniformly.orders;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Order> findByCreatedAtAfter(java.time.LocalDateTime startDate);

    Optional<Order> findByIdAndUserId(Long id, Long userId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        select o from Order o
        left join fetch o.items
        where o.id = :id and o.user.id = :userId
    """)
    Optional<Order> findByIdAndUserIdForUpdate(@Param("id") Long id, @Param("userId") Long userId);

    Optional<Order> findByOrderNumberAndUserId(String orderNumber, Long userId);

    @Query("""
        select coalesce(sum(o.totalAmount), 0)
        from Order o
        where o.paymentStatus = 'PAID'
    """)
    BigDecimal sumPaidRevenue();

    Long countByOrderStatus(String orderStatus);

    List<Order> findTop5ByOrderByCreatedAtDesc();

    @Query("""
        select o.orderStatus, count(o)
        from Order o
        group by o.orderStatus
    """)
    List<Object[]> findOrderStatusCounts();

    @Query("""
        select distinct o from Order o
        join fetch o.user
        left join fetch o.address
        left join fetch o.items
        where (:search is null
            or lower(o.orderNumber) like :search
            or lower(o.user.firstName) like :search
            or lower(o.user.lastName) like :search
            or lower(o.user.email) like :search)
        and (:status is null or o.orderStatus = :status)
        order by o.createdAt desc
    """)
    List<Order> adminSearchOrders(
            @Param("search") String search,
            @Param("status") String status
    );

    @Query("""
        select
            oi.product.id,
            oi.productName,
            p.imageUrl,
            sum(oi.quantity),
            sum(oi.totalPrice)
        from OrderItem oi
        left join Product p on p.id = oi.product.id
        group by oi.product.id, oi.productName, p.imageUrl
        order by sum(oi.quantity) desc
    """)
    List<Object[]> findTopProducts();
}
