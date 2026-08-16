package com.dhakshubakes.service;

import com.dhakshubakes.dto.ApiResponse;
import com.dhakshubakes.dto.CartDTO;
import com.dhakshubakes.entity.Cart;
import com.dhakshubakes.entity.CartItem;
import com.dhakshubakes.entity.Product;
import com.dhakshubakes.entity.ProductVariant;
import com.dhakshubakes.entity.User;
import com.dhakshubakes.exception.ResourceNotFoundException;
import com.dhakshubakes.repository.CartRepository;
import com.dhakshubakes.repository.ProductRepository;
import com.dhakshubakes.repository.ProductVariantRepository;
import com.dhakshubakes.repository.UserRepository;
import com.dhakshubakes.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final UserRepository userRepository;

    @Transactional
    public ApiResponse<CartDTO.Response> getOrCreateCart(UserPrincipal userPrincipal, String sessionId) {
        Cart cart = getCartEntity(userPrincipal, sessionId);
        return ApiResponse.success("Cart retrieved", mapToResponse(cart));
    }

    @Transactional
    public ApiResponse<CartDTO.Response> addItemToCart(UserPrincipal userPrincipal, String sessionId, CartDTO.AddRequest request) {
        Cart cart = getCartEntity(userPrincipal, sessionId);

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        ProductVariant variant = productVariantRepository.findById(request.getVariantId())
                .orElseThrow(() -> new ResourceNotFoundException("Variant not found"));

        if (variant.getInventory() != null && variant.getInventory().isOutOfStock()) {
            return ApiResponse.error("Selected product variant is out of stock", "OUT_OF_STOCK");
        }

        // Sanitize customization inputs
        String customMsg = sanitizeString(request.getCustomMessage(), 200);
        String specialInst = sanitizeString(request.getSpecialInstructions(), 500);
        boolean eggless = Boolean.TRUE.equals(request.getIsEggless()) && product.isEgglessAllowed();
        boolean giftWrapped = Boolean.TRUE.equals(request.getIsGiftWrapped()) && product.isGiftWrapAllowed();

        // Calculate customization fee per unit
        BigDecimal egglessFee = eggless ? product.getEgglessSurcharge() : BigDecimal.ZERO;
        BigDecimal giftWrapFee = giftWrapped ? product.getGiftWrapFee() : BigDecimal.ZERO;
        BigDecimal unitCustomizationFee = egglessFee.add(giftWrapFee);

        // Matching logic: cart item identity depends on variant AND exact customization
        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getVariant().getId().equals(variant.getId())
                        && Objects.equals(item.getCustomMessage(), customMsg)
                        && Objects.equals(item.getSpecialInstructions(), specialInst)
                        && item.isEggless() == eggless
                        && item.isGiftWrapped() == giftWrapped)
                .findFirst();

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + (request.getQuantity() != null ? request.getQuantity() : 1));
            item.setCustomizationFee(unitCustomizationFee);
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .variant(variant)
                    .quantity(request.getQuantity() != null ? request.getQuantity() : 1)
                    .customMessage(customMsg)
                    .specialInstructions(specialInst)
                    .isEggless(eggless)
                    .isGiftWrapped(giftWrapped)
                    .customizationFee(unitCustomizationFee)
                    .build();
            cart.getItems().add(newItem);
        }

        Cart savedCart = cartRepository.save(cart);
        return ApiResponse.success("Item added to cart", mapToResponse(savedCart));
    }

    @Transactional
    public ApiResponse<CartDTO.Response> updateItemQuantity(UserPrincipal userPrincipal, String sessionId, Long itemId, CartDTO.UpdateRequest request) {
        Cart cart = getCartEntity(userPrincipal, sessionId);

        cart.getItems().removeIf(item -> {
            if (item.getId().equals(itemId)) {
                if (request.getQuantity() <= 0) return true;
                item.setQuantity(request.getQuantity());
            }
            return false;
        });

        Cart savedCart = cartRepository.save(cart);
        return ApiResponse.success("Cart updated", mapToResponse(savedCart));
    }

    @Transactional
    public ApiResponse<CartDTO.Response> removeItem(UserPrincipal userPrincipal, String sessionId, Long itemId) {
        Cart cart = getCartEntity(userPrincipal, sessionId);
        cart.getItems().removeIf(item -> item.getId().equals(itemId));
        Cart savedCart = cartRepository.save(cart);
        return ApiResponse.success("Item removed from cart", mapToResponse(savedCart));
    }

    @Transactional
    public void clearCart(Cart cart) {
        cart.getItems().clear();
        cartRepository.save(cart);
    }

    public Cart getCartEntity(UserPrincipal userPrincipal, String sessionId) {
        if (userPrincipal != null) {
            User user = userRepository.findById(userPrincipal.getId()).orElse(null);
            if (user != null) {
                return cartRepository.findByUserId(user.getId())
                        .orElseGet(() -> cartRepository.save(Cart.builder().user(user).items(new ArrayList<>()).build()));
            }
        }

        String sessionKey = (sessionId != null && !sessionId.isBlank()) ? sessionId : "GUEST-SESSION-DEFAULT";
        return cartRepository.findBySessionId(sessionKey)
                .orElseGet(() -> cartRepository.save(Cart.builder().sessionId(sessionKey).items(new ArrayList<>()).build()));
    }

    @Transactional
    public ApiResponse<CartDTO.Response> mergeGuestCartToUserCart(UserPrincipal userPrincipal, String sessionId) {
        if (userPrincipal == null) {
            return ApiResponse.error("Authentication required to merge cart", "UNAUTHORIZED");
        }
        if (sessionId == null || sessionId.isBlank()) {
            return getOrCreateCart(userPrincipal, null);
        }

        Cart guestCart = cartRepository.findBySessionId(sessionId).orElse(null);
        if (guestCart == null || guestCart.getItems().isEmpty()) {
            return getOrCreateCart(userPrincipal, null);
        }

        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Cart userCart = cartRepository.findByUserId(user.getId())
                .orElseGet(() -> cartRepository.save(Cart.builder().user(user).items(new ArrayList<>()).build()));

        for (CartItem guestItem : guestCart.getItems()) {
            ProductVariant variant = guestItem.getVariant();
            int maxStock = variant.getInventory() != null ? variant.getInventory().getStockQuantity() : 999;

            Optional<CartItem> existingUserItem = userCart.getItems().stream()
                    .filter(item -> item.getVariant().getId().equals(variant.getId())
                            && Objects.equals(item.getCustomMessage(), guestItem.getCustomMessage())
                            && Objects.equals(item.getSpecialInstructions(), guestItem.getSpecialInstructions())
                            && item.isEggless() == guestItem.isEggless()
                            && item.isGiftWrapped() == guestItem.isGiftWrapped())
                    .findFirst();

            if (existingUserItem.isPresent()) {
                CartItem userItem = existingUserItem.get();
                int mergedQty = Math.min(maxStock, userItem.getQuantity() + guestItem.getQuantity());
                userItem.setQuantity(mergedQty);
            } else {
                int safeQty = Math.min(maxStock, guestItem.getQuantity());
                CartItem newItem = CartItem.builder()
                        .cart(userCart)
                        .product(guestItem.getProduct())
                        .variant(variant)
                        .quantity(safeQty)
                        .customMessage(guestItem.getCustomMessage())
                        .specialInstructions(guestItem.getSpecialInstructions())
                        .isEggless(guestItem.isEggless())
                        .isGiftWrapped(guestItem.isGiftWrapped())
                        .customizationFee(guestItem.getCustomizationFee())
                        .build();
                userCart.getItems().add(newItem);
            }
        }

        Cart savedUserCart = cartRepository.save(userCart);

        guestCart.getItems().clear();
        cartRepository.delete(guestCart);

        return ApiResponse.success("Cart merged successfully", mapToResponse(savedUserCart));
    }

    private CartDTO.Response mapToResponse(Cart cart) {
        List<CartDTO.ItemResponse> items = cart.getItems().stream().map(item -> {
            BigDecimal basePrice = item.getVariant().getDiscountPrice() != null ? item.getVariant().getDiscountPrice() : item.getVariant().getPrice();
            BigDecimal customFee = item.getCustomizationFee() != null ? item.getCustomizationFee() : BigDecimal.ZERO;
            BigDecimal unitPriceWithCustom = basePrice.add(customFee);
            BigDecimal total = unitPriceWithCustom.multiply(BigDecimal.valueOf(item.getQuantity()));

            String image = !item.getProduct().getImages().isEmpty() ? item.getProduct().getImages().get(0).getImageUrl() : "";

            return CartDTO.ItemResponse.builder()
                    .id(item.getId())
                    .productId(item.getProduct().getId())
                    .productName(item.getProduct().getName())
                    .productSlug(item.getProduct().getSlug())
                    .productImage(image)
                    .variantId(item.getVariant().getId())
                    .variantName(item.getVariant().getVariantName())
                    .unitPrice(unitPriceWithCustom)
                    .quantity(item.getQuantity())
                    .totalPrice(total)
                    .customMessage(item.getCustomMessage())
                    .specialInstructions(item.getSpecialInstructions())
                    .isEggless(item.isEggless())
                    .isGiftWrapped(item.isGiftWrapped())
                    .customizationFee(customFee)
                    .build();
        }).collect(Collectors.toList());

        BigDecimal subtotal = items.stream()
                .map(CartDTO.ItemResponse::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int totalCount = items.stream().mapToInt(CartDTO.ItemResponse::getQuantity).sum();

        return CartDTO.Response.builder()
                .id(cart.getId())
                .items(items)
                .subtotal(subtotal)
                .itemCount(totalCount)
                .build();
    }

    private String sanitizeString(String input, int maxLen) {
        if (input == null) return null;
        String clean = input.replaceAll("<[^>]*>", "").trim();
        if (clean.isEmpty()) return null;
        return clean.length() > maxLen ? clean.substring(0, maxLen) : clean;
    }
}
