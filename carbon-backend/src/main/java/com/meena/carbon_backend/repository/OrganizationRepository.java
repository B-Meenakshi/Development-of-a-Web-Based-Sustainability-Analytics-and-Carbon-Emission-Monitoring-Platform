package com.meena.carbon_backend.repository;

import com.meena.carbon_backend.entity.Organization;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OrganizationRepository
        extends JpaRepository<Organization, Long> {

    boolean existsByEmail(String email);

    Optional<Organization> findByEmail(String email);
}