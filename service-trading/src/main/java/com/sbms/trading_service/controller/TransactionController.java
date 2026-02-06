package com.sbms.trading_service.controller;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sbms.trading_service.dto.TransactionRequest;
import com.sbms.trading_service.service.TransactionService;

import org.springframework.format.annotation.DateTimeFormat;
import java.time.LocalDate;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import com.sbms.trading_service.dto.ApiResponse;
import com.sbms.trading_service.dto.TransactionResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/trading/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping
    public ResponseEntity<Long> createTransaction(
            @RequestAttribute("businessId") UUID businessId,
            @RequestBody TransactionRequest request) {
        
        Long id = transactionService.createTransaction(request, businessId);
        return new ResponseEntity<>(id, HttpStatus.CREATED);
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> searchTransactions(
            @RequestAttribute("businessId") UUID businessId,
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "All") String type,
            @RequestParam(defaultValue = "Today") String dateRange,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
            
        java.util.List<TransactionResponse> results = transactionService.searchTransactions(businessId, query, type, dateRange, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(results));
    }
}
