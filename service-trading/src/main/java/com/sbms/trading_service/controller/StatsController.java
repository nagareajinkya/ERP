package com.sbms.trading_service.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.sbms.trading_service.dto.PartyStatsDto;
import com.sbms.trading_service.service.PartyService;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/trading/stats")
@RequiredArgsConstructor
public class StatsController {

    private final PartyService partyService;

    @GetMapping
    public ResponseEntity<Map<String, Double>> getStats(@RequestAttribute("businessId") UUID businessId) {
        return ResponseEntity.ok(partyService.getStats(businessId));
    }

    @GetMapping("/top-spenders")
    public ResponseEntity<List<PartyStatsDto>> getTopSpenders(
            @RequestAttribute("businessId") UUID businessId,
            @RequestParam(defaultValue = "5") int limit,
            @RequestParam(defaultValue = "1") int duration,
            @RequestParam(defaultValue = "Years") String unit) {
        return ResponseEntity.ok(partyService.getTopSpenders(businessId, limit, duration, unit));
    }

    @GetMapping("/frequent-visitors")
    public ResponseEntity<List<PartyStatsDto>> getFrequentVisitors(
            @RequestAttribute("businessId") UUID businessId,
            @RequestParam(defaultValue = "5") int limit,
            @RequestParam(defaultValue = "30") int duration,
            @RequestParam(defaultValue = "5") int minVisits) {
        return ResponseEntity.ok(partyService.getFrequentVisitors(businessId, limit, duration, minVisits));
    }
}
