package com.meta.office.enums;

import com.meta.office.exceptions.InvalidRoleException;

public enum RoleType {
    ADMIN(101, "Admin"),
    MANAGER(102, "Manager"),
    EMPLOYEE(103, "Employee"),
    GUEST(104, "Guest");

    private final Integer id;
    private final String name;

    RoleType(Integer id, String name) {
        this.id = id;
        this.name = name;
    }

    public Integer getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public static RoleType fromId(Integer id) {
        for (RoleType role : RoleType.values()) {
            if (role.getId().equals(id)) {
                return role;
            }
        }
        throw new InvalidRoleException(id);
    }
}