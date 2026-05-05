package com.uniformly.addresses;

public record AddressResponse(
        Long id,
        String label,
        String fullName,
        String phone,
        String addressLine,
        String city,
        String state,
        String pincode,
        boolean isDefault
) {
    static AddressResponse from(Address address) {
        return new AddressResponse(
                address.getId(),
                address.getLabel(),
                address.getFullName(),
                address.getPhone(),
                address.getAddressLine(),
                address.getCity(),
                address.getState(),
                address.getPincode(),
                address.isDefaultAddress()
        );
    }
}
