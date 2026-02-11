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
import com.sbms.auth_service.dto.CollapsedSidebarDetailDto;
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
	private final S3Service s3Service;

	public AuthResponse register(UserRegisterDto registerDto) {
		if (userRepository.existsByEmail(registerDto.getEmail()))
			throw new UserAlreadyExistsException("This email is already registered.");
		if (userRepository.existsByPhoneNumber(registerDto.getPhoneNumber()))
			throw new UserAlreadyExistsException("This phone number is already registered.");

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
		authenticationManager.authenticate(
				new UsernamePasswordAuthenticationToken(loginDto.getIdentifier(), loginDto.getPassword()));
		User user = userRepository.findByEmailOrPhoneNumber(loginDto.getIdentifier(), loginDto.getIdentifier())
				.orElseThrow(() -> new UserNotFoundException("User not found"));

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
		User user = userRepository.findByEmail(identifier)
				.orElseThrow(() -> new UserNotFoundException("User not found"));

		SidebarDto response = modelMapper.map(user, SidebarDto.class);
		response.setBusinessName(user.getBusiness().getBusinessName());
		response.setBusinessId(user.getBusiness().getId());
		response.setUserId(user.getId());
		response.setUpiId(user.getBusiness().getUpiId());
		response.setAlwaysShowPaymentQr(user.getBusiness().isAlwaysShowPaymentQr());

		return response;
	}

	@Override
	public CollapsedSidebarDetailDto getCollapsedSidebarDetail(String identifier) {
		User user = userRepository.findByEmail(identifier)
				.orElseThrow(() -> new UserNotFoundException("User not found"));

		CollapsedSidebarDetailDto dto = new CollapsedSidebarDetailDto();
		dto.setName(user.getFullName());
		dto.setProfilePicUrl(user.getProfilePicUrl());

		return dto;
	}

	@Override
	public ProfileDto getProfile(String identifier) {
		User user = userRepository.findByEmail(identifier)
				.orElseThrow(() -> new UserNotFoundException("User not found"));

		ProfileDto dto = new ProfileDto();

		// User Info
		dto.setFullName(user.getFullName());
		dto.setEmail(user.getEmail());
		dto.setPhone(user.getPhoneNumber());

		// Use Presigned URLs for images
		dto.setProfilePicUrl(user.getProfilePicUrl());
		dto.setSignatureUrl(user.getSignatureUrl());
		dto.setStampUrl(user.getStampUrl());

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
			dto.setAlwaysShowPaymentQr(biz.isAlwaysShowPaymentQr());
		}

		return dto;
	}

	@Override
	public ProfileDto updateProfile(String identifier, ProfileDto dto) {
		User user = userRepository.findByEmail(identifier)
				.orElseThrow(() -> new UserNotFoundException("User not found"));

		// Update User Info
		user.setFullName(dto.getFullName());
		// Check if sensitive fields (Phone/Email) are changing
		boolean isSensitiveChange = !user.getPhoneNumber().equals(dto.getPhone())
				|| !user.getEmail().equals(dto.getEmail());

		if (isSensitiveChange) {
			// Verify Password
			if (dto.getVerificationPassword() == null || dto.getVerificationPassword().isBlank()) {
				throw new RuntimeException("Password is required to change Phone Number or Email");
			}
			if (!passwordEncoder.matches(dto.getVerificationPassword(), user.getPassword())) {
				throw new RuntimeException("Invalid Password");
			}
		}

		// Updating unique fields like email/phone might need validation/check if exists
		// logic for MVP skipping it partially or trusting user input
		// Assuming identifier (email) matches context, changing email would need
		// re-login.
		// For MVP: Update non-identifying fields safely.
		// If phone changed
		if (!user.getPhoneNumber().equals(dto.getPhone())) {
			if (userRepository.existsByPhoneNumber(dto.getPhone()))
				throw new UserAlreadyExistsException("Phone already in use");
			user.setPhoneNumber(dto.getPhone());
		}

		user.setProfilePicUrl(dto.getProfilePicUrl());
		user.setSignatureUrl(dto.getSignatureUrl());
		user.setStampUrl(dto.getStampUrl());
		// If email changed
		if (!user.getEmail().equals(dto.getEmail())) {
			if (userRepository.existsByEmail(dto.getEmail()))
				throw new UserAlreadyExistsException("Email already in use");
			user.setEmail(dto.getEmail());
		}

		// Update Business Info
		Business biz = user.getBusiness();
		if (biz == null)
			biz = new Business();

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
		biz.setAlwaysShowPaymentQr(dto.isAlwaysShowPaymentQr());

		user.setBusiness(biz);
		userRepository.save(user);

		return getProfile(user.getEmail()); // Return updated profile
	}

	@Override
	public void changePassword(String identifier, ChangePasswordRequest request) {
		User user = userRepository.findByEmail(identifier)
				.orElseThrow(() -> new UserNotFoundException("User not found"));

		if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
			throw new RuntimeException("Invalid current password");
		}

		user.setPassword(passwordEncoder.encode(request.getNewPassword()));
		userRepository.save(user);
	}

	@Override
	public ProfileDto uploadProfilePhoto(String identifier, org.springframework.web.multipart.MultipartFile file) {
		User user = userRepository.findByEmail(identifier)
				.orElseThrow(() -> new UserNotFoundException("User not found"));

		// Delete old image if exists
		if (user.getProfilePicUrl() != null && !user.getProfilePicUrl().isBlank()) {
			s3Service.deleteFile(user.getProfilePicUrl());
		}

		// Upload new image
		String imageUrl = s3Service.uploadFile(file, "profile-photos", user.getId(), user.getBusiness().getId());
		user.setProfilePicUrl(imageUrl);

		userRepository.save(user);

		return getProfile(user.getEmail());
	}

	@Override
	public ProfileDto uploadSignature(String identifier, org.springframework.web.multipart.MultipartFile file) {
		User user = userRepository.findByEmail(identifier)
				.orElseThrow(() -> new UserNotFoundException("User not found"));

		// Delete old image if exists
		if (user.getSignatureUrl() != null && !user.getSignatureUrl().isBlank()) {
			s3Service.deleteFile(user.getSignatureUrl());
		}

		// Upload new image
		String imageUrl = s3Service.uploadFile(file, "signatures", user.getId(), user.getBusiness().getId());
		user.setSignatureUrl(imageUrl);

		userRepository.save(user);

		return getProfile(user.getEmail());
	}

	@Override
	public ProfileDto uploadStamp(String identifier, org.springframework.web.multipart.MultipartFile file) {
		User user = userRepository.findByEmail(identifier)
				.orElseThrow(() -> new UserNotFoundException("User not found"));

		// Delete old image if exists
		if (user.getStampUrl() != null && !user.getStampUrl().isBlank()) {
			s3Service.deleteFile(user.getStampUrl());
		}

		// Upload new image
		String imageUrl = s3Service.uploadFile(file, "stamps", user.getId(), user.getBusiness().getId());
		user.setStampUrl(imageUrl);

		userRepository.save(user);

		return getProfile(user.getEmail());
	}

}
