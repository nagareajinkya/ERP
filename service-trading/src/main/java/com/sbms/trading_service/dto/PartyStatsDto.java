package com.sbms.trading_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PartyStatsDto {
    private Long id;
    private String name;
    private String phoneNumber;
    private BigDecimal totalSpent;
    private Long visitCount;
    private String type; // "Top Spender" or "Frequent Visitor"
}
