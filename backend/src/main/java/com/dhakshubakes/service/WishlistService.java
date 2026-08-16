package com.dhakshubakes.service;

import com.dhakshubakes.dto.ApiResponse;
import com.dhakshubakes.dto.ProductDTO;
import com.dhakshubakes.dto.WishlistDTO;
import com.dhakshubakes.entity.Product;
import com.dhakshubakes.entity.User;
import com.dhakshubakes.entity.Wishlist;
import com.dhakshubakes.entity.WishlistItem;
import com.dhakshubakes.repository.ProductRepository;
import com.dhakshubakes.repository.UserRepository;
import com.dhakshubakes.repository.WishlistRepository;
import com.dhakshubakes.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ProductService productService;

    @Transactional
    public ApiResponse<WishlistDTO.Response> getWishlist(UserPrincipal userPrincipal) {
        Wishlist wishlist = getWishlistEntity(userPrincipal);
        return ApiResponse.success("Wishlist fetched", mapToResponse(wishlist));
    }

    @Transactional
    public ApiResponse<WishlistDTO.Response> addProductToWishlist(UserPrincipal userPrincipal, Long productId) {
        Wishlist wishlist = getWishlistEntity(userPrincipal);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        boolean exists = wishlist.getItems().stream()
                .anyMatch(item -> item.getProduct().getId().equals(productId));

        if (!exists) {
            WishlistItem item = WishlistItem.builder()
                    .wishlist(wishlist)
                    .product(product)
                    .build();
            wishlist.getItems().add(item);
            wishlistRepository.save(wishlist);
        }

        return ApiResponse.success("Product added to wishlist", mapToResponse(wishlist));
    }

    @Transactional
    public ApiResponse<WishlistDTO.Response> removeProductFromWishlist(UserPrincipal userPrincipal, Long productId) {
        Wishlist wishlist = getWishlistEntity(userPrincipal);
        wishlist.getItems().removeIf(item -> item.getProduct().getId().equals(productId));
        Wishlist saved = wishlistRepository.save(wishlist);
        return ApiResponse.success("Product removed from wishlist", mapToResponse(saved));
    }

    private Wishlist getWishlistEntity(UserPrincipal userPrincipal) {
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return wishlistRepository.findByUserId(user.getId())
                .orElseGet(() -> wishlistRepository.save(Wishlist.builder().user(user).items(new ArrayList<>()).build()));
    }

    private WishlistDTO.Response mapToResponse(Wishlist wishlist) {
        List<ProductDTO.Response> products = wishlist.getItems().stream()
                .map(item -> productService.mapToResponse(item.getProduct()))
                .collect(Collectors.toList());

        return WishlistDTO.Response.builder()
                .id(wishlist.getId())
                .products(products)
                .build();
    }
}
