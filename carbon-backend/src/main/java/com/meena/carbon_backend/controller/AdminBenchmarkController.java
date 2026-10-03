package com.meena.carbon_backend.controller;

import com.meena.carbon_backend.dto.AdminBenchmarkResponse;
import com.meena.carbon_backend.service.AdminBenchmarkService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/admin/benchmark")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminBenchmarkController {

    private final AdminBenchmarkService
            adminBenchmarkService;

    public AdminBenchmarkController(
            AdminBenchmarkService adminBenchmarkService
    ) {
        this.adminBenchmarkService =
                adminBenchmarkService;
    }

    @GetMapping
    public ResponseEntity<AdminBenchmarkResponse>
    getBenchmark(

            @RequestParam LocalDate fromDate,

            @RequestParam LocalDate toDate

    ) {

        if (fromDate == null ||
                toDate == null) {

            return ResponseEntity.badRequest()
                    .build();
        }

        if (fromDate.isAfter(toDate)) {

            return ResponseEntity.badRequest()
                    .build();
        }

        AdminBenchmarkResponse response =
                adminBenchmarkService
                        .getBenchmark(
                                fromDate,
                                toDate
                        );

        return ResponseEntity.ok(response);
    }
}