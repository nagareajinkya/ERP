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
public class ChartDataPointDto {
    private String name;  // Time label (e.g., "9 AM", "Mon", "Week 1")
    private BigDecimal sales;  // Sales amount for this period
}
