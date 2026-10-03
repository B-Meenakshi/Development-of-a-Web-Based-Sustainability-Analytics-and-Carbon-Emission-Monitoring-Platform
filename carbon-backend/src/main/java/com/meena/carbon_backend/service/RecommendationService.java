package com.meena.carbon_backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import com.meena.carbon_backend.dto.RecommendationResponse;
import com.meena.carbon_backend.entity.Activity;
import com.meena.carbon_backend.repository.ActivityRepository;

import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class RecommendationService {

    private final ActivityRepository activityRepository;

    private final GeminiRecommendationService geminiRecommendationService;

    private final ObjectMapper objectMapper;

    /*
     * =========================================================
     * USER-SPECIFIC CACHE
     * =========================================================
     *
     * Every user's recommendations are cached separately.
     *
     * Cache key:
     *      user email
     *
     * Cache is automatically regenerated when the user's
     * activity signature changes.
     */
    private final Map<String, CachedRecommendation> recommendationCache =
            new HashMap<>();

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public RecommendationService(
            ActivityRepository activityRepository,
            GeminiRecommendationService geminiRecommendationService) {

        this.activityRepository =
                activityRepository;

        this.geminiRecommendationService =
                geminiRecommendationService;

        this.objectMapper =
                new ObjectMapper();
    }

    // =========================================================
    // GET PERSONALIZED AI RECOMMENDATIONS
    // =========================================================

    public synchronized List<RecommendationResponse> getRecommendations(
            String email) {

        List<RecommendationResponse> empty =
                new ArrayList<>();

        // =====================================================
        // VALIDATE EMAIL
        // =====================================================

        if (email == null ||
                email.trim().isEmpty()) {

            System.out.println(
                    "Recommendation request received without email."
            );

            return empty;
        }

        email =
                email.trim();

        // =====================================================
        // LAST 30 DAYS
        // =====================================================

        LocalDate today =
                LocalDate.now();

        LocalDate startDate =
                today.minusDays(29);

        // =====================================================
        // GET ONLY THIS USER'S ACTIVITIES
        // =====================================================

        List<Activity> activities =
                activityRepository
                        .findByUserEmailAndDateBetween(
                                email,
                                startDate,
                                today
                        );

        // =====================================================
        // NO ACTIVITY
        // =====================================================

        if (activities == null ||
                activities.isEmpty()) {

            recommendationCache.remove(email);

            System.out.println(
                    "\n========================================"
            );

            System.out.println(
                    "NO ACTIVITIES FOUND"
            );

            System.out.println(
                    "User: " + email
            );

            System.out.println(
                    "Period: "
                            + startDate
                            + " to "
                            + today
            );

            System.out.println(
                    "========================================"
            );

            return empty;
        }

        // =====================================================
        // CREATE USER ACTIVITY SIGNATURE
        // =====================================================

        String activitySignature =
                createActivitySignature(
                        activities
                );

        // =====================================================
        // CHECK USER-SPECIFIC CACHE
        // =====================================================

        CachedRecommendation cached =
                recommendationCache.get(email);

        if (cached != null &&
                cached.signature.equals(activitySignature)) {

            System.out.println(
                    "\n========================================"
            );

            System.out.println(
                    "RETURNING CACHED AI RECOMMENDATIONS"
            );

            System.out.println(
                    "User: "
                            + email
            );

            System.out.println(
                    "Recommendations: "
                            + cached.recommendations.size()
            );

            System.out.println(
                    "========================================"
            );

            return copyRecommendations(
                    cached.recommendations
            );
        }

        // =====================================================
        // GROUP USER ACTIVITIES
        // =====================================================

        Map<String, ActivitySummary> activityTotals =
                new HashMap<>();

        for (Activity activity :
                activities) {

            if (activity == null) {
                continue;
            }

            // -------------------------------------------------
            // ACTIVITY NAME
            // -------------------------------------------------

            String activityName =
                    activity.getActivity();

            if (activityName == null ||
                    activityName.trim().isEmpty()) {

                activityName =
                        "Other";
            }

            activityName =
                    activityName.trim();

            // -------------------------------------------------
            // CATEGORY
            // -------------------------------------------------

            String category =
                    activity.getCategory();

            if (category == null ||
                    category.trim().isEmpty()) {

                category =
                        "Other";
            }

            category =
                    category.trim();

            // -------------------------------------------------
            // EMISSION
            // -------------------------------------------------

            double emission =
                    activity.getEmission();

            if (Double.isNaN(emission) ||
                    Double.isInfinite(emission)) {

                emission =
                        0.0;
            }

            // -------------------------------------------------
            // AMOUNT
            // -------------------------------------------------

            double amount =
                    activity.getAmount();

            if (Double.isNaN(amount) ||
                    Double.isInfinite(amount)) {

                amount =
                        0.0;
            }

            // -------------------------------------------------
            // UNIT
            // -------------------------------------------------

            String unit =
                    activity.getUnit();

            if (unit == null ||
                    unit.trim().isEmpty()) {

                unit =
                        "";
            }

            unit =
                    unit.trim();

            // -------------------------------------------------
            // DETAILS
            // -------------------------------------------------

            String details =
                    activity.getDetails();

            if (details == null ||
                    details.trim().isEmpty()) {

                details =
                        "No additional details provided";
            }

            details =
                    details.trim();

            // -------------------------------------------------
            // DATE
            // -------------------------------------------------

            LocalDate activityDate =
                    activity.getDate();

            // -------------------------------------------------
            // GROUP KEY
            // -------------------------------------------------

            String key =
                    activityName.toLowerCase();

            // -------------------------------------------------
            // CREATE SUMMARY
            // -------------------------------------------------

            if (!activityTotals.containsKey(key)) {

                ActivitySummary summary =
                        new ActivitySummary(
                                activityName,
                                category,
                                emission,
                                amount,
                                unit,
                                1
                        );

                summary.addDetails(
                        details
                );

                summary.addDate(
                        activityDate
                );

                activityTotals.put(
                        key,
                        summary
                );

            } else {

                ActivitySummary summary =
                        activityTotals.get(key);

                summary.emission +=
                        emission;

                summary.amount +=
                        amount;

                summary.count++;

                summary.addDetails(
                        details
                );

                summary.addDate(
                        activityDate
                );

                if ((summary.unit == null ||
                        summary.unit.isEmpty()) &&
                        !unit.isEmpty()) {

                    summary.unit =
                            unit;
                }
            }
        }

        // =====================================================
        // SORT BY HIGHEST EMISSION
        // =====================================================

        List<ActivitySummary> sortedActivities =
                new ArrayList<>(
                        activityTotals.values()
                );

        sortedActivities.sort(
                Comparator.comparingDouble(
                        ActivitySummary::getEmission
                ).reversed()
        );

        // =====================================================
        // TOP 3 ACTIVITIES
        // =====================================================

        int limit =
                Math.min(
                        3,
                        sortedActivities.size()
                );

        List<ActivitySummary> topActivities =
                new ArrayList<>(
                        sortedActivities.subList(
                                0,
                                limit
                        )
                );

        // =====================================================
        // SAFETY CHECK
        // =====================================================

        if (topActivities.isEmpty()) {

            System.out.println(
                    "No valid activity groups found for: "
                            + email
            );

            return empty;
        }

        /*
         * =====================================================
         * DYNAMIC RECOMMENDATION COUNT
         * =====================================================
         *
         * This is the important part.
         *
         * 1 activity -> 1 Gemini recommendation
         * 2 activities -> 2 Gemini recommendations
         * 3+ activities -> 3 Gemini recommendations
         */

        int recommendationCount =
                topActivities.size();

        // =====================================================
        // TOTAL USER EMISSION
        // =====================================================

        double totalUserEmission =
                0.0;

        for (ActivitySummary summary :
                sortedActivities) {

            totalUserEmission +=
                    summary.getEmission();
        }

        // =====================================================
        // BUILD GEMINI INPUT
        // =====================================================

        StringBuilder activityInformation =
                new StringBuilder();

        activityInformation.append(
                "PERSONAL CARBON COACH - REAL USER DATA\n\n"
        );

        activityInformation.append(
                "IMPORTANT:\n"
        );

        activityInformation.append(
                "The following information belongs to ONE "
                        + "specific user.\n"
        );

        activityInformation.append(
                "Analyze ONLY this user's data.\n"
        );

        activityInformation.append(
                "Do not invent activities, amounts, frequencies "
                        + "or details.\n"
        );

        activityInformation.append(
                "Create a separate recommendation for each "
                        + "supplied activity.\n\n"
        );

        activityInformation.append(
                "Analysis period: Last 30 days\n"
        );

        activityInformation.append(
                "Total tracked carbon emission: "
        );

        activityInformation.append(
                round(
                        totalUserEmission
                )
        );

        activityInformation.append(
                " kg CO₂e\n\n"
        );

        activityInformation.append(
                "NUMBER OF TOP ACTIVITIES PROVIDED: "
        );

        activityInformation.append(
                recommendationCount
        );

        activityInformation.append(
                "\n\n"
        );

        activityInformation.append(
                "The activities below are already sorted from "
                        + "highest to lowest emission.\n"
        );

        activityInformation.append(
                "Use ONLY these activities when generating "
                        + "recommendations.\n\n"
        );

        // =====================================================
        // ADD TOP ACTIVITIES
        // =====================================================

        for (int i = 0;
             i < topActivities.size();
             i++) {

            ActivitySummary summary =
                    topActivities.get(i);

            // -------------------------------------------------
            // PERCENTAGE
            // -------------------------------------------------

            double percentage =
                    0.0;

            if (totalUserEmission > 0) {

                percentage =
                        (
                                summary.getEmission()
                                        / totalUserEmission
                        )
                        * 100.0;
            }

            // -------------------------------------------------
            // AVERAGE
            // -------------------------------------------------

            double averageAmount =
                    0.0;

            if (summary.getCount() > 0) {

                averageAmount =
                        summary.getAmount()
                                / summary.getCount();
            }

            // -------------------------------------------------
            // ACTIVITY BLOCK
            // -------------------------------------------------

            activityInformation.append(
                    "========================================\n"
            );

            activityInformation.append(
                    "TOP ACTIVITY #"
            );

            activityInformation.append(
                    i + 1
            );

            activityInformation.append(
                    "\n"
            );

            activityInformation.append(
                    "Activity Name: "
            );

            activityInformation.append(
                    summary.getActivity()
            );

            activityInformation.append(
                    "\n"
            );

            activityInformation.append(
                    "Category: "
            );

            activityInformation.append(
                    summary.getCategory()
            );

            activityInformation.append(
                    "\n"
            );

            activityInformation.append(
                    "Number of times recorded: "
            );

            activityInformation.append(
                    summary.getCount()
            );

            activityInformation.append(
                    "\n"
            );

            activityInformation.append(
                    "Total amount: "
            );

            activityInformation.append(
                    round(
                            summary.getAmount()
                    )
            );

            if (summary.getUnit() != null &&
                    !summary.getUnit().isEmpty()) {

                activityInformation.append(
                        " "
                );

                activityInformation.append(
                        summary.getUnit()
                );
            }

            activityInformation.append(
                    "\n"
            );

            activityInformation.append(
                    "Average amount per record: "
            );

            activityInformation.append(
                    round(
                            averageAmount
                    )
            );

            if (summary.getUnit() != null &&
                    !summary.getUnit().isEmpty()) {

                activityInformation.append(
                        " "
                );

                activityInformation.append(
                        summary.getUnit()
                );
            }

            activityInformation.append(
                    "\n"
            );

            // -------------------------------------------------
            // DETAILS
            // -------------------------------------------------

            activityInformation.append(
                    "User-provided details:\n"
            );

            for (String detail :
                    summary.getDetails()) {

                activityInformation.append(
                        "- "
                );

                activityInformation.append(
                        detail
                );

                activityInformation.append(
                        "\n"
                );
            }

            // -------------------------------------------------
            // DATES
            // -------------------------------------------------

            activityInformation.append(
                    "Recorded dates: "
            );

            if (summary.getDates().isEmpty()) {

                activityInformation.append(
                        "Not available"
                );

            } else {

                activityInformation.append(
                        summary.getDates()
                );
            }

            activityInformation.append(
                    "\n"
            );

            // -------------------------------------------------
            // EMISSION
            // -------------------------------------------------

            activityInformation.append(
                    "Actual backend-calculated emission: "
            );

            activityInformation.append(
                    round(
                            summary.getEmission()
                    )
            );

            activityInformation.append(
                    " kg CO₂e\n"
            );

            // -------------------------------------------------
            // PERCENTAGE
            // -------------------------------------------------

            activityInformation.append(
                    "Percentage of user's tracked emission: "
            );

            activityInformation.append(
                    round(
                            percentage
                    )
            );

            activityInformation.append(
                    "%\n\n"
            );
        }

        // =====================================================
        // UNIQUE VARIATION
        // =====================================================

        long variationNumber =
                Math.abs(
                        activitySignature.hashCode()
                );

        // =====================================================
        // LOG
        // =====================================================

        System.out.println(
                "\n========================================"
        );

        System.out.println(
                "GENERATING DYNAMIC AI RECOMMENDATIONS"
        );

        System.out.println(
                "User: "
                        + email
        );

        System.out.println(
                "Unique activity groups: "
                        + sortedActivities.size()
        );

        System.out.println(
                "Top activities sent to Gemini: "
                        + topActivities.size()
        );

        System.out.println(
                "Expected Gemini recommendations: "
                        + recommendationCount
        );

        System.out.println(
                "Variation: "
                        + variationNumber
        );

        System.out.println(
                "========================================"
        );

        // =====================================================
        // CALL GEMINI
        // =====================================================

        String geminiResponse =
                geminiRecommendationService
                        .generateRecommendations(
                                activityInformation.toString(),
                                variationNumber,
                                recommendationCount
                        );

        // =====================================================
        // LOG RAW RESPONSE
        // =====================================================

        System.out.println(
                "\n========================================"
        );

        System.out.println(
                "RAW GEMINI RESPONSE"
        );

        System.out.println(
                geminiResponse
        );

        System.out.println(
                "========================================"
        );

        // =====================================================
        // PARSE GEMINI RESPONSE
        // =====================================================

        List<RecommendationResponse> aiResponses =
                parseGeminiResponse(
                        geminiResponse,
                        topActivities
                );

        // =====================================================
        // VALIDATE FINAL COUNT
        // =====================================================

        if (aiResponses.size() !=
                recommendationCount) {

            System.err.println(
                    "\n========================================"
            );

            System.err.println(
                    "GEMINI DID NOT RETURN THE REQUIRED "
                            + "NUMBER OF VALID RECOMMENDATIONS"
            );

            System.err.println(
                    "Expected: "
                            + recommendationCount
            );

            System.err.println(
                    "Received: "
                            + aiResponses.size()
            );

            System.err.println(
                    "No static fallback will be used."
            );

            System.err.println(
                    "========================================"
            );

            return empty;
        }

        // =====================================================
        // CACHE ONLY VALID AI RESULTS
        // =====================================================

        recommendationCache.put(
                email,
                new CachedRecommendation(
                        activitySignature,
                        copyRecommendations(
                                aiResponses
                        )
                )
        );

        // =====================================================
        // FINAL LOG
        // =====================================================

        System.out.println(
                "\n========================================"
        );

        System.out.println(
                "AI RECOMMENDATIONS READY"
        );

        System.out.println(
                "User: "
                        + email
        );

        System.out.println(
                "AI recommendations returned: "
                        + aiResponses.size()
        );

        System.out.println(
                "AI tips per recommendation: 2"
        );

        System.out.println(
                "========================================"
        );

        return aiResponses;
    }

    // =========================================================
    // PARSE GEMINI RESPONSE
    // =========================================================

    private List<RecommendationResponse> parseGeminiResponse(
            String geminiResponse,
            List<ActivitySummary> topActivities) {

        List<RecommendationResponse> responses =
                new ArrayList<>();

        if (geminiResponse == null ||
                geminiResponse.trim().isEmpty()) {

            System.err.println(
                    "Gemini returned an empty response."
            );

            return responses;
        }

        try {

            String cleaned =
                    cleanGeminiResponse(
                            geminiResponse
                    );

            if (cleaned.isEmpty()) {

                System.err.println(
                        "Could not extract valid JSON."
                );

                return responses;
            }

            List<GeminiRecommendation> aiRecommendations =
                    objectMapper.readValue(
                            cleaned,
                            new TypeReference<
                                    List<GeminiRecommendation>>() {
                            }
                    );

            if (aiRecommendations == null ||
                    aiRecommendations.isEmpty()) {

                return responses;
            }

            // =================================================
            // GEMINI MUST RETURN SAME NUMBER OF ACTIVITIES
            // =================================================

            if (aiRecommendations.size()
                    != topActivities.size()) {

                System.err.println(
                        "Gemini returned "
                                + aiRecommendations.size()
                                + " recommendations, but "
                                + topActivities.size()
                                + " were expected."
                );

                return responses;
            }

            Set<String> alreadyAdded =
                    new HashSet<>();

            // =================================================
            // PROCESS AI RESULTS
            // =================================================

            for (GeminiRecommendation ai :
                    aiRecommendations) {

                if (ai == null ||
                        ai.activity == null ||
                        ai.activity.trim().isEmpty()) {

                    return new ArrayList<>();
                }

                // -------------------------------------------------
                // MATCH ONLY USER'S TOP ACTIVITIES
                // -------------------------------------------------

                ActivitySummary matchingActivity =
                        findMatchingActivity(
                                ai.activity,
                                topActivities
                        );

                if (matchingActivity == null) {

                    System.err.println(
                            "Gemini returned an activity that "
                                    + "was not supplied: "
                                    + ai.activity
                    );

                    return new ArrayList<>();
                }

                String activityKey =
                        matchingActivity
                                .getActivity()
                                .trim()
                                .toLowerCase();

                // -------------------------------------------------
                // NO DUPLICATE ACTIVITIES
                // -------------------------------------------------

                if (alreadyAdded.contains(activityKey)) {

                    System.err.println(
                            "Gemini returned duplicate activity: "
                                    + ai.activity
                    );

                    return new ArrayList<>();
                }

                // -------------------------------------------------
                // MESSAGE
                // -------------------------------------------------

                if (ai.message == null ||
                        ai.message.trim().isEmpty()) {

                    System.err.println(
                            "Gemini recommendation has no message."
                    );

                    return new ArrayList<>();
                }

                String message =
                        cleanText(
                                ai.message
                        );

                if (message.isEmpty()) {

                    return new ArrayList<>();
                }

                // -------------------------------------------------
                // TIPS
                // -------------------------------------------------

                if (ai.tips == null ||
                        ai.tips.size() != 2) {

                    System.err.println(
                            "Gemini recommendation for "
                                    + ai.activity
                                    + " does not contain exactly "
                                    + "2 tips."
                    );

                    return new ArrayList<>();
                }

                List<String> validTips =
                        new ArrayList<>();

                for (String tip :
                        ai.tips) {

                    if (tip == null ||
                            tip.trim().isEmpty()) {

                        continue;
                    }

                    String cleanedTip =
                            cleanTip(
                                    tip
                            );

                    if (!cleanedTip.isEmpty() &&
                            !validTips.contains(
                                    cleanedTip
                            )) {

                        validTips.add(
                                cleanedTip
                        );
                    }
                }

                // =================================================
                // EXACTLY TWO UNIQUE TIPS
                // =================================================

                if (validTips.size() != 2) {

                    System.err.println(
                            "Gemini did not provide exactly "
                                    + "2 unique tips for "
                                    + ai.activity
                    );

                    return new ArrayList<>();
                }

                // -------------------------------------------------
                // ADD AI RESPONSE
                // -------------------------------------------------

                alreadyAdded.add(
                        activityKey
                );

                RecommendationResponse recommendation =
                        new RecommendationResponse(
                                matchingActivity.getActivity(),
                                matchingActivity.getCategory(),
                                round(
                                        matchingActivity.getEmission()
                                ),
                                message,
                                validTips.toArray(
                                        new String[0]
                                ),
                                true
                        );

                responses.add(
                        recommendation
                );
            }

        } catch (Exception e) {

            System.err.println(
                    "\n========================================"
            );

            System.err.println(
                    "GEMINI RESPONSE PARSING FAILED"
            );

            System.err.println(
                    "Error: "
                            + e.getMessage()
            );

            System.err.println(
                    "========================================"
            );
        }

        // =====================================================
        // FINAL COUNT VALIDATION
        // =====================================================

        if (responses.size()
                != topActivities.size()) {

            System.err.println(
                    "Final AI recommendation count mismatch."
            );

            return new ArrayList<>();
        }

        return responses;
    }

    // =========================================================
    // CLEAN GEMINI RESPONSE
    // =========================================================

    private String cleanGeminiResponse(
            String response) {

        if (response == null ||
                response.trim().isEmpty()) {

            return "";
        }

        String cleaned =
                response.trim();

        cleaned =
                cleaned
                        .replace(
                                "```json",
                                ""
                        )
                        .replace(
                                "```JSON",
                                ""
                        )
                        .replace(
                                "```",
                                ""
                        )
                        .trim();

        // =====================================================
        // FIND JSON ARRAY
        // =====================================================

        int arrayStart =
                cleaned.indexOf("[");

        if (arrayStart >= 0) {

            String possibleJson =
                    extractBalancedJson(
                            cleaned,
                            arrayStart,
                            '[',
                            ']'
                    );

            if (!possibleJson.isEmpty()) {

                return possibleJson;
            }
        }

        return "";
    }

    // =========================================================
    // EXTRACT BALANCED JSON
    // =========================================================

    private String extractBalancedJson(
            String text,
            int start,
            char opening,
            char closing) {

        if (text == null ||
                start < 0 ||
                start >= text.length()) {

            return "";
        }

        int depth = 0;

        boolean insideString =
                false;

        boolean escaped =
                false;

        for (int i = start;
             i < text.length();
             i++) {

            char current =
                    text.charAt(i);

            if (insideString) {

                if (escaped) {

                    escaped = false;

                    continue;
                }

                if (current == '\\') {

                    escaped = true;

                    continue;
                }

                if (current == '"') {

                    insideString =
                            false;
                }

                continue;
            }

            if (current == '"') {

                insideString =
                        true;

                continue;
            }

            if (current == opening) {

                depth++;
            }

            if (current == closing) {

                depth--;

                if (depth == 0) {

                    return text.substring(
                            start,
                            i + 1
                    ).trim();
                }
            }
        }

        return "";
    }

    // =========================================================
    // CLEAN TEXT
    // =========================================================

    private String cleanText(
            String text) {

        if (text == null) {

            return "";
        }

        String cleaned =
                text.trim();

        cleaned =
                cleaned.replaceAll(
                        "^\"|\"$",
                        ""
                );

        cleaned =
                cleaned.replaceAll(
                        "\\s+",
                        " "
                );

        return cleaned.trim();
    }

    // =========================================================
    // FIND MATCHING ACTIVITY
    // =========================================================

    private ActivitySummary findMatchingActivity(
            String aiActivity,
            List<ActivitySummary> activities) {

        if (aiActivity == null ||
                aiActivity.trim().isEmpty() ||
                activities == null) {

            return null;
        }

        // =====================================================
        // EXACT MATCH
        // =====================================================

        for (ActivitySummary activity :
                activities) {

            if (activity.getActivity()
                    .trim()
                    .equalsIgnoreCase(
                            aiActivity.trim()
                    )) {

                return activity;
            }
        }

        // =====================================================
        // FLEXIBLE MATCH
        // =====================================================

        String target =
                aiActivity
                        .trim()
                        .toLowerCase();

        for (ActivitySummary activity :
                activities) {

            String existing =
                    activity.getActivity()
                            .trim()
                            .toLowerCase();

            if (existing.contains(target) ||
                    target.contains(existing)) {

                return activity;
            }
        }

        return null;
    }

    // =========================================================
    // CLEAN TIP
    // =========================================================

    private String cleanTip(
            String tip) {

        if (tip == null) {

            return "";
        }

        String cleaned =
                tip.trim();

        cleaned =
                cleaned.replaceFirst(
                        "^[•\\-*]+\\s*",
                        ""
                );

        cleaned =
                cleaned.replaceFirst(
                        "^\\d+[.)]\\s*",
                        ""
                );

        cleaned =
                cleaned.replaceAll(
                        "^\"|\"$",
                        ""
                );

        cleaned =
                cleaned.replaceAll(
                        "\\s+",
                        " "
                );

        return cleaned.trim();
    }

    // =========================================================
    // CREATE USER ACTIVITY SIGNATURE
    // =========================================================

    private String createActivitySignature(
            List<Activity> activities) {

        StringBuilder data =
                new StringBuilder();

        for (Activity activity :
                activities) {

            if (activity == null) {

                continue;
            }

            data.append(
                            activity.getId()
                    )
                    .append("|")
                    .append(
                            safe(
                                    activity.getActivity()
                            )
                    )
                    .append("|")
                    .append(
                            safe(
                                    activity.getCategory()
                            )
                    )
                    .append("|")
                    .append(
                            activity.getAmount()
                    )
                    .append("|")
                    .append(
                            safe(
                                    activity.getUnit()
                            )
                    )
                    .append("|")
                    .append(
                            safe(
                                    activity.getDetails()
                            )
                    )
                    .append("|")
                    .append(
                            activity.getEmission()
                    )
                    .append("|")
                    .append(
                            activity.getDate()
                    )
                    .append("|")
                    .append("\n");
        }

        return sha256(
                data.toString()
        );
    }

    // =========================================================
    // SAFE STRING
    // =========================================================

    private String safe(
            String value) {

        if (value == null) {

            return "";
        }

        return value.trim();
    }

    // =========================================================
    // SHA-256
    // =========================================================

    private String sha256(
            String value) {

        try {

            MessageDigest digest =
                    MessageDigest.getInstance(
                            "SHA-256"
                    );

            byte[] hash =
                    digest.digest(
                            value.getBytes(
                                    StandardCharsets.UTF_8
                            )
                    );

            StringBuilder hex =
                    new StringBuilder();

            for (byte b :
                    hash) {

                hex.append(
                        String.format(
                                "%02x",
                                b
                        )
                );
            }

            return hex.toString();

        } catch (Exception e) {

            return String.valueOf(
                    value.hashCode()
            );
        }
    }

    // =========================================================
    // COPY RECOMMENDATIONS
    // =========================================================

    private List<RecommendationResponse> copyRecommendations(
            List<RecommendationResponse> source) {

        List<RecommendationResponse> copy =
                new ArrayList<>();

        if (source == null) {

            return copy;
        }

        for (RecommendationResponse item :
                source) {

            if (item == null) {

                continue;
            }

            String[] originalTips =
                    item.getTips();

            String[] copiedTips =
                    originalTips == null
                            ? new String[0]
                            : originalTips.clone();

            copy.add(
                    new RecommendationResponse(
                            item.getActivity(),
                            item.getCategory(),
                            item.getEmission(),
                            item.getMessage(),
                            copiedTips,
                            item.isAiGenerated()
                    )
            );
        }

        return copy;
    }

    // =========================================================
    // ROUND
    // =========================================================

    private double round(
            double value) {

        return Math.round(
                value * 100.0
        ) / 100.0;
    }

    // =========================================================
    // ACTIVITY SUMMARY
    // =========================================================

    private static class ActivitySummary {

        private String activity;

        private String category;

        private double emission;

        private double amount;

        private String unit;

        private int count;

        private Set<String> details =
                new LinkedHashSet<>();

        private Set<LocalDate> dates =
                new LinkedHashSet<>();

        public ActivitySummary(
                String activity,
                String category,
                double emission,
                double amount,
                String unit,
                int count) {

            this.activity =
                    activity;

            this.category =
                    category;

            this.emission =
                    emission;

            this.amount =
                    amount;

            this.unit =
                    unit;

            this.count =
                    count;
        }

        public void addDetails(
                String detail) {

            if (detail == null ||
                    detail.trim().isEmpty()) {

                return;
            }

            if (details.size() < 5) {

                details.add(
                        detail.trim()
                );
            }
        }

        public void addDate(
                LocalDate date) {

            if (date != null) {

                dates.add(date);
            }
        }

        public String getActivity() {
            return activity;
        }

        public String getCategory() {
            return category;
        }

        public double getEmission() {
            return emission;
        }

        public double getAmount() {
            return amount;
        }

        public String getUnit() {
            return unit;
        }

        public int getCount() {
            return count;
        }

        public Set<String> getDetails() {
            return details;
        }

        public Set<LocalDate> getDates() {
            return dates;
        }
    }

    // =========================================================
    // GEMINI RESPONSE MODEL
    // =========================================================

    private static class GeminiRecommendation {

        public String activity;

        public String message;

        public List<String> tips;
    }

    // =========================================================
    // CACHE MODEL
    // =========================================================

    private static class CachedRecommendation {

        private final String signature;

        private final List<RecommendationResponse>
                recommendations;

        public CachedRecommendation(
                String signature,
                List<RecommendationResponse> recommendations) {

            this.signature =
                    signature;

            this.recommendations =
                    recommendations;
        }
    }
}