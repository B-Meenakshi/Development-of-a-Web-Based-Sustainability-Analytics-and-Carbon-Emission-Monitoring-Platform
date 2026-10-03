package com.meena.carbon_backend.service;

import com.meena.carbon_backend.entity.Activity;
import com.meena.carbon_backend.entity.Goal;
import com.meena.carbon_backend.entity.GoalProgress;
import com.meena.carbon_backend.entity.User;
import com.meena.carbon_backend.event.GoalCompletedEvent;
import com.meena.carbon_backend.repository.ActivityRepository;
import com.meena.carbon_backend.repository.GoalProgressRepository;
import com.meena.carbon_backend.repository.GoalRepository;
import com.meena.carbon_backend.repository.UserRepository;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class GoalProgressService {

    private final GoalRepository goalRepository;
    private final GoalProgressRepository goalProgressRepository;
    private final ActivityRepository activityRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final UserRepository userRepository;
    private final ApplicationEventPublisher eventPublisher;

    public GoalProgressService(
            GoalRepository goalRepository,
            GoalProgressRepository goalProgressRepository,
            ActivityRepository activityRepository,
            NotificationService notificationService,
            EmailService emailService,
            UserRepository userRepository,
            ApplicationEventPublisher eventPublisher
    ) {
        this.goalRepository = goalRepository;
        this.goalProgressRepository = goalProgressRepository;
        this.activityRepository = activityRepository;
        this.notificationService = notificationService;
        this.emailService = emailService;
        this.userRepository = userRepository;
        this.eventPublisher = eventPublisher;
    }


    // =========================================================
    // UPDATE ALL ACTIVE GOALS OF A USER
    // =========================================================

    public void updateUserGoalsProgress(String userEmail) {

        List<Goal> activeGoals =
                goalRepository.findByUserEmailAndStatusOrderByEndDateAsc(
                        userEmail,
                        "ACTIVE"
                );

        for (Goal goal : activeGoals) {
            updateGoalProgress(goal);
        }
    }


    // =========================================================
    // UPDATE ONE GOAL
    // =========================================================

    public Goal updateGoalProgress(Goal goal) {

        if (goal == null) {
            return null;
        }


        // =====================================================
        // CHECK WHETHER ALREADY COMPLETED
        // =====================================================

        boolean wasAlreadyCompleted =
                "COMPLETED".equalsIgnoreCase(
                        goal.getStatus()
                );


        // =====================================================
        // VALIDATE TARGET
        // =====================================================

        if (goal.getTargetValue() == null ||
                goal.getTargetValue() <= 0) {

            goal.setProgress(0.0);
            goal.setUpdatedAt(LocalDateTime.now());

            return goalRepository.save(goal);
        }


        // =====================================================
        // GET GOAL DATES
        // =====================================================

        LocalDate startDate =
                goal.getStartDate();

        LocalDate endDate =
                goal.getEndDate();

        if (startDate == null ||
                endDate == null) {

            return goal;
        }


        // =====================================================
        // TODAY
        // =====================================================

        LocalDate today =
                LocalDate.now();


        // =====================================================
        // FUTURE GOAL
        // =====================================================

        if (today.isBefore(startDate)) {

            goal.setProgress(0.0);
            goal.setStatus("ACTIVE");
            goal.setUpdatedAt(LocalDateTime.now());

            return goalRepository.save(goal);
        }


        // =====================================================
        // DETERMINE PROGRESS END DATE
        //
        // Activities are counted:
        //
        // START DATE -> TODAY
        //
        // But never beyond END DATE.
        // =====================================================

        LocalDate progressEndDate = today;

        if (progressEndDate.isAfter(endDate)) {
            progressEndDate = endDate;
        }


        // =====================================================
        // GET ALL ACTIVITIES DURING GOAL PERIOD
        // =====================================================

        List<Activity> activities =
                activityRepository.findByUserEmailAndDateBetween(
                        goal.getUserEmail(),
                        startDate,
                        progressEndDate
                );


        // =====================================================
        // CALCULATE TOTAL ACHIEVED VALUE
        // =====================================================

        double achievedValue =
                calculateAchievedValue(
                        goal,
                        activities
                );


        // =====================================================
        // CALCULATE PROGRESS
        // =====================================================

        double percentage = 0.0;

        if (goal.getTargetValue() != null &&
                goal.getTargetValue() > 0) {

            percentage =
                    (achievedValue /
                            goal.getTargetValue()) * 100.0;
        }


        // =====================================================
        // NEVER GO ABOVE 100%
        // =====================================================

        percentage =
                Math.min(
                        percentage,
                        100.0
                );


        // =====================================================
        // ALWAYS UPDATE PROGRESS
        // =====================================================

        goal.setProgress(
                round(percentage)
        );

        goal.setUpdatedAt(
                LocalDateTime.now()
        );


        // =====================================================
        // END DATE IS INCLUSIVE
        //
        // If today == endDate:
        // Goal remains ACTIVE.
        // =====================================================

        if (!today.isAfter(endDate)) {

            goal.setStatus("ACTIVE");

            return goalRepository.save(goal);
        }


        // =====================================================
        // GOAL PERIOD HAS ENDED
        // =====================================================

        if (achievedValue >= goal.getTargetValue()) {

            // =================================================
            // COMPLETED
            // =================================================

            if (!wasAlreadyCompleted) {

                goal.setStatus("COMPLETED");

                goal.setProgress(100.0);

                goal.setCompletedAt(
                        LocalDateTime.now()
                );


                // ---------------------------------------------
                // IN-APP NOTIFICATION
                // ---------------------------------------------

                notificationService
                        .createGoalCompletionNotification(
                                goal.getUserEmail(),
                                goal.getTitle(),
                                goal.getTargetValue(),
                                goal.getUnit()
                        );


                // ---------------------------------------------
                // COMPLETION EMAIL
                // ---------------------------------------------

                emailService.sendGoalCompletedEmail(
                        goal,
                        achievedValue
                );
            }

        } else {

            // =================================================
            // GOAL NOT COMPLETED
            // =================================================

            if (!"EXPIRED".equalsIgnoreCase(
                    goal.getStatus()
            )) {

                goal.setStatus("EXPIRED");

                goal.setProgress(
                        round(percentage)
                );


                // ---------------------------------------------
                // UNSUCCESSFUL GOAL EMAIL
                // ---------------------------------------------

                emailService.sendGoalUnsuccessfulEmail(
                        goal,
                        achievedValue
                );
            }
        }


        // =====================================================
        // SAVE FINAL GOAL
        // =====================================================

        Goal savedGoal =
                goalRepository.save(goal);


        // =====================================================
        // PUBLISH GOAL COMPLETED EVENT
        //
        // Only publish when the goal has just changed
        // to COMPLETED.
        // =====================================================

        if ("COMPLETED".equalsIgnoreCase(
                savedGoal.getStatus()
        ) && !wasAlreadyCompleted) {

            publishGoalCompletedEvent(
                    savedGoal.getUserEmail()
            );
        }


        return savedGoal;
    }


    // =========================================================
    // PUBLISH GOAL COMPLETED EVENT
    // =========================================================

    private void publishGoalCompletedEvent(
            String userEmail
    ) {

        if (userEmail == null ||
                userEmail.trim().isEmpty()) {

            return;
        }

        String normalizedEmail =
                userEmail.trim().toLowerCase();


        // -----------------------------------------------------
        // FIND USER
        // -----------------------------------------------------

        Optional<User> user =
                userRepository.findByEmail(
                        normalizedEmail
                );


        if (user.isEmpty()) {
            return;
        }


        // -----------------------------------------------------
        // PUBLISH EVENT
        // -----------------------------------------------------

        eventPublisher.publishEvent(
                new GoalCompletedEvent(
                        user.get()
                )
        );
    }


    // =========================================================
    // CALCULATE ACHIEVED VALUE
    // =========================================================

    private double calculateAchievedValue(
            Goal goal,
            List<Activity> activities
    ) {

        double total = 0.0;

        if (activities == null) {
            return total;
        }


        for (Activity activity : activities) {

            if (activity == null) {
                continue;
            }


            // =================================================
            // MATCH CATEGORY
            // =================================================

            if (!matches(
                    activity.getCategory(),
                    goal.getCategory()
            )) {

                continue;
            }


            // =================================================
            // MATCH ACTIVITY
            // =================================================

            if (!matches(
                    activity.getActivity(),
                    goal.getActivity()
            )) {

                continue;
            }


            // =================================================
            // ADD ACTIVITY AMOUNT
            // =================================================

            total += activity.getAmount();
        }


        return total;
    }


    // =========================================================
    // GET PROGRESS HISTORY
    // =========================================================

    public List<GoalProgress> getGoalProgress(
            Long goalId
    ) {

        return goalProgressRepository
                .findByGoalIdOrderByDateAsc(goalId);
    }


    // =========================================================
    // SAVE DAILY PROGRESS
    // =========================================================

    public GoalProgress saveDailyProgress(
            Long goalId,
            String userEmail,
            LocalDate date,
            double achievedValue,
            double targetValue
    ) {

        // =====================================================
        // VALIDATION
        // =====================================================

        if (goalId == null ||
                userEmail == null ||
                date == null) {

            return null;
        }


        // =====================================================
        // DO NOT CREATE FUTURE PROGRESS
        // =====================================================

        if (date.isAfter(LocalDate.now())) {
            return null;
        }


        // =====================================================
        // FIND EXISTING RECORD
        // =====================================================

        GoalProgress progress =
                goalProgressRepository
                        .findByGoalIdAndDate(
                                goalId,
                                date
                        );


        // =====================================================
        // UPDATE EXISTING RECORD
        // =====================================================

        if (progress != null) {

            progress.setAchievedValue(
                    achievedValue
            );

        } else {

            // =================================================
            // CREATE NEW RECORD
            // =================================================

            progress = new GoalProgress();

            progress.setGoalId(
                    goalId
            );

            progress.setUserEmail(
                    userEmail
            );

            progress.setDate(
                    date
            );

            progress.setAchievedValue(
                    achievedValue
            );

            progress.setCreatedAt(
                    LocalDateTime.now()
            );
        }


        // =====================================================
        // CALCULATE DAILY PERCENTAGE
        // =====================================================

        double percentage = 0.0;

        if (targetValue > 0) {

            percentage =
                    (achievedValue /
                            targetValue) * 100.0;
        }


        // =====================================================
        // NEVER GO ABOVE 100%
        // =====================================================

        percentage =
                Math.min(
                        percentage,
                        100.0
                );


        progress.setProgressPercentage(
                round(percentage)
        );


        // =====================================================
        // SAVE DAILY PROGRESS
        // =====================================================

        return goalProgressRepository.save(
                progress
        );
    }


    // =========================================================
    // CHECK ACTIVITY MATCH
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
    // ROUND
    // =========================================================

    private double round(
            double value
    ) {

        return Math.round(
                value * 100.0
        ) / 100.0;
    }
}