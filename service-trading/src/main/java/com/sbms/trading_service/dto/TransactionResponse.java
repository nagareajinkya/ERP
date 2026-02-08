package com.sbms.trading_service.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TransactionResponse {
    private Long id;
    private Long partyId;
    private String party;
    private LocalDate date;
    private String time;  // Time of transaction creation
    private String type;
    private String status; // Paid, Unpaid, Partial
    private int products;
    private BigDecimal amount;
    private BigDecimal paidAmount;
    private String paymentMode;
    private String referenceNumber;
    private String notes;
    private BigDecimal subTotal;
    private BigDecimal discount;
    private List<OfferDto> appliedOffers;
    
    // Details for Modal
    private List<DetailDto> details;

    @Data
    @Builder
    public static class DetailDto {
        private Long productId;
        private String name;
        private boolean isFree;
        private BigDecimal rate;
        private BigDecimal qty;
        private BigDecimal total;
    }

    @Data
    @Builder
    public static class OfferDto {
        private String offerId;
        private String offerName;
        private BigDecimal discountAmount;
    }
}
