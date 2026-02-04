package com.sbms.trading_service.service;

import java.util.Map;
import java.util.UUID;

public interface PartyService {
    Map<String, Double> getStats(UUID businessId);
}
