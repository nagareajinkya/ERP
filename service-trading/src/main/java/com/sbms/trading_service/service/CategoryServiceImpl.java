package com.sbms.trading_service.service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sbms.trading_service.dto.CategoryDto;
import com.sbms.trading_service.entity.Category;
import com.sbms.trading_service.repository.CategoryRepository;
import com.sbms.trading_service.repository.ProductRepository;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {
	private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final ModelMapper modelMapper;

    @Override
    public CategoryDto createCategory(String name, Integer styleId, UUID businessId) {
        // Check if exists logic
        Category category = categoryRepository.findByNameAndBusinessId(name, businessId)
                .orElseGet(() -> {
                    Category newCat = new Category();
                    newCat.setName(name);
                    newCat.setStyleId(styleId != null ? styleId : 0);
                    newCat.setBusinessId(businessId);
                    return categoryRepository.save(newCat);
                });
        
        return modelMapper.map(category, CategoryDto.class);
    }

    @Override
    public CategoryDto updateCategory(Long id, String name, Integer styleId, UUID businessId) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        
        if (!category.getBusinessId().equals(businessId)) {
            throw new RuntimeException("Unauthorized");
        }

        category.setName(name);
        if (styleId != null) {
            category.setStyleId(styleId);
        }
        
        return modelMapper.map(categoryRepository.save(category), CategoryDto.class);
    }

    @Override
    public void deleteCategory(Long id, UUID businessId) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        
        if (!category.getBusinessId().equals(businessId)) {
            throw new RuntimeException("Unauthorized");
        }

        long count = productRepository.countByCategoryIdAndBusinessId(id, businessId);
        if (count > 0) {
            throw new RuntimeException("first move products from this category to another category");
        }

        categoryRepository.delete(category);
    }

    @Override
    public void mergeCategories(Long sourceId, Long targetId, UUID businessId) {
        Category sourceCat = categoryRepository.findById(sourceId)
                .orElseThrow(() -> new RuntimeException("Source category not found"));
        Category targetCat = categoryRepository.findById(targetId)
                .orElseThrow(() -> new RuntimeException("Target category not found"));

        if (!sourceCat.getBusinessId().equals(businessId) || !targetCat.getBusinessId().equals(businessId)) {
            throw new RuntimeException("Unauthorized");
        }

        // Update all products in this business from source category to target category
        productRepository.updateCategoryForBusiness(sourceCat, targetCat, businessId);

        // Delete the source category
        categoryRepository.delete(sourceCat);
    }

    @Override
    public List<CategoryDto> getAllCategories(UUID businessId) {
        return categoryRepository.findAllByBusinessId(businessId).stream()
                .map(cat -> modelMapper.map(cat, CategoryDto.class))
                .collect(Collectors.toList());
    }
}
