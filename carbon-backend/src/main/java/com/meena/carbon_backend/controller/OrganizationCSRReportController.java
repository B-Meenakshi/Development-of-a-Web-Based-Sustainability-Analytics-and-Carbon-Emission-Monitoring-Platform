package com.meena.carbon_backend.controller;

import com.meena.carbon_backend.dto.OrganizationCSRReportResponse;
import com.meena.carbon_backend.service.OrganizationCSRReportService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/organization/csr-report")
@CrossOrigin(origins = "http://localhost:5173")
public class OrganizationCSRReportController {

    private final OrganizationCSRReportService reportService;

    public OrganizationCSRReportController(
            OrganizationCSRReportService reportService
    ) {
        this.reportService = reportService;
    }

    // ============================================================
    // GENERATE CSR REPORT
    // ============================================================

    @GetMapping("/{organizationId}")
    public ResponseEntity<?> getCSRReport(

            @PathVariable Long organizationId,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate startDate,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate endDate
    ) {

        try {

            OrganizationCSRReportResponse response =
                    reportService.generateReport(
                            organizationId,
                            startDate,
                            endDate
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
                    .body("Unable to generate CSR report");
        }
    }
}