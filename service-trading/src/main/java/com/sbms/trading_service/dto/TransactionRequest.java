package com.sbms.trading_service.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import lombok.Data;

@Data
public class TransactionRequest {
    private Long partyId;
    private String partyName; // Store name for history/search
    private LocalDate date;
    private String type; // SALE, PURCHASE
    private BigDecimal subTotal;
    private BigDecimal discount;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    
    // Settlement fields (for RECEIPT/PAYMENT types)
    private String paymentMode; // Will be converted to enum in service
    private String referenceNumber;
    private String notes;
    
    private List<TransactionProductDto> products;

    private List<TransactionOfferDto> appliedOffers;

    @Data
    public static class TransactionOfferDto {
        private String offerId;
        private String offerName;
        private BigDecimal discountAmount;
    }

    @Data
    public static class TransactionProductDto {
        private Long productId;
        private BigDecimal qty;
        private BigDecimal price;
        private BigDecimal amount;
        private boolean isFree;
    }
}
