package com.meena.carbon_backend.controller;

import com.meena.carbon_backend.dto.BenchmarkResponse;
import com.meena.carbon_backend.service.BenchmarkService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/benchmark")
@CrossOrigin(origins = "http://localhost:5173")
public class BenchmarkController {

    private final BenchmarkService benchmarkService;


    public BenchmarkController(
            BenchmarkService benchmarkService) {

        this.benchmarkService = benchmarkService;
    }


    // =========================================================
    // PEER BENCHMARK
    // =========================================================

    @GetMapping("/{email}")
    public ResponseEntity<BenchmarkResponse>
    getBenchmark(

            @PathVariable String email,

            @RequestParam LocalDate fromDate,

            @RequestParam LocalDate toDate) {


        BenchmarkResponse response =
                benchmarkService.getBenchmark(
                        email,
                        fromDate,
                        toDate
                );


        return ResponseEntity.ok(response);
    }
}