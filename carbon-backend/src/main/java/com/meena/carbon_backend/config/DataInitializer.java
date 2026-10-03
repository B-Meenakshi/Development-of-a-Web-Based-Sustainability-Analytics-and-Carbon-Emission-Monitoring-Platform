
package com.meena.carbon_backend.config;

import com.meena.carbon_backend.entity.Role;
import com.meena.carbon_backend.entity.User;
import com.meena.carbon_backend.repository.UserRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner createAdmin(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        return args -> {

            String adminEmail = "admin@carbon.com";

            // Check whether admin already exists
            if (userRepository.findByEmail(adminEmail).isEmpty()) {

                User admin = new User();

                admin.setFullName("System Admin");
                admin.setEmail(adminEmail);

                // Password chosen by YOU,
                // but stored as BCrypt hash
                admin.setPassword(
                        passwordEncoder.encode("Admin@123")
                );

                admin.setRole(Role.ADMIN);

                userRepository.save(admin);

                System.out.println(
                        "======================================"
                );
                System.out.println(
                        "Admin account created successfully"
                );
                System.out.println(
                        "Email: admin@carbon.com"
                );
                System.out.println(
                        "======================================"
                );
            }
        };
    }
}
