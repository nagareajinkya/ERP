package com.sbms.trading_service.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.sbms.trading_service.dto.PartyStatsDto;
import com.sbms.trading_service.service.PartyService;

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
    public ResponseEntity<java.util.List<PartyStatsDto>> getTopSpenders(
            @RequestAttribute("businessId") UUID businessId,
            @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(partyService.getTopSpenders(businessId, limit));
    }

    @GetMapping("/frequent-visitors")
    public ResponseEntity<java.util.List<PartyStatsDto>> getFrequentVisitors(
            @RequestAttribute("businessId") UUID businessId,
            @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(partyService.getFrequentVisitors(businessId, limit));
    }
}
