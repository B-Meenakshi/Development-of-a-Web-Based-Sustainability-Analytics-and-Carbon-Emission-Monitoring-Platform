package com.meena.carbon_backend.event;

import com.meena.carbon_backend.entity.User;

public class GoalCompletedEvent {

    private final User user;

    public GoalCompletedEvent(User user) {
        this.user = user;
    }

    public User getUser() {
        return user;
    }
}