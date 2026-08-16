package com.dhakshubakes.controller;

import com.dhakshubakes.dto.AdminDashboardDTO;
import com.dhakshubakes.dto.ApiResponse;
import com.dhakshubakes.dto.OrderDTO;
import com.dhakshubakes.dto.ReviewDTO;
import com.dhakshubakes.entity.*;
import com.dhakshubakes.repository.*;
import com.dhakshubakes.service.AdminService;
import com.dhakshubakes.service.CouponService;
import com.dhakshubakes.service.OrderService;
import com.dhakshubakes.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final InventoryRepository inventoryRepository;
    private final CouponRepository couponRepository;
    private final WholesaleInquiryRepository wholesaleRepository;
    private final ContactInquiryRepository contactRepository;
    private final OrderService orderService;
    private final ReviewService reviewService;
    private final CouponService couponService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<AdminDashboardDTO>> getDashboard() {
        return ResponseEntity.ok(adminService.getDashboardMetrics());
    }

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<List<OrderDTO.Response>>> getAllOrders() {
        List<OrderDTO.Response> orders = orderRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(orderService::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("All orders retrieved", orders));
    }

    @GetMapping("/orders/export-csv")
    public ResponseEntity<String> exportOrdersCsv() {
        String csvData = adminService.exportOrdersCsv();
        return ResponseEntity.ok()
                .header("Content-Type", "text/csv")
                .header("Content-Disposition", "attachment; filename=\"dhakshu_bakes_orders.csv\"")
                .body(csvData);
    }

    @PutMapping("/orders/{orderId}/status")
    public ResponseEntity<ApiResponse<OrderDTO.Response>> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> body) {
        OrderStatus status = OrderStatus.valueOf(body.get("status"));
        return ResponseEntity.ok(adminService.updateOrderStatus(orderId, status));
    }

    @GetMapping("/customers")
    public ResponseEntity<ApiResponse<List<User>>> getAllCustomers() {
        return ResponseEntity.ok(ApiResponse.success("Customers retrieved", userRepository.findAll()));
    }

    @GetMapping("/inventory")
    public ResponseEntity<ApiResponse<List<Inventory>>> getInventory() {
        return ResponseEntity.ok(ApiResponse.success("Inventory list fetched", inventoryRepository.findAll()));
    }

    @PutMapping("/inventory/{variantId}")
    public ResponseEntity<ApiResponse<Inventory>> updateStock(
            @PathVariable Long variantId,
            @RequestBody Map<String, Integer> body) {
        Integer stock = body.get("stockQuantity");
        return ResponseEntity.ok(adminService.updateInventoryStock(variantId, stock));
    }

    @GetMapping("/reviews")
    public ResponseEntity<ApiResponse<List<ReviewDTO.Response>>> getAllReviews() {
        return ResponseEntity.ok(reviewService.getAllReviewsForAdmin());
    }

    @PutMapping("/reviews/{reviewId}/status")
    public ResponseEntity<ApiResponse<ReviewDTO.Response>> updateReviewStatus(
            @PathVariable Long reviewId,
            @RequestBody Map<String, String> body) {
        String status = body.get("status");
        return ResponseEntity.ok(reviewService.updateReviewStatus(reviewId, status));
    }

    @DeleteMapping("/reviews/{reviewId}")
    public ResponseEntity<ApiResponse<Void>> deleteReview(@PathVariable Long reviewId) {
        return ResponseEntity.ok(reviewService.deleteReview(reviewId));
    }

    @GetMapping("/coupons")
    public ResponseEntity<ApiResponse<List<Coupon>>> getAllCoupons() {
        return ResponseEntity.ok(ApiResponse.success("Coupons fetched", couponRepository.findAll()));
    }

    @PostMapping("/coupons")
    public ResponseEntity<ApiResponse<Coupon>> createCoupon(@RequestBody Coupon coupon) {
        return ResponseEntity.ok(ApiResponse.success("Coupon created", couponRepository.save(coupon)));
    }

    @PutMapping("/coupons/{id}")
    public ResponseEntity<ApiResponse<Coupon>> updateCoupon(@PathVariable Long id, @RequestBody Coupon coupon) {
        return ResponseEntity.ok(couponService.updateCoupon(id, coupon));
    }

    @DeleteMapping("/coupons/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCoupon(@PathVariable Long id) {
        return ResponseEntity.ok(couponService.deleteCoupon(id));
    }

    @GetMapping("/wholesale")
    public ResponseEntity<ApiResponse<List<WholesaleInquiry>>> getWholesaleInquiries() {
        return ResponseEntity.ok(ApiResponse.success("Wholesale inquiries fetched", wholesaleRepository.findAllByOrderByCreatedAtDesc()));
    }

    @GetMapping("/contact")
    public ResponseEntity<ApiResponse<List<ContactInquiry>>> getContactInquiries() {
        return ResponseEntity.ok(ApiResponse.success("Contact inquiries fetched", contactRepository.findAllByOrderByCreatedAtDesc()));
    }
}
