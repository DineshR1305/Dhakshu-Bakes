package com.dhakshubakes.repository;

import com.dhakshubakes.entity.ReviewHelpfulVote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReviewHelpfulVoteRepository extends JpaRepository<ReviewHelpfulVote, Long> {
    boolean existsByUserIdAndReviewId(Long userId, Long reviewId);
}
