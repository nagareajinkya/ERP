package com.sbms.auth_service.controller;

import java.security.Principal;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.sbms.auth_service.dto.AuthResponse;
import com.sbms.auth_service.dto.ChangePasswordRequest;
import com.sbms.auth_service.dto.CollapsedSidebarDetailDto;
import com.sbms.auth_service.dto.OtpRequest;
import com.sbms.auth_service.dto.OtpVerifyRequest;
import com.sbms.auth_service.dto.ProfileDto;
import com.sbms.auth_service.dto.SidebarDto;
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
	


    @GetMapping("/me")
    public ResponseEntity<SidebarDto> getCurrentUser(Principal principal) {
        return ResponseEntity.ok(authService.getCurrentUser(principal.getName()));
    }

    @GetMapping("/me/collapsed-sidebar")
    public ResponseEntity<CollapsedSidebarDetailDto> getCollapsedSidebarDetail(Principal principal) {
        return ResponseEntity.ok(authService.getCollapsedSidebarDetail(principal.getName()));
    }

    @GetMapping("/profile")
    public ResponseEntity<ProfileDto> getProfile(Principal principal) {
        return ResponseEntity.ok(authService.getProfile(principal.getName()));
    }

    @PutMapping("/profile")
    public ResponseEntity<ProfileDto> updateProfile(
            Principal principal, 
            @RequestBody ProfileDto dto) {
        return ResponseEntity.ok(authService.updateProfile(principal.getName(), dto));
    }

    @PostMapping("/change-password")
    public ResponseEntity<String> changePassword(
            Principal principal,
            @RequestBody ChangePasswordRequest request) {
        authService.changePassword(principal.getName(), request);
        return ResponseEntity.ok("Password updated successfully");
    }

    @PostMapping("/upload/profile-photo")
    public ResponseEntity<ProfileDto> uploadProfilePhoto(
            Principal principal,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(authService.uploadProfilePhoto(principal.getName(), file));
    }

    @PostMapping("/upload/signature")
    public ResponseEntity<ProfileDto> uploadSignature(
            Principal principal,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(authService.uploadSignature(principal.getName(), file));
    }

    @PostMapping("/upload/stamp")
    public ResponseEntity<ProfileDto> uploadStamp(
            Principal principal,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(authService.uploadStamp(principal.getName(), file));
    }
}
