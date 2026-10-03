package com.meena.carbon_backend.service;

import com.meena.carbon_backend.entity.Activity;
import com.meena.carbon_backend.entity.Goal;
import com.meena.carbon_backend.entity.User;
import com.meena.carbon_backend.repository.ActivityRepository;
import com.meena.carbon_backend.repository.GoalRepository;
import com.meena.carbon_backend.repository.UserRepository;
import com.meena.carbon_backend.event.GoalCompletedEvent;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class GoalService {

    private final GoalRepository goalRepository;
    private final ActivityRepository activityRepository;
    private final EmailService emailService;
    private final UserRepository userRepository;
    private final ApplicationEventPublisher eventPublisher;

    public GoalService(
            GoalRepository goalRepository,
            ActivityRepository activityRepository,
            EmailService emailService,
            UserRepository userRepository,
            ApplicationEventPublisher eventPublisher
    ) {
        this.goalRepository = goalRepository;
        this.activityRepository = activityRepository;
        this.emailService = emailService;
        this.userRepository = userRepository;
        this.eventPublisher = eventPublisher;
    }


    // =========================================================
    // CREATE GOAL
    // =========================================================

    public Goal createGoal(Goal goal) {

        if (goal == null) {
            throw new IllegalArgumentException(
                    "Goal data is required"
            );
        }

        // -----------------------------------------------------
        // USER EMAIL
        // -----------------------------------------------------

        if (goal.getUserEmail() == null ||
                goal.getUserEmail().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "User email is required"
            );
        }

        // -----------------------------------------------------
        // TITLE
        // -----------------------------------------------------

        if (goal.getTitle() == null ||
                goal.getTitle().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Goal title is required"
            );
        }

        // -----------------------------------------------------
        // CATEGORY
        // -----------------------------------------------------

        if (goal.getCategory() == null ||
                goal.getCategory().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Category is required"
            );
        }

        // -----------------------------------------------------
        // ACTIVITY
        // -----------------------------------------------------

        if (goal.getActivity() == null ||
                goal.getActivity().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Activity is required"
            );
        }

        // -----------------------------------------------------
        // FREQUENCY
        // -----------------------------------------------------

        if (goal.getFrequency() == null ||
                goal.getFrequency().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Frequency is required"
            );
        }

        // -----------------------------------------------------
        // DATES
        // -----------------------------------------------------

        if (goal.getStartDate() == null ||
                goal.getEndDate() == null) {

            throw new IllegalArgumentException(
                    "Start date and end date are required"
            );
        }

        if (goal.getEndDate()
                .isBefore(goal.getStartDate())) {

            throw new IllegalArgumentException(
                    "End date cannot be before start date"
            );
        }

        // -----------------------------------------------------
        // TARGET VALUE
        // -----------------------------------------------------

        if (goal.getTargetValue() == null ||
                goal.getTargetValue() <= 0) {

            throw new IllegalArgumentException(
                    "Target value must be greater than 0"
            );
        }

        // =====================================================
        // CLEAN INPUT VALUES
        // =====================================================

        goal.setUserEmail(
                goal.getUserEmail().trim()
        );

        goal.setTitle(
                goal.getTitle().trim()
        );

        goal.setCategory(
                goal.getCategory().trim()
        );

        goal.setActivity(
                goal.getActivity().trim()
        );

        goal.setFrequency(
                goal.getFrequency()
                        .trim()
                        .toUpperCase()
        );

        // =====================================================
        // DEFAULT PROGRESS
        // =====================================================

        goal.setProgress(0.0);

        // =====================================================
        // DEFAULT STATUS
        // =====================================================

        goal.setStatus("ACTIVE");

        // =====================================================
        // TIMESTAMPS
        // =====================================================

        LocalDateTime now =
                LocalDateTime.now();

        goal.setCreatedAt(now);
        goal.setUpdatedAt(now);
        goal.setCompletedAt(null);

        // =====================================================
        // AUTOMATIC UNIT
        // =====================================================

        if (goal.getUnit() == null ||
                goal.getUnit().trim().isEmpty()) {

            goal.setUnit(
                    getDefaultUnit(
                            goal.getCategory(),
                            goal.getActivity()
                    )
            );

        } else {

            goal.setUnit(
                    goal.getUnit().trim()
            );
        }

        // =====================================================
        // SAVE GOAL
        // =====================================================

        Goal savedGoal =
                goalRepository.save(goal);

        // =====================================================
        // SEND GOAL CREATED EMAIL
        // =====================================================

        emailService.sendGoalCreatedEmail(
                savedGoal
        );

        return savedGoal;
    }


    // =========================================================
    // GET ALL GOALS OF USER
    // =========================================================

    public List<Goal> getUserGoals(
            String email
    ) {

        return goalRepository
                .findByUserEmailOrderByCreatedAtDesc(
                        email
                );
    }


    // =========================================================
    // GET GOAL BY ID
    // =========================================================

    public Goal getGoalById(
            Long id
    ) {

        Optional<Goal> goal =
                goalRepository.findById(id);

        if (goal.isEmpty()) {

            throw new RuntimeException(
                    "Goal not found"
            );
        }

        return goal.get();
    }


    // =========================================================
    // GET ACTIVE GOALS
    // =========================================================

    public List<Goal> getActiveGoals(
            String email
    ) {

        return goalRepository
                .findByUserEmailAndStatusOrderByEndDateAsc(
                        email,
                        "ACTIVE"
                );
    }


    // =========================================================
    // GET GOALS BY CATEGORY
    // =========================================================

    public List<Goal> getGoalsByCategory(
            String email,
            String category
    ) {

        return goalRepository
                .findByUserEmailAndCategoryIgnoreCase(
                        email,
                        category
                );
    }


    // =========================================================
    // GET GOALS BY ACTIVITY
    // =========================================================

    public List<Goal> getGoalsByActivity(
            String email,
            String activity
    ) {

        return goalRepository
                .findByUserEmailAndActivityIgnoreCase(
                        email,
                        activity
                );
    }


    // =========================================================
    // UPDATE GOAL
    // =========================================================

    public Goal updateGoal(
            Long id,
            Goal updatedGoal
    ) {

        Goal existingGoal =
                getGoalById(id);

        // -----------------------------------------------------
        // VALIDATE
        // -----------------------------------------------------

        if (updatedGoal == null) {

            throw new IllegalArgumentException(
                    "Goal data is required"
            );
        }

        if (updatedGoal.getTitle() == null ||
                updatedGoal.getTitle().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Goal title is required"
            );
        }

        if (updatedGoal.getCategory() == null ||
                updatedGoal.getCategory().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Category is required"
            );
        }

        if (updatedGoal.getActivity() == null ||
                updatedGoal.getActivity().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Activity is required"
            );
        }

        if (updatedGoal.getFrequency() == null ||
                updatedGoal.getFrequency().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Frequency is required"
            );
        }

        if (updatedGoal.getStartDate() == null ||
                updatedGoal.getEndDate() == null) {

            throw new IllegalArgumentException(
                    "Start date and end date are required"
            );
        }

        if (updatedGoal.getEndDate()
                .isBefore(updatedGoal.getStartDate())) {

            throw new IllegalArgumentException(
                    "End date cannot be before start date"
            );
        }

        if (updatedGoal.getTargetValue() == null ||
                updatedGoal.getTargetValue() <= 0) {

            throw new IllegalArgumentException(
                    "Target value must be greater than 0"
            );
        }

        // =====================================================
        // UPDATE FIELDS
        // =====================================================

        existingGoal.setTitle(
                updatedGoal.getTitle().trim()
        );

        existingGoal.setCategory(
                updatedGoal.getCategory().trim()
        );

        existingGoal.setActivity(
                updatedGoal.getActivity().trim()
        );

        existingGoal.setDescription(
                updatedGoal.getDescription()
        );

        existingGoal.setTargetValue(
                updatedGoal.getTargetValue()
        );

        existingGoal.setFrequency(
                updatedGoal.getFrequency()
                        .trim()
                        .toUpperCase()
        );

        existingGoal.setStartDate(
                updatedGoal.getStartDate()
        );

        existingGoal.setEndDate(
                updatedGoal.getEndDate()
        );

        existingGoal.setDifficulty(
                updatedGoal.getDifficulty()
        );

        // =====================================================
        // UNIT
        // =====================================================

        if (updatedGoal.getUnit() == null ||
                updatedGoal.getUnit().trim().isEmpty()) {

            existingGoal.setUnit(
                    getDefaultUnit(
                            existingGoal.getCategory(),
                            existingGoal.getActivity()
                    )
            );

        } else {

            existingGoal.setUnit(
                    updatedGoal.getUnit().trim()
            );
        }

        // =====================================================
        // KEEP CURRENT PROGRESS
        // =====================================================

        if (existingGoal.getProgress() == null) {

            existingGoal.setProgress(0.0);
        }

        // =====================================================
        // KEEP STATUS
        // =====================================================

        if (existingGoal.getStatus() == null ||
                existingGoal.getStatus().trim().isEmpty()) {

            existingGoal.setStatus("ACTIVE");
        }

        // =====================================================
        // UPDATED TIMESTAMP
        // =====================================================

        existingGoal.setUpdatedAt(
                LocalDateTime.now()
        );

        // =====================================================
        // SAVE
        // =====================================================

        return goalRepository.save(
                existingGoal
        );
    }


    // =========================================================
    // DELETE GOAL
    // =========================================================

    public void deleteGoal(
            Long id
    ) {

        if (!goalRepository.existsById(id)) {

            throw new RuntimeException(
                    "Goal not found"
            );
        }

        goalRepository.deleteById(id);
    }


    // =========================================================
    // MARK EXPIRED / UNSUCCESSFUL GOALS
    // =========================================================

    public void updateExpiredGoals(
            String email
    ) {

        List<Goal> activeGoals =
                getActiveGoals(email);

        LocalDate today =
                LocalDate.now();

        for (Goal goal : activeGoals) {

            // -------------------------------------------------
            // ONLY PROCESS GOALS WHOSE END DATE HAS PASSED
            // -------------------------------------------------

            if (goal.getEndDate() == null ||
                    !goal.getEndDate().isBefore(today)) {

                continue;
            }

            // -------------------------------------------------
            // GET FULL GOAL PERIOD
            // -------------------------------------------------

            LocalDate startDate =
                    goal.getStartDate();

            LocalDate endDate =
                    goal.getEndDate();

            if (startDate == null ||
                    endDate == null) {

                continue;
            }

            // -------------------------------------------------
            // GET ALL ACTIVITIES DURING THE GOAL PERIOD
            // -------------------------------------------------

            List<Activity> activities =
                    activityRepository
                            .findByUserEmailAndDateBetween(
                                    goal.getUserEmail(),
                                    startDate,
                                    endDate
                            );

            // -------------------------------------------------
            // CALCULATE FINAL ACHIEVED VALUE
            // -------------------------------------------------

            double achievedValue =
                    calculateAchievedValue(
                            goal,
                            activities
                    );

            // -------------------------------------------------
            // CALCULATE FINAL PROGRESS
            // -------------------------------------------------

            double percentage = 0.0;

            if (goal.getTargetValue() != null &&
                    goal.getTargetValue() > 0) {

                percentage =
                        (achievedValue /
                                goal.getTargetValue()) * 100.0;
            }

            percentage = Math.min(
                    percentage,
                    100.0
            );

            // -------------------------------------------------
            // CHECK WHETHER GOAL WAS ACTUALLY COMPLETED
            // -------------------------------------------------

            if (goal.getTargetValue() != null &&
                    achievedValue >= goal.getTargetValue()) {

                // -------------------------------------------------
                // GOAL REACHED TARGET
                // -------------------------------------------------

                goal.setStatus("COMPLETED");

                goal.setProgress(100.0);

                if (goal.getCompletedAt() == null) {

                    goal.setCompletedAt(
                            LocalDateTime.now()
                    );
                }

                goal.setUpdatedAt(
                        LocalDateTime.now()
                );

                Goal savedGoal =
                        goalRepository.save(goal);

                // -------------------------------------------------
                // SEND COMPLETION EMAIL
                // -------------------------------------------------

                emailService.sendGoalCompletedEmail(
                        savedGoal,
                        achievedValue
                );

                // -------------------------------------------------
                // PUBLISH GOAL COMPLETED EVENT
                // -------------------------------------------------

                publishGoalCompletedEvent(
                        savedGoal.getUserEmail()
                );

                continue;
            }

            // -------------------------------------------------
            // GOAL WAS NOT COMPLETED
            // -------------------------------------------------

            goal.setStatus("EXPIRED");

            goal.setProgress(
                    round(percentage)
            );

            goal.setUpdatedAt(
                    LocalDateTime.now()
            );

            // -------------------------------------------------
            // SAVE EXPIRED STATUS FIRST
            // -------------------------------------------------

            Goal savedGoal =
                    goalRepository.save(goal);

            // -------------------------------------------------
            // SEND UNSUCCESSFUL EMAIL
            // -------------------------------------------------

            emailService.sendGoalUnsuccessfulEmail(
                    savedGoal,
                    achievedValue
            );
        }
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

        Optional<User> user =
                userRepository.findByEmail(
                        normalizedEmail
                );

        if (user.isEmpty()) {
            return;
        }

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

            // -------------------------------------------------
            // CATEGORY MUST MATCH
            // -------------------------------------------------

            if (!matches(
                    activity.getCategory(),
                    goal.getCategory()
            )) {

                continue;
            }

            // -------------------------------------------------
            // ACTIVITY MUST MATCH
            // -------------------------------------------------

            if (!matches(
                    activity.getActivity(),
                    goal.getActivity()
            )) {

                continue;
            }

            // -------------------------------------------------
            // ADD ACTIVITY AMOUNT
            // -------------------------------------------------

            total += activity.getAmount();
        }

        return total;
    }


    // =========================================================
    // MATCH STRINGS
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
    // ROUND VALUE
    // =========================================================

    private double round(
            double value
    ) {

        return Math.round(
                value * 100.0
        ) / 100.0;
    }


    // =========================================================
    // DEFAULT UNIT
    // =========================================================

    private String getDefaultUnit(
            String category,
            String activity
    ) {

        if (activity == null) {
            return null;
        }

        // -----------------------------------------------------
        // TRANSPORT
        // -----------------------------------------------------

        if (activity.equalsIgnoreCase("Bus") ||
                activity.equalsIgnoreCase("Bicycle") ||
                activity.equalsIgnoreCase("Train")) {

            return "trips";
        }

        if (activity.equalsIgnoreCase("Car")) {

            return "km";
        }

        // -----------------------------------------------------
        // ELECTRICITY
        // -----------------------------------------------------

        if (category != null &&
                category.equalsIgnoreCase(
                        "Electricity"
                )) {

            return "kWh";
        }

        // -----------------------------------------------------
        // FOOD
        // -----------------------------------------------------

        if (activity.equalsIgnoreCase(
                "Vegetarian Meal"
        ) ||
                activity.equalsIgnoreCase(
                        "Non-Vegetarian Meal"
                )) {

            return "meals";
        }

        // -----------------------------------------------------
        // SHOPPING
        // -----------------------------------------------------

        if (activity.equalsIgnoreCase(
                "Shopping"
        )) {

            return "purchases";
        }

        // -----------------------------------------------------
        // OTHER
        // -----------------------------------------------------

        if (category != null &&
                category.equalsIgnoreCase(
                        "Other"
                )) {

            return null;
        }

        return null;
    }
}