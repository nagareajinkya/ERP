package com.sbms.trading_service.entity;

import java.math.BigDecimal;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@AttributeOverride(name = "id", column = @Column(name = "product_id"))
public class Product extends BaseEntity {

    @Column(name = "product_name", nullable = false)
    private String name;

    // Many Products can belong to One Category
    @ManyToOne(fetch = FetchType.EAGER) 
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    // Many Products can use One Unit
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "unit_id", nullable = false)
    private Unit unit;

    // --- Stock & Pricing ---
    @Column(name = "current_stock", nullable = false, precision = 10, scale = 3)
    private BigDecimal currentStock;

    @Column(precision = 10, scale = 3, nullable = false, name = "min_stock")
    private BigDecimal minStock;

    @Column(nullable = false, name = "buy_price", precision = 10, scale = 2)
    private BigDecimal buyPrice;
    @Column(name = "sell_price", precision = 10, scale = 2)
    private BigDecimal sellPrice;
    @Column(precision = 10, scale = 2)
    private BigDecimal mrp;

    // --- Taxation ---
    @Column(nullable = false, name = "gst_rate")
    private Double gstRate = 0.0;

    private String hsn;
    private String sku;
}