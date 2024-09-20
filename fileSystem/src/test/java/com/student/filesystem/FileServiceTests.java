package com.student.filesystem;

import com.student.filesystem.db.DirectoryRepository;
import com.student.filesystem.db.FileRepository;
import com.student.filesystem.db.PermissionRepository;
import com.student.filesystem.db.entity.DirectoryEntity;
import com.student.filesystem.db.entity.FileEntity;
import com.student.filesystem.db.entity.PermissionEntity;
import com.student.filesystem.db.entity.UserEntity;
import com.student.filesystem.directory.DirectoryService;
import com.student.filesystem.file.FileService;
import com.student.filesystem.model.FileItem;
import com.student.filesystem.model.FileNameResponse;
import com.student.filesystem.model.PermissionType;
import com.student.filesystem.permission.PermissionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.data.jdbc.repository.query.Modifying;
import org.springframework.web.server.ResponseStatusException;

import javax.swing.tree.ExpandVetoException;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.time.Instant;
import java.util.ArrayList;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTimeoutPreemptively;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
@SpringBootTest
public class FileServiceTests {

    @Mock
    FileRepository fileRepository;

    @Mock
    DirectoryService directoryService;

    @Mock
    PermissionService permissionService;

    private FileService fileService;
    private Resource mockFile;
    private UserEntity userEntity;
    private Instant createTime;
    private Instant modifyTime;
    private FileEntity file;


    @BeforeEach
    public void setup() throws IOException {
        fileService = new FileService(fileRepository, directoryService, permissionService);
        userEntity = new UserEntity(1L, "password", "testUser");

        // set up mock file
        String content = "test file";
        String fileName = "test.txt";

        try {
            // Specify the file path
            File file = new File(fileName);

            // Create a BufferedWriter to write to the file
            BufferedWriter writer = new BufferedWriter(new FileWriter(file));

            // Write the content to the file
            writer.write(content);

            // Close the writer
            writer.close();

            mockFile = new FileSystemResource(file);

            System.out.println("File created successfully");
        } catch (IOException e) {
            System.err.println("An error occurred while creating the file: " + e.getMessage());
        }

        createTime = Instant.now();
        modifyTime = Instant.now();

        file = new FileEntity(1L, "test", 1L, 1L, createTime, modifyTime, "test file");

    }

    @Test
    public void saveFile_shouldSaveFile() throws IOException {
        // Create a FileEntity object representing the expected saved file
        FileEntity expectFile = new FileEntity(1L, "test", 1L, 1L, Instant.now(), Instant.now(), "test file");

        // Capture the argument passed to the save method of the file repository
        ArgumentCaptor<FileEntity> fileEntityCaptor = ArgumentCaptor.forClass(FileEntity.class);

        Mockito.when(fileRepository.save(fileEntityCaptor.capture())).thenReturn(expectFile);
        // Stub the save method of the file repository to return the expected file when called with the file object
        Mockito.when(fileRepository.findByNameAndCreateUserId("test", 1L)).thenReturn(expectFile);

        fileService.addFile(1L, 1L, mockFile);

        // Verify that the save method of the file repository was called with the expected file
        Mockito.verify(fileRepository, Mockito.times(1)).save(Mockito.any(FileEntity.class));
        // Verify that the addPermission method of the permission repository is called once with the specified arguments
        Mockito.verify(permissionService, Mockito.times(1)).addPermission(1L, PermissionType.ADMIN, 1L);
    }

    @Test
    public void readFile_shouldReturnFileItem() throws IOException {
        // Create an expected FileItem object with sample data
        FileItem expect = new FileItem("test.txt", "test file",  createTime, modifyTime);

        // Mock the behavior of the file repository to return a predefined FileItem when searching by name
        Mockito.when(fileRepository.findByNameAndCreateUserId("test", 1L)).thenReturn(file);
        // Mock the behavior of the permission service to return true for permission checks
        Mockito.when(permissionService.havePermission(1L, 1L)).thenReturn(new PermissionEntity(1L, PermissionType.ADMIN, 1L, 1L));

        // Call the readFile method under test with a mocked user entity and a file name
        FileItem fileItem = fileService.readFile(userEntity, "test");

        // Verify that the returned FileItem matches the expected FileItem
        assertEquals(expect, fileItem);

    }

    @Test
    public void readFileWithoutFile_shouldThrowException(){
        // Mocking the behavior of the file repository to return null when searching for a file by name
        Mockito.when(fileRepository.findByNameAndCreateUserId("test", 1L)).thenReturn(null);

        try{
            // Attempting to read a file that does not exist
            FileItem fileItem = fileService.readFile(userEntity, "test");
        }catch (ResponseStatusException e){
            // Verifying that the caught exception has the expected reason
            assertEquals("Current file does not exist", e.getReason());
        }catch (Exception e){
            // Failing the test if any unexpected exception is caught
            assertEquals(false, true);
        }
    }

    @Test
    public void readFileWithoutPermission_shouldThrowException(){
        // Mock the behavior of the file repository to return a predefined FileItem when searching by name
        Mockito.when(fileRepository.findByNameAndCreateUserId("test", 1L)).thenReturn(file);
        // Mocking the behavior of the permission service to return false when searching for permission checks
        Mockito.when(permissionService.havePermission(1L, 1L)).thenReturn(null);

        try{
            // Attempting to read a file that does not exist
            FileItem fileItem = fileService.readFile(userEntity, "test");
        }catch (ResponseStatusException e){
            // Verifying that the caught exception has the expected reason
            assertEquals("Current user does not have permission to read this file", e.getReason());
        }catch (Exception e){
            // Failing the test if any unexpected exception is caught
            assertEquals(false, true);
        }
    }

