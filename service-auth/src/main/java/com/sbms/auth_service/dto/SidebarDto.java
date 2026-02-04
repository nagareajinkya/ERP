package com.sbms.auth_service.dto;

import java.util.UUID;
import lombok.Data;

@Data
public class SidebarDto {
    private String fullName;
    private String businessName;
    private UUID userId;
    private UUID businessId;
    
    private Double toReceive;
    private Double toPay;
}
