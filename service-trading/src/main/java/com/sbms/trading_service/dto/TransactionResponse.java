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
    private String party;
    private LocalDate date;
    private String type;
    private String status; // Paid, Unpaid, Partial
    private int products;
    private BigDecimal amount;
    private BigDecimal paidAmount;
    private String paymentMode;
    
    // Details for Modal
    private List<DetailDto> details;

    @Data
    @Builder
    public static class DetailDto {
        private String name;
        private BigDecimal rate;
        private BigDecimal qty;
        private BigDecimal total;
    }
}
