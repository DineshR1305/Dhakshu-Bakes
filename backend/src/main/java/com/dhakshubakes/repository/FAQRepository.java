package com.dhakshubakes.repository;

import com.dhakshubakes.entity.FAQ;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FAQRepository extends JpaRepository<FAQ, Long> {
    List<FAQ> findByCategoryOrderByDisplayOrderAsc(String category);
    List<FAQ> findAllByOrderByDisplayOrderAsc();
}
