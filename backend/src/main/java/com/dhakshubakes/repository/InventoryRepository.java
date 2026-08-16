package com.dhakshubakes.repository;

import com.dhakshubakes.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    Optional<Inventory> findByVariantId(Long variantId);
    List<Inventory> findByStockQuantityLessThanEqual(Integer threshold);
    List<Inventory> findByOutOfStockTrue();
}
