package com.sbms.trading_service.repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import com.sbms.trading_service.entity.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {

    // Get all products for the dashboard list
    List<Product> findAllByBusinessId(UUID businessId);

    // Search bar logic (Find by Name OR SKU)
    // will implement the complex search later
}
