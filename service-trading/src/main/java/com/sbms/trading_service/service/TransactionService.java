package com.sbms.trading_service.service;

import java.util.List;
import java.util.UUID;
import java.time.LocalDate;

import com.sbms.trading_service.dto.TransactionRequest;
import com.sbms.trading_service.dto.TransactionResponse;

public interface TransactionService {
    Long createTransaction(TransactionRequest request, UUID businessId);
    List<TransactionResponse> searchTransactions(UUID businessId, String query, String type, String dateRange, LocalDate customStart, LocalDate customEnd);
}
