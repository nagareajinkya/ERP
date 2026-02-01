package com.sbms.trading_service.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sbms.trading_service.dto.UnitDto;
import com.sbms.trading_service.service.UnitService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/units")
@RequiredArgsConstructor
public class UnitController {

    private final UnitService unitService;

    @PostMapping
    public ResponseEntity<UnitDto> createUnit(
            @RequestAttribute("businessId") UUID businessId, 
            @RequestParam String name) {
        
        return new ResponseEntity<>(
                unitService.createUnit(name, businessId), 
                HttpStatus.CREATED
        );
    }

    @GetMapping
    public ResponseEntity<List<UnitDto>> getAllUnits(
            @RequestAttribute("businessId") UUID businessId) {
        
        return ResponseEntity.ok(unitService.getAllUnits(businessId));
    }
}