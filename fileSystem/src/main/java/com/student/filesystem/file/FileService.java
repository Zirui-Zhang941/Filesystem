package com.student.filesystem.file;

import com.student.filesystem.db.FileRepository;
import com.student.filesystem.db.entity.DirectoryEntity;
import com.student.filesystem.db.entity.FileEntity;
import com.student.filesystem.db.entity.PermissionEntity;
import com.student.filesystem.db.entity.UserEntity;
import com.student.filesystem.directory.DirectoryService;
import com.student.filesystem.model.FileItem;
import com.student.filesystem.model.FileNameResponse;
import com.student.filesystem.model.PermissionType;
import com.student.filesystem.permission.PermissionService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Service class for handling file-related operations.
 */
@Service
public class FileService {
    private final FileRepository fileRepository;
    private final DirectoryService directoryService;
    private final PermissionService permissionService;

    public FileService(FileRepository fileRepository, DirectoryService directoryService, PermissionService permissionService) {
        this.fileRepository = fileRepository;
        this.directoryService = directoryService;
        this.permissionService = permissionService;
    }

    /**
     * create the file entity for given file and save it in DB
     * create the permission of the user and save it in DB
     * @param userId the current user id
     * @param directoryId the current save folder id
     * @param file the created file
     * @throws IOException
     */
    public void addFile(Long userId, Long directoryId, Resource file) throws IOException {

        FileEntity fileEntity = new FileEntity(null,file.getFilename().split("\\.")[0] , userId, directoryId, Instant.now(), Instant.now(), file.getContentAsString(StandardCharsets.UTF_8));
        fileRepository.save(fileEntity);

        Long fileId = fileRepository.findByNameAndCreateUserId(file.getFilename().split("\\.")[0], userId).id();
        permissionService.addPermission(userId, PermissionType.ADMIN, fileId);
    }

    /**
     * This is just going to take the contents of the file and recreate it with a new name at the given folder
     * @param userId the user that the file is for
     * @param directoryId the location that we are creating this file at
     * @param fileName the name of the file being created
     * @param content the content that the file will have
     * @throws IOException
     */
    public void cloneFile(Long userId, Long directoryId, String fileName, String content) throws IOException {
        // This is pretty much the same as above. We are creating an entity that will store the contents of the file
        FileEntity fileEntity = new FileEntity(null, fileName, userId, directoryId, Instant.now(), Instant.now(), content);
        fileRepository.save(fileEntity);
        //Then we are just adding it to the permission repository
        Long fileId = fileRepository.findByNameAndCreateUserId(fileName, userId).id();
        permissionService.addPermission(userId, PermissionType.ADMIN, fileId);
    }
    /**
     * This will create a new file entity that will then be saved and using the crude repository library will just update the file
     * @param userId the current users id
     * @param directoryId the new folder that we are saving the file to
     * @param filename the name of the file
     * @throws IOException
     */
    public void changedir(Long userId, Long directoryId, String filename) throws IOException {
        FileEntity fileCurrently = fileRepository.findByNameAndCreateUserId(filename, userId);
        if(fileCurrently == null){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current file does not exist");
        }
        // getting the information we need from the file
        Long fileId = fileCurrently.id();
        Instant creationDate = fileCurrently.creationDate();
        String content = fileCurrently.content();
        // creating a new Entity with an updated directory
        FileEntity newEntity = new FileEntity(fileId, filename, userId, directoryId, creationDate, Instant.now(), content);
        // Since crude repositories don't have an update function we, saving a file with the same ID will instead update the file
        fileRepository.save(newEntity);
    }


    /**
     * Reads a file for a given file name.
     *
     * @param user The user entity who is attempting to read the file.
     * @param fileName The name of the file to be read.
     * @return A FileItem object representing the read file.
     * @throws IOException If an I/O error occurs while reading the file.
     */
    public FileItem readFile(UserEntity user, String fileName) throws IOException {
        // check if current user have permission to read this file
        FileEntity fileEntity = fileRepository.findByNameAndCreateUserId(fileName, user.id());
        // If the file entity does not exist, throw an exception
        if(fileEntity == null){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current file does not exist");
        }

        // Check if the user has permission to read this file
        if(permissionService.havePermission(user.id(), fileEntity.id()) == null){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current user does not have permission to read this file");
        }

        FileItem fileItem = new FileItem(fileName + ".txt", fileEntity.content(), fileEntity.creationDate(), fileEntity.lastModifyDate());

        return fileItem;
    }

    /**
     * Reads all file names within the main directory created by the user.
     * @param user The user entity whose main directory is being read.
     * @return A FileNameResponse object containing the file names and subdirectory names within the main directory.
     */
    public FileNameResponse readAllFileName(UserEntity user){
        // get the main directory create by user and sorted by creation data
        // get directory id
        if(! directoryService.existsByNameAndCreateUserId("main", user.id())){
            directoryService.addDirectory("main", 0L, user.id());
        }
        DirectoryEntity mainDirectory = directoryService.findDirectoryByCreateUserIdAndName(user.id(), "main");

        return getSubDirectory(user.id(), mainDirectory);
    }

    /**
     * Recursively retrieves subdirectories and their corresponding file names.
     * @param userId The ID of the user.
     * @param directory The directory for which subdirectories and file names are being retrieved.
     * @return A FileNameResponse object containing the directory name, file names within that directory, and subdirectory names.
     */
    private FileNameResponse getSubDirectory(Long userId, DirectoryEntity directory){
        List<DirectoryEntity> subDirectory = directoryService.findDirectoryByParentId(directory.id(), userId);

        List<FileNameResponse> fileNameResponses = new ArrayList<>();
        // recursively get file names for each subdirectory
        for(int i = 0; i < subDirectory.size(); i++){
            fileNameResponses.add(getSubDirectory(userId, subDirectory.get(i)));
        }

        // retrieve file names within the directory
        List<String> files = fileRepository.findByCreateUserIdAndDirectoryId(userId, directory.id());

        for(int i = 0; i < files.size(); i++){
            files.set(i, files.get(i) + ".txt");
        }

        return new FileNameResponse(directory.name(),files, fileNameResponses);
    }

    /**
     * Deletes the specified file for the given user if permission allows.
     *
     * @param userId The ID of the user who owns the file.
     * @param filename The name of the file to be deleted.
     * @throws ResponseStatusException If the file does not exist or the user does not have permission to delete it.
     */
    public void deleteFile(Long userId, String filename){
        // check if current user have permission to read this file
        FileEntity fileEntity = fileRepository.findByNameAndCreateUserId(filename,userId);
        // If the file entity does not exist, throw an exception
        if(fileEntity == null){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current file does not exist");
        }
        // check permission
        PermissionEntity permissionEntity = permissionService.havePermission(userId, fileEntity.id());
        if(permissionEntity.type() != PermissionType.ADMIN){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current user does not have permission to delete this file");
        }

        // Delete the file permission and the file itself
        permissionService.deleteFilePermission(userId, fileEntity.id());
        fileRepository.deleteById(fileEntity.id());
    }

    /**
     * Updates the content of the specified file for the given user if permission allows.
     *
     * @param userId The ID of the user who owns the file.
     * @param filename The name of the file to be updated.
     * @param content The new content to be written to the file.
     * @throws ResponseStatusException If the file does not exist or the user does not have permission to edit it.
     */
    public void updateFile(Long userId, String filename, String content){
        // check if current user have permission to read this file
        FileEntity fileEntity = fileRepository.findByNameAndCreateUserId(filename,userId);
        // If the file entity does not exist, throw an exception
        if(fileEntity == null){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current file does not exist");
        }

        // check permission
        PermissionEntity permissionEntity = permissionService.havePermission(userId, fileEntity.id());
        if(permissionEntity.type() != PermissionType.ADMIN && permissionEntity.type() != PermissionType.WRITE){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current user does not have permission to edit this file");
        }

        // Update the content of the file
        fileRepository.updateContentByCreateUserIdAAndId(content, userId, fileEntity.id(), Instant.now());
    }
}
