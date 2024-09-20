package com.student.filesystem.directory;

import com.student.filesystem.db.DirectoryRepository;
import com.student.filesystem.db.UserRepository;
import com.student.filesystem.db.entity.DirectoryEntity;
import com.student.filesystem.db.entity.UserEntity;
import com.student.filesystem.model.CreateDirectoryBody;
import com.student.filesystem.model.DeleteDirectoryBody;
import com.student.filesystem.user.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

/**
 * Controller class for handling directory-related operations.
 */
@Controller
public class DirectoryController {
    private final DirectoryService directoryService;
    private final UserService userService;
    private final DirectoryRepository directoryRepository;
    private final UserRepository userRepository;

    public DirectoryController(DirectoryService directoryService, UserService userService, DirectoryRepository directoryRepository, UserRepository userRepository) {
        this.directoryService = directoryService;
        this.userService = userService;
        this.directoryRepository = directoryRepository;
        this.userRepository = userRepository;
    }

    /**
     * Creates a new directory (folder) based on the provided folder name and path.
     *
     * @throws ResponseStatusException If the parent folder does not exist or if there's an issue with the request.
     */
    @RequestMapping(value = "/createFolder", method = RequestMethod.POST, headers = "Content-Type=application/json")
    @ResponseStatus(HttpStatus.OK)
    public void createDirectory( @RequestBody CreateDirectoryBody body){
        // get request user
        String username=body.username();
        UserEntity userEntity = userService.findByUsername(username);

        // get parent directory id
        if(body.path().equals("main") && ! directoryService.existsByNameAndCreateUserId(body.path(), userEntity.id())){
            directoryService.addDirectory("main", 0L, userEntity.id());
        } else if(! directoryService.existsByNameAndCreateUserId(body.path(), userEntity.id())){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "parent folder does not exist");
        }
        Long parentId = directoryService.getDirectoryIdByNameAndUserId(body.path(), userEntity.id());

        directoryService.addDirectory(body.folderName(), parentId, userEntity.id());
    }

    /**
     * Deletes the directory which is named in the JSON http request for the given user.
     *
     * @throws ResponseStatusException if user attempts to delete root directory
     */
    @RequestMapping(value = "/deleteFolder", method = RequestMethod.DELETE, headers = "Content-Type=application/json")
    @ResponseStatus(HttpStatus.OK)
    public void deleteDirectory( @RequestBody DeleteDirectoryBody body){
        if(body.folderName().equals("main")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "cannot delete root directory");
        }
        UserEntity userEntity = userService.findByUsername(body.username());
        directoryService.deleteDirectory(body.folderName(), userEntity.id());
    }

    /**
     * This will take the inputs for the moving a folder and then parse those into the directory service
     * @param userName the user that is currently logged in
     * @param directoryName the directory that we are moving
     * @param destination the directory that we are moving to
     */
    @RequestMapping(value = "/movefolder", method = RequestMethod.POST)
    @ResponseStatus(HttpStatus.OK)
    public void moveDirectory(@RequestParam(value = "userName") String userName, @RequestParam(value = "directoryName") String directoryName, @RequestParam(value = "destination") String destination) {
        UserEntity userEntity = userService.findByUsername(userName);
        if (userEntity == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "this is not a valid user");
        DirectoryEntity directoryEntity = directoryService.findDirectoryByCreateUserIdAndName(userEntity.id(), directoryName);
        DirectoryEntity destinationEntity = directoryService.findDirectoryByCreateUserIdAndName(userEntity.id(), destination);
        if (directoryEntity == null || destinationEntity == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "this is not a valid directory");
        // now directory service will take care of the rest
        directoryService.MoveDirectory(userEntity.id(), directoryEntity, destinationEntity.id());
    }

}
