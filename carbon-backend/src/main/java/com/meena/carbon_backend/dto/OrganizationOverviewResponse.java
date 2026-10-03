package com.meena.carbon_backend.dto;

import java.util.List;

public class OrganizationOverviewResponse {

    private long totalEmployees;
    private long totalActivities;
    private double totalCarbon;
    private double averageEmployeeFootprint;

    private List<MonthlyCarbon> carbonTrend;
    private List<CategoryEmission> categoryData;
    private List<EmployeeOverview> employeeData;

    public OrganizationOverviewResponse() {
    }

    public long getTotalEmployees() {
        return totalEmployees;
    }

    public void setTotalEmployees(long totalEmployees) {
        this.totalEmployees = totalEmployees;
    }

    public long getTotalActivities() {
        return totalActivities;
    }

    public void setTotalActivities(long totalActivities) {
        this.totalActivities = totalActivities;
    }

    public double getTotalCarbon() {
        return totalCarbon;
    }

    public void setTotalCarbon(double totalCarbon) {
        this.totalCarbon = totalCarbon;
    }

    public double getAverageEmployeeFootprint() {
        return averageEmployeeFootprint;
    }

    public void setAverageEmployeeFootprint(double averageEmployeeFootprint) {
        this.averageEmployeeFootprint = averageEmployeeFootprint;
    }

    public List<MonthlyCarbon> getCarbonTrend() {
        return carbonTrend;
    }

    public void setCarbonTrend(List<MonthlyCarbon> carbonTrend) {
        this.carbonTrend = carbonTrend;
    }

    public List<CategoryEmission> getCategoryData() {
        return categoryData;
    }

    public void setCategoryData(List<CategoryEmission> categoryData) {
        this.categoryData = categoryData;
    }

    public List<EmployeeOverview> getEmployeeData() {
        return employeeData;
    }

    public void setEmployeeData(List<EmployeeOverview> employeeData) {
        this.employeeData = employeeData;
    }

    /* =====================================================
       MONTHLY CARBON
       ===================================================== */

    public static class MonthlyCarbon {

        private String month;
        private double carbon;

        public MonthlyCarbon() {
        }

        public MonthlyCarbon(String month, double carbon) {
            this.month = month;
            this.carbon = carbon;
        }

        public String getMonth() {
            return month;
        }

        public void setMonth(String month) {
            this.month = month;
        }

        public double getCarbon() {
            return carbon;
        }

        public void setCarbon(double carbon) {
            this.carbon = carbon;
        }
    }

    /* =====================================================
       CATEGORY EMISSION
       ===================================================== */

    public static class CategoryEmission {

        private String name;
        private double value;

        public CategoryEmission() {
        }

        public CategoryEmission(String name, double value) {
            this.name = name;
            this.value = value;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public double getValue() {
            return value;
        }

        public void setValue(double value) {
            this.value = value;
        }
    }

    /* =====================================================
       EMPLOYEE OVERVIEW
       ===================================================== */

    public static class EmployeeOverview {

        private Long id;
        private String name;
        private String email;
        private long activities;
        private double carbon;
        private double trend;

        public EmployeeOverview() {
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public long getActivities() {
            return activities;
        }

        public void setActivities(long activities) {
            this.activities = activities;
        }

        public double getCarbon() {
            return carbon;
        }

        public void setCarbon(double carbon) {
            this.carbon = carbon;
        }

        public double getTrend() {
            return trend;
        }

        public void setTrend(double trend) {
            this.trend = trend;
        }
    }
}