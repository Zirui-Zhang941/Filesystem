package com.student.filesystem.db;

import com.student.filesystem.db.entity.DirectoryEntity;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.ListCrudRepository;

import java.util.List;

/**
 * Interface representing a repository for directory entities
 */
public interface DirectoryRepository extends ListCrudRepository<DirectoryEntity, Long> {

    /**
     * Counts the number of directory entities.
     * @return the count of directory entities
     */
    long count();

    /**
     * Checks if a directory with the given name exists.
     * @param name the name of the directory to check
     * @return true if a directory with the given name exists, false otherwise
     */
    boolean existsByNameAndCreateUserId(String name, Long userId);

    /**
     * Finds a directory entity by its name.
     * @param name the name of the directory to find
     * @return the directory entity if found, null otherwise
     */
    DirectoryEntity findByNameAndCreateUserId(String name, Long userId);

    /**
     * Finds a directory entity by its created user ID and its name.
     * @param userId the user id of created user
     * @param name the name of the directory to find
     * @return the directory entity if found, null otherwise
     */
    DirectoryEntity findByCreateUserIdAndName(Long userId, String name);

    List<DirectoryEntity> findByParentIdAndCreateUserId(Long parentId, Long userId);
}
