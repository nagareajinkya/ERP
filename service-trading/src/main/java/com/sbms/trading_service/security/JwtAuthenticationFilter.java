package com.sbms.trading_service.security;

import java.io.IOException;
import java.util.Collections;
import java.util.UUID;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.sbms.trading_service.security.JwtService;

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
            String jwt = headerValue.substring(7).trim();

            try {
                // 1. Extract Business ID (This verifies the signature internally)
                UUID businessId = jwtService.extractBusinessId(jwt);
                
                // 2. Create a "Stateless" Authentication Object
                // We use businessId as the "Principal" so we can access it anywhere
                UsernamePasswordAuthenticationToken authToken = 
                        new UsernamePasswordAuthenticationToken(businessId, null, Collections.emptyList());

                // 3. Set Security Context
                SecurityContextHolder.getContext().setAuthentication(authToken);

                // 4. (Optional but Recommended) Store in Request Attribute 
                // This makes it super easy to access in Controllers using @RequestAttribute
                request.setAttribute("businessId", businessId);

            } catch (Exception e) {
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }
}