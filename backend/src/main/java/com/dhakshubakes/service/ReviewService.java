package com.dhakshubakes.service;

import com.dhakshubakes.dto.ApiResponse;
import com.dhakshubakes.dto.ReviewDTO;
import com.dhakshubakes.entity.OrderStatus;
import com.dhakshubakes.entity.Product;
import com.dhakshubakes.entity.Review;
import com.dhakshubakes.entity.ReviewHelpfulVote;
import com.dhakshubakes.entity.User;
import com.dhakshubakes.exception.BadRequestException;
import com.dhakshubakes.exception.ResourceNotFoundException;
import com.dhakshubakes.repository.OrderRepository;
import com.dhakshubakes.repository.ProductRepository;
import com.dhakshubakes.repository.ReviewHelpfulVoteRepository;
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
    private final ReviewHelpfulVoteRepository reviewHelpfulVoteRepository;

    @Transactional(readOnly = true)
    public ApiResponse<List<ReviewDTO.Response>> getProductReviews(Long productId) {
        List<ReviewDTO.Response> reviews = reviewRepository.findByProductIdAndStatusOrderByCreatedAtDesc(productId, "APPROVED").stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ApiResponse.success("Reviews fetched", reviews);
    }

    @Transactional(readOnly = true)
    public ApiResponse<ReviewDTO.RatingSummaryResponse> getRatingSummary(Long productId) {
        List<Review> approved = reviewRepository.findByProductIdAndStatusOrderByCreatedAtDesc(productId, "APPROVED");

        int five = 0, four = 0, three = 0, two = 0, one = 0;
        for (Review r : approved) {
            switch (r.getRating()) {
                case 5 -> five++;
                case 4 -> four++;
                case 3 -> three++;
                case 2 -> two++;
                case 1 -> one++;
            }
        }

        double avg = approved.stream().mapToInt(Review::getRating).average().orElse(5.0);
        double roundedAvg = Math.round(avg * 10.0) / 10.0;

        ReviewDTO.RatingSummaryResponse summary = ReviewDTO.RatingSummaryResponse.builder()
                .averageRating(roundedAvg)
                .totalReviews(approved.size())
                .fiveStarCount(five)
                .fourStarCount(four)
                .threeStarCount(three)
                .twoStarCount(two)
                .oneStarCount(one)
                .build();

        return ApiResponse.success("Rating summary fetched", summary);
    }

    @Transactional
    public ApiResponse<ReviewDTO.Response> addReview(UserPrincipal userPrincipal, ReviewDTO.CreateRequest request) {
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (reviewRepository.existsByUserIdAndProductId(user.getId(), product.getId())) {
            return ApiResponse.error("You have already submitted a review for this product", "DUPLICATE_REVIEW");
        }

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
                .helpfulCount(0)
                .status("PENDING") // Default status for admin moderation
                .build();

        Review saved = reviewRepository.save(review);
        return ApiResponse.success("Review submitted for moderation. It will be visible once approved.", mapToResponse(saved));
    }

    @Transactional
    public ApiResponse<ReviewDTO.Response> updateReview(UserPrincipal userPrincipal, Long reviewId, ReviewDTO.CreateRequest request) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with ID: " + reviewId));

        if (!review.getUser().getId().equals(userPrincipal.getId())) {
            return ApiResponse.error("Unauthorized to edit this review", "UNAUTHORIZED");
        }

        review.setRating(request.getRating());
        review.setReviewText(request.getReviewText());
        review.setImageUrl(request.getImageUrl());
        review.setStatus("PENDING"); // Requires re-moderation after editing

        Review saved = reviewRepository.save(review);
        return ApiResponse.success("Review updated and resubmitted for moderation", mapToResponse(saved));
    }

    @Transactional
    public ApiResponse<ReviewDTO.Response> markHelpful(UserPrincipal userPrincipal, Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with ID: " + reviewId));

        if (userPrincipal != null) {
            User user = userRepository.findById(userPrincipal.getId()).orElse(null);
            if (user != null) {
                boolean alreadyVoted = reviewHelpfulVoteRepository.existsByUserIdAndReviewId(user.getId(), review.getId());
                if (alreadyVoted) {
                    return ApiResponse.success("You have already voted this review as helpful", mapToResponse(review));
                }

                ReviewHelpfulVote vote = ReviewHelpfulVote.builder()
                        .user(user)
                        .review(review)
                        .build();
                reviewHelpfulVoteRepository.save(vote);
            }
        }

        review.setHelpfulCount((review.getHelpfulCount() != null ? review.getHelpfulCount() : 0) + 1);
        Review saved = reviewRepository.save(review);

        return ApiResponse.success("Marked as helpful", mapToResponse(saved));
    }

    @Transactional(readOnly = true)
    public ApiResponse<List<ReviewDTO.Response>> getAllReviewsForAdmin() {
        List<ReviewDTO.Response> reviews = reviewRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ApiResponse.success("All reviews fetched", reviews);
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

    @Transactional
    public ApiResponse<Void> deleteReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with ID: " + reviewId));
        reviewRepository.delete(review);
        return ApiResponse.success("Review deleted successfully", null);
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
                .helpfulCount(r.getHelpfulCount() != null ? r.getHelpfulCount() : 0)
                .createdAt(r.getCreatedAt())
                .build();
    }
}
