package com.uniformly.addresses;

import com.uniformly.common.NotFoundException;
import com.uniformly.users.User;
import com.uniformly.users.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.transaction.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/addresses")
public class AddressController {
    private final AddressRepository addresses;
    private final UserRepository users;

    public AddressController(AddressRepository addresses, UserRepository users) {
        this.addresses = addresses;
        this.users = users;
    }

    @GetMapping
    public List<AddressResponse> getAddresses() {
        Long userId = com.uniformly.auth.SecurityUtils.getAuthenticatedUserId();
        return addresses.findByUserIdOrderByDefaultAddressDescCreatedAtDesc(userId)
                .stream()
                .map(AddressResponse::from)
                .toList();
    }

    @PostMapping
    public AddressResponse createAddress(
            @Valid @RequestBody AddressRequest request
    ) {
        Long userId = com.uniformly.auth.SecurityUtils.getAuthenticatedUserId();
        User user = users.findById(userId).orElseThrow(() -> new NotFoundException("User not found"));
        Address address = new Address(
                user,
                request.label(),
                request.fullName(),
                request.phone(),
                request.addressLine(),
                request.city(),
                request.state(),
                request.pincode(),
                Boolean.TRUE.equals(request.isDefault())
        );
        return AddressResponse.from(addresses.save(address));
    }

    @PatchMapping("/{id}")
    public AddressResponse updateAddress(
            @PathVariable Long id,
            @Valid @RequestBody AddressRequest request
    ) {
        Long userId = com.uniformly.auth.SecurityUtils.getAuthenticatedUserId();
        Address address = addresses.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new NotFoundException("Address not found"));
        address.setLabel(request.label());
        address.setFullName(request.fullName());
        address.setPhone(request.phone());
        address.setAddressLine(request.addressLine());
        address.setCity(request.city());
        address.setState(request.state());
        address.setPincode(request.pincode());
        address.setDefaultAddress(Boolean.TRUE.equals(request.isDefault()));
        return AddressResponse.from(addresses.save(address));
    }

    @DeleteMapping("/{id}")
    public void deleteAddress(
            @PathVariable Long id
    ) {
        Long userId = com.uniformly.auth.SecurityUtils.getAuthenticatedUserId();
        Address address = addresses.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new NotFoundException("Address not found"));
        addresses.delete(address);
    }

    @PatchMapping("/{id}/default")
    @Transactional
    public AddressResponse setDefaultAddress(
            @PathVariable Long id
    ) {
        Long userId = com.uniformly.auth.SecurityUtils.getAuthenticatedUserId();
        List<Address> userAddresses = addresses.findByUserIdOrderByDefaultAddressDescCreatedAtDesc(userId);
        Address selected = userAddresses.stream()
                .filter(address -> address.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Address not found"));
        userAddresses.forEach(address -> address.setDefaultAddress(false));
        selected.setDefaultAddress(true);
        return AddressResponse.from(selected);
    }

    public record AddressRequest(
            String label,
            @NotBlank String fullName,
            @NotBlank String phone,
            @NotBlank String addressLine,
            @NotBlank String city,
            @NotBlank String state,
            @NotBlank String pincode,
            Boolean isDefault
    ) {}
}
