package com.sbms.trading_service.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}
