package com.meena.carbon_backend.service;

import com.meena.carbon_backend.entity.Activity;
import com.meena.carbon_backend.entity.User;
import com.meena.carbon_backend.repository.OrganizationAnalyticsRepository;
import com.meena.carbon_backend.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class OrganizationAnalyticsService {

    private final OrganizationAnalyticsRepository analyticsRepository;
    private final UserRepository userRepository;

    public OrganizationAnalyticsService(
            OrganizationAnalyticsRepository analyticsRepository,
            UserRepository userRepository) {

        this.analyticsRepository = analyticsRepository;
        this.userRepository = userRepository;
    }


    // =========================================================
    // ORGANIZATION ACTIVITIES
    // =========================================================

    public List<Activity> getOrganizationActivities(
            Long organizationId) {

        validateOrganizationId(organizationId);

        return analyticsRepository
                .findActivitiesByOrganizationId(organizationId);
    }


    public List<Activity> getOrganizationActivitiesByDateRange(
            Long organizationId,
            LocalDate startDate,
            LocalDate endDate) {

        validateOrganizationId(organizationId);
        validateDates(startDate, endDate);

        return analyticsRepository
                .findActivitiesByOrganizationIdAndDateBetween(
                        organizationId,
                        startDate,
                        endDate
                );
    }


    // =========================================================
    // EMPLOYEE ACTIVITIES
    // =========================================================

    public List<Activity> getEmployeeActivities(
            Long organizationId,
            Long userId) {

        validateOrganizationId(organizationId);

        if (userId == null) {
            throw new IllegalArgumentException(
                    "Employee ID is required"
            );
        }

        return analyticsRepository.findEmployeeActivities(
                organizationId,
                userId
        );
    }


    public List<Activity> getEmployeeActivitiesByDateRange(
            Long organizationId,
            Long userId,
            LocalDate startDate,
            LocalDate endDate) {

        validateOrganizationId(organizationId);

        if (userId == null) {
            throw new IllegalArgumentException(
                    "Employee ID is required"
            );
        }

        validateDates(startDate, endDate);

        return analyticsRepository
                .findEmployeeActivitiesByDateBetween(
                        organizationId,
                        userId,
                        startDate,
                        endDate
                );
    }


    // =========================================================
    // COMPLETE ORGANIZATION ANALYTICS
    // =========================================================

    public OrganizationAnalyticsResponse getOrganizationAnalytics(
            Long organizationId) {

        validateOrganizationId(organizationId);

        List<Activity> activities =
                analyticsRepository
                        .findActivitiesByOrganizationId(
                                organizationId
                        );

        return buildAnalyticsResponse(activities);
    }


    // =========================================================
    // DATE-RANGE ORGANIZATION ANALYTICS
    // =========================================================

    public OrganizationAnalyticsResponse getOrganizationAnalytics(
            Long organizationId,
            LocalDate startDate,
            LocalDate endDate) {

        validateOrganizationId(organizationId);
        validateDates(startDate, endDate);

        List<Activity> activities =
                analyticsRepository
                        .findActivitiesByOrganizationIdAndDateBetween(
                                organizationId,
                                startDate,
                                endDate
                        );

        return buildAnalyticsResponse(activities);
    }


    // =========================================================
    // BUILD ANALYTICS
    // =========================================================

    private OrganizationAnalyticsResponse buildAnalyticsResponse(
            List<Activity> activities) {

        OrganizationAnalyticsResponse response =
                new OrganizationAnalyticsResponse();

        if (activities == null || activities.isEmpty()) {

            response.setTotalEmissions(0.0);
            response.setTotalActivities(0);
            response.setAverageEmissionPerActivity(0.0);

            response.setEmployeeEmissions(
                    new ArrayList<>()
            );

            response.setCategoryEmissions(
                    new ArrayList<>()
            );

            response.setDailyTrend(
                    new ArrayList<>()
            );

            response.setMonthlyTrend(
                    new ArrayList<>()
            );

            return response;
        }


        // =====================================================
        // TOTAL EMISSIONS
        // =====================================================

        double totalEmissions =
                activities.stream()
                        .mapToDouble(Activity::getEmission)
                        .sum();


        // =====================================================
        // TOTAL ACTIVITIES
        // =====================================================

        int totalActivities =
                activities.size();


        // =====================================================
        // AVERAGE EMISSION
        // =====================================================

        double averageEmission =
                totalActivities == 0
                        ? 0.0
                        : totalEmissions / totalActivities;


        response.setTotalEmissions(
                round(totalEmissions)
        );

        response.setTotalActivities(
                totalActivities
        );

        response.setAverageEmissionPerActivity(
                round(averageEmission)
        );


        // =====================================================
        // EMPLOYEE-WISE EMISSIONS
        // =====================================================

        /*
         * First group activities by employee email.
         *
         * Example:
         *
         * meenakshibende@gmail.com -> 2.1
         * employee2@gmail.com      -> 5.4
         */

        Map<String, Double> employeeEmissionMap =
                activities.stream()
                        .collect(
                                Collectors.groupingBy(
                                        activity ->
                                                activity.getUserEmail() == null
                                                        ? "Unknown"
                                                        : activity.getUserEmail(),
                                        Collectors.summingDouble(
                                                Activity::getEmission
                                        )
                                )
                        );


        /*
         * Build a clean employee-name map.
         *
         * We get the actual employee name from
         * the User table instead of trying to
         * create a name from the email address.
         */

        Map<String, User> employeeMap =
                new HashMap<>();

        for (String email :
                employeeEmissionMap.keySet()) {

            if (email == null ||
                    email.equals("Unknown")) {

                continue;
            }

            userRepository
                    .findByEmail(email)
                    .ifPresent(user ->
                            employeeMap.put(
                                    email,
                                    user
                            )
                    );
        }


        /*
         * Create EmployeeEmission response.
         */

        List<EmployeeEmission> employeeEmissions =
                employeeEmissionMap.entrySet()
                        .stream()
                        .map(entry -> {

                            String email =
                                    entry.getKey();

                            EmployeeEmission employee =
                                    new EmployeeEmission();

                            employee.setEmployeeEmail(
                                    email
                            );

                            /*
                             * Get actual employee
                             * from User table.
                             */

                            User user =
                                    employeeMap.get(email);

                            if (user != null) {

                                employee.setEmployeeId(
                                        user.getId()
                                );

                                employee.setEmployeeName(
                                        user.getFullName()
                                );

                            } else {

                                /*
                                 * Only used if the activity
                                 * references an employee that
                                 * no longer exists.
                                 */

                                employee.setEmployeeId(
                                        null
                                );

                                employee.setEmployeeName(
                                        "Unknown Employee"
                                );
                            }


                            employee.setEmission(
                                    round(entry.getValue())
                            );

                            return employee;
                        })
                        .sorted(
                                Comparator.comparingDouble(
                                        EmployeeEmission::getEmission
                                ).reversed()
                        )
                        .collect(
                                Collectors.toList()
                        );


        response.setEmployeeEmissions(
                employeeEmissions
        );


        // =====================================================
        // CATEGORY-WISE EMISSIONS
        // =====================================================

        Map<String, Double> categoryEmissionMap =
                activities.stream()
                        .collect(
                                Collectors.groupingBy(
                                        activity ->
                                                activity.getCategory() == null
                                                        ? "Other"
                                                        : activity.getCategory(),
                                        Collectors.summingDouble(
                                                Activity::getEmission
                                        )
                                )
                        );


        List<CategoryEmission> categoryEmissions =
                categoryEmissionMap.entrySet()
                        .stream()
                        .map(entry -> {

                            CategoryEmission category =
                                    new CategoryEmission();

                            category.setCategory(
                                    entry.getKey()
                            );

                            category.setEmission(
                                    round(entry.getValue())
                            );

                            return category;
                        })
                        .sorted(
                                Comparator.comparingDouble(
                                        CategoryEmission::getEmission
                                ).reversed()
                        )
                        .collect(
                                Collectors.toList()
                        );


        response.setCategoryEmissions(
                categoryEmissions
        );


        // =====================================================
        // DAILY TREND
        // =====================================================

        Map<LocalDate, Double> dailyEmissionMap =
                activities.stream()
                        .filter(activity ->
                                activity.getDate() != null
                        )
                        .collect(
                                Collectors.groupingBy(
                                        Activity::getDate,
                                        TreeMap::new,
                                        Collectors.summingDouble(
                                                Activity::getEmission
                                        )
                                )
                        );


        List<DailyEmission> dailyTrend =
                dailyEmissionMap.entrySet()
                        .stream()
                        .map(entry -> {

                            DailyEmission daily =
                                    new DailyEmission();

                            daily.setDate(
                                    entry.getKey()
                            );

                            daily.setEmission(
                                    round(entry.getValue())
                            );

                            return daily;
                        })
                        .collect(
                                Collectors.toList()
                        );


        response.setDailyTrend(
                dailyTrend
        );


        // =====================================================
        // MONTHLY TREND
        // =====================================================

        Map<YearMonth, Double> monthlyEmissionMap =
                activities.stream()
                        .filter(activity ->
                                activity.getDate() != null
                        )
                        .collect(
                                Collectors.groupingBy(
                                        activity ->
                                                YearMonth.from(
                                                        activity.getDate()
                                                ),
                                        TreeMap::new,
                                        Collectors.summingDouble(
                                                Activity::getEmission
                                        )
                                )
                        );


        List<MonthlyEmission> monthlyTrend =
                monthlyEmissionMap.entrySet()
                        .stream()
                        .map(entry -> {

                            MonthlyEmission monthly =
                                    new MonthlyEmission();

                            monthly.setMonth(
                                    entry.getKey().toString()
                            );

                            monthly.setEmission(
                                    round(entry.getValue())
                            );

                            return monthly;
                        })
                        .collect(
                                Collectors.toList()
                        );


        response.setMonthlyTrend(
                monthlyTrend
        );


        return response;
    }


    // =========================================================
    // VALIDATION
    // =========================================================

    private void validateOrganizationId(
            Long organizationId) {

        if (organizationId == null) {

            throw new IllegalArgumentException(
                    "Organization ID is required"
            );
        }

        if (organizationId <= 0) {

            throw new IllegalArgumentException(
                    "Invalid organization ID"
            );
        }
    }


    private void validateDates(
            LocalDate startDate,
            LocalDate endDate) {

        if (startDate == null ||
                endDate == null) {

            throw new IllegalArgumentException(
                    "Start date and end date are required"
            );
        }

        if (startDate.isAfter(endDate)) {

            throw new IllegalArgumentException(
                    "Start date cannot be after end date"
            );
        }
    }


    // =========================================================
    // ROUNDING
    // =========================================================

    private double round(double value) {

        return Math.round(value * 100.0) / 100.0;
    }


    // =========================================================
    // ORGANIZATION ANALYTICS RESPONSE
    // =========================================================

    public static class OrganizationAnalyticsResponse {

        private double totalEmissions;

        private int totalActivities;

        private double averageEmissionPerActivity;

        private List<EmployeeEmission> employeeEmissions;

        private List<CategoryEmission> categoryEmissions;

        private List<DailyEmission> dailyTrend;

        private List<MonthlyEmission> monthlyTrend;


        public double getTotalEmissions() {
            return totalEmissions;
        }

        public void setTotalEmissions(
                double totalEmissions) {

            this.totalEmissions =
                    totalEmissions;
        }


        public int getTotalActivities() {
            return totalActivities;
        }

        public void setTotalActivities(
                int totalActivities) {

            this.totalActivities =
                    totalActivities;
        }


        public double getAverageEmissionPerActivity() {
            return averageEmissionPerActivity;
        }

        public void setAverageEmissionPerActivity(
                double averageEmissionPerActivity) {

            this.averageEmissionPerActivity =
                    averageEmissionPerActivity;
        }


        public List<EmployeeEmission> getEmployeeEmissions() {
            return employeeEmissions;
        }

        public void setEmployeeEmissions(
                List<EmployeeEmission> employeeEmissions) {

            this.employeeEmissions =
                    employeeEmissions;
        }


        public List<CategoryEmission> getCategoryEmissions() {
            return categoryEmissions;
        }

        public void setCategoryEmissions(
                List<CategoryEmission> categoryEmissions) {

            this.categoryEmissions =
                    categoryEmissions;
        }


        public List<DailyEmission> getDailyTrend() {
            return dailyTrend;
        }

        public void setDailyTrend(
                List<DailyEmission> dailyTrend) {

            this.dailyTrend =
                    dailyTrend;
        }


        public List<MonthlyEmission> getMonthlyTrend() {
            return monthlyTrend;
        }

        public void setMonthlyTrend(
                List<MonthlyEmission> monthlyTrend) {

            this.monthlyTrend =
                    monthlyTrend;
        }
    }


    // =========================================================
    // EMPLOYEE EMISSION
    // =========================================================

    public static class EmployeeEmission {

        private Long employeeId;

        private String employeeName;

        private String employeeEmail;

        private double emission;


        public Long getEmployeeId() {
            return employeeId;
        }

        public void setEmployeeId(
                Long employeeId) {

            this.employeeId =
                    employeeId;
        }


        public String getEmployeeName() {
            return employeeName;
        }

        public void setEmployeeName(
                String employeeName) {

            this.employeeName =
                    employeeName;
        }


        public String getEmployeeEmail() {
            return employeeEmail;
        }

        public void setEmployeeEmail(
                String employeeEmail) {

            this.employeeEmail =
                    employeeEmail;
        }


        public double getEmission() {
            return emission;
        }

        public void setEmission(
                double emission) {

            this.emission =
                    emission;
        }
    }


    // =========================================================
    // CATEGORY EMISSION
    // =========================================================

    public static class CategoryEmission {

        private String category;

        private double emission;


        public String getCategory() {
            return category;
        }

        public void setCategory(
                String category) {

            this.category =
                    category;
        }


        public double getEmission() {
            return emission;
        }

        public void setEmission(
                double emission) {

            this.emission =
                    emission;
        }
    }


    // =========================================================
    // DAILY EMISSION
    // =========================================================

    public static class DailyEmission {

        private LocalDate date;

        private double emission;


        public LocalDate getDate() {
            return date;
        }

        public void setDate(
                LocalDate date) {

            this.date =
                    date;
        }


        public double getEmission() {
            return emission;
        }

        public void setEmission(
                double emission) {

            this.emission =
                    emission;
        }
    }


    // =========================================================
    // MONTHLY EMISSION
    // =========================================================

    public static class MonthlyEmission {

        private String month;

        private double emission;


        public String getMonth() {
            return month;
        }

        public void setMonth(
                String month) {

            this.month =
                    month;
        }


        public double getEmission() {
            return emission;
        }

        public void setEmission(
                double emission) {

            this.emission =
                    emission;
        }
    }
}