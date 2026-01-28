package com.sbms.auth_service.service;

import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sbms.auth_service.custom_exceptions.UserAlreadyExistsException;
import com.sbms.auth_service.dto.AuthResponse;
import com.sbms.auth_service.dto.UserRegisterDto;
import com.sbms.auth_service.entity.Business;
import com.sbms.auth_service.entity.User;
import com.sbms.auth_service.repository.UserRepository;
import com.sbms.auth_service.security.JwtService;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class AuthService {
	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final ModelMapper modelMapper;
	private final JwtService jwtService;
	
	public AuthResponse register(UserRegisterDto userDto) {
		if(userRepository.existsByEmail(userDto.getEmail())) 
			throw new UserAlreadyExistsException("This email is already registerd.");
		if(userRepository.existsByPhoneNumber(userDto.getPhoneNumber())) 
			throw new UserAlreadyExistsException("This phone number is already registerd.");
		
		User user = modelMapper.map(userDto, User.class);
		Business business = modelMapper.map(userDto, Business.class);
		
		user.setPassword(passwordEncoder.encode(userDto.getPassword()));
		user.setBusiness(business);
		User savedUser = userRepository.save(user);
		AuthResponse response = modelMapper.map(savedUser, AuthResponse.class);
		response.setBusinessName(savedUser.getBusiness().getBusinessName());
		response.setBusinessId(savedUser.getBusiness().getId());
		String jwtToken = jwtService.generateToken(savedUser);
		response.setToken(jwtToken);
		return response;
	}
	

}
