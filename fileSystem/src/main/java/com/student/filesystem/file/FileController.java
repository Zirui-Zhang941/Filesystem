package com.student.filesystem.file;

import com.student.filesystem.db.DirectoryRepository;
import com.student.filesystem.db.FileRepository;
import com.student.filesystem.db.PermissionRepository;
import com.student.filesystem.db.UserRepository;
import com.student.filesystem.db.entity.DirectoryEntity;
import com.student.filesystem.db.entity.FileEntity;
import com.student.filesystem.db.entity.UserEntity;
import com.student.filesystem.directory.DirectoryService;
import com.student.filesystem.model.*;
import com.student.filesystem.permission.PermissionService;
import com.student.filesystem.user.UserService;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.time.Instant;
import java.util.Objects;

/**
 * Controller class for handling file-related operations.
 */
@Controller
public class FileController {
    private final FileService fileService;
    private final UserService userService;
    private final DirectoryService directoryService;
    private final FileRepository fileRepository;
    private final UserRepository userRepository;
    private final PermissionRepository permissionRepository;
    private final PermissionService permissionService;

    public FileController(FileService fileService, UserService userService, DirectoryService directoryService, FileRepository fileRepository, UserRepository userRepository, PermissionRepository permissionRepository, PermissionService permissionService) {
        this.fileService = fileService;
        this.userService = userService;
        this.directoryService = directoryService;
        this.fileRepository = fileRepository;
        this.userRepository = userRepository;
        this.permissionRepository = permissionRepository;
        this.permissionService = permissionService;
    }

    /**
     * Handle the request of uploading a file
     * @param username The current login user
     * @param path The folder that the file created in
     * @param file The created file with file name and content
     * @throws IOException
     */
    @RequestMapping(value = "/upload", method = RequestMethod.POST, headers="Content-Type=multipart/form-data")
    @ResponseStatus(value = HttpStatus.OK)
    public void uploadFile(@RequestParam(value="username")String username, @RequestParam(value = "file") MultipartFile file, @RequestParam(value = "path") String path) throws IOException {
        // get request user
        UserEntity userEntity = userService.findByUsername(username);

        // get directory id
        if(path.equals("main") && ! directoryService.existsByNameAndCreateUserId(path, userEntity.id())){
            directoryService.addDirectory("main", 0L, userEntity.id());
        } else if(! directoryService.existsByNameAndCreateUserId(path, userEntity.id())){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "parent folder does not exist");
        }
        Long directoryId = directoryService.getDirectoryIdByNameAndUserId(path, userEntity.id());

        fileService.addFile(userEntity.id(), directoryId, file.getResource());
    }

    /**
     * This should check that the file exists and the directory exists then pass to file service to actually move the file
     * @param userName The current login user
     * @param fileName The file that we are moving
     * @param folderName The folder that we are moving to
     * @throws IOException
     */
    @RequestMapping(value = "/movefile", method = RequestMethod.POST)
    @ResponseStatus(value = HttpStatus.OK)
    public void moveFile(@RequestParam String userName, @RequestParam(name = "folderName") String folderName, @RequestParam(name = "fileName") String fileName) throws IOException {
        // get request user
        UserEntity userEntity = userService.findByUsername(userName);
        FileEntity currentFile = fileRepository.findByNameAndCreateUserId(fileName, userEntity.id());
        Long directoryId = null;
        try {
            directoryId = directoryService.getDirectoryIdByNameAndUserId(folderName, userEntity.id());
        } catch(NullPointerException e) {throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "that folder doesn't exist");}
        if(!directoryService.existsByNameAndCreateUserId(folderName, userEntity.id()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "that folder does not exist");
        // if moving to same directory we don't need to do anything
        if(Objects.equals(currentFile.directoryId(), directoryId)) return;
        // otherwise move to file service
        fileService.changedir(userEntity.id(), directoryId, fileName);

    }



    /**
     * Handles a GET request to view a file.
     *
     * @param username The authenticated user accessing the file.
     * @param fileName The name of the file to be viewed.
     * @return The file item to be viewed.
     * @throws IOException If an error occurs during file reading.
     * @throws ResponseStatusException If the file or user is not found.
     */
    @GetMapping( value = "/viewFile")
    @ResponseBody
    public FileItem viewFile(@RequestParam(value="username")String username,@RequestParam(value = "fileName") String fileName) throws IOException {
        // get request user
        UserEntity userEntity = userService.findByUsername(username);
        FileItem fileItem = fileService.readFile(userEntity, fileName);
        return fileItem;
    }

    /**
     * Handles GET requests to retrieve and view all file names within the main directory of the authenticated user.
     * @param username The authenticated user whose file names are being viewed.
     * @return A FileNameResponse object containing the file names and subdirectory names within the user's main directory.
     */
    @GetMapping("/viewAllFileName")
    @ResponseBody
    public FileNameResponse viewAllFileName(@RequestParam("username") String username){
        UserEntity userEntity = userService.findByUsername(username);

        return fileService.readAllFileName(userEntity);
    }

    /**
     * Handles DELETE requests to delete a file for the authenticated user.
     *
     * @param username The authenticated user.
     * @param filename The name of the file to be deleted.
     * @throws ResponseStatusException If the file or user is not found.
     */
    @DeleteMapping(value = "/deleteFile")
    @ResponseStatus(HttpStatus.OK)
    public void deleteFile(@RequestParam("username") String username, @RequestParam(value = "fileName") String filename){
        UserEntity userEntity = userService.findByUsername(username);

        fileService.deleteFile(userEntity.id(), filename);
    }

    /**
     * Handles POST request to update the content of the specified file for the authenticated user.
     *
     * @param username The authenticated user.
     * @param filename The name of the file to be updated.
     * @param content The new content to be written to the file.
     * @throws ResponseStatusException If the file or user is not found.
     */
    @PostMapping("/updateFile")
    @ResponseStatus(HttpStatus.OK)
    public void updateFile(@RequestParam("username") String username, @RequestParam("fileName") String filename, @RequestParam("content") String content){
        UserEntity userEntity = userService.findByUsername(username);

        fileService.updateFile(userEntity.id(), filename, content);
    }

    /**
     * Will take the input of a file and then clone that with a new name
     * @param username the name of the user files that we are accessing
     * @param fileName the name of the file that we are cloning
     * @param newName the new name that we want to give the file
     * @param folder the folder that we want the file to end up in
     */
    @PostMapping("/cloneFile")
    @ResponseStatus(HttpStatus.OK)
    public void cloneFile(@RequestParam("username") String username, @RequestParam("fileName") String fileName, @RequestParam("newName") String newName, @RequestParam("folder") String folder) throws IOException{
        // This is going to get the basis for creating a new clone file
        UserEntity userEntity = userRepository.findByUsername(username);
        FileEntity fileEntity = fileRepository.findByNameAndCreateUserId(fileName, userEntity.id());
        Long directoryId = directoryService.getDirectoryIdByNameAndUserId(folder, userEntity.id());
        String contents = fileEntity.content();
        if(fileRepository.findByNameAndCreateUserId(newName, userEntity.id()) != null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A file with this name already exists");
        try {
            // file service will take care of the rest
            fileService.cloneFile(userEntity.id(), directoryId, newName, contents);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "this file cannot be cloned");
        }
    }
}
