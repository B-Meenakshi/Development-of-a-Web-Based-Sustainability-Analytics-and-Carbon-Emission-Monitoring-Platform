package com.meena.carbon_backend.repository;

import com.meena.carbon_backend.entity.SupportTicket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SupportTicketRepository
        extends JpaRepository<SupportTicket, Long> {

    List<SupportTicket> findByUserIdOrderByUpdatedAtDesc(Long userId);

    List<SupportTicket> findByOrganizationIdOrderByUpdatedAtDesc(Long organizationId);

    List<SupportTicket> findAllByOrderByUpdatedAtDesc();

    List<SupportTicket> findByStatusOrderByUpdatedAtDesc(String status);
}