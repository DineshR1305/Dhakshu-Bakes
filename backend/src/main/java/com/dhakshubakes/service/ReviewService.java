package com.dhakshubakes.service;

import com.dhakshubakes.dto.ApiResponse;
import com.dhakshubakes.dto.ReviewDTO;
import com.dhakshubakes.entity.OrderStatus;
import com.dhakshubakes.entity.Product;
import com.dhakshubakes.entity.Review;
import com.dhakshubakes.entity.User;
import com.dhakshubakes.exception.ResourceNotFoundException;
import com.dhakshubakes.repository.OrderRepository;
import com.dhakshubakes.repository.ProductRepository;
import com.dhakshubakes.repository.ReviewRepository;
import com.dhakshubakes.repository.UserRepository;
import com.dhakshubakes.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    @Transactional(readOnly = true)
    public ApiResponse<List<ReviewDTO.Response>> getProductReviews(Long productId) {
        List<ReviewDTO.Response> reviews = reviewRepository.findByProductIdAndStatusOrderByCreatedAtDesc(productId, "APPROVED").stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ApiResponse.success("Reviews fetched", reviews);
    }

    @Transactional
    public ApiResponse<ReviewDTO.Response> addReview(UserPrincipal userPrincipal, ReviewDTO.CreateRequest request) {
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        // Check if customer actually purchased and received the product
        boolean isVerified = orderRepository.existsByUserIdAndItemsProductIdAndOrderStatus(
                user.getId(), product.getId(), OrderStatus.DELIVERED
        );

        Review review = Review.builder()
                .product(product)
                .user(user)
                .rating(request.getRating())
                .reviewText(request.getReviewText())
                .imageUrl(request.getImageUrl())
                .isVerifiedPurchase(isVerified)
                .status("PENDING") // Default status for admin moderation
                .build();

        Review saved = reviewRepository.save(review);
        return ApiResponse.success("Review submitted for moderation. It will be visible once approved.", mapToResponse(saved));
    }

    @Transactional
    public ApiResponse<ReviewDTO.Response> updateReviewStatus(Long reviewId, String status) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with ID: " + reviewId));

        review.setStatus(status.toUpperCase());
        Review saved = reviewRepository.save(review);

        // Recalculate product rating & review count for approved reviews
        Product product = review.getProduct();
        List<Review> approvedReviews = reviewRepository.findByProductIdAndStatusOrderByCreatedAtDesc(product.getId(), "APPROVED");
        double avg = approvedReviews.stream().mapToInt(Review::getRating).average().orElse(5.0);
        product.setRatingAvg(Math.round(avg * 10.0) / 10.0);
        product.setReviewCount(approvedReviews.size());
        productRepository.save(product);

        return ApiResponse.success("Review status updated to " + status, mapToResponse(saved));
    }

    private ReviewDTO.Response mapToResponse(Review r) {
        return ReviewDTO.Response.builder()
                .id(r.getId())
                .productId(r.getProduct().getId())
                .productName(r.getProduct().getName())
                .userName(r.getUser().getFullName())
                .rating(r.getRating())
                .reviewText(r.getReviewText())
                .imageUrl(r.getImageUrl())
                .isVerifiedPurchase(r.isVerifiedPurchase())
                .status(r.getStatus())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
