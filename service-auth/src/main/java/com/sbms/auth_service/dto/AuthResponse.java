package com.sbms.auth_service.dto;

import java.util.UUID;

import lombok.Data;

@Data
public class AuthResponse {
	private String token; // The JWT
    private String fullName;
    private String businessName;
    private UUID userId;
    private UUID businessId;
}
