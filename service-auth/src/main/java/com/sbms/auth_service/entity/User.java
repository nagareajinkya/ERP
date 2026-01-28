package com.sbms.auth_service.entity;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "users")
@AttributeOverride(name = "id", column = @Column(name = "user_id"))
public class User extends BaseEntity {
	@Column(name = "full_name", length = 30, nullable = false)
	private String fullName;
	@Column(length = 100, unique = true, nullable = false)
	private String email;
	@Column(name = "phone_number", length = 20, nullable = false, unique = true)
    private String phoneNumber;

    @Column(nullable = false, length = 255)
    private String password;
    @Column(name = "profile_pic_url")
    private String profilePicUrl;
    
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "business_id", referencedColumnName = "business_id", nullable = false, unique = true)
    private Business business;
	
}
