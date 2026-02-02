package com.sbms.trading_service.service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sbms.trading_service.customexceptions.ResourceNotFoundException;
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
}