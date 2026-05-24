package com.uniformly.orders;

import com.uniformly.common.NotFoundException;
import com.uniformly.auth.SecurityUtils;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
public class InvoiceController {

    private final InvoiceService invoiceService;
    private final OrderRepository orderRepository;

    public InvoiceController(InvoiceService invoiceService, OrderRepository orderRepository) {
        this.invoiceService = invoiceService;
        this.orderRepository = orderRepository;
    }

    @GetMapping("/orders/{orderId}/invoice")
    public ResponseEntity<byte[]> getCustomerInvoice(@PathVariable Long orderId) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        
        // Ensure order belongs to customer and exists
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new NotFoundException("Order not found or access denied"));

        if ("PAYMENT_FAILED".equals(order.getOrderStatus()) || "FAILED".equals(order.getPaymentStatus())) {
            throw new IllegalArgumentException("Cannot generate invoice for failed payments");
        }

        byte[] pdfBytes = invoiceService.getOrCreateInvoicePdf(orderId);

        String filename = "invoice-" + order.getOrderNumber() + ".pdf";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @GetMapping("/admin/orders/{orderId}/invoice")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> getAdminInvoice(@PathVariable Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found"));

        if ("PAYMENT_FAILED".equals(order.getOrderStatus()) || "FAILED".equals(order.getPaymentStatus())) {
            throw new IllegalArgumentException("Cannot generate invoice for failed payments");
        }

        byte[] pdfBytes = invoiceService.getOrCreateInvoicePdf(orderId);

        String filename = "invoice-" + order.getOrderNumber() + ".pdf";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}
