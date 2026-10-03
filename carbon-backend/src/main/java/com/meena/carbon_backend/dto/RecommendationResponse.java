
package com.meena.carbon_backend.dto;

public class RecommendationResponse {

    private String activity;
    private String category;
    private double emission;
    private String message;
    private String[] tips;

    // True when recommendation came from Gemini AI
    private boolean aiGenerated;

    // =========================================================
    // DEFAULT CONSTRUCTOR
    // =========================================================

    public RecommendationResponse() {
    }

    // =========================================================
    // EXISTING CONSTRUCTOR
    // Keeps compatibility with your current RecommendationService
    // =========================================================

    public RecommendationResponse(
            String activity,
            String category,
            double emission,
            String message,
            String[] tips) {

        this.activity = activity;
        this.category = category;
        this.emission = emission;
        this.message = message;
        this.tips = tips;
        this.aiGenerated = false;
    }

    // =========================================================
    // NEW CONSTRUCTOR FOR AI RECOMMENDATIONS
    // =========================================================

    public RecommendationResponse(
            String activity,
            String category,
            double emission,
            String message,
            String[] tips,
            boolean aiGenerated) {

        this.activity = activity;
        this.category = category;
        this.emission = emission;
        this.message = message;
        this.tips = tips;
        this.aiGenerated = aiGenerated;
    }

    // =========================================================
    // GETTERS
    // =========================================================

    public String getActivity() {
        return activity;
    }

    public String getCategory() {
        return category;
    }

    public double getEmission() {
        return emission;
    }

    public String getMessage() {
        return message;
    }

    public String[] getTips() {
        return tips;
    }

    public boolean isAiGenerated() {
        return aiGenerated;
    }

    // =========================================================
    // SETTERS
    // =========================================================

    public void setActivity(String activity) {
        this.activity = activity;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public void setEmission(double emission) {
        this.emission = emission;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public void setTips(String[] tips) {
        this.tips = tips;
    }

    public void setAiGenerated(boolean aiGenerated) {
        this.aiGenerated = aiGenerated;
    }
}

