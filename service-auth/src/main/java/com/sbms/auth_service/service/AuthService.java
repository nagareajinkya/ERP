package com.sbms.auth_service.service;

import com.sbms.auth_service.dto.AuthResponse;
import com.sbms.auth_service.dto.UserLoginDto;
import com.sbms.auth_service.dto.UserRegisterDto;

public interface AuthService {
	AuthResponse register(UserRegisterDto registerDto);
	AuthResponse login(UserLoginDto loginDto);

}
