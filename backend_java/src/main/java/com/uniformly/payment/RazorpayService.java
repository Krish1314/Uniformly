package com.uniformly.payment;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;

@Service
public class RazorpayService {

    private final String keyId;
    private final String keySecret;

    public RazorpayService(
            @Value("${application.security.razorpay.key-id}") String keyId,
            @Value("${application.security.razorpay.key-secret}") String keySecret
    ) {
        this.keyId = keyId;
        this.keySecret = keySecret;
    }

    /**
     * Creates a Razorpay order. Amount is in INR; this converts to paise internally.
     * @return Razorpay order ID e.g. "order_xxx"
     */
    public String createOrder(BigDecimal amountInr, String receiptId) {
        try {
            RazorpayClient client = new RazorpayClient(keyId, keySecret);
            JSONObject options = new JSONObject();
            // Razorpay expects amount in paise (1 INR = 100 paise)
            options.put("amount", amountInr.multiply(BigDecimal.valueOf(100)).intValue());
            options.put("currency", "INR");
            options.put("receipt", receiptId);
            options.put("payment_capture", 1); // auto-capture on success
            Order order = client.orders.create(options);
            return order.get("id");
        } catch (RazorpayException e) {
            throw new IllegalStateException("Failed to create Razorpay order: " + e.getMessage(), e);
        }
    }

    /**
     * Verifies a payment signature from Razorpay checkout callback.
     * Signature = HMAC-SHA256(razorpay_order_id + "|" + razorpay_payment_id, key_secret)
     */
    public boolean verifySignature(String razorpayOrderId, String razorpayPaymentId, String razorpaySignature) {
        try {
            String payload = razorpayOrderId + "|" + razorpayPaymentId;
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(keySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            String computedSignature = HexFormat.of().formatHex(hash);
            return computedSignature.equals(razorpaySignature);
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Issues a full or partial refund via Razorpay.
     * @param razorpayPaymentId  the payment ID returned by Razorpay on capture (razorpay_payment_id)
     * @param amountInr          amount to refund in INR (full order total for a full refund)
     * @return Razorpay refund ID (e.g. "rfnd_xxx") for record-keeping
     */
    public String createRefund(String razorpayPaymentId, BigDecimal amountInr) {
        try {
            RazorpayClient client = new RazorpayClient(keyId, keySecret);
            JSONObject refundRequest = new JSONObject();
            // Razorpay expects amount in paise
            refundRequest.put("amount", amountInr.multiply(BigDecimal.valueOf(100)).longValue());
            refundRequest.put("speed", "normal"); // "normal" = 5-7 days, "optimum" = fastest available
            com.razorpay.Refund refund = client.payments.refund(razorpayPaymentId, refundRequest);
            return refund.get("id");
        } catch (RazorpayException e) {
            throw new IllegalStateException("Failed to issue refund: " + e.getMessage(), e);
        }
    }

    public String getKeyId() {
        return keyId;
    }
}
