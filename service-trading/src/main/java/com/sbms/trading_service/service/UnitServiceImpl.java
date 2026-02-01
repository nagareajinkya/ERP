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

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class UnitServiceImpl implements UnitService {

    private final UnitRepository unitRepository;
    private final ModelMapper modelMapper;

    @Override
    public UnitDto createUnit(String name, UUID businessId) {
        Unit unit = unitRepository.findByNameAndBusinessId(name, businessId)
                .orElseGet(() -> {
                    Unit newUnit = new Unit();
                    newUnit.setName(name);
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
}