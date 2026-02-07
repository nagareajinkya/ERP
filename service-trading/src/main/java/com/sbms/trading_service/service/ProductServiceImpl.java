package com.sbms.trading_service.service;

import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import java.math.BigDecimal;
import java.util.HashMap;
import com.sbms.trading_service.entity.TransactionProduct;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sbms.trading_service.customexceptions.ResourceNotFoundException;
import com.sbms.trading_service.dto.ProductHistoryResponse;
import com.sbms.trading_service.dto.ProductHistoryResponse.TransactionHistoryDto;
import com.sbms.trading_service.dto.ProductRequest;
import com.sbms.trading_service.dto.ProductResponse;
import com.sbms.trading_service.entity.Category;
import com.sbms.trading_service.entity.Product;
import com.sbms.trading_service.entity.Transaction;
import com.sbms.trading_service.entity.Unit;
import com.sbms.trading_service.enums.TransactionType;
import com.sbms.trading_service.repository.CategoryRepository;
import com.sbms.trading_service.repository.ProductRepository;
import com.sbms.trading_service.repository.TransactionRepository;
import com.sbms.trading_service.repository.UnitRepository;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UnitRepository unitRepository;
    private final TransactionRepository transactionRepository;
    private final ModelMapper modelMapper;

    @Override
    public ProductResponse addProduct(ProductRequest request, UUID businessId) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + request.getCategoryId()));

        Unit unit = unitRepository.findById(request.getUnitId())
                .orElseThrow(() -> new ResourceNotFoundException("Unit not found with ID: " + request.getUnitId()));

        if (!category.getBusinessId().equals(businessId) || !unit.getBusinessId().equals(businessId)) {
            throw new ResourceNotFoundException("Unauthorized: This Category or Unit does not belong to your business.");
        }

        Product product = modelMapper.map(request, Product.class);
        product.setBusinessId(businessId);
        product.setCategory(category);
        product.setUnit(unit);

        Product savedProduct = productRepository.save(product);

        ProductResponse response = modelMapper.map(savedProduct, ProductResponse.class);
        response.setCategoryId(savedProduct.getCategory().getId());
        response.setUnitId(savedProduct.getUnit().getId());
        response.setCategoryName(savedProduct.getCategory().getName());
        response.setUnitName(savedProduct.getUnit().getName());
        response.setUnitSymbol(savedProduct.getUnit().getSymbol());
        
        return response;
    }

    @Override
    public List<ProductResponse> getMyProducts(UUID businessId, String search) {
        List<Product> products;
        
        if (search != null && !search.trim().isEmpty()) {
            products = productRepository.findByBusinessIdAndNameContainingIgnoreCase(businessId, search);
        } else {
            products = productRepository.findAllByBusinessId(businessId);
        }

        return products.stream()
                .map(product -> {
                    ProductResponse response = modelMapper.map(product, ProductResponse.class);
                    response.setCategoryId(product.getCategory().getId());
                    response.setUnitId(product.getUnit().getId());
                    response.setCategoryName(product.getCategory().getName());
                    response.setUnitName(product.getUnit().getName());
                    response.setUnitSymbol(product.getUnit().getSymbol());
                    return response;
                })
                .collect(Collectors.toList());
    }
    
    @Override
    public ProductResponse updateProduct(Long productId, ProductRequest request, UUID businessId) {
        // 1. Find the existing product
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        // 2. SECURITY Check
        if (!product.getBusinessId().equals(businessId)) {
            throw new ResourceNotFoundException("Unauthorized: You do not own this product");
        }

        modelMapper.map(request, product);

        
        
        if (!product.getCategory().getId().equals(request.getCategoryId())) {
            Category newCat = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            product.setCategory(newCat);
        }
        
        if (!product.getUnit().getId().equals(request.getUnitId())) {
            Unit newUnit = unitRepository.findById(request.getUnitId())
                    .orElseThrow(() -> new ResourceNotFoundException("Unit not found"));
            product.setUnit(newUnit);
        }

        // 5. Save & Return
        Product savedProduct = productRepository.save(product);
        
        ProductResponse response = modelMapper.map(savedProduct, ProductResponse.class);
        
        // Manual Map IDs (as discussed before)
        response.setCategoryName(savedProduct.getCategory().getName());
        response.setCategoryId(savedProduct.getCategory().getId());
        response.setUnitName(savedProduct.getUnit().getName());
        response.setUnitSymbol(savedProduct.getUnit().getSymbol());
        response.setUnitId(savedProduct.getUnit().getId());
        
        return response;
    }
    
    @Override
    public String deleteProduct(Long productId, UUID businessId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        // SECURITY: Check ownership
        if (!product.getBusinessId().equals(businessId)) {
            throw new ResourceNotFoundException("Unauthorized: You do not own this product");
        }

        productRepository.delete(product);
        return "Product deleted successfully";
    }

    @Override
    @Transactional(readOnly = true)
    public ProductHistoryResponse getProductTransactionHistory(Long productId, UUID businessId) {
        // Verify the product exists and belongs to this business
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (!product.getBusinessId().equals(businessId)) {
            throw new ResourceNotFoundException("Unauthorized: You do not own this product");
        }

        // Fetch sales transactions
        List<Transaction> salesTransactions = transactionRepository
                .findTransactionsByProductAndType(productId, TransactionType.SALE, businessId);

        // Fetch purchase transactions
        List<Transaction> purchaseTransactions = transactionRepository
                .findTransactionsByProductAndType(productId, TransactionType.PURCHASE, businessId);

        // Convert to DTOs and limit to last 5
        // Build sales history by iterating transactions and their products,
        // collecting up to 5 product-level entries that have valid prices
        // (non-null and not ₹0.01). This stops early to avoid scanning all transactions.
        List<TransactionHistoryDto> sales = new ArrayList<>();
        salesLoop:
        for (Transaction transaction : salesTransactions) {
            for (TransactionProduct tp : transaction.getProducts()) {
                if (tp.getProduct().getId().equals(productId)
                        && tp.getPrice() != null
                        && tp.getPrice().compareTo(new BigDecimal("0.01")) != 0) {
                    sales.add(TransactionHistoryDto.builder()
                            .transactionId(transaction.getId())
                            .party(transaction.getPartyName())
                            .date(transaction.getDate())
                            .qty(tp.getQty())
                            .rate(tp.getPrice())
                            .total(tp.getAmount())
                            .build());
                    if (sales.size() >= 5) break salesLoop;
                }
            }
        }

        List<TransactionHistoryDto> purchases = new ArrayList<>();
        purchasesLoop:
        for (Transaction transaction : purchaseTransactions) {
            for (TransactionProduct tp : transaction.getProducts()) {
                if (tp.getProduct().getId().equals(productId)
                        && tp.getPrice() != null
                        && tp.getPrice().compareTo(new BigDecimal("0.01")) != 0) {
                    purchases.add(TransactionHistoryDto.builder()
                            .transactionId(transaction.getId())
                            .party(transaction.getPartyName())
                            .date(transaction.getDate())
                            .qty(tp.getQty())
                            .rate(tp.getPrice())
                            .total(tp.getAmount())
                            .build());
                    if (purchases.size() >= 5) break purchasesLoop;
                }
            }
        }

        // Compute recommended price: mode of last 5 sales' rates (most frequent). If none, fallback to product.sellPrice
        BigDecimal recommendedPrice = null;
        try {
            List<BigDecimal> recentPrices = new ArrayList<>();
            recentLoop:
            for (Transaction t : salesTransactions) {
                for (TransactionProduct tp : t.getProducts()) {
                    if (tp.getProduct().getId().equals(productId)
                            && tp.getPrice() != null
                            && tp.getPrice().compareTo(new BigDecimal("0.01")) != 0) {
                        recentPrices.add(tp.getPrice());
                        if (recentPrices.size() >= 5) break recentLoop;
                    }
                }
            }

            if (!recentPrices.isEmpty()) {
            // frequency map
            Map<BigDecimal, Long> freq = new HashMap<>();
            for (BigDecimal p : recentPrices) {
                freq.merge(p, 1L, Long::sum);
            }
            long maxCount = freq.values().stream().mapToLong(Long::longValue).max().orElse(0L);
            // pick the most recent price among those with maxCount
            BigDecimal chosen = null;
            for (BigDecimal p : recentPrices) {
                if (freq.getOrDefault(p, 0L) == maxCount) {
                chosen = p;
                break;
                }
            }
            recommendedPrice = chosen;
            }
        } catch (Exception ex) {
            // swallow and fallback
            recommendedPrice = null;
        }

        if (recommendedPrice == null) {
            recommendedPrice = product.getSellPrice();
        }

        return ProductHistoryResponse.builder()
            .sales(sales)
            .purchases(purchases)
            .recommendedPrice(recommendedPrice)
            .build();
    }
}