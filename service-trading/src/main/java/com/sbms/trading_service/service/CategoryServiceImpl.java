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

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {
	private final CategoryRepository categoryRepository;
    private final ModelMapper modelMapper;

    @Override
    public CategoryDto createCategory(String name, UUID businessId) {
        // Check if exists logic
        Category category = categoryRepository.findByNameAndBusinessId(name, businessId)
                .orElseGet(() -> {
                    Category newCat = new Category();
                    newCat.setName(name);
                    newCat.setBusinessId(businessId);
                    return categoryRepository.save(newCat);
                });
        
        return modelMapper.map(category, CategoryDto.class);
    }

    @Override
    public List<CategoryDto> getAllCategories(UUID businessId) {
        return categoryRepository.findAllByBusinessId(businessId).stream()
                .map(cat -> modelMapper.map(cat, CategoryDto.class))
                .collect(Collectors.toList());
    }
}
