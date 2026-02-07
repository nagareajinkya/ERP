package com.sbms.trading_service.controller;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.DeleteMapping;

import com.sbms.trading_service.dto.TransactionRequest;
import com.sbms.trading_service.service.TransactionService;

import org.springframework.format.annotation.DateTimeFormat;
import java.time.LocalDate;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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
    public ResponseEntity<ApiResponse<Long>> createTransaction(
            @RequestAttribute("businessId") UUID businessId,
            @RequestBody TransactionRequest request) {
        
        Long id = transactionService.createTransaction(request, businessId);
        return ResponseEntity.ok(ApiResponse.success(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Long>> updateTransaction(
            @PathVariable Long id,
            @RequestAttribute("businessId") UUID businessId,
            @RequestBody TransactionRequest request) {
        Long updatedId = transactionService.updateTransaction(id, request, businessId);
        return ResponseEntity.ok(ApiResponse.success(updatedId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTransaction(
            @PathVariable Long id,
            @RequestAttribute("businessId") UUID businessId) {
        transactionService.deleteTransaction(id, businessId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> searchTransactions(
            @RequestAttribute("businessId") UUID businessId,
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "All") String type,
            @RequestParam(defaultValue = "Today") String dateRange,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
            
        List<TransactionResponse> results = transactionService.searchTransactions(businessId, query, type, dateRange, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(results));
    }

    @GetMapping("/party/{partyId}")
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> getTransactionsByParty(
            @RequestAttribute("businessId") UUID businessId,
            @PathVariable Long partyId) {
        List<TransactionResponse> results = transactionService.getTransactionsByParty(businessId, partyId);
        return ResponseEntity.ok(ApiResponse.success(results));
    }
}
