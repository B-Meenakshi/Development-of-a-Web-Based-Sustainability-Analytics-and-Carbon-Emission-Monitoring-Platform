package com.meena.carbon_backend.dto;

import java.util.List;

public class BenchmarkResponse {

    private double userTotalEmission;
    private double platformAverageEmission;

    private int userRank;
    private int totalUsers;

    private List<CategoryBenchmark> categoryBenchmarks;


    public BenchmarkResponse() {
    }


    public BenchmarkResponse(
            double userTotalEmission,
            double platformAverageEmission,
            int userRank,
            int totalUsers,
            List<CategoryBenchmark> categoryBenchmarks) {

        this.userTotalEmission = userTotalEmission;
        this.platformAverageEmission = platformAverageEmission;
        this.userRank = userRank;
        this.totalUsers = totalUsers;
        this.categoryBenchmarks = categoryBenchmarks;
    }


    // =====================================================
    // GETTERS AND SETTERS
    // =====================================================

    public double getUserTotalEmission() {
        return userTotalEmission;
    }

    public void setUserTotalEmission(double userTotalEmission) {
        this.userTotalEmission = userTotalEmission;
    }


    public double getPlatformAverageEmission() {
        return platformAverageEmission;
    }

    public void setPlatformAverageEmission(double platformAverageEmission) {
        this.platformAverageEmission = platformAverageEmission;
    }


    public int getUserRank() {
        return userRank;
    }

    public void setUserRank(int userRank) {
        this.userRank = userRank;
    }


    public int getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(int totalUsers) {
        this.totalUsers = totalUsers;
    }


    public List<CategoryBenchmark> getCategoryBenchmarks() {
        return categoryBenchmarks;
    }

    public void setCategoryBenchmarks(
            List<CategoryBenchmark> categoryBenchmarks) {

        this.categoryBenchmarks = categoryBenchmarks;
    }


    // =====================================================
    // CATEGORY BENCHMARK
    // =====================================================

    public static class CategoryBenchmark {

        private String category;

        private double userEmission;

        private double platformAverageEmission;


        public CategoryBenchmark() {
        }


        public CategoryBenchmark(
                String category,
                double userEmission,
                double platformAverageEmission) {

            this.category = category;
            this.userEmission = userEmission;
            this.platformAverageEmission =
                    platformAverageEmission;
        }


        public String getCategory() {
            return category;
        }

        public void setCategory(String category) {
            this.category = category;
        }


        public double getUserEmission() {
            return userEmission;
        }

        public void setUserEmission(double userEmission) {
            this.userEmission = userEmission;
        }


        public double getPlatformAverageEmission() {
            return platformAverageEmission;
        }

        public void setPlatformAverageEmission(
                double platformAverageEmission) {

            this.platformAverageEmission =
                    platformAverageEmission;
        }
    }
}