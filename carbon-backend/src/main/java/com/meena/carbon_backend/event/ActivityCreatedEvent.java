package com.meena.carbon_backend.event;

import com.meena.carbon_backend.entity.Activity;

public class ActivityCreatedEvent {

    private final Activity activity;

    public ActivityCreatedEvent(Activity activity) {
        this.activity = activity;
    }

    public Activity getActivity() {
        return activity;
    }
}