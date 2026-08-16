package com.dhakshubakes.repository;

import com.dhakshubakes.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findBySlug(String slug);

    List<Product> findByIsActiveTrue();
    List<Product> findByIsFeaturedTrueAndIsActiveTrue();
    List<Product> findByIsBestsellerTrueAndIsActiveTrue();
    List<Product> findByIsSeasonalTrueAndIsActiveTrue();
    List<Product> findByCategoryIdAndIsActiveTrue(Long categoryId);
    List<Product> findByCategorySlugAndIsActiveTrue(String categorySlug);

    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN p.category c WHERE p.isActive = true AND " +
           "(:query IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.ingredients) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "(:categorySlug IS NULL OR c.slug = :categorySlug) AND " +
           "(:isEggless IS NULL OR p.isEggless = :isEggless) AND " +
           "(:isFeatured IS NULL OR p.isFeatured = :isFeatured) AND " +
           "(:isBestseller IS NULL OR p.isBestseller = :isBestseller)")
    List<Product> searchProducts(@Param("query") String query,
                                 @Param("categorySlug") String categorySlug,
                                 @Param("isEggless") Boolean isEggless,
                                 @Param("isFeatured") Boolean isFeatured,
                                 @Param("isBestseller") Boolean isBestseller);
}
