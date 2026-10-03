package com.meena.carbon_backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =========================================================
    // USER EMAIL
    // =========================================================

    // User who receives the notification
    @Column(nullable = false)
    private String userEmail;


    // =========================================================
    // SUPPORT TICKET
    // =========================================================

    // Related support ticket
    // Used when the user clicks the notification
    private Long ticketId;


    // =========================================================
    // NOTIFICATION CONTENT
    // =========================================================

    // Notification heading
    @Column(nullable = false)
    private String title;

    // Notification message
    @Column(length = 1000, nullable = false)
    private String message;

    // Examples:
    // GOAL_COMPLETED
    // SUPPORT_REPLY
    // SUPPORT_RESOLVED
    private String type;


    // =========================================================
    // READ / UNREAD
    // =========================================================

    // Used to show unread/read notification
    //
    // Database column is is_read
    // to avoid MySQL READ keyword conflict
    @Column(name = "is_read", nullable = false)
    private boolean read = false;


    // =========================================================
    // CREATED TIME
    // =========================================================

    private LocalDateTime createdAt;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public Notification() {
    }


    // =========================================================
    // GETTERS AND SETTERS
    // =========================================================

    public Long getId() {
        return id;
    }


    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }


    public Long getTicketId() {
        return ticketId;
    }

    public void setTicketId(Long ticketId) {
        this.ticketId = ticketId;
    }


    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }


    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }


    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }


    public boolean isRead() {
        return read;
    }

    public void setRead(boolean read) {
        this.read = read;
    }


    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}