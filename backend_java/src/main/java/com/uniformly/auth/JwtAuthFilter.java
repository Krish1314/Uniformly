package com.uniformly.auth;

import com.uniformly.users.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtAuthFilter(JwtService jwtService, UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        String jwt = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwt = authHeader.substring(7);
        } else {
            String tokenParam = request.getParameter("token");
            if (tokenParam != null && !tokenParam.isEmpty()) {
                jwt = tokenParam;
            }
        }

        if (jwt == null) {
            filterChain.doFilter(request, response);
            return;
        }
        try {
            String userIdStr = jwtService.extractUserId(jwt);
            if (userIdStr != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                Long userId = Long.parseLong(userIdStr);

                if (jwtService.isTokenValid(jwt, userId)) {
                    String jwtRole = jwtService.extractRole(jwt);
                    String effectiveRole;

                    // P1-A: For ADMIN tokens, always verify the role against the live DB.
                    // This prevents stale/forged tokens from retaining admin privileges after demotion.
                    if ("ADMIN".equalsIgnoreCase(jwtRole)) {
                        effectiveRole = userRepository.findById(userId)
                                .map(u -> "ADMIN".equalsIgnoreCase(u.getRole()) ? "ADMIN" : "CUSTOMER")
                                .orElse("CUSTOMER");
                    } else {
                        effectiveRole = (jwtRole != null) ? jwtRole.toUpperCase() : "CUSTOMER";
                    }

                    org.springframework.security.core.GrantedAuthority authority =
                            new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + effectiveRole);

                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userId, null, List.of(authority)
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            // Token parsing failed — let SecurityFilterChain return 401/403
        }

        filterChain.doFilter(request, response);
    }
}
