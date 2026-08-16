package com.dhakshubakes.controller;

import com.dhakshubakes.dto.ApiResponse;
import com.dhakshubakes.entity.FAQ;
import com.dhakshubakes.entity.Store;
import com.dhakshubakes.repository.FAQRepository;
import com.dhakshubakes.repository.StoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/stores")
@RequiredArgsConstructor
public class StoreController {

    private final StoreRepository storeRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Store>>> getAllStores() {
        return ResponseEntity.ok(ApiResponse.success("Stores fetched", storeRepository.findAll()));
    }
}
