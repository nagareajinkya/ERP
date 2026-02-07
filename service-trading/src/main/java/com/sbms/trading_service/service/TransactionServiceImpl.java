package com.sbms.trading_service.service;

import java.util.UUID;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import com.sbms.trading_service.dto.TransactionRequest;
import com.sbms.trading_service.entity.Product;
import com.sbms.trading_service.entity.Transaction;
import com.sbms.trading_service.entity.TransactionOffer;
import com.sbms.trading_service.entity.TransactionProduct;
import com.sbms.trading_service.enums.TransactionType;
import com.sbms.trading_service.enums.PaymentMode;
import com.sbms.trading_service.repository.ProductRepository;
import com.sbms.trading_service.repository.TransactionRepository;

import lombok.RequiredArgsConstructor;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import com.sbms.trading_service.dto.TransactionResponse;
import org.springframework.web.client.RestTemplate;
import java.util.stream.Collectors;

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
        
        TransactionType type = TransactionType.valueOf(request.getType().toUpperCase());
        transaction.setType(type); 
        
        transaction.setSubTotal(request.getSubTotal());
        transaction.setDiscount(request.getDiscount());
        transaction.setTotalAmount(request.getTotalAmount());
        transaction.setPaidAmount(request.getPaidAmount());

        // Set settlement fields (for RECEIPT/PAYMENT types)
        if (request.getPaymentMode() != null) {
            transaction.setPaymentMode(PaymentMode.valueOf(request.getPaymentMode().toUpperCase().replace(" ", "_")));
        }
        transaction.setReferenceNumber(request.getReferenceNumber());
        transaction.setNotes(request.getNotes());

        // Update Party Balance via Service-Parties API
        if (request.getPartyId() != null) {
            try {
                BigDecimal adjustment = BigDecimal.ZERO;

                if (TransactionType.SALE.equals(type)) {
                    // Calculate Amount to adjust for SALE
                    BigDecimal remaining = transaction.getTotalAmount().subtract(transaction.getPaidAmount());
                    adjustment = remaining; // Positive (Receivable Increases)
                } else if (TransactionType.PURCHASE.equals(type)) {
                    // Calculate Amount to adjust for PURCHASE
                    BigDecimal remaining = transaction.getTotalAmount().subtract(transaction.getPaidAmount());
                    adjustment = remaining.negate(); // Negative (Payable Increases / Receivable Decreases)
                } else if (TransactionType.RECEIPT.equals(type)) {
                    // RECEIPT: Customer pays you, reduces what they owe
                    adjustment = transaction.getPaidAmount().negate(); // Negative reduces receivable
                } else if (TransactionType.PAYMENT.equals(type)) {
                    // PAYMENT: You pay supplier, reduces what you owe
                    adjustment = transaction.getPaidAmount(); // Positive reduces payable (increases balance towards zero)
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

        // Process Products (only for SALE/PURCHASE, not for RECEIPT/PAYMENT)
        if (request.getProducts() != null && (TransactionType.SALE.equals(type) || TransactionType.PURCHASE.equals(type))) {
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
                adjustStock(product, item.getQty(), type, false);
            }
        }

        // Process Offers Entity Creation (only for SALE/PURCHASE, not for RECEIPT/PAYMENT)
        if (request.getAppliedOffers() != null && (TransactionType.SALE.equals(type) || TransactionType.PURCHASE.equals(type))) {
            for (TransactionRequest.TransactionOfferDto offerDto : request.getAppliedOffers()) {
                TransactionOffer offer = new TransactionOffer();
                offer.setOfferId(offerDto.getOfferId());
                offer.setOfferName(offerDto.getOfferName());
                offer.setDiscountAmount(offerDto.getDiscountAmount());
                transaction.addOffer(offer);
            }
        }
            
        Transaction saved = transactionRepository.save(transaction);

        // Notify Smart Ops Service (After save to get Transaction ID)
        if (request.getAppliedOffers() != null) {
            for (TransactionRequest.TransactionOfferDto offerDto : request.getAppliedOffers()) {
                 recordOfferUsage(offerDto.getOfferId(), saved.getId().toString(), saved.getPartyId(), saved.getPartyName(), offerDto.getDiscountAmount());
            }
        }

        return saved.getId();
    }

    private void recordOfferUsage(String offerId, String transactionsId, Long partyId, String partyName, BigDecimal discountAmount) {
        try {
            String url = "http://localhost:8080/api/smart-ops/offers/redemption";
            
            // Body
            Map<String, Object> body = Map.of(
                "offerId", offerId,
                "transactionId", transactionsId, 
                "customerId", partyId != null ? partyId.toString() : "walk-in",
                "partyName", partyName != null ? partyName : "Walk-in",
                "discountAmount", discountAmount
            );

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
             
             HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
             
             // Async or Fire-and-forget? RestTemplate is sync. 
             // We don't want to fail transaction if this fails? 
             // Requirement says "make it work". Let's do sync for now.
             restTemplate.postForEntity(url, entity, Void.class);

        } catch (Exception e) {
            System.err.println("Failed to record offer usage: " + e.getMessage());
            // Don't throw exception to avoid rolling back transaction? 
            // Or do we want strict consistency? Usually marketing stats are non-critical.
        }
    }

    // Helper to adjust stock
    // Helper to adjust stock
    private void adjustStock(Product product, BigDecimal qty, TransactionType type, boolean isReversal) {
        if (qty == null || qty.compareTo(BigDecimal.ZERO) == 0) return;

        BigDecimal adjustment = qty;
        
        // Logic:
        // Sale: -Qty
        // Purchase: +Qty
        // Reversal: Flip sign
        
        if (TransactionType.SALE.equals(type)) {
            adjustment = adjustment.negate();
        } else if (TransactionType.PURCHASE.equals(type)) {
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
             TransactionType tType = TransactionType.valueOf(type.toUpperCase());
             transactions = transactionRepository.findByBusinessIdAndPartyNameContainingIgnoreCaseAndTypeAndDateBetweenOrderByDateDesc(
                 businessId, safeQuery, tType, startDate, endDate
             );
        }

        return transactions.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public List<TransactionResponse> getTransactionsByParty(UUID businessId, Long partyId) {
        List<Transaction> transactions = transactionRepository.findByBusinessIdAndPartyIdOrderByDateDesc(businessId, partyId);
        return transactions.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private TransactionResponse mapToResponse(Transaction t) {
        String status = "Unpaid";
        if (t.getPaidAmount() != null && t.getTotalAmount() != null) {
            if (t.getPaidAmount().compareTo(t.getTotalAmount()) >= 0) status = "Paid";
            else if (t.getPaidAmount().doubleValue() > 0) status = "Partial";
        }

        // Format time from createdAt timestamp
        String time = "";
        if (t.getCreatedAt() != null) {
            DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("hh:mm a");
            time = t.getCreatedAt().format(timeFormatter);
        }

        // For RECEIPT/PAYMENT, use paymentMode if available
        String paymentModeStr = "Cash"; // Default
        if (t.getPaymentMode() != null) {
            paymentModeStr = t.getPaymentMode().name().replace("_", " ");
        }

        return TransactionResponse.builder()
                .id(t.getId())
                .partyId(t.getPartyId())
                .party(t.getPartyName() != null ? t.getPartyName() : "Unknown") 
                .date(t.getDate())
                .time(time)
                .type(t.getType().name())
                .status(status)
                .amount(t.getTotalAmount())
                .paidAmount(t.getPaidAmount())
                .paymentMode(paymentModeStr) 
                .products(t.getProducts().size())
                .details(t.getProducts().stream().map(p -> TransactionResponse.DetailDto.builder()
                        .productId(p.getProduct().getId())
                        .name(p.getProduct().getName())
                        .isFree(p.isFree())
                        .qty(p.getQty())
                        .rate(p.getPrice())
                        .total(p.getAmount())
                        .build()).collect(Collectors.toList()))
                .build();
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
            BigDecimal oldAdjustment = BigDecimal.ZERO;
            
            TransactionType oldType = existing.getType();
            if (TransactionType.SALE.equals(oldType)) {
                BigDecimal oldRemaining = existing.getTotalAmount().subtract(existing.getPaidAmount());
                oldAdjustment = oldRemaining; 
            } else if (TransactionType.PURCHASE.equals(oldType)) {
                BigDecimal oldRemaining = existing.getTotalAmount().subtract(existing.getPaidAmount());
                oldAdjustment = oldRemaining.negate();
            } else if (TransactionType.RECEIPT.equals(oldType)) {
                oldAdjustment = existing.getPaidAmount().negate();
            } else if (TransactionType.PAYMENT.equals(oldType)) {
                oldAdjustment = existing.getPaidAmount();
            }
            // Reverse it (negate)
            updatePartyBalance(existing.getPartyId(), oldAdjustment.negate());
        }

        // 2. Update Fields
        existing.setPartyId(request.getPartyId());
        existing.setPartyName(request.getPartyName());
        existing.setDate(request.getDate());
        
        TransactionType newType = TransactionType.valueOf(request.getType().toUpperCase());
        existing.setType(newType);
        
        existing.setSubTotal(request.getSubTotal());
        existing.setDiscount(request.getDiscount());
        existing.setTotalAmount(request.getTotalAmount());
        existing.setPaidAmount(request.getPaidAmount());

        // Update settlement fields
        if (request.getPaymentMode() != null) {
            existing.setPaymentMode(PaymentMode.valueOf(request.getPaymentMode().toUpperCase().replace(" ", "_")));
        } else {
            existing.setPaymentMode(null);
        }
        existing.setReferenceNumber(request.getReferenceNumber());
        existing.setNotes(request.getNotes());

        // 3. Clear and Re-add Products (only for SALE/PURCHASE)
        // A. Revert Old Stock
        TransactionType existingType = existing.getType();
        for (TransactionProduct oldItem : existing.getProducts()) {
            adjustStock(oldItem.getProduct(), oldItem.getQty(), existingType, true); // Reversal = true
        }

        existing.getProducts().clear();
        if (request.getProducts() != null && (TransactionType.SALE.equals(newType) || TransactionType.PURCHASE.equals(newType))) {
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
                adjustStock(product, item.getQty(), newType, false); // Reversal = false
            }
        }

        // 3.5 Handle Offers Update (only for SALE/PURCHASE)
        // A. Rollback Old Offers
        for (TransactionOffer oldOffer : existing.getOffers()) {
             rollbackRedemption(oldOffer.getOfferId(), existing.getId().toString());
        }
        existing.getOffers().clear();

        // B. Add New Offers
        if (request.getAppliedOffers() != null && (TransactionType.SALE.equals(newType) || TransactionType.PURCHASE.equals(newType))) {
            for (TransactionRequest.TransactionOfferDto offerDto : request.getAppliedOffers()) {
                TransactionOffer offer = new TransactionOffer();
                // TransactionOffer entity defined doesn't have businessId, only ID, Transaction, OfferId, OfferName, Discount.
                // It relies on Transaction -> Business linkage.
                
                offer.setOfferId(offerDto.getOfferId());
                offer.setOfferName(offerDto.getOfferName());
                offer.setDiscountAmount(offerDto.getDiscountAmount());
                
                existing.addOffer(offer);
                
                // Notify Smart Ops (Record Usage)
                recordOfferUsage(offerDto.getOfferId(), existing.getId().toString(), existing.getPartyId(), existing.getPartyName(), offerDto.getDiscountAmount());
            }
        }

        // 4. Apply New Balance Impact
        if (request.getPartyId() != null) {
            BigDecimal newAdjustment = BigDecimal.ZERO;
            
            if (TransactionType.SALE.equals(newType)) {
                BigDecimal newRemaining = request.getTotalAmount().subtract(request.getPaidAmount());
                newAdjustment = newRemaining;
            } else if (TransactionType.PURCHASE.equals(newType)) {
                BigDecimal newRemaining = request.getTotalAmount().subtract(request.getPaidAmount());
                newAdjustment = newRemaining.negate();
            } else if (TransactionType.RECEIPT.equals(newType)) {
                newAdjustment = request.getPaidAmount().negate();
            } else if (TransactionType.PAYMENT.equals(newType)) {
                newAdjustment = request.getPaidAmount();
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
            BigDecimal adjustment = BigDecimal.ZERO;
            
            TransactionType type = existing.getType();
            if (TransactionType.SALE.equals(type)) {
                BigDecimal remaining = existing.getTotalAmount().subtract(existing.getPaidAmount());
                adjustment = remaining; 
            } else if (TransactionType.PURCHASE.equals(type)) {
                BigDecimal remaining = existing.getTotalAmount().subtract(existing.getPaidAmount());
                adjustment = remaining.negate();
            } else if (TransactionType.RECEIPT.equals(type)) {
                adjustment = existing.getPaidAmount().negate();
            } else if (TransactionType.PAYMENT.equals(type)) {
                adjustment = existing.getPaidAmount();
            }
            // Reverse it
            updatePartyBalance(existing.getPartyId(), adjustment.negate());
        }

        // 3. Rollback Offers
        for (TransactionOffer offer : existing.getOffers()) {
             rollbackRedemption(offer.getOfferId(), existing.getId().toString());
        }

        // 4. Delete
        transactionRepository.delete(existing);
    }

    private void rollbackRedemption(String offerId, String transactionId) {
        try {
            String url = "http://localhost:8080/api/smart-ops/offers/redemption/rollback";
             
             // Body
            Map<String, Object> body = Map.of(
                "offerId", offerId,
                "transactionId", transactionId
            );

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
             
             HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
             
             restTemplate.postForEntity(url, entity, Void.class);

        } catch (Exception e) {
            System.err.println("Failed to rollback offer redemption: " + e.getMessage());
        }
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
