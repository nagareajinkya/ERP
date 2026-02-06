package com.sbms.trading_service.service;

import java.util.List;
import java.util.UUID;

import com.sbms.trading_service.dto.ProductHistoryResponse;
import com.sbms.trading_service.dto.ProductRequest;
import com.sbms.trading_service.dto.ProductResponse;

public interface ProductService {
	public ProductResponse addProduct(ProductRequest request, UUID businessId);
	public List<ProductResponse> getMyProducts(UUID businessId, String search);
	ProductResponse updateProduct(Long productId, ProductRequest request, UUID businessId);
    String deleteProduct(Long productId, UUID businessId);
    ProductHistoryResponse getProductTransactionHistory(Long productId, UUID businessId);
}
