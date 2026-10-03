package com.meena.carbon_backend.controller;

import com.meena.carbon_backend.entity.SupportMessage;
import com.meena.carbon_backend.entity.SupportTicket;
import com.meena.carbon_backend.service.SupportService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/support")
@CrossOrigin(origins = "http://localhost:5173")
public class SupportController {

    private final SupportService supportService;

    public SupportController(SupportService supportService) {
        this.supportService = supportService;
    }

    // =========================================================
    // CREATE NEW SUPPORT TICKET
    // =========================================================

    @PostMapping("/tickets")
    public ResponseEntity<?> createTicket(
            @RequestBody CreateTicketRequest request) {

        try {

            SupportTicket ticket =
                    supportService.createTicket(
                            request.getSubject(),
                            request.getCategory(),
                            request.getPriority(),
                            request.getCreatedByType(),
                            request.getUserId(),
                            request.getOrganizationId(),
                            request.getInitialMessage()
                    );

            return ResponseEntity.ok(ticket);

        } catch (IllegalArgumentException e) {

            return ResponseEntity.badRequest()
                    .body(e.getMessage());

        } catch (Exception e) {

            return ResponseEntity.internalServerError()
                    .body("Unable to create support ticket");
        }
    }

    // =========================================================
    // USER - GET MY TICKETS
    // =========================================================

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserTickets(
            @PathVariable Long userId) {

        try {

            List<SupportTicket> tickets =
                    supportService.getUserTickets(userId);

            return ResponseEntity.ok(tickets);

        } catch (IllegalArgumentException e) {

            return ResponseEntity.badRequest()
                    .body(e.getMessage());

        } catch (Exception e) {

            return ResponseEntity.internalServerError()
                    .body("Unable to load support tickets");
        }
    }

    // =========================================================
    // ORGANIZATION - GET MY TICKETS
    // =========================================================

    @GetMapping("/organization/{organizationId}")
    public ResponseEntity<?> getOrganizationTickets(
            @PathVariable Long organizationId) {

        try {

            List<SupportTicket> tickets =
                    supportService.getOrganizationTickets(
                            organizationId
                    );

            return ResponseEntity.ok(tickets);

        } catch (IllegalArgumentException e) {

            return ResponseEntity.badRequest()
                    .body(e.getMessage());

        } catch (Exception e) {

            return ResponseEntity.internalServerError()
                    .body("Unable to load support tickets");
        }
    }

    // =========================================================
    // ADMIN - GET ALL TICKETS
    // =========================================================

    @GetMapping("/admin/tickets")
    public ResponseEntity<?> getAllTickets() {

        try {

            List<SupportTicket> tickets =
                    supportService.getAllTickets();

            return ResponseEntity.ok(tickets);

        } catch (Exception e) {

            return ResponseEntity.internalServerError()
                    .body("Unable to load support tickets");
        }
    }

    // =========================================================
    // ADMIN - FILTER TICKETS BY STATUS
    // =========================================================

    @GetMapping("/admin/tickets/status/{status}")
    public ResponseEntity<?> getTicketsByStatus(
            @PathVariable String status) {

        try {

            List<SupportTicket> tickets =
                    supportService.getTicketsByStatus(status);

            return ResponseEntity.ok(tickets);

        } catch (IllegalArgumentException e) {

            return ResponseEntity.badRequest()
                    .body(e.getMessage());

        } catch (Exception e) {

            return ResponseEntity.internalServerError()
                    .body("Unable to load support tickets");
        }
    }

    // =========================================================
    // GET SINGLE TICKET
    // =========================================================

    @GetMapping("/tickets/{ticketId}")
    public ResponseEntity<?> getTicket(
            @PathVariable Long ticketId) {

        try {

            SupportTicket ticket =
                    supportService.getTicket(ticketId);

            return ResponseEntity.ok(ticket);

        } catch (IllegalArgumentException e) {

            return ResponseEntity.badRequest()
                    .body(e.getMessage());

        } catch (Exception e) {

            return ResponseEntity.internalServerError()
                    .body("Unable to load support ticket");
        }
    }

    // =========================================================
    // GET CHAT MESSAGES
    // =========================================================

