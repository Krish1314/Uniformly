package com.uniformly.users;

import com.uniformly.common.NotFoundException;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {
    private final UserRepository users;

    public UserController(UserRepository users) {
        this.users = users;
    }

    @GetMapping("/me")
    public UserResponse getProfile() {
        Long userId = com.uniformly.auth.SecurityUtils.getAuthenticatedUserId();
        return users.findById(userId).map(UserResponse::from)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }

    @PatchMapping("/me")
    public UserResponse updateProfile(
            @RequestBody UpdateUserRequest request
    ) {
        Long userId = com.uniformly.auth.SecurityUtils.getAuthenticatedUserId();
        User user = users.findById(userId).orElseThrow(() -> new NotFoundException("User not found"));
        
        if (request.email() != null && !request.email().equalsIgnoreCase(user.getEmail())) {
            if (users.existsByEmailIgnoreCase(request.email())) {
                throw new IllegalArgumentException("Email is already taken");
            }
            user.setEmail(request.email().toLowerCase());
        }

        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setPhone(request.phone());
        return UserResponse.from(users.save(user));
    }

    @GetMapping("/me/stats")
    public Map<String, Object> getUserStats() {
        return Map.of("totalOrders", 0, "totalSpend", BigDecimal.ZERO);
    }

    public record UpdateUserRequest(
            String firstName,
            String lastName,
            String email,
            String phone
    ) {}
}
