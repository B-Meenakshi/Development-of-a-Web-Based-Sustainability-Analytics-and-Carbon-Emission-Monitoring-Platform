package com.meena.carbon_backend.service;

import com.meena.carbon_backend.dto.OrganizationOverviewResponse;
import com.meena.carbon_backend.entity.Activity;
import com.meena.carbon_backend.entity.Role;
import com.meena.carbon_backend.entity.User;
import com.meena.carbon_backend.repository.OrganizationAnalyticsRepository;
import com.meena.carbon_backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.*;

@Service
public class OrganizationOverviewService {

    private final OrganizationAnalyticsRepository analyticsRepository;
    private final UserRepository userRepository;

    public OrganizationOverviewService(
            OrganizationAnalyticsRepository analyticsRepository,
            UserRepository userRepository) {

        this.analyticsRepository = analyticsRepository;
        this.userRepository = userRepository;
    }

    public OrganizationOverviewResponse getOverview(Long organizationId) {

        if (organizationId == null) {
            throw new IllegalArgumentException(
                    "Organization ID is required"
            );
        }

        /*
         * =====================================================
         * GET EMPLOYEES OF THIS ORGANIZATION ONLY
         * =====================================================
         */

        List<User> employees =
                userRepository.findByOrganizationIdAndRole(
                        organizationId,
                        Role.USER
                );

        /*
         * =====================================================
         * GET ACTIVITIES OF THIS ORGANIZATION ONLY
         * =====================================================
         */

        List<Activity> activities =
                analyticsRepository.findActivitiesByOrganizationId(
                        organizationId
                );

        OrganizationOverviewResponse response =
                new OrganizationOverviewResponse();

        /*
         * =====================================================
         * SUMMARY
         * =====================================================
         */

        response.setTotalEmployees(
                employees.size()
        );

        response.setTotalActivities(
                activities.size()
        );

        double totalCarbon = activities.stream()
                .mapToDouble(Activity::getEmission)
                .sum();

        response.setTotalCarbon(
                round(totalCarbon)
        );

        double averageEmployeeFootprint =
                employees.isEmpty()
                        ? 0
                        : totalCarbon / employees.size();

        response.setAverageEmployeeFootprint(
                round(averageEmployeeFootprint)
        );

        /*
         * =====================================================
         * MONTHLY CARBON — LAST 6 MONTHS
         * =====================================================
         */

        response.setCarbonTrend(
                buildMonthlyCarbon(activities)
        );

        /*
         * =====================================================
         * CATEGORY BREAKDOWN
         * =====================================================
         */

        response.setCategoryData(
                buildCategoryData(activities)
        );

        /*
         * =====================================================
         * EMPLOYEE OVERVIEW
         * =====================================================
         */

        response.setEmployeeData(
                buildEmployeeData(employees, activities)
        );

        return response;
    }

    /* =========================================================
       MONTHLY CARBON
       ========================================================= */

    private List<OrganizationOverviewResponse.MonthlyCarbon>
    buildMonthlyCarbon(List<Activity> activities) {

        Map<String, Double> monthlyTotals =
                new LinkedHashMap<>();

        LocalDate today = LocalDate.now();

        /*
         * Create the last 6 months first.
         * This ensures months with zero activity
         * still appear on the chart.
         */

        for (int i = 5; i >= 0; i--) {

            LocalDate monthDate =
                    today.minusMonths(i);

            String key =
                    monthDate.getYear()
                            + "-"
                            + String.format(
                                    "%02d",
                                    monthDate.getMonthValue()
                            );

            monthlyTotals.put(key, 0.0);
        }

        /*
         * Add activity emissions.
         */

        for (Activity activity : activities) {

            if (activity.getDate() == null) {
                continue;
            }

            String key =
                    activity.getDate().getYear()
                            + "-"
                            + String.format(
                                    "%02d",
                                    activity.getDate().getMonthValue()
                            );

            if (monthlyTotals.containsKey(key)) {

                monthlyTotals.put(
                        key,
                        monthlyTotals.get(key)
                                + activity.getEmission()
                );
            }
        }

        List<OrganizationOverviewResponse.MonthlyCarbon>
                result = new ArrayList<>();

        for (Map.Entry<String, Double> entry :
                monthlyTotals.entrySet()) {

            String[] parts =
                    entry.getKey().split("-");

            int year =
                    Integer.parseInt(parts[0]);

            int month =
                    Integer.parseInt(parts[1]);

            LocalDate date =
                    LocalDate.of(year, month, 1);

            String monthName =
                    date.getMonth()
                            .getDisplayName(
                                    TextStyle.SHORT,
                                    Locale.ENGLISH
                            );

            result.add(
                    new OrganizationOverviewResponse.MonthlyCarbon(
                            monthName,
                            round(entry.getValue())
                    )
            );
        }

        return result;
    }

