package com.dhakshubakes.service;

import com.dhakshubakes.dto.ApiResponse;
import com.dhakshubakes.dto.OrderDTO;
import com.dhakshubakes.entity.*;
import com.dhakshubakes.repository.*;
import com.dhakshubakes.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
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

    @Transactional
    public ApiResponse<OrderDTO.Response> createOrderFromCart(UserPrincipal userPrincipal, OrderDTO.CheckoutRequest request) {
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Cart cart = cartService.getCartEntity(userPrincipal, null);
        if (cart.getItems().isEmpty()) {
            return ApiResponse.error("Cart is empty", "CART_EMPTY");
        }

        Address address = addressRepository.findById(request.getShippingAddressId())
                .orElseThrow(() -> new RuntimeException("Shipping address not found"));

        // Verify stock & calculate server-side prices
        BigDecimal subtotal = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (CartItem ci : cart.getItems()) {
            ProductVariant variant = ci.getVariant();
            if (variant.getInventory() != null && variant.getInventory().isOutOfStock()) {
                return ApiResponse.error("Item '" + ci.getProduct().getName() + " (" + variant.getVariantName() + ")' is out of stock", "OUT_OF_STOCK");
            }

            BigDecimal unitPrice = variant.getDiscountPrice() != null ? variant.getDiscountPrice() : variant.getPrice();
            BigDecimal itemTotal = unitPrice.multiply(BigDecimal.valueOf(ci.getQuantity()));
            subtotal = subtotal.add(itemTotal);

            OrderItem orderItem = OrderItem.builder()
                    .product(ci.getProduct())
                    .variant(variant)
                    .productName(ci.getProduct().getName())
                    .variantName(variant.getVariantName())
                    .unitPrice(unitPrice)
                    .quantity(ci.getQuantity())
                    .totalPrice(itemTotal)
                    .build();

            orderItems.add(orderItem);
        }

        // Apply coupon if valid
        BigDecimal discount = BigDecimal.ZERO;
        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            discount = couponService.calculateCouponDiscount(request.getCouponCode(), subtotal);
        }

        // Delivery Charge: Free over 499, else 50
        BigDecimal deliveryFee = subtotal.compareTo(new BigDecimal("499")) >= 0 ? BigDecimal.ZERO : new BigDecimal("50.00");
        BigDecimal total = subtotal.subtract(discount).add(deliveryFee);

        String orderNumber = "DB-" + System.currentTimeMillis() / 1000 + "-" + (1000 + new Random().nextInt(9000));

        Order order = Order.builder()
                .orderNumber(orderNumber)
                .user(user)
                .shippingAddress(address)
                .subtotal(subtotal)
                .discountAmount(discount)
                .deliveryFee(deliveryFee)
                .taxAmount(BigDecimal.ZERO)
                .totalAmount(total)
                .orderStatus(OrderStatus.PENDING)
                .paymentStatus(PaymentStatus.PENDING)
                .deliveryDate(request.getDeliveryDate())
                .deliveryTimeSlot(request.getDeliveryTimeSlot())
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
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderNumber));

        if (!order.getUser().getId().equals(userPrincipal.getId()) && !userPrincipal.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
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
                .build()).collect(Collectors.toList());

        String razorpayId = order.getPayment() != null ? order.getPayment().getRazorpayOrderId() : null;

        return OrderDTO.Response.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .customerName(order.getUser().getFullName())
                .customerEmail(order.getUser().getEmail())
                .shippingAddress(addressDTO)
                .subtotal(order.getSubtotal())
                .discountAmount(order.getDiscountAmount())
                .deliveryFee(order.getDeliveryFee())
                .taxAmount(order.getTaxAmount())
                .totalAmount(order.getTotalAmount())
                .orderStatus(order.getOrderStatus())
                .paymentStatus(order.getPaymentStatus())
                .deliveryDate(order.getDeliveryDate())
                .deliveryTimeSlot(order.getDeliveryTimeSlot())
                .appliedCouponCode(order.getAppliedCouponCode())
                .isGift(order.isGift())
                .giftMessage(order.getGiftMessage())
                .recipientName(order.getRecipientName())
                .razorpayOrderId(razorpayId)
                .items(items)
                .createdAt(order.getCreatedAt())
                .build();
    }
}