    @Test
    public void readAllFileName_shouldReturnFileNameResponse(){
        // Create an expected FileNameResponse object with sample data
        FileNameResponse expect = new FileNameResponse("main", new ArrayList<String>(), new ArrayList<FileNameResponse>());

        // Mock the behavior of the directoryService to return a predefined DirectoryEntity when searching by creator and name
        DirectoryEntity directoryEntity = new DirectoryEntity(1L, "main", 1L, 0L, modifyTime, createTime);
        Mockito.when(directoryService.findDirectoryByCreateUserIdAndName(1L, "main")).thenReturn(directoryEntity);

        // Mock the behavior of the directoryService to return a predefined list of DirectoryEntity when searching by creator and parentId
        Mockito.when(directoryService.findDirectoryByParentId(1L, 1L)).thenReturn(new ArrayList<DirectoryEntity>());

        // Mock the behavior of the fileRepository to return a predefined list of FileEntity when searching by creator and directoryId
        Mockito.when(fileRepository.findByCreateUserIdAndDirectoryId(1L, 1L)).thenReturn(new ArrayList<String>());

        // Call the readAllFileName method under test with a mocked user entity
        FileNameResponse response = fileService.readAllFileName(userEntity);

        // Verify that the returned FileNameResponse matches the expected FileNameResponse
        assertEquals(expect, response);
    }

    @Test
    public void deleteFile_shouldDeleteFile(){
        // Mocking the behavior of the fileRepository to return a predefined file
        Mockito.when(fileRepository.findByNameAndCreateUserId(Mockito.anyString(), Mockito.anyLong())).thenReturn(file);
        Mockito.when(permissionService.havePermission(Mockito.anyLong(), Mockito.anyLong())).thenReturn(new PermissionEntity(1L, PermissionType.ADMIN, 1L, 1L));

        // Calling the deleteFile method of the fileService with a user ID of 1L and a file name "test".
        fileService.deleteFile(1L, "test");

        // Verifying that the deleteById method of the fileRepository is called exactly once
        Mockito.verify(fileRepository, Mockito.times(1)).deleteById(1L);
        // Verifying that the deleteFilePermission method of the permissionService is called exactly once
        Mockito.verify(permissionService, Mockito.times(1)).deleteFilePermission(1L, 1L);
    }

    @Test
    public void deleteFileWithoutFile_shouldThrowException(){
        // Mocking the behavior of the fileRepository to return null
        Mockito.when(fileRepository.findByNameAndCreateUserId(Mockito.anyString(), Mockito.anyLong())).thenReturn(null);

        // Attempting to delete a file with a user ID of 1L and a file name "test".
        try{
            fileService.deleteFile(1L, "test");
        }catch (ResponseStatusException e){
            // Verifying that a ResponseStatusException is thrown with the reason
            assertEquals("Current file does not exist", e.getReason());
        }catch (Exception e){
            // If an unexpected exception is caught, fail the test.
            assertEquals(false, true);
        }
    }

    @Test
    public void deleteFileWithoutPermission_shouldThrowException(){
        // Mocking the behavior of the fileRepository to return null
        Mockito.when(fileRepository.findByNameAndCreateUserId(Mockito.anyString(), Mockito.anyLong())).thenReturn(file);
        Mockito.when(permissionService.havePermission(Mockito.anyLong(), Mockito.anyLong())).thenReturn(new PermissionEntity(1L, PermissionType.READ, 1L, 1L));

        // Attempting to delete a file with a user ID of 1L and a file name "test".
        try{
            fileService.deleteFile(1L, "test");
        }catch (ResponseStatusException e){
            // Verifying that a ResponseStatusException is thrown with the reason
            assertEquals("Current user does not have permission to delete this file", e.getReason());
        }catch (Exception e){
            // If an unexpected exception is caught, fail the test.
            assertEquals(false, true);
        }
    }

    @Test
    public void updateFile_shouldUpdateFile(){
        // Mocking the behavior of the fileRepository to return a predefined file
        Mockito.when(fileRepository.findByNameAndCreateUserId(Mockito.anyString(), Mockito.anyLong())).thenReturn(file);
        Mockito.when(permissionService.havePermission(Mockito.anyLong(), Mockito.anyLong())).thenReturn(new PermissionEntity(1L, PermissionType.ADMIN, 1L, 1L));

        fileService.updateFile(1L, "test", "this is new");

        Mockito.verify(fileRepository, Mockito.times(1)).updateContentByCreateUserIdAAndId(eq("this is new"), eq(1L), eq(1L), Mockito.any(Instant.class));
    }

    @Test
    public void updateFileWithoutFile_ShouldThrowException(){
        Mockito.when(fileRepository.findByNameAndCreateUserId(Mockito.anyString(), Mockito.anyLong())).thenReturn(null);

        try{
            fileService.updateFile(1L, "test", "aaa");
        }catch (ResponseStatusException e){
            // Verifying that a ResponseStatusException is thrown with the reason
            assertEquals("Current file does not exist", e.getReason());
        }catch (Exception e){
            assertEquals(false, true);
        }
    }

    @Test
    public void updateFileWithoutPermission_shouldThrowException(){
        // Mocking the behavior of the fileRepository to return a predefined file
        Mockito.when(fileRepository.findByNameAndCreateUserId(Mockito.anyString(), Mockito.anyLong())).thenReturn(file);
        Mockito.when(permissionService.havePermission(Mockito.anyLong(), Mockito.anyLong())).thenReturn(new PermissionEntity(1L, PermissionType.READ, 1L, 1L));

        try{
            fileService.updateFile(1L, "test", "aaa");
        }catch (ResponseStatusException e){
            // Verifying that a ResponseStatusException is thrown with the reason
            assertEquals("Current user does not have permission to edit this file", e.getReason());
        }catch (Exception e){
            assertEquals(false, true);
        }
    }

}
