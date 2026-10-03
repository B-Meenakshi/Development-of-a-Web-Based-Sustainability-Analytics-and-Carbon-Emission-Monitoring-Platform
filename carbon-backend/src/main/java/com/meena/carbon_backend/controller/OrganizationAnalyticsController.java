package com.meena.carbon_backend.controller;

import com.meena.carbon_backend.entity.Activity;
import com.meena.carbon_backend.service.OrganizationAnalyticsService;
import com.meena.carbon_backend.service.OrganizationAnalyticsService.OrganizationAnalyticsResponse;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/organization/analytics")
@CrossOrigin(origins = "http://localhost:5173")
public class OrganizationAnalyticsController {

    private final OrganizationAnalyticsService analyticsService;

    public OrganizationAnalyticsController(
            OrganizationAnalyticsService analyticsService) {

        this.analyticsService = analyticsService;
    }


    // =========================================================
    // COMPLETE ORGANIZATION ANALYTICS
    // =========================================================

    @GetMapping("/{organizationId}")
    public ResponseEntity<?> getOrganizationAnalytics(
            @PathVariable Long organizationId) {

        try {

            OrganizationAnalyticsResponse response =
                    analyticsService.getOrganizationAnalytics(
                            organizationId
                    );

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {

            return ResponseEntity.badRequest()
                    .body(e.getMessage());

        } catch (Exception e) {

            return ResponseEntity.internalServerError()
                    .body("Unable to load organization analytics");
        }
    }


    // =========================================================
    // ORGANIZATION ANALYTICS BY DATE RANGE
    // =========================================================

    @GetMapping("/{organizationId}/range")
    public ResponseEntity<?> getOrganizationAnalyticsByDateRange(
            @PathVariable Long organizationId,
            @RequestParam String startDate,
            @RequestParam String endDate) {

        try {

            LocalDate start =
                    LocalDate.parse(startDate);

            LocalDate end =
                    LocalDate.parse(endDate);

            OrganizationAnalyticsResponse response =
                    analyticsService.getOrganizationAnalytics(
                            organizationId,
                            start,
                            end
                    );

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {

            return ResponseEntity.badRequest()
                    .body(e.getMessage());

        } catch (Exception e) {

            return ResponseEntity.internalServerError()
                    .body("Unable to load organization analytics");
        }
    }


    // =========================================================
    // ALL ORGANIZATION ACTIVITIES
    // =========================================================

    @GetMapping("/{organizationId}/activities")
    public ResponseEntity<?> getOrganizationActivities(
            @PathVariable Long organizationId) {

        try {

            List<Activity> activities =
                    analyticsService.getOrganizationActivities(
                            organizationId
                    );

            return ResponseEntity.ok(activities);

        } catch (IllegalArgumentException e) {

            return ResponseEntity.badRequest()
                    .body(e.getMessage());

        } catch (Exception e) {

            return ResponseEntity.internalServerError()
                    .body("Unable to load organization activities");
        }
    }


    // =========================================================
    // ORGANIZATION ACTIVITIES BY DATE RANGE
    // =========================================================

    @GetMapping("/{organizationId}/activities/range")
    public ResponseEntity<?> getOrganizationActivitiesByDateRange(
            @PathVariable Long organizationId,
            @RequestParam String startDate,
            @RequestParam String endDate) {

        try {

            LocalDate start =
                    LocalDate.parse(startDate);

            LocalDate end =
                    LocalDate.parse(endDate);

            List<Activity> activities =
                    analyticsService
                            .getOrganizationActivitiesByDateRange(
                                    organizationId,
                                    start,
                                    end
                            );

            return ResponseEntity.ok(activities);

        } catch (IllegalArgumentException e) {

            return ResponseEntity.badRequest()
                    .body(e.getMessage());

        } catch (Exception e) {

            return ResponseEntity.internalServerError()
                    .body("Unable to load organization activities");
        }
    }


    // =========================================================
    // ONE EMPLOYEE'S ACTIVITIES
    // =========================================================

    @GetMapping("/{organizationId}/employee/{userId}")
    public ResponseEntity<?> getEmployeeActivities(
            @PathVariable Long organizationId,
            @PathVariable Long userId) {

        try {

            List<Activity> activities =
                    analyticsService.getEmployeeActivities(
                            organizationId,
                            userId
                    );

            return ResponseEntity.ok(activities);

        } catch (IllegalArgumentException e) {

            return ResponseEntity.badRequest()
                    .body(e.getMessage());

        } catch (Exception e) {

            return ResponseEntity.internalServerError()
                    .body("Unable to load employee activities");
        }
    }


    // =========================================================
    // ONE EMPLOYEE'S ACTIVITIES BY DATE RANGE
    // =========================================================

    @GetMapping(
            "/{organizationId}/employee/{userId}/range"
    )
    public ResponseEntity<?> getEmployeeActivitiesByDateRange(
            @PathVariable Long organizationId,
            @PathVariable Long userId,
            @RequestParam String startDate,
            @RequestParam String endDate) {

        try {

            LocalDate start =
                    LocalDate.parse(startDate);

            LocalDate end =
                    LocalDate.parse(endDate);

            List<Activity> activities =
                    analyticsService
                            .getEmployeeActivitiesByDateRange(
                                    organizationId,
                                    userId,
                                    start,
                                    end
                            );

            return ResponseEntity.ok(activities);

        } catch (IllegalArgumentException e) {

            return ResponseEntity.badRequest()
                    .body(e.getMessage());

        } catch (Exception e) {

            return ResponseEntity.internalServerError()
                    .body("Unable to load employee activities");
        }
    }
}