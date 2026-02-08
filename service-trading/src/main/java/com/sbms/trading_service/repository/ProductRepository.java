package com.sbms.trading_service.repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import com.sbms.trading_service.entity.Product;
import com.sbms.trading_service.entity.Category;

public interface ProductRepository extends JpaRepository<Product, Long> {

    // Get all products for the dashboard list
    List<Product> findAllByBusinessId(UUID businessId);

    // Search bar logic (Find by Name)
    List<Product> findByBusinessIdAndNameContainingIgnoreCase(UUID businessId, String name);

    long countByCategoryIdAndBusinessId(Long categoryId, UUID businessId);
    long countByUnitIdAndBusinessId(Long unitId, UUID businessId);

    @Modifying
    @Query("UPDATE Product p SET p.category = :targetCat WHERE p.category = :sourceCat AND p.businessId = :businessId")
    void updateCategoryForBusiness(Category sourceCat, Category targetCat, UUID businessId);
}
