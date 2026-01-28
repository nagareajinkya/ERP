package com.sbms.auth_service.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sbms.auth_service.entity.Business;

@Repository
public interface BusinessInterface extends JpaRepository<Business, UUID> {

}
