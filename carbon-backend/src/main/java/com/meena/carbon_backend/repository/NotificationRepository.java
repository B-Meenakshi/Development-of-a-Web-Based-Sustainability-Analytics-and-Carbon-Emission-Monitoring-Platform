package com.meena.carbon_backend.repository;

import com.meena.carbon_backend.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository
        extends JpaRepository<Notification, Long> {

    // =========================================================
    // GET ALL NOTIFICATIONS FOR A USER
    // =========================================================

    List<Notification> findByUserEmailOrderByCreatedAtDesc(
            String userEmail
    );


    // =========================================================
    // GET UNREAD NOTIFICATIONS
    // =========================================================

    List<Notification> findByUserEmailAndReadFalseOrderByCreatedAtDesc(
            String userEmail
    );


    // =========================================================
    // COUNT UNREAD NOTIFICATIONS
    // =========================================================

    long countByUserEmailAndReadFalse(
            String userEmail
    );


    // =========================================================
    // GET NOTIFICATIONS FOR A SUPPORT TICKET
    // =========================================================

    List<Notification> findByTicketIdOrderByCreatedAtDesc(
            Long ticketId
    );
}