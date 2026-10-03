package com.meena.carbon_backend.controller;

import com.meena.carbon_backend.entity.Activity;
import com.meena.carbon_backend.entity.Badge;
import com.meena.carbon_backend.entity.User;
import com.meena.carbon_backend.entity.UserBadge;
import com.meena.carbon_backend.repository.ActivityRepository;
import com.meena.carbon_backend.repository.UserBadgeRepository;
import com.meena.carbon_backend.repository.UserRepository;
import com.meena.carbon_backend.service.BadgeService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/badges")
@CrossOrigin(origins = "http://localhost:5173")
public class BadgeController {

    private final UserRepository userRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final ActivityRepository activityRepository;
    private final BadgeService badgeService;

    public BadgeController(
            UserRepository userRepository,
            UserBadgeRepository userBadgeRepository,
            ActivityRepository activityRepository,
            BadgeService badgeService
    ) {
        this.userRepository = userRepository;
        this.userBadgeRepository = userBadgeRepository;
        this.activityRepository = activityRepository;
        this.badgeService = badgeService;
    }


    // =========================================================
    // GET BADGES EARNED BY USER
    // =========================================================

    @GetMapping("/user/{email}")
    public ResponseEntity<?> getUserBadges(
            @PathVariable String email
    ) {

        if (email == null || email.trim().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body("User email is required");
        }


        String normalizedEmail =
                email.trim().toLowerCase();


        // =====================================================
        // FIND USER
        // =====================================================

        Optional<User> userOptional =
                userRepository.findByEmail(
                        normalizedEmail
                );


        if (userOptional.isEmpty()) {

            return ResponseEntity
                    .notFound()
                    .build();
        }


        User user =
                userOptional.get();


        // =====================================================
        // SYNCHRONIZE FIRST ACTIVITY BADGE
        //
        // This handles activities that were already logged
        // before the badge system was working.
        // =====================================================

        try {

            List<Activity> activities =
                    activityRepository
                            .findByUserEmailOrderByDateDesc(
                                    normalizedEmail
                            );


            if (activities != null &&
                    !activities.isEmpty()) {

                boolean awarded =
                        badgeService.awardBadge(
                                user,
                                "FIRST_ACTIVITY"
                        );

                System.out.println(
                        "=========================================="
                );

                System.out.println(
                        "BADGE SYNC CHECK"
                );

                System.out.println(
                        "User: " + normalizedEmail
                );

                System.out.println(
                        "Existing activities: "
                                + activities.size()
                );

                System.out.println(
                        "FIRST_ACTIVITY award result: "
                                + awarded
                );

                System.out.println(
                        "=========================================="
                );
            }

        } catch (Exception e) {

            System.out.println(
                    "FIRST_ACTIVITY badge sync failed: "
                            + e.getMessage()
            );

            e.printStackTrace();
        }


        // =====================================================
        // GET USER BADGES AFTER SYNCHRONIZATION
        // =====================================================

        List<UserBadge> userBadges =
                userBadgeRepository
                        .findByUserOrderByIdDesc(user);


        // =====================================================
        // CREATE SAFE RESPONSE
        //
        // Do NOT return JPA entities directly because
        // UserBadge contains LAZY relationships.
        // =====================================================

        List<Map<String, Object>> response =
                new ArrayList<>();


        for (UserBadge userBadge : userBadges) {

            Badge badge =
                    userBadge.getBadge();


            if (badge == null) {
                continue;
            }


            Map<String, Object> badgeData =
                    new HashMap<>();


            badgeData.put(
                    "id",
                    badge.getId()
            );

            badgeData.put(
                    "code",
                    badge.getCode()
            );

            badgeData.put(
                    "name",
                    badge.getName()
            );

            badgeData.put(
                    "description",
                    badge.getDescription()
            );

            badgeData.put(
                    "icon",
                    badge.getIcon()
            );


            response.add(
                    badgeData
            );
        }


        return ResponseEntity.ok(
                response
        );
    }
}