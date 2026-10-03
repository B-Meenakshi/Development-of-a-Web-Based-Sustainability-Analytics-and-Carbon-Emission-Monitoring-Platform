package com.meena.carbon_backend.service;

import com.meena.carbon_backend.entity.Badge;
import com.meena.carbon_backend.entity.User;
import com.meena.carbon_backend.entity.UserBadge;
import com.meena.carbon_backend.repository.BadgeRepository;
import com.meena.carbon_backend.repository.UserBadgeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BadgeService {

    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;

    public BadgeService(
            BadgeRepository badgeRepository,
            UserBadgeRepository userBadgeRepository) {

        this.badgeRepository = badgeRepository;
        this.userBadgeRepository = userBadgeRepository;
    }

    /**
     * Creates a badge if it does not already exist.
     */
    public Badge createBadgeIfNotExists(
            String code,
            String name,
            String description,
            String icon) {

        return badgeRepository.findByCode(code)
                .orElseGet(() ->
                        badgeRepository.save(
                                new Badge(
                                        code,
                                        name,
                                        description,
                                        icon
                                )
                        )
                );
    }

    /**
     * Awards a badge to a user.
     *
     * The same badge cannot be awarded twice
     * because UserBadge has a unique constraint.
     */
    @Transactional
    public boolean awardBadge(User user, String badgeCode) {

        if (user == null || badgeCode == null) {
            return false;
        }

        Badge badge = badgeRepository
                .findByCode(badgeCode)
                .orElse(null);

        if (badge == null) {
            return false;
        }

        boolean alreadyEarned =
                userBadgeRepository.existsByUserAndBadge(user, badge);

        if (alreadyEarned) {
            return false;
        }

        UserBadge userBadge =
                new UserBadge(user, badge);

        userBadgeRepository.save(userBadge);

        return true;
    }

    /**
     * Returns all badges earned by a user.
     */
    public List<UserBadge> getUserBadges(User user) {

        return userBadgeRepository
                .findByUserOrderByIdDesc(user);
    }

    /**
     * Creates all CarbonTrack badges.
     */
    @Transactional
    public void initializeBadges() {

        createBadgeIfNotExists(
                "FIRST_ACTIVITY",
                "First Step",
                "Logged your first carbon footprint activity.",
                "🌱"
        );

        createBadgeIfNotExists(
                "STREAK_7_DAYS",
                "7-Day Streak",
                "Logged activities on 7 consecutive days.",
                "🔥"
        );

        createBadgeIfNotExists(
                "GOAL_ACHIEVER",
                "Goal Achiever",
                "Completed your first sustainability goal.",
                "🎯"
        );

        createBadgeIfNotExists(
                "REDUCTION_10",
                "Carbon Reducer",
                "Reduced your carbon footprint by 10 kg CO₂e.",
                "🌿"
        );

        createBadgeIfNotExists(
                "REDUCTION_25",
                "Carbon Champion",
                "Reduced your carbon footprint by 25 kg CO₂e.",
                "🌳"
        );

        createBadgeIfNotExists(
                "REDUCTION_50",
                "Carbon Hero",
                "Reduced your carbon footprint by 50 kg CO₂e.",
                "🏆"
        );
    }
}