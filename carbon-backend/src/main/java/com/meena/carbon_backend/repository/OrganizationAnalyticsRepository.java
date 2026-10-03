package com.meena.carbon_backend.repository;

import com.meena.carbon_backend.entity.Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface OrganizationAnalyticsRepository
        extends JpaRepository<Activity, Long> {

    /*
     * Get all activities belonging ONLY to employees
     * of a particular organization.
     *
     * Activity -> userEmail
     * User     -> organization
     */
    @Query("""
        SELECT a
        FROM Activity a
        JOIN User u ON a.userEmail = u.email
        WHERE u.organization.id = :organizationId
        ORDER BY a.date DESC
    """)
    List<Activity> findActivitiesByOrganizationId(
            @Param("organizationId") Long organizationId
    );


    /*
     * Get organization employee activities
     * within a particular date range.
     */
    @Query("""
        SELECT a
        FROM Activity a
        JOIN User u ON a.userEmail = u.email
        WHERE u.organization.id = :organizationId
          AND a.date BETWEEN :startDate AND :endDate
        ORDER BY a.date ASC
    """)
    List<Activity> findActivitiesByOrganizationIdAndDateBetween(
            @Param("organizationId") Long organizationId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );


    /*
     * Get activities for one specific employee
     * belonging to the organization.
     */
    @Query("""
        SELECT a
        FROM Activity a
        JOIN User u ON a.userEmail = u.email
        WHERE u.organization.id = :organizationId
          AND u.id = :userId
        ORDER BY a.date DESC
    """)
    List<Activity> findEmployeeActivities(
            @Param("organizationId") Long organizationId,
            @Param("userId") Long userId
    );


    /*
     * Get activities for one specific employee
     * within a date range.
     */
    @Query("""
        SELECT a
        FROM Activity a
        JOIN User u ON a.userEmail = u.email
        WHERE u.organization.id = :organizationId
          AND u.id = :userId
          AND a.date BETWEEN :startDate AND :endDate
        ORDER BY a.date ASC
    """)
    List<Activity> findEmployeeActivitiesByDateBetween(
            @Param("organizationId") Long organizationId,
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}