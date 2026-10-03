package com.meena.carbon_backend.service;

import com.google.genai.Client;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;

import com.meena.carbon_backend.dto.RecommendationResponse;
import com.meena.carbon_backend.entity.Activity;
import com.meena.carbon_backend.entity.Goal;
import com.meena.carbon_backend.entity.GoalProgress;
import com.meena.carbon_backend.entity.Organization;
import com.meena.carbon_backend.entity.Role;
import com.meena.carbon_backend.entity.User;

import com.meena.carbon_backend.repository.ActivityRepository;
import com.meena.carbon_backend.repository.GoalProgressRepository;
import com.meena.carbon_backend.repository.GoalRepository;
import com.meena.carbon_backend.repository.UserRepository;

import io.github.cdimascio.dotenv.Dotenv;

import org.springframework.stereotype.Service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import java.time.LocalDate;
import java.time.YearMonth;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ChatbotService {

    private static final String GEMINI_MODEL =
            "gemini-3.5-flash-lite";

    private final ActivityRepository activityRepository;
    private final GoalRepository goalRepository;
    private final GoalProgressRepository goalProgressRepository;
    private final UserRepository userRepository;
    private final RecommendationService recommendationService;

    private final Client geminiClient;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public ChatbotService(
            ActivityRepository activityRepository,
            GoalRepository goalRepository,
            GoalProgressRepository goalProgressRepository,
            UserRepository userRepository,
            RecommendationService recommendationService
    ) {

        this.activityRepository = activityRepository;
        this.goalRepository = goalRepository;
        this.goalProgressRepository = goalProgressRepository;
        this.userRepository = userRepository;
        this.recommendationService = recommendationService;


        Dotenv dotenv = null;

        try {

            Path currentDir =
                    Paths.get(".env");

            Path backendDir =
                    Paths.get("carbon-backend", ".env");


            if (Files.exists(currentDir)) {

                dotenv =
                        Dotenv.configure()
                                .directory(".")
                                .ignoreIfMissing()
                                .load();

            } else if (Files.exists(backendDir)) {

                dotenv =
                        Dotenv.configure()
                                .directory("carbon-backend")
                                .ignoreIfMissing()
                                .load();

            } else {

                dotenv =
                        Dotenv.configure()
                                .ignoreIfMissing()
                                .load();
            }

        } catch (Exception e) {

            dotenv =
                    Dotenv.configure()
                            .ignoreIfMissing()
                            .load();
        }


        String apiKey =
                dotenv.get("GEMINI_API_KEY");


        if (
                apiKey == null ||
                apiKey.trim().isEmpty()
        ) {

            throw new IllegalStateException(
                    "GEMINI_API_KEY is missing from .env"
            );
        }


        geminiClient =
                Client.builder()
                        .apiKey(apiKey.trim())
                        .build();
    }


    // =========================================================
    // BASIC / VISITOR CHAT
    // =========================================================

    public String chat(String message) {

        if (
                message == null ||
                message.trim().isEmpty()
        ) {

            return "Please enter a message.";
        }


        String prompt = """
                You are CarbonTrack AI, a helpful carbon-footprint
                assistant.

                Help the user understand carbon emissions,
                sustainability, eco-friendly habits and CarbonTrack.

                Be friendly, concise and practical.

                Answer only what the user is asking.
                Do not provide unnecessary information.

                If the question is about general sustainability,
                carbon footprints, climate, transportation,
                food, electricity, waste or eco-friendly habits,
                answer using your environmental knowledge.

                Do not claim to know personal CarbonTrack data
                because the user is not currently providing
                authenticated personal data.

                User message:

                %s
                """.formatted(
                message.trim()
        );


        return callGemini(prompt);
    }


    // =========================================================
    // USER / ADMIN CHAT
    // =========================================================

    public String chat(
            String message,
            String email
    ) {

        if (
                message == null ||
                message.trim().isEmpty()
        ) {

            return "Please enter a message.";
        }


        if (
                email == null ||
                email.trim().isEmpty()
        ) {

            return chat(message);
        }


        Optional<User> userOptional =
                userRepository.findByEmail(
                        email.trim()
                );


        if (userOptional.isEmpty()) {

            return chat(message);
        }


        User user =
                userOptional.get();


        Role role =
                user.getRole();


        // =====================================================
        // ADMIN
        // =====================================================

        if (role == Role.ADMIN) {

            return adminChat(
                    message.trim()
            );
        }


        // =====================================================
        // NORMAL USER
        // =====================================================

        return userChat(
                message.trim(),
                email.trim(),
                user
        );
    }


    // =========================================================
    // USER CHAT
    // =========================================================

    private String userChat(
            String message,
            String email,
            User user
    ) {

        List<Activity> activities =
                activityRepository
                        .findByUserEmailOrderByDateDesc(
                                email
                        );


        List<Goal> goals =
                goalRepository
                        .findByUserEmailOrderByCreatedAtDesc(
                                email
                        );


        List<GoalProgress> progressList =
                goalProgressRepository
                        .findByUserEmailOrderByDateDesc(
                                email
                        );


        List<RecommendationResponse> recommendations =
                new ArrayList<>();

        try {

            recommendations =
                    recommendationService
                            .getRecommendations(email);

        } catch (Exception e) {

            System.out.println(
                    "Could not load AI recommendations: "
                            + e.getMessage()
            );
        }


        String activityContext =
                buildActivityContext(
                        activities
                );


        String goalContext =
                buildGoalContext(
                        goals,
                        progressList
                );


        String recommendationContext =
                buildRecommendationContext(
                        recommendations
                );


        String userName =
                safe(
                        user.getFullName()
                );


        if (userName.isEmpty()) {

            userName = "User";
        }


        LocalDate today =
                LocalDate.now();


        String prompt = """
                You are CarbonTrack AI, a professional and friendly
                personal carbon-footprint assistant.

                You are currently helping %s.

                Today's date is %s.

                The information below is the user's actual
                CarbonTrack information.

                ================================
                USER ACTIVITY DATA
                ================================

                %s

                ================================
                USER GOALS AND PROGRESS
                ================================

                %s

                ================================
                EXISTING AI RECOMMENDATIONS
                ================================

                %s

                ================================
                IMPORTANT RESPONSE RULES
                ================================

                1. Answer ONLY what the user is asking.

                2. Do NOT automatically display all activities,
                goals, progress and recommendations in every
                response.

                3. Keep the response concise, natural and
                conversational. Usually keep it between
                2 and 6 sentences.

                4. Use the actual user data provided above
                whenever the question is about the user's
                emissions, activities, categories, goals
                or progress.

                5. If the user asks for a list, use short
                bullet points.

                6. If the user asks about total emissions,
                give the relevant total and briefly explain it.

                7. If the user asks about a category or activity,
                give information only about that category
                or activity.

                8. If the user asks about goals, mention only
                the relevant goal, target, progress and status.

                9. If the user asks about goal progress, use
                the actual Goal Progress records provided above.

                10. If the user asks about recommendations,
                use the actual personalized recommendations
                provided above.

                11. If the user asks how to reduce emissions,
                prioritize the user's highest-emission activities
                and use the existing personalized AI
                recommendations when useful.

                12. Never invent emissions, activities, goals,
                progress, dates or recommendations.

                13. If the requested information is not available,
                clearly say that you do not have that information.

                14. Never reveal another user's information.

                15. Never reveal passwords, authentication
                information or internal application details.

                16. Do not mention MySQL, repositories, database
                tables, Java code, APIs or internal implementation
                details.

                17. Use "kg CO₂e" when discussing carbon emissions.

                18. You may use a small number of appropriate
                emojis, but keep the tone professional.

                19. Do not repeat the user's entire history unless
                they specifically ask for it.

                20. If the user asks a general carbon-footprint
                question that does not require personal data,
                answer it normally using your environmental
                knowledge.

                ================================
                USER QUESTION
                ================================

                %s

                Give the most helpful and direct answer to the
                user's question.
                """.formatted(
                userName,
                today,
                activityContext,
                goalContext,
                recommendationContext,
                message
        );


        return callGemini(prompt);
    }


    // =========================================================
    // ADMIN CHAT
    // =========================================================

    private String adminChat(
            String message
    ) {

        // =====================================================
        // LOAD USERS
        // =====================================================

        List<User> allUsers =
                userRepository.findAll();


        // =====================================================
        // SAME USER DEFINITION AS ADMIN DASHBOARD
        //
        // AdminDashboardController:
        //
        // user.getRole() == null || user.getRole() == USER
        //
        // Therefore ORGANIZATION accounts are not counted as
        // normal users here.
        // =====================================================

        List<User> users =
                allUsers.stream()
                        .filter(user ->
                                user != null &&
                                (
                                        user.getRole() == null ||
                                        user.getRole() == Role.USER
                                )
                        )
                        .toList();


        // =====================================================
        // ADMIN DASHBOARD USES ALL ACTIVITIES
        //
        // Therefore chatbot also uses ALL activities.
        // =====================================================

        List<Activity> activities =
                activityRepository.findAll()
                        .stream()
                        .filter(activity -> activity != null)
                        .toList();


        // =====================================================
        // GOALS
        // =====================================================

        Set<String> userEmails =
                users.stream()
                        .map(User::getEmail)
                        .filter(email ->
                                email != null &&
                                !email.trim().isEmpty()
                        )
                        .map(String::trim)
                        .map(String::toLowerCase)
                        .collect(Collectors.toSet());


        List<Goal> allGoals =
                goalRepository.findAll();


        List<Goal> goals =
                allGoals.stream()
                        .filter(goal ->
                                goal != null &&
                                goal.getUserEmail() != null &&
                                userEmails.contains(
                                        goal.getUserEmail()
                                                .trim()
                                                .toLowerCase()
                                )
                        )
                        .toList();


        // =====================================================
        // GOAL PROGRESS
        // =====================================================

        List<GoalProgress> allProgress =
                goalProgressRepository.findAll();


        List<GoalProgress> progressList =
                allProgress.stream()
                        .filter(progress ->
                                progress != null &&
                                progress.getUserEmail() != null &&
                                userEmails.contains(
                                        progress.getUserEmail()
                                                .trim()
                                                .toLowerCase()
                                )
                        )
                        .toList();


        // =====================================================
        // BUILD ADMIN ANALYTICS
        // =====================================================

        AdminMetrics metrics =
                calculateAdminMetrics(
                        users,
                        activities,
                        goals,
                        progressList
                );


        // =====================================================
        // EXACT ADMIN QUESTIONS
        // =====================================================

        String exactAnswer =
                getExactAdminAnswer(
                        message,
                        metrics
                );


        if (exactAnswer != null) {

            return exactAnswer;
        }


        // =====================================================
        // BUILD CONTEXT
        // =====================================================

        String analyticsContext =
                buildAdminAnalyticsContext(
                        users,
                        activities,
                        goals,
                        progressList
                );


        String recommendationContext =
                buildAdminRecommendationContext(
                        users
                );


        // =====================================================
        // ADMIN GEMINI PROMPT
        // =====================================================

        String prompt = """
                You are CarbonTrack AI, a professional and friendly
                administrative assistant.

                The current user is an ADMIN.

                Today's date is %s.

                You have access to CarbonTrack platform data.

                The information supplied below is the authoritative
                application data.

                IMPORTANT:
                NEVER calculate a different value from the supplied
                data when an exact application value is provided.

                If the supplied context says:
                "Total CO2 Emissions: X"
                and the administrator asks for total carbon,
                answer using exactly X.

                Do not substitute another number.

                ================================
                COMPLETE ADMIN ANALYTICS
                ================================

                %s

                ================================
                RECOMMENDATIONS DATA
                ================================

                %s

                ================================
                IMPORTANT RESPONSE RULES
                ================================

                1. Answer ONLY what the administrator is asking.

                2. Do NOT automatically display all application
                data in every response.

                3. Keep the response concise and conversational.

                4. Use the actual supplied application data.

                5. Do not invent users, activities, emissions,
                goals, progress, recommendations, dates or
                categories.

                6. If the administrator asks about total carbon,
                use the exact Total CO2 Emissions value.

                7. If the administrator asks about total users,
                use the exact Total Users value.

                8. If the administrator asks about total activities,
                use the exact Total Activities value.

                9. If the administrator asks about today's
                activities or emissions, use the supplied values.

                10. If the administrator asks about this month's
                emissions, use the supplied value.

                11. If the administrator asks about a category,
                use the actual category data.

                12. If the administrator asks about a user,
                use only the user data supplied.

                13. If the administrator asks about goals,
                use the actual goal data supplied.

                14. If the administrator asks about recommendations,
                use the actual recommendations supplied.

                15. Never reveal passwords or authentication
                information.

                16. Do not mention MySQL, repositories, database
                tables, Java code, APIs or internal implementation
                details.

                17. Use "kg CO₂e" when discussing emissions.

                18. General environmental questions may be answered
                using environmental knowledge.

                19. Do not use Markdown bold formatting with **.

                ================================
                ADMIN QUESTION
                ================================

                %s

                Give the most helpful and direct answer.
                """.formatted(
                LocalDate.now(),
                analyticsContext,
                recommendationContext,
                message
        );


        return callGemini(prompt);
    }


    // =========================================================
    // EXACT ADMIN ANSWERS
    // =========================================================

    private String getExactAdminAnswer(
            String message,
            AdminMetrics metrics
    ) {

        if (
                message == null ||
                metrics == null
        ) {

            return null;
        }


        String q =
                message
                        .trim()
                        .toLowerCase();


        // =====================================================
        // TOTAL CARBON
        // =====================================================

        if (
                containsAny(
                        q,
                        "total carbon",
                        "total emission",
                        "total emissions",
                        "total co2",
                        "total co2e",
                        "platform carbon",
                        "platform emission",
                        "platform emissions",
                        "overall carbon",
                        "overall emission",
                        "overall emissions",
                        "carbon footprint of the platform",
                        "platform carbon footprint"
                )
        ) {

            return "The total platform carbon emissions are "
                    + formatNumber(metrics.totalEmission)
                    + " kg CO₂e.";
        }


        // =====================================================
        // TOTAL USERS
        // =====================================================

        if (
                containsAny(
                        q,
                        "total users",
                        "how many users",
                        "number of users",
                        "user count",
                        "users count"
                )
        ) {

            return "There are "
                    + metrics.totalUsers
                    + " registered users.";
        }


        // =====================================================
        // TOTAL ACTIVITIES
        // =====================================================

        if (
                containsAny(
                        q,
                        "total activities",
                        "how many activities",
                        "number of activities",
                        "activity count",
                        "activities count"
                )
        ) {

            return "There are "
                    + metrics.totalActivities
                    + " activities recorded on the platform.";
        }


        // =====================================================
        // TODAY'S ACTIVITIES
        // =====================================================

        if (
                containsAny(
                        q,
                        "today's activities",
                        "todays activities",
                        "activities today",
                        "how many activities today"
                )
        ) {

            return "There are "
                    + metrics.todayActivities
                    + " activities recorded today.";
        }


        // =====================================================
        // TODAY'S CARBON
        // =====================================================

        if (
                containsAny(
                        q,
                        "today's carbon",
                        "todays carbon",
                        "carbon today",
                        "today's emissions",
                        "todays emissions",
                        "emissions today"
                )
        ) {

            return "Today's platform emissions are "
                    + formatNumber(metrics.todayEmission)
                    + " kg CO₂e.";
        }


        // =====================================================
        // THIS MONTH'S CARBON
        // =====================================================

        if (
                containsAny(
                        q,
                        "this month's carbon",
                        "this months carbon",
                        "carbon this month",
                        "this month's emissions",
                        "this months emissions",
                        "emissions this month",
                        "monthly carbon"
                )
        ) {

            return "This month's platform emissions are "
                    + formatNumber(metrics.monthlyEmission)
                    + " kg CO₂e.";
        }


        // =====================================================
        // THIS WEEK'S CARBON
        // =====================================================

        if (
                containsAny(
                        q,
                        "this week's carbon",
                        "this weeks carbon",
                        "carbon this week",
                        "this week's emissions",
                        "this weeks emissions",
                        "emissions this week",
                        "weekly carbon"
                )
        ) {

            return "This week's platform emissions are "
                    + formatNumber(metrics.weeklyEmission)
                    + " kg CO₂e.";
        }


        return null;
    }


    // =========================================================
    // ADMIN METRICS
    // =========================================================

    private AdminMetrics calculateAdminMetrics(
            List<User> users,
            List<Activity> activities,
            List<Goal> goals,
            List<GoalProgress> progressList
    ) {

        AdminMetrics metrics =
                new AdminMetrics();


        metrics.totalUsers =
                users == null
                        ? 0
                        : users.size();


        metrics.totalActivities =
                activities == null
                        ? 0
                        : activities.size();


        if (activities == null) {

            activities =
                    new ArrayList<>();
        }


        LocalDate today =
                LocalDate.now();


        LocalDate weekStart =
                today.minusDays(
                        today.getDayOfWeek().getValue() - 1
                );


        LocalDate monthStart =
                today.withDayOfMonth(1);


        for (Activity activity : activities) {

            if (activity == null) {
                continue;
            }


            double emission =
                    safeDouble(
                            activity.getEmission()
                    );


            metrics.totalEmission +=
                    emission;


            LocalDate date =
                    activity.getDate();


            if (date == null) {
                continue;
            }


            if (date.equals(today)) {

                metrics.todayActivities++;
                metrics.todayEmission += emission;
            }


            if (
                    !date.isBefore(weekStart) &&
                    !date.isAfter(today)
            ) {

                metrics.weeklyEmission +=
                        emission;
            }


            if (
                    !date.isBefore(monthStart) &&
                    !date.isAfter(today)
            ) {

                metrics.monthlyEmission +=
                        emission;
            }
        }


        metrics.totalEmission =
                round(metrics.totalEmission);


        metrics.todayEmission =
                round(metrics.todayEmission);


        metrics.weeklyEmission =
                round(metrics.weeklyEmission);


        metrics.monthlyEmission =
                round(metrics.monthlyEmission);


        return metrics;
    }


    // =========================================================
    // HELPER FOR EXACT QUESTION DETECTION
    // =========================================================

    private boolean containsAny(
            String value,
            String... terms
    ) {

        if (value == null) {
            return false;
        }


        for (String term : terms) {

            if (
                    term != null &&
                    value.contains(term)
            ) {

                return true;
            }
        }


        return false;
    }


    // =========================================================
    // FORMAT NUMBER
    // =========================================================

    private String formatNumber(
            double value
    ) {

        return String.format(
                java.util.Locale.US,
                "%.2f",
                value
        );
    }


    // =========================================================
    // ORGANIZATION CHAT
    // =========================================================

    public String organizationChat(
            String message,
            Organization organization
    ) {

        if (
                message == null ||
                message.trim().isEmpty()
        ) {

            return "Please enter a message.";
        }


        if (organization == null) {

            return "I could not identify your organization account. Please log in again.";
        }


        Long organizationId =
                organization.getId();


        if (organizationId == null) {

            return "I could not identify your organization. Please log in again.";
        }


        // =====================================================
        // ONLY THIS ORGANIZATION'S EMPLOYEES
        // =====================================================

        List<User> organizationEmployees =
                userRepository.findAll()
                        .stream()
                        .filter(user ->
                                user != null &&
                                user.getOrganization() != null &&
                                user.getOrganization().getId() != null &&
                                organizationId.equals(
                                        user.getOrganization().getId()
                                )
                        )
                        .toList();


        Set<String> employeeEmails =
                organizationEmployees
                        .stream()
                        .map(User::getEmail)
                        .filter(email ->
                                email != null &&
                                !email.trim().isEmpty()
                        )
                        .map(String::trim)
                        .map(String::toLowerCase)
                        .collect(Collectors.toSet());


        List<Activity> organizationActivities =
                activityRepository.findAll()
                        .stream()
                        .filter(activity ->
                                activity != null &&
                                activity.getUserEmail() != null &&
                                employeeEmails.contains(
                                        activity.getUserEmail()
                                                .trim()
                                                .toLowerCase()
                                )
                        )
                        .toList();


        List<Goal> organizationGoals =
                goalRepository.findAll()
                        .stream()
                        .filter(goal ->
                                goal != null &&
                                goal.getUserEmail() != null &&
                                employeeEmails.contains(
                                        goal.getUserEmail()
                                                .trim()
                                                .toLowerCase()
                                )
                        )
                        .toList();


        List<GoalProgress> organizationProgress =
                goalProgressRepository.findAll()
                        .stream()
                        .filter(progress ->
                                progress != null &&
                                progress.getUserEmail() != null &&
                                employeeEmails.contains(
                                        progress.getUserEmail()
                                                .trim()
                                                .toLowerCase()
                                )
                        )
                        .toList();


        String organizationName =
                safe(
                        organization.getName()
                );


        if (organizationName.isEmpty()) {

            organizationName =
                    "your organization";
        }


        // =====================================================
        // BUILD CONTEXT
        // =====================================================

        String employeeContext =
                buildOrganizationEmployeeContext(
                        organizationEmployees,
                        organizationActivities,
                        organizationGoals
                );


        String activityContext =
                buildActivityContext(
                        organizationActivities
                );


        String goalContext =
                buildGoalContext(
                        organizationGoals,
                        organizationProgress
                );


        LocalDate today =
                LocalDate.now();


        String prompt = """
                You are CarbonTrack AI, a professional and friendly
                carbon-footprint assistant for an organization.

                You are currently helping organization:
                %s

                Today's date is %s.

                The information below belongs ONLY to this
                organization and its employees.

                ================================
                ORGANIZATION EMPLOYEES
                ================================

                %s

                ================================
                ORGANIZATION ACTIVITY DATA
                ================================

                %s

                ================================
                ORGANIZATION GOALS AND PROGRESS
                ================================

                %s

                ================================
                STRICT DATA ACCESS RULES
                ================================

                1. You are assisting the currently authenticated
                organization only.

                2. You may use ONLY the organization data provided
                in this prompt.

                3. The employee list contains ONLY employees
                belonging to this organization.

                4. Activities belong ONLY to employees of this
                organization.

                5. Goals belong ONLY to employees of this
                organization.

                6. Goal progress belongs ONLY to employees of this
                organization.

                7. NEVER invent another employee.

                8. NEVER reveal another organization's information.

                9. NEVER claim access to data that is not provided.

                10. NEVER reveal passwords, authentication data,
                database information or internal implementation
                details.

                ================================
                RESPONSE RULES
                ================================

                1. Answer ONLY what the organization is asking.

                2. Do NOT automatically display all organization
                data in every response.

                3. Keep the answer concise and conversational.

                4. If the organization asks for employee count,
                use the actual employee count.

                5. If the organization asks about total emissions,
                use the actual activity data provided.

                6. If the organization asks about monthly emissions,
                use the actual current-month activity data.

                7. If the organization asks about an employee,
                use only an employee from the supplied employee list.

                8. If the organization asks which employee has
                the highest emissions, compare the supplied employee
                activity data.

                9. If the organization asks about goals, use the
                supplied organization employee goals.

                10. If the organization asks about goal progress,
                use the supplied GoalProgress information.

                11. If the organization asks about categories,
                provide information based on the actual activity
                records.

                12. If the organization asks for a list,
                use short bullet points.

                13. Never invent emissions, employees, activities,
                goals, progress, dates or statistics.

                14. If requested information is not available,
                clearly say that it is not available.

                15. Use "kg CO₂e" when discussing emissions.

                16. General sustainability questions can be answered
                using your environmental knowledge.

                17. Do not mention MySQL, repositories, Java code,
                APIs or internal implementation details.

                18. Do not use Markdown bold formatting with **.

                ================================
                ORGANIZATION QUESTION
                ================================

                %s

                Give the most helpful and direct answer.
                """.formatted(
                organizationName,
                today,
                employeeContext,
                activityContext,
                goalContext,
                message.trim()
        );


        return callGemini(prompt);
    }


    // =========================================================
    // ORGANIZATION EMPLOYEE CONTEXT
    // =========================================================

    private String buildOrganizationEmployeeContext(
            List<User> employees,
            List<Activity> activities,
            List<Goal> goals
    ) {

        if (
                employees == null ||
                employees.isEmpty()
        ) {

            return "No employees are currently available.";
        }


        Map<String, Double> employeeEmissionMap =
                new HashMap<>();


        if (activities != null) {

            for (Activity activity : activities) {

                if (
                        activity == null ||
                        activity.getUserEmail() == null
                ) {

                    continue;
                }


                String email =
                        activity.getUserEmail()
                                .trim()
                                .toLowerCase();


                double emission =
                        safeDouble(
                                activity.getEmission()
                        );


                employeeEmissionMap.merge(
                        email,
                        emission,
                        Double::sum
                );
            }
        }


        StringBuilder result =
                new StringBuilder();


        result.append(
                "Total Employees: "
        );

        result.append(
                employees.size()
        );

        result.append(
                "\n\n"
        );


        for (User employee : employees) {

            if (employee == null) {
                continue;
            }


            String name =
                    safe(
                            employee.getFullName()
                    );


            if (name.isEmpty()) {

                name =
                        "Unknown Employee";
            }


            String email =
                    safe(
                            employee.getEmail()
                    );


            double emission =
                    employeeEmissionMap.getOrDefault(
                            email.toLowerCase(),
                            0.0
                    );


            long employeeGoalCount =
                    goals == null
                            ? 0
                            : goals.stream()
                                    .filter(goal ->
                                            goal != null &&
                                            goal.getUserEmail() != null &&
                                            email.equalsIgnoreCase(
                                                    goal.getUserEmail()
                                            )
                                    )
                                    .count();


            result.append(
                    "Employee: "
            );

            result.append(
                    name
            );

            result.append(
                    " | Email: "
            );

            result.append(
                    email
            );

            result.append(
                    " | Total Emission: "
            );

            result.append(
                    round(emission)
            );

            result.append(
                    " kg CO2e"
            );

            result.append(
                    " | Goals: "
            );

            result.append(
                    employeeGoalCount
            );

            result.append(
                    "\n"
            );
        }


        result.append(
                "\nEmployee Emission Breakdown:\n"
        );


        List<Map.Entry<String, Double>> sortedEmployees =
                new ArrayList<>(
                        employeeEmissionMap.entrySet()
                );


        sortedEmployees.sort(
                Map.Entry
                        .<String, Double>comparingByValue()
                        .reversed()
        );


        for (
                Map.Entry<String, Double> entry
                : sortedEmployees
        ) {

            String employeeName =
                    findUserName(
                            employees,
                            entry.getKey()
                    );


            result.append(
                    "- "
            );

            result.append(
                    employeeName
            );

            result.append(
                    " ("
            );

            result.append(
                    entry.getKey()
            );

            result.append(
                    "): "
            );

            result.append(
                    round(
                            entry.getValue()
                    )
            );

            result.append(
                    " kg CO2e\n"
            );
        }


        return result.toString();
    }


    // =========================================================
    // ADMIN ANALYTICS CONTEXT
    // =========================================================

    private String buildAdminAnalyticsContext(
            List<User> users,
            List<Activity> activities,
            List<Goal> goals,
            List<GoalProgress> progressList
    ) {

        if (users == null) {
            users = new ArrayList<>();
        }

        if (activities == null) {
            activities = new ArrayList<>();
        }

        if (goals == null) {
            goals = new ArrayList<>();
        }

        if (progressList == null) {
            progressList = new ArrayList<>();
        }


        LocalDate today =
                LocalDate.now();


        LocalDate weekStart =
                today.minusDays(
                        today.getDayOfWeek().getValue() - 1
                );


        LocalDate monthStart =
                today.withDayOfMonth(1);


        int totalUsers =
                users.size();


        int totalActivities =
                activities.size();


        int totalGoals =
                goals.size();


        int activeGoals = 0;
        int completedGoals = 0;
        int expiredGoals = 0;


        for (Goal goal : goals) {

            String status =
                    safe(goal.getStatus())
                            .toUpperCase();


            if ("ACTIVE".equals(status)) {
                activeGoals++;
            }


            if ("COMPLETED".equals(status)) {
                completedGoals++;
            }


            if ("EXPIRED".equals(status)) {
                expiredGoals++;
            }
        }


        double totalEmission = 0.0;
        double todayEmission = 0.0;
        double weeklyEmission = 0.0;
        double monthlyEmission = 0.0;


        Map<String, Double> userEmissionMap =
                new HashMap<>();


        Map<String, Double> categoryEmissionMap =
                new HashMap<>();


        for (Activity activity : activities) {

            if (activity == null) {
                continue;
            }


            double emission =
                    safeDouble(
                            activity.getEmission()
                    );


            totalEmission +=
                    emission;


            LocalDate date =
                    activity.getDate();


            if (date != null) {

                if (date.equals(today)) {
                    todayEmission += emission;
                }


                if (
                        !date.isBefore(weekStart) &&
                        !date.isAfter(today)
                ) {

                    weeklyEmission += emission;
                }


                if (
                        !date.isBefore(monthStart) &&
                        !date.isAfter(today)
                ) {

                    monthlyEmission += emission;
                }
            }


            String email =
                    safe(
                            activity.getUserEmail()
                    );


            if (!email.isEmpty()) {

                userEmissionMap.merge(
                        email,
                        emission,
                        Double::sum
                );
            }


            String category =
                    safe(
                            activity.getCategory()
                    );


            if (category.isEmpty()) {

                category =
                        "Other";
            }


            categoryEmissionMap.merge(
                    category,
                    emission,
                    Double::sum
            );
        }


        double averageEmission =
                totalUsers > 0
                        ? totalEmission / totalUsers
                        : 0.0;


        String topUserEmail =
                "None";


        double topUserEmission =
                0.0;


        for (
                Map.Entry<String, Double> entry
                : userEmissionMap.entrySet()
        ) {

            if (
                    entry.getValue()
                            > topUserEmission
            ) {

                topUserEmail =
                        entry.getKey();

                topUserEmission =
                        entry.getValue();
            }
        }


        String topCategory =
                "None";


        double topCategoryEmission =
                0.0;


        for (
                Map.Entry<String, Double> entry
                : categoryEmissionMap.entrySet()
        ) {

            if (
                    entry.getValue()
                            > topCategoryEmission
            ) {

                topCategory =
                        entry.getKey();

                topCategoryEmission =
                        entry.getValue();
            }
        }


        StringBuilder userDetails =
                new StringBuilder();


        for (User user : users) {

            String email =
                    safe(user.getEmail());


            if (email.isEmpty()) {
                continue;
            }


            String name =
                    safe(user.getFullName());


            if (name.isEmpty()) {
                name = "Unknown User";
            }


            double emission =
                    userEmissionMap.getOrDefault(
                            email,
                            0.0
                    );


            List<Goal> userGoals =
                    goals.stream()
                            .filter(
                                    goal ->
                                            email.equalsIgnoreCase(
                                                    safe(goal.getUserEmail())
                                            )
                            )
                            .toList();


            long userActiveGoals =
                    userGoals.stream()
                            .filter(
                                    goal ->
                                            "ACTIVE".equalsIgnoreCase(
                                                    safe(goal.getStatus())
                                            )
                            )
                            .count();


            long userCompletedGoals =
                    userGoals.stream()
                            .filter(
                                    goal ->
                                            "COMPLETED".equalsIgnoreCase(
                                                    safe(goal.getStatus())
                                            )
                            )
                            .count();


            userDetails.append(
                    "User: "
            );

            userDetails.append(
                    name
            );

            userDetails.append(
                    " | Email: "
            );

            userDetails.append(
                    email
            );

            userDetails.append(
                    " | Role: USER"
            );

            userDetails.append(
                    " | Total Emission: "
            );

            userDetails.append(
                    round(emission)
            );

            userDetails.append(
                    " kg CO2e"
            );

            userDetails.append(
                    " | Goals: "
            );

            userDetails.append(
                    userGoals.size()
            );

            userDetails.append(
                    " | Active Goals: "
            );

            userDetails.append(
                    userActiveGoals
            );

            userDetails.append(
                    " | Completed Goals: "
            );

            userDetails.append(
                    userCompletedGoals
            );

            userDetails.append(
                    "\n"
            );
        }


        StringBuilder userBreakdown =
                new StringBuilder();


        List<Map.Entry<String, Double>> sortedUsers =
                new ArrayList<>(
                        userEmissionMap.entrySet()
                );


        sortedUsers.sort(
                Map.Entry
                        .<String, Double>comparingByValue()
                        .reversed()
        );


        for (
                Map.Entry<String, Double> entry
                : sortedUsers
        ) {

            String userName =
                    findUserName(
                            users,
                            entry.getKey()
                    );


            userBreakdown.append(
                    "- "
            );

            userBreakdown.append(
                    userName
            );

            userBreakdown.append(
                    " ("
            );

            userBreakdown.append(
                    entry.getKey()
            );

            userBreakdown.append(
                    "): "
            );

            userBreakdown.append(
                    round(
                            entry.getValue()
                    )
            );

            userBreakdown.append(
                    " kg CO2e\n"
            );
        }


        StringBuilder categoryBreakdown =
                new StringBuilder();


        List<Map.Entry<String, Double>> sortedCategories =
                new ArrayList<>(
                        categoryEmissionMap.entrySet()
                );


        sortedCategories.sort(
                Map.Entry
                        .<String, Double>comparingByValue()
                        .reversed()
        );


        for (
                Map.Entry<String, Double> entry
                : sortedCategories
        ) {

            categoryBreakdown.append(
                    "- "
            );

            categoryBreakdown.append(
                    entry.getKey()
            );

            categoryBreakdown.append(
                    ": "
            );

            categoryBreakdown.append(
                    round(
                            entry.getValue()
                    )
            );

            categoryBreakdown.append(
                    " kg CO2e\n"
            );
        }


        StringBuilder goalDetails =
                new StringBuilder();


        for (Goal goal : goals) {

            String goalEmail =
                    safe(goal.getUserEmail());


            String goalUserName =
                    findUserName(
                            users,
                            goalEmail
                    );


            goalDetails.append(
                    "Goal: "
            );

            goalDetails.append(
                    safe(goal.getTitle())
            );

            goalDetails.append(
                    " | User: "
            );

            goalDetails.append(
                    goalUserName
            );

            goalDetails.append(
                    " | Email: "
            );

            goalDetails.append(
                    goalEmail
            );

            goalDetails.append(
                    " | Category: "
            );

            goalDetails.append(
                    safe(goal.getCategory())
            );

            goalDetails.append(
                    " | Activity: "
            );

            goalDetails.append(
                    safe(goal.getActivity())
            );

            goalDetails.append(
                    " | Target: "
            );

            goalDetails.append(
                    safeDouble(
                            goal.getTargetValue()
                    )
            );

            goalDetails.append(
                    " "
            );

            goalDetails.append(
                    safe(goal.getUnit())
            );

            goalDetails.append(
                    " | Frequency: "
            );

            goalDetails.append(
                    safe(goal.getFrequency())
            );

            goalDetails.append(
                    " | Progress: "
            );

            goalDetails.append(
                    safeDouble(
                            goal.getProgress()
                    )
            );

            goalDetails.append(
                    "% | Status: "
            );

            goalDetails.append(
                    safe(goal.getStatus())
            );

            goalDetails.append(
                    " | Start: "
            );

            goalDetails.append(
                    safeDate(
                            goal.getStartDate()
                    )
            );

            goalDetails.append(
                    " | End: "
            );

            goalDetails.append(
                    safeDate(
                            goal.getEndDate()
                    )
            );

            goalDetails.append(
                    "\n"
            );
        }


        StringBuilder progressDetails =
                new StringBuilder();


        for (GoalProgress progress : progressList) {

            String progressEmail =
                    safe(
                            progress.getUserEmail()
                    );


            String progressUserName =
                    findUserName(
                            users,
                            progressEmail
                    );


            progressDetails.append(
                    "- User: "
            );

            progressDetails.append(
                    progressUserName
            );

            progressDetails.append(
                    " | Email: "
            );

            progressDetails.append(
                    progressEmail
            );

            progressDetails.append(
                    " | Goal ID: "
            );

            progressDetails.append(
                    progress.getGoalId() == null
                            ? ""
                            : progress.getGoalId().toString()
            );

            progressDetails.append(
                    " | Date: "
            );

            progressDetails.append(
                    safeDate(
                            progress.getDate()
                    )
            );

            progressDetails.append(
                    " | Achieved: "
            );

            progressDetails.append(
                    safeDouble(
                            progress.getAchievedValue()
                    )
            );

            progressDetails.append(
                    " | Progress: "
            );

            progressDetails.append(
                    safeDouble(
                            progress.getProgressPercentage()
                    )
            );

            progressDetails.append(
                    "%\n"
            );
        }


        return """
                ================================
                APPLICATION SUMMARY
                ================================

                Total Users: %d

                Total Activities: %d

                Total Goals: %d

                Active Goals: %d

                Completed Goals: %d

                Expired Goals: %d

                Total CO2 Emissions: %.2f kg CO2e

                Average CO2 Emissions per User: %.2f kg CO2e

                Today's Emissions: %.2f kg CO2e

                This Week's Emissions: %.2f kg CO2e

                This Month's Emissions: %.2f kg CO2e

                Highest Emission User:
                %s
                %.2f kg CO2e

                Highest Emission Category:
                %s
                %.2f kg CO2e

                ================================
                ALL NORMAL USERS
                ================================

                %s

                ================================
                EMISSIONS BY USER
                ================================

                %s

                ================================
                EMISSIONS BY CATEGORY
                ================================

                %s

                ================================
                ALL USER GOALS
                ================================

                %s

                ================================
                ALL USER GOAL PROGRESS
                ================================

                %s
                """.formatted(
                totalUsers,
                totalActivities,
                totalGoals,
                activeGoals,
                completedGoals,
                expiredGoals,
                totalEmission,
                averageEmission,
                todayEmission,
                weeklyEmission,
                monthlyEmission,
                topUserEmail,
                topUserEmission,
                topCategory,
                topCategoryEmission,
                userDetails,
                userBreakdown,
                categoryBreakdown,
                goalDetails,
                progressDetails
        );
    }


    // =========================================================
    // ADMIN RECOMMENDATIONS
    // =========================================================

    private String buildAdminRecommendationContext(
            List<User> users
    ) {

        if (
                users == null ||
                users.isEmpty()
        ) {

            return "No normal users are currently available.";
        }


        StringBuilder result =
                new StringBuilder();


        for (User user : users) {

            if (user == null) {
                continue;
            }


            if (user.getRole() == Role.ADMIN) {
                continue;
            }


            String email =
                    safe(
                            user.getEmail()
                    );


            if (email.isEmpty()) {
                continue;
            }


            String name =
                    safe(
                            user.getFullName()
                    );


            if (name.isEmpty()) {
                name =
                        "Unknown User";
            }


            List<RecommendationResponse> recommendations =
                    new ArrayList<>();


            try {

                recommendations =
                        recommendationService
                                .getRecommendations(email);

            } catch (Exception e) {

                System.out.println(
                        "Could not load recommendations for "
                                + email
                                + ": "
                                + e.getMessage()
                );
            }


            result.append(
                    "User: "
            );

            result.append(
                    name
            );

            result.append(
                    " | Email: "
            );

            result.append(
                    email
            );

            result.append(
                    "\n"
            );


            if (
                    recommendations == null ||
                    recommendations.isEmpty()
            ) {

                result.append(
                        "Recommendations: None currently available.\n\n"
                );

                continue;
            }


            result.append(
                    "Recommendations:\n"
            );


            for (
                    RecommendationResponse recommendation
                    : recommendations
            ) {

                if (recommendation == null) {
                    continue;
                }


                result.append(
                        "- Activity: "
                );

                result.append(
                        safe(
                                recommendation.getActivity()
                        )
                );

                result.append(
                        "\n"
                );


                result.append(
                        "  Message: "
                );

                result.append(
                        safe(
                                recommendation.getMessage()
                        )
                );

                result.append(
                        "\n"
                );


                if (
                        recommendation.getTips() != null
                ) {

                    result.append(
                            "  Tips:\n"
                    );


                    for (String tip :
                            recommendation.getTips()) {

                        if (
                                tip == null ||
                                tip.trim().isEmpty()
                        ) {

                            continue;
                        }


                        result.append(
                                "    - "
                        );

                        result.append(
                                tip
                        );

                        result.append(
                                "\n"
                        );
                    }
                }
            }


            result.append(
                    "\n"
            );
        }


        return result.toString();
    }


    // =========================================================
    // ACTIVITY CONTEXT
    // =========================================================

    private String buildActivityContext(
            List<Activity> activities
    ) {

        if (
                activities == null ||
                activities.isEmpty()
        ) {

            return "No activity records are available.\n";
        }


        YearMonth currentMonth =
                YearMonth.now();


        double totalEmission =
                0.0;


        double monthlyEmission =
                0.0;


        Map<String, Double> categoryTotals =
                new HashMap<>();


        StringBuilder details =
                new StringBuilder();


        for (Activity activity : activities) {

            if (activity == null) {
                continue;
            }


            double emission =
                    safeDouble(
                            activity.getEmission()
                    );


            totalEmission +=
                    emission;


            LocalDate date =
                    activity.getDate();


            if (
                    date != null &&
                    YearMonth.from(date)
                            .equals(currentMonth)
            ) {

                monthlyEmission +=
                        emission;
            }


            String category =
                    safe(
                            activity.getCategory()
                    );


            if (category.isEmpty()) {

                category =
                        "Other";
            }


            categoryTotals.merge(
                    category,
                    emission,
                    Double::sum
            );


            details.append(
                    "- Date: "
            );

            details.append(
                    safeDate(date)
            );

            details.append(
                    ", Category: "
            );

            details.append(
                    category
            );

            details.append(
                    ", Activity: "
            );

            details.append(
                    safe(
                            activity.getActivity()
                    )
            );

            details.append(
                    ", Amount: "
            );

            details.append(
                    safeDouble(
                            activity.getAmount()
                    )
            );

            details.append(
                    " "
            );

            details.append(
                    safe(
                            activity.getUnit()
                    )
            );

            details.append(
                    ", Emission: "
            );

            details.append(
                    round(emission)
            );

            details.append(
                    " kg CO2e"
            );


            if (
                    activity.getDetails() != null &&
                    !activity.getDetails()
                            .trim()
                            .isEmpty()
            ) {

                details.append(
                        ", Details: "
                );

                details.append(
                        activity.getDetails()
                );
            }


            details.append(
                    "\n"
            );
        }


        StringBuilder categoryContext =
                new StringBuilder();


        categoryTotals.entrySet()
                .stream()
                .sorted(
                        Map.Entry
                                .<String, Double>
                                comparingByValue()
                                .reversed()
                )
                .forEach(
                        entry ->
                                categoryContext.append(
                                        "- "
                                                + entry.getKey()
                                                + ": "
                                                + round(
                                                        entry.getValue()
                                                )
                                                + " kg CO2e\n"
                                )
                );


        return """
                Total tracked emission: %.2f kg CO2e

                Current month emission: %.2f kg CO2e

                Emissions by category:
                %s

                Activity records:
                %s
                """.formatted(
                totalEmission,
                monthlyEmission,
                categoryContext,
                details
        );
    }


    // =========================================================
    // GOAL CONTEXT
    // =========================================================

    private String buildGoalContext(
            List<Goal> goals,
            List<GoalProgress> progressList
    ) {

        if (
                goals == null ||
                goals.isEmpty()
        ) {

            return "No sustainability goals are available.\n";
        }


        StringBuilder result =
                new StringBuilder();


        for (Goal goal : goals) {

            result.append(
                    "Goal: "
            );

            result.append(
                    safe(goal.getTitle())
            );

            result.append(
                    "\n"
            );


            result.append(
                    "Category: "
            );

            result.append(
                    safe(goal.getCategory())
            );

            result.append(
                    "\n"
            );


            result.append(
                    "Activity: "
            );

            result.append(
                    safe(goal.getActivity())
            );

            result.append(
                    "\n"
            );


            result.append(
                    "Description: "
            );

            result.append(
                    safe(goal.getDescription())
            );

            result.append(
                    "\n"
            );


            result.append(
                    "Target: "
            );

            result.append(
                    safeDouble(
                            goal.getTargetValue()
                    )
            );

            result.append(
                    " "
            );

            result.append(
                    safe(goal.getUnit())
            );

            result.append(
                    "\n"
            );


            result.append(
                    "Frequency: "
            );

            result.append(
                    safe(goal.getFrequency())
            );

            result.append(
                    "\n"
            );


            result.append(
                    "Start: "
            );

            result.append(
                    safeDate(
                            goal.getStartDate()
                    )
            );

            result.append(
                    "\n"
            );


            result.append(
                    "End: "
            );

            result.append(
                    safeDate(
                            goal.getEndDate()
                    )
            );

            result.append(
                    "\n"
            );


            result.append(
                    "Current Progress: "
            );

            result.append(
                    safeDouble(
                            goal.getProgress()
                    )
            );

            result.append(
                    "%\n"
            );


            result.append(
                    "Status: "
            );

            result.append(
                    safe(goal.getStatus())
            );

            result.append(
                    "\n"
            );


            if (
                    progressList != null &&
                    goal.getId() != null
            ) {

                List<GoalProgress> goalProgress =
                        progressList
                                .stream()
                                .filter(
                                        progress ->
                                                goal.getId()
                                                        .equals(
                                                                progress.getGoalId()
                                                        )
                                )
                                .sorted(
                                        Comparator.comparing(
                                                GoalProgress::getDate,
                                                Comparator.nullsLast(
                                                        Comparator.naturalOrder()
                                                )
                                        )
                                )
                                .toList();


                if (
                        !goalProgress.isEmpty()
                ) {

                    result.append(
                            "Progress History:\n"
                    );


                    for (
                            GoalProgress progress
                            : goalProgress
                    ) {

                        result.append(
                                "- "
                        );

                        result.append(
                                safeDate(
                                        progress.getDate()
                                )
                        );

                        result.append(
                                ": Achieved "
                        );

                        result.append(
                                safeDouble(
                                        progress.getAchievedValue()
                                )
                        );

                        result.append(
                                ", Progress "
                        );

                        result.append(
                                safeDouble(
                                        progress.getProgressPercentage()
                                )
                        );

                        result.append(
                                "%\n"
                        );
                    }
                }
            }


            result.append(
                    "\n"
            );
        }


        return result.toString();
    }


    // =========================================================
    // RECOMMENDATION CONTEXT
    // =========================================================

    private String buildRecommendationContext(
            List<RecommendationResponse> recommendations
    ) {

        if (
                recommendations == null ||
                recommendations.isEmpty()
        ) {

            return "No AI recommendations are currently available.";
        }


        StringBuilder result =
                new StringBuilder();


        for (
                RecommendationResponse recommendation
                : recommendations
        ) {

            if (recommendation == null) {
                continue;
            }


            result.append(
                    "- Activity: "
            );

            result.append(
                    safe(
                            recommendation.getActivity()
                    )
            );

            result.append(
                    "\n"
            );


            result.append(
                    "  Message: "
            );

            result.append(
                    safe(
                            recommendation.getMessage()
                    )
            );

            result.append(
                    "\n"
            );


            if (
                    recommendation.getTips() != null
            ) {

                result.append(
                        "  Tips:\n"
                );


                for (String tip :
                        recommendation.getTips()) {

                    if (
                            tip == null ||
                            tip.trim().isEmpty()
                    ) {

                        continue;
                    }


                    result.append(
                            "    - "
                    );

                    result.append(
                            tip
                    );

                    result.append(
                            "\n"
                    );
                }
            }


            result.append(
                    "\n"
            );
        }


        return result.toString();
    }


    // =========================================================
    // FIND USER NAME
    // =========================================================

    private String findUserName(
            List<User> users,
            String email
    ) {

        if (
                users == null ||
                email == null
        ) {

            return email;
        }


        for (User user : users) {

            if (
                    user != null &&
                    user.getEmail() != null &&
                    user.getEmail()
                            .equalsIgnoreCase(email)
            ) {

                String name =
                        safe(
                                user.getFullName()
                        );


                if (!name.isEmpty()) {

                    return name;
                }
            }
        }


        return email;
    }


    // =========================================================
    // GEMINI CALL
    //
    // FIX:
    // Gemini can temporarily return HTTP 503 when the model
    // is experiencing high demand.
    //
    // We retry temporary failures up to 3 times.
    // =========================================================

    private String callGemini(
            String prompt
    ) {

        int maxAttempts = 3;


        for (
                int attempt = 1;
                attempt <= maxAttempts;
                attempt++
        ) {

            try {

                GenerateContentConfig config =
                        GenerateContentConfig.builder()
                                .temperature(0.4f)
                                .build();


                GenerateContentResponse response =
                        geminiClient.models.generateContent(
                                GEMINI_MODEL,
                                prompt,
                                config
                        );


                if (
                        response == null ||
                        response.text() == null ||
                        response.text()
                                .trim()
                                .isEmpty()
                ) {

                    return "I'm sorry, I couldn't generate a response right now.";
                }


                String cleanedResponse =
                        response.text()
                                .trim()
                                .replace("**", "");


                return cleanedResponse;


            } catch (Exception e) {

                String errorMessage =
                        e.getMessage() == null
                                ? ""
                                : e.getMessage()
                                        .toLowerCase();


                boolean temporaryServerError =
                        errorMessage.contains("503") ||
                        errorMessage.contains("high demand") ||
                        errorMessage.contains("temporarily") ||
                        errorMessage.contains("unavailable") ||
                        errorMessage.contains("overloaded");


                System.out.println(
                        "Gemini request failed. Attempt "
                                + attempt
                                + "/"
                                + maxAttempts
                                + " | "
                                + e.getMessage()
                );


                // =================================================
                // RETRY TEMPORARY GEMINI ERRORS
                // =================================================

                if (
                        temporaryServerError &&
                        attempt < maxAttempts
                ) {

                    try {

                        /*
                         * First retry:
                         * 1 second
                         *
                         * Second retry:
                         * 2 seconds
                         */

                        Thread.sleep(
                                attempt * 1000L
                        );


                    } catch (InterruptedException interruptedException) {

                        Thread.currentThread().interrupt();

                        return "The AI service request was interrupted. Please try again.";
                    }


                    continue;
                }


                // =================================================
                // NON-TEMPORARY ERROR
                // =================================================

                if (!temporaryServerError) {

                    e.printStackTrace();

                    return "I'm sorry, I'm having trouble connecting to the AI service right now.";
                }
            }
        }


        // =========================================================
        // ALL RETRIES FAILED
        // =========================================================

        return "The AI service is temporarily busy. Please try again in a moment.";
    }


    // =========================================================
    // SAFE STRING
    // =========================================================

    private String safe(
            String value
    ) {

        return value == null
                ? ""
                : value;
    }


    // =========================================================
    // SAFE DOUBLE
    // =========================================================

    private double safeDouble(
            Double value
    ) {

        return value == null
                ? 0.0
                : value;
    }


    private double safeDouble(
            double value
    ) {

        return value;
    }


    // =========================================================
    // SAFE DATE
    // =========================================================

    private String safeDate(
            LocalDate date
    ) {

        return date == null
                ? "N/A"
                : date.toString();
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


    // =========================================================
    // ADMIN METRICS HOLDER
    // =========================================================

    private static class AdminMetrics {

        private int totalUsers;

        private int totalActivities;

        private int todayActivities;

        private double totalEmission;

        private double todayEmission;

        private double weeklyEmission;

        private double monthlyEmission;
    }
}