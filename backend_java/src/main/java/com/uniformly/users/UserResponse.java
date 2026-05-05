package com.uniformly.users;

public record UserResponse(
        Long id,
        String firstName,
        String lastName,
        String email,
        String phone,
        String role
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole()
        );
    }
}
