package com.student.filesystem.permission;

import com.student.filesystem.db.PermissionRepository;
import com.student.filesystem.db.entity.PermissionEntity;
import com.student.filesystem.model.PermissionType;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Service;

/**
 * Service class for handling permission-related operations.
 */
@Service
public class PermissionService {
    private final PermissionRepository permissionRepository;

    public PermissionService(PermissionRepository permissionRepository) {
        this.permissionRepository = permissionRepository;
    }

    /**
     * Adds a permission for a user to access a file with the specified type.
     *
     * @param userId The ID of the user to whom the permission is granted.
     * @param type The type of permission to be granted.
     * @param fileId The ID of the file for which the permission is granted.
     */
    public void addPermission(Long userId, PermissionType type, Long fileId){
        PermissionEntity permission = new PermissionEntity(null, type, userId, fileId);
        permissionRepository.save(permission);
    }

    /**
     * Retrieves the permission entity for the specified user and file.
     *
     * @param userId The ID of the user.
     * @param fileId The ID of the file.
     * @return The permission entity if found, otherwise null.
     */
    public PermissionEntity havePermission(Long userId, Long fileId){
        return permissionRepository.findByUserIdAndFileId(userId, fileId);
    }
    public boolean haveAdminPermission(Long userId, Long fileId) {
        return permissionRepository.findByUserIdAndFileId(userId, fileId).type() == PermissionType.ADMIN;
    }
    public void deleteFilePermission(Long userId, Long fileId){
        permissionRepository.deleteByFileIdAndUserId(fileId, userId);
    }
}
