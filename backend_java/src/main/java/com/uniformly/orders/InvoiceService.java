package com.uniformly.orders;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.*;
import com.uniformly.common.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

@Service
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final OrderRepository orderRepository;

    public InvoiceService(InvoiceRepository invoiceRepository, OrderRepository orderRepository) {
        this.invoiceRepository = invoiceRepository;
        this.orderRepository = orderRepository;
    }

    @Transactional
    public byte[] getOrCreateInvoicePdf(Long orderId) {
        Optional<Invoice> existing = invoiceRepository.findByOrderId(orderId);
        if (existing.isPresent()) {
            return existing.get().getPdfContent();
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found"));

        // Generate unique invoice number: e.g. INV-<orderNumberShort>-<orderId>
        String orderPart = order.getOrderNumber();
        if (orderPart.contains("-")) {
            orderPart = orderPart.substring(orderPart.indexOf("-") + 1);
        }
        String invoiceNumber = "INV-" + orderPart + "-" + order.getId();

        byte[] pdfContent = generateInvoicePdfBytes(order, invoiceNumber);

        Invoice invoice = new Invoice(order, invoiceNumber, pdfContent);
        invoiceRepository.save(invoice);

        return pdfContent;
    }

    private byte[] generateInvoicePdfBytes(Order order, String invoiceNumber) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 36, 36, 36, 36);
        
        try {
            PdfWriter.getInstance(document, baos);
            document.open();

            // Colors
            Color primaryColor = new Color(16, 24, 39); // Dark grey/black
            Color accentColor = new Color(37, 99, 235); // Blue
            Color borderColor = new Color(229, 231, 235); // Light grey

            // Fonts
            Font brandFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, accentColor);
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, primaryColor);
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, primaryColor);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10, primaryColor);
            Font smallFont = FontFactory.getFont(FontFactory.HELVETICA, 8, Color.GRAY);
            Font smallBoldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, primaryColor);

            // 1. Header Grid Table
            PdfPTable headerTable = new PdfPTable(2);
            headerTable.setWidthPercentage(100);
            headerTable.setWidths(new float[]{1.2f, 1f});

            // Brand details (Left cell)
            PdfPCell brandCell = new PdfPCell();
            brandCell.setBorder(Rectangle.NO_BORDER);
            brandCell.addElement(new Paragraph("UNIFORMLY", brandFont));
            brandCell.addElement(new Paragraph("Premium School Apparels", smallFont));
            headerTable.addCell(brandCell);

            // Invoice meta details (Right cell)
            PdfPCell metaCell = new PdfPCell();
            metaCell.setBorder(Rectangle.NO_BORDER);
            
            Paragraph titlePara = new Paragraph("TAX INVOICE / BILL OF SUPPLY", titleFont);
            titlePara.setAlignment(Element.ALIGN_RIGHT);
            metaCell.addElement(titlePara);

            Paragraph invNumPara = new Paragraph("Invoice No: " + invoiceNumber, boldFont);
            invNumPara.setAlignment(Element.ALIGN_RIGHT);
            metaCell.addElement(invNumPara);

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm");
            Paragraph datePara = new Paragraph("Invoice Date: " + LocalDateTime.now().format(formatter), normalFont);
            datePara.setAlignment(Element.ALIGN_RIGHT);
            metaCell.addElement(datePara);

            Paragraph orderNumPara = new Paragraph("Order ID: " + order.getOrderNumber(), normalFont);
            orderNumPara.setAlignment(Element.ALIGN_RIGHT);
            metaCell.addElement(orderNumPara);

            Paragraph orderDatePara = new Paragraph("Order Date: " + order.getCreatedAt().format(formatter), normalFont);
            orderDatePara.setAlignment(Element.ALIGN_RIGHT);
            metaCell.addElement(orderDatePara);

            headerTable.addCell(metaCell);
            document.add(headerTable);

            // Spacer
            document.add(new Paragraph(" "));

            // 2. Addresses Section Table (Two-column)
            PdfPTable addressTable = new PdfPTable(2);
            addressTable.setWidthPercentage(100);
            addressTable.setWidths(new float[]{1f, 1f});
            addressTable.setSpacingBefore(10);
            addressTable.setSpacingAfter(15);

            // Left column: Sold by (Seller)
            PdfPCell sellerCell = new PdfPCell();
            sellerCell.setBorder(Rectangle.BOX);
            sellerCell.setBorderColor(borderColor);
            sellerCell.setPadding(10);
            sellerCell.addElement(new Paragraph("SOLD BY / SELLER:", smallBoldFont));
            sellerCell.addElement(new Paragraph("Uniformly Apparels Ltd.", boldFont));
            sellerCell.addElement(new Paragraph("104, Business Hub, Phase 2\nHinjewadi, Pune\nMaharashtra - 411057\nGSTIN: 27AAFCD1234F1Z5", normalFont));
            addressTable.addCell(sellerCell);

            // Right column: Bill / Ship to (Customer)
            PdfPCell customerCell = new PdfPCell();
            customerCell.setBorder(Rectangle.BOX);
            customerCell.setBorderColor(borderColor);
            customerCell.setPadding(10);
            customerCell.addElement(new Paragraph("BILL TO / SHIP TO:", smallBoldFont));
            if (order.getAddress() != null) {
                customerCell.addElement(new Paragraph(order.getAddress().getFullName(), boldFont));
                customerCell.addElement(new Paragraph(order.getAddress().getAddressLine() + "\n" +
                        order.getAddress().getCity() + ", " + order.getAddress().getState() + " - " + order.getAddress().getPincode() + "\nPhone: " + order.getAddress().getPhone(), normalFont));
            } else {
                customerCell.addElement(new Paragraph("N/A", normalFont));
            }
            addressTable.addCell(customerCell);

            document.add(addressTable);

            // 3. Items Ordered Table
            PdfPTable itemsTable = new PdfPTable(7);
            itemsTable.setWidthPercentage(100);
            itemsTable.setWidths(new float[]{0.4f, 3.2f, 0.9f, 0.9f, 0.9f, 0.4f, 1.1f});
            itemsTable.setSpacingBefore(10);
            itemsTable.setSpacingAfter(15);

            // Table headers
            String[] headers = {"No.", "Item Description", "Unit Price", "CGST (9%)", "SGST (9%)", "Qty", "Total (INR)"};
            for (String h : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(h, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, Color.WHITE)));
                cell.setBackgroundColor(primaryColor);
                cell.setPadding(6);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                itemsTable.addCell(cell);
            }

            int index = 1;
            BigDecimal netGstTotal = BigDecimal.ZERO;
            BigDecimal netSubtotalExclusive = BigDecimal.ZERO;

            for (OrderItem item : order.getItems()) {
                // Number column
                PdfPCell numCell = new PdfPCell(new Phrase(String.valueOf(index++), normalFont));
                numCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                numCell.setPadding(6);
                itemsTable.addCell(numCell);

                // Description
                String descStr = item.getProductName() + "\n" +
                        "School: " + item.getSchoolName() + "\n" +
                        "Size: " + item.getSize() + " · " + item.getColor();
                PdfPCell descCell = new PdfPCell(new Phrase(descStr, normalFont));
                descCell.setPadding(6);
                itemsTable.addCell(descCell);

                // Pricing calculation (prices are treated as GST inclusive)
                BigDecimal unitInclusive = item.getUnitPrice();
                BigDecimal qty = BigDecimal.valueOf(item.getQuantity());
                
                // Ex-GST Unit Price = inclusive / 1.18
                BigDecimal unitExclusive = unitInclusive.divide(BigDecimal.valueOf(1.18), 4, RoundingMode.HALF_UP);
                
                // Total Ex-GST Price
                BigDecimal totalExclusive = unitExclusive.multiply(qty).setScale(2, RoundingMode.HALF_UP);
                netSubtotalExclusive = netSubtotalExclusive.add(totalExclusive);

                // 9% CGST and 9% SGST of exclusive total
                BigDecimal cgstRate = BigDecimal.valueOf(0.09);
                BigDecimal totalCgst = totalExclusive.multiply(cgstRate).setScale(2, RoundingMode.HALF_UP);
                BigDecimal totalSgst = totalExclusive.multiply(cgstRate).setScale(2, RoundingMode.HALF_UP);
                netGstTotal = netGstTotal.add(totalCgst).add(totalSgst);

                // Add cells
                PdfPCell unitPriceCell = new PdfPCell(new Phrase("₹" + unitExclusive.setScale(2, RoundingMode.HALF_UP), normalFont));
                unitPriceCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
                unitPriceCell.setPadding(6);
                itemsTable.addCell(unitPriceCell);

                PdfPCell cgstCell = new PdfPCell(new Phrase("₹" + totalCgst, normalFont));
                cgstCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
                cgstCell.setPadding(6);
                itemsTable.addCell(cgstCell);

                PdfPCell sgstCell = new PdfPCell(new Phrase("₹" + totalSgst, normalFont));
                sgstCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
                sgstCell.setPadding(6);
                itemsTable.addCell(sgstCell);

                PdfPCell qtyCell = new PdfPCell(new Phrase(String.valueOf(item.getQuantity()), normalFont));
                qtyCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                qtyCell.setPadding(6);
                itemsTable.addCell(qtyCell);

                PdfPCell totalCell = new PdfPCell(new Phrase("₹" + item.getTotalPrice().setScale(2, RoundingMode.HALF_UP), boldFont));
                totalCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
                totalCell.setPadding(6);
                itemsTable.addCell(totalCell);
            }

            document.add(itemsTable);

            // 4. Summary & Grand Total (Aligned Right)
            PdfPTable summaryTable = new PdfPTable(2);
            summaryTable.setWidthPercentage(100);
            summaryTable.setWidths(new float[]{3f, 1.2f});
            summaryTable.setSpacingBefore(10);

            // Left side spacer / billing note
            PdfPCell billingNoteCell = new PdfPCell();
            billingNoteCell.setBorder(Rectangle.NO_BORDER);
            billingNoteCell.addElement(new Paragraph("Payment Method: " + order.getPaymentMethod(), normalFont));
            billingNoteCell.addElement(new Paragraph("Payment Status: " + order.getPaymentStatus(), normalFont));
            summaryTable.addCell(billingNoteCell);

            // Right side summary fields
            PdfPCell totalsCell = new PdfPCell();
            totalsCell.setBorder(Rectangle.NO_BORDER);
            
            // Ex-GST Subtotal
            totalsCell.addElement(createSummaryRow("Subtotal (excl. Tax):", "₹" + netSubtotalExclusive.setScale(2, RoundingMode.HALF_UP), normalFont));
            
            // Tax Breakdown
            BigDecimal halfGst = netGstTotal.divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP);
            totalsCell.addElement(createSummaryRow("CGST (9%):", "₹" + halfGst, normalFont));
            totalsCell.addElement(createSummaryRow("SGST (9%):", "₹" + halfGst, normalFont));

            // Shipping Fee
            totalsCell.addElement(createSummaryRow("Shipping Fee:", "₹" + order.getShippingFee().setScale(2, RoundingMode.HALF_UP), normalFont));

            // Grand Total
            totalsCell.addElement(createSummaryRow("Grand Total (incl. Tax):", "₹" + order.getTotalAmount().setScale(2, RoundingMode.HALF_UP), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, accentColor)));

            summaryTable.addCell(totalsCell);
            document.add(summaryTable);

            // Divider
            document.add(new Paragraph(" "));
            
            // 5. Legal Footer
            Paragraph separator = new Paragraph("---------------------------------------------------------------------------------------------------------------------------------", smallFont);
            separator.setAlignment(Element.ALIGN_CENTER);
            document.add(separator);

            Paragraph footerPara1 = new Paragraph("This is a computer-generated tax invoice and does not require a physical signature.", smallFont);
            footerPara1.setAlignment(Element.ALIGN_CENTER);
            document.add(footerPara1);

            Paragraph footerPara2 = new Paragraph("Thank you for shopping with Uniformly! For support, email us at support@uniformly.com", smallFont);
            footerPara2.setAlignment(Element.ALIGN_CENTER);
            document.add(footerPara2);

        } catch (Exception ex) {
            ex.printStackTrace();
        } finally {
            document.close();
        }

        return baos.toByteArray();
    }

    private Paragraph createSummaryRow(String label, String value, Font font) {
        Paragraph p = new Paragraph();
        p.setFont(font);
        p.setAlignment(Element.ALIGN_RIGHT);
        p.add(new Chunk(label + "   "));
        p.add(new Chunk(value));
        return p;
    }
}
