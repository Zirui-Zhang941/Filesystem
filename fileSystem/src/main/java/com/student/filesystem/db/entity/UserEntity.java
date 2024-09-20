package com.student.filesystem.db.entity;

import org.springframework.data.relational.core.mapping.Table;

/**
 * Represents a user entity mapped to the "users" table in the database.
 * Records are immutable data structures.
 */
@Table("users")
public record UserEntity(
        Long id,
        String password,
        String username
) {
}
