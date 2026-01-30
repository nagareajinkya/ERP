package com.sbms.auth_service.security;

import java.io.IOException;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.sbms.auth_service.security.JwtService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                    HttpServletResponse response, 
                                    FilterChain filterChain)
            throws ServletException, IOException {
        
        String headerValue = request.getHeader("Authorization");
        
        if (headerValue != null && headerValue.startsWith("Bearer ")) {
            String jwt = headerValue.substring(7);

            try {
                // Verify token and set authentication context
                if (jwtService.isTokenValid(jwt)) {
                    Authentication authentication = jwtService.getAuthentication(jwt);
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            } catch (Exception e) {
                // If token is invalid/expired, we simply ignore it and 
                // let Spring Security handle the 403 error later if needed.
            }
        }

        filterChain.doFilter(request, response);
    }
}