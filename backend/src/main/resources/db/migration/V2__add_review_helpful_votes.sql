-- Flyway Migration V2: Add Review Helpful Count & Per-User Helpful Votes Table

-- 1. Ensure helpful_count column exists on reviews table
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS helpful_count INT NOT NULL DEFAULT 0;

-- 2. Create review_helpful_votes table with unique constraint on (user_id, review_id)
CREATE TABLE IF NOT EXISTS review_helpful_votes (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    review_id BIGINT NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_review_helpful_vote UNIQUE (user_id, review_id)
);
