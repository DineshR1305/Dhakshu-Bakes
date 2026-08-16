package com.dhakshubakes.repository;

import com.dhakshubakes.entity.WholesaleInquiry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WholesaleInquiryRepository extends JpaRepository<WholesaleInquiry, Long> {
    List<WholesaleInquiry> findAllByOrderByCreatedAtDesc();
}
