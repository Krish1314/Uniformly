package com.uniformly.admin;

import com.uniformly.orders.Order;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AdminSseService {
    private final Map<Long, SseEmitter> emitters = new ConcurrentHashMap<>();

    public SseEmitter createEmitter(Long userId) {
        // Keep connection open indefinitely
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        emitters.put(userId, emitter);

        emitter.onCompletion(() -> emitters.remove(userId));
        emitter.onTimeout(() -> emitters.remove(userId));
        emitter.onError((e) -> emitters.remove(userId));

        // Send an initial dummy event to establish the connection properly
        try {
            emitter.send(SseEmitter.event().name("init").data("connected"));
        } catch (IOException e) {
            emitters.remove(userId);
        }

        return emitter;
    }

    public void notifyNewOrder(Order order) {
        String payload = String.format("{\"orderNumber\":\"%s\", \"total\":%s, \"paymentMethod\":\"%s\"}", 
                order.getOrderNumber(), order.getTotalAmount(), order.getPaymentMethod());

        for (Map.Entry<Long, SseEmitter> entry : emitters.entrySet()) {
            try {
                entry.getValue().send(SseEmitter.event().name("order_placed").data(payload));
            } catch (IOException e) {
                // If a connection is dead, remove it from the map
                emitters.remove(entry.getKey());
            }
        }
    }
}
