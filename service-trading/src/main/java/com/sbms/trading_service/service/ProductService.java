package com.sbms.trading_service.service;

import java.util.List;
import java.util.UUID;

import com.sbms.trading_service.dto.ProductRequest;
import com.sbms.trading_service.dto.ProductResponse;

public interface ProductService {
	public ProductResponse addProduct(ProductRequest request, UUID businessId);
	public List<ProductResponse> getMyProducts(UUID businessId);
}
