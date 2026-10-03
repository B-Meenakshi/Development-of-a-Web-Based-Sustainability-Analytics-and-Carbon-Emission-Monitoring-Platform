package com.meena.carbon_backend.controller;

import com.meena.carbon_backend.dto.AdminRecommendationResponse;
import com.meena.carbon_backend.dto.RecommendationResponse;
import com.meena.carbon_backend.entity.User;
import com.meena.carbon_backend.repository.UserRepository;
import com.meena.carbon_backend.service.RecommendationService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/admin/recommendations")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminRecommendationController {

    private final UserRepository userRepository;
    private final RecommendationService recommendationService;

    public AdminRecommendationController(
            UserRepository userRepository,
            RecommendationService recommendationService) {

        this.userRepository = userRepository;
        this.recommendationService = recommendationService;
    }

    // =========================================================
    // GET ALL USER RECOMMENDATIONS
    // GET /api/admin/recommendations
    // =========================================================

    @GetMapping
    public ResponseEntity<List<AdminRecommendationResponse>>
    getAllRecommendations() {

        List<User> users =
                userRepository.findAll();

        List<AdminRecommendationResponse> response =
                new ArrayList<>();

        for (User user : users) {

            if (user == null ||
                    user.getEmail() == null ||
                    user.getEmail().trim().isEmpty()) {

                continue;
            }

            try {

                List<RecommendationResponse> recommendations =
                        recommendationService.getRecommendations(
                                user.getEmail()
                        );

                if (recommendations == null ||
                        recommendations.isEmpty()) {

                    continue;
                }

                for (RecommendationResponse recommendation :
                        recommendations) {

                    if (recommendation == null) {
                        continue;
                    }

                    response.add(
                            new AdminRecommendationResponse(
                                    user.getFullName(),
                                    user.getEmail(),
                                    recommendation.getActivity(),
                                    recommendation.getCategory(),
                                    recommendation.getEmission(),
                                    recommendation.getMessage(),
                                    recommendation.getTips(),
                                    recommendation.isAiGenerated()
                            )
                    );
                }

            } catch (Exception e) {

                /*
                 * If recommendation generation fails
                 * for one user, continue processing
                 * the remaining users.
                 */

                System.err.println(
                        "Unable to load recommendations for: "
                                + user.getEmail()
                );

                System.err.println(
                        "Error: " + e.getMessage()
                );
            }
        }

        return ResponseEntity.ok(response);
    }
}