package com.meena.carbon_backend.service;

import com.meena.carbon_backend.dto.AnalyticsResponse;
import com.meena.carbon_backend.entity.Activity;
import com.meena.carbon_backend.repository.ActivityRepository;

import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class AnalyticsService {

    private final ActivityRepository activityRepository;

    public AnalyticsService(
            ActivityRepository activityRepository) {

        this.activityRepository = activityRepository;
    }

    // =========================================================
    // DAILY ANALYTICS
    // =========================================================

    public List<AnalyticsResponse> getDailyAnalytics(
            String email,
            LocalDate date) {

        return getDailyAnalytics(
                email,
                date,
                "All"
        );
    }

    // DAILY ANALYTICS WITH CATEGORY FILTER
    public List<AnalyticsResponse> getDailyAnalytics(
            String email,
            LocalDate date,
            String category) {

        List<Activity> activities =
                activityRepository.findByUserEmailAndDate(
                        email,
                        date
                );

        activities =
                filterByCategory(
                        activities,
                        category
                );

        return aggregateActivities(activities);
    }


    // =========================================================
    // WEEKLY ANALYTICS
    // =========================================================

    public List<AnalyticsResponse> getWeeklyAnalytics(
            String email,
            LocalDate date) {

        return getWeeklyAnalytics(
                email,
                date,
                "All"
        );
    }

    // WEEKLY ANALYTICS WITH CATEGORY FILTER
    public List<AnalyticsResponse> getWeeklyAnalytics(
            String email,
            LocalDate date,
            String category) {

        LocalDate startOfWeek =
                date.with(DayOfWeek.MONDAY);

        LocalDate endOfWeek =
                startOfWeek.plusDays(6);

        List<Activity> activities =
                activityRepository.findByUserEmailAndDateBetween(
                        email,
                        startOfWeek,
                        endOfWeek
                );

        activities =
                filterByCategory(
                        activities,
                        category
                );

        return aggregateActivities(activities);
    }


    // =========================================================
    // MONTHLY ANALYTICS
    // =========================================================

    public List<AnalyticsResponse> getMonthlyAnalytics(
            String email,
            int year,
            int month) {

        return getMonthlyAnalytics(
                email,
                year,
                month,
                "All"
        );
    }

    // MONTHLY ANALYTICS WITH CATEGORY FILTER
    public List<AnalyticsResponse> getMonthlyAnalytics(
            String email,
            int year,
            int month,
            String category) {

        LocalDate startOfMonth =
                LocalDate.of(
                        year,
                        month,
                        1
                );

        LocalDate endOfMonth =
                startOfMonth.withDayOfMonth(
                        startOfMonth.lengthOfMonth()
                );

        List<Activity> activities =
                activityRepository.findByUserEmailAndDateBetween(
                        email,
                        startOfMonth,
                        endOfMonth
                );

        activities =
                filterByCategory(
                        activities,
                        category
                );

        return aggregateActivities(activities);
    }


    // =========================================================
    // DATE TO DATE ANALYTICS
    // =========================================================

    public List<AnalyticsResponse> getDateRangeAnalytics(
            String email,
            LocalDate fromDate,
            LocalDate toDate) {

        return getDateRangeAnalytics(
                email,
                fromDate,
                toDate,
                "All"
        );
    }

    // DATE TO DATE WITH CATEGORY FILTER
    public List<AnalyticsResponse> getDateRangeAnalytics(
            String email,
            LocalDate fromDate,
            LocalDate toDate,
            String category) {

        List<Activity> activities =
                activityRepository.findByUserEmailAndDateBetween(
                        email,
                        fromDate,
                        toDate
                );

        activities =
                filterByCategory(
                        activities,
                        category
                );

        return aggregateActivities(activities);
    }


    // =========================================================
    // CATEGORY FILTER
    // =========================================================

    private List<Activity> filterByCategory(
            List<Activity> activities,
            String selectedCategory) {

        // No filter
        if (selectedCategory == null ||
                selectedCategory.trim().isEmpty() ||
                selectedCategory.equalsIgnoreCase("All") ||
                selectedCategory.equalsIgnoreCase("All Categories")) {

            return activities;
        }

        String normalizedCategory =
                normalizeCategory(
                        selectedCategory
                );

        List<Activity> filteredActivities =
                new ArrayList<>();

        for (Activity activity : activities) {

            String activityCategory =
                    activity.getCategory();

            if (activityCategory == null ||
                    activityCategory.trim().isEmpty()) {

                activityCategory = "Other";
            }

            String normalizedActivityCategory =
                    normalizeCategory(
                            activityCategory
                    );

            if (normalizedActivityCategory.equalsIgnoreCase(
                    normalizedCategory)) {

                filteredActivities.add(activity);
            }
        }

        return filteredActivities;
    }


    // =========================================================
    // NORMALIZE CATEGORY
    // =========================================================
    /*
     * Handles frontend/backend naming differences.
     *
     * Frontend:
     * Transportation
     *
     * Backend/database:
     * Transport
     *
     * Both will be treated as Transport.
     */

    private String normalizeCategory(
            String category) {

        if (category == null ||
                category.trim().isEmpty()) {

            return "Other";
        }

        String value =
                category.trim();

        switch (value.toLowerCase()) {

            case "transport":
            case "transportation":
                return "Transport";

            case "electricity":
            case "energy":
                return "Electricity";

            case "food":
                return "Food";

            case "shopping":
                return "Shopping";

            case "waste":
                return "Waste";

            case "other":
                return "Other";

            default:
                return value;
        }
    }


    // =========================================================
    // COMMON AGGREGATION
    // =========================================================

    private List<AnalyticsResponse> aggregateActivities(
            List<Activity> activities) {

        /*
         * We group activities using:
         *
         * DATE + CATEGORY
         *
         * Example:
         *
         * 2026-09-03 + Transport
         * 2026-09-03 + Food
         * 2026-09-04 + Transport
         */

        Map<String, Double> aggregatedData =
                new LinkedHashMap<>();

        Map<String, String> categoryMap =
                new LinkedHashMap<>();

        Map<String, String> dateMap =
                new LinkedHashMap<>();

        for (Activity activity : activities) {

            LocalDate activityDate =
                    activity.getDate();

            String category =
                    activity.getCategory();

            if (category == null ||
                    category.trim().isEmpty()) {

                category = "Other";
            }

            if (activityDate == null) {
                continue;
            }

            double emission =
                    activity.getEmission();

            String date =
                    activityDate.toString();

            String key =
                    date + "|" + category;

            aggregatedData.put(
                    key,
                    aggregatedData.getOrDefault(
                            key,
                            0.0
                    ) + emission
            );

            categoryMap.put(
                    key,
                    category
            );

            dateMap.put(
                    key,
                    date
            );
        }


        // =====================================================
        // CONVERT MAP TO RESPONSE LIST
        // =====================================================

        List<AnalyticsResponse> response =
                new ArrayList<>();

        for (String key :
                aggregatedData.keySet()) {

            double totalEmission =
                    aggregatedData.get(key);

            String date =
                    dateMap.get(key);

            String category =
                    categoryMap.get(key);

            response.add(
                    new AnalyticsResponse(
                            date,
                            category,
                            roundToTwoDecimals(
                                    totalEmission
                            )
                    )
            );
        }

        return response;
    }


    // =========================================================
    // ROUND EMISSION
    // =========================================================

    private double roundToTwoDecimals(
            double value) {

        return Math.round(
                value * 100.0
        ) / 100.0;
    }
}