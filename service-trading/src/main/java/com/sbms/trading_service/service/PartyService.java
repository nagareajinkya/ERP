package com.sbms.trading_service.service;

import java.util.Map;
import java.util.UUID;

public interface PartyService {
    Map<String, Double> getStats(UUID businessId);

    java.util.List<com.sbms.trading_service.dto.PartyStatsDto> getTopSpenders(UUID businessId, int limit);
    java.util.List<com.sbms.trading_service.dto.PartyStatsDto> getFrequentVisitors(UUID businessId, int limit);
}
