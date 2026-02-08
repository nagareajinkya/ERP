package com.sbms.trading_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductImportDto {
    private String name;
    private String sku;
    private String categoryName;
    private String unitName;
    private BigDecimal qty;
    private BigDecimal minStock;
    private BigDecimal buyPrice;
    private BigDecimal sellPrice;
    private BigDecimal mrp;
    private Double gstRate;
    private String hsn;
}
