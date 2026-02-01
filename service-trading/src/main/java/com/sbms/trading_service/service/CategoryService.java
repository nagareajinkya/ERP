package com.sbms.trading_service.service;

import java.util.List;
import java.util.UUID;

import com.sbms.trading_service.dto.CategoryDto;
import com.sbms.trading_service.entity.Category;

public interface CategoryService {
	public List<CategoryDto> getAllCategories(UUID businessId);
	public CategoryDto createCategory(String name, UUID businessId);
}
