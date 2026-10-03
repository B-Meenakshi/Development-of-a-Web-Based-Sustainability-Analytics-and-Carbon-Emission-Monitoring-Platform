package com.meena.carbon_backend.repository;

import com.meena.carbon_backend.entity.User;
import com.meena.carbon_backend.entity.UserBadge;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserBadgeRepository extends JpaRepository<UserBadge, Long> {

    List<UserBadge> findByUserOrderByIdDesc(User user);

    boolean existsByUserAndBadge(
            User user,
            com.meena.carbon_backend.entity.Badge badge
    );

    void deleteByUser(User user);
}