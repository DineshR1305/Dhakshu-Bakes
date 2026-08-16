package com.dhakshubakes.repository;

import com.dhakshubakes.entity.DeliverySlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeliverySlotRepository extends JpaRepository<DeliverySlot, Long> {
    List<DeliverySlot> findByActiveTrueOrderByDisplayOrderAsc();
}
