package com.meena.carbon_backend.controller;

import com.meena.carbon_backend.entity.Organization;
import com.meena.carbon_backend.entity.Role;
import com.meena.carbon_backend.entity.User;
import com.meena.carbon_backend.repository.OrganizationRepository;
import com.meena.carbon_backend.repository.UserRepository;
import com.meena.carbon_backend.service.EmailService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public AuthController(
            UserRepository userRepository,
            OrganizationRepository organizationRepository,
            PasswordEncoder passwordEncoder,
            EmailService emailService) {

        this.userRepository = userRepository;
        this.organizationRepository = organizationRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }


    // =========================================================
    // NORMAL USER REGISTRATION
    // =========================================================

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody User user) {

        if (user.getEmail() == null ||
                user.getEmail().trim().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body("Email is required");
        }


        if (user.getPassword() == null ||
                user.getPassword().trim().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body("Password is required");
        }


        String email =
                user.getEmail().trim();


        if (userRepository.existsByEmail(email)) {

            return ResponseEntity
                    .badRequest()
                    .body("Email already registered");
        }


        if (organizationRepository.existsByEmail(email)) {

            return ResponseEntity
                    .badRequest()
                    .body("Email already registered");
        }


        user.setEmail(email);

        user.setPassword(
                passwordEncoder.encode(
                        user.getPassword()
                )
        );

        user.setRole(Role.USER);

        user.setOrganization(null);

        /*
         * Normal users do not need a forced password change.
         */
        user.setMustChangePassword(false);


        // =====================================================
        // SAVE USER
        // =====================================================

        User savedUser =
                userRepository.save(user);


        // =====================================================
        // SEND WELCOME EMAIL
        // =====================================================

        emailService.sendUserWelcomeEmail(
                savedUser.getFullName(),
                savedUser.getEmail()
        );


        // =====================================================
        // NEVER RETURN PASSWORD
        // =====================================================

        savedUser.setPassword(null);


        return ResponseEntity.ok(savedUser);
    }


    // =========================================================
    // LOGIN
    // =========================================================

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody User loginUser) {

        if (loginUser.getEmail() == null ||
                loginUser.getEmail().trim().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body("Email is required");
        }


        if (loginUser.getPassword() == null ||
                loginUser.getPassword().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body("Password is required");
        }


        String email =
                loginUser.getEmail().trim();


        // =====================================================
        // CHECK USER / EMPLOYEE ACCOUNT
        // =====================================================

        User user =
                userRepository
                        .findByEmail(email)
                        .orElse(null);


        if (user != null) {

            boolean passwordCorrect =
                    passwordEncoder.matches(
                            loginUser.getPassword(),
                            user.getPassword()
                    );


            if (!passwordCorrect) {

                return ResponseEntity
                        .badRequest()
                        .body("Incorrect password");
            }


            /*
             * IMPORTANT:
             *
             * Store mustChangePassword before removing
             * the password.
             */


            /*
             * Do not return the actual password.
             */
            user.setPassword(null);


            /*
             * Return the employee/user object.
             *
             * Jackson will automatically include:
             *
             * "mustChangePassword": true
             */
            return ResponseEntity.ok(user);
        }


        // =====================================================
        // CHECK ORGANIZATION ACCOUNT
        // =====================================================

        Organization organization =
                organizationRepository
                        .findByEmail(email)
                        .orElse(null);


        if (organization != null) {

            boolean passwordCorrect =
                    passwordEncoder.matches(
                            loginUser.getPassword(),
                            organization.getPassword()
                    );


            if (!passwordCorrect) {

                return ResponseEntity
                        .badRequest()
                        .body("Incorrect password");
            }


            OrganizationLoginResponse response =
                    new OrganizationLoginResponse();


            response.setId(
                    organization.getId()
            );

            response.setName(
                    organization.getName()
            );

            response.setEmail(
                    organization.getEmail()
            );

            response.setRole(
                    Role.ORGANIZATION
            );


            return ResponseEntity.ok(response);
        }


        // =====================================================
        // EMAIL NOT FOUND
        // =====================================================

        return ResponseEntity
                .badRequest()
                .body("Email not found");
    }


    // =========================================================
    // FIRST LOGIN PASSWORD CHANGE
    // =========================================================

    @PutMapping("/first-login-password")
    public ResponseEntity<?> firstLoginPassword(
            @RequestBody FirstLoginPasswordRequest request) {


        // -----------------------------------------------------
        // Validate email
        // -----------------------------------------------------

        if (request.getEmail() == null ||
                request.getEmail().trim().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body("Email is required");
        }


        // -----------------------------------------------------
        // Validate current password
        // -----------------------------------------------------

        if (request.getCurrentPassword() == null ||
                request.getCurrentPassword().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body("Initial password is required");
        }


        // -----------------------------------------------------
        // Validate new password
        // -----------------------------------------------------

        if (request.getNewPassword() == null ||
                request.getNewPassword().trim().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body("New password is required");
        }


        if (request.getNewPassword().length() < 6) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "New password must be at least 6 characters"
                    );
        }


        // -----------------------------------------------------
        // Validate confirm password
        // -----------------------------------------------------

        if (request.getConfirmPassword() == null ||
                request.getConfirmPassword().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body("Please confirm your new password");
        }


        if (!request.getNewPassword().equals(
                request.getConfirmPassword())) {

            return ResponseEntity
                    .badRequest()
                    .body("New passwords do not match");
        }


        String email =
                request.getEmail().trim();


        // -----------------------------------------------------
        // Find user
        // -----------------------------------------------------

        User user =
                userRepository
                        .findByEmail(email)
                        .orElse(null);


        if (user == null) {

            return ResponseEntity
                    .badRequest()
                    .body("User not found");
        }


        // -----------------------------------------------------
        // Check that this is actually a first-login user
        // -----------------------------------------------------

        if (!user.isMustChangePassword()) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "First login password change is not required"
                    );
        }


        // -----------------------------------------------------
        // Verify initial password
        // -----------------------------------------------------

        boolean currentPasswordCorrect =
                passwordEncoder.matches(
                        request.getCurrentPassword(),
                        user.getPassword()
                );


        if (!currentPasswordCorrect) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "Initial password is incorrect"
                    );
        }


        // -----------------------------------------------------
        // Make sure new password is different
        // -----------------------------------------------------

        if (passwordEncoder.matches(
                request.getNewPassword(),
                user.getPassword())) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "New password must be different from initial password"
                    );
        }


        // -----------------------------------------------------
        // Save new password
        // -----------------------------------------------------

        user.setPassword(
                passwordEncoder.encode(
                        request.getNewPassword()
                )
        );


        // IMPORTANT
        // Employee has successfully changed the initial password.
        user.setMustChangePassword(false);


        User savedUser =
                userRepository.save(user);


        // -----------------------------------------------------
        // Never return password
        // -----------------------------------------------------

        savedUser.setPassword(null);


        return ResponseEntity.ok(savedUser);
    }


    // =========================================================
    // NORMAL CHANGE PASSWORD
    // =========================================================

    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestBody ChangePasswordRequest request) {


        if (request.getEmail() == null ||
                request.getEmail().trim().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body("Email is required");
        }


        if (request.getCurrentPassword() == null ||
                request.getCurrentPassword().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body("Current password is required");
        }


        if (request.getNewPassword() == null ||
                request.getNewPassword().trim().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body("New password cannot be empty");
        }


        if (request.getNewPassword().length() < 6) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "New password must be at least 6 characters"
                    );
        }


        User user =
                userRepository
                        .findByEmail(
                                request.getEmail().trim()
                        )
                        .orElse(null);


        if (user == null) {

            return ResponseEntity
                    .badRequest()
                    .body("User not found");
        }


        boolean currentPasswordCorrect =
                passwordEncoder.matches(
                        request.getCurrentPassword(),
                        user.getPassword()
                );


        if (!currentPasswordCorrect) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "Current password is incorrect"
                    );
        }


        if (passwordEncoder.matches(
                request.getNewPassword(),
                user.getPassword())) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "New password must be different from current password"
                    );
        }


        user.setPassword(
                passwordEncoder.encode(
                        request.getNewPassword()
                )
        );


        /*
         * This also handles an employee who somehow
         * changes the password through the normal
         * profile password-change functionality.
         */
        user.setMustChangePassword(false);


        User savedUser =
                userRepository.save(user);


        savedUser.setPassword(null);


        return ResponseEntity.ok(
                savedUser
        );
    }


    // =========================================================
    // ORGANIZATION LOGIN RESPONSE
    // =========================================================

    public static class OrganizationLoginResponse {

        private Long id;

        private String name;

        private String email;

        private Role role;


        public OrganizationLoginResponse() {
        }


        public Long getId() {

            return id;
        }

        public void setId(Long id) {

            this.id = id;
        }


        public String getName() {

            return name;
        }

        public void setName(String name) {

            this.name = name;
        }


        public String getEmail() {

            return email;
        }

        public void setEmail(String email) {

            this.email = email;
        }


        public Role getRole() {

            return role;
        }

        public void setRole(Role role) {

            this.role = role;
        }
    }


    // =========================================================
    // FIRST LOGIN PASSWORD REQUEST
    // =========================================================

    public static class FirstLoginPasswordRequest {

        private String email;

        private String currentPassword;

        private String newPassword;

        private String confirmPassword;


        public FirstLoginPasswordRequest() {
        }


        public String getEmail() {

            return email;
        }

        public void setEmail(
                String email) {

            this.email = email;
        }


        public String getCurrentPassword() {

            return currentPassword;
        }

        public void setCurrentPassword(
                String currentPassword) {

            this.currentPassword =
                    currentPassword;
        }


        public String getNewPassword() {

            return newPassword;
        }

        public void setNewPassword(
                String newPassword) {

            this.newPassword =
                    newPassword;
        }


        public String getConfirmPassword() {

            return confirmPassword;
        }

        public void setConfirmPassword(
                String confirmPassword) {

            this.confirmPassword =
                    confirmPassword;
        }
    }


    // =========================================================
    // NORMAL CHANGE PASSWORD REQUEST
    // =========================================================

    public static class ChangePasswordRequest {

        private String email;

        private String currentPassword;

        private String newPassword;


        public ChangePasswordRequest() {
        }


        public String getEmail() {

            return email;
        }

        public void setEmail(
                String email) {

            this.email = email;
        }


        public String getCurrentPassword() {

            return currentPassword;
        }

        public void setCurrentPassword(
                String currentPassword) {

            this.currentPassword =
                    currentPassword;
        }


        public String getNewPassword() {

            return newPassword;
        }

        public void setNewPassword(
                String newPassword) {

            this.newPassword =
                    newPassword;
        }
    }
}