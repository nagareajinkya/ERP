package com.sbms.trading_service.service;

import java.util.UUID;
import java.math.BigDecimal;
import java.time.LocalDate;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import com.sbms.trading_service.dto.TransactionRequest;
import com.sbms.trading_service.entity.Product;
import com.sbms.trading_service.entity.Transaction;
import com.sbms.trading_service.entity.TransactionProduct;
import com.sbms.trading_service.repository.ProductRepository;
import com.sbms.trading_service.repository.TransactionRepository;

import lombok.RequiredArgsConstructor;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import com.sbms.trading_service.dto.TransactionResponse;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final ProductRepository productRepository;
    private final RestTemplate restTemplate;

    @Override
    @Transactional
    public Long createTransaction(TransactionRequest request, UUID businessId) {
        Transaction transaction = new Transaction();
        transaction.setBusinessId(businessId);
        transaction.setPartyId(request.getPartyId());
        transaction.setPartyName(request.getPartyName());
        transaction.setDate(request.getDate());
        transaction.setType(request.getType()); 
        transaction.setSubTotal(request.getSubTotal());
        transaction.setDiscount(request.getDiscount());
        transaction.setTotalAmount(request.getTotalAmount());
        transaction.setPaidAmount(request.getPaidAmount());

        // Update Party Balance via Service-Parties API
        if (request.getPartyId() != null) {
            try {
                // Calculate Amount to adjust
                BigDecimal remaining = transaction.getTotalAmount().subtract(transaction.getPaidAmount());
                BigDecimal adjustment = BigDecimal.ZERO;

                if ("SALE".equalsIgnoreCase(request.getType())) {
                    adjustment = remaining; // Positive
                } else if ("PURCHASE".equalsIgnoreCase(request.getType())) {
                    adjustment = remaining.negate(); // Negative
                }
                
                if (adjustment.compareTo(BigDecimal.ZERO) != 0) {
                     String url = "http://localhost:5000/api/Parties/" + request.getPartyId() + "/balance";
                     
                     // Create Body
                     Map<String, BigDecimal> body = Collections.singletonMap("amount", adjustment);
                     
                     // Get Token
                     String token = null;
                     // Get Token from Request Header directly
                     ServletRequestAttributes attributes = 
                         (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
                     
                     if (attributes != null) {
                         String authHeader = attributes.getRequest().getHeader("Authorization");
                         if (authHeader != null && authHeader.startsWith("Bearer ")) {
                             token = authHeader.substring(7);
                         }
                     }

                     HttpHeaders headers = new HttpHeaders();
                     if (token != null) headers.setBearerAuth(token);
                     
                     HttpEntity<Map<String, BigDecimal>> entity = new HttpEntity<>(body, headers);
                     
                     restTemplate.postForEntity(url, entity, Void.class);
                }

            } catch (Exception e) {
                // Log error but assume transaction success? Or Fail?
                // For now, let's just print stack trace. Ideally implementation should be robust (Saga pattern or retry)
                e.printStackTrace();
                throw new RuntimeException("Failed to update party balance: " + e.getMessage());
            }
        }

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
            
            // Update Inventory (Current Stock)
            adjustStock(product, item.getQty(), request.getType(), false);
        }

        Transaction saved = transactionRepository.save(transaction);
        return saved.getId();
    }

    // Helper to adjust stock
    private void adjustStock(Product product, BigDecimal qty, String type, boolean isReversal) {
        if (qty == null || qty.compareTo(BigDecimal.ZERO) == 0) return;

        BigDecimal adjustment = qty;
        
        // Logic:
        // Sale: -Qty
        // Purchase: +Qty
        // Reversal: Flip sign
        
        if ("SALE".equalsIgnoreCase(type)) {
            adjustment = adjustment.negate();
        } else if ("PURCHASE".equalsIgnoreCase(type)) {
            // Keep positive
        }
        
        if (isReversal) {
            adjustment = adjustment.negate();
        }

        // Apply
        BigDecimal newStock = product.getCurrentStock().add(adjustment);
        product.setCurrentStock(newStock);
        productRepository.save(product);
    }

    @Override
    public List<TransactionResponse> searchTransactions(UUID businessId, String query, String type, String dateRange, LocalDate customStart, LocalDate customEnd) {
        // Calculate Date Range
        LocalDate startDate = null;
        LocalDate endDate = LocalDate.now();

        if (dateRange != null) {
            switch (dateRange) {
                case "Custom Range":
                    if (customStart != null) startDate = customStart;
                    if (customEnd != null) endDate = customEnd;
                    break;
                case "Today":
                    startDate = LocalDate.now();
                    break;
                case "Yesterday":
                    startDate = LocalDate.now().minusDays(1);
                    endDate = startDate;
                    break;
                case "This Week":
                    startDate = LocalDate.now().minusWeeks(1); // approximate or start of week
                    break;
                case "This Month":
                    startDate = LocalDate.now().withDayOfMonth(1);
                    break;
                default: 
                    // All Time: Use safe default range instead of nulls to simplify Query
                    startDate = LocalDate.of(1970, 1, 1);
                    endDate = LocalDate.of(2100, 12, 31);
            }
        }

        // Ensure query is safe string for "Before" logic
        String safeQuery = (query == null) ? "" : query.trim();

        List<Transaction> transactions;
        if ("All".equalsIgnoreCase(type)) {
             transactions = transactionRepository.findByBusinessIdAndPartyNameContainingIgnoreCaseAndDateBetweenOrderByDateDesc(
                 businessId, safeQuery, startDate, endDate
             );
        } else {
             transactions = transactionRepository.findByBusinessIdAndPartyNameContainingIgnoreCaseAndTypeAndDateBetweenOrderByDateDesc(
                 businessId, safeQuery, type, startDate, endDate
             );
        }

        return transactions.stream().map(t -> {
            String status = "Unpaid";
            if (t.getPaidAmount() != null && t.getTotalAmount() != null) {
                if (t.getPaidAmount().compareTo(t.getTotalAmount()) >= 0) status = "Paid";
                else if (t.getPaidAmount().doubleValue() > 0) status = "Partial";
            }

            return TransactionResponse.builder()
                    .id(t.getId())
                    .partyId(t.getPartyId())
                    .party(t.getPartyName() != null ? t.getPartyName() : "Unknown") 
                    .date(t.getDate())
                    .type(t.getType())
                    .status(status)
                    .amount(t.getTotalAmount())
                    .paidAmount(t.getPaidAmount())
                    .paymentMode("Cash") 
                    .products(t.getProducts().size())
                    .details(t.getProducts().stream().map(p -> TransactionResponse.DetailDto.builder()
                            .productId(p.getProduct().getId())
                            .name(p.getProduct().getName())
                            .isFree(p.isFree())
                            .qty(p.getQty())
                            .rate(p.getPrice())
                            .total(p.getAmount())
                            .build()).toList())
                    .build();
        }).toList();
    }

    @Override
    @Transactional
    public Long updateTransaction(Long id, TransactionRequest request, UUID businessId) {
        Transaction existing = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        if (!existing.getBusinessId().equals(businessId)) {
            throw new RuntimeException("Unauthorized access to transaction");
        }

        // 1. Revert Old Balance Impact
        if (existing.getPartyId() != null) {
            BigDecimal oldRemaining = existing.getTotalAmount().subtract(existing.getPaidAmount());
            BigDecimal oldAdjustment = BigDecimal.ZERO;
            if ("SALE".equalsIgnoreCase(existing.getType())) {
                oldAdjustment = oldRemaining; 
            } else if ("PURCHASE".equalsIgnoreCase(existing.getType())) {
                oldAdjustment = oldRemaining.negate();
            }
            // Reverse it (negate)
            updatePartyBalance(existing.getPartyId(), oldAdjustment.negate());
        }

        // 2. Update Fields
        existing.setPartyId(request.getPartyId());
        existing.setPartyName(request.getPartyName());
        existing.setDate(request.getDate());
        existing.setType(request.getType());
        existing.setSubTotal(request.getSubTotal());
        existing.setDiscount(request.getDiscount());
        existing.setTotalAmount(request.getTotalAmount());
        existing.setPaidAmount(request.getPaidAmount());

        // 3. Clear and Re-add Products
        // A. Rever Old Stock
        for (TransactionProduct oldItem : existing.getProducts()) {
            adjustStock(oldItem.getProduct(), oldItem.getQty(), existing.getType(), true); // Reversal = true
        }

        existing.getProducts().clear();
        for (TransactionRequest.TransactionProductDto item : request.getProducts()) {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + item.getProductId()));
            
            TransactionProduct tp = new TransactionProduct();
            tp.setBusinessId(businessId);
            tp.setTransaction(existing); // Important linkage
            tp.setProduct(product);
            tp.setQty(item.getQty());
            tp.setPrice(item.getPrice());
            tp.setAmount(item.getAmount());
            tp.setFree(item.isFree());
            existing.getProducts().add(tp);

            // B. Apply New Stock
            adjustStock(product, item.getQty(), request.getType(), false); // Reversal = false
        }

        // 4. Apply New Balance Impact
        if (request.getPartyId() != null) {
            BigDecimal newRemaining = request.getTotalAmount().subtract(request.getPaidAmount());
            BigDecimal newAdjustment = BigDecimal.ZERO;
            if ("SALE".equalsIgnoreCase(request.getType())) {
                newAdjustment = newRemaining;
            } else if ("PURCHASE".equalsIgnoreCase(request.getType())) {
                newAdjustment = newRemaining.negate();
            }
            updatePartyBalance(request.getPartyId(), newAdjustment);
        }

        transactionRepository.save(existing);
        return existing.getId();
    }

    @Override
    @Transactional
    public void deleteTransaction(Long id, UUID businessId) {
        Transaction existing = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        if (!existing.getBusinessId().equals(businessId)) {
            throw new RuntimeException("Unauthorized access to transaction");
        }

        // 1. Revert Stock
        for (TransactionProduct item : existing.getProducts()) {
            adjustStock(item.getProduct(), item.getQty(), existing.getType(), true); // Reversal = true
        }

        // 2. Revert Balance Impact
        if (existing.getPartyId() != null) {
            BigDecimal remaining = existing.getTotalAmount().subtract(existing.getPaidAmount());
            BigDecimal adjustment = BigDecimal.ZERO;
            if ("SALE".equalsIgnoreCase(existing.getType())) {
                adjustment = remaining; 
            } else if ("PURCHASE".equalsIgnoreCase(existing.getType())) {
                adjustment = remaining.negate();
            }
            // Reverse it
            updatePartyBalance(existing.getPartyId(), adjustment.negate());
        }

        // 3. Delete
        transactionRepository.delete(existing);
    }

    private void updatePartyBalance(Long partyId, BigDecimal adjustment) {
        if (adjustment.compareTo(BigDecimal.ZERO) == 0) return;

        try {
            String url = "http://localhost:5000/api/Parties/" + partyId + "/balance";
            Map<String, BigDecimal> body = Collections.singletonMap("amount", adjustment);

            // Get Token
            String token = null;
            ServletRequestAttributes attributes = 
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            
            if (attributes != null) {
                String authHeader = attributes.getRequest().getHeader("Authorization");
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    token = authHeader.substring(7);
                }
            }

            HttpHeaders headers = new HttpHeaders();
            if (token != null) headers.setBearerAuth(token);
            
            HttpEntity<Map<String, BigDecimal>> entity = new HttpEntity<>(body, headers);
            restTemplate.postForEntity(url, entity, Void.class);

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to update party balance: " + e.getMessage());
        }
    }
}
