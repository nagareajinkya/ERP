package com.sbms.auth_service.entity;

import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

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
public class User extends BaseEntity implements UserDetails {
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

	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		return List.of(new SimpleGrantedAuthority("ROLE_OWNER"));
	}

	@Override
	public String getUsername() {
		return email;
	}
	
	@Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }	
}
