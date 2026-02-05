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
    private final com.sbms.trading_service.repository.TransactionRepository transactionRepository;

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

    @Override
    public java.util.List<com.sbms.trading_service.dto.PartyStatsDto> getTopSpenders(UUID businessId, int limit) {
        java.util.List<Object[]> results = transactionRepository.findTopSpenders(businessId);
        return mapToDto(results, businessId, "Top Spender", limit);
    }

    @Override
    public java.util.List<com.sbms.trading_service.dto.PartyStatsDto> getFrequentVisitors(UUID businessId, int limit) {
        java.util.List<Object[]> results = transactionRepository.findFrequentVisitors(businessId);
        return mapToDto(results, businessId, "Frequent Visitor", limit);
    }

    private java.util.List<com.sbms.trading_service.dto.PartyStatsDto> mapToDto(java.util.List<Object[]> results, UUID businessId, String type, int limit) {
        java.util.List<com.sbms.trading_service.dto.PartyStatsDto> dtos = new java.util.ArrayList<>();
        int count = 0;
        
        for (Object[] row : results) {
            if (count >= limit) break;
            
            Long partyId = (Long) row[0];
            java.math.BigDecimal value = (row[1] instanceof java.math.BigDecimal) ? (java.math.BigDecimal) row[1] : java.math.BigDecimal.valueOf((Long) row[1]);
            
            com.sbms.trading_service.entity.Party party = partyRepository.findById(partyId).orElse(null);
            
            if (party != null) {
                dtos.add(com.sbms.trading_service.dto.PartyStatsDto.builder()
                        .id(partyId)
                        .name(party.getName())
                        .phoneNumber(party.getPhoneNumber())
                        .totalSpent("Top Spender".equals(type) ? value : null)
                        .visitCount("Frequent Visitor".equals(type) ? value.longValue() : null)
                        .type(type)
                        .build());
                count++;
            }
        }
        return dtos;
    }
}
