package com.dhakshubakes.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardDTO {
    private BigDecimal totalSales;
    private BigDecimal todaySales;
    private BigDecimal monthlySales;
    private Long totalOrders;
    private Long pendingOrders;
    private Long totalCustomers;
    private Long totalProducts;
    private Long lowStockCount;
    private List<ProductDTO.Response> topSellingProducts;
    private List<OrderDTO.Response> recentOrders;
    private List<RevenueDataPoint> revenueChart;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RevenueDataPoint {
        private String date;
        private BigDecimal revenue;
        private Long orderCount;
    }
}
