package com.sbms.trading_service.service;

import com.sbms.trading_service.dto.*;
import com.sbms.trading_service.entity.Product;
import com.sbms.trading_service.entity.Transaction;
import com.sbms.trading_service.enums.TransactionType;
import com.sbms.trading_service.repository.ProductRepository;
import com.sbms.trading_service.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardServiceImpl implements DashboardService {

    private final TransactionRepository transactionRepository;
    private final ProductRepository productRepository;
    private final RestTemplate restTemplate;

    @Value("${smart-ops.service.url:http://localhost:5002}")
    private String smartOpsServiceUrl;

    @Override
    public DashboardSummaryDto getDashboardSummary(UUID businessId, String period) {
        log.info("Generating dashboard summary for businessId: {} with period: {}", businessId, period);

        // Calculate date range based on period
        DateRange dateRange = calculateDateRange(period);

        // Fetch all transactions for the period
        List<Transaction> transactions = transactionRepository
                .findByBusinessIdAndPartyNameContainingIgnoreCaseAndDateBetweenOrderByDateDesc(
                        businessId, "", dateRange.start, dateRange.end);

        // Generate stats
        DashboardStatsDto stats = generateStats(businessId, transactions);

        // Generate chart data
        List<ChartDataPointDto> chartData = generateChartData(transactions, period);

        // Generate recent transactions (top 5)
        List<RecentTransactionDto> recentTransactions = generateRecentTransactions(transactions);

        // Get low stock items
        List<LowStockItemDto> lowStockItems = getLowStockItems(businessId);

        return DashboardSummaryDto.builder()
                .stats(stats)
                .chartData(chartData)
                .recentTransactions(recentTransactions)
                .lowStockItems(lowStockItems)
                .build();
    }

    private DashboardStatsDto generateStats(UUID businessId, List<Transaction> transactions) {
        LocalDate today = LocalDate.now();

        // Filter today's sales transactions
        List<Transaction> todaysTransactions = transactions.stream()
                .filter(t -> t.getDate().equals(today))
                .filter(t -> t.getType() == TransactionType.SALE)
                .toList();

        // Calculate today's sales
        BigDecimal todaysSales = todaysTransactions.stream()
                .map(Transaction::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Total bills count for today
        int totalBills = todaysTransactions.size();

        // Get low stock items count
        List<Product> products = productRepository.findAllByBusinessId(businessId);
        int lowStockCount = (int) products.stream()
                .filter(p -> p.getCurrentStock().compareTo(p.getMinStock()) <= 0)
                .count();

        // Get active offers count from service-smart-ops
        int activeOffers = getActiveOffersCount(businessId);

        // Calculate sales trend (compare with yesterday)
        LocalDate yesterday = today.minusDays(1);
        BigDecimal yesterdaysSales = transactions.stream()
                .filter(t -> t.getDate().equals(yesterday))
                .filter(t -> t.getType() == TransactionType.SALE)
                .map(Transaction::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        String salesTrend = calculateTrend(todaysSales, yesterdaysSales);

        // Calculate daily average (last 30 days)
        BigDecimal dailyAverage = calculateDailyAverage(transactions);

        return DashboardStatsDto.builder()
                .todaysSales(todaysSales)
                .salesTrend(salesTrend)
                .totalBills(totalBills)
                .dailyAverage(dailyAverage)
                .lowStockItems(lowStockCount)
                .activeOffers(activeOffers)
                .build();
    }

    private int getActiveOffersCount(UUID businessId) {
        try {
            // Use the internal count endpoint that doesn't require authentication
            String url = smartOpsServiceUrl + "/api/smart-ops/offers/count/" + businessId;
            log.info("Calling smart-ops service at: {}", url);
            
            // Make HTTP call to service-smart-ops internal endpoint
            Map<String, Integer> response = restTemplate.getForObject(url, Map.class);
            
            if (response != null && response.containsKey("count")) {
                int count = response.get("count");
                log.info("Active offers count: {}", count);
                return count;
            }
            return 0;
        } catch (Exception e) {
            log.error("Error fetching active offers count from smart-ops service: {}", e.getMessage());
            return 0; // Return 0 if service is down
        }
    }

    private String calculateTrend(BigDecimal today, BigDecimal yesterday) {
        if (yesterday.compareTo(BigDecimal.ZERO) == 0) {
            return today.compareTo(BigDecimal.ZERO) > 0 ? "+100%" : "0%";
        }

        BigDecimal difference = today.subtract(yesterday);
        BigDecimal percentChange = difference
                .divide(yesterday, 4, RoundingMode.HALF_UP)
                .multiply(new BigDecimal(100))
                .setScale(1, RoundingMode.HALF_UP);

        return (percentChange.compareTo(BigDecimal.ZERO) >= 0 ? "+" : "") + percentChange + "%";
    }

    private BigDecimal calculateDailyAverage(List<Transaction> transactions) {
        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        
        BigDecimal totalSales = transactions.stream()
                .filter(t -> t.getDate().isAfter(thirtyDaysAgo.minusDays(1)))
                .filter(t -> t.getType() == TransactionType.SALE)
                .map(Transaction::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return totalSales.divide(new BigDecimal(30), 2, RoundingMode.HALF_UP);
    }

    private List<ChartDataPointDto> generateChartData(List<Transaction> transactions, String period) {
        List<Transaction> salesTransactions = transactions.stream()
                .filter(t -> t.getType() == TransactionType.SALE)
                .toList();

        return switch (period.toLowerCase()) {
            case "today" -> generateHourlyData(salesTransactions);
            case "yesterday" -> generateHourlyDataForYesterday(salesTransactions);
            case "this_week" -> generateDailyData(salesTransactions, LocalDate.now().with(TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY)));
            case "last_week" -> generateDailyData(salesTransactions, LocalDate.now().minusWeeks(1).with(TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY)));
            case "this_month" -> generateWeeklyData(salesTransactions, LocalDate.now().withDayOfMonth(1));
            default -> generateHourlyData(salesTransactions);
        };
    }

    private List<ChartDataPointDto> generateHourlyData(List<Transaction> transactions) {
        LocalDate today = LocalDate.now();
        Map<Integer, BigDecimal> hourlySales = new HashMap<>();

        // Initialize all hours
        for (int hour = 0; hour < 24; hour++) {
            hourlySales.put(hour, BigDecimal.ZERO);
        }

        // Aggregate sales by hour
        transactions.stream()
                .filter(t -> t.getDate().equals(today))
                .forEach(t -> {
                    int hour = t.getCreatedAt().getHour();
                    hourlySales.merge(hour, t.getTotalAmount(), BigDecimal::add);
                });

        // Convert to chart data (show only business hours or all 24 hours)
        List<ChartDataPointDto> chartData = new ArrayList<>();
        for (int hour = 0; hour < 24; hour++) {
            String label = String.format("%d %s", 
                hour == 0 ? 12 : (hour > 12 ? hour - 12 : hour),
                hour < 12 ? "AM" : "PM");
            
            chartData.add(ChartDataPointDto.builder()
                    .name(label)
                    .sales(hourlySales.get(hour))
                    .build());
        }

        return chartData;
    }

    private List<ChartDataPointDto> generateHourlyDataForYesterday(List<Transaction> transactions) {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        Map<Integer, BigDecimal> hourlySales = new HashMap<>();

        for (int hour = 0; hour < 24; hour++) {
            hourlySales.put(hour, BigDecimal.ZERO);
        }

        transactions.stream()
                .filter(t -> t.getDate().equals(yesterday))
                .forEach(t -> {
                    int hour = t.getCreatedAt().getHour();
                    hourlySales.merge(hour, t.getTotalAmount(), BigDecimal::add);
                });

        List<ChartDataPointDto> chartData = new ArrayList<>();
        for (int hour = 0; hour < 24; hour++) {
            String label = String.format("%d %s", 
                hour == 0 ? 12 : (hour > 12 ? hour - 12 : hour),
                hour < 12 ? "AM" : "PM");
            
            chartData.add(ChartDataPointDto.builder()
                    .name(label)
                    .sales(hourlySales.get(hour))
                    .build());
        }

        return chartData;
    }

    private List<ChartDataPointDto> generateDailyData(List<Transaction> transactions, LocalDate weekStart) {
        LocalDate weekEnd = weekStart.plusDays(6);
        Map<LocalDate, BigDecimal> dailySales = new HashMap<>();

        // Initialize all days of the week
        for (int i = 0; i < 7; i++) {
            dailySales.put(weekStart.plusDays(i), BigDecimal.ZERO);
        }

        // Aggregate sales by day
        transactions.stream()
                .filter(t -> !t.getDate().isBefore(weekStart) && !t.getDate().isAfter(weekEnd))
                .forEach(t -> dailySales.merge(t.getDate(), t.getTotalAmount(), BigDecimal::add));

        // Convert to chart data
        List<ChartDataPointDto> chartData = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("EEE"); // Mon, Tue, etc.
        
        for (int i = 0; i < 7; i++) {
            LocalDate day = weekStart.plusDays(i);
            chartData.add(ChartDataPointDto.builder()
                    .name(day.format(formatter))
                    .sales(dailySales.get(day))
                    .build());
        }

        return chartData;
    }

    private List<ChartDataPointDto> generateWeeklyData(List<Transaction> transactions, LocalDate monthStart) {
        LocalDate monthEnd = monthStart.with(TemporalAdjusters.lastDayOfMonth());
        List<ChartDataPointDto> chartData = new ArrayList<>();

        int weekNumber = 1;
        LocalDate weekStart = monthStart;

        while (!weekStart.isAfter(monthEnd)) {
            LocalDate weekEnd = weekStart.plusDays(6);
            if (weekEnd.isAfter(monthEnd)) {
                weekEnd = monthEnd;
            }

            LocalDate finalWeekStart = weekStart;
            LocalDate finalWeekEnd = weekEnd;

            BigDecimal weekSales = transactions.stream()
                    .filter(t -> !t.getDate().isBefore(finalWeekStart) && !t.getDate().isAfter(finalWeekEnd))
                    .map(Transaction::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            chartData.add(ChartDataPointDto.builder()
                    .name("Week " + weekNumber)
                    .sales(weekSales)
                    .build());

            weekStart = weekEnd.plusDays(1);
            weekNumber++;
        }

        return chartData;
    }

    private List<RecentTransactionDto> generateRecentTransactions(List<Transaction> transactions) {
        return transactions.stream()
                .limit(10) // Get top 10 most recent
                .map(t -> RecentTransactionDto.builder()
                        .id("#TRX-" + t.getId())
                        .customer(t.getPartyName() != null ? t.getPartyName() : "Walk-in Customer")
                        .type(t.getType() == TransactionType.SALE ? "Sale" : "Purchase")
                        .time(formatTimeAgo(t.getCreatedAt()))
                        .status(determineStatus(t))
                        .amount(t.getTotalAmount())
                        .build())
                .collect(Collectors.toList());
    }

    private String formatTimeAgo(LocalDateTime dateTime) {
        Duration duration = Duration.between(dateTime, LocalDateTime.now());

        long hours = duration.toHours();
        long minutes = duration.toMinutes();
        long days = duration.toDays();

        if (days > 0) {
            return days + " day" + (days > 1 ? "s" : "") + " ago";
        } else if (hours > 0) {
            return hours + " hour" + (hours > 1 ? "s" : "") + " ago";
        } else if (minutes > 0) {
            return minutes + " min" + (minutes > 1 ? "s" : "") + " ago";
        } else {
            return "Just now";
        }
    }

    private String determineStatus(Transaction transaction) {
        BigDecimal totalAmount = transaction.getTotalAmount();
        BigDecimal paidAmount = transaction.getPaidAmount() != null ? transaction.getPaidAmount() : BigDecimal.ZERO;

        if (paidAmount.compareTo(totalAmount) >= 0) {
            return "Paid";
        } else {
            return "Pending";
        }
    }

    private List<LowStockItemDto> getLowStockItems(UUID businessId) {
        List<Product> products = productRepository.findAllByBusinessId(businessId);

        return products.stream()
                .filter(p -> p.getCurrentStock().compareTo(p.getMinStock()) <= 0)
                .limit(5) // Top 5 low stock items
                .map(p -> LowStockItemDto.builder()
                        .id(p.getId())
                        .name(p.getName())
                        .current(p.getCurrentStock())
                        .min(p.getMinStock())
                        .unit(p.getUnit().getSymbol())
                        .build())
                .collect(Collectors.toList());
    }

    private DateRange calculateDateRange(String period) {
        LocalDate today = LocalDate.now();
        LocalDate start, end;

        switch (period.toLowerCase()) {
            case "today":
                start = today;
                end = today;
                break;
            case "yesterday":
                start = today.minusDays(1);
                end = today.minusDays(1);
                break;
            case "this_week":
                start = today.with(TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY));
                end = today;
                break;
            case "last_week":
                start = today.minusWeeks(1).with(TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY));
                end = start.plusDays(6);
                break;
            case "this_month":
                start = today.withDayOfMonth(1);
                end = today;
                break;
            default:
                start = today;
                end = today;
        }

        return new DateRange(start, end);
    }

    private record DateRange(LocalDate start, LocalDate end) {}
}
