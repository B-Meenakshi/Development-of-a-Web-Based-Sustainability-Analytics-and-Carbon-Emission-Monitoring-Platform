package com.meena.carbon_backend.entity;

import jakarta.persistence.*;

@Entity
@Table(
    name = "user_badges",
    uniqueConstraints = {
        @UniqueConstraint(
            columnNames = {"user_id", "badge_id"}
        )
    }
)
public class UserBadge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "badge_id", nullable = false)
    private Badge badge;

    public UserBadge() {
    }

    public UserBadge(User user, Badge badge) {
        this.user = user;
        this.badge = badge;
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Badge getBadge() {
        return badge;
    }

    public void setBadge(Badge badge) {
        this.badge = badge;
    }
}