package com.sbms.auth_service.service;

import com.sbms.auth_service.dto.AuthResponse;
import com.sbms.auth_service.dto.ChangePasswordRequest;
import com.sbms.auth_service.dto.OtpRequest;
import com.sbms.auth_service.dto.OtpVerifyRequest;
import com.sbms.auth_service.dto.ProfileDto;
import com.sbms.auth_service.dto.SidebarDto;
import com.sbms.auth_service.dto.UserLoginDto;
import com.sbms.auth_service.dto.UserRegisterDto;

public interface AuthService {
	AuthResponse register(UserRegisterDto registerDto);
	AuthResponse login(UserLoginDto loginDto);
	
	void sendOtp(OtpRequest request);
	AuthResponse verifyOtp(OtpVerifyRequest request);
	SidebarDto getCurrentUser(String identifier);
	
	// Profile Methods
	ProfileDto getProfile(String identifier);
	ProfileDto updateProfile(String identifier, ProfileDto dto);
	void changePassword(String identifier, ChangePasswordRequest request);

}
