package com.meena.carbon_backend.controller;

import com.meena.carbon_backend.entity.Activity;
import com.meena.carbon_backend.service.ActivityService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activities")
@CrossOrigin(origins = "http://localhost:5173")
public class ActivityController {

    private final ActivityService activityService;

    public ActivityController(ActivityService activityService) {
        this.activityService = activityService;
    }

    // Add Activity
    @PostMapping
    public ResponseEntity<Activity> addActivity(
            @RequestBody Activity activity) {

        Activity savedActivity =
                activityService.saveActivity(activity);

        return ResponseEntity.ok(savedActivity);
    }

    // Get activities of a particular user
    @GetMapping("/user/{email}")
    public ResponseEntity<List<Activity>> getUserActivities(
            @PathVariable String email) {

        List<Activity> activities =
                activityService.getUserActivities(email);

        return ResponseEntity.ok(activities);
    }
    

}