package com.meena.carbon_backend.repository;

import com.meena.carbon_backend.entity.Role;
import com.meena.carbon_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByOrganizationIdAndRole(
            Long organizationId,
            Role role
    );

    Optional<User> findByIdAndOrganizationIdAndRole(
            Long id,
            Long organizationId,
            Role role
    );
}