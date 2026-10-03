package com.meena.carbon_backend.service;

import com.meena.carbon_backend.entity.Goal;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@Service
public class EmailService {

    private final RestTemplate restTemplate;

    @Value("${brevo.api.url}")
    private String brevoApiUrl;

    @Value("${brevo.api.key}")
    private String brevoApiKey;

    @Value("${brevo.sender.email}")
    private String senderEmail;

    @Value("${brevo.sender.name}")
    private String senderName;

    public EmailService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }


    // =========================================================
    // GOAL CREATED
    // =========================================================

    public void sendGoalCreatedEmail(Goal goal) {

        if (goal == null || goal.getUserEmail() == null) {
            return;
        }

        String subject =
                "🌱 Sustainability Goal Created";

        String html =
                buildGoalEmail(
                        goal,
                        "created",
                        0
                );

        sendEmail(
                goal.getUserEmail(),
                subject,
                html
        );
    }


    // =========================================================
    // GOAL COMPLETED
    // =========================================================

    public void sendGoalCompletedEmail(
            Goal goal,
            double achievedValue
    ) {

        if (goal == null || goal.getUserEmail() == null) {
            return;
        }

        String subject =
                "🎉 Sustainability Goal Completed!";

        String html =
                buildGoalEmail(
                        goal,
                        "completed",
                        100
                );

        sendEmail(
                goal.getUserEmail(),
                subject,
                html
        );
    }
    // =========================================================
    // NORMAL USER WELCOME EMAIL
    // =========================================================

    public void sendUserWelcomeEmail(
            String userName,
            String userEmail
    ) {

        if (userEmail == null ||
                userEmail.trim().isEmpty()) {

            return;
        }

        String subject =
                "🌿 Welcome to CarbonTrack";

        String html =
                buildUserWelcomeEmail(
                        userName,
                        userEmail
                );

        sendEmail(
                userEmail,
                subject,
                html
        );
    }


    // =========================================================
    // NORMAL USER WELCOME EMAIL TEMPLATE
    // =========================================================

    private String buildUserWelcomeEmail(
            String userName,
            String userEmail
    ) {

        String safeUserName =
                escapeHtml(
                        userName == null ||
                        userName.trim().isEmpty()
                                ? "User"
                                : userName.trim()
                );

        String safeUserEmail =
                escapeHtml(
                        userEmail == null
                                ? ""
                                : userEmail.trim()
                );

        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "<meta charset='UTF-8'>" +
                "<meta name='viewport' " +
                "content='width=device-width, initial-scale=1.0'>" +
                "</head>" +

                "<body style='" +
                "margin:0;" +
                "padding:0;" +
                "background-color:#f3faf6;" +
                "font-family:Arial,Helvetica,sans-serif;" +
                "color:#173b2a;" +
                "'>" +

                "<table width='100%' cellpadding='0' cellspacing='0' " +
                "style='background-color:#f3faf6;padding:35px 15px;'>" +

                "<tr>" +
                "<td align='center'>" +

                "<table width='600' cellpadding='0' cellspacing='0' " +
                "style='" +
                "max-width:600px;" +
                "width:100%;" +
                "background-color:#ffffff;" +
                "border:1px solid #dceee4;" +
                "border-radius:16px;" +
                "overflow:hidden;" +
                "box-shadow:0 4px 16px rgba(31,104,66,0.08);" +
                "'>" +

                // HEADER
                "<tr>" +
                "<td style='" +
                "background-color:#e5f5ec;" +
                "padding:24px 28px;" +
                "'>" +

                "<table width='100%' cellpadding='0' cellspacing='0'>" +
                "<tr>" +

                "<td width='52' valign='middle'>" +
                "<div style='" +
                "width:42px;" +
                "height:42px;" +
                "line-height:42px;" +
                "text-align:center;" +
                "background-color:#d4f0df;" +
                "border-radius:12px;" +
                "font-size:21px;" +
                "'>🌱</div>" +
                "</td>" +

                "<td valign='middle' style='padding-left:12px;'>" +

                "<div style='" +
                "font-size:22px;" +
                "font-weight:700;" +
                "color:#173b2a;" +
                "line-height:28px;" +
                "'>" +
                "Carbon<span style='color:#23915b;'>Track</span>" +
                "</div>" +

                "<div style='" +
                "font-size:12px;" +
                "color:#6c8b7a;" +
                "margin-top:2px;" +
                "'>" +
                "Track Today, Save Tomorrow" +
                "</div>" +

                "</td>" +
                "</tr>" +
                "</table>" +

                "</td>" +
                "</tr>" +

                // WELCOME
                "<tr>" +
                "<td style='padding:32px 28px 10px 28px;'>" +

                "<div style='" +
                "font-size:25px;" +
                "font-weight:700;" +
                "color:#173b2a;" +
                "margin-bottom:12px;" +
                "'>" +
                "Welcome to CarbonTrack! 🌿" +
                "</div>" +

                "<p style='" +
                "font-size:15px;" +
                "line-height:24px;" +
                "color:#304d3d;" +
                "margin:0 0 10px 0;" +
                "'>" +
                "Hello " +
                safeUserName +
                "," +
                "</p>" +

                "<p style='" +
                "font-size:14px;" +
                "line-height:23px;" +
                "color:#698074;" +
                "margin:0;" +
                "'>" +
                "Your CarbonTrack account has been created successfully. " +
                "We're happy to have you join us in building more " +
                "sustainable everyday habits." +
                "</p>" +

                "</td>" +
                "</tr>" +

                // ACCOUNT
                "<tr>" +
                "<td style='padding:20px 28px 10px 28px;'>" +

                "<div style='" +
                "background-color:#f6fbf8;" +
                "border:1px solid #dfede5;" +
                "border-radius:12px;" +
                "padding:20px;" +
                "'>" +

                "<div style='" +
                "font-size:16px;" +
                "font-weight:700;" +
                "color:#244936;" +
                "margin-bottom:16px;" +
                "'>" +
                "Your Account" +
                "</div>" +

                "<div style='" +
                "font-size:11px;" +
                "color:#789083;" +
                "margin-bottom:5px;" +
                "'>" +
                "REGISTERED EMAIL" +
                "</div>" +

                "<div style='" +
                "font-size:15px;" +
                "font-weight:600;" +
                "color:#244936;" +
                "'>" +
                safeUserEmail +
                "</div>" +

                "</div>" +
                "</td>" +
                "</tr>" +

                // FEATURES
                "<tr>" +
                "<td style='padding:10px 28px 10px 28px;'>" +

                "<div style='" +
                "font-size:15px;" +
                "font-weight:700;" +
                "color:#244936;" +
                "margin-bottom:12px;" +
                "'>" +
                "What you can do with CarbonTrack" +
                "</div>" +

                "<div style='" +
                "background-color:#f8fcfa;" +
                "border:1px solid #e4eee8;" +
                "border-radius:10px;" +
                "padding:15px 17px;" +
                "font-size:13px;" +
                "line-height:24px;" +
                "color:#526d5e;" +
                "'>" +

                "🌱 Track your carbon footprint<br>" +
                "📊 View your sustainability analytics<br>" +
                "🎯 Set and monitor sustainability goals<br>" +
                "💡 Get personalized recommendations<br>" +
                "🏆 Track your achievements and progress" +

                "</div>" +
                "</td>" +
                "</tr>" +

                // GET STARTED
                "<tr>" +
                "<td style='padding:15px 28px 25px 28px;'>" +

                "<div style='" +
                "background-color:#eef9f3;" +
                "border-radius:12px;" +
                "padding:16px 18px;" +
                "font-size:13px;" +
                "line-height:21px;" +
                "color:#496957;" +
                "'>" +

                "<strong>Ready to get started?</strong><br>" +
                "Log in to your CarbonTrack account and start tracking " +
                "your environmental impact today. 🌍" +

                "</div>" +
                "</td>" +
                "</tr>" +

                // LOGIN BUTTON
                "<tr>" +
                "<td align='center' style='padding:0 28px 32px 28px;'>" +

                "<a href='http://localhost:5173/login' " +
                "style='" +
                "display:inline-block;" +
                "background-color:#238b57;" +
                "color:#ffffff;" +
                "text-decoration:none;" +
                "font-size:14px;" +
                "font-weight:600;" +
                "padding:12px 28px;" +
                "border-radius:9px;" +
                "'>" +
                "Login to CarbonTrack" +
                "</a>" +

                "</td>" +
                "</tr>" +

                // FOOTER
                "<tr>" +
                "<td align='center' style='" +
                "background-color:#f7fbf9;" +
                "border-top:1px solid #e4eee8;" +
                "padding:18px;" +
                "'>" +

                "<div style='" +
                "font-size:12px;" +
                "color:#789083;" +
                "line-height:20px;" +
                "'>" +

                "CarbonTrack 🌱<br>" +
                "Track Today, Save Tomorrow" +

                "</div>" +
                "</td>" +
                "</tr>" +

                "</table>" +
                "</td>" +
                "</tr>" +

                "</table>" +
                "</body>" +
                "</html>";
    }

    // =========================================================
    // GOAL NOT COMPLETED
    // =========================================================

    public void sendGoalUnsuccessfulEmail(
            Goal goal,
            double achievedValue
    ) {

        if (goal == null || goal.getUserEmail() == null) {
            return;
        }

        double progress = 0.0;

        if (goal.getProgress() != null) {
            progress = goal.getProgress();
        }

        String subject =
                "🌿 Sustainability Goal Update";

        String html =
                buildGoalEmail(
                        goal,
                        "unsuccessful",
                        progress
                );

        sendEmail(
                goal.getUserEmail(),
                subject,
                html
        );
    }
    


    // =========================================================
    // EMPLOYEE ACCOUNT CREATED
    // =========================================================

    public void sendEmployeeWelcomeEmail(
            String employeeName,
            String employeeEmail,
            String initialPassword,
            String organizationName
    ) {

        if (employeeEmail == null ||
                employeeEmail.trim().isEmpty()) {

            return;
        }

        String subject =
                "🌿 Welcome to CarbonTrack - Your Employee Account";

        String html =
                buildEmployeeWelcomeEmail(
                        employeeName,
                        employeeEmail,
                        initialPassword,
                        organizationName
                );

        sendEmail(
                employeeEmail,
                subject,
                html
        );
    }


    // =========================================================
    // GOAL EMAIL TEMPLATE
    // =========================================================

    private String buildGoalEmail(
            Goal goal,
            String type,
            double progress
    ) {

        String goalTitle =
                safe(goal.getTitle());

        String category =
                safe(goal.getCategory());

        String activity =
                safe(goal.getActivity());

        String difficulty =
                safe(goal.getDifficulty());

        String startDate =
                formatDate(
                        goal.getStartDate()
                );

        String endDate =
                formatDate(
                        goal.getEndDate()
                );


        // -----------------------------------------------------
        // PROGRESS LIMIT
        // -----------------------------------------------------

        progress = Math.max(
                0,
                Math.min(
                        100,
                        progress
                )
        );

        String progressText =
                String.format(
                        "%.0f%%",
                        progress
                );


        // -----------------------------------------------------
        // DEFAULT VALUES
        // -----------------------------------------------------

        String status = "Active";

        String statusIcon = "🌱";

        String heading =
                "Your sustainability goal has been created successfully.";

        String message =
                "You can track your progress from your "
                + "Sustainability Goals dashboard.";

        String footerMessage =
                "Keep making small sustainable choices every day. 🌱";


        // -----------------------------------------------------
        // COMPLETED
        // -----------------------------------------------------

        if ("completed".equalsIgnoreCase(type)) {

            status = "Completed";

            statusIcon = "✓";

            heading =
                    "Congratulations! 🎉";

            message =
                    "You have successfully completed your "
                    + "sustainability goal.";

            footerMessage =
                    "Great work! Keep making sustainable choices "
                    + "and continue your journey toward a greener lifestyle. 🌱";

            progress = 100;

            progressText = "100%";
        }


        // -----------------------------------------------------
        // NOT COMPLETED
        // -----------------------------------------------------

        else if ("unsuccessful".equalsIgnoreCase(type)) {

            status = "Not Completed";

            statusIcon = "🌿";

            heading =
                    "Your sustainability goal period has ended.";

            message =
                    "You didn't complete this goal this time, "
                    + "but every step counts. 🌱";

            footerMessage =
                    "You can create a new goal and continue improving "
                    + "your sustainability habits.";
        }


        // =====================================================
        // EMAIL HTML
        // =====================================================

        return "<!DOCTYPE html>" +

                "<html>" +

                "<head>" +

                "<meta charset='UTF-8'>" +

                "<meta name='viewport' " +
                "content='width=device-width, initial-scale=1.0'>" +

                "</head>" +

                "<body style='" +
                "margin:0;" +
                "padding:0;" +
                "background-color:#f3faf6;" +
                "font-family:Arial,Helvetica,sans-serif;" +
                "color:#173b2a;" +
                "'>" +

                "<table width='100%' cellpadding='0' cellspacing='0' " +
                "style='background-color:#f3faf6;padding:35px 15px;'>" +

                "<tr>" +

                "<td align='center'>" +

                "<table width='600' cellpadding='0' cellspacing='0' " +
                "style='" +
                "max-width:600px;" +
                "width:100%;" +
                "background-color:#ffffff;" +
                "border:1px solid #dceee4;" +
                "border-radius:16px;" +
                "overflow:hidden;" +
                "box-shadow:0 4px 16px rgba(31,104,66,0.08);" +
                "'>" +


                // HEADER
                "<tr>" +

                "<td style='" +
                "background-color:#e5f5ec;" +
                "padding:24px 28px;" +
                "'>" +

                "<table width='100%' cellpadding='0' cellspacing='0'>" +

                "<tr>" +

                "<td width='52' valign='middle'>" +

                "<div style='" +
                "width:42px;" +
                "height:42px;" +
                "line-height:42px;" +
                "text-align:center;" +
                "background-color:#d4f0df;" +
                "border-radius:12px;" +
                "font-size:21px;" +
                "'>" +

                "🌱" +

                "</div>" +

                "</td>" +

                "<td valign='middle' style='padding-left:12px;'>" +

                "<div style='" +
                "font-size:22px;" +
                "font-weight:700;" +
                "color:#173b2a;" +
                "line-height:28px;" +
                "'>" +

                "Carbon<span style='color:#23915b;'>Track</span>" +

                "</div>" +

                "<div style='" +
                "font-size:12px;" +
                "color:#6c8b7a;" +
                "margin-top:2px;" +
                "'>" +

                "Track Today, Save Tomorrow" +

                "</div>" +

                "</td>" +

                "</tr>" +

                "</table>" +

                "</td>" +

                "</tr>" +


                // CONTENT
                "<tr>" +

                "<td style='padding:30px 28px 10px 28px;'>" +

                "<div style='" +
                "font-size:24px;" +
                "font-weight:700;" +
                "color:#173b2a;" +
                "margin-bottom:10px;" +
                "'>" +

                escapeHtml(goalTitle) +

                "</div>" +

                "<div style='" +
                "font-size:14px;" +
                "color:#6b8175;" +
                "margin-bottom:22px;" +
                "'>" +

                escapeHtml(category) +

                " &nbsp;•&nbsp; " +

                escapeHtml(activity) +

                "</div>" +

                "<span style='" +
                "display:inline-block;" +
                "background-color:#e5f6ec;" +
                "color:#208652;" +
                "font-size:13px;" +
                "font-weight:600;" +
                "padding:7px 12px;" +
                "border-radius:20px;" +
                "'>" +

                statusIcon +
                " &nbsp;" +
                escapeHtml(status) +

                "</span>" +

                "</td>" +

                "</tr>" +


                // MESSAGE
                "<tr>" +

                "<td style='padding:15px 28px 20px 28px;'>" +

                "<p style='" +
                "font-size:15px;" +
                "line-height:24px;" +
                "color:#304d3d;" +
                "margin:0 0 8px 0;" +
                "'>" +

                "Hello," +

                "</p>" +

                "<p style='" +
                "font-size:15px;" +
                "line-height:24px;" +
                "color:#304d3d;" +
                "margin:0 0 8px 0;" +
                "'>" +

                escapeHtml(heading) +

                "</p>" +

                "<p style='" +
                "font-size:14px;" +
                "line-height:22px;" +
                "color:#698074;" +
                "margin:0;" +
                "'>" +

                escapeHtml(message) +

                "</p>" +

                "</td>" +

                "</tr>" +


                // GOAL INFORMATION
                "<tr>" +

                "<td style='padding:0 28px 10px 28px;'>" +

                "<table width='100%' cellpadding='0' cellspacing='0'>" +

                "<tr>" +

                "<td width='50%' style='padding:5px;'>" +

                "<div style='" +
                "background-color:#f6fbf8;" +
                "border:1px solid #dfede5;" +
                "border-radius:10px;" +
                "padding:14px;" +
                "'>" +

                "<div style='" +
                "font-size:11px;" +
                "color:#789083;" +
                "margin-bottom:5px;" +
                "'>" +

                "Category" +

                "</div>" +

                "<div style='" +
                "font-size:14px;" +
                "font-weight:600;" +
                "color:#244936;" +
                "'>" +

                escapeHtml(category) +

                "</div>" +

                "</div>" +

                "</td>" +

                "<td width='50%' style='padding:5px;'>" +

                "<div style='" +
                "background-color:#f6fbf8;" +
                "border:1px solid #dfede5;" +
                "border-radius:10px;" +
                "padding:14px;" +
                "'>" +

                "<div style='" +
                "font-size:11px;" +
                "color:#789083;" +
                "margin-bottom:5px;" +
                "'>" +

                "Activity" +

                "</div>" +

                "<div style='" +
                "font-size:14px;" +
                "font-weight:600;" +
                "color:#244936;" +
                "'>" +

                escapeHtml(activity) +

                "</div>" +

                "</div>" +

                "</td>" +

                "</tr>" +

                "<tr>" +

                "<td width='50%' style='padding:5px;'>" +

                "<div style='" +
                "background-color:#f6fbf8;" +
                "border:1px solid #dfede5;" +
                "border-radius:10px;" +
                "padding:14px;" +
                "'>" +

                "<div style='" +
                "font-size:11px;" +
                "color:#789083;" +
                "margin-bottom:5px;" +
                "'>" +

                "Difficulty" +

                "</div>" +

                "<div style='" +
                "font-size:14px;" +
                "font-weight:600;" +
                "color:#244936;" +
                "'>" +

                escapeHtml(difficulty) +

                "</div>" +

                "</div>" +

                "</td>" +

                "<td width='50%' style='padding:5px;'>" +

                "<div style='" +
                "background-color:#f6fbf8;" +
                "border:1px solid #dfede5;" +
                "border-radius:10px;" +
                "padding:14px;" +
                "'>" +

                "<div style='" +
                "font-size:11px;" +
                "color:#789083;" +
                "margin-bottom:5px;" +
                "'>" +

                "Period" +

                "</div>" +

                "<div style='" +
                "font-size:13px;" +
                "font-weight:600;" +
                "color:#244936;" +
                "'>" +

                escapeHtml(startDate) +

                " → " +

                escapeHtml(endDate) +

                "</div>" +

                "</div>" +

                "</td>" +

                "</tr>" +

                "</table>" +

                "</td>" +

                "</tr>" +


                // PROGRESS
                "<tr>" +

                "<td style='padding:18px 28px 25px 28px;'>" +

                "<table width='100%' cellpadding='0' cellspacing='0'>" +

                "<tr>" +

                "<td style='" +
                "font-size:13px;" +
                "font-weight:500;" +
                "color:#496354;" +
                "padding-bottom:8px;" +
                "'>" +

                "Progress" +

                "</td>" +

                "<td align='right' style='" +
                "font-size:14px;" +
                "font-weight:700;" +
                "color:#198754;" +
                "padding-bottom:8px;" +
                "'>" +

                progressText +

                "</td>" +

                "</tr>" +

                "<tr>" +

                "<td colspan='2'>" +

                "<div style='" +
                "width:100%;" +
                "height:9px;" +
                "background-color:#e6f1eb;" +
                "border-radius:10px;" +
                "overflow:hidden;" +
                "'>" +

                "<div style='" +
                "width:" + progress + "%;" +
                "height:9px;" +
                "background-color:#24915b;" +
                "border-radius:10px;" +
                "'></div>" +

                "</div>" +

                "</td>" +

                "</tr>" +

                "</table>" +

                "</td>" +

                "</tr>" +


                // FOOTER MESSAGE
                "<tr>" +

                "<td style='padding:0 28px 28px 28px;'>" +

                "<div style='" +
                "background-color:#eef9f3;" +
                "border-radius:12px;" +
                "padding:16px 18px;" +
                "font-size:13px;" +
                "line-height:21px;" +
                "color:#496957;" +
                "'>" +

                escapeHtml(footerMessage) +

                "</div>" +

                "</td>" +

                "</tr>" +


                // BUTTON
                "<tr>" +

                "<td align='center' style='padding:0 28px 30px 28px;'>" +

                "<a href='http://localhost:5173/dashboard' " +
                "style='" +
                "display:inline-block;" +
                "background-color:#238b57;" +
                "color:#ffffff;" +
                "text-decoration:none;" +
                "font-size:14px;" +
                "font-weight:600;" +
                "padding:12px 24px;" +
                "border-radius:9px;" +
                "'>" +

                "View My Goals" +

                "</a>" +

                "</td>" +

                "</tr>" +


                // EMAIL FOOTER
                "<tr>" +

                "<td align='center' style='" +
                "background-color:#f7fbf9;" +
                "border-top:1px solid #e4eee8;" +
                "padding:18px;" +
                "'>" +

                "<div style='" +
                "font-size:12px;" +
                "color:#789083;" +
                "line-height:20px;" +
                "'>" +

                "CarbonTrack 🌱<br>" +
                "Track Today, Save Tomorrow" +

                "</div>" +

                "</td>" +

                "</tr>" +

                "</table>" +

                "</td>" +

                "</tr>" +

                "</table>" +

                "</body>" +

                "</html>";
    }


    // =========================================================
    // EMPLOYEE WELCOME EMAIL TEMPLATE
    // =========================================================

    private String buildEmployeeWelcomeEmail(
            String employeeName,
            String employeeEmail,
            String initialPassword,
            String organizationName
    ) {

        String safeEmployeeName =
                escapeHtml(
                        employeeName == null ||
                        employeeName.trim().isEmpty()
                                ? "Employee"
                                : employeeName.trim()
                );

        String safeEmployeeEmail =
                escapeHtml(
                        employeeEmail == null
                                ? ""
                                : employeeEmail.trim()
                );

        String safePassword =
                escapeHtml(
                        initialPassword == null
                                ? ""
                                : initialPassword
                );

        String safeOrganizationName =
                escapeHtml(
                        organizationName == null ||
                        organizationName.trim().isEmpty()
                                ? "Your Organization"
                                : organizationName.trim()
                );


        return "<!DOCTYPE html>" +

                "<html>" +

                "<head>" +

                "<meta charset='UTF-8'>" +

                "<meta name='viewport' " +
                "content='width=device-width, initial-scale=1.0'>" +

                "</head>" +

                "<body style='" +
                "margin:0;" +
                "padding:0;" +
                "background-color:#f3faf6;" +
                "font-family:Arial,Helvetica,sans-serif;" +
                "color:#173b2a;" +
                "'>" +

                "<table width='100%' cellpadding='0' cellspacing='0' " +
                "style='background-color:#f3faf6;padding:35px 15px;'>" +

                "<tr>" +

                "<td align='center'>" +

                "<table width='600' cellpadding='0' cellspacing='0' " +
                "style='" +
                "max-width:600px;" +
                "width:100%;" +
                "background-color:#ffffff;" +
                "border:1px solid #dceee4;" +
                "border-radius:16px;" +
                "overflow:hidden;" +
                "box-shadow:0 4px 16px rgba(31,104,66,0.08);" +
                "'>" +


                // HEADER
                "<tr>" +

                "<td style='" +
                "background-color:#e5f5ec;" +
                "padding:24px 28px;" +
                "'>" +

                "<table width='100%' cellpadding='0' cellspacing='0'>" +

                "<tr>" +

                "<td width='52' valign='middle'>" +

                "<div style='" +
                "width:42px;" +
                "height:42px;" +
                "line-height:42px;" +
                "text-align:center;" +
                "background-color:#d4f0df;" +
                "border-radius:12px;" +
                "font-size:21px;" +
                "'>" +

                "🌱" +

                "</div>" +

                "</td>" +

                "<td valign='middle' style='padding-left:12px;'>" +

                "<div style='" +
                "font-size:22px;" +
                "font-weight:700;" +
                "color:#173b2a;" +
                "line-height:28px;" +
                "'>" +

                "Carbon<span style='color:#23915b;'>Track</span>" +

                "</div>" +

                "<div style='" +
                "font-size:12px;" +
                "color:#6c8b7a;" +
                "margin-top:2px;" +
                "'>" +

                "Track Today, Save Tomorrow" +

                "</div>" +

                "</td>" +

                "</tr>" +

                "</table>" +

                "</td>" +

                "</tr>" +


                // CONTENT
                "<tr>" +

                "<td style='padding:30px 28px 10px 28px;'>" +

                "<div style='" +
                "font-size:24px;" +
                "font-weight:700;" +
                "color:#173b2a;" +
                "margin-bottom:10px;" +
                "'>" +

                "Welcome to CarbonTrack! 🌿" +

                "</div>" +

                "<p style='" +
                "font-size:15px;" +
                "line-height:24px;" +
                "color:#304d3d;" +
                "margin:0 0 10px 0;" +
                "'>" +

                "Hello " +
                safeEmployeeName +
                "," +

                "</p>" +

                "<p style='" +
                "font-size:14px;" +
                "line-height:23px;" +
                "color:#698074;" +
                "margin:0;" +
                "'>" +

                safeOrganizationName +
                " has created a CarbonTrack employee account " +
                "for you. You can use the credentials below to " +
                "log in to your account." +

                "</p>" +

                "</td>" +

                "</tr>" +


                // LOGIN DETAILS
                "<tr>" +

                "<td style='padding:15px 28px 10px 28px;'>" +

                "<div style='" +
                "background-color:#f6fbf8;" +
                "border:1px solid #dfede5;" +
                "border-radius:12px;" +
                "padding:20px;" +
                "'>" +

                "<div style='" +
                "font-size:16px;" +
                "font-weight:700;" +
                "color:#244936;" +
                "margin-bottom:16px;" +
                "'>" +

                "Your Login Details" +

                "</div>" +

                "<div style='margin-bottom:14px;'>" +

                "<div style='" +
                "font-size:11px;" +
                "color:#789083;" +
                "margin-bottom:5px;" +
                "'>" +

                "EMAIL" +

                "</div>" +

                "<div style='" +
                "font-size:15px;" +
                "font-weight:600;" +
                "color:#244936;" +
                "'>" +

                safeEmployeeEmail +

                "</div>" +

                "</div>" +

                "<div>" +

                "<div style='" +
                "font-size:11px;" +
                "color:#789083;" +
                "margin-bottom:5px;" +
                "'>" +

                "INITIAL PASSWORD" +

                "</div>" +

                "<div style='" +
                "font-size:15px;" +
                "font-weight:600;" +
                "color:#244936;" +
                "background-color:#ffffff;" +
                "border:1px solid #dceee4;" +
                "border-radius:8px;" +
                "padding:11px 13px;" +
                "'>" +

                safePassword +

                "</div>" +

                "</div>" +

                "</div>" +

                "</td>" +

                "</tr>" +


                // FIRST LOGIN NOTICE
                "<tr>" +

                "<td style='padding:10px 28px 20px 28px;'>" +

                "<div style='" +
                "background-color:#fff8e8;" +
                "border:1px solid #f2dfad;" +
                "border-radius:12px;" +
                "padding:15px 17px;" +
                "font-size:13px;" +
                "line-height:21px;" +
                "color:#705c28;" +
                "'>" +

                "<strong>Important:</strong><br>" +

                "This is your initial password. " +
                "For security, you will be asked to change " +
                "your password when you log in for the first time." +

                "</div>" +

                "</td>" +

                "</tr>" +


                // LOGIN BUTTON
                "<tr>" +

                "<td align='center' style='padding:0 28px 30px 28px;'>" +

                "<a href='http://localhost:5173/login' " +
                "style='" +
                "display:inline-block;" +
                "background-color:#238b57;" +
                "color:#ffffff;" +
                "text-decoration:none;" +
                "font-size:14px;" +
                "font-weight:600;" +
                "padding:12px 28px;" +
                "border-radius:9px;" +
                "'>" +

                "Login to CarbonTrack" +

                "</a>" +

                "</td>" +

                "</tr>" +


                // FOOTER
                "<tr>" +

                "<td align='center' style='" +
                "background-color:#f7fbf9;" +
                "border-top:1px solid #e4eee8;" +
                "padding:18px;" +
                "'>" +

                "<div style='" +
                "font-size:12px;" +
                "color:#789083;" +
                "line-height:20px;" +
                "'>" +

                "CarbonTrack 🌱<br>" +
                "Track Today, Save Tomorrow" +

                "</div>" +

                "</td>" +

                "</tr>" +

                "</table>" +

                "</td>" +

                "</tr>" +

                "</table>" +

                "</body>" +

                "</html>";
    }



    // =========================================================
    // SEND EMAIL THROUGH BREVO
    // =========================================================

    private void sendEmail(
            String recipient,
            String subject,
            String htmlContent
    ) {

        try {

            HttpHeaders headers =
                    new HttpHeaders();

            headers.setContentType(
                    MediaType.APPLICATION_JSON
            );

            headers.set(
                    "api-key",
                    brevoApiKey
            );


            // -------------------------------------------------
            // SENDER
            // -------------------------------------------------

            Map<String, Object> sender =
                    new HashMap<>();

            sender.put(
                    "name",
                    senderName
            );

            sender.put(
                    "email",
                    senderEmail
            );


            // -------------------------------------------------
            // RECIPIENT
            // -------------------------------------------------

            Map<String, String> to =
                    new HashMap<>();

            to.put(
                    "email",
                    recipient
            );


            // -------------------------------------------------
            // REQUEST BODY
            // -------------------------------------------------

            Map<String, Object> request =
                    new HashMap<>();

            request.put(
                    "sender",
                    sender
            );

            request.put(
                    "to",
                    new Map[]{to}
            );

            request.put(
                    "subject",
                    subject
            );

            request.put(
                    "htmlContent",
                    htmlContent
            );


            HttpEntity<Map<String, Object>> entity =
                    new HttpEntity<>(
                            request,
                            headers
                    );


            restTemplate.postForEntity(
                    brevoApiUrl,
                    entity,
                    String.class
            );

            System.out.println(
                    "Email sent successfully to: "
                    + recipient
            );

        } catch (Exception e) {

            System.err.println(
                    "Failed to send email: "
                    + e.getMessage()
            );
        }
    }


    // =========================================================
    // SAFE STRING
    // =========================================================

    private String safe(String value) {

        if (value == null ||
                value.trim().isEmpty()) {

            return "-";
        }

        return value.trim();
    }


    // =========================================================
    // FORMAT DATE
    // =========================================================

    private String formatDate(
            LocalDate date
    ) {

        if (date == null) {
            return "-";
        }

        return date.getDayOfMonth()
                + " "
                + date.getMonth()
                        .toString()
                        .substring(0, 1)
                + date.getMonth()
                        .toString()
                        .substring(1)
                        .toLowerCase()
                + " "
                + date.getYear();
    }


    // =========================================================
    // HTML ESCAPE
    // =========================================================

    private String escapeHtml(
            String value
    ) {

        if (value == null) {
            return "";
        }

        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
    // =========================================================
// SUPPORT REPLY EMAIL
// =========================================================

public void sendSupportReplyEmail(
        String recipientEmail,
        String ticketSubject,
        String replyMessage
) {

    if (recipientEmail == null ||
            recipientEmail.trim().isEmpty()) {

        return;
    }

    String subject =
            "💬 CarbonTrack Support replied to your ticket";

    String html =
            buildSupportEmail(
                    ticketSubject,
                    replyMessage,
                    "reply"
            );

    sendEmail(
            recipientEmail,
            subject,
            html
    );
}


// =========================================================
// SUPPORT RESOLVED EMAIL
// =========================================================

        public void sendSupportResolvedEmail(
                String recipientEmail,
                String ticketSubject
        ) {

        if (recipientEmail == null ||
                recipientEmail.trim().isEmpty()) {

                return;
        }

        String subject =
                "✅ CarbonTrack Support ticket resolved";

        String html =
                buildSupportEmail(
                        ticketSubject,
                        "Your CarbonTrack support request has been resolved.",
                        "resolved"
                );

        sendEmail(
                recipientEmail,
                subject,
                html
        );
        }


        // =========================================================
        // SUPPORT EMAIL TEMPLATE
        // =========================================================

        private String buildSupportEmail(
                String ticketSubject,
                String message,
                String type
        ) {

        String heading;

        String description;

        if ("resolved".equalsIgnoreCase(type)) {

                heading =
                        "Your support request has been resolved.";

                description =
                        "The CarbonTrack Support team has marked your support request as resolved.";

        } else {

                heading =
                        "CarbonTrack Support has replied.";

                description =
                        "You have received a new reply from the CarbonTrack Support team.";
        }


        return "<!DOCTYPE html>" +

                "<html>" +

                "<head>" +

                "<meta charset='UTF-8'>" +

                "<meta name='viewport' " +
                "content='width=device-width, initial-scale=1.0'>" +

                "</head>" +

                "<body style='" +
                "margin:0;" +
                "padding:0;" +
                "background-color:#f4f8f5;" +
                "font-family:Arial,Helvetica,sans-serif;" +
                "'>" +

                "<table width='100%' " +
                "cellpadding='0' " +
                "cellspacing='0' " +
                "style='padding:30px 15px;'>" +

                "<tr>" +

                "<td align='center'>" +

                "<table width='600' " +
                "cellpadding='0' " +
                "cellspacing='0' " +
                "style='" +
                "max-width:600px;" +
                "width:100%;" +
                "background:#ffffff;" +
                "border-radius:14px;" +
                "overflow:hidden;" +
                "border:1px solid #e1ebe4;" +
                "'>" +


                // =================================================
                // HEADER
                // =================================================

                "<tr>" +

                "<td style='" +
                "background:#238b57;" +
                "padding:24px 28px;" +
                "color:#ffffff;" +
                "'>" +

                "<div style='" +
                "font-size:22px;" +
                "font-weight:700;" +
                "'>" +

                "CarbonTrack 🌱" +

                "</div>" +

                "<div style='" +
                "font-size:13px;" +
                "margin-top:5px;" +
                "opacity:.9;" +
                "'>" +

                "Track Today, Save Tomorrow" +

                "</div>" +

                "</td>" +

                "</tr>" +


                // =================================================
                // CONTENT
                // =================================================

                "<tr>" +

                "<td style='padding:30px 28px;'>" +

                "<h2 style='" +
                "margin:0 0 12px 0;" +
                "font-size:21px;" +
                "color:#1f3b2a;" +
                "'>" +

                escapeHtml(heading) +

                "</h2>" +

                "<p style='" +
                "font-size:14px;" +
                "line-height:22px;" +
                "color:#5f7065;" +
                "margin:0 0 22px 0;" +
                "'>" +

                escapeHtml(description) +

                "</p>" +


                // =================================================
                // TICKET
                // =================================================

                "<div style='" +
                "background:#f2f8f4;" +
                "border:1px solid #dcebe1;" +
                "border-radius:10px;" +
                "padding:18px;" +
                "margin-bottom:18px;" +
                "'>" +

                "<div style='" +
                "font-size:12px;" +
                "color:#789083;" +
                "margin-bottom:6px;" +
                "'>" +

                "SUPPORT TICKET" +

                "</div>" +

                "<div style='" +
                "font-size:16px;" +
                "font-weight:600;" +
                "color:#244b34;" +
                "'>" +

                escapeHtml(ticketSubject) +

                "</div>" +

                "</div>" +


                // =================================================
                // MESSAGE
                // =================================================

                "<div style='" +
                "background:#ffffff;" +
                "border:1px solid #e3ebe6;" +
                "border-radius:10px;" +
                "padding:18px;" +
                "margin-bottom:25px;" +
                "'>" +

                "<div style='" +
                "font-size:12px;" +
                "color:#789083;" +
                "margin-bottom:8px;" +
                "'>" +

                ("resolved".equalsIgnoreCase(type)
                        ? "STATUS UPDATE"
                        : "CARBONTRACK SUPPORT") +

                "</div>" +

                "<div style='" +
                "font-size:14px;" +
                "line-height:23px;" +
                "color:#33483b;" +
                "white-space:pre-wrap;" +
                "'>" +

                escapeHtml(message) +

                "</div>" +

                "</div>" +


                // =================================================
                // BUTTON
                // =================================================

                "<div style='text-align:center;'>" +

                "<a href='http://localhost:5173/dashboard' " +
                "style='" +
                "display:inline-block;" +
                "background:#238b57;" +
                "color:#ffffff;" +
                "text-decoration:none;" +
                "font-size:14px;" +
                "font-weight:600;" +
                "padding:12px 24px;" +
                "border-radius:9px;" +
                "'>" +

                "Open CarbonTrack" +

                "</a>" +

                "</div>" +

                "</td>" +

                "</tr>" +


                // =================================================
                // FOOTER
                // =================================================

                "<tr>" +

                "<td align='center' style='" +
                "background:#f7fbf9;" +
                "border-top:1px solid #e4eee8;" +
                "padding:18px;" +
                "'>" +

                "<div style='" +
                "font-size:12px;" +
                "line-height:20px;" +
                "color:#789083;" +
                "'>" +

                "CarbonTrack 🌱<br>" +
                "Track Today, Save Tomorrow" +

                "</div>" +

                "</td>" +

                "</tr>" +

                "</table>" +

                "</td>" +

                "</tr>" +

                "</table>" +

                "</body>" +

                "</html>";
        }
}