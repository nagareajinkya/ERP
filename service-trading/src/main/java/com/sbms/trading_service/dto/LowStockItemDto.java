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
public class LowStockItemDto {
    private Long id;  // Product ID
    private String name;  // Product name
    private BigDecimal current;  // Current stock quantity
    private BigDecimal min;  // Minimum stock threshold
    private String unit;  // Unit of measurement (e.g., "kg", "pcs")
}
