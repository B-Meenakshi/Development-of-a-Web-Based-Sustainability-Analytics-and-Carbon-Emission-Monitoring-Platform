package com.meena.carbon_backend.repository;

import com.meena.carbon_backend.entity.Goal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GoalRepository extends JpaRepository<Goal, Long> {

    // Get all goals of a user
    List<Goal> findByUserEmailOrderByCreatedAtDesc(String userEmail);

    // Get active goals of a user
    List<Goal> findByUserEmailAndStatusOrderByEndDateAsc(
            String userEmail,
            String status
    );

    // Get goals by user and category
    List<Goal> findByUserEmailAndCategoryIgnoreCase(
            String userEmail,
            String category
    );

    // Get goals by user and activity
    List<Goal> findByUserEmailAndActivityIgnoreCase(
            String userEmail,
            String activity
    );
    List<Goal> findAllByOrderByCreatedAtDesc();
}