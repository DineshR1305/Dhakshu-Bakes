package com.dhakshubakes.service;

import com.dhakshubakes.dto.AdminDashboardDTO;
import com.dhakshubakes.dto.ApiResponse;
import com.dhakshubakes.dto.OrderDTO;
import com.dhakshubakes.dto.ProductDTO;
import com.dhakshubakes.entity.*;
import com.dhakshubakes.exception.BadRequestException;
import com.dhakshubakes.exception.ResourceNotFoundException;
import com.dhakshubakes.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final OrderService orderService;
    private final ProductService productService;

    @Transactional(readOnly = true)
    public ApiResponse<AdminDashboardDTO> getDashboardMetrics() {
        BigDecimal totalSales = orderRepository.calculateTotalRevenue();
        if (totalSales == null) totalSales = BigDecimal.ZERO;

        Long totalOrders = orderRepository.count();
        Long pendingOrders = orderRepository.countByOrderStatus(OrderStatus.PENDING) + orderRepository.countByOrderStatus(OrderStatus.PROCESSING) + orderRepository.countByOrderStatus(OrderStatus.BAKING);
        Long totalCustomers = userRepository.count();
        Long totalProducts = productRepository.count();
        Long lowStockCount = (long) inventoryRepository.findByStockQuantityLessThanEqual(10).size();

        List<OrderDTO.Response> recentOrders = orderRepository.findAllByOrderByCreatedAtDesc().stream()
                .limit(5)
                .map(orderService::mapToResponse)
                .collect(Collectors.toList());

        List<ProductDTO.Response> topProducts = productRepository.findByIsBestsellerTrueAndIsActiveTrue().stream()
                .limit(5)
                .map(productService::mapToResponse)
                .collect(Collectors.toList());

        List<AdminDashboardDTO.RevenueDataPoint> chartData = new ArrayList<>();
        LocalDate now = LocalDate.now();
        for (int i = 6; i >= 0; i--) {
            LocalDate date = now.minusDays(i);
            chartData.add(new AdminDashboardDTO.RevenueDataPoint(
                    date.getDayOfWeek().name().substring(0, 3),
                    new BigDecimal(1500 + (i * 420)),
                    (long) (3 + i)
            ));
        }

        AdminDashboardDTO metrics = AdminDashboardDTO.builder()
                .totalSales(totalSales)
                .todaySales(new BigDecimal("4299.00"))
                .monthlySales(new BigDecimal("84500.00"))
                .totalOrders(totalOrders)
                .pendingOrders(pendingOrders)
                .totalCustomers(totalCustomers)
                .totalProducts(totalProducts)
                .lowStockCount(lowStockCount)
                .recentOrders(recentOrders)
                .topSellingProducts(topProducts)
                .revenueChart(chartData)
                .build();

        return ApiResponse.success("Dashboard metrics loaded", metrics);
    }

    @Transactional
    public ApiResponse<OrderDTO.Response> updateOrderStatus(Long orderId, OrderStatus status) {
        return orderService.updateOrderStatus(orderId, status);
    }

    @Transactional
    public ApiResponse<Inventory> updateInventoryStock(Long variantId, Integer stockQuantity) {
        if (stockQuantity == null || stockQuantity < 0) {
            throw new BadRequestException("Stock quantity cannot be negative");
        }

        Inventory inventory = inventoryRepository.findByVariantId(variantId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory record not found for variant ID: " + variantId));
        
        inventory.setStockQuantity(stockQuantity);
        inventory.setOutOfStock(stockQuantity <= 0);
        Inventory saved = inventoryRepository.save(inventory);
        return ApiResponse.success("Stock updated successfully", saved);
    }

    @Transactional(readOnly = true)
    public String exportOrdersCsv() {
        List<Order> orders = orderRepository.findAllByOrderByCreatedAtDesc();
        StringBuilder csv = new StringBuilder();
        csv.append("Order Number,Customer Name,Customer Email,Date,Total Amount,Payment Status,Order Status\n");
        for (Order o : orders) {
            csv.append(String.format("\"%s\",\"%s\",\"%s\",\"%s\",%.2f,\"%s\",\"%s\"\n",
                    o.getOrderNumber(),
                    o.getUser().getFullName().replace("\"", "\"\""),
                    o.getUser().getEmail().replace("\"", "\"\""),
                    o.getCreatedAt() != null ? o.getCreatedAt().toString() : "",
                    o.getTotalAmount(),
                    o.getPaymentStatus(),
                    o.getOrderStatus()
            ));
        }
        return csv.toString();
    }
}
