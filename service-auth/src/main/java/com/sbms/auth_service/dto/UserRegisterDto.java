package com.sbms.auth_service.dto;

import lombok.Data;

@Data
public class UserRegisterDto {

	private String fullName;
    private String email;
    private String phoneNumber;
    private String password;
    
    // Business Details (Initial Setup)
    private String businessName;
    private String addressState;
}