    @GetMapping("/tickets/{ticketId}/messages")
    public ResponseEntity<?> getMessages(
            @PathVariable Long ticketId) {

        try {

            List<SupportMessage> messages =
                    supportService.getMessages(ticketId);

            return ResponseEntity.ok(messages);

        } catch (IllegalArgumentException e) {

            return ResponseEntity.badRequest()
                    .body(e.getMessage());

        } catch (Exception e) {

            return ResponseEntity.internalServerError()
                    .body("Unable to load conversation");
        }
    }

    // =========================================================
    // SEND MESSAGE
    // =========================================================

    @PostMapping("/tickets/{ticketId}/messages")
    public ResponseEntity<?> sendMessage(
            @PathVariable Long ticketId,
            @RequestBody SendMessageRequest request) {

        try {

            SupportMessage message =
                    supportService.sendMessage(
                            ticketId,
                            request.getSenderType(),
                            request.getSenderId(),
                            request.getMessage()
                    );

            return ResponseEntity.ok(message);

        } catch (IllegalArgumentException e) {

            return ResponseEntity.badRequest()
                    .body(e.getMessage());

        } catch (Exception e) {

            return ResponseEntity.internalServerError()
                    .body("Unable to send message");
        }
    }

    // =========================================================
    // UPDATE STATUS
    // =========================================================

    @PutMapping("/tickets/{ticketId}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long ticketId,
            @RequestBody UpdateStatusRequest request) {

        try {

            SupportTicket ticket =
                    supportService.updateStatus(
                            ticketId,
                            request.getStatus()
                    );

            return ResponseEntity.ok(ticket);

        } catch (IllegalArgumentException e) {

            return ResponseEntity.badRequest()
                    .body(e.getMessage());

        } catch (Exception e) {

            return ResponseEntity.internalServerError()
                    .body("Unable to update ticket status");
        }
    }

    // =========================================================
    // RESOLVE TICKET
    // =========================================================

    @PutMapping("/tickets/{ticketId}/resolve")
    public ResponseEntity<?> resolveTicket(
            @PathVariable Long ticketId) {

        try {

            SupportTicket ticket =
                    supportService.resolveTicket(ticketId);

            return ResponseEntity.ok(ticket);

        } catch (IllegalArgumentException e) {

            return ResponseEntity.badRequest()
                    .body(e.getMessage());

        } catch (Exception e) {

            return ResponseEntity.internalServerError()
                    .body("Unable to resolve support ticket");
        }
    }

    // =========================================================
    // CREATE TICKET REQUEST
    // =========================================================

    public static class CreateTicketRequest {

        private String subject;
        private String category;
        private String priority;
        private String createdByType;
        private Long userId;
        private Long organizationId;
        private String initialMessage;

        public CreateTicketRequest() {
        }

        public String getSubject() {
            return subject;
        }

        public void setSubject(String subject) {
            this.subject = subject;
        }

        public String getCategory() {
            return category;
        }

        public void setCategory(String category) {
            this.category = category;
        }

        public String getPriority() {
            return priority;
        }

        public void setPriority(String priority) {
            this.priority = priority;
        }

        public String getCreatedByType() {
            return createdByType;
        }

        public void setCreatedByType(String createdByType) {
            this.createdByType = createdByType;
        }

        public Long getUserId() {
            return userId;
        }

        public void setUserId(Long userId) {
            this.userId = userId;
        }

        public Long getOrganizationId() {
            return organizationId;
        }

        public void setOrganizationId(Long organizationId) {
            this.organizationId = organizationId;
        }

        public String getInitialMessage() {
            return initialMessage;
        }

        public void setInitialMessage(String initialMessage) {
            this.initialMessage = initialMessage;
        }
    }

    // =========================================================
    // SEND MESSAGE REQUEST
    // =========================================================

    public static class SendMessageRequest {

        private String senderType;
        private Long senderId;
        private String message;

        public SendMessageRequest() {
        }

        public String getSenderType() {
            return senderType;
        }

        public void setSenderType(String senderType) {
            this.senderType = senderType;
        }

        public Long getSenderId() {
            return senderId;
        }

        public void setSenderId(Long senderId) {
            this.senderId = senderId;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }

    // =========================================================
    // UPDATE STATUS REQUEST
    // =========================================================

    public static class UpdateStatusRequest {

        private String status;

        public UpdateStatusRequest() {
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }
}
