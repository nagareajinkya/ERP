package com.sbms.trading_service.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductHistoryResponse {
    
    private List<TransactionHistoryDto> sales;
    private List<TransactionHistoryDto> purchases;
    private java.math.BigDecimal recommendedPrice;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TransactionHistoryDto {
        private Long transactionId;
        private String party;
        private LocalDate date;
        private BigDecimal qty;
        private BigDecimal rate;
        private BigDecimal total;
    }
}
