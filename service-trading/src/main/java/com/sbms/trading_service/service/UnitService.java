package com.sbms.trading_service.service;

import java.util.List;
import java.util.UUID;

import com.sbms.trading_service.dto.UnitDto;
public interface UnitService {
	UnitDto createUnit(String name, String symbol, UUID businessId);
    List<UnitDto> getAllUnits(UUID businessId);
    UnitDto updateUnit(Long id, String name, String symbol, UUID businessId);
    void deleteUnit(Long id, UUID businessId);
}
