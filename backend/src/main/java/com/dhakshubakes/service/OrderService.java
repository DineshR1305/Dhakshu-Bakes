package com.dhakshubakes.service;

import com.dhakshubakes.dto.ApiResponse;
import com.dhakshubakes.dto.OrderDTO;
import com.dhakshubakes.entity.*;
import com.dhakshubakes.exception.BadRequestException;
import com.dhakshubakes.exception.ResourceNotFoundException;
import com.dhakshubakes.repository.*;
import com.dhakshubakes.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartService cartService;
    private final AddressRepository addressRepository;
    private final UserRepository userRepository;
    private final CouponService couponService;
    private final InventoryRepository inventoryRepository;
    private final CouponRepository couponRepository;
    private final CouponUsageRepository couponUsageRepository;
    private final DeliveryService deliveryService;
    private final DeliveryPincodeRepository pincodeRepository;

    @Transactional
    public ApiResponse<OrderDTO.Response> createOrderFromCart(UserPrincipal userPrincipal, OrderDTO.CheckoutRequest request) {
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Cart cart = cartService.getCartEntity(userPrincipal, null);
        if (cart.getItems().isEmpty()) {
            return ApiResponse.error("Cart is empty", "CART_EMPTY");
        }

        Address address = null;
        if (request.getShippingAddressId() != null) {
            address = addressRepository.findById(request.getShippingAddressId()).orElse(null);
        }
        if (address == null) {
            List<Address> userAddresses = addressRepository.findByUserId(user.getId());
            if (!userAddresses.isEmpty()) {
                address = userAddresses.get(0);
            } else {
                address = addressRepository.save(Address.builder()
                        .user(user)
                        .fullName(user.getFullName())
                        .phone(user.getPhone() != null ? user.getPhone() : "+91 9876543210")
                        .addressLine1("104 Park Avenue")
                        .city("Coimbatore")
                        .state("Tamil Nadu")
                        .postalCode("641001")
                        .country("India")
                        .isDefault(true)
                        .build());
            }
        }

        // Validate Delivery Date and Reserve Slot Capacity
        LocalDate delivDate = request.getDeliveryDate();
        if (delivDate != null) {
            if (delivDate.isBefore(LocalDate.now())) {
                throw new BadRequestException("Delivery date cannot be in the past");
            }
            if (request.getDeliverySlotId() != null) {
                deliveryService.reserveDeliverySlot(delivDate, request.getDeliverySlotId());
            }
        }

        // Verify stock & calculate server-side prices + customizations
        BigDecimal itemsSubtotal = BigDecimal.ZERO;
        BigDecimal customizationTotal = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (CartItem ci : cart.getItems()) {
            ProductVariant variant = ci.getVariant();
            if (variant.getInventory() != null && variant.getInventory().isOutOfStock()) {
                return ApiResponse.error("Item '" + ci.getProduct().getName() + " (" + variant.getVariantName() + ")' is out of stock", "OUT_OF_STOCK");
            }

            BigDecimal basePrice = variant.getDiscountPrice() != null ? variant.getDiscountPrice() : variant.getPrice();
            BigDecimal customFee = ci.getCustomizationFee() != null ? ci.getCustomizationFee() : BigDecimal.ZERO;
            BigDecimal unitPriceWithCustom = basePrice.add(customFee);
            BigDecimal itemTotal = unitPriceWithCustom.multiply(BigDecimal.valueOf(ci.getQuantity()));

            itemsSubtotal = itemsSubtotal.add(basePrice.multiply(BigDecimal.valueOf(ci.getQuantity())));
            customizationTotal = customizationTotal.add(customFee.multiply(BigDecimal.valueOf(ci.getQuantity())));

            OrderItem orderItem = OrderItem.builder()
                    .product(ci.getProduct())
                    .variant(variant)
                    .productName(ci.getProduct().getName())
                    .variantName(variant.getVariantName())
                    .unitPrice(unitPriceWithCustom)
                    .quantity(ci.getQuantity())
                    .totalPrice(itemTotal)
                    .customMessage(ci.getCustomMessage())
                    .specialInstructions(ci.getSpecialInstructions())
                    .isEggless(ci.isEggless())
                    .isGiftWrapped(ci.isGiftWrapped())
                    .customizationFee(customFee)
                    .build();

            orderItems.add(orderItem);
        }

        BigDecimal fullSubtotal = itemsSubtotal.add(customizationTotal);

        // Apply coupon if valid
        BigDecimal discount = BigDecimal.ZERO;
        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            discount = couponService.calculateCouponDiscount(request.getCouponCode(), fullSubtotal);
        }

        // Server-side delivery fee calculation
        String pincode = address.getPostalCode() != null ? address.getPostalCode().trim() : "641001";
        boolean freeDelivery = fullSubtotal.compareTo(new BigDecimal("499.00")) >= 0;
        BigDecimal baseDeliveryFee = freeDelivery ? BigDecimal.ZERO : new BigDecimal("50.00");

        String delivType = request.getDeliveryType() != null ? request.getDeliveryType().toUpperCase() : "STANDARD";
        BigDecimal surcharge = switch (delivType) {
            case "EXPRESS" -> new BigDecimal("40.00");
            case "SAME_DAY" -> new BigDecimal("60.00");
            default -> BigDecimal.ZERO;
        };

        BigDecimal deliveryFee = baseDeliveryFee.add(surcharge);
        BigDecimal total = fullSubtotal.subtract(discount).add(deliveryFee);

        String orderNumber = "DB-" + System.currentTimeMillis() / 1000 + "-" + (1000 + new Random().nextInt(9000));

        Order order = Order.builder()
                .orderNumber(orderNumber)
                .user(user)
                .shippingAddress(address)
                .subtotal(fullSubtotal)
                .customizationTotal(customizationTotal)
                .discountAmount(discount)
                .deliveryFee(deliveryFee)
                .taxAmount(BigDecimal.ZERO)
                .totalAmount(total)
                .orderStatus(OrderStatus.PENDING)
                .paymentStatus(PaymentStatus.PENDING)
                .deliveryDate(delivDate)
                .deliveryTimeSlot(request.getDeliveryTimeSlot())
                .deliveryType(delivType)
                .deliveryInstructions(request.getDeliveryInstructions())
                .appliedCouponCode(request.getCouponCode())
                .isGift(request.isGift())
                .giftMessage(request.getGiftMessage())
                .recipientName(request.getRecipientName())
                .recipientPhone(request.getRecipientPhone())
                .items(new ArrayList<>())
                .build();

        for (OrderItem item : orderItems) {
            item.setOrder(order);
            order.getItems().add(item);
        }

        Order savedOrder = orderRepository.save(order);
        cartService.clearCart(cart);

        return ApiResponse.success("Order created successfully", mapToResponse(savedOrder));
    }

    @Transactional(readOnly = true)
    public ApiResponse<List<OrderDTO.Response>> getUserOrders(UserPrincipal userPrincipal) {
        List<OrderDTO.Response> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(userPrincipal.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ApiResponse.success("User orders retrieved", orders);
    }

    @Transactional(readOnly = true)
    public ApiResponse<OrderDTO.Response> getOrderByNumber(UserPrincipal userPrincipal, String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderNumber));

        if (!order.getUser().getId().equals(userPrincipal.getId()) &&
                !userPrincipal.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return ApiResponse.error("Unauthorized to view this order", "UNAUTHORIZED");
        }

        return ApiResponse.success("Order details fetched", mapToResponse(order));
    }

    public OrderDTO.Response mapToResponse(Order order) {
        OrderDTO.AddressDTO addressDTO = null;
        if (order.getShippingAddress() != null) {
            Address a = order.getShippingAddress();
            addressDTO = new OrderDTO.AddressDTO(a.getFullName(), a.getPhone(), a.getAddressLine1(), a.getAddressLine2(), a.getCity(), a.getState(), a.getPostalCode(), a.getCountry());
        }

        List<OrderDTO.ItemResponse> items = order.getItems().stream().map(item -> OrderDTO.ItemResponse.builder()
                .id(item.getId())
                .productId(item.getProduct().getId())
                .productName(item.getProductName())
                .productSlug(item.getProduct().getSlug())
                .variantId(item.getVariant().getId())
                .variantName(item.getVariantName())
                .unitPrice(item.getUnitPrice())
                .quantity(item.getQuantity())
                .totalPrice(item.getTotalPrice())
                .customMessage(item.getCustomMessage())
                .specialInstructions(item.getSpecialInstructions())
                .isEggless(item.isEggless())
                .isGiftWrapped(item.isGiftWrapped())
                .customizationFee(item.getCustomizationFee())
                .build()).collect(Collectors.toList());

        String razorpayId = order.getPayment() != null ? order.getPayment().getRazorpayOrderId() : null;

        return OrderDTO.Response.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .customerName(order.getUser().getFullName())
                .customerEmail(order.getUser().getEmail())
                .shippingAddress(addressDTO)
                .subtotal(order.getSubtotal())
                .customizationTotal(order.getCustomizationTotal())
                .discountAmount(order.getDiscountAmount())
                .deliveryFee(order.getDeliveryFee())
                .taxAmount(order.getTaxAmount())
                .totalAmount(order.getTotalAmount())
                .orderStatus(order.getOrderStatus())
                .paymentStatus(order.getPaymentStatus())
                .deliveryDate(order.getDeliveryDate())
                .deliveryTimeSlot(order.getDeliveryTimeSlot())
                .deliveryType(order.getDeliveryType())
                .deliveryInstructions(order.getDeliveryInstructions())
                .appliedCouponCode(order.getAppliedCouponCode())
                .isGift(order.isGift())
                .giftMessage(order.getGiftMessage())
                .recipientName(order.getRecipientName())
                .razorpayOrderId(razorpayId)
                .items(items)
                .createdAt(order.getCreatedAt())
                .build();
    }

    @Transactional
    public ApiResponse<OrderDTO.Response> cancelOrder(UserPrincipal userPrincipal, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        if (!order.getUser().getId().equals(userPrincipal.getId()) &&
                userPrincipal.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return ApiResponse.error("Unauthorized to cancel this order", "UNAUTHORIZED");
        }

        if (order.getOrderStatus() == OrderStatus.CANCELLED) {
            return ApiResponse.success("Order is already cancelled", mapToResponse(order));
        }

        if (order.getOrderStatus() != OrderStatus.PENDING && order.getOrderStatus() != OrderStatus.CONFIRMED) {
            throw new BadRequestException("Order cannot be cancelled in " + order.getOrderStatus() + " stage.");
        }

        for (OrderItem item : order.getItems()) {
            ProductVariant variant = item.getVariant();
            if (variant != null && variant.getInventory() != null) {
                Inventory inventory = variant.getInventory();
                int restoredStock = inventory.getStockQuantity() + item.getQuantity();
                inventory.setStockQuantity(restoredStock);
                if (restoredStock > 0) {
                    inventory.setOutOfStock(false);
                }
                inventoryRepository.save(inventory);
            }
        }

        if (order.getAppliedCouponCode() != null && !order.getAppliedCouponCode().isBlank()) {
            Coupon coupon = couponRepository.findByCodeIgnoreCase(order.getAppliedCouponCode()).orElse(null);
            if (coupon != null) {
                boolean hasUsage = couponUsageRepository.existsByOrderIdAndCouponId(order.getId(), coupon.getId());
                if (hasUsage) {
                    int newCount = Math.max(0, coupon.getUsedCount() - 1);
                    coupon.setUsedCount(newCount);
                    couponRepository.save(coupon);

                    couponUsageRepository.findAll().stream()
                            .filter(u -> u.getOrder().getId().equals(order.getId()) && u.getCoupon().getId().equals(coupon.getId()))
                            .forEach(couponUsageRepository::delete);
                }
            }
        }

        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            order.setPaymentStatus(PaymentStatus.REFUND_PENDING);
        } else {
            order.setPaymentStatus(PaymentStatus.FAILED);
        }

        order.setOrderStatus(OrderStatus.CANCELLED);
        Order savedOrder = orderRepository.save(order);

        return ApiResponse.success("Order cancelled successfully", mapToResponse(savedOrder));
    }

    @Transactional
    public ApiResponse<OrderDTO.Response> updateOrderStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        OrderStatus currentStatus = order.getOrderStatus();
        if (currentStatus == newStatus) {
            return ApiResponse.success("Order status unchanged", mapToResponse(order));
        }

        boolean isValid = switch (currentStatus) {
            case PENDING -> newStatus == OrderStatus.CONFIRMED || newStatus == OrderStatus.CANCELLED;
            case CONFIRMED -> newStatus == OrderStatus.PROCESSING || newStatus == OrderStatus.BAKING || newStatus == OrderStatus.CANCELLED;
            case PROCESSING, BAKING -> newStatus == OrderStatus.READY_FOR_PICKUP || newStatus == OrderStatus.OUT_FOR_DELIVERY || newStatus == OrderStatus.CANCELLED;
            case READY_FOR_PICKUP, OUT_FOR_DELIVERY -> newStatus == OrderStatus.DELIVERED || newStatus == OrderStatus.CANCELLED;
            case DELIVERED, CANCELLED, REFUNDED -> false;
        };

        if (!isValid) {
            throw new BadRequestException("Invalid order status transition from " + currentStatus + " to " + newStatus);
        }

        order.setOrderStatus(newStatus);
        Order savedOrder = orderRepository.save(order);
        return ApiResponse.success("Order status updated to " + newStatus, mapToResponse(savedOrder));
    }
}
