package com.student.filesystem.db;

import com.student.filesystem.db.entity.PermissionEntity;
import org.springframework.data.repository.ListCrudRepository;

/**
 * Interface representing a repository for permission entities
 */
public interface PermissionRepository extends ListCrudRepository<PermissionEntity, Long> {
    PermissionEntity findByUserIdAndFileId(Long userId, Long FileId);

    void deleteByFileIdAndUserId(Long fileId, Long userId);
}
