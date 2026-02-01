package com.sbms.trading_service.dto;

import java.math.BigDecimal;
import java.util.UUID;
import lombok.Data;

@Data
public class ProductResponse {

    private UUID id;
    private UUID businessId; 

    private Long categoryId;
    private String categoryName;
    
    private Long unitId;
    private String unitName;

    private String name;
    private String sku;
    
    private BigDecimal currentStock;
    private BigDecimal minStock;
    private BigDecimal buyPrice;
    private BigDecimal sellPrice;
    private BigDecimal mrp;
    
    private Double gstRate;
    private String hsn;
}
