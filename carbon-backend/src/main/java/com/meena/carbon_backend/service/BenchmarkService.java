package com.meena.carbon_backend.service;

import com.meena.carbon_backend.dto.BenchmarkResponse;
import com.meena.carbon_backend.entity.Activity;
import com.meena.carbon_backend.repository.ActivityRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class BenchmarkService {

    private final ActivityRepository activityRepository;

    public BenchmarkService(
            ActivityRepository activityRepository) {

        this.activityRepository = activityRepository;
    }

    // =========================================================
    // MAIN BENCHMARK METHOD
    // =========================================================

    public BenchmarkResponse getBenchmark(
            String email,
            LocalDate fromDate,
            LocalDate toDate) {

        List<Activity> allActivities =
                activityRepository.findAllByOrderByDateDesc();

        // =====================================================
        // NORMALIZE CURRENT USER EMAIL
        // =====================================================

        String currentUserEmail =
                email == null
                        ? ""
                        : email.trim().toLowerCase();

        // =====================================================
        // FILTER ACTIVITIES BY DATE
        // =====================================================

        List<Activity> activities =
                new ArrayList<>();

        for (Activity activity : allActivities) {

            LocalDate activityDate =
                    activity.getDate();

            if (activityDate == null) {
                continue;
            }

            if (!activityDate.isBefore(fromDate)
                    && !activityDate.isAfter(toDate)) {

                activities.add(activity);
            }
        }

        // =====================================================
        // TOTAL EMISSION PER USER
        // =====================================================

        Map<String, Double> userEmissionMap =
                new HashMap<>();

        for (Activity activity : activities) {

            String activityEmail =
                    activity.getUserEmail();

            if (activityEmail == null
                    || activityEmail.trim().isEmpty()) {

                continue;
            }

            String normalizedEmail =
                    activityEmail.trim().toLowerCase();

            double currentEmission =
                    activity.getEmission();

            userEmissionMap.put(
                    normalizedEmail,
                    userEmissionMap.getOrDefault(
                            normalizedEmail,
                            0.0
                    ) + currentEmission
            );
        }

        // =====================================================
        // CURRENT USER TOTAL
        // =====================================================

        double userTotalEmission =
                userEmissionMap.getOrDefault(
                        currentUserEmail,
                        0.0
                );

        // =====================================================
        // TOTAL ACTIVE USERS
        // =====================================================

        int totalUsers =
                userEmissionMap.size();

        // =====================================================
        // PLATFORM TOTAL
        // =====================================================

        double platformTotalEmission = 0.0;

        for (double emission :
                userEmissionMap.values()) {

            platformTotalEmission += emission;
        }

        // =====================================================
        // PLATFORM AVERAGE
        // =====================================================

        double platformAverageEmission = 0.0;

        if (totalUsers > 0) {

            platformAverageEmission =
                    platformTotalEmission
                            / totalUsers;
        }

        // =====================================================
        // USER RANK
        // =====================================================
        //
        // Lower carbon emission = better rank
        //
        // Example:
        // User A = 8 kg  -> Rank 1
        // User B = 13 kg -> Rank 2
        // User C = 22 kg -> Rank 3
        //
        // =====================================================

        List<Map.Entry<String, Double>>
                sortedUsers =
                new ArrayList<>(
                        userEmissionMap.entrySet()
                );

        sortedUsers.sort(
                Comparator.comparingDouble(
                        Map.Entry::getValue
                )
        );

        int userRank = 0;

        if (userEmissionMap.containsKey(
                currentUserEmail)) {

            /*
             * Competition ranking:
             *
             * Rank = 1 + number of users
             * having LOWER emissions.
             *
             * This also handles equal emissions correctly.
             */

            userRank = 1;

            for (Map.Entry<String, Double> entry :
                    sortedUsers) {

                if (entry.getValue()
                        < userTotalEmission) {

                    userRank++;
                }
            }
        }

        // =====================================================
        // CATEGORY BENCHMARK
        // =====================================================

        Map<String, Double>
                userCategoryEmission =
                new LinkedHashMap<>();

        Map<String, Map<String, Double>>
                categoryUserEmission =
                new LinkedHashMap<>();

        for (Activity activity : activities) {

            String activityEmail =
                    activity.getUserEmail();

            if (activityEmail == null
                    || activityEmail.trim().isEmpty()) {

                continue;
            }

            String normalizedEmail =
                    activityEmail.trim().toLowerCase();

            String category =
                    normalizeCategory(
                            activity.getCategory()
                    );

            double emission =
                    activity.getEmission();

            // -------------------------------------------------
            // CURRENT USER CATEGORY EMISSION
            // -------------------------------------------------

            if (normalizedEmail.equals(
                    currentUserEmail)) {

                userCategoryEmission.put(
                        category,
                        userCategoryEmission.getOrDefault(
                                category,
                                0.0
                        ) + emission
                );
            }

            // -------------------------------------------------
            // CATEGORY → USER → EMISSION
            // -------------------------------------------------

            categoryUserEmission
                    .computeIfAbsent(
                            category,
                            key -> new HashMap<>()
                    )
                    .put(
                            normalizedEmail,
                            categoryUserEmission
                                    .get(category)
                                    .getOrDefault(
                                            normalizedEmail,
                                            0.0
                                    ) + emission
                    );
        }

        // =====================================================
        // BUILD CATEGORY RESULTS
        // =====================================================

        List<BenchmarkResponse.CategoryBenchmark>
                categoryBenchmarks =
                new ArrayList<>();

        for (Map.Entry<String,
                Map<String, Double>> entry :
                categoryUserEmission.entrySet()) {

            String category =
                    entry.getKey();

            Map<String, Double> users =
                    entry.getValue();

            // -------------------------------------------------
            // TOTAL CATEGORY EMISSION
            // -------------------------------------------------

            double totalCategoryEmission =
                    0.0;

            for (double emission :
                    users.values()) {

                totalCategoryEmission +=
                        emission;
            }

            // -------------------------------------------------
            // USERS WHO LOGGED THAT CATEGORY
            // -------------------------------------------------

            int categoryUserCount =
                    users.size();

            // -------------------------------------------------
            // CATEGORY PLATFORM AVERAGE
            // -------------------------------------------------

            double categoryAverage =
                    0.0;

            if (categoryUserCount > 0) {

                categoryAverage =
                        totalCategoryEmission
                                / categoryUserCount;
            }

            // -------------------------------------------------
            // CURRENT USER CATEGORY EMISSION
            // -------------------------------------------------

            double currentUserCategoryEmission =
                    userCategoryEmission.getOrDefault(
                            category,
                            0.0
                    );

            // -------------------------------------------------
            // ADD RESULT
            // -------------------------------------------------

            categoryBenchmarks.add(
                    new BenchmarkResponse.CategoryBenchmark(
                            category,

                            roundToTwoDecimals(
                                    currentUserCategoryEmission
                            ),

                            roundToTwoDecimals(
                                    categoryAverage
                            )
                    )
            );
        }

        // =====================================================
        // FINAL RESPONSE
        // =====================================================

        return new BenchmarkResponse(

                roundToTwoDecimals(
                        userTotalEmission
                ),

                roundToTwoDecimals(
                        platformAverageEmission
                ),

                userRank,

                totalUsers,

                categoryBenchmarks
        );
    }

    // =========================================================
    // CATEGORY NORMALIZATION
    // =========================================================

    private String normalizeCategory(
            String category) {

        if (category == null
                || category.trim().isEmpty()) {

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
    // ROUND TO TWO DECIMALS
    // =========================================================

    private double roundToTwoDecimals(
            double value) {

        return Math.round(
                value * 100.0
        ) / 100.0;
    }
}