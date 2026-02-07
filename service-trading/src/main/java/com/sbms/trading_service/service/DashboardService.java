package com.sbms.trading_service.service;

import com.sbms.trading_service.dto.DashboardSummaryDto;
import java.util.UUID;

public interface DashboardService {
    DashboardSummaryDto getDashboardSummary(UUID businessId, String period);
}
