package com.meena.carbon_backend.controller;

import com.meena.carbon_backend.entity.Goal;
import com.meena.carbon_backend.repository.GoalRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/goals")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminGoalController {

    private final GoalRepository goalRepository;

    public AdminGoalController(GoalRepository goalRepository) {
        this.goalRepository = goalRepository;
    }

    // =========================================================
    // GET ALL GOALS FOR ADMIN
    // =========================================================

    @GetMapping
    public ResponseEntity<List<Goal>> getAllGoals() {

        List<Goal> goals =
                goalRepository.findAllByOrderByCreatedAtDesc();

        return ResponseEntity.ok(goals);
    }
}