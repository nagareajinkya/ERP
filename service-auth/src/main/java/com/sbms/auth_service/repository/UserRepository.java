package com.sbms.auth_service.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sbms.auth_service.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

	Optional<User> findByEmail(String email);
	Optional<User> findByPhoneNumber(String phoneNumber);

    // Used for validation during Registration
    Boolean existsByEmail(String email);
}
