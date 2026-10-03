package com.meena.carbon_backend.listener;

import com.meena.carbon_backend.entity.Activity;
import com.meena.carbon_backend.entity.User;
import com.meena.carbon_backend.event.ActivityCreatedEvent;
import com.meena.carbon_backend.event.GoalCompletedEvent;
import com.meena.carbon_backend.repository.ActivityRepository;
import com.meena.carbon_backend.repository.UserRepository;
import com.meena.carbon_backend.service.BadgeService;

import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
public class BadgeAchievementListener {

    private final BadgeService badgeService;
    private final ActivityRepository activityRepository;
    private final UserRepository userRepository;

    public BadgeAchievementListener(
            BadgeService badgeService,
            ActivityRepository activityRepository,
            UserRepository userRepository
    ) {
        this.badgeService = badgeService;
        this.activityRepository = activityRepository;
        this.userRepository = userRepository;
    }


    // =========================================================
    // ACTIVITY CREATED EVENT
    // =========================================================

    @EventListener
    public void handleActivityCreated(
            ActivityCreatedEvent event
    ) {

        System.out.println(
                "========== BADGE EVENT RECEIVED =========="
        );

        if (event == null) {
            System.out.println(
                    "Badge event is NULL"
            );
            return;
        }

        Activity activity =
                event.getActivity();


        // -----------------------------------------------------
        // CHECK ACTIVITY
        // -----------------------------------------------------

        if (activity == null) {

            System.out.println(
                    "Badge event has no activity"
            );

            return;
        }


        // -----------------------------------------------------
        // CHECK USER EMAIL
        // -----------------------------------------------------

        if (activity.getUserEmail() == null ||
                activity.getUserEmail().trim().isEmpty()) {

            System.out.println(
                    "Badge event has no user email"
            );

            return;
        }


        // -----------------------------------------------------
        // NORMALIZE EMAIL
        // -----------------------------------------------------

        String email =
                activity.getUserEmail()
                        .trim()
                        .toLowerCase();


        System.out.println(
                "Badge checking user: " + email
        );


        // =====================================================
        // FIND USER
        // =====================================================

        User user =
                userRepository
                        .findByEmail(email)
                        .orElse(null);


        if (user == null) {

            System.out.println(
                    "USER NOT FOUND: " + email
            );

            return;
        }


        System.out.println(
                "USER FOUND: " + user.getEmail()
        );


        // =====================================================
        // 1. FIRST ACTIVITY BADGE
        // =====================================================

        boolean firstBadgeAwarded =
                badgeService.awardBadge(
                        user,
                        "FIRST_ACTIVITY"
                );


        System.out.println(
                "FIRST_ACTIVITY award result: "
                        + firstBadgeAwarded
        );


        // =====================================================
        // 2. 7-DAY STREAK BADGE
        // =====================================================

        checkSevenDayStreak(
                user,
                email
        );


        // =====================================================
        // 3. CARBON REDUCTION BADGES
        // =====================================================

        checkCarbonReductionBadges(
                user,
                email,
                activity.getDate()
        );
    }


    // =========================================================
    // GOAL COMPLETED EVENT
    // =========================================================

    @EventListener
    public void handleGoalCompleted(
            GoalCompletedEvent event
    ) {

        System.out.println(
                "========== GOAL COMPLETED EVENT =========="
        );


        if (event == null) {

            System.out.println(
                    "Goal completed event is NULL"
            );

            return;
        }


        User user =
                event.getUser();


        if (user == null) {

            System.out.println(
                    "Goal completed event has no user"
            );

            return;
        }


        System.out.println(
                "Goal completed by: "
                        + user.getEmail()
        );


        // =====================================================
        // GOAL ACHIEVER
        // =====================================================

        boolean awarded =
                badgeService.awardBadge(
                        user,
                        "GOAL_ACHIEVER"
                );


        System.out.println(
                "GOAL_ACHIEVER award result: "
                        + awarded
        );
    }


    // =========================================================
    // 7-DAY STREAK
    // =========================================================

