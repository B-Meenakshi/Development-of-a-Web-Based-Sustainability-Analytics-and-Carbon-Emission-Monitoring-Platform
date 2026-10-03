package com.meena.carbon_backend.dto;

import java.util.List;

public class OrganizationCSRReportResponse {

    private String organizationName;
    private String reportingPeriod;

    private double totalCarbon;
    private long totalActivities;

    /*
     * Total number of employees belonging to the organization.
     */
    private long totalEmployees;

    /*
     * Number of employees who actually recorded
     * at least one activity during the selected period.
     */
    private long employeesTracked;

    private double averageEmployeeFootprint;
    private double averageCarbonPerActivity;

    private List<CategoryReport> categoryData;
    private List<EmployeeReport> employeeData;
    private List<MonthlyReport> monthlyTrend;
    private List<String> highlights;

    public OrganizationCSRReportResponse() {
    }

    // ==================================================
    // GETTERS AND SETTERS
    // ==================================================

    public String getOrganizationName() {
        return organizationName;
    }

    public void setOrganizationName(String organizationName) {
        this.organizationName = organizationName;
    }

    public String getReportingPeriod() {
        return reportingPeriod;
    }

    public void setReportingPeriod(String reportingPeriod) {
        this.reportingPeriod = reportingPeriod;
    }

    public double getTotalCarbon() {
        return totalCarbon;
    }

    public void setTotalCarbon(double totalCarbon) {
        this.totalCarbon = totalCarbon;
    }

    public long getTotalActivities() {
        return totalActivities;
    }

    public void setTotalActivities(long totalActivities) {
        this.totalActivities = totalActivities;
    }

    // ==================================================
    // TOTAL EMPLOYEES
    // ==================================================

    public long getTotalEmployees() {
        return totalEmployees;
    }

    public void setTotalEmployees(long totalEmployees) {
        this.totalEmployees = totalEmployees;
    }

    // ==================================================
    // EMPLOYEES TRACKED / PARTICIPATING
    // ==================================================

    public long getEmployeesTracked() {
        return employeesTracked;
    }

    public void setEmployeesTracked(long employeesTracked) {
        this.employeesTracked = employeesTracked;
    }

    // ==================================================
    // AVERAGE EMPLOYEE FOOTPRINT
    // ==================================================

    public double getAverageEmployeeFootprint() {
        return averageEmployeeFootprint;
    }

    public void setAverageEmployeeFootprint(
            double averageEmployeeFootprint
    ) {
        this.averageEmployeeFootprint =
                averageEmployeeFootprint;
    }

    // ==================================================
    // AVERAGE CARBON PER ACTIVITY
    // ==================================================

    public double getAverageCarbonPerActivity() {
        return averageCarbonPerActivity;
    }

    public void setAverageCarbonPerActivity(
            double averageCarbonPerActivity
    ) {
        this.averageCarbonPerActivity =
                averageCarbonPerActivity;
    }

    // ==================================================
    // CATEGORY DATA
    // ==================================================

    public List<CategoryReport> getCategoryData() {
        return categoryData;
    }

    public void setCategoryData(
            List<CategoryReport> categoryData
    ) {
        this.categoryData = categoryData;
    }

    // ==================================================
    // EMPLOYEE DATA
    // ==================================================

    public List<EmployeeReport> getEmployeeData() {
        return employeeData;
    }

    public void setEmployeeData(
            List<EmployeeReport> employeeData
    ) {
        this.employeeData = employeeData;
    }

    // ==================================================
    // MONTHLY TREND
    // ==================================================

    public List<MonthlyReport> getMonthlyTrend() {
        return monthlyTrend;
    }

    public void setMonthlyTrend(
            List<MonthlyReport> monthlyTrend
    ) {
        this.monthlyTrend = monthlyTrend;
    }

    // ==================================================
    // HIGHLIGHTS
    // ==================================================

    public List<String> getHighlights() {
        return highlights;
    }

    public void setHighlights(
            List<String> highlights
    ) {
        this.highlights = highlights;
    }

    // ==================================================
    // CATEGORY REPORT
    // ==================================================

    public static class CategoryReport {

        private String category;
        private double carbon;
        private long activities;
        private double percentage;

        public CategoryReport() {
        }

        public CategoryReport(
                String category,
                double carbon,
                long activities,
                double percentage
        ) {
            this.category = category;
            this.carbon = carbon;
            this.activities = activities;
            this.percentage = percentage;
        }

        public String getCategory() {
            return category;
        }

        public void setCategory(String category) {
            this.category = category;
        }

        public double getCarbon() {
            return carbon;
        }

        public void setCarbon(double carbon) {
            this.carbon = carbon;
        }

        public long getActivities() {
            return activities;
        }

        public void setActivities(long activities) {
            this.activities = activities;
        }

        public double getPercentage() {
            return percentage;
        }

        public void setPercentage(double percentage) {
            this.percentage = percentage;
        }
    }

    // ==================================================
    // EMPLOYEE REPORT
    // ==================================================

    public static class EmployeeReport {

        private Long employeeId;
        private String employeeName;
        private String employeeEmail;
        private long activities;
        private double carbon;
        private double percentageOfOrganizationCarbon;

        public EmployeeReport() {
        }

        public EmployeeReport(
                Long employeeId,
                String employeeName,
                String employeeEmail,
                long activities,
                double carbon,
                double percentageOfOrganizationCarbon
        ) {
            this.employeeId = employeeId;
            this.employeeName = employeeName;
            this.employeeEmail = employeeEmail;
            this.activities = activities;
            this.carbon = carbon;
            this.percentageOfOrganizationCarbon =
                    percentageOfOrganizationCarbon;
        }

        public Long getEmployeeId() {
            return employeeId;
        }

        public void setEmployeeId(Long employeeId) {
            this.employeeId = employeeId;
        }

        public String getEmployeeName() {
            return employeeName;
        }

        public void setEmployeeName(String employeeName) {
            this.employeeName = employeeName;
        }

        public String getEmployeeEmail() {
            return employeeEmail;
        }

        public void setEmployeeEmail(String employeeEmail) {
            this.employeeEmail = employeeEmail;
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

        public double getPercentageOfOrganizationCarbon() {
            return percentageOfOrganizationCarbon;
        }

        public void setPercentageOfOrganizationCarbon(
                double percentageOfOrganizationCarbon
        ) {
            this.percentageOfOrganizationCarbon =
                    percentageOfOrganizationCarbon;
        }
    }

    // ==================================================
    // MONTHLY REPORT
    // ==================================================

    public static class MonthlyReport {

        private String month;
        private double carbon;
        private long activities;

        public MonthlyReport() {
        }

        public MonthlyReport(
                String month,
                double carbon,
                long activities
        ) {
            this.month = month;
            this.carbon = carbon;
            this.activities = activities;
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

        public long getActivities() {
            return activities;
        }

        public void setActivities(long activities) {
            this.activities = activities;
        }
    }
}