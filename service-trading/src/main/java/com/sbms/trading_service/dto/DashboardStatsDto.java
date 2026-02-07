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
public class DashboardStatsDto {
    private BigDecimal todaysSales;
    private String salesTrend;
    private Integer totalBills;
    private BigDecimal dailyAverage;
    private Integer lowStockItems;
    private Integer activeOffers;
}
