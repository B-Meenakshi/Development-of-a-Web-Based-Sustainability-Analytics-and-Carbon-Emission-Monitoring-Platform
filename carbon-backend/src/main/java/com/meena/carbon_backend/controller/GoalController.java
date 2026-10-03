package com.meena.carbon_backend.controller;

import com.meena.carbon_backend.dto.GoalResponse;
import com.meena.carbon_backend.entity.Goal;
import com.meena.carbon_backend.entity.GoalProgress;
import com.meena.carbon_backend.repository.GoalProgressRepository;
import com.meena.carbon_backend.service.GoalProgressService;
import com.meena.carbon_backend.service.GoalService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/goals")
@CrossOrigin(origins = "http://localhost:5173")
public class GoalController {

    private final GoalService goalService;
    private final GoalProgressService goalProgressService;
    private final GoalProgressRepository goalProgressRepository;

    public GoalController(
            GoalService goalService,
            GoalProgressService goalProgressService,
            GoalProgressRepository goalProgressRepository
    ) {
        this.goalService = goalService;
        this.goalProgressService = goalProgressService;
        this.goalProgressRepository = goalProgressRepository;
    }

    // =========================================================
    // CREATE GOAL
    // =========================================================

    @PostMapping
    public ResponseEntity<GoalResponse> createGoal(
            @RequestBody Goal goal
    ) {

        Goal createdGoal = goalService.createGoal(goal);

        /*
         * Do NOT create progress history here.
         *
         * The goal is newly created, so its progress is 0%.
         * Progress history will be updated when activities are logged.
         */

        return ResponseEntity.ok(
                new GoalResponse(createdGoal)
        );
    }


    // =========================================================
    // GET ALL GOALS OF USER
    // =========================================================

    @GetMapping("/user/{email}")
    public ResponseEntity<List<GoalResponse>> getUserGoals(
            @PathVariable String email
    ) {

        // Update expired goals
        goalService.updateExpiredGoals(email);

        // Update current progress
        goalProgressService.updateUserGoalsProgress(email);

        List<Goal> goals =
                goalService.getUserGoals(email);

        List<GoalResponse> response =
                goals.stream()
                        .map(GoalResponse::new)
                        .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }


    // =========================================================
    // GET ACTIVE GOALS
    // =========================================================

    @GetMapping("/user/{email}/active")
    public ResponseEntity<List<GoalResponse>> getActiveGoals(
            @PathVariable String email
    ) {

        goalService.updateExpiredGoals(email);

        goalProgressService.updateUserGoalsProgress(email);

        List<Goal> goals =
                goalService.getActiveGoals(email);

        List<GoalResponse> response =
                goals.stream()
                        .map(GoalResponse::new)
                        .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }


    // =========================================================
    // GET GOAL BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<GoalResponse> getGoalById(
            @PathVariable Long id
    ) {

        Goal goal =
                goalService.getGoalById(id);

        return ResponseEntity.ok(
                new GoalResponse(goal)
        );
    }


    // =========================================================
    // GET GOALS BY CATEGORY
    // =========================================================

    @GetMapping("/user/{email}/category/{category}")
    public ResponseEntity<List<GoalResponse>> getGoalsByCategory(
            @PathVariable String email,
            @PathVariable String category
    ) {

        List<Goal> goals =
                goalService.getGoalsByCategory(
                        email,
                        category
                );

        List<GoalResponse> response =
                goals.stream()
                        .map(GoalResponse::new)
                        .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }


    // =========================================================
    // GET GOALS BY ACTIVITY
    // =========================================================

    @GetMapping("/user/{email}/activity/{activity}")
    public ResponseEntity<List<GoalResponse>> getGoalsByActivity(
            @PathVariable String email,
            @PathVariable String activity
    ) {

        List<Goal> goals =
                goalService.getGoalsByActivity(
                        email,
                        activity
                );

        List<GoalResponse> response =
                goals.stream()
                        .map(GoalResponse::new)
                        .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }


    // =========================================================
    // UPDATE GOAL
    // =========================================================

    @PutMapping("/{id}")
    public ResponseEntity<GoalResponse> updateGoal(
            @PathVariable Long id,
            @RequestBody Goal updatedGoal
    ) {

        Goal goal =
                goalService.updateGoal(
                        id,
                        updatedGoal
                );

        // Recalculate progress
        Goal updated =
                goalProgressService.updateGoalProgress(goal);

        return ResponseEntity.ok(
                new GoalResponse(updated)
        );
    }


    // =========================================================
    // DELETE GOAL
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteGoal(
            @PathVariable Long id
    ) {

        // Delete progress history first
        goalProgressRepository.deleteByGoalId(id);

        // Delete goal
        goalService.deleteGoal(id);

        return ResponseEntity.ok(
                "Goal deleted successfully"
        );
    }


    // =========================================================
    // GET GOAL PROGRESS HISTORY
    // =========================================================

    @GetMapping("/{id}/progress")
    public ResponseEntity<List<GoalProgress>> getGoalProgress(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                goalProgressService.getGoalProgress(id)
        );
    }


    // =========================================================
    // REFRESH GOAL PROGRESS
    // =========================================================

    @PutMapping("/{id}/progress")
    public ResponseEntity<GoalResponse> updateGoalProgress(
            @PathVariable Long id
    ) {

        Goal goal =
                goalService.getGoalById(id);

        Goal updated =
                goalProgressService.updateGoalProgress(goal);

        return ResponseEntity.ok(
                new GoalResponse(updated)
        );
    }
}