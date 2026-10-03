package com.meena.carbon_backend.repository;

import com.meena.carbon_backend.entity.GoalProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface GoalProgressRepository extends JpaRepository<GoalProgress, Long> {

    // Get all progress records for a goal
    List<GoalProgress> findByGoalIdOrderByDateAsc(Long goalId);

    // Get progress records for a user
    List<GoalProgress> findByUserEmailOrderByDateDesc(String userEmail);

    // Get progress for a particular goal on a particular date
    GoalProgress findByGoalIdAndDate(Long goalId, LocalDate date);

    // Get progress records between two dates
    List<GoalProgress> findByGoalIdAndDateBetweenOrderByDateAsc(
            Long goalId,
            LocalDate startDate,
            LocalDate endDate
    );

    // Delete progress records when a goal is deleted
    void deleteByGoalId(Long goalId);
}