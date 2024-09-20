package com.student.filesystem;


import com.student.filesystem.db.FileRepository;
import com.student.filesystem.db.PermissionRepository;
import com.student.filesystem.db.UserRepository;
import com.student.filesystem.directory.DirectoryService;
import com.student.filesystem.file.FileController;
import com.student.filesystem.file.FileService;
import com.student.filesystem.permission.PermissionController;
import com.student.filesystem.permission.PermissionService;
import com.student.filesystem.user.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertThrows;

@ExtendWith(MockitoExtension.class)
@SpringBootTest
public class PermissionTests {
    @Mock
    private PermissionRepository permissionRepository;
    @Mock
    private PermissionService permissionService;

    private User testUser1;
    private User testUser2;
    private MockMultipartFile mockFile;

    @Autowired
    private PermissionController permissionController;
    @Autowired
    private FileController fileController;
    @Mock
    private UserService userService;
    @Mock
    private FileRepository fileRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private FileService fileService;
    @Mock
    private DirectoryService directoryService;

    @BeforeEach
    public void setUp() throws IOException {
        // Initializing the file controller and the permission Controller with Mock dependencies
        permissionController = new PermissionController(userService, permissionService, fileRepository, permissionRepository);
        fileController = new FileController(fileService, userService, directoryService, fileRepository, userRepository, permissionRepository, permissionService);

        Set<SimpleGrantedAuthority> authorities = new HashSet<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
        testUser1 = new User("testUser1", "password", authorities);
        testUser2 = new User("testUser2", "password", authorities);

        // creates the file that we are going to add permissions to and then adds it to the database
        mockFile = new MockMultipartFile(
                "file",
                "test.txt",
                "test/plain",
                "Hello World!".getBytes()
        );
        fileController.uploadFile("testUser1", mockFile, "main");
    }
    @Test
    public void user_exits() throws IOException {
        // adds the permission to the second user
        permissionController.updateUserPermission("testuser1", "testUser2", "test", "admin");
        // Will check that the new user has admin permission
        Mockito.when(permissionService.haveAdminPermission(userService.findByUsername(testUser2.getUsername()).id(),fileRepository.findByNameAndCreateUserId("test",userService.findByUsername(testUser1.getUsername()).id()).id()));
    }
    @Test
    public void user_doesnt() throws IOException {
        // Should throw an error when using a username that isn't real 
        assertThrows(ResponseStatusException.class, () -> permissionController.updateUserPermission("testUser1", "testUser3", "test", "admin"));
    }

}
