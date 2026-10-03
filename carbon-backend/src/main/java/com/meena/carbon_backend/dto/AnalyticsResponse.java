package com.meena.carbon_backend.dto;

public class AnalyticsResponse {

    // =========================================================
    // DATE / PERIOD
    // =========================================================

    private String date;

    // =========================================================
    // CATEGORY
    // =========================================================

    private String category;

    // =========================================================
    // TOTAL EMISSION
    // =========================================================

    private double totalEmission;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public AnalyticsResponse(
            String date,
            String category,
            double totalEmission) {

        this.date = date;
        this.category = category;
        this.totalEmission = totalEmission;
    }

    // =========================================================
    // GETTERS
    // =========================================================

    public String getDate() {
        return date;
    }

    public String getCategory() {
        return category;
    }

    public double getTotalEmission() {
        return totalEmission;
    }

    // =========================================================
    // SETTERS
    // =========================================================

    public void setDate(String date) {
        this.date = date;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public void setTotalEmission(double totalEmission) {
        this.totalEmission = totalEmission;
    }
}