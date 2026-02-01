package com.sbms.trading_service.dto;
import java.math.BigDecimal;
import lombok.Data;

@Data
public class ProductRequest {
    private Long categoryId;
    private Long unitId;
    
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
