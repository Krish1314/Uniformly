package com.uniformly.orders;

import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderCancellationRepository extends JpaRepository<OrderCancellation, Long> {
}
