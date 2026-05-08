package com.uniformly.auth;

import com.uniformly.common.NotFoundException;
import com.uniformly.users.User;
import com.uniformly.users.UserRepository;
import com.uniformly.users.UserResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final UserRepository users;
    private final JwtService jwtService;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

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

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
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
