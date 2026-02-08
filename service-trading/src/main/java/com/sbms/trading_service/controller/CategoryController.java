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

import com.sbms.trading_service.dto.CategoryDto;
import com.sbms.trading_service.service.CategoryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/trading/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @PostMapping
    public ResponseEntity<CategoryDto> createCategory(
            @RequestAttribute("businessId") UUID businessId, 
            @RequestBody CategoryDto request) {
        
        return new ResponseEntity<>(
                categoryService.createCategory(request.getName(), request.getStyleId(), businessId), 
                HttpStatus.CREATED
        );
    }

    @GetMapping
    public ResponseEntity<List<CategoryDto>> getAllCategories(
            @RequestAttribute("businessId") UUID businessId) {
        
        return ResponseEntity.ok(categoryService.getAllCategories(businessId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryDto> updateCategory(
            @RequestAttribute("businessId") UUID businessId,
            @PathVariable Long id,
            @RequestBody CategoryDto request) {
        
        return ResponseEntity.ok(categoryService.updateCategory(id, request.getName(), request.getStyleId(), businessId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(
            @RequestAttribute("businessId") UUID businessId,
            @PathVariable Long id) {
        
        categoryService.deleteCategory(id, businessId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{sourceId}/merge/{targetId}")
    public ResponseEntity<Void> mergeCategories(
            @RequestAttribute("businessId") UUID businessId,
            @PathVariable Long sourceId,
            @PathVariable Long targetId) {
        
        categoryService.mergeCategories(sourceId, targetId, businessId);
        return ResponseEntity.ok().build();
    }
}