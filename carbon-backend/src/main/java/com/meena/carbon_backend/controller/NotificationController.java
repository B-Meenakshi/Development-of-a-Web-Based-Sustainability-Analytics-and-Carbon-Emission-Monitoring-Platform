package com.meena.carbon_backend.controller;

import com.meena.carbon_backend.entity.Notification;
import com.meena.carbon_backend.service.NotificationService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:5173")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(
            NotificationService notificationService) {

        this.notificationService = notificationService;
    }


    // =========================================================
    // GET ALL NOTIFICATIONS
    // =========================================================

    @GetMapping("/user/{email}")
    public ResponseEntity<?> getUserNotifications(
            @PathVariable String email) {

        try {

            if (email == null ||
                    email.trim().isEmpty()) {

                return ResponseEntity.badRequest()
                        .body("User email is required");
            }

            List<Notification> notifications =
                    notificationService.getUserNotifications(
                            email.trim()
                    );

            return ResponseEntity.ok(notifications);

        } catch (Exception e) {

            return ResponseEntity.internalServerError()
                    .body("Unable to load notifications");
        }
    }


    // =========================================================
    // GET UNREAD NOTIFICATIONS
    // =========================================================

    @GetMapping("/user/{email}/unread")
    public ResponseEntity<?> getUnreadNotifications(
            @PathVariable String email) {

        try {

            if (email == null ||
                    email.trim().isEmpty()) {

                return ResponseEntity.badRequest()
                        .body("User email is required");
            }

            List<Notification> notifications =
                    notificationService.getUnreadNotifications(
                            email.trim()
                    );

            return ResponseEntity.ok(notifications);

        } catch (Exception e) {

            return ResponseEntity.internalServerError()
                    .body("Unable to load unread notifications");
        }
    }


    // =========================================================
    // GET UNREAD COUNT
    // =========================================================

    @GetMapping("/user/{email}/count")
    public ResponseEntity<?> getUnreadCount(
            @PathVariable String email) {

        try {

            if (email == null ||
                    email.trim().isEmpty()) {

                return ResponseEntity.badRequest()
                        .body("User email is required");
            }

            long count =
                    notificationService.getUnreadCount(
                            email.trim()
                    );

            return ResponseEntity.ok(count);

        } catch (Exception e) {

            return ResponseEntity.internalServerError()
                    .body("Unable to load notification count");
        }
    }


    // =========================================================
    // MARK ONE NOTIFICATION AS READ
    // =========================================================

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(
            @PathVariable Long id) {

        try {

            if (id == null) {

                return ResponseEntity.badRequest()
                        .body("Notification ID is required");
            }

            Notification notification =
                    notificationService.markAsRead(id);

            return ResponseEntity.ok(notification);

        } catch (IllegalArgumentException e) {

            return ResponseEntity.badRequest()
                    .body(e.getMessage());

        } catch (Exception e) {

            return ResponseEntity.internalServerError()
                    .body("Unable to mark notification as read");
        }
    }


    // =========================================================
    // MARK ALL NOTIFICATIONS AS READ
    // =========================================================

    @PutMapping("/user/{email}/read-all")
    public ResponseEntity<?> markAllAsRead(
            @PathVariable String email) {

        try {

            if (email == null ||
                    email.trim().isEmpty()) {

                return ResponseEntity.badRequest()
                        .body("User email is required");
            }

            notificationService.markAllAsRead(
                    email.trim()
            );

            return ResponseEntity.ok(
                    "All notifications marked as read"
            );

        } catch (Exception e) {

            return ResponseEntity.internalServerError()
                    .body("Unable to mark notifications as read");
        }
    }


    // =========================================================
    // DELETE NOTIFICATION
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotification(
            @PathVariable Long id) {

        try {

            if (id == null) {

                return ResponseEntity.badRequest()
                        .body("Notification ID is required");
            }

            notificationService.deleteNotification(id);

            return ResponseEntity.ok(
                    "Notification deleted successfully"
            );

        } catch (IllegalArgumentException e) {

            return ResponseEntity.badRequest()
                    .body(e.getMessage());

        } catch (Exception e) {

            return ResponseEntity.internalServerError()
                    .body("Unable to delete notification");
        }
    }
}