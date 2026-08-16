package com.dhakshubakes.service;

import com.dhakshubakes.dto.ApiResponse;
import com.dhakshubakes.dto.DeliveryDTO;
import com.dhakshubakes.entity.DeliveryPincode;
import com.dhakshubakes.entity.DeliverySlot;
import com.dhakshubakes.entity.DeliverySlotBooking;
import com.dhakshubakes.exception.BadRequestException;
import com.dhakshubakes.repository.DeliveryPincodeRepository;
import com.dhakshubakes.repository.DeliverySlotBookingRepository;
import com.dhakshubakes.repository.DeliverySlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DeliveryService {

    private final DeliverySlotRepository slotRepository;
    private final DeliverySlotBookingRepository bookingRepository;
    private final DeliveryPincodeRepository pincodeRepository;

    @Transactional(readOnly = true)
    public ApiResponse<List<DeliveryDTO.SlotResponse>> getAvailableSlots(LocalDate date) {
        if (date.isBefore(LocalDate.now())) {
            throw new BadRequestException("Delivery date cannot be in the past");
        }
        if (date.isAfter(LocalDate.now().plusDays(30))) {
            throw new BadRequestException("Advance booking window is limited to 30 days");
        }

        List<DeliverySlot> slots = slotRepository.findByActiveTrueOrderByDisplayOrderAsc();
        List<DeliverySlotBooking> bookings = bookingRepository.findByDeliveryDate(date);
        Map<Long, Integer> bookedMap = bookings.stream()
                .collect(Collectors.toMap(b -> b.getSlot().getId(), DeliverySlotBooking::getBookedCount));

        LocalTime currentTime = LocalTime.now();
        boolean isToday = date.isEqual(LocalDate.now());

        List<DeliveryDTO.SlotResponse> responses = slots.stream().map(s -> {
            int booked = bookedMap.getOrDefault(s.getId(), 0);
            int remaining = Math.max(0, s.getMaxCapacity() - booked);

            boolean isPastToday = isToday && currentTime.isAfter(s.getStartTime().minusHours(1));
            boolean available = remaining > 0 && !isPastToday;

            return DeliveryDTO.SlotResponse.builder()
                    .id(s.getId())
                    .slotName(s.getSlotName())
                    .startTime(s.getStartTime().toString())
                    .endTime(s.getEndTime().toString())
                    .maxCapacity(s.getMaxCapacity())
                    .bookedCount(booked)
                    .remainingCapacity(remaining)
                    .extraFee(s.getExtraFee())
                    .available(available)
                    .build();
        }).collect(Collectors.toList());

        return ApiResponse.success("Available slots retrieved", responses);
    }

    @Transactional(readOnly = true)
    public ApiResponse<DeliveryDTO.ServiceabilityResponse> checkServiceability(DeliveryDTO.ServiceabilityCheckRequest req) {
        if (req.getPincode() == null || req.getPincode().trim().isEmpty()) {
            throw new BadRequestException("Pincode is required");
        }

        String cleanPincode = req.getPincode().trim();
        Optional<DeliveryPincode> pincodeOpt = pincodeRepository.findByPincodeAndActiveTrue(cleanPincode);

        if (pincodeOpt.isEmpty()) {
            return ApiResponse.success("Serviceability check complete", DeliveryDTO.ServiceabilityResponse.builder()
                    .serviceable(false)
                    .pincode(cleanPincode)
                    .areaName("Unknown / Outside Service Area")
                    .deliveryFee(new BigDecimal("99.00"))
                    .freeDelivery(false)
                    .message("Sorry, fresh bakery delivery is currently unavailable to pincode " + cleanPincode)
                    .build());
        }

        DeliveryPincode p = pincodeOpt.get();
        BigDecimal subtotal = req.getSubtotal() != null ? req.getSubtotal() : BigDecimal.ZERO;
        boolean freeDelivery = subtotal.compareTo(p.getMinOrderForFreeDelivery()) >= 0;

        BigDecimal baseFee = freeDelivery ? BigDecimal.ZERO : new BigDecimal("50.00");
        String deliveryType = req.getDeliveryType() != null ? req.getDeliveryType().toUpperCase() : "STANDARD";

        BigDecimal surcharge = switch (deliveryType) {
            case "EXPRESS" -> new BigDecimal("40.00");
            case "SAME_DAY" -> new BigDecimal("60.00");
            default -> BigDecimal.ZERO;
        };

        BigDecimal finalFee = baseFee.add(surcharge);

        return ApiResponse.success("Serviceability check complete", DeliveryDTO.ServiceabilityResponse.builder()
                .serviceable(true)
                .pincode(p.getPincode())
                .areaName(p.getAreaName())
                .deliveryFee(finalFee)
                .freeDelivery(freeDelivery && surcharge.compareTo(BigDecimal.ZERO) == 0)
                .message("Fresh bakery delivery is AVAILABLE to " + p.getAreaName() + " (" + p.getPincode() + ")")
                .build());
    }

    @Transactional
    public void reserveDeliverySlot(LocalDate date, Long slotId) {
        DeliverySlot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new BadRequestException("Invalid delivery slot ID: " + slotId));

        if (!slot.isActive()) {
            throw new BadRequestException("Selected delivery slot is currently inactive");
        }

        DeliverySlotBooking booking = bookingRepository.findWithLockByDeliveryDateAndSlotId(date, slotId)
                .orElseGet(() -> DeliverySlotBooking.builder()
                        .deliveryDate(date)
                        .slot(slot)
                        .bookedCount(0)
                        .build());

        if (booking.getBookedCount() >= slot.getMaxCapacity()) {
            throw new BadRequestException("Selected delivery slot on " + date + " is fully booked. Please choose another slot.");
        }

        booking.setBookedCount(booking.getBookedCount() + 1);
        bookingRepository.save(booking);
    }
}
