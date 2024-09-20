package com.student.filesystem;

import com.student.filesystem.db.DirectoryRepository;
import com.student.filesystem.db.UserRepository;
import com.student.filesystem.db.entity.UserEntity;
import com.student.filesystem.directory.DirectoryController;
import com.student.filesystem.directory.DirectoryService;
import com.student.filesystem.model.CreateDirectoryBody;
import com.student.filesystem.model.DeleteDirectoryBody;
import com.student.filesystem.user.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashSet;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertThrows;

@ExtendWith(MockitoExtension.class)
@SpringBootTest
public class DirectoryControllerTests {
    @Mock
    private DirectoryController directoryController;

    @Mock
    private DirectoryService directoryService;

    @Mock
    private DirectoryRepository directoryRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserService userService;
    private User testUser;

    @BeforeEach
    public void setUp(){
        directoryController = new DirectoryController(directoryService, userService, directoryRepository, userRepository);

        // Create a test user with a role of ROLE_USER
        Set<SimpleGrantedAuthority> authorities = new HashSet<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
        testUser = new User("testUser", "password", authorities);
    }

    @Test
    public void createDirectory_shouldAddDirectory(){
        CreateDirectoryBody body = new CreateDirectoryBody("folder1", "test", "main");

        // Mocking userService to return a mock UserEntity when findByUsername is called
        Mockito.when(userService.findByUsername(Mockito.anyString())).thenReturn(new UserEntity(1L, "password", "testUser"));

        // Mocking directoryService to return true when existsByNameAAndCreateUserId is called
        Mockito.when(directoryService.existsByNameAndCreateUserId(Mockito.anyString(), Mockito.anyLong())).thenReturn(true);

        // Mocking directoryService to return 1L when getDirectoryIdByNameAndUserId is called
        Mockito.when(directoryService.getDirectoryIdByNameAndUserId(Mockito.anyString(), Mockito.anyLong())).thenReturn(1L);

        // Calling the method under test
        directoryController.createDirectory(body);
        // Verifying that the addDirectory method of the directoryService is called exactly once with the specified arguments
        Mockito.verify(directoryService, Mockito.times(1)).addDirectory("folder1", 1L, 1L);
    }

    @Test
    public void createDirectory_shouldThrowException(){
        CreateDirectoryBody body = new CreateDirectoryBody("folder1", "test", "main");

        // Mocking userService to return a mock UserEntity when findByUsername is called
        Mockito.when(userService.findByUsername(Mockito.anyString())).thenReturn(new UserEntity(1L, "password", "testUser"));

        // Mocking directoryService to return false when existsByNameAAndCreateUserId is called
        Mockito.when(directoryService.existsByNameAndCreateUserId(Mockito.anyString(), Mockito.anyLong())).thenReturn(false);

        // Asserting that calling the createDirectory method with specified parameters throws a ResponseStatusException
        assertThrows(ResponseStatusException.class, () -> directoryController.createDirectory(body),"Expected to throw ResponseStatusException");
    }

    @Test
    public void delelteDirectory_test1(){
        CreateDirectoryBody body = new CreateDirectoryBody("user", "test", "main");

        // create a directory
        directoryController.createDirectory(body);

        // delete the directory
        DeleteDirectoryBody delbody = new DeleteDirectoryBody("test", "user");
        directoryController.deleteDirectory(delbody);
        // verify that the deleteDirectory method was called
        Mockito.verify(directoryService, Mockito.times(1)).deleteDirectory("test", 1L);
    }

    @Test
    public void delelteDirectory_test2() {
        // try to delete directory named main
        DeleteDirectoryBody delbody = new DeleteDirectoryBody("test", "user");
        directoryController.deleteDirectory(delbody);
        // verify that the deleteDirectory method was called
        assertThrows(ResponseStatusException.class, () -> directoryController.deleteDirectory(delbody),"can't delete main directory");
    }
}
