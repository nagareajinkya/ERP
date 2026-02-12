package com.sbms.auth_service.service;

import com.sbms.auth_service.dto.AuthResponse;
import com.sbms.auth_service.dto.ChangePasswordRequest;
import com.sbms.auth_service.dto.CollapsedSidebarDetailDto;
import com.sbms.auth_service.dto.OtpRequest;
import com.sbms.auth_service.dto.OtpVerifyRequest;
import com.sbms.auth_service.dto.ProfileDto;
import com.sbms.auth_service.dto.SidebarDto;
import com.sbms.auth_service.dto.UserLoginDto;
import com.sbms.auth_service.dto.UserRegisterDto;

public interface AuthService {
	AuthResponse register(UserRegisterDto registerDto);

	AuthResponse login(UserLoginDto loginDto);

	SidebarDto getCurrentUser(String identifier);

	CollapsedSidebarDetailDto getCollapsedSidebarDetail(String identifier);

	// Profile Methods
	ProfileDto getProfile(String identifier);

	ProfileDto updateProfile(String identifier, ProfileDto dto);

	void changePassword(String identifier, ChangePasswordRequest request);

	// Image Upload Methods
	ProfileDto uploadProfilePhoto(String identifier, org.springframework.web.multipart.MultipartFile file);

	ProfileDto uploadSignature(String identifier, org.springframework.web.multipart.MultipartFile file);

	ProfileDto uploadStamp(String identifier, org.springframework.web.multipart.MultipartFile file);

	// Registration Details Update
	com.sbms.auth_service.dto.RegistrationDetailsDto updateRegistrationDetails(String identifier,
			com.sbms.auth_service.dto.RegistrationDetailsDto dto);

}
