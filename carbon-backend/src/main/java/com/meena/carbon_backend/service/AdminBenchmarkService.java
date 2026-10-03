package com.meena.carbon_backend.service;

import com.meena.carbon_backend.dto.AdminBenchmarkResponse;
import com.meena.carbon_backend.entity.Activity;
import com.meena.carbon_backend.dto.AdminBenchmarkResponse.CategoryBenchmark;
import com.meena.carbon_backend.dto.AdminBenchmarkResponse.FootprintRange;
import com.meena.carbon_backend.repository.ActivityRepository;
import com.meena.carbon_backend.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class AdminBenchmarkService {

    private final ActivityRepository activityRepository;
    private final UserRepository userRepository;

    public AdminBenchmarkService(
            ActivityRepository activityRepository,
            UserRepository userRepository
    ) {
        this.activityRepository = activityRepository;
        this.userRepository = userRepository;
    }

    public AdminBenchmarkResponse getBenchmark(
            LocalDate fromDate,
            LocalDate toDate
    ) {

        // =====================================================
        // GET ALL ACTIVITIES
        // =====================================================

        List<Activity> allActivities =
                activityRepository.findAll();

        // =====================================================
        // FILTER ACTIVITIES BY DATE
        // =====================================================

        List<Activity> filteredActivities =
                new ArrayList<>();

        for (Activity activity : allActivities) {

            if (activity.getDate() == null) {
                continue;
            }

            if (fromDate != null &&
                    activity.getDate().isBefore(fromDate)) {
                continue;
            }

            if (toDate != null &&
                    activity.getDate().isAfter(toDate)) {
                continue;
            }

            filteredActivities.add(activity);
        }

        // =====================================================
        // USER TOTAL EMISSIONS
        //
        // Key   = user email
        // Value = total emission during selected period
        //
        // Email is used internally only.
        // It is NOT returned to the frontend.
        // =====================================================

        Map<String, Double> userEmissionMap =
                new HashMap<>();

        for (Activity activity : filteredActivities) {

            String email = activity.getUserEmail();

            if (email == null ||
                    email.trim().isEmpty()) {
                continue;
            }

            double emission =
                    Math.max(0, activity.getEmission());

            userEmissionMap.put(
                    email,
                    userEmissionMap.getOrDefault(
                            email,
                            0.0
                    ) + emission
            );
        }

        // =====================================================
        // ACTIVE USERS
        // =====================================================

        int activeUsers =
                userEmissionMap.size();

        // =====================================================
        // PLATFORM AVERAGE
        //
        // Average of each active user's total
        // footprint for selected period.
        // =====================================================

        double totalUserEmission = 0;

        for (double emission :
                userEmissionMap.values()) {

            totalUserEmission += emission;
        }

        double platformAverageEmission =
                activeUsers > 0
                        ? totalUserEmission / activeUsers
                        : 0;

        // =====================================================
        // LOWEST / HIGHEST
        // =====================================================

        double lowestEmission = 0;
        double highestEmission = 0;

        if (activeUsers > 0) {

            lowestEmission =
                    userEmissionMap.values()
                            .stream()
                            .mapToDouble(
                                    Double::doubleValue
                            )
                            .min()
                            .orElse(0);

            highestEmission =
                    userEmissionMap.values()
                            .stream()
                            .mapToDouble(
                                    Double::doubleValue
                            )
                            .max()
                            .orElse(0);
        }

        // =====================================================
        // FOOTPRINT DISTRIBUTION
        // =====================================================

        int below5 = 0;
        int from5To10 = 0;
        int from10To15 = 0;
        int from15To20 = 0;
        int above20 = 0;

        for (double emission :
                userEmissionMap.values()) {

            if (emission < 5) {

                below5++;

            } else if (emission < 10) {

                from5To10++;

            } else if (emission < 15) {

                from10To15++;

            } else if (emission < 20) {

                from15To20++;

            } else {

                above20++;
            }
        }

        List<FootprintRange>
                footprintDistribution =
                new ArrayList<>();

        footprintDistribution.add(
                new FootprintRange(
                        "0 - 5 kg",
                        below5
                )
        );

        footprintDistribution.add(
                new FootprintRange(
                        "5 - 10 kg",
                        from5To10
                )
        );

        footprintDistribution.add(
                new FootprintRange(
                        "10 - 15 kg",
                        from10To15
                )
        );

        footprintDistribution.add(
                new FootprintRange(
                        "15 - 20 kg",
                        from15To20
                )
        );

        footprintDistribution.add(
                new FootprintRange(
                        "20+ kg",
                        above20
                )
        );

        // =====================================================
        // CATEGORY BENCHMARK
        //
        // Average category emission across ACTIVE USERS
        // in the selected period.
        // =====================================================

        Map<String, Double> categoryTotals =
                new HashMap<>();

        Map<String, Set<String>>
                categoryUsers =
                new HashMap<>();

        for (Activity activity :
                filteredActivities) {

            String category =
                    activity.getCategory();

            String email =
                    activity.getUserEmail();

            if (category == null ||
                    category.trim().isEmpty()) {

                category = "Other";
            }

            if (email == null ||
                    email.trim().isEmpty()) {
                continue;
            }

            double emission =
                    Math.max(0, activity.getEmission());

            categoryTotals.put(
                    category,
                    categoryTotals.getOrDefault(
                            category,
                            0.0
                    ) + emission
            );

            categoryUsers
                    .computeIfAbsent(
                            category,
                            key -> new HashSet<>()
                    )
                    .add(email);
        }

        List<CategoryBenchmark>
                categoryBenchmarks =
                new ArrayList<>();

        for (String category :
                categoryTotals.keySet()) {

            double total =
                    categoryTotals.get(category);

            int users =
                    categoryUsers
                            .getOrDefault(
                                    category,
                                    new HashSet<>()
                            )
                            .size();

            double average =
                    users > 0
                            ? total / users
                            : 0;

            categoryBenchmarks.add(
                    new CategoryBenchmark(
                            category,
                            round(average),
                            round(total)
                    )
            );
        }

        // =====================================================
        // SORT CATEGORY LIST
        // =====================================================

        categoryBenchmarks.sort(
                (a, b) ->
                        Double.compare(
                                b.getAverageEmission(),
                                a.getAverageEmission()
                        )
        );

        // =====================================================
        // REGISTERED USERS
        //
        // This includes all users in users table.
        // Admin is excluded from the active-user calculation
        // because active users come from activities.
        // =====================================================

        int totalRegisteredUsers =
                (int) userRepository.count();

        // =====================================================
        // RESPONSE
        // =====================================================

        return new AdminBenchmarkResponse(

                round(platformAverageEmission),

                round(lowestEmission),

                round(highestEmission),

                activeUsers,

                totalRegisteredUsers,

                footprintDistribution,

                categoryBenchmarks
        );
    }

    // =========================================================
    // ROUND TO 2 DECIMAL PLACES
    // =========================================================

    private double round(double value) {

        return Math.round(value * 100.0)
                / 100.0;
    }
}