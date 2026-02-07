package com.sbms.trading_service.service;


import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.sbms.trading_service.dto.PartyStatsDto;

public interface PartyService {
    Map<String, Double> getStats(UUID businessId);

    List<PartyStatsDto> getTopSpenders(UUID businessId, int limit);
    List<PartyStatsDto> getFrequentVisitors(UUID businessId, int limit);
}
