package com.dhakshubakes.controller;

import com.dhakshubakes.dto.AdminDashboardDTO;
import com.dhakshubakes.dto.ApiResponse;
import com.dhakshubakes.dto.OrderDTO;
import com.dhakshubakes.dto.ProductDTO;
import com.dhakshubakes.entity.*;
import com.dhakshubakes.repository.*;
import com.dhakshubakes.service.AdminService;
import com.dhakshubakes.service.OrderService;
import com.dhakshubakes.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
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
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final InventoryRepository inventoryRepository;
    private final CouponRepository couponRepository;
    private final ReviewRepository reviewRepository;
    private final WholesaleInquiryRepository wholesaleRepository;
    private final ContactInquiryRepository contactRepository;
    private final OrderService orderService;
    private final ProductService productService;

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

    @GetMapping("/coupons")
    public ResponseEntity<ApiResponse<List<Coupon>>> getAllCoupons() {
        return ResponseEntity.ok(ApiResponse.success("Coupons fetched", couponRepository.findAll()));
    }

    @PostMapping("/coupons")
    public ResponseEntity<ApiResponse<Coupon>> createCoupon(@RequestBody Coupon coupon) {
        return ResponseEntity.ok(ApiResponse.success("Coupon created", couponRepository.save(coupon)));
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
