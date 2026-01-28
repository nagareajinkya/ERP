package com.sbms.auth_service.security;

import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;

import com.sbms.auth_service.entity.User;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;

@Service
public class JwtService {
	@Value("${jwt.secret}")
	private String secretKeyString;
	@Value("${jwt.expiration}")
	private long jwtExpiration;
	
	private SecretKey key;
	
	@PostConstruct
	public void init() {
		byte[] keyBytes = Decoders.BASE64.decode(secretKeyString);
		this.key = Keys.hmacShaKeyFor(keyBytes);
	}
	
	// build and generate is only for login and register
	// what user data to insert in token and to generate token
	public String generateToken(User user) {
		Map<String, Object> claims = new HashMap<>();
		claims.put("businessId", user.getBusiness().getId());
		claims.put("userId", user.getId());
		claims.put("role", "ROLE_OWNER");
		
		return buildToken(claims, user.getEmail());
	}
	
	// it builds token by taking what to insert in token
	public String buildToken(Map<String, Object> extraClaims, String subject) {
		return Jwts.builder()
				.setClaims(extraClaims)
				.setSubject(subject)
				.setIssuedAt(new Date(System.currentTimeMillis()))
				.setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
				.signWith(key, SignatureAlgorithm.HS256)
				.compact();
	}
	
	// this validates token , this is for updating or deleting, etc
	public boolean isTokenValid(String token) {
		try {
			Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
			return true;
		} catch (Exception e) {
			return false;
		}
	}
	
	private Claims extractAllClaims(String token) {
		return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();
	}
	
	private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
		final Claims claims = extractAllClaims(token);
		return claimsResolver.apply(claims);
	}
	
	// to extract data from token (this is just a helper method)
	public String extractEmail(String token) {
		return extractClaim(token, Claims::getSubject);
	}
	
	public String extractBusinessId(String token) {
		final Claims claims = extractAllClaims(token);
		return claims.get("businessId", String.class);
	}
	
	public String extractUserId(String token) {
		final Claims claims = extractAllClaims(token);
		return claims.get("userId", String.class);
	}
	
	// for spring security integration
	public Authentication getAuthentication(String token) {
		Claims claims = extractAllClaims(token);
		String email = claims.getSubject();
		String role = claims.get("role", String.class);
		
		var authorities = Collections.singletonList(new SimpleGrantedAuthority(role));
		
		return new UsernamePasswordAuthenticationToken(email, null, authorities);
	}
}
