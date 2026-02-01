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

import com.sbms.trading_service.dto.CategoryDto;
import com.sbms.trading_service.service.CategoryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @PostMapping
    public ResponseEntity<CategoryDto> createCategory(
            @RequestAttribute("businessId") UUID businessId, 
            @RequestParam String name) {
        
        return new ResponseEntity<>(
                categoryService.createCategory(name, businessId), 
                HttpStatus.CREATED
        );
    }

    @GetMapping
    public ResponseEntity<List<CategoryDto>> getAllCategories(
            @RequestAttribute("businessId") UUID businessId) {
        
        return ResponseEntity.ok(categoryService.getAllCategories(businessId));
    }
}