package com.uniformly.auth;

import com.uniformly.common.NotFoundException;
import com.uniformly.users.User;
import com.uniformly.users.UserRepository;
import com.uniformly.users.UserResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import java.util.Collections;
import java.io.IOException;
import java.security.GeneralSecurityException;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final UserRepository users;
    private final JwtService jwtService;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Value("${application.security.google.client-id}")
    private String googleClientId;

    @Value("${application.security.admin.emails}")
    private String adminEmailsString;

    public AuthController(UserRepository users, JwtService jwtService) {
        this.users = users;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        if (users.existsByEmailIgnoreCase(request.email())) {
            throw new IllegalArgumentException("Email is already registered");
        }
        // Always hash the password before saving
        String hashedPassword = passwordEncoder.encode(request.password());
        User user = users.save(new User(
                request.firstName(),
                request.lastName(),
                request.email(),
                request.phone(),
                hashedPassword
        ));
        String token = jwtService.generateToken(user.getId(), user.getRole());
        return new AuthResponse(token, UserResponse.from(user));
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        User user = users.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        // Guard: Google-only accounts have no password — return generic error to prevent account enumeration
        if (user.getPasswordHash() == null || user.getPasswordHash().isBlank()) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        // P0-A: Mirror Google login's admin-email allowlist on password login.
        // If DB role is ADMIN but email is not whitelisted, reject — prevents stale DB rows from granting access.
        if ("ADMIN".equalsIgnoreCase(user.getRole()) && !isAdminEmail(user.getEmail())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        String token = jwtService.generateToken(user.getId(), user.getRole());
        return new AuthResponse(token, UserResponse.from(user));
    }


    @GetMapping("/me")
    public UserResponse currentUser() {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return users.findById(userId).map(UserResponse::from)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }

    @PostMapping("/logout")
    public String logout() {
        return "Logged out";
    }

    @PostMapping("/google")
    public AuthResponse googleLogin(@Valid @RequestBody GoogleLoginRequest request) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(request.token());
            if (idToken == null) {
                throw new IllegalArgumentException("Invalid Google token");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            if (email == null) {
                throw new IllegalArgumentException("Google token does not contain an email address");
            }

            String googleSub = payload.getSubject();
            String firstName = (String) payload.get("given_name");
            String lastName = (String) payload.get("family_name");
            if (firstName == null || firstName.isBlank()) {
                firstName = "Google";
            }
            if (lastName == null || lastName.isBlank()) {
                lastName = "User";
            }

            // Find user by email (case-insensitive)
            User user = users.findByEmailIgnoreCase(email).orElse(null);
            
            if (user == null) {
                // Register a new user
                user = new User(firstName, lastName, email, null, null, googleSub);
            } else {
                // Link Google account if not already linked
                if (user.getGoogleSub() == null) {
                    user.setGoogleSub(googleSub);
                }
            }

            // Strictly enforce role: only the configured admin email gets ADMIN. All others are CUSTOMER.
            if (isAdminEmail(email)) {
                user.setRole("ADMIN");
            } else {
                // Defense-in-depth: strip any stale ADMIN role from non-admin accounts
                user.setRole("CUSTOMER");
            }

            user = users.save(user);

            String appToken = jwtService.generateToken(user.getId(), user.getRole());
            return new AuthResponse(appToken, UserResponse.from(user));

        } catch (GeneralSecurityException | IOException e) {
            throw new IllegalArgumentException("Failed to verify Google token: " + e.getMessage());
        }
    }

    private boolean isAdminEmail(String email) {
        if (adminEmailsString == null || email == null) {
            return false;
        }
        for (String adminEmail : adminEmailsString.split(",")) {
            if (adminEmail.trim().equalsIgnoreCase(email.trim())) {
                return true;
            }
        }
        return false;
    }

    public record GoogleLoginRequest(
            @NotBlank String token
    ) {}

    public record RegisterRequest(
            @NotBlank String firstName,
            String lastName,
            @Email @NotBlank String email,
            String phone,
            @NotBlank String password
    ) {}

    public record LoginRequest(
            @Email @NotBlank String email,
            @NotBlank String password
    ) {}

    public record AuthResponse(String token, UserResponse user) {}
}
