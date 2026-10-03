package com.meena.carbon_backend.controller;

import com.meena.carbon_backend.entity.Activity;
import com.meena.carbon_backend.entity.Role;
import com.meena.carbon_backend.entity.User;
import com.meena.carbon_backend.repository.ActivityRepository;
import com.meena.carbon_backend.repository.UserRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.*;

@RestController
@RequestMapping("/api/admin/dashboard")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminDashboardController {

    private final UserRepository userRepository;
    private final ActivityRepository activityRepository;

    public AdminDashboardController(
            UserRepository userRepository,
            ActivityRepository activityRepository) {

        this.userRepository = userRepository;
        this.activityRepository = activityRepository;
    }

    // =========================================================
    // GET ADMIN DASHBOARD DATA
    // GET /api/admin/dashboard
    // =========================================================

    @GetMapping
    public ResponseEntity<?> getDashboardData() {

        try {

            // =====================================================
            // USERS
            // =====================================================

            List<User> users = userRepository.findAll();

            long totalUsers = users.stream()
                    .filter(user ->
                            user.getRole() == null ||
                            user.getRole() == Role.USER)
                    .count();


            // =====================================================
            // ACTIVITIES
            // =====================================================

            List<Activity> activities =
                    activityRepository.findAll();


            // =====================================================
            // TOTAL ACTIVITIES
            // =====================================================

            long totalActivities =
                    activities.size();


            // =====================================================
            // TOTAL CARBON
            // =====================================================

            double totalCarbon = activities.stream()
                    .mapToDouble(Activity::getEmission)
                    .sum();


            // =====================================================
            // TODAY'S ACTIVITIES
            // =====================================================

            LocalDate today = LocalDate.now();

            long todayActivities = activities.stream()
                    .filter(activity ->
                            activity.getDate() != null &&
                            activity.getDate().equals(today))
                    .count();


            // =====================================================
            // MONTHLY CARBON TREND
            // CURRENT YEAR
            // =====================================================

            List<Map<String, Object>> monthlyCarbon =
                    new ArrayList<>();

            int currentYear = today.getYear();
            int currentMonth = today.getMonthValue();

            for (int monthNumber = 1;
                monthNumber <= currentMonth;
                monthNumber++) {

                // Make a final copy for use inside the stream
                final int selectedMonth = monthNumber;

                Month month = Month.of(selectedMonth);

                double monthEmission =
                        activities.stream()
                                .filter(activity ->
                                        activity.getDate() != null &&
                                        activity.getDate().getYear()
                                                == currentYear &&
                                        activity.getDate().getMonthValue()
                                                == selectedMonth
                                )
                                .mapToDouble(Activity::getEmission)
                                .sum();

                Map<String, Object> monthData =
                        new LinkedHashMap<>();

                monthData.put(
                        "month",
                        month.getDisplayName(
                                TextStyle.SHORT,
                                Locale.ENGLISH
                        )
                );

                monthData.put(
                        "carbon",
                        round(monthEmission)
                );

                monthlyCarbon.add(monthData);
            }

            // =====================================================
            // CARBON BY CATEGORY
            // =====================================================

            Map<String, Double> categoryTotals =
                    new LinkedHashMap<>();

            categoryTotals.put("Transport", 0.0);
            categoryTotals.put("Electricity", 0.0);
            categoryTotals.put("Food", 0.0);
            categoryTotals.put("Shopping", 0.0);
            categoryTotals.put("Other", 0.0);


            for (Activity activity : activities) {

                String category =
                        activity.getCategory();

                if (category == null ||
                        category.trim().isEmpty()) {

                    category = "Other";
                }

                String normalizedCategory =
                        category.trim();

                if (normalizedCategory.equalsIgnoreCase(
                        "Transport")) {

                    normalizedCategory = "Transport";

                } else if (normalizedCategory.equalsIgnoreCase(
                        "Electricity")) {

                    normalizedCategory = "Electricity";

                } else if (normalizedCategory.equalsIgnoreCase(
                        "Food")) {

                    normalizedCategory = "Food";

                } else if (normalizedCategory.equalsIgnoreCase(
                        "Shopping")) {

                    normalizedCategory = "Shopping";

                } else {

                    normalizedCategory = "Other";
                }

                categoryTotals.put(
                        normalizedCategory,
                        categoryTotals.get(normalizedCategory)
                                + activity.getEmission()
                );
            }


            // =====================================================
            // CATEGORY RESPONSE
            // =====================================================

            List<Map<String, Object>> categoryCarbon =
                    new ArrayList<>();

            for (Map.Entry<String, Double> entry :
                    categoryTotals.entrySet()) {

                Map<String, Object> categoryData =
                        new LinkedHashMap<>();

                categoryData.put(
                        "category",
                        entry.getKey()
                );

                categoryData.put(
                        "carbon",
                        round(entry.getValue())
                );

                categoryCarbon.add(categoryData);
            }


            // =====================================================
            // FINAL RESPONSE
            // =====================================================

            Map<String, Object> response =
                    new LinkedHashMap<>();

            response.put(
                    "totalUsers",
                    totalUsers
            );

            response.put(
                    "totalActivities",
                    totalActivities
            );

            response.put(
                    "totalCarbon",
                    round(totalCarbon)
            );

            response.put(
                    "todayActivities",
                    todayActivities
            );

            response.put(
                    "monthlyCarbon",
                    monthlyCarbon
            );

            response.put(
                    "categoryCarbon",
                    categoryCarbon
            );


            return ResponseEntity.ok(response);


        } catch (Exception e) {

            return ResponseEntity
                    .internalServerError()
                    .body(
                            "Unable to load admin dashboard: "
                                    + e.getMessage()
                    );
        }
    }


    // =========================================================
    // ROUND TO 2 DECIMAL PLACES
    // =========================================================

    private double round(double value) {

        return Math.round(value * 100.0) / 100.0;
    }
}