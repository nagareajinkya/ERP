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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sbms.trading_service.dto.ProductRequest;
import com.sbms.trading_service.dto.ProductResponse;
import com.sbms.trading_service.service.ProductService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/trading/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping
    public ResponseEntity<ProductResponse> addProduct(
            @RequestAttribute("businessId") UUID businessId,
            @RequestBody ProductRequest request) {
        
        return new ResponseEntity<>(
                productService.addProduct(request, businessId), 
                HttpStatus.CREATED
        );
    }

    @GetMapping
    public ResponseEntity<List<ProductResponse>> getMyProducts(
            @RequestAttribute("businessId") UUID businessId,
            @RequestParam(required = false) String search) {
        
        return ResponseEntity.ok(productService.getMyProducts(businessId, search));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> updateProduct(
            @RequestAttribute("businessId") UUID businessId,
            @PathVariable Long id,
            @RequestBody ProductRequest request) {
        
        return ResponseEntity.ok(
                productService.updateProduct(id, request, businessId)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(
            @RequestAttribute("businessId") UUID businessId,
            @PathVariable Long id) {
        
        productService.deleteProduct(id, businessId);
        return ResponseEntity.noContent().build(); // Returns 204 No Content
    }
}