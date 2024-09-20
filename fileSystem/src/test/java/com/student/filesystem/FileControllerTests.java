package com.student.filesystem;

import com.student.filesystem.db.FileRepository;
import com.student.filesystem.db.PermissionRepository;
import com.student.filesystem.db.UserRepository;
import com.student.filesystem.db.entity.FileEntity;
import com.student.filesystem.db.entity.UserEntity;
import com.student.filesystem.directory.DirectoryController;
import com.student.filesystem.directory.DirectoryService;
import com.student.filesystem.file.FileController;
import com.student.filesystem.file.FileService;
import com.student.filesystem.model.CreateDirectoryBody;
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
public class FileControllerTests {

    @Mock
    private FileService fileService;
    @Mock
    private DirectoryService directoryService;
    @Mock
    private UserService userService;
    @Mock
    private FileRepository fileRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private PermissionRepository permissionRepository;
    @Mock
    private PermissionService permissionService;

    private FileController fileController;
    private MockMultipartFile mockFile;
    private User testUser;
    @Autowired
    private DirectoryController directoryController;


    @BeforeEach
    public void setUp(){
        // Initialize the FileController instance with mock dependencies
        fileController = new FileController(fileService, userService, directoryService, fileRepository, userRepository, permissionRepository, permissionService);

        // Create a test user with a role of ROLE_USER
        Set<SimpleGrantedAuthority> authorities = new HashSet<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
        testUser = new User("testUser", "password", authorities);

        // Create a mock MultipartFile object representing a file upload
        mockFile = new MockMultipartFile(
                "file",
                "test.txt",
                "text/plain",
                "Hello, World!".getBytes()
        );
    }

    @Test
    public void uploadFile_shouldAddFile() throws IOException {
        // Mock the userService to return a UserEntity when findByUsername is called
        Mockito.when(userService.findByUsername(Mockito.anyString())).thenReturn(new UserEntity(1L, "password", "testUser"));

        // Mock the directoryService to return false when containsDirectory is called
        Mockito.when(directoryService.existsByNameAndCreateUserId(Mockito.anyString(), Mockito.anyLong())).thenReturn(false);

        // Mock the directoryService to return a fixed directoryId when getDirectoryIdByName is called
        Mockito.when(directoryService.getDirectoryIdByNameAndUserId(Mockito.anyString(), Mockito.anyLong())).thenReturn(1L);

        // Call the uploadFile method with the test user, directory path "main", and mock file
//        fileController.uploadFile(testUser, mockFile, "main");
        fileController.uploadFile("testUser", mockFile, "main");

        // Verify that the directoryService's addDirectory method is called once with the specified arguments
        Mockito.verify(directoryService, Mockito.times(1)).addDirectory("main", 1L, 1L);

        // Verify that the fileService's addFile method is called once with the specified arguments
        Mockito.verify(fileService, Mockito.times(1)).addFile(1L, 1L, mockFile.getResource());
    }

    @Test
    public void uploadFile_shouldThrowException(){
        // Mock the userService to return a UserEntity when findByUsername is called
        Mockito.when(userService.findByUsername(Mockito.anyString())).thenReturn(new UserEntity(1L, "password", "testUser"));

        // Mock the directoryService to return false when containsDirectory is called
        Mockito.when(directoryService.existsByNameAndCreateUserId(Mockito.anyString(), Mockito.anyLong())).thenReturn(false);

//        assertThrows(ResponseStatusException.class, () -> fileController.uploadFile(testUser, mockFile, "folder"), "Expected to throw ResponseStatusException");
        assertThrows(ResponseStatusException.class, () -> fileController.uploadFile("testUser", mockFile, "folder"), "Expected to throw ResponseStatusException");
    }

    @Test
    public void viewFile_shouldCallReadFile() throws IOException {
        UserEntity userEntity = new UserEntity(1L, "password", "testUser");

        // Mock the userService to return a UserEntity when findByUsername is called
        Mockito.when(userService.findByUsername(Mockito.anyString())).thenReturn(new UserEntity(1L, "password", "testUser"));

//        fileController.viewFile(testUser, "test");
        fileController.viewFile("testUser", "test");

        // Verify that the fileService's readFile method is called
        Mockito.verify(fileService, Mockito.times(1)).readFile(userEntity, "test");
    }

    @Test
    public void viewAllFileName_shouldCallReadAllFileName(){
        UserEntity userEntity = new UserEntity(1L, "password", "testUser");

        // Mock the userService to return a UserEntity when findByUsername is called
        Mockito.when(userService.findByUsername(Mockito.anyString())).thenReturn(new UserEntity(1L, "password", "testUser"));

//        fileController.viewAllFileName(testUser);
        fileController.viewAllFileName("testUser");

        // Verify that the fileService's readAllFileName method is called
        Mockito.verify(fileService, Mockito.times(1)).readAllFileName(userEntity);
    }

    @Test
    public void deleteFile_shouldCallDeleteFile(){
        // Mock the userService to return a UserEntity when findByUsername is called
        Mockito.when(userService.findByUsername(Mockito.anyString())).thenReturn(new UserEntity(1L, "password", "testUser"));

        fileController.deleteFile(testUser.getUsername(), "test");

        Mockito.verify(fileService, Mockito.times(1)).deleteFile(1L, "test");
    }

    @Test
    public void updateFile_shouldUpdateFile(){
        // Mock the userService to return a UserEntity when findByUsername is called
        Mockito.when(userService.findByUsername(Mockito.anyString())).thenReturn(new UserEntity(1L, "password", "testUser"));

        fileController.updateFile(testUser.getUsername(), "test", "this is new");

        Mockito.verify(fileService, Mockito.times(1)).updateFile(1L, "test", "this is new");
    }

    @Test
    public void updateUser_Permission() throws IOException {
        // Mock the userService to return a UserEntity when findByUsername is called
        Mockito.when(userService.findByUsername(Mockito.anyString())).thenReturn(new UserEntity(1L, "password", "testUser"));

        CreateDirectoryBody body = new CreateDirectoryBody("testUser","testFolder","main");
        directoryController.createDirectory(body);
        fileController.uploadFile("testUser", mockFile, "main");

        fileController.moveFile(testUser.getUsername(), "testFolder", "test");
    }

}
