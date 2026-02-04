package com.sbms.trading_service.service;

import com.sbms.trading_service.repository.PartyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PartyServiceImpl implements PartyService {

    private final PartyRepository partyRepository;

    @Override
    public Map<String, Double> getStats(UUID businessId) {
        BigDecimal toReceiveFn = partyRepository.getTotalReceivables(businessId);
        BigDecimal toPayFn = partyRepository.getTotalPayables(businessId);
        
        // Handle nulls (if no parties exist)
        Double toReceive = (toReceiveFn != null) ? toReceiveFn.doubleValue() : 0.0;
        Double toPay = (toPayFn != null) ? toPayFn.abs().doubleValue() : 0.0;

        Map<String, Double> response = new HashMap<>();
        response.put("toReceive", toReceive);
        response.put("toPay", toPay);
        
        return response;
    }
}
