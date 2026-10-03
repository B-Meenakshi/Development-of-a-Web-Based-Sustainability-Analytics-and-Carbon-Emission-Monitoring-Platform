package com.meena.carbon_backend.service;

import com.meena.carbon_backend.entity.Activity;
import com.meena.carbon_backend.entity.Goal;
import com.meena.carbon_backend.entity.User;
import com.meena.carbon_backend.repository.ActivityRepository;
import com.meena.carbon_backend.repository.GoalRepository;
import com.meena.carbon_backend.repository.UserRepository;
import com.meena.carbon_backend.event.ActivityCreatedEvent;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ActivityService {

    private final ActivityRepository activityRepository;
    private final GoalProgressService goalProgressService;
    private final GoalRepository goalRepository;
    private final ApplicationEventPublisher eventPublisher;

    // Badge support
    private final BadgeService badgeService;
    private final UserRepository userRepository;


    public ActivityService(
            ActivityRepository activityRepository,
            GoalProgressService goalProgressService,
            GoalRepository goalRepository,
            ApplicationEventPublisher eventPublisher,
            BadgeService badgeService,
            UserRepository userRepository
    ) {

        this.activityRepository = activityRepository;
        this.goalProgressService = goalProgressService;
        this.goalRepository = goalRepository;
        this.eventPublisher = eventPublisher;

        // Badge services
        this.badgeService = badgeService;
        this.userRepository = userRepository;
    }


    // =========================================================
    // SAVE ACTIVITY
    // =========================================================

    public Activity saveActivity(Activity activity) {

        // -----------------------------------------------------
        // BASIC VALIDATION
        // -----------------------------------------------------

        if (activity == null) {
            throw new IllegalArgumentException(
                    "Activity cannot be null"
            );
        }

        if (activity.getUserEmail() == null ||
                activity.getUserEmail().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "User email is required"
            );
        }

        if (activity.getCategory() == null ||
                activity.getCategory().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Activity category is required"
            );
        }

        if (activity.getActivity() == null ||
                activity.getActivity().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Activity name is required"
            );
        }


        // -----------------------------------------------------
        // NORMALIZE EMAIL
        // -----------------------------------------------------

        String normalizedEmail =
                activity.getUserEmail()
                        .trim()
                        .toLowerCase();

        activity.setUserEmail(normalizedEmail);


        // -----------------------------------------------------
        // DEFAULT DATE
        // -----------------------------------------------------

        if (activity.getDate() == null) {
            activity.setDate(LocalDate.now());
        }


        // -----------------------------------------------------
        // CALCULATE EMISSION
        // -----------------------------------------------------

        double emissionFactor =
                getEmissionFactor(activity);

        double emission =
                activity.getAmount() * emissionFactor;

        activity.setEmission(emission);


        // =====================================================
        // SAVE ACTIVITY
        // =====================================================

        Activity savedActivity =
                activityRepository.save(activity);


        // =====================================================
        // UPDATE GOALS + HISTORY
        // =====================================================

        updateMatchingGoals(savedActivity);


        // =====================================================
        // FIRST ACTIVITY BADGE
        // =====================================================
        //
        // Award First Step directly when the activity is saved.
        //
        // This guarantees that the first activity creates the
        // user_badges record.
        //
        // BadgeService already prevents duplicate badges.
        //
        // =====================================================

        try {

            User user =
                    userRepository
                            .findByEmail(normalizedEmail)
                            .orElse(null);

            if (user != null) {

                boolean awarded =
                        badgeService.awardBadge(
                                user,
                                "FIRST_ACTIVITY"
                        );

                System.out.println(
                        "FIRST_ACTIVITY direct award result: "
                                + awarded
                );

            } else {

                System.out.println(
                        "FIRST_ACTIVITY: User not found for email: "
                                + normalizedEmail
                );
            }

        } catch (Exception e) {

            // Badge failure should not break activity logging
            System.out.println(
                    "FIRST_ACTIVITY badge error: "
                            + e.getMessage()
            );
        }


        // =====================================================
        // PUBLISH ACTIVITY CREATED EVENT
        // =====================================================
        //
        // The event is still published so the listener can
        // handle:
        //
        // 🔥 7-Day Streak
        // 🌿 Carbon Reducer
        // 🌳 Carbon Champion
        // 🏆 Carbon Hero
        //
        // FIRST_ACTIVITY can safely be checked again because
        // BadgeService prevents duplicates.
        //
        // =====================================================

        eventPublisher.publishEvent(
                new ActivityCreatedEvent(savedActivity)
        );


        return savedActivity;
    }


    // =========================================================
    // UPDATE MATCHING GOALS
    // =========================================================

    private void updateMatchingGoals(Activity activity) {

        String userEmail =
                activity.getUserEmail().trim();

        LocalDate activityDate =
                activity.getDate();


        // -----------------------------------------------------
        // GET ACTIVE GOALS
        // -----------------------------------------------------

        List<Goal> activeGoals =
                goalRepository
                        .findByUserEmailAndStatusOrderByEndDateAsc(
                                userEmail,
                                "ACTIVE"
                        );


        // -----------------------------------------------------
        // CHECK EACH GOAL
        // -----------------------------------------------------

        for (Goal goal : activeGoals) {

            if (goal == null) {
                continue;
            }


            // -------------------------------------------------
            // CHECK DATE
            // -------------------------------------------------

            if (goal.getStartDate() == null ||
                    goal.getEndDate() == null) {

                continue;
            }

            if (activityDate.isBefore(goal.getStartDate()) ||
                    activityDate.isAfter(goal.getEndDate())) {

                continue;
            }


            // -------------------------------------------------
            // CHECK CATEGORY
            // -------------------------------------------------

            if (!matches(
                    activity.getCategory(),
                    goal.getCategory()
            )) {

                continue;
            }


            // -------------------------------------------------
            // CHECK ACTIVITY
            // -------------------------------------------------

            if (!matches(
                    activity.getActivity(),
                    goal.getActivity()
            )) {

                continue;
            }


            // =================================================
            // THIS ACTIVITY MATCHES THE GOAL
            // =================================================

            goalProgressService.updateGoalProgress(goal);


            // Update history for exact activity date
            saveHistoryForDate(
                    goal,
                    activityDate
            );
        }
    }


    // =========================================================
    // UPDATE HISTORY FOR ONE DATE
    // =========================================================

    private void saveHistoryForDate(
            Goal goal,
            LocalDate date
    ) {

        List<Activity> activities =
                activityRepository.findByUserEmailAndDate(
                        goal.getUserEmail(),
                        date
                );


        double achievedValue = 0.0;


        // -----------------------------------------------------
        // SUM MATCHING ACTIVITIES
        // -----------------------------------------------------

        for (Activity activity : activities) {

            if (!matches(
                    activity.getCategory(),
                    goal.getCategory()
            )) {

                continue;
            }

            if (!matches(
                    activity.getActivity(),
                    goal.getActivity()
            )) {

                continue;
            }

            achievedValue += activity.getAmount();
        }


        // -----------------------------------------------------
        // SAVE HISTORY
        // -----------------------------------------------------

        if (goal.getTargetValue() != null &&
                goal.getTargetValue() > 0) {

            goalProgressService.saveDailyProgress(
                    goal.getId(),
                    goal.getUserEmail(),
                    date,
                    achievedValue,
                    goal.getTargetValue()
            );
        }
    }


    // =========================================================
    // GET ALL ACTIVITIES OF USER
    // =========================================================

    public List<Activity> getUserActivities(
            String email
    ) {

        return activityRepository
                .findByUserEmailOrderByDateDesc(email);
    }


    // =========================================================
    // ACTIVITY MATCHING
    // =========================================================

    private boolean matches(
            String activityValue,
            String goalValue
    ) {

        if (activityValue == null ||
                goalValue == null) {

            return false;
        }

        return activityValue
                .trim()
                .equalsIgnoreCase(
                        goalValue.trim()
                );
    }


    // =========================================================
    // EMISSION FACTOR
    // =========================================================

    private double getEmissionFactor(
            Activity activity
    ) {

        String category =
                activity.getCategory();

        String activityName =
                activity.getActivity();


        // -----------------------------------------------------
        // TRANSPORT
        // -----------------------------------------------------

        if (category.equalsIgnoreCase("Transport")) {

            if (activityName.equalsIgnoreCase("Car")) {
                return 0.21;
            }

            if (activityName.equalsIgnoreCase("Bus")) {
                return 0.21;
            }

            if (activityName.equalsIgnoreCase("Train")) {
                return 0.21;
            }

            if (activityName.equalsIgnoreCase("Bicycle")) {
                return 0.21;
            }
        }


        // -----------------------------------------------------
        // ELECTRICITY
        // -----------------------------------------------------

        if (category.equalsIgnoreCase("Electricity")) {

            if (activityName.equalsIgnoreCase("Electricity")) {
                return 0.21;
            }
        }


        // -----------------------------------------------------
        // FOOD
        // -----------------------------------------------------

        if (category.equalsIgnoreCase("Food")) {

            if (activityName.equalsIgnoreCase(
                    "Vegetarian Meal"
            )) {

                return 0.21;
            }

            if (activityName.equalsIgnoreCase(
                    "Non-Vegetarian Meal"
            )) {

                return 0.21;
            }
        }


        // -----------------------------------------------------
        // SHOPPING
        // -----------------------------------------------------

        if (category.equalsIgnoreCase("Shopping")) {

            if (activityName.equalsIgnoreCase("Shopping")) {
                return 0.21;
            }
        }


        // -----------------------------------------------------
        // OTHER
        // -----------------------------------------------------

        if (category.equalsIgnoreCase("Other")) {

            if (activity.getEmissionFactor() == null) {
                return 0.0;
            }

            return activity.getEmissionFactor();
        }


        // -----------------------------------------------------
        // UNKNOWN ACTIVITY
        // -----------------------------------------------------

        return 0.0;
    }
}