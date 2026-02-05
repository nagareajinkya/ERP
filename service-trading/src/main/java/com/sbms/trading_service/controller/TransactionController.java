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
}
