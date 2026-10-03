package com.meena.carbon_backend.service;

import com.meena.carbon_backend.entity.Notification;
import com.meena.carbon_backend.repository.NotificationRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public NotificationService(
            NotificationRepository notificationRepository) {

        this.notificationRepository =
                notificationRepository;
    }


    // =========================================================
    // CREATE GOAL COMPLETION NOTIFICATION
    // =========================================================

    public Notification createGoalCompletionNotification(
            String userEmail,
            String goalTitle,
            Double targetValue,
            String unit) {

        if (userEmail == null ||
                userEmail.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "User email is required"
            );
        }

        if (goalTitle == null ||
                goalTitle.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Goal title is required"
            );
        }


        Notification notification =
                new Notification();


        notification.setUserEmail(
                userEmail.trim()
        );


        notification.setTitle(
                "Goal Completed 🎉"
        );


        String targetText = "";


        if (targetValue != null) {

            targetText =
                    " You reached your target of "
                    + targetValue
                    + (
                        unit != null &&
                        !unit.isBlank()
                        ? " " + unit
                        : ""
                    )
                    + ".";
        }


        notification.setMessage(
                "Congratulations! You successfully "
                + "completed your sustainability goal \""
                + goalTitle.trim()
                + "\"."
                + targetText
                + " Keep up the great work!"
        );


        notification.setType(
                "GOAL_COMPLETED"
        );


        notification.setRead(false);


        notification.setCreatedAt(
                LocalDateTime.now()
        );


        return notificationRepository.save(
                notification
        );
    }


    // =========================================================
    // CREATE SUPPORT REPLY NOTIFICATION
    // =========================================================

    public Notification createSupportReplyNotification(
            String userEmail,
            Long ticketId,
            String ticketSubject) {

        if (userEmail == null ||
                userEmail.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "User email is required"
            );
        }


        if (ticketId == null) {

            throw new IllegalArgumentException(
                    "Ticket ID is required"
            );
        }


        Notification notification =
                new Notification();


        notification.setUserEmail(
                userEmail.trim()
        );


        notification.setTicketId(
                ticketId
        );


        notification.setTitle(
                "CarbonTrack Support replied"
        );


        notification.setMessage(
                "CarbonTrack Support replied to your "
                + "ticket: "
                + (
                    ticketSubject != null &&
                    !ticketSubject.trim().isEmpty()
                    ? ticketSubject.trim()
                    : "Support request"
                )
        );


        notification.setType(
                "SUPPORT_REPLY"
        );


        notification.setRead(false);


        notification.setCreatedAt(
                LocalDateTime.now()
        );


        return notificationRepository.save(
                notification
        );
    }


    // =========================================================
    // CREATE SUPPORT RESOLVED NOTIFICATION
    // =========================================================

    public Notification createSupportResolvedNotification(
            String userEmail,
            Long ticketId,
            String ticketSubject) {

        if (userEmail == null ||
                userEmail.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "User email is required"
            );
        }


        if (ticketId == null) {

            throw new IllegalArgumentException(
                    "Ticket ID is required"
            );
        }


        Notification notification =
                new Notification();


        notification.setUserEmail(
                userEmail.trim()
        );


        notification.setTicketId(
                ticketId
        );


        notification.setTitle(
                "Support ticket resolved"
        );


        notification.setMessage(
                "Your CarbonTrack support ticket \""
                + (
                    ticketSubject != null &&
                    !ticketSubject.trim().isEmpty()
                    ? ticketSubject.trim()
                    : "Support request"
                )
                + "\" has been resolved."
        );


        notification.setType(
                "SUPPORT_RESOLVED"
        );


        notification.setRead(false);


        notification.setCreatedAt(
                LocalDateTime.now()
        );


        return notificationRepository.save(
                notification
        );
    }


    // =========================================================
    // GET ALL NOTIFICATIONS FOR USER
    // =========================================================

    public List<Notification> getUserNotifications(
            String userEmail) {

        if (userEmail == null ||
                userEmail.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "User email is required"
            );
        }


        return notificationRepository
                .findByUserEmailOrderByCreatedAtDesc(
                        userEmail.trim()
                );
    }


    // =========================================================
    // GET UNREAD NOTIFICATIONS
    // =========================================================

    public List<Notification> getUnreadNotifications(
            String userEmail) {

        if (userEmail == null ||
                userEmail.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "User email is required"
            );
        }


        return notificationRepository
                .findByUserEmailAndReadFalseOrderByCreatedAtDesc(
                        userEmail.trim()
                );
    }


    // =========================================================
    // GET UNREAD NOTIFICATION COUNT
    // =========================================================

    public long getUnreadCount(
            String userEmail) {

        if (userEmail == null ||
                userEmail.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "User email is required"
            );
        }


        return notificationRepository
                .countByUserEmailAndReadFalse(
                        userEmail.trim()
                );
    }


    // =========================================================
    // GET NOTIFICATIONS FOR SUPPORT TICKET
    // =========================================================

    public List<Notification> getTicketNotifications(
            Long ticketId) {

        if (ticketId == null) {

            throw new IllegalArgumentException(
                    "Ticket ID is required"
            );
        }


        return notificationRepository
                .findByTicketIdOrderByCreatedAtDesc(
                        ticketId
                );
    }


    // =========================================================
    // MARK ONE NOTIFICATION AS READ
    // =========================================================

    public Notification markAsRead(
            Long notificationId) {

        if (notificationId == null) {

            throw new IllegalArgumentException(
                    "Notification ID is required"
            );
        }


        Notification notification =
                notificationRepository
                        .findById(notificationId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Notification not found"
                                )
                        );


        notification.setRead(true);


        return notificationRepository.save(
                notification
        );
    }


    // =========================================================
    // MARK ALL NOTIFICATIONS AS READ
    // =========================================================

    public void markAllAsRead(
            String userEmail) {

        if (userEmail == null ||
                userEmail.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "User email is required"
            );
        }


        List<Notification> notifications =
                notificationRepository
                        .findByUserEmailOrderByCreatedAtDesc(
                                userEmail.trim()
                        );


        for (Notification notification :
                notifications) {

            notification.setRead(true);
        }


        notificationRepository.saveAll(
                notifications
        );
    }


    // =========================================================
    // DELETE NOTIFICATION
    // =========================================================

    public void deleteNotification(
            Long notificationId) {

        if (notificationId == null) {

            throw new IllegalArgumentException(
                    "Notification ID is required"
            );
        }


        if (!notificationRepository
                .existsById(notificationId)) {

            throw new IllegalArgumentException(
                    "Notification not found"
            );
        }


        notificationRepository.deleteById(
                notificationId
        );
    }
}