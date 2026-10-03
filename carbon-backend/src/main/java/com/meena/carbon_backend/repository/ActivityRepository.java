
package com.meena.carbon_backend.repository;

import com.meena.carbon_backend.entity.Activity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ActivityRepository extends JpaRepository<Activity, Long> {

    // Get all activities of a particular user
    List<Activity> findByUserEmailOrderByDateDesc(String userEmail);

    // Get activities for a particular user on a particular date
    List<Activity> findByUserEmailAndDate(
            String userEmail,
            LocalDate date
    );

    // Get activities between two dates
    List<Activity> findByUserEmailAndDateBetween(
            String userEmail,
            LocalDate startDate,
            LocalDate endDate
    );

    // Get all activities for admin dashboard
    List<Activity> findAllByOrderByDateDesc();

    // Delete all activities belonging to a user
    void deleteByUserEmail(String userEmail);
}
