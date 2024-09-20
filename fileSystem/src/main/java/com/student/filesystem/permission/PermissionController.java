package com.student.filesystem.permission;

import com.student.filesystem.db.FileRepository;
import com.student.filesystem.db.PermissionRepository;
import com.student.filesystem.db.entity.FileEntity;
import com.student.filesystem.db.entity.UserEntity;
import com.student.filesystem.model.PermissionBody;
import com.student.filesystem.model.PermissionType;
import com.student.filesystem.user.UserService;
import org.springframework.security.core.userdetails.User;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;

/**
 * Controller class for handling permission-related operations.
 */
@Controller
public class PermissionController {
    private final PermissionService permissionService;
    private final UserService userService;
    private final FileRepository fileRepository;

    public PermissionController(UserService userService, PermissionService permissionService, FileRepository fileRepository, PermissionRepository permissionRepository) {
        this.permissionService = permissionService;
        this.userService = userService;
        this.fileRepository = fileRepository;
    }

    /**
     * This should take an API request from frontend and then add the permission of this to out database for a given file
     * @param user a cookie input that will share the users information
     * @param userName the userName of the person that you are adding permission for
     * @param fileName the file that you are changing the permission of
     * @param type the kind of permission that you are giving to them
     * @throws IOException if the user is not available or the file is not available
     */
    @RequestMapping(value = "/permission", method = RequestMethod.POST)
    @ResponseStatus(value = HttpStatus.OK)
    public void updateUserPermission(@RequestParam(value = "username") String username,@RequestParam(value = "user") String userName, @RequestParam(value = "fileName") String fileName, @RequestParam(value = "type") String type) throws IOException {
        UserEntity userEntity = userService.findByUsername(userName); // Will allow for us to get the Users ID
        Long userID = userEntity.id();
        UserEntity currentEntity = userService.findByUsername(username);

        FileEntity fileEntity = fileRepository.findByNameAndCreateUserId(fileName, currentEntity.id());
        long fileID = fileEntity.id();

        if (!permissionService.haveAdminPermission(userService.findByUsername(username).id(), fileID))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User does not have admin permission on this file");
        //This will check for the different options for permission
        PermissionType permission = switch (type.toLowerCase()) {
            case "write" -> PermissionType.WRITE;
            case "read" -> PermissionType.READ;
            case "admin" -> PermissionType.ADMIN;
            default -> null;
        };
        if(permission == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "that is not a vlid type");
        permissionService.addPermission(userID, permission, fileID); // This should then update the file with the new userName and the Type that goes with
    }

}
