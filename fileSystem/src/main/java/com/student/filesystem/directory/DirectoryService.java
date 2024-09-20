package com.student.filesystem.directory;

import com.student.filesystem.db.DirectoryRepository;
import com.student.filesystem.db.FileRepository;
import com.student.filesystem.db.UserRepository;
import com.student.filesystem.db.entity.DirectoryEntity;
import com.student.filesystem.model.FileNameResponse;
import com.student.filesystem.file.FileService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;

/**
 * Service class for handling directory-related operations.
 */
@Service
public class DirectoryService {
    private final DirectoryRepository directoryRepository;
    private final UserRepository userRepository;

    public DirectoryService(DirectoryRepository directoryRepository, UserRepository userRepository) {
        this.directoryRepository = directoryRepository;
        this.userRepository = userRepository;
    }

    public boolean existsByNameAndCreateUserId(String name, Long userId){
        return directoryRepository.existsByNameAndCreateUserId(name, userId);
    }

    /**
     * Retrieves the ID of a directory by its name and the ID of the user who created it.
     *
     * @param name   The name of the directory.
     * @param userId The ID of the user who created the directory.
     * @return The ID of the directory if found, null otherwise.
     */
    public Long getDirectoryIdByNameAndUserId(String name, Long userId){
        return directoryRepository.findByNameAndCreateUserId(name, userId).id();
    }

    /**
     * Adds a new directory with the given name and parent ID.
     * @param name the name of the new directory
     * @param parentId the ID of the parent directory
     */
    public void addDirectory(String name, Long parentId, Long userId){
        DirectoryEntity directoryEntity = new DirectoryEntity(null, name, userId, parentId, Instant.now(),Instant.now());
        directoryRepository.save(directoryEntity);
    }

    /**
     * Finds a directory entity by the given user ID and directory name.
     *
     * @param userId The ID of the user who created the directory.
     * @param name   The name of the directory to find.
     * @return The directory entity if found, null otherwise.
     */
    public DirectoryEntity findDirectoryByCreateUserIdAndName(Long userId, String name){
        return directoryRepository.findByCreateUserIdAndName(userId, name);
    }

    /**
     * Finds directory entities by the given parent directory ID and user ID.
     *
     * @param parentId The ID of the parent directory.
     * @param userId   The ID of the user who created the directories.
     * @return A list of directory entities that belong to the given parent directory and user.
     */
    public List<DirectoryEntity> findDirectoryByParentId(Long parentId, Long userId){
        return directoryRepository.findByParentIdAndCreateUserId(parentId, userId);
    }

    /**
     * Deletes a directory given its name and the id of the user who created it. Deletes it by removing it from the
     * database.
     *
     * @param folderName name of folder to delete
     * @param userId ID of user who owns that folder
     */
    public void deleteDirectory(String folderName, Long userId){
        DirectoryEntity directoryEntity = findDirectoryByCreateUserIdAndName(userId, folderName);
        directoryRepository.delete(directoryEntity);
    }

    /**
     * This is going to take the information from the controller and then update the directory repository with it
     * @param userID the user that we are currently logged in as
     * @param directory the directory that we are changing
     * @param destination the final destination that we are moving this to
     */
    public void MoveDirectory(Long userID, DirectoryEntity directory, long destination) {
        // create the new location
        DirectoryEntity newDirectory = new DirectoryEntity(directory.id(), directory.name(), userID,destination,Instant.now(),directory.creationDate());
        // then thanks to crude repository we can just save it and it should override
        directoryRepository.save(newDirectory);
    }
}
