package com.sbms.trading_service.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import lombok.Data;

@Data
public class TransactionRequest {
    private Long partyId;
    private LocalDate date;
    private String type; // SALE, PURCHASE
    private BigDecimal subTotal;
    private BigDecimal discount;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    
    private List<TransactionProductDto> products;

    @Data
    public static class TransactionProductDto {
        private Long productId;
        private BigDecimal qty;
        private BigDecimal price;
        private BigDecimal amount;
        private boolean isFree;
    }
}
