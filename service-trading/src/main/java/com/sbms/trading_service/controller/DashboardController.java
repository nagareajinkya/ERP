package com.sbms.trading_service.controller;

import com.sbms.trading_service.dto.DashboardSummaryDto;
import com.sbms.trading_service.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/trading/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryDto> getDashboardSummary(
            @RequestAttribute("businessId") UUID businessId,
            @RequestParam(defaultValue = "today") String period) {
        
        DashboardSummaryDto summary = dashboardService.getDashboardSummary(businessId, period);
        return ResponseEntity.ok(summary);
    }
}
