package com.dhakshubakes.service;

import com.dhakshubakes.dto.ApiResponse;
import com.dhakshubakes.dto.AddressDTO;
import com.dhakshubakes.entity.Address;
import com.dhakshubakes.entity.User;
import com.dhakshubakes.exception.ResourceNotFoundException;
import com.dhakshubakes.repository.AddressRepository;
import com.dhakshubakes.repository.UserRepository;
import com.dhakshubakes.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public ApiResponse<List<AddressDTO.Response>> getUserAddresses(UserPrincipal userPrincipal) {
        List<AddressDTO.Response> addresses = addressRepository.findByUserId(userPrincipal.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ApiResponse.success("Saved addresses fetched successfully", addresses);
    }

    @Transactional
    public ApiResponse<AddressDTO.Response> createAddress(UserPrincipal userPrincipal, AddressDTO.Request request) {
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Address> userAddresses = addressRepository.findByUserId(userPrincipal.getId());
        boolean shouldBeDefault = request.isDefault() || userAddresses.isEmpty();

        if (shouldBeDefault && !userAddresses.isEmpty()) {
            clearOtherDefaults(userPrincipal.getId());
        }

        Address address = Address.builder()
                .user(user)
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .addressLine1(request.getAddressLine1())
                .addressLine2(request.getAddressLine2())
                .city(request.getCity())
                .state(request.getState())
                .postalCode(request.getPostalCode())
                .country(request.getCountry() != null ? request.getCountry() : "India")
                .deliveryInstructions(request.getDeliveryInstructions())
                .isDefault(shouldBeDefault)
                .build();

        Address saved = addressRepository.save(address);
        return ApiResponse.success("Address saved successfully", mapToResponse(saved));
    }

    @Transactional
    public ApiResponse<AddressDTO.Response> updateAddress(UserPrincipal userPrincipal, Long id, AddressDTO.Request request) {
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with ID: " + id));

        if (!address.getUser().getId().equals(userPrincipal.getId())) {
            return ApiResponse.error("Unauthorized to update this address", "UNAUTHORIZED");
        }

        if (request.isDefault() && !address.isDefault()) {
            clearOtherDefaults(userPrincipal.getId());
            address.setDefault(true);
        } else if (!request.isDefault() && address.isDefault()) {
            address.setDefault(false);
        }

        address.setFullName(request.getFullName());
        address.setPhone(request.getPhone());
        address.setAddressLine1(request.getAddressLine1());
        address.setAddressLine2(request.getAddressLine2());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setPostalCode(request.getPostalCode());
        if (request.getCountry() != null) address.setCountry(request.getCountry());
        address.setDeliveryInstructions(request.getDeliveryInstructions());

        Address saved = addressRepository.save(address);
        return ApiResponse.success("Address updated successfully", mapToResponse(saved));
    }

    @Transactional
    public ApiResponse<Void> deleteAddress(UserPrincipal userPrincipal, Long id) {
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with ID: " + id));

        if (!address.getUser().getId().equals(userPrincipal.getId())) {
            return ApiResponse.error("Unauthorized to delete this address", "UNAUTHORIZED");
        }

        boolean wasDefault = address.isDefault();
        addressRepository.delete(address);

        if (wasDefault) {
            List<Address> remaining = addressRepository.findByUserId(userPrincipal.getId());
            if (!remaining.isEmpty()) {
                Address first = remaining.get(0);
                first.setDefault(true);
                addressRepository.save(first);
            }
        }

        return ApiResponse.success("Address deleted successfully", null);
    }

    @Transactional
    public ApiResponse<AddressDTO.Response> setDefaultAddress(UserPrincipal userPrincipal, Long id) {
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with ID: " + id));

        if (!address.getUser().getId().equals(userPrincipal.getId())) {
            return ApiResponse.error("Unauthorized to modify this address", "UNAUTHORIZED");
        }

        clearOtherDefaults(userPrincipal.getId());
        address.setDefault(true);
        Address saved = addressRepository.save(address);

        return ApiResponse.success("Default address updated successfully", mapToResponse(saved));
    }

    private void clearOtherDefaults(Long userId) {
        List<Address> addresses = addressRepository.findByUserId(userId);
        for (Address a : addresses) {
            if (a.isDefault()) {
                a.setDefault(false);
                addressRepository.save(a);
            }
        }
    }

    private AddressDTO.Response mapToResponse(Address a) {
        return AddressDTO.Response.builder()
                .id(a.getId())
                .fullName(a.getFullName())
                .phone(a.getPhone())
                .addressLine1(a.getAddressLine1())
                .addressLine2(a.getAddressLine2())
                .city(a.getCity())
                .state(a.getState())
                .postalCode(a.getPostalCode())
                .country(a.getCountry())
                .deliveryInstructions(a.getDeliveryInstructions())
                .isDefault(a.isDefault())
                .build();
    }
}
