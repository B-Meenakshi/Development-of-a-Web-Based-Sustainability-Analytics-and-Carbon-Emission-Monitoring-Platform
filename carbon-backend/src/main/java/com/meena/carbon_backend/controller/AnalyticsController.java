package com.meena.carbon_backend.controller;

import com.meena.carbon_backend.dto.AnalyticsResponse;
import com.meena.carbon_backend.service.AnalyticsService;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "http://localhost:5173")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(
            AnalyticsService analyticsService) {

        this.analyticsService = analyticsService;
    }


    // =========================================================
    // DAILY ANALYTICS
    // =========================================================

    @GetMapping("/daily")
    public ResponseEntity<List<AnalyticsResponse>> getDailyAnalytics(

            @RequestParam String email,

            @RequestParam
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate date,

            @RequestParam(
                    defaultValue = "All"
            )
            String category) {

        List<AnalyticsResponse> result =
                analyticsService.getDailyAnalytics(
                        email,
                        date,
                        category
                );

        return ResponseEntity.ok(result);
    }


    // =========================================================
    // WEEKLY ANALYTICS
    // =========================================================

    @GetMapping("/weekly")
    public ResponseEntity<List<AnalyticsResponse>> getWeeklyAnalytics(

            @RequestParam String email,

            @RequestParam
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate date,

            @RequestParam(
                    defaultValue = "All"
            )
            String category) {

        List<AnalyticsResponse> result =
                analyticsService.getWeeklyAnalytics(
                        email,
                        date,
                        category
                );

        return ResponseEntity.ok(result);
    }


    // =========================================================
    // MONTHLY ANALYTICS
    // =========================================================

    @GetMapping("/monthly")
    public ResponseEntity<List<AnalyticsResponse>> getMonthlyAnalytics(

            @RequestParam String email,

            @RequestParam int year,

            @RequestParam int month,

            @RequestParam(
                    defaultValue = "All"
            )
            String category) {

        List<AnalyticsResponse> result =
                analyticsService.getMonthlyAnalytics(
                        email,
                        year,
                        month,
                        category
                );

        return ResponseEntity.ok(result);
    }


    // =========================================================
    // DATE TO DATE ANALYTICS
    // =========================================================

    @GetMapping("/range")
    public ResponseEntity<List<AnalyticsResponse>> getDateRangeAnalytics(

            @RequestParam String email,

            @RequestParam
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate from,

            @RequestParam
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate to,

            @RequestParam(
                    defaultValue = "All"
            )
            String category) {

        if (from.isAfter(to)) {

            return ResponseEntity
                    .badRequest()
                    .build();
        }

        List<AnalyticsResponse> result =
                analyticsService.getDateRangeAnalytics(
                        email,
                        from,
                        to,
                        category
                );

        return ResponseEntity.ok(result);
    }
}