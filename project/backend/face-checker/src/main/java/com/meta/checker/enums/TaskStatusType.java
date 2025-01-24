package com.meta.checker.enums;


public enum TaskStatusType {

    WORKING(101, "Working"),
    DONE(102, "Done"),
    PENDING(103, "Pending"),
    CANCELLED(104, "Cancelled"),
    ONHOLD(105, "On Hold");


    private final Integer id;
    private final String name;

    TaskStatusType(Integer id, String name) {
        this.id = id;
        this.name = name;
    }

    public Integer getId() {
        return id;
    }

    public String getName() {
        return name;
    }


    public static TaskStatusType getById(Integer id) {
        for (TaskStatusType e : values()) {
            if (e.id.equals(id)) {
                return e;
            }
        }
        return null;
    }

}
