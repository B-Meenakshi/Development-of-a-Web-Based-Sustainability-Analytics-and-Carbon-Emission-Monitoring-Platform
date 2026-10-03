package com.meena.carbon_backend.service;

import com.meena.carbon_backend.entity.Organization;
import com.meena.carbon_backend.entity.SupportMessage;
import com.meena.carbon_backend.entity.SupportTicket;
import com.meena.carbon_backend.entity.User;

import com.meena.carbon_backend.repository.OrganizationRepository;
import com.meena.carbon_backend.repository.SupportMessageRepository;
import com.meena.carbon_backend.repository.SupportTicketRepository;
import com.meena.carbon_backend.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SupportService {

    private final SupportTicketRepository ticketRepository;
    private final SupportMessageRepository messageRepository;
    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public SupportService(
            SupportTicketRepository ticketRepository,
            SupportMessageRepository messageRepository,
            UserRepository userRepository,
            OrganizationRepository organizationRepository,
            NotificationService notificationService,
            EmailService emailService) {

        this.ticketRepository = ticketRepository;
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.organizationRepository = organizationRepository;
        this.notificationService = notificationService;
        this.emailService = emailService;
    }


    // =========================================================
    // CREATE SUPPORT TICKET
    // =========================================================

    @Transactional
    public SupportTicket createTicket(
            String subject,
            String category,
            String priority,
            String createdByType,
            Long userId,
            Long organizationId,
            String initialMessage) {

        if (subject == null ||
                subject.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Subject is required"
            );
        }

        if (category == null ||
                category.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Category is required"
            );
        }

        if (createdByType == null ||
                createdByType.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Creator type is required"
            );
        }

        if (initialMessage == null ||
                initialMessage.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Message is required"
            );
        }


        String type =
                createdByType.trim().toUpperCase();


        if (!type.equals("USER") &&
                !type.equals("ORGANIZATION")) {

            throw new IllegalArgumentException(
                    "Creator type must be USER or ORGANIZATION"
            );
        }


        if (type.equals("USER") &&
                userId == null) {

            throw new IllegalArgumentException(
                    "User ID is required"
            );
        }


        if (type.equals("ORGANIZATION") &&
                organizationId == null) {

            throw new IllegalArgumentException(
                    "Organization ID is required"
            );
        }


        SupportTicket ticket =
                new SupportTicket();


        ticket.setSubject(
                subject.trim()
        );

        ticket.setCategory(
                category.trim()
        );


        if (priority == null ||
                priority.trim().isEmpty()) {

            ticket.setPriority("MEDIUM");

        } else {

            ticket.setPriority(
                    priority.trim().toUpperCase()
            );
        }


        ticket.setStatus("OPEN");

        ticket.setCreatedByType(type);


        if (type.equals("USER")) {

            ticket.setUserId(userId);
            ticket.setOrganizationId(null);

        } else {

            ticket.setOrganizationId(
                    organizationId
            );

            ticket.setUserId(null);
        }


        SupportTicket savedTicket =
                ticketRepository.save(ticket);


        // =====================================================
        // CREATE FIRST MESSAGE
        // =====================================================

        SupportMessage firstMessage =
                new SupportMessage();

        firstMessage.setTicketId(
                savedTicket.getId()
        );

        firstMessage.setSenderType(type);


        if (type.equals("USER")) {

            firstMessage.setSenderId(userId);

        } else {

            firstMessage.setSenderId(
                    organizationId
            );
        }


        firstMessage.setMessage(
                initialMessage.trim()
        );


        messageRepository.save(firstMessage);


        return savedTicket;
    }


    // =========================================================
    // USER TICKETS
    // =========================================================

    public List<SupportTicket> getUserTickets(
            Long userId) {

        if (userId == null) {

            throw new IllegalArgumentException(
                    "User ID is required"
            );
        }


        return ticketRepository
                .findByUserIdOrderByUpdatedAtDesc(
                        userId
                );
    }


    // =========================================================
    // ORGANIZATION TICKETS
    // =========================================================

    public List<SupportTicket> getOrganizationTickets(
            Long organizationId) {

        if (organizationId == null) {

            throw new IllegalArgumentException(
                    "Organization ID is required"
            );
        }


        return ticketRepository
                .findByOrganizationIdOrderByUpdatedAtDesc(
                        organizationId
                );
    }


    // =========================================================
    // ADMIN - ALL TICKETS
    // =========================================================

    public List<SupportTicket> getAllTickets() {

        return ticketRepository
                .findAllByOrderByUpdatedAtDesc();
    }


    // =========================================================
    // ADMIN - FILTER BY STATUS
    // =========================================================

    public List<SupportTicket> getTicketsByStatus(
            String status) {

        if (status == null ||
                status.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Status is required"
            );
        }


        return ticketRepository
                .findByStatusOrderByUpdatedAtDesc(
                        status.trim().toUpperCase()
                );
    }


    // =========================================================
    // GET SINGLE TICKET
    // =========================================================

    public SupportTicket getTicket(
            Long ticketId) {

        if (ticketId == null) {

            throw new IllegalArgumentException(
                    "Ticket ID is required"
            );
        }


        return ticketRepository
                .findById(ticketId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Support ticket not found"
                        )
                );
    }


    // =========================================================
    // GET CONVERSATION MESSAGES
    // =========================================================

    public List<SupportMessage> getMessages(
            Long ticketId) {

        if (ticketId == null) {

            throw new IllegalArgumentException(
                    "Ticket ID is required"
            );
        }


        // Make sure ticket exists
        getTicket(ticketId);


        return messageRepository
                .findByTicketIdOrderByCreatedAtAsc(
                        ticketId
                );
    }


    // =========================================================
    // SEND MESSAGE
    // =========================================================

    @Transactional
    public SupportMessage sendMessage(
            Long ticketId,
            String senderType,
            Long senderId,
            String message) {

        if (ticketId == null) {

            throw new IllegalArgumentException(
                    "Ticket ID is required"
            );
        }


        if (senderType == null ||
                senderType.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Sender type is required"
            );
        }


        if (senderId == null) {

            throw new IllegalArgumentException(
                    "Sender ID is required"
            );
        }


        if (message == null ||
                message.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Message cannot be empty"
            );
        }


        String type =
                senderType.trim().toUpperCase();


        if (!type.equals("USER") &&
                !type.equals("ORGANIZATION") &&
                !type.equals("ADMIN")) {

            throw new IllegalArgumentException(
                    "Invalid sender type"
            );
        }


        SupportTicket ticket =
                getTicket(ticketId);


        // =====================================================
        // CREATE MESSAGE
        // =====================================================

        SupportMessage supportMessage =
                new SupportMessage();

        supportMessage.setTicketId(
                ticketId
        );

        supportMessage.setSenderType(
                type
        );

        supportMessage.setSenderId(
                senderId
        );

        supportMessage.setMessage(
                message.trim()
        );


        SupportMessage savedMessage =
                messageRepository.save(
                        supportMessage
                );


        // =====================================================
        // REOPEN RESOLVED TICKET
        // =====================================================

        /*
         * If ANYONE sends a new message to a resolved ticket,
         * automatically reopen the ticket.
         *
         * USER:
         * Can continue the conversation after resolution.
         *
         * ORGANIZATION:
         * Can continue the conversation after resolution.
         *
         * ADMIN:
         * Can send a follow-up message after resolution.
         */

        if ("RESOLVED".equalsIgnoreCase(
                ticket.getStatus())) {

            ticket.setStatus("OPEN");

            ticket.setResolvedAt(null);
        }


        // =====================================================
        // UPDATE TICKET TIME
        // =====================================================

        ticket.setUpdatedAt(
                LocalDateTime.now()
        );

        ticketRepository.save(ticket);


        // =====================================================
        // ADMIN REPLY
        // =====================================================

        /*
         * When ADMIN sends a reply:
         *
         * 1. Find ticket owner email
         * 2. Create in-app notification
         * 3. Send email
         */

        if (type.equals("ADMIN")) {

            notifyTicketOwnerAboutAdminReply(
                    ticket,
                    message.trim()
            );
        }


        return savedMessage;
    }


    // =========================================================
    // ADMIN REPLY NOTIFICATION
    // =========================================================

    private void notifyTicketOwnerAboutAdminReply(
            SupportTicket ticket,
            String replyMessage) {

        if (ticket == null) {

            return;
        }


        String recipientEmail =
                getTicketOwnerEmail(ticket);


        if (recipientEmail == null ||
                recipientEmail.trim().isEmpty()) {

            System.err.println(
                    "Unable to send support notification: "
                    + "ticket owner email not found"
            );

            return;
        }


        // =====================================================
        // CREATE IN-APP NOTIFICATION
        // =====================================================

        notificationService.createSupportReplyNotification(
                recipientEmail,
                ticket.getId(),
                ticket.getSubject()
        );


        // =====================================================
        // SEND EMAIL
        // =====================================================

        emailService.sendSupportReplyEmail(
                recipientEmail,
                ticket.getSubject(),
                replyMessage
        );
    }


    // =========================================================
    // GET TICKET OWNER EMAIL
    // =========================================================

    private String getTicketOwnerEmail(
            SupportTicket ticket) {

        // -----------------------------------------------------
        // USER / EMPLOYEE TICKET
        // -----------------------------------------------------

        if (ticket.getUserId() != null) {

            User user =
                    userRepository
                            .findById(
                                    ticket.getUserId()
                            )
                            .orElse(null);


            if (user != null &&
                    user.getEmail() != null) {

                return user.getEmail().trim();
            }
        }


        // -----------------------------------------------------
        // ORGANIZATION TICKET
        // -----------------------------------------------------

        if (ticket.getOrganizationId() != null) {

            Organization organization =
                    organizationRepository
                            .findById(
                                    ticket.getOrganizationId()
                            )
                            .orElse(null);


            if (organization != null &&
                    organization.getEmail() != null) {

                return organization.getEmail().trim();
            }
        }


        return null;
    }


    // =========================================================
    // UPDATE STATUS
    // =========================================================

    @Transactional
    public SupportTicket updateStatus(
            Long ticketId,
            String status) {

        if (ticketId == null) {

            throw new IllegalArgumentException(
                    "Ticket ID is required"
            );
        }


        if (status == null ||
                status.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Status is required"
            );
        }


        String newStatus =
                status.trim().toUpperCase();


        if (!newStatus.equals("OPEN") &&
                !newStatus.equals("IN_PROGRESS") &&
                !newStatus.equals("RESOLVED")) {

            throw new IllegalArgumentException(
                    "Invalid support status"
            );
        }


        SupportTicket ticket =
                getTicket(ticketId);


        String previousStatus =
                ticket.getStatus();


        boolean wasAlreadyResolved =
                "RESOLVED".equalsIgnoreCase(
                        previousStatus
                );


        // =====================================================
        // UPDATE STATUS
        // =====================================================

        ticket.setStatus(newStatus);

        ticket.setUpdatedAt(
                LocalDateTime.now()
        );


        if (newStatus.equals("RESOLVED")) {

            ticket.setResolvedAt(
                    LocalDateTime.now()
            );

        } else {

            ticket.setResolvedAt(null);
        }


        SupportTicket savedTicket =
                ticketRepository.save(ticket);


        // =====================================================
        // RESOLUTION NOTIFICATION
        // =====================================================

        /*
         * Only send the resolution notification when the ticket
         * changes into RESOLVED for the first time.
         */

        if (newStatus.equals("RESOLVED") &&
                !wasAlreadyResolved) {

            notifyTicketOwnerAboutResolution(
                    savedTicket
            );
        }


        return savedTicket;
    }


    // =========================================================
    // RESOLVE TICKET
    // =========================================================

    @Transactional
    public SupportTicket resolveTicket(
            Long ticketId) {

        return updateStatus(
                ticketId,
                "RESOLVED"
        );
    }


    // =========================================================
    // RESOLUTION NOTIFICATION
    // =========================================================

    private void notifyTicketOwnerAboutResolution(
            SupportTicket ticket) {

        if (ticket == null) {

            return;
        }


        String recipientEmail =
                getTicketOwnerEmail(ticket);


        if (recipientEmail == null ||
                recipientEmail.trim().isEmpty()) {

            System.err.println(
                    "Unable to send resolution notification: "
                    + "ticket owner email not found"
            );

            return;
        }


        // =====================================================
        // CREATE IN-APP NOTIFICATION
        // =====================================================

        notificationService
                .createSupportResolvedNotification(
                        recipientEmail,
                        ticket.getId(),
                        ticket.getSubject()
                );


        // =====================================================
        // SEND RESOLUTION EMAIL
        // =====================================================

        emailService.sendSupportResolvedEmail(
                recipientEmail,
                ticket.getSubject()
        );
    }
}