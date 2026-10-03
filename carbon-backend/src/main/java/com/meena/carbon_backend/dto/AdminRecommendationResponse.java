package com.meena.carbon_backend.dto;

public class AdminRecommendationResponse {

    private String userName;
    private String email;

    private String activity;
    private String category;
    private double emission;
    private String message;
    private String[] tips;

    private boolean aiGenerated;

    // =========================================================
    // DEFAULT CONSTRUCTOR
    // =========================================================

    public AdminRecommendationResponse() {
    }

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public AdminRecommendationResponse(
            String userName,
            String email,
            String activity,
            String category,
            double emission,
            String message,
            String[] tips,
            boolean aiGenerated) {

        this.userName = userName;
        this.email = email;
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

    public String getUserName() {
        return userName;
    }

    public String getEmail() {
        return email;
    }

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

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public void setEmail(String email) {
        this.email = email;
    }

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