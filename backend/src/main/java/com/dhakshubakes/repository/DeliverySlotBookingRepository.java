package com.dhakshubakes.repository;

import com.dhakshubakes.entity.DeliverySlotBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import jakarta.persistence.LockModeType;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DeliverySlotBookingRepository extends JpaRepository<DeliverySlotBooking, Long> {

    List<DeliverySlotBooking> findByDeliveryDate(LocalDate deliveryDate);

    Optional<DeliverySlotBooking> findByDeliveryDateAndSlotId(LocalDate deliveryDate, Long slotId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<DeliverySlotBooking> findWithLockByDeliveryDateAndSlotId(LocalDate deliveryDate, Long slotId);
}
