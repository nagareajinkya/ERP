package com.sbms.auth_service.service;

import java.util.Optional;

import org.modelmapper.ModelMapper;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sbms.auth_service.custom_exceptions.UserAlreadyExistsException;
import com.sbms.auth_service.custom_exceptions.UserNotFoundException;
import com.sbms.auth_service.dto.AuthResponse;
import com.sbms.auth_service.dto.OtpRequest;
import com.sbms.auth_service.dto.OtpVerifyRequest;
import com.sbms.auth_service.dto.UserLoginDto;
import com.sbms.auth_service.dto.UserRegisterDto;
import com.sbms.auth_service.entity.Business;
import com.sbms.auth_service.entity.User;
import com.sbms.auth_service.repository.UserRepository;
import com.sbms.auth_service.security.JwtService;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final ModelMapper modelMapper;
	private final JwtService jwtService;
	private final AuthenticationManager authenticationManager;
	
	public AuthResponse register(UserRegisterDto registerDto) {
		if(userRepository.existsByEmail(registerDto.getEmail())) 
			throw new UserAlreadyExistsException("This email is already registerd.");
		if(userRepository.existsByPhoneNumber(registerDto.getPhoneNumber())) 
			throw new UserAlreadyExistsException("This phone number is already registerd.");
		
		User user = modelMapper.map(registerDto, User.class);
		Business business = modelMapper.map(registerDto, Business.class);
		
		user.setPassword(passwordEncoder.encode(registerDto.getPassword()));
		user.setBusiness(business);
		User savedUser = userRepository.save(user);
		String jwtToken = jwtService.generateToken(savedUser);
		AuthResponse response = modelMapper.map(savedUser, AuthResponse.class);
		response.setBusinessName(savedUser.getBusiness().getBusinessName());
		response.setBusinessId(savedUser.getBusiness().getId());
		response.setUserId(savedUser.getId());
		response.setToken(jwtToken);
		return response;
	}

	@Override
	public AuthResponse login(UserLoginDto loginDto) {
		authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(loginDto.getIdentifier(), loginDto.getPassword()));
		User user = userRepository.findByEmailOrPhoneNumber(loginDto.getIdentifier(), loginDto.getIdentifier())
									.orElseThrow( ()-> new UserNotFoundException("User not found"));
		
		String jwtToken = jwtService.generateToken(user);
		AuthResponse response = modelMapper.map(user, AuthResponse.class);
		response.setToken(jwtToken);
		response.setBusinessId(user.getBusiness().getId());
		response.setUserId(user.getId());
		response.setBusinessName(user.getBusiness().getBusinessName());
		return response;
	}

	@Override
	public void sendOtp(OtpRequest request) {
		// Temporary implementation: Log the OTP request (console only)
		System.out.println("OTP Requested for phone: " + request.getPhone() + ". use code 1234");
	}

	@Override
	public AuthResponse verifyOtp(OtpVerifyRequest request) {
		if (!"1234".equals(request.getCode())) {
			throw new RuntimeException("Invalid OTP"); 
		}

		Optional<User> userOptional = userRepository.findByPhoneNumber(request.getPhone());
		
		if (userOptional.isEmpty()) {
			// If user is not found, return empty response so frontend can proceed to signup flow
			// (Note: The frontend is responsible for calling register after this if needed)
			return new AuthResponse();
		}

		User user = userOptional.get();

		String jwtToken = jwtService.generateToken(user);
		AuthResponse response = modelMapper.map(user, AuthResponse.class);
		response.setToken(jwtToken);
		response.setBusinessId(user.getBusiness().getId());
		response.setUserId(user.getId());
		response.setBusinessName(user.getBusiness().getBusinessName());
		return response;
	}
	

}