    /* =========================================================
       CATEGORY DATA
       ========================================================= */

    private List<OrganizationOverviewResponse.CategoryEmission>
    buildCategoryData(List<Activity> activities) {

        Map<String, Double> categoryTotals =
                new LinkedHashMap<>();

        /*
         * Start with the categories used by
         * the existing Overview UI.
         */

        categoryTotals.put("Transport", 0.0);
        categoryTotals.put("Electricity", 0.0);
        categoryTotals.put("Food", 0.0);
        categoryTotals.put("Shopping", 0.0);
        categoryTotals.put("Other", 0.0);

        for (Activity activity : activities) {

            String category =
                    normalizeCategory(
                            activity.getCategory()
                    );

            double emission =
                    activity.getEmission();

            if (!categoryTotals.containsKey(category)) {

                categoryTotals.put(
                        "Other",
                        categoryTotals.get("Other")
                                + emission
                );

            } else {

                categoryTotals.put(
                        category,
                        categoryTotals.get(category)
                                + emission
                );
            }
        }

        List<OrganizationOverviewResponse.CategoryEmission>
                result = new ArrayList<>();

        for (Map.Entry<String, Double> entry :
                categoryTotals.entrySet()) {

            result.add(
                    new OrganizationOverviewResponse.CategoryEmission(
                            entry.getKey(),
                            round(entry.getValue())
                    )
            );
        }

        return result;
    }

    private String normalizeCategory(String category) {

        if (category == null ||
                category.trim().isEmpty()) {

            return "Other";
        }

        String value =
                category.trim().toLowerCase();

        if (value.contains("transport") ||
                value.contains("travel")) {

            return "Transport";
        }

        if (value.contains("electric")) {

            return "Electricity";
        }

        if (value.contains("food") ||
                value.contains("meal")) {

            return "Food";
        }

        if (value.contains("shopping")) {

            return "Shopping";
        }

        return "Other";
    }

    /* =========================================================
       EMPLOYEE DATA
       ========================================================= */

    private List<OrganizationOverviewResponse.EmployeeOverview>
    buildEmployeeData(
            List<User> employees,
            List<Activity> activities) {

        Map<String, List<Activity>>
                activitiesByEmail =
                new HashMap<>();

        for (Activity activity : activities) {

            String email =
                    activity.getUserEmail();

            if (email == null) {
                continue;
            }

            activitiesByEmail
                    .computeIfAbsent(
                            email.toLowerCase(),
                            key -> new ArrayList<>()
                    )
                    .add(activity);
        }

        List<OrganizationOverviewResponse.EmployeeOverview>
                result = new ArrayList<>();

        for (User employee : employees) {

            String email =
                    employee.getEmail();

            List<Activity> employeeActivities =
                    activitiesByEmail.getOrDefault(
                            email.toLowerCase(),
                            Collections.emptyList()
                    );

            double carbon =
                    employeeActivities.stream()
                            .mapToDouble(Activity::getEmission)
                            .sum();

            OrganizationOverviewResponse.EmployeeOverview
                    employeeOverview =
                    new OrganizationOverviewResponse.EmployeeOverview();

            employeeOverview.setId(
                    employee.getId()
            );

            employeeOverview.setName(
                    employee.getFullName()
            );

            employeeOverview.setEmail(
                    employee.getEmail()
            );

            employeeOverview.setActivities(
                    employeeActivities.size()
            );

            employeeOverview.setCarbon(
                    round(carbon)
            );

            /*
             * Trend is kept at 0 for now.
             *
             * We will connect this to a real
             * previous-period comparison after
             * the basic Overview is working.
             */

            employeeOverview.setTrend(0);

            result.add(employeeOverview);
        }

        /*
         * Employees with the highest footprint
         * appear first in the Overview.
         */

        result.sort(
                Comparator.comparingDouble(
                        OrganizationOverviewResponse.EmployeeOverview
                                ::getCarbon
                ).reversed()
        );

        return result;
    }

    /* =========================================================
       ROUNDING
       ========================================================= */

    private double round(double value) {

        return Math.round(value * 100.0) / 100.0;
    }
}