package com.sbms.trading_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecentTransactionDto {
    private String id;  // Transaction ID (could be formatted as "#TRX-123")
    private String customer;  // Party name
    private String type;  // "Sale" or "Purchase"
    private String time;  // Formatted time (e.g., "2 hours ago")
    private String status;  // "Paid" or "Pending"
    private BigDecimal amount;  // Transaction amount
}