    private void checkSevenDayStreak(
            User user,
            String email
    ) {

        List<Activity> activities =
                activityRepository
                        .findByUserEmailOrderByDateDesc(
                                email
                        );


        if (activities == null ||
                activities.isEmpty()) {

            System.out.println(
                    "No activities found for streak check"
            );

            return;
        }


        // -----------------------------------------------------
        // STORE UNIQUE ACTIVITY DATES
        // -----------------------------------------------------

        Set<LocalDate> activityDates =
                new HashSet<>();


        for (Activity activity : activities) {

            if (activity != null &&
                    activity.getDate() != null) {

                activityDates.add(
                        activity.getDate()
                );
            }
        }


        if (activityDates.isEmpty()) {

            System.out.println(
                    "No activity dates found for streak check"
            );

            return;
        }


        // -----------------------------------------------------
        // FIND LATEST ACTIVITY DATE
        // -----------------------------------------------------

        LocalDate latestDate =
                activityDates.stream()
                        .max(LocalDate::compareTo)
                        .orElse(null);


        if (latestDate == null) {
            return;
        }


        // -----------------------------------------------------
        // COUNT CONSECUTIVE DAYS
        // -----------------------------------------------------

        int consecutiveDays = 1;

        LocalDate currentDate =
                latestDate;


        while (
                activityDates.contains(
                        currentDate.minusDays(1)
                )
        ) {

            consecutiveDays++;

            currentDate =
                    currentDate.minusDays(1);


            if (consecutiveDays >= 7) {
                break;
            }
        }


        System.out.println(
                "Current activity streak: "
                        + consecutiveDays
                        + " days"
        );


        // -----------------------------------------------------
        // AWARD 7-DAY STREAK
        // -----------------------------------------------------

        if (consecutiveDays >= 7) {

            boolean awarded =
                    badgeService.awardBadge(
                            user,
                            "STREAK_7_DAYS"
                    );


            System.out.println(
                    "STREAK_7_DAYS award result: "
                            + awarded
            );
        }
    }


    // =========================================================
    // CARBON REDUCTION BADGES
    // =========================================================
    //
    // Current definition:
    //
    // Current 30-day emissions are compared against the
    // previous 30-day emissions.
    //
    // Reduction =
    //
    // Previous 30 days CO2e
    // -
    // Current 30 days CO2e
    //
    // =========================================================

    private void checkCarbonReductionBadges(
            User user,
            String email,
            LocalDate activityDate
    ) {

        if (activityDate == null) {

            System.out.println(
                    "Activity date is null. "
                            + "Skipping carbon reduction check."
            );

            return;
        }


        // =====================================================
        // CURRENT 30-DAY PERIOD
        // =====================================================

        LocalDate currentEndDate =
                activityDate;

        LocalDate currentStartDate =
                activityDate.minusDays(29);


        // =====================================================
        // PREVIOUS 30-DAY PERIOD
        // =====================================================

        LocalDate previousEndDate =
                activityDate.minusDays(30);

        LocalDate previousStartDate =
                activityDate.minusDays(59);


        // =====================================================
        // GET CURRENT ACTIVITIES
        // =====================================================

        List<Activity> currentActivities =
                activityRepository
                        .findByUserEmailAndDateBetween(
                                email,
                                currentStartDate,
                                currentEndDate
                        );


        // =====================================================
        // GET PREVIOUS ACTIVITIES
        // =====================================================

        List<Activity> previousActivities =
                activityRepository
                        .findByUserEmailAndDateBetween(
                                email,
                                previousStartDate,
                                previousEndDate
                        );


        // =====================================================
        // CALCULATE CURRENT CARBON
        // =====================================================

        double currentCarbon =
                calculateTotalEmission(
                        currentActivities
                );


        // =====================================================
        // CALCULATE PREVIOUS CARBON
        // =====================================================

        double previousCarbon =
                calculateTotalEmission(
                        previousActivities
                );


        // =====================================================
        // CALCULATE REDUCTION
        // =====================================================

        double reduction =
                previousCarbon -
                        currentCarbon;


        System.out.println(
                "Carbon reduction check:"
        );

        System.out.println(
                "Current 30-day carbon: "
                        + currentCarbon
        );

        System.out.println(
                "Previous 30-day carbon: "
                        + previousCarbon
        );

        System.out.println(
                "Carbon reduction: "
                        + reduction
        );


        // =====================================================
        // NO REDUCTION
        // =====================================================

        if (reduction <= 0) {

            System.out.println(
                    "No carbon reduction detected."
            );

            return;
        }


        // =====================================================
        // 10 KG REDUCTION
        // =====================================================

        if (reduction >= 10.0) {

            boolean awarded =
                    badgeService.awardBadge(
                            user,
                            "REDUCTION_10"
                    );


            System.out.println(
                    "REDUCTION_10 award result: "
                            + awarded
            );
        }


        // =====================================================
        // 25 KG REDUCTION
        // =====================================================

        if (reduction >= 25.0) {

            boolean awarded =
                    badgeService.awardBadge(
                            user,
                            "REDUCTION_25"
                    );


            System.out.println(
                    "REDUCTION_25 award result: "
                            + awarded
            );
        }


        // =====================================================
        // 50 KG REDUCTION
        // =====================================================

        if (reduction >= 50.0) {

            boolean awarded =
                    badgeService.awardBadge(
                            user,
                            "REDUCTION_50"
                    );


            System.out.println(
                    "REDUCTION_50 award result: "
                            + awarded
            );
        }
    }


    // =========================================================
    // CALCULATE TOTAL EMISSION
    // =========================================================

    private double calculateTotalEmission(
            List<Activity> activities
    ) {

        if (activities == null ||
                activities.isEmpty()) {

            return 0.0;
        }


        double total = 0.0;


        for (Activity activity : activities) {

            if (activity == null) {
                continue;
            }


            total += activity.getEmission();
        }


        return total;
    }
}