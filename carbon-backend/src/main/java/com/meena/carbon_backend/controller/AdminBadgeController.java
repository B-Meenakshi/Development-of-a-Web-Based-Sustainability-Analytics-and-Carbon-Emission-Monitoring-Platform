package com.meena.carbon_backend.controller;

import com.meena.carbon_backend.entity.UserBadge;
import com.meena.carbon_backend.repository.UserBadgeRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/badges")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminBadgeController {

    private final UserBadgeRepository userBadgeRepository;

    public AdminBadgeController(
            UserBadgeRepository userBadgeRepository
    ) {
        this.userBadgeRepository = userBadgeRepository;
    }


    // =========================================================
    // GET ALL USER BADGE ACHIEVEMENTS
    // =========================================================

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllBadgeAchievements() {

        List<UserBadge> userBadges =
                userBadgeRepository.findAll();

        List<Map<String, Object>> response =
                new ArrayList<>();


        for (UserBadge userBadge : userBadges) {

            if (userBadge.getUser() == null ||
                    userBadge.getBadge() == null) {

                continue;
            }


            Map<String, Object> data =
                    new HashMap<>();


            // User information
            data.put(
                    "userId",
                    userBadge.getUser().getId()
            );

            data.put(
                    "userName",
                    userBadge.getUser().getFullName()
            );

            data.put(
                    "email",
                    userBadge.getUser().getEmail()
            );


            // Badge information
            data.put(
                    "badgeId",
                    userBadge.getBadge().getId()
            );

            data.put(
                    "code",
                    userBadge.getBadge().getCode()
            );

            data.put(
                    "name",
                    userBadge.getBadge().getName()
            );

            data.put(
                    "description",
                    userBadge.getBadge().getDescription()
            );

            data.put(
                    "icon",
                    userBadge.getBadge().getIcon()
            );


            response.add(data);
        }


        return ResponseEntity.ok(response);
    }
}