package com.sbms.auth_service.controller;

import java.security.Principal;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sbms.auth_service.dto.AuthResponse;
import com.sbms.auth_service.dto.OtpRequest;
import com.sbms.auth_service.dto.OtpVerifyRequest;
import com.sbms.auth_service.dto.UserLoginDto;
import com.sbms.auth_service.dto.UserRegisterDto;
import com.sbms.auth_service.service.AuthServiceImpl;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
	private final AuthServiceImpl authService;
	
	@PostMapping("/register")
	public ResponseEntity<AuthResponse> register(@RequestBody UserRegisterDto userDto){
		return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(userDto));
	}
	
	@PostMapping("/login")
	public ResponseEntity<AuthResponse> login(@RequestBody UserLoginDto request) {
        return ResponseEntity.ok(authService.login(request));
    }
	
	@PostMapping("/send-otp")
    public ResponseEntity<String> sendOtp(@RequestBody OtpRequest request) {
        authService.sendOtp(request);
        return ResponseEntity.ok("OTP sent successfully");
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<AuthResponse> verifyOtp(@RequestBody OtpVerifyRequest request) {
        return ResponseEntity.ok(authService.verifyOtp(request));
    }

    @org.springframework.web.bind.annotation.GetMapping("/me")
    public ResponseEntity<com.sbms.auth_service.dto.SidebarDto> getCurrentUser(Principal principal) {
        return ResponseEntity.ok(authService.getCurrentUser(principal.getName()));
    }
}
