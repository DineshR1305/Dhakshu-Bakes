package com.dhakshubakes.repository;

import com.dhakshubakes.entity.DeliveryPincode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DeliveryPincodeRepository extends JpaRepository<DeliveryPincode, Long> {
    Optional<DeliveryPincode> findByPincodeAndActiveTrue(String pincode);
}
