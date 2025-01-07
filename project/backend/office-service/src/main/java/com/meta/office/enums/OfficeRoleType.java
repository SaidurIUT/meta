package com.meta.office.enums;

import com.meta.office.exceptions.InvalidRoleException;

public enum OfficeRoleType {
    ADMIN(101, "Admin"),
    MANAGER(102, "Manager"),
    EMPLOYEE(103, "Employee"),
    GUEST(104, "Guest");

    private final Integer id;
    private final String name;

    OfficeRoleType(Integer id, String name) {
        this.id = id;
        this.name = name;
    }

    public Integer getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public static OfficeRoleType fromId(Integer id) {
        for (OfficeRoleType role : OfficeRoleType.values()) {
            if (role.getId().equals(id)) {
                return role;
            }
        }
        throw new InvalidRoleException(id);
    }
}