package com.meena.carbon_backend.service;

import com.meena.carbon_backend.dto.OrganizationCSRReportResponse;
import com.meena.carbon_backend.dto.OrganizationCSRReportResponse.CategoryReport;
import com.meena.carbon_backend.dto.OrganizationCSRReportResponse.EmployeeReport;
import com.meena.carbon_backend.dto.OrganizationCSRReportResponse.MonthlyReport;
import com.meena.carbon_backend.entity.Activity;
import com.meena.carbon_backend.entity.Role;
import com.meena.carbon_backend.entity.User;
import com.meena.carbon_backend.entity.Organization;
import com.meena.carbon_backend.repository.OrganizationAnalyticsRepository;
import com.meena.carbon_backend.repository.OrganizationRepository;
import com.meena.carbon_backend.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class OrganizationCSRReportService {

    private final OrganizationAnalyticsRepository analyticsRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;

    public OrganizationCSRReportService(
            OrganizationAnalyticsRepository analyticsRepository,
            OrganizationRepository organizationRepository,
            UserRepository userRepository
    ) {
        this.analyticsRepository = analyticsRepository;
        this.organizationRepository = organizationRepository;
        this.userRepository = userRepository;
    }

    // ============================================================
    // MAIN REPORT
    // ============================================================

    public OrganizationCSRReportResponse generateReport(
            Long organizationId,
            LocalDate startDate,
            LocalDate endDate
    ) {

        if (organizationId == null) {
            throw new IllegalArgumentException(
                    "Organization ID is required"
            );
        }

        if (startDate == null || endDate == null) {
            throw new IllegalArgumentException(
                    "Start date and end date are required"
            );
        }

        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException(
                    "Start date cannot be after end date"
            );
        }

        // --------------------------------------------------------
        // ORGANIZATION
        // --------------------------------------------------------

        Organization organization =
                organizationRepository.findById(organizationId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Organization not found"
                                )
                        );

        // --------------------------------------------------------
        // EMPLOYEES
        // --------------------------------------------------------

        List<User> employees =
                userRepository.findByOrganizationIdAndRole(
                        organizationId,
                        Role.USER
                );

        /*
         * TOTAL EMPLOYEES
         *
         * This represents every employee belonging to the
         * organization, regardless of whether they logged
         * an activity during the selected reporting period.
         */
        long totalEmployees = employees.size();

        // --------------------------------------------------------
        // ACTIVITIES
        // --------------------------------------------------------

        List<Activity> activities =
                analyticsRepository
                        .findActivitiesByOrganizationIdAndDateBetween(
                                organizationId,
                                startDate,
                                endDate
                        );

        // --------------------------------------------------------
        // BASIC TOTALS
        // --------------------------------------------------------

        double totalCarbon = activities.stream()
                .mapToDouble(Activity::getEmission)
                .sum();

        long totalActivities = activities.size();

        /*
         * EMPLOYEES TRACKED / PARTICIPATING
         *
         * This represents only employees who actually recorded
         * at least one activity during the selected period.
         */
        long employeesTracked = activities.stream()
                .map(Activity::getUserEmail)
                .filter(Objects::nonNull)
                .distinct()
                .count();

        /*
         * AVERAGE EMPLOYEE FOOTPRINT
         *
         * Divide organization carbon across ALL employees,
         * not only employees who happened to log activities.
         */
        double averageEmployeeFootprint =
                totalEmployees > 0
                        ? totalCarbon / totalEmployees
                        : 0;

        double averageCarbonPerActivity =
                totalActivities > 0
                        ? totalCarbon / totalActivities
                        : 0;

        // --------------------------------------------------------
        // CREATE RESPONSE
        // --------------------------------------------------------

        OrganizationCSRReportResponse response =
                new OrganizationCSRReportResponse();

        response.setOrganizationName(
                organization.getName()
        );

        response.setReportingPeriod(
                formatReportingPeriod(startDate, endDate)
        );

        /*
         * NEW:
         * Total employees in organization.
         */
        response.setTotalEmployees(
                totalEmployees
        );

        response.setTotalCarbon(
                round(totalCarbon)
        );

        response.setTotalActivities(
                totalActivities
        );

        /*
         * Employees who actually participated during
         * the selected reporting period.
         */
        response.setEmployeesTracked(
                employeesTracked
        );

        response.setAverageEmployeeFootprint(
                round(averageEmployeeFootprint)
        );

        response.setAverageCarbonPerActivity(
                round(averageCarbonPerActivity)
        );

        // --------------------------------------------------------
        // CATEGORY REPORT
        // --------------------------------------------------------

        response.setCategoryData(
                buildCategoryReport(
                        activities,
                        totalCarbon
                )
        );

        // --------------------------------------------------------
        // EMPLOYEE REPORT
        // --------------------------------------------------------

        response.setEmployeeData(
                buildEmployeeReport(
                        employees,
                        activities,
                        totalCarbon
                )
        );

        // --------------------------------------------------------
        // MONTHLY TREND
        // --------------------------------------------------------

        response.setMonthlyTrend(
                buildMonthlyTrend(
                        activities,
                        startDate,
                        endDate
                )
        );

        // --------------------------------------------------------
        // HIGHLIGHTS
        // --------------------------------------------------------

        response.setHighlights(
                buildHighlights(
                        activities,
                        totalEmployees,
                        employeesTracked,
                        totalCarbon,
                        startDate,
                        endDate
                )
        );

        return response;
    }

    // ============================================================
    // CATEGORY REPORT
    // ============================================================

    private List<CategoryReport> buildCategoryReport(
            List<Activity> activities,
            double totalCarbon
    ) {

        Map<String, List<Activity>> grouped =
                activities.stream()
                        .collect(Collectors.groupingBy(
                                activity -> normalizeCategory(
                                        activity.getCategory()
                                ),
                                LinkedHashMap::new,
                                Collectors.toList()
                        ));

        return grouped.entrySet()
                .stream()
                .map(entry -> {

                    String category = entry.getKey();

                    List<Activity> categoryActivities =
                            entry.getValue();

                    double carbon =
                            categoryActivities.stream()
                                    .mapToDouble(
                                            Activity::getEmission
                                    )
                                    .sum();

                    long activityCount =
                            categoryActivities.size();

                    double percentage =
                            totalCarbon > 0
                                    ? (carbon / totalCarbon) * 100
                                    : 0;

                    return new CategoryReport(
                            category,
                            round(carbon),
                            activityCount,
                            round(percentage)
                    );
                })
                .sorted(
                        Comparator.comparingDouble(
                                CategoryReport::getCarbon
                        ).reversed()
                )
                .collect(Collectors.toList());
    }

    // ============================================================
    // EMPLOYEE REPORT
    // ============================================================

    private List<EmployeeReport> buildEmployeeReport(
            List<User> employees,
            List<Activity> activities,
            double totalCarbon
    ) {

        /*
         * Group activities by employee email.
         */
        Map<String, List<Activity>> employeeActivities =
                activities.stream()
                        .filter(activity ->
                                activity.getUserEmail() != null
                        )
                        .collect(Collectors.groupingBy(
                                Activity::getUserEmail
                        ));

        /*
         * IMPORTANT:
         *
         * We iterate through ALL organization employees.
         *
         * Therefore an employee with zero activities will still
         * appear in the CSR report with:
         *
         * Activities = 0
         * Carbon = 0.00
         * Share = 0%
         */
        return employees.stream()
                .map(employee -> {

                    List<Activity> employeeActivityList =
                            employeeActivities.getOrDefault(
                                    employee.getEmail(),
                                    Collections.emptyList()
                            );

                    double carbon =
                            employeeActivityList.stream()
                                    .mapToDouble(
                                            Activity::getEmission
                                    )
                                    .sum();

                    long activityCount =
                            employeeActivityList.size();

                    double percentage =
                            totalCarbon > 0
                                    ? (carbon / totalCarbon) * 100
                                    : 0;

                    return new EmployeeReport(
                            employee.getId(),
                            employee.getFullName(),
                            employee.getEmail(),
                            activityCount,
                            round(carbon),
                            round(percentage)
                    );
                })
                .sorted(
                        Comparator.comparingDouble(
                                EmployeeReport::getCarbon
                        ).reversed()
                )
                .collect(Collectors.toList());
    }

    // ============================================================
    // MONTHLY TREND
    // ============================================================

    private List<MonthlyReport> buildMonthlyTrend(
            List<Activity> activities,
            LocalDate startDate,
            LocalDate endDate
    ) {

        Map<YearMonth, List<Activity>> grouped =
                activities.stream()
                        .filter(activity ->
                                activity.getDate() != null
                        )
                        .collect(Collectors.groupingBy(
                                activity ->
                                        YearMonth.from(
                                                activity.getDate()
                                        ),
                                TreeMap::new,
                                Collectors.toList()
                        ));

        List<MonthlyReport> result =
                new ArrayList<>();

        YearMonth current =
                YearMonth.from(startDate);

        YearMonth last =
                YearMonth.from(endDate);

        while (!current.isAfter(last)) {

            List<Activity> monthActivities =
                    grouped.getOrDefault(
                            current,
                            Collections.emptyList()
                    );

            double carbon =
                    monthActivities.stream()
                            .mapToDouble(
                                    Activity::getEmission
                            )
                            .sum();

            long activityCount =
                    monthActivities.size();

            result.add(
                    new MonthlyReport(
                            current.format(
                                    DateTimeFormatter.ofPattern(
                                            "MMM yyyy"
                                    )
                            ),
                            round(carbon),
                            activityCount
                    )
            );

            current = current.plusMonths(1);
        }

        return result;
    }

    // ============================================================
    // HIGHLIGHTS
    // ============================================================

    private List<String> buildHighlights(
            List<Activity> activities,
            long totalEmployees,
            long employeesTracked,
            double totalCarbon,
            LocalDate startDate,
            LocalDate endDate
    ) {

        List<String> highlights =
                new ArrayList<>();

        // --------------------------------------------------------
        // TOTAL EMPLOYEES
        // --------------------------------------------------------

        highlights.add(
                totalEmployees +
                " employees were part of the organization during the reporting period."
        );

        // --------------------------------------------------------
        // PARTICIPATING EMPLOYEES
        // --------------------------------------------------------

        highlights.add(
                employeesTracked +
                " employees recorded sustainability activities during the reporting period."
        );

        // --------------------------------------------------------
        // PARTICIPATION RATE
        // --------------------------------------------------------

        double participationRate =
                totalEmployees > 0
                        ? (employeesTracked * 100.0) / totalEmployees
                        : 0;

        highlights.add(
                round(participationRate) +
                "% of organization employees recorded at least one activity during the reporting period."
        );

        // --------------------------------------------------------
        // ACTIVITY COUNT
        // --------------------------------------------------------

        highlights.add(
                activities.size() +
                " sustainability activities were recorded between " +
                formatDate(startDate) +
                " and " +
                formatDate(endDate) +
                "."
        );

        // --------------------------------------------------------
        // TOTAL CARBON
        // --------------------------------------------------------

        highlights.add(
                "The organization recorded " +
                round(totalCarbon) +
                " kg CO₂e during the selected reporting period."
        );

        // --------------------------------------------------------
        // LEADING CATEGORY
        // --------------------------------------------------------

        Map<String, Double> categoryCarbon =
                activities.stream()
                        .collect(Collectors.groupingBy(
                                activity ->
                                        normalizeCategory(
                                                activity.getCategory()
                                        ),
                                Collectors.summingDouble(
                                        Activity::getEmission
                                )
                        ));

        if (!categoryCarbon.isEmpty()) {

            Map.Entry<String, Double> leadingCategory =
                    categoryCarbon.entrySet()
                            .stream()
                            .max(
                                    Map.Entry.comparingByValue()
                            )
                            .orElse(null);

            if (leadingCategory != null) {

                double percentage =
                        totalCarbon > 0
                                ? (leadingCategory.getValue()
                                / totalCarbon) * 100
                                : 0;

                highlights.add(
                        leadingCategory.getKey() +
                        " accounted for approximately " +
                        round(percentage) +
                        "% of the recorded carbon emissions."
                );
            }
        }

        return highlights;
    }

    // ============================================================
    // CATEGORY NORMALIZATION
    // ============================================================

    private String normalizeCategory(String category) {

        if (category == null ||
                category.trim().isEmpty()) {

            return "Other";
        }

        String value =
                category.trim().toLowerCase();

        if (value.contains("transport") ||
                value.contains("car") ||
                value.contains("bus") ||
                value.contains("train") ||
                value.contains("bicycle")) {

            return "Transport";
        }

        if (value.contains("electric") ||
                value.contains("energy")) {

            return "Electricity";
        }

        if (value.contains("food") ||
                value.contains("meal") ||
                value.contains("vegetarian") ||
                value.contains("non-veg")) {

            return "Food";
        }

        if (value.contains("shopping")) {

            return "Shopping";
        }

        if (value.contains("waste") ||
                value.contains("recycle")) {

            return "Waste";
        }

        return "Other";
    }

    // ============================================================
    // DATE FORMATTING
    // ============================================================

    private String formatReportingPeriod(
            LocalDate startDate,
            LocalDate endDate
    ) {

        DateTimeFormatter formatter =
                DateTimeFormatter.ofPattern(
                        "dd MMM yyyy"
                );

        return startDate.format(formatter)
                + " - "
                + endDate.format(formatter);
    }

    private String formatDate(LocalDate date) {

        return date.format(
                DateTimeFormatter.ofPattern(
                        "dd MMM yyyy"
                )
        );
    }

    // ============================================================
    // ROUNDING
    // ============================================================

    private double round(double value) {

        return Math.round(value * 100.0) / 100.0;
    }
}