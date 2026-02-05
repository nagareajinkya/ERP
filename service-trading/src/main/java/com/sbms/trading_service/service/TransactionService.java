package com.sbms.trading_service.service;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sbms.trading_service.dto.TransactionRequest;
import com.sbms.trading_service.entity.Product;
import com.sbms.trading_service.entity.Transaction;
import com.sbms.trading_service.entity.TransactionProduct;
import com.sbms.trading_service.repository.ProductRepository;
import com.sbms.trading_service.repository.TransactionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final ProductRepository productRepository;

    @Transactional
    public Long createTransaction(TransactionRequest request, UUID businessId) {
        Transaction transaction = new Transaction();
        transaction.setBusinessId(businessId);
        transaction.setPartyId(request.getPartyId());
        transaction.setDate(request.getDate());
        transaction.setType(request.getType()); // Normalize?
        transaction.setSubTotal(request.getSubTotal());
        transaction.setDiscount(request.getDiscount());
        transaction.setTotalAmount(request.getTotalAmount());
        transaction.setPaidAmount(request.getPaidAmount());

        // Process Products
        for (TransactionRequest.TransactionProductDto item : request.getProducts()) {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + item.getProductId()));

            // Verify Product belongs to business?
             if (!product.getBusinessId().equals(businessId)) {
                 throw new RuntimeException("Product does not belong to this business");
             }

            TransactionProduct tp = new TransactionProduct();
            tp.setBusinessId(businessId);
            tp.setProduct(product);
            tp.setQty(item.getQty());
            tp.setPrice(item.getPrice());
            tp.setAmount(item.getAmount());
            tp.setFree(item.isFree());

            transaction.addProduct(tp);
            
            // TODO: Update Inventory (Current Stock)
        }

        Transaction saved = transactionRepository.save(transaction);
        return saved.getId();
    }
}
