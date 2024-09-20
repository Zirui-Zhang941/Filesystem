package com.student.filesystem.db.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.student.filesystem.model.PermissionType;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

/**
 * Represents a permission entity mapped to the "permission" table in the database.
 * Records are immutable data structures.
 */
@Table("permissions")
public record PermissionEntity(
        @Id@Column("id") Long id,
        @Column("type") PermissionType type,
        @Column("user_id") Long userId,
        @Column("file_id") Long fileId
) {
}