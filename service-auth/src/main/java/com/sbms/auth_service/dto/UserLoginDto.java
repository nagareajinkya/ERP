package com.sbms.auth_service.dto;

import lombok.Data;

@Data
public class UserLoginDto {
	// email or phoneNumber any of both
	private String identifier;
	private String password;
}
