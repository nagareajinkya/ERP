package com.sbms.trading_service.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sbms.trading_service.dto.UnitDto;
import com.sbms.trading_service.service.UnitService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/trading/units")
@RequiredArgsConstructor
public class UnitController {

    private final UnitService unitService;

    @PostMapping
    public ResponseEntity<UnitDto> createUnit(
            @RequestAttribute("businessId") UUID businessId, 
            @RequestBody UnitDto request) {
        
        return new ResponseEntity<>(
                unitService.createUnit(request.getName(), request.getSymbol(), businessId), 
                HttpStatus.CREATED
        );
    }

    @GetMapping
    public ResponseEntity<List<UnitDto>> getAllUnits(
            @RequestAttribute("businessId") UUID businessId) {
        
        return ResponseEntity.ok(unitService.getAllUnits(businessId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UnitDto> updateUnit(
            @RequestAttribute("businessId") UUID businessId,
            @PathVariable Long id,
            @RequestBody UnitDto request) {
        
        return ResponseEntity.ok(unitService.updateUnit(id, request.getName(), request.getSymbol(), businessId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUnit(
            @RequestAttribute("businessId") UUID businessId,
            @PathVariable Long id) {
        
        unitService.deleteUnit(id, businessId);
        return ResponseEntity.noContent().build();
    }
}