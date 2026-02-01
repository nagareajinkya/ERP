package com.sbms.trading_service.service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sbms.trading_service.dto.ProductRequest;
import com.sbms.trading_service.dto.ProductResponse;
import com.sbms.trading_service.entity.Category;
import com.sbms.trading_service.entity.Product;
import com.sbms.trading_service.entity.Unit;
import com.sbms.trading_service.repository.CategoryRepository;
import com.sbms.trading_service.repository.ProductRepository;
import com.sbms.trading_service.repository.UnitRepository;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UnitRepository unitRepository;
    private final ModelMapper modelMapper;

    @Override
    public ProductResponse addProduct(ProductRequest request, UUID businessId) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found with ID: " + request.getCategoryId()));

        Unit unit = unitRepository.findById(request.getUnitId())
                .orElseThrow(() -> new RuntimeException("Unit not found with ID: " + request.getUnitId()));

        if (!category.getBusinessId().equals(businessId) || !unit.getBusinessId().equals(businessId)) {
            throw new RuntimeException("Unauthorized: This Category or Unit does not belong to your business.");
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
        
        return response;
    }

    @Override
    public List<ProductResponse> getMyProducts(UUID businessId) {
        return productRepository.findAllByBusinessId(businessId).stream()
                .map(product -> {
                    ProductResponse response = modelMapper.map(product, ProductResponse.class);
                    response.setCategoryId(product.getCategory().getId());
                    response.setUnitId(product.getUnit().getId());
                    response.setCategoryName(product.getCategory().getName());
                    response.setUnitName(product.getUnit().getName());
                    return response;
                })
                .collect(Collectors.toList());
    }
}