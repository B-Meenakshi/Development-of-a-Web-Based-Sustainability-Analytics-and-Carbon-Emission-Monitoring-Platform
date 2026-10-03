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

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/organization/employees")
@CrossOrigin(origins = "http://localhost:5173")
public class OrganizationEmployeeController {

    private final UserRepository userRepository;

    private final OrganizationRepository organizationRepository;

    private final PasswordEncoder passwordEncoder;

    private final EmailService emailService;


    public OrganizationEmployeeController(
            UserRepository userRepository,
            OrganizationRepository organizationRepository,
            PasswordEncoder passwordEncoder,
            EmailService emailService) {

        this.userRepository = userRepository;

        this.organizationRepository =
                organizationRepository;

        this.passwordEncoder =
                passwordEncoder;

        this.emailService =
                emailService;
    }


    // =========================================================
    // GET ALL EMPLOYEES
    // =========================================================

    @GetMapping("/{organizationId}")
    public ResponseEntity<?> getEmployees(
            @PathVariable Long organizationId) {

        Organization organization =
                organizationRepository
                        .findById(organizationId)
                        .orElse(null);

        if (organization == null) {

            return ResponseEntity
                    .badRequest()
                    .body("Organization not found");
        }


        List<User> employees =
                userRepository
                        .findByOrganizationIdAndRole(
                                organizationId,
                                Role.USER
                        );


        // Never return passwords
        employees.forEach(employee ->
                employee.setPassword(null)
        );


        return ResponseEntity.ok(
                employees
        );
    }


    // =========================================================
    // ADD EMPLOYEE
    // =========================================================

    @PostMapping("/add")
    public ResponseEntity<?> addEmployee(
            @RequestBody AddEmployeeRequest request) {

        // -----------------------------------------------------
        // Validate organization ID
        // -----------------------------------------------------

        if (request.getOrganizationId() == null) {

            return ResponseEntity
                    .badRequest()
                    .body("Organization ID is required");
        }


        // -----------------------------------------------------
        // Find organization
        // -----------------------------------------------------

        Organization organization =
                organizationRepository
                        .findById(
                                request.getOrganizationId()
                        )
                        .orElse(null);

        if (organization == null) {

            return ResponseEntity
                    .badRequest()
                    .body("Organization not found");
        }


        // -----------------------------------------------------
        // Validate name
        // -----------------------------------------------------

        if (request.getFullName() == null ||
                request.getFullName().trim().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body("Employee name is required");
        }


        // -----------------------------------------------------
        // Validate email
        // -----------------------------------------------------

        if (request.getEmail() == null ||
                request.getEmail().trim().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body("Employee email is required");
        }


        // -----------------------------------------------------
        // Validate password
        // -----------------------------------------------------

        if (request.getPassword() == null ||
                request.getPassword().trim().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body("Initial password is required");
        }


        String email =
                request.getEmail().trim();


        // -----------------------------------------------------
        // Check existing USER
        // -----------------------------------------------------

        if (userRepository.existsByEmail(email)) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "An account with this email already exists"
                    );
        }


        // -----------------------------------------------------
        // Check existing ORGANIZATION
        // -----------------------------------------------------

        if (organizationRepository.existsByEmail(email)) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "This email is already registered as an organization account"
                    );
        }


        // -----------------------------------------------------
        // Create employee
        // -----------------------------------------------------

        User employee =
                new User();


        employee.setFullName(
                request.getFullName().trim()
        );


        employee.setEmail(
                email
        );


        employee.setPassword(
                passwordEncoder.encode(
                        request.getPassword()
                )
        );


        employee.setRole(
                Role.USER
        );


        employee.setOrganization(
                organization
        );


        employee.setMustChangePassword(
                true
        );


        // -----------------------------------------------------
        // Save employee
        // -----------------------------------------------------

        User savedEmployee =
                userRepository.save(
                        employee
                );


        // -----------------------------------------------------
        // Send welcome email
        // -----------------------------------------------------

        emailService.sendEmployeeWelcomeEmail(
                savedEmployee.getFullName(),
                savedEmployee.getEmail(),
                request.getPassword(),
                organization.getName()
        );


        // -----------------------------------------------------
        // Hide password
        // -----------------------------------------------------

        savedEmployee.setPassword(null);


        return ResponseEntity.ok(
                savedEmployee
        );
    }


    // =========================================================
    // EDIT EMPLOYEE
    // =========================================================

    @PutMapping("/{employeeId}")
    public ResponseEntity<?> updateEmployee(
            @PathVariable Long employeeId,
            @RequestBody UpdateEmployeeRequest request) {

        // -----------------------------------------------------
        // Validate organization ID
        // -----------------------------------------------------

        if (request.getOrganizationId() == null) {

            return ResponseEntity
                    .badRequest()
                    .body("Organization ID is required");
        }


        // -----------------------------------------------------
        // Validate name
        // -----------------------------------------------------

        if (request.getFullName() == null ||
                request.getFullName().trim().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body("Employee name is required");
        }


        // -----------------------------------------------------
        // Validate email
        // -----------------------------------------------------

        if (request.getEmail() == null ||
                request.getEmail().trim().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body("Employee email is required");
        }


        String email =
                request.getEmail().trim();


        // -----------------------------------------------------
        // Find employee belonging to this organization
        // -----------------------------------------------------

        User employee =
                userRepository
                        .findByIdAndOrganizationIdAndRole(
                                employeeId,
                                request.getOrganizationId(),
                                Role.USER
                        )
                        .orElse(null);


        if (employee == null) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "Employee not found or does not belong to this organization"
                    );
        }


        // -----------------------------------------------------
        // Check whether new email belongs to another account
        // -----------------------------------------------------

        Optional<User> existingUser =
                userRepository.findByEmail(email);


        if (existingUser.isPresent() &&
                !existingUser.get().getId().equals(employeeId)) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "An account with this email already exists"
                    );
        }


        // -----------------------------------------------------
        // Check organization email conflict
        // -----------------------------------------------------

        Optional<Organization> existingOrganization =
                organizationRepository.findByEmail(email);


        if (existingOrganization.isPresent()) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "This email is already registered as an organization account"
                    );
        }


        // -----------------------------------------------------
        // Update employee
        // -----------------------------------------------------

        employee.setFullName(
                request.getFullName().trim()
        );

        employee.setEmail(
                email
        );


        User updatedEmployee =
                userRepository.save(
                        employee
                );


        // -----------------------------------------------------
        // Hide password
        // -----------------------------------------------------

        updatedEmployee.setPassword(null);


        return ResponseEntity.ok(
                updatedEmployee
        );
    }


    // =========================================================
    // DELETE EMPLOYEE
    // =========================================================

    @DeleteMapping("/{employeeId}/{organizationId}")
    public ResponseEntity<?> deleteEmployee(
            @PathVariable Long employeeId,
            @PathVariable Long organizationId) {

        // -----------------------------------------------------
        // Find employee belonging to organization
        // -----------------------------------------------------

        User employee =
                userRepository
                        .findByIdAndOrganizationIdAndRole(
                                employeeId,
                                organizationId,
                                Role.USER
                        )
                        .orElse(null);


        if (employee == null) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "Employee not found or does not belong to this organization"
                    );
        }


        // -----------------------------------------------------
        // Delete employee
        // -----------------------------------------------------

        userRepository.delete(
                employee
        );


        return ResponseEntity.ok(
                "Employee deleted successfully"
        );
    }


    // =========================================================
    // ADD EMPLOYEE REQUEST
    // =========================================================

    public static class AddEmployeeRequest {

        private Long organizationId;

        private String fullName;

        private String email;

        private String password;


        public AddEmployeeRequest() {
        }


        public Long getOrganizationId() {

            return organizationId;
        }


        public void setOrganizationId(
                Long organizationId) {

            this.organizationId =
                    organizationId;
        }


        public String getFullName() {

            return fullName;
        }


        public void setFullName(
                String fullName) {

            this.fullName =
                    fullName;
        }


        public String getEmail() {

            return email;
        }


        public void setEmail(
                String email) {

            this.email =
                    email;
        }


        public String getPassword() {

            return password;
        }


        public void setPassword(
                String password) {

            this.password =
                    password;
        }
    }


    // =========================================================
    // UPDATE EMPLOYEE REQUEST
    // =========================================================

    public static class UpdateEmployeeRequest {

        private Long organizationId;

        private String fullName;

        private String email;


        public UpdateEmployeeRequest() {
        }


        public Long getOrganizationId() {

            return organizationId;
        }


        public void setOrganizationId(
                Long organizationId) {

            this.organizationId =
                    organizationId;
        }


        public String getFullName() {

            return fullName;
        }


        public void setFullName(
                String fullName) {

            this.fullName =
                    fullName;
        }


        public String getEmail() {

            return email;
        }


        public void setEmail(
                String email) {

            this.email =
                    email;
        }
    }
}