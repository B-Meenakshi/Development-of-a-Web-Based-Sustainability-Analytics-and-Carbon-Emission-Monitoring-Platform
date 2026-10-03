
package com.meena.carbon_backend.controller;

import com.meena.carbon_backend.entity.Role;
import com.meena.carbon_backend.entity.User;
import com.meena.carbon_backend.repository.ActivityRepository;
import com.meena.carbon_backend.repository.UserBadgeRepository;
import com.meena.carbon_backend.repository.UserRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    private final UserRepository userRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final ActivityRepository activityRepository;

    public AdminController(
            UserRepository userRepository,
            UserBadgeRepository userBadgeRepository,
            ActivityRepository activityRepository) {

        this.userRepository = userRepository;
        this.userBadgeRepository = userBadgeRepository;
        this.activityRepository = activityRepository;
    }

    // =========================================================
    // GET ALL USERS
    // GET /api/admin/users
    // =========================================================

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {

        List<User> users = userRepository.findAll();

        List<Map<String, Object>> response = new ArrayList<>();

        for (User user : users) {
            response.add(convertUserToResponse(user));
        }

        return ResponseEntity.ok(response);
    }

    // =========================================================
    // GET USER BY ID
    // GET /api/admin/users/{id}
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(
            @PathVariable Long id) {

        return userRepository.findById(id)
                .map(user ->
                        ResponseEntity.ok(
                                convertUserToResponse(user)
                        )
                )
                .orElseGet(() ->
                        ResponseEntity.notFound().build()
                );
    }

    // =========================================================
    // ADD USER
    // POST /api/admin/users
    // =========================================================

    @PostMapping
    public ResponseEntity<?> addUser(
            @RequestBody User user) {

        try {

            // Validate email
            if (user.getEmail() == null ||
                    user.getEmail().trim().isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body("Email is required");
            }

            // Validate name
            if (user.getFullName() == null ||
                    user.getFullName().trim().isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body("Full name is required");
            }

            // Validate password
            if (user.getPassword() == null ||
                    user.getPassword().trim().isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body("Password is required");
            }

            // Check duplicate email
            if (userRepository.existsByEmail(
                    user.getEmail().trim())) {

                return ResponseEntity
                        .badRequest()
                        .body("Email already exists");
            }

            // Clean values
            user.setFullName(
                    user.getFullName().trim()
            );

            user.setEmail(
                    user.getEmail().trim()
            );

            // Default role
            if (user.getRole() == null) {
                user.setRole(Role.USER);
            }

            User savedUser =
                    userRepository.save(user);

            return ResponseEntity.ok(
                    convertUserToResponse(savedUser)
            );

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "Unable to add user: "
                                    + e.getMessage()
                    );
        }
    }

    // =========================================================
    // UPDATE USER
    // PUT /api/admin/users/{id}
    // =========================================================

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(
            @PathVariable Long id,
            @RequestBody User updatedUser) {

        try {

            User existingUser =
                    userRepository.findById(id)
                            .orElse(null);

            if (existingUser == null) {

                return ResponseEntity
                        .notFound()
                        .build();
            }

            // Validate email
            if (updatedUser.getEmail() == null ||
                    updatedUser.getEmail().trim().isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body("Email is required");
            }

            // Check duplicate email
            User userWithEmail =
                    userRepository.findByEmail(
                            updatedUser.getEmail().trim()
                    ).orElse(null);

            if (userWithEmail != null &&
                    !userWithEmail.getId().equals(id)) {

                return ResponseEntity
                        .badRequest()
                        .body("Email already exists");
            }

            // Update name
            if (updatedUser.getFullName() != null &&
                    !updatedUser.getFullName()
                            .trim()
                            .isEmpty()) {

                existingUser.setFullName(
                        updatedUser.getFullName().trim()
                );
            }

            // Update email
            existingUser.setEmail(
                    updatedUser.getEmail().trim()
            );

            // Update role
            if (updatedUser.getRole() != null) {

                existingUser.setRole(
                        updatedUser.getRole()
                );
            }

            // Update password only if provided
            if (updatedUser.getPassword() != null &&
                    !updatedUser.getPassword()
                            .trim()
                            .isEmpty()) {

                existingUser.setPassword(
                        updatedUser.getPassword()
                );
            }

            User savedUser =
                    userRepository.save(existingUser);

            return ResponseEntity.ok(
                    convertUserToResponse(savedUser)
            );

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "Unable to update user: "
                                    + e.getMessage()
                    );
        }
    }

    // =========================================================
    // DELETE USER
    // DELETE /api/admin/users/{id}
    // =========================================================

    @Transactional
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(
            @PathVariable Long id) {

        try {

            // -----------------------------------------
            // Find user
            // -----------------------------------------

            User user = userRepository.findById(id)
                    .orElse(null);

            if (user == null) {

                return ResponseEntity
                        .notFound()
                        .build();
            }

            // -----------------------------------------
            // Store email before deleting user
            // -----------------------------------------

            String userEmail = user.getEmail();

            // -----------------------------------------
            // Delete user's activities
            // IMPORTANT:
            // Activity stores email as String, so JPA
            // cannot automatically delete activities.
            // -----------------------------------------

            activityRepository.deleteByUserEmail(userEmail);

            // -----------------------------------------
            // Delete user's badges
            // -----------------------------------------

            userBadgeRepository.deleteByUser(user);

            // -----------------------------------------
            // Delete user
            // -----------------------------------------

            userRepository.delete(user);

            return ResponseEntity.ok(
                    "User and all associated activities "
                            + "were deleted successfully"
            );

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "Unable to delete user: "
                                    + e.getMessage()
                    );
        }
    }

    // =========================================================
    // CONVERT USER TO SAFE RESPONSE
    // Password is NEVER returned
    // =========================================================

    private Map<String, Object> convertUserToResponse(
            User user) {

        Map<String, Object> userData =
                new HashMap<>();

        userData.put(
                "id",
                user.getId()
        );

        userData.put(
                "fullName",
                user.getFullName()
        );

        userData.put(
                "email",
                user.getEmail()
        );

        userData.put(
                "role",
                user.getRole() == null
                        ? "USER"
                        : user.getRole().name()
        );

        return userData;
    }
}
