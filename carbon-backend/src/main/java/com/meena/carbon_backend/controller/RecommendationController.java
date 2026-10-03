package com.meena.carbon_backend.controller;

import com.meena.carbon_backend.dto.RecommendationResponse;
import com.meena.carbon_backend.service.RecommendationService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@CrossOrigin(origins = "http://localhost:5173")
public class RecommendationController {

    private final RecommendationService recommendationService;

    public RecommendationController(
            RecommendationService recommendationService) {

        this.recommendationService = recommendationService;
    }

    // =========================================================
    // GET PERSONALIZED RECOMMENDATIONS
    // =========================================================

    @GetMapping("/{email}")
    public ResponseEntity<List<RecommendationResponse>>
    getRecommendations(
            @PathVariable String email) {

        List<RecommendationResponse> recommendations =
                recommendationService.getRecommendations(email);

        return ResponseEntity.ok(recommendations);
    }
}