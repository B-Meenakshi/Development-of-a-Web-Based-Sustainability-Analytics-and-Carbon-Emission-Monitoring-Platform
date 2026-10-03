package com.meena.carbon_backend.config;

import com.meena.carbon_backend.service.BadgeService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class BadgeDataInitializer {

    @Bean
    CommandLineRunner initializeBadges(BadgeService badgeService) {

        return args -> {

            System.out.println(
                    "========== INITIALIZING CARBONTRACK BADGES =========="
            );

            badgeService.initializeBadges();

            System.out.println(
                    "========== BADGES INITIALIZATION COMPLETED =========="
            );
        };
    }
}