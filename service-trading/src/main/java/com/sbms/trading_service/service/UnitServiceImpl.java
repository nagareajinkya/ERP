package com.sbms.trading_service.service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sbms.trading_service.dto.UnitDto;
import com.sbms.trading_service.entity.Unit;
import com.sbms.trading_service.repository.UnitRepository;
import com.sbms.trading_service.repository.ProductRepository;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class UnitServiceImpl implements UnitService {

    private final UnitRepository unitRepository;
    private final ProductRepository productRepository;
    private final ModelMapper modelMapper;

    @Override
    public UnitDto createUnit(String name, String symbol, UUID businessId) {
        Unit unit = unitRepository.findByNameAndBusinessId(name, businessId)
                .orElseGet(() -> {
                    Unit newUnit = new Unit();
                    newUnit.setName(name);
                    newUnit.setSymbol(symbol);
                    newUnit.setBusinessId(businessId);
                    return unitRepository.save(newUnit);
                });

        return modelMapper.map(unit, UnitDto.class);
    }

    @Override
    public List<UnitDto> getAllUnits(UUID businessId) {
        return unitRepository.findAllByBusinessId(businessId).stream()
                .map(unit -> modelMapper.map(unit, UnitDto.class))
                .collect(Collectors.toList());
    }

    @Override
    public UnitDto updateUnit(Long id, String name, String symbol, UUID businessId) {
        Unit unit = unitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Unit not found"));
        
        if (!unit.getBusinessId().equals(businessId)) {
            throw new RuntimeException("Unauthorized");
        }

        unit.setName(name);
        unit.setSymbol(symbol);
        
        return modelMapper.map(unitRepository.save(unit), UnitDto.class);
    }

    @Override
    public void deleteUnit(Long id, UUID businessId) {
        Unit unit = unitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Unit not found"));
        
        if (!unit.getBusinessId().equals(businessId)) {
            throw new RuntimeException("Unauthorized");
        }

        long count = productRepository.countByUnitIdAndBusinessId(id, businessId);
        if (count > 0) {
            throw new RuntimeException("first move products from this unit to another unit");
        }

        unitRepository.delete(unit);
    }
}