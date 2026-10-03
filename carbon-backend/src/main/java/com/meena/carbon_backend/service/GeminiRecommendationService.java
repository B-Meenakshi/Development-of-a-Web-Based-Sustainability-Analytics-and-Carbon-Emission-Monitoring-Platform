package com.meena.carbon_backend.service;

import com.google.genai.Client;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;

import io.github.cdimascio.dotenv.Dotenv;

import org.springframework.stereotype.Service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class GeminiRecommendationService {

    // =========================================================
    // GEMINI MODEL
    // =========================================================

    private static final String GEMINI_MODEL =
            "gemini-3.5-flash-lite";

    // =========================================================
    // RETRY SETTINGS
    // =========================================================

    private static final int MAX_RETRIES = 2;

    private static final long INITIAL_RETRY_DELAY = 2000;

    // =========================================================
    // OUTPUT SETTINGS
    // =========================================================

    private static final int MAX_OUTPUT_TOKENS = 500;

    private final Client geminiClient;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public GeminiRecommendationService() {

        String currentDirectory =
                System.getProperty("user.dir");

        Path envPath =
                Paths.get(
                        currentDirectory,
                        ".env"
                );

        if (!Files.exists(envPath)) {

            envPath =
                    Paths.get(
                            currentDirectory,
                            "carbon-backend",
                            ".env"
                    );
        }

        if (!Files.exists(envPath)) {

            throw new IllegalStateException(
                    "Could not find .env file."
            );
        }

        // =====================================================
        // LOAD .ENV
        // =====================================================

        Dotenv dotenv =
                Dotenv.configure()
                        .directory(
                                envPath
                                        .getParent()
                                        .toString()
                        )
                        .filename(
                                envPath
                                        .getFileName()
                                        .toString()
                        )
                        .ignoreIfMissing()
                        .load();

        // =====================================================
        // GET API KEY
        // =====================================================

        String apiKey =
                dotenv.get("GEMINI_API_KEY");

        if (apiKey == null ||
                apiKey.trim().isEmpty()) {

            apiKey =
                    System.getenv("GEMINI_API_KEY");
        }

        if (apiKey == null ||
                apiKey.trim().isEmpty()) {

            throw new IllegalStateException(
                    "GEMINI_API_KEY is missing from .env"
            );
        }

        // =====================================================
        // INITIALIZE GEMINI CLIENT
        // =====================================================

        geminiClient =
                Client.builder()
                        .apiKey(apiKey.trim())
                        .build();

        System.out.println(
                "========================================"
        );

        System.out.println(
                "Gemini AI client initialized successfully."
        );

        System.out.println(
                "Gemini model: " + GEMINI_MODEL
        );

        System.out.println(
                "Maximum output tokens: "
                        + MAX_OUTPUT_TOKENS
        );

        System.out.println(
                "========================================"
        );
    }

    // =========================================================
    // GENERATE PERSONALIZED RECOMMENDATIONS
    // =========================================================

    public String generateRecommendations(
            String activityInformation,
            long variationNumber,
            int recommendationCount) {

        // =====================================================
        // VALIDATE INPUT
        // =====================================================

        if (activityInformation == null ||
                activityInformation.trim().isEmpty()) {

            System.out.println(
                    "No activity information provided."
            );

            return "[]";
        }

        // =====================================================
        // SAFETY LIMIT
        // =====================================================

        if (recommendationCount <= 0) {

            System.out.println(
                    "Invalid recommendation count: "
                            + recommendationCount
            );

            return "[]";
        }

        /*
         * TOP 3 recommendation rule:
         *
         * The RecommendationService selects the user's
         * highest-emission activities and sends them here.
         *
         * Maximum recommendations = 3.
         *
         * 3 or more activities -> TOP 3
         * Fewer than 3 activities -> all available activities
         */

        recommendationCount =
                Math.min(
                        recommendationCount,
                        3
                );

        // =====================================================
        // GEMINI PROMPT
        // =====================================================

        String prompt = """
                You are a personal carbon-footprint coach.

                Analyze ONLY the user's supplied activity data:

                %s

                TASK:
                Generate EXACTLY %d recommendation(s) for the
                supplied TOP activity/activities.

                IMPORTANT:
                The supplied activities have already been selected
                by the system as the user's highest-emission
                activities.

                When 3 activities are supplied, these are the user's
                TOP 3 highest-emission activities.

                Do NOT add any activity that is not supplied.

                RULES:

                1. Use ONLY the supplied activities and data.
                2. Each supplied activity must appear exactly once.
                3. The activity name must exactly match the supplied activity name.
                4. Personalize the recommendation using the actual activity data.
                5. Do NOT invent numbers, activities, emissions, amounts, or details.
                6. Keep each recommendation VERY SHORT.
                7. The message must contain a maximum of 2 very short sentences.
                8. Keep the message practical and directly related to reducing emissions.
                9. Give EXACTLY 2 actionable tips for each activity.
                10. Each tip must be short and practical.
                11. Tips must be different from each other.
                12. Do not repeat the same tip unnecessarily across activities.
                13. Do not combine multiple activities into one recommendation.
                14. Do not include markdown.
                15. Do not include headings outside the JSON.
                16. Return ONLY valid JSON.

                MESSAGE LENGTH:
                - Maximum 2 very short sentences.
                - Maximum 25 words TOTAL for the message.
                - The message must visually fit in approximately 1-2 lines.
                - Keep it direct and easy to read.
                - Mention the emission value only when useful.
                - Do NOT repeat item count, dates, percentages, or unnecessary statistics.
                - Give one short observation and one practical reduction action.
                - Do NOT write a detailed paragraph.

                TIP LENGTH:
                - Exactly 2 tips.
                - Each tip should be one short actionable sentence.
                - Prefer approximately 5-12 words per tip.

                RESPONSE FORMAT:

                [
                  {
                    "activity": "Exact supplied activity name",
                    "message": "Very short personalized recommendation, maximum 25 words total.",
                    "tips": [
                      "Short actionable tip.",
                      "Short actionable tip."
                    ]
                  }
                ]

                The JSON array MUST contain exactly %d object(s).

                Each object MUST contain exactly:
                - activity
                - message
                - tips

                Each tips array MUST contain exactly 2 tips.

                FINAL RULE:
                Return ONLY the complete JSON array.
                """.formatted(
                activityInformation,
                recommendationCount,
                recommendationCount
        );

        // =====================================================
        // GEMINI CONFIGURATION
        // =====================================================

        GenerateContentConfig config =
                GenerateContentConfig.builder()
                        .candidateCount(1)
                        .maxOutputTokens(
                                MAX_OUTPUT_TOKENS
                        )
                        .responseMimeType(
                                "application/json"
                        )
                        .build();

        // =====================================================
        // RETRY LOOP
        // =====================================================

        for (int attempt = 1;
             attempt <= MAX_RETRIES;
             attempt++) {

            try {

                System.out.println(
                        "\n========================================"
                );

                System.out.println(
                        "CALLING GEMINI"
                );

                System.out.println(
                        "Generating TOP "
                                + recommendationCount
                                + " short AI recommendation(s)"
                );

                System.out.println(
                        "Model: " + GEMINI_MODEL
                );

                System.out.println(
                        "Attempt: "
                                + attempt
                                + "/"
                                + MAX_RETRIES
                );

                System.out.println(
                        "Variation: "
                                + variationNumber
                );

                System.out.println(
                        "Expected recommendations: "
                                + recommendationCount
                );

                System.out.println(
                        "========================================"
                );

                long startTime =
                        System.currentTimeMillis();

                // =================================================
                // CALL GEMINI
                // =================================================

                GenerateContentResponse response =
                        geminiClient.models.generateContent(
                                GEMINI_MODEL,
                                prompt,
                                config
                        );

                long elapsed =
                        System.currentTimeMillis()
                                - startTime;

                System.out.println(
                        "Gemini response time: "
                                + elapsed
                                + " ms"
                );

                // =================================================
                // NULL RESPONSE
                // =================================================

                if (response == null) {

                    System.err.println(
                            "Gemini returned null response."
                    );

                    if (attempt < MAX_RETRIES) {

                        waitBeforeRetry(attempt);

                        continue;
                    }

                    return "[]";
                }

                // =================================================
                // RESPONSE TEXT
                // =================================================

                String result =
                        response.text();

                if (result == null ||
                        result.trim().isEmpty()) {

                    System.err.println(
                            "Gemini returned an empty response."
                    );

                    if (attempt < MAX_RETRIES) {

                        waitBeforeRetry(attempt);

                        continue;
                    }

                    return "[]";
                }

                result =
                        result.trim();

                // =================================================
                // LOG RESPONSE
                // =================================================

                System.out.println(
                        "\n========================================"
                );

                System.out.println(
                        "GEMINI AI RESPONSE"
                );

                System.out.println(
                        result
                );

                System.out.println(
                        "========================================"
                );

                // =================================================
                // JSON CHECK
                // =================================================

                if (!result.startsWith("[") ||
                        !result.endsWith("]")) {

                    System.err.println(
                            "Gemini returned invalid JSON array."
                    );

                    if (attempt < MAX_RETRIES) {

                        waitBeforeRetry(attempt);

                        continue;
                    }

                    return "[]";
                }

                // =================================================
                // SUCCESS
                // =================================================

                return result;

            } catch (Exception e) {

                String errorMessage =
                        e.getMessage();

                if (errorMessage == null) {
                    errorMessage = "";
                }

                String lowerError =
                        errorMessage.toLowerCase();

                boolean is503 =
                        errorMessage.contains("503") ||
                        lowerError.contains("high demand") ||
                        lowerError.contains("temporarily unavailable") ||
                        lowerError.contains("service unavailable");

                System.err.println(
                        "\n========================================"
                );

                System.err.println(
                        "GEMINI API ERROR"
                );

                System.err.println(
                        "Attempt: "
                                + attempt
                                + "/"
                                + MAX_RETRIES
                );

                System.err.println(
                        errorMessage
                );

                System.err.println(
                        "========================================"
                );

                // =================================================
                // RETRY 503
                // =================================================

                if (is503 &&
                        attempt < MAX_RETRIES) {

                    System.err.println(
                            "Gemini temporarily unavailable."
                    );

                    System.err.println(
                            "Retrying AI recommendation generation..."
                    );

                    waitBeforeRetry(attempt);

                    continue;
                }

                e.printStackTrace();

                return "[]";
            }
        }

        return "[]";
    }

    // =========================================================
    // RETRY WAIT
    // =========================================================

    private void waitBeforeRetry(
            int attempt) {

        try {

            long delay =
                    INITIAL_RETRY_DELAY * attempt;

            System.out.println(
                    "Waiting "
                            + delay
                            + " ms before retry..."
            );

            Thread.sleep(delay);

        } catch (InterruptedException e) {

            Thread.currentThread().interrupt();

            System.err.println(
                    "Retry interrupted."
            );
        }
    }

    // =========================================================
    // BACKWARD COMPATIBILITY
    // =========================================================

    public String generateRecommendations(
            String activityInformation,
            long variationNumber) {

        return generateRecommendations(
                activityInformation,
                variationNumber,
                3
        );
    }

    public String generateRecommendations(
            String activityInformation) {

        return generateRecommendations(
                activityInformation,
                System.currentTimeMillis(),
                3
        );
    }
}