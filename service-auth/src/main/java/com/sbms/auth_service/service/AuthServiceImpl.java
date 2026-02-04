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
import com.sbms.auth_service.dto.ChangePasswordRequest;
import com.sbms.auth_service.dto.OtpRequest;
import com.sbms.auth_service.dto.OtpVerifyRequest;
import com.sbms.auth_service.dto.ProfileDto;
import com.sbms.auth_service.dto.SidebarDto;
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

	@Override
	public SidebarDto getCurrentUser(String identifier) {
		User user = userRepository.findByEmailOrPhoneNumber(identifier, identifier)
				.orElseThrow(() -> new UserNotFoundException("User not found"));
		
		SidebarDto response = modelMapper.map(user, SidebarDto.class);
		response.setBusinessName(user.getBusiness().getBusinessName());
		response.setBusinessId(user.getBusiness().getId());
		response.setUserId(user.getId());
		
		return response;
	}

	@Override
	public ProfileDto getProfile(String identifier) {
		User user = userRepository.findByEmailOrPhoneNumber(identifier, identifier)
				.orElseThrow(() -> new UserNotFoundException("User not found"));
		
		ProfileDto dto = new ProfileDto();
		
		// User Info
		dto.setFullName(user.getFullName());
		dto.setEmail(user.getEmail());
		dto.setPhone(user.getPhoneNumber());
		
		// Business Info
		Business biz = user.getBusiness();
		if (biz != null) {
			dto.setBusinessName(biz.getBusinessName());
			dto.setGstin(biz.getGstin());
			
			dto.setAddress(biz.getAddressStreet());
			dto.setCity(biz.getAddressCity());
			dto.setState(biz.getAddressState());
			dto.setPincode(biz.getAddressPincode());
			
			dto.setUpiId(biz.getUpiId());
			dto.setAccountName(biz.getBankAccountName());
			dto.setAccountNumber(biz.getBankAccountNo());
			dto.setIfsc(biz.getBankIfsc());
			
			dto.setInvoicePrefix(biz.getInvoicePrefix());
			dto.setNotifySales(biz.isNotifySales());
			dto.setNotifyPayments(biz.isNotifyPayments());
			dto.setNotifyLowStock(biz.isNotifyLowStock());
		}
		
		return dto;
	}

	@Override
	public ProfileDto updateProfile(String identifier, ProfileDto dto) {
		User user = userRepository.findByEmailOrPhoneNumber(identifier, identifier)
				.orElseThrow(() -> new UserNotFoundException("User not found"));
		
		// Update User Info
		user.setFullName(dto.getFullName());
		// Updating unique fields like email/phone might need validation/check if exists logic for MVP skipping it partially or trusting user input
		// Assuming identifier (email) matches context, changing email would need re-login.
		// For MVP: Update non-identifying fields safely. 
		// If phone changed
		if(!user.getPhoneNumber().equals(dto.getPhone())) {
			if(userRepository.existsByPhoneNumber(dto.getPhone())) throw new UserAlreadyExistsException("Phone already in use");
			user.setPhoneNumber(dto.getPhone());
		}
		// If email changed
		if(!user.getEmail().equals(dto.getEmail())) {
			if(userRepository.existsByEmail(dto.getEmail())) throw new UserAlreadyExistsException("Email already in use");
			user.setEmail(dto.getEmail());
		}
		
		// Update Business Info
		Business biz = user.getBusiness();
		if (biz == null) biz = new Business();
		
		biz.setBusinessName(dto.getBusinessName());
		biz.setGstin(dto.getGstin());
		
		biz.setAddressStreet(dto.getAddress());
		biz.setAddressCity(dto.getCity());
		biz.setAddressState(dto.getState());
		biz.setAddressPincode(dto.getPincode());
		
		biz.setUpiId(dto.getUpiId());
		biz.setBankAccountName(dto.getAccountName());
		biz.setBankAccountNo(dto.getAccountNumber());
		biz.setBankIfsc(dto.getIfsc());
		
		biz.setInvoicePrefix(dto.getInvoicePrefix());
		biz.setNotifySales(dto.isNotifySales());
		biz.setNotifyPayments(dto.isNotifyPayments());
		biz.setNotifyLowStock(dto.isNotifyLowStock());
		
		user.setBusiness(biz);
		userRepository.save(user);
		
		return getProfile(user.getEmail()); // Return updated profile
	}

	@Override
	public void changePassword(String identifier, ChangePasswordRequest request) {
		User user = userRepository.findByEmailOrPhoneNumber(identifier, identifier)
				.orElseThrow(() -> new UserNotFoundException("User not found"));
				
		if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
			throw new RuntimeException("Invalid current password");
		}
		
		user.setPassword(passwordEncoder.encode(request.getNewPassword()));
		userRepository.save(user);
	}

}
