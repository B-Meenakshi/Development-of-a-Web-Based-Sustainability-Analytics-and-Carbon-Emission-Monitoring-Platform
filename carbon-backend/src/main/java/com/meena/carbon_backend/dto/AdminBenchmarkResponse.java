package com.meena.carbon_backend.dto;

import java.util.List;

public class AdminBenchmarkResponse {

    private double platformAverageEmission;
    private double lowestEmission;
    private double highestEmission;
    private int activeUsers;
    private int totalRegisteredUsers;

    private List<FootprintRange> footprintDistribution;
    private List<CategoryBenchmark> categoryBenchmarks;

    public AdminBenchmarkResponse() {
    }

    public AdminBenchmarkResponse(
            double platformAverageEmission,
            double lowestEmission,
            double highestEmission,
            int activeUsers,
            int totalRegisteredUsers,
            List<FootprintRange> footprintDistribution,
            List<CategoryBenchmark> categoryBenchmarks
    ) {
        this.platformAverageEmission = platformAverageEmission;
        this.lowestEmission = lowestEmission;
        this.highestEmission = highestEmission;
        this.activeUsers = activeUsers;
        this.totalRegisteredUsers = totalRegisteredUsers;
        this.footprintDistribution = footprintDistribution;
        this.categoryBenchmarks = categoryBenchmarks;
    }

    public double getPlatformAverageEmission() {
        return platformAverageEmission;
    }

    public void setPlatformAverageEmission(
            double platformAverageEmission
    ) {
        this.platformAverageEmission =
                platformAverageEmission;
    }

    public double getLowestEmission() {
        return lowestEmission;
    }

    public void setLowestEmission(double lowestEmission) {
        this.lowestEmission = lowestEmission;
    }

    public double getHighestEmission() {
        return highestEmission;
    }

    public void setHighestEmission(double highestEmission) {
        this.highestEmission = highestEmission;
    }

    public int getActiveUsers() {
        return activeUsers;
    }

    public void setActiveUsers(int activeUsers) {
        this.activeUsers = activeUsers;
    }

    public int getTotalRegisteredUsers() {
        return totalRegisteredUsers;
    }

    public void setTotalRegisteredUsers(
            int totalRegisteredUsers
    ) {
        this.totalRegisteredUsers =
                totalRegisteredUsers;
    }

    public List<FootprintRange> getFootprintDistribution() {
        return footprintDistribution;
    }

    public void setFootprintDistribution(
            List<FootprintRange> footprintDistribution
    ) {
        this.footprintDistribution =
                footprintDistribution;
    }

    public List<CategoryBenchmark> getCategoryBenchmarks() {
        return categoryBenchmarks;
    }

    public void setCategoryBenchmarks(
            List<CategoryBenchmark> categoryBenchmarks
    ) {
        this.categoryBenchmarks =
                categoryBenchmarks;
    }

    // =========================================================
    // FOOTPRINT RANGE
    // =========================================================

    public static class FootprintRange {

        private String range;
        private int users;

        public FootprintRange() {
        }

        public FootprintRange(
                String range,
                int users
        ) {
            this.range = range;
            this.users = users;
        }

        public String getRange() {
            return range;
        }

        public void setRange(String range) {
            this.range = range;
        }

        public int getUsers() {
            return users;
        }

        public void setUsers(int users) {
            this.users = users;
        }
    }

    // =========================================================
    // CATEGORY BENCHMARK
    // =========================================================

    public static class CategoryBenchmark {

        private String category;
        private double averageEmission;
        private double totalEmission;

        public CategoryBenchmark() {
        }

        public CategoryBenchmark(
                String category,
                double averageEmission,
                double totalEmission
        ) {
            this.category = category;
            this.averageEmission = averageEmission;
            this.totalEmission = totalEmission;
        }

        public String getCategory() {
            return category;
        }

        public void setCategory(String category) {
            this.category = category;
        }

        public double getAverageEmission() {
            return averageEmission;
        }

        public void setAverageEmission(
                double averageEmission
        ) {
            this.averageEmission =
                    averageEmission;
        }

        public double getTotalEmission() {
            return totalEmission;
        }

        public void setTotalEmission(
                double totalEmission
        ) {
            this.totalEmission =
                    totalEmission;
        }
    }
}