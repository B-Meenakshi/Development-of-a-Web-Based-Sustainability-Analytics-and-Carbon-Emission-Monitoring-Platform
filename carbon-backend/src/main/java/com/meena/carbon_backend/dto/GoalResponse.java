package com.meena.carbon_backend.dto;

import com.meena.carbon_backend.entity.Goal;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class GoalResponse {

    private Long id;
    private String userEmail;
    private String title;
    private String category;
    private String activity;
    private String description;
    private Double targetValue;
    private String unit;
    private String frequency;
    private LocalDate startDate;
    private LocalDate endDate;
    private String difficulty;
    private Double progress;
    private String status;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public GoalResponse() {
    }

    // =========================================================
    // CONVERT GOAL ENTITY → GOAL RESPONSE
    // =========================================================

    public GoalResponse(Goal goal) {

        this.id = goal.getId();
        this.userEmail = goal.getUserEmail();
        this.title = goal.getTitle();
        this.category = goal.getCategory();
        this.activity = goal.getActivity();
        this.description = goal.getDescription();
        this.targetValue = goal.getTargetValue();
        this.unit = goal.getUnit();
        this.frequency = goal.getFrequency();
        this.startDate = goal.getStartDate();
        this.endDate = goal.getEndDate();
        this.difficulty = goal.getDifficulty();
        this.progress = goal.getProgress();
        this.status = goal.getStatus();
        this.completedAt = goal.getCompletedAt();
        this.createdAt = goal.getCreatedAt();
        this.updatedAt = goal.getUpdatedAt();
    }


    // =========================================================
    // GETTERS
    // =========================================================

    public Long getId() {
        return id;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public String getTitle() {
        return title;
    }

    public String getCategory() {
        return category;
    }

    public String getActivity() {
        return activity;
    }

    public String getDescription() {
        return description;
    }

    public Double getTargetValue() {
        return targetValue;
    }

    public String getUnit() {
        return unit;
    }

    public String getFrequency() {
        return frequency;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public Double getProgress() {
        return progress;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}