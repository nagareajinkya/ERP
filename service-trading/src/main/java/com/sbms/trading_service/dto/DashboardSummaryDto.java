package com.sbms.trading_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryDto {
    private DashboardStatsDto stats;
    private List<ChartDataPointDto> chartData;
    private List<RecentTransactionDto> recentTransactions;
    private List<LowStockItemDto> lowStockItems;
}
