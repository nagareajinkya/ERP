package com.sbms.auth_service.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sbms.auth_service.dto.AuthResponse;
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
}
