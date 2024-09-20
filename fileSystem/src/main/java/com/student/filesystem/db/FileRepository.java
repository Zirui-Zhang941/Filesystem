package com.student.filesystem.db;

import com.student.filesystem.db.entity.FileEntity;
import org.springframework.data.jdbc.repository.query.Modifying;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.ListCrudRepository;

import java.io.File;
import java.time.Instant;
import java.util.List;

/**
 * Interface representing a repository for file entities
 */
public interface FileRepository extends ListCrudRepository<FileEntity, Long> {
    FileEntity findByNameAndCreateUserId(String name, Long userId);

    @Query("SELECT name FROM files WHERE create_user_id = :userId AND directory_id = :directoryId")
    List<String> findByCreateUserIdAndDirectoryId(Long userId, Long directoryId);

    void deleteById(Long fileId);

    @Modifying
    @Query("UPDATE files SET content=:content, last_modify_data=:time WHERE create_user_id=:userId AND id=:fileId")
    void updateContentByCreateUserIdAAndId(String content, Long userId, Long fileId, Instant time);
}
