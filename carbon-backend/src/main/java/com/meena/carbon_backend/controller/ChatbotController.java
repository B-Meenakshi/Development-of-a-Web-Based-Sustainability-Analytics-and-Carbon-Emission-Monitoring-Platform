package com.meena.carbon_backend.controller;

import com.meena.carbon_backend.entity.Organization;
import com.meena.carbon_backend.entity.Role;
import com.meena.carbon_backend.entity.User;
import com.meena.carbon_backend.repository.OrganizationRepository;
import com.meena.carbon_backend.repository.UserRepository;
import com.meena.carbon_backend.service.ChatbotService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/chatbot")
@CrossOrigin(origins = "http://localhost:5173")
public class ChatbotController {

    private final ChatbotService chatbotService;
    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;

    public ChatbotController(
            ChatbotService chatbotService,
            UserRepository userRepository,
            OrganizationRepository organizationRepository
    ) {
        this.chatbotService = chatbotService;
        this.userRepository = userRepository;
        this.organizationRepository = organizationRepository;
    }

    // =========================================================
    // TEST GEMINI
    // =========================================================

    @GetMapping("/test")
    public ResponseEntity<?> test() {

        String response = chatbotService.chat(
                "Introduce yourself as the CarbonTrack AI assistant."
        );

        return ResponseEntity.ok(
                Map.of(
                        "response",
                        response
                )
        );
    }

    // =========================================================
    // CHAT
    // =========================================================

    @PostMapping
    public ResponseEntity<?> chat(
            @RequestBody Map<String, String> request
    ) {

        String message = request.get("message");
        String email = request.get("email");

        // =====================================================
        // VALIDATE MESSAGE
        // =====================================================

        if (message == null || message.trim().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "error",
                                    "Message is required."
                            )
                    );
        }

        message = message.trim();

        // =====================================================
        // LANDING / VISITOR
        //
        // No email means:
        // - Landing page
        // - Visitor
        //
        // IMPORTANT:
        // Never load private database information here.
        // =====================================================

        if (email == null || email.trim().isEmpty()) {

            String response = chatbotService.chat(message);

            return ResponseEntity.ok(
                    Map.of(
                            "response",
                            response,
                            "role",
                            "VISITOR"
                    )
            );
        }

        email = email.trim();

        // =====================================================
        // FIRST: CHECK NORMAL USER / ADMIN
        // =====================================================

        User user = userRepository
                .findByEmail(email)
                .orElse(null);

        if (user != null && user.getRole() != null) {

            Role role = user.getRole();

            // =================================================
            // ADMIN
            // =================================================

            if (role == Role.ADMIN) {

                String response =
                        chatbotService.chat(
                                message,
                                email
                        );

                return ResponseEntity.ok(
                        Map.of(
                                "response",
                                response,
                                "role",
                                Role.ADMIN.name()
                        )
                );
            }

            // =================================================
            // NORMAL USER
            // =================================================

            if (role == Role.USER) {

                String response =
                        chatbotService.chat(
                                message,
                                email
                        );

                return ResponseEntity.ok(
                        Map.of(
                                "response",
                                response,
                                "role",
                                Role.USER.name()
                        )
                );

            }

            // =================================================
            // IF ORGANIZATION ROLE IS ALSO STORED IN USER TABLE
            // =================================================

            if (role == Role.ORGANIZATION) {

                Organization organization =
                        organizationRepository
                                .findByEmail(email)
                                .orElse(null);

                if (organization == null) {

                    return ResponseEntity.ok(
                            Map.of(
                                    "response",
                                    "I could not identify your organization account. Please log in again.",
                                    "role",
                                    Role.ORGANIZATION.name()
                            )
                    );
                }

                String response =
                        chatbotService.organizationChat(
                                message,
                                organization
                        );

                return ResponseEntity.ok(
                        Map.of(
                                "response",
                                response,
                                "role",
                                Role.ORGANIZATION.name()
                        )
                );
            }
        }

        // =====================================================
        // ORGANIZATION ACCOUNT
        //
        // Your organization accounts may exist in the
        // organizations table instead of users table.
        // =====================================================

        Organization organization =
                organizationRepository
                        .findByEmail(email)
                        .orElse(null);

        if (organization != null) {

            String response =
                    chatbotService.organizationChat(
                            message,
                            organization
                    );

            return ResponseEntity.ok(
                    Map.of(
                            "response",
                            response,
                            "role",
                            Role.ORGANIZATION.name()
                    )
            );
        }

        // =====================================================
        // UNKNOWN ACCOUNT
        //
        // IMPORTANT:
        // Do NOT fall back to private user/admin/org data.
        // =====================================================

        String response =
                chatbotService.chat(message);

        return ResponseEntity.ok(
                Map.of(
                        "response",
                        response,
                        "role",
                        "VISITOR"
                )
        );
    }
}