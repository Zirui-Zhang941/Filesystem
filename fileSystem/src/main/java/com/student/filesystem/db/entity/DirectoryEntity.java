package com.student.filesystem.db.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.annotation.Generated;
import org.checkerframework.checker.units.qual.C;
import org.springframework.boot.context.properties.bind.Name;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;
import java.util.Date;
/**
 * Represents a directory entity mapped to the "directory" table in the database.
 * Records are immutable data structures.
 */
@Table("directory")
public record DirectoryEntity(
        @Id@Column("id") Long id,
        @Column("name") String name,
        @Column("create_user_id") Long createUserId,
        @Column("parent_directory_id") Long parentId,
        @Column("last_modify_date") Instant lastModifyDate,
        @Column("creation_date") Instant creationDate
) {
}
