package com.student.filesystem.db.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.checkerframework.checker.units.qual.C;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;
import java.util.Date;

/**
 * Represents a file entity mapped to the "files" table in the database.
 * Records are immutable data structures.
 */
@Table("files")
public record FileEntity(
        @Id@Column("id") Long id,
        @Column("name") String name,
        @Column("create_user_id") Long createUserId,
        @Column("directory_id") Long directoryId,
        @Column("creation_date") Instant creationDate,
        @Column("last_modify_data") Instant lastModifyDate,
        @Column("content") String content
) {
}
