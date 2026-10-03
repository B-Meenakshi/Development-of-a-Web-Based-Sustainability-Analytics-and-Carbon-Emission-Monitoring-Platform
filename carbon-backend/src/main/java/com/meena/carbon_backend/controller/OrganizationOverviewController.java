package com.meena.carbon_backend.controller;

import com.meena.carbon_backend.dto.OrganizationOverviewResponse;
import com.meena.carbon_backend.service.OrganizationOverviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/organization/overview")
@CrossOrigin(origins = "http://localhost:5173")
public class OrganizationOverviewController {

    private final OrganizationOverviewService overviewService;

    public OrganizationOverviewController(
            OrganizationOverviewService overviewService) {

        this.overviewService = overviewService;
    }

    @GetMapping("/{organizationId}")
    public ResponseEntity<?> getOverview(
            @PathVariable Long organizationId) {

        try {

            OrganizationOverviewResponse response =
                    overviewService.getOverview(
                            organizationId
                    );

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .body(
                            "Unable to load organization overview"
                    );
        }
    }
}