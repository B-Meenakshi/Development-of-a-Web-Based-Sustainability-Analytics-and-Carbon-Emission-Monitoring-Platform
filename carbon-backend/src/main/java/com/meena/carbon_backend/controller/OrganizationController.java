package com.meena.carbon_backend.controller;

import com.meena.carbon_backend.entity.Organization;
import com.meena.carbon_backend.repository.OrganizationRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/organization")
@CrossOrigin(origins = "http://localhost:5173")
public class OrganizationController {

    private final OrganizationRepository organizationRepository;
    private final PasswordEncoder passwordEncoder;

    public OrganizationController(
            OrganizationRepository organizationRepository,
            PasswordEncoder passwordEncoder) {

        this.organizationRepository = organizationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // =====================================================
    // ORGANIZATION REGISTRATION
    // =====================================================

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody Organization organization) {

        // Check if email already exists
        if (organization.getEmail() == null ||
                organization.getEmail().trim().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body("Organization email is required");
        }

        if (organizationRepository.existsByEmail(
                organization.getEmail())) {

            return ResponseEntity
                    .badRequest()
                    .body("Organization email already registered");
        }

        // Check organization name
        if (organization.getName() == null ||
                organization.getName().trim().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body("Organization name is required");
        }

        // Check password
        if (organization.getPassword() == null ||
                organization.getPassword().trim().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body("Password is required");
        }

        // Encrypt password
        organization.setPassword(
                passwordEncoder.encode(
                        organization.getPassword()
                )
        );

        // Save organization
        Organization savedOrganization =
                organizationRepository.save(organization);

        // Do not return encrypted password
        savedOrganization.setPassword(null);

        return ResponseEntity.ok(savedOrganization);
    }
}