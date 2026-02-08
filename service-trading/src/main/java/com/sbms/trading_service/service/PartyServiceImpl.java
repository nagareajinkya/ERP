package com.sbms.trading_service.service;

import com.sbms.trading_service.repository.PartyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.sbms.trading_service.dto.PartyStatsDto;
import com.sbms.trading_service.entity.Party;
import com.sbms.trading_service.repository.TransactionRepository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PartyServiceImpl implements PartyService {

    private final PartyRepository partyRepository;
    private final TransactionRepository transactionRepository;

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
    public List<PartyStatsDto> getTopSpenders(UUID businessId, int limit, int duration, String unit) {
        LocalDate since = calculateSinceDate(duration, unit);
        List<Object[]> results = transactionRepository.findTopSpenders(businessId, since);
        return mapToDto(results, businessId, "Top Spender", limit);
    }

    @Override
    public List<PartyStatsDto> getFrequentVisitors(UUID businessId, int limit, int duration, int minVisits) {
        LocalDate since = LocalDate.now().minusDays(duration);
        List<Object[]> results = transactionRepository.findFrequentVisitors(businessId, since);

        // Filter by minVisits
        List<Object[]> filteredResults = new ArrayList<>();
        for (Object[] row : results) {
            Long count = (Long) row[1];
            if (count >= minVisits) {
                filteredResults.add(row);
            }
        }

        return mapToDto(filteredResults, businessId, "Frequent Visitor", limit);
    }

    private LocalDate calculateSinceDate(int duration, String unit) {
        LocalDate now = LocalDate.now();
        if (unit == null) return now.minusYears(1);
        
        return switch (unit.toLowerCase()) {
            case "days" -> now.minusDays(duration);
            case "weeks" -> now.minusWeeks(duration);
            case "months" -> now.minusMonths(duration);
            case "years" -> now.minusYears(duration);
            default -> now.minusYears(1);
        };
    }

    private List<PartyStatsDto> mapToDto(List<Object[]> results, UUID businessId, String type, int limit) {
        List<PartyStatsDto> dtos = new ArrayList<>();
        int count = 0;
        
        for (Object[] row : results) {
            if (count >= limit) break;
            
            Long partyId = (Long) row[0];
            BigDecimal value = (row[1] instanceof BigDecimal) ? (BigDecimal) row[1] : BigDecimal.valueOf((Long) row[1]);
            
            Party party = partyRepository.findById(partyId).orElse(null);
            
            if (party != null) {
                dtos.add(PartyStatsDto.builder()
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
