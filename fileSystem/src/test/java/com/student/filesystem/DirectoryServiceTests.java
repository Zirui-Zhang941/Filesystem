package com.student.filesystem;

import com.student.filesystem.db.DirectoryRepository;
import com.student.filesystem.db.UserRepository;
import com.student.filesystem.db.entity.DirectoryEntity;
import com.student.filesystem.directory.DirectoryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.test.context.SpringBootTest;

@ExtendWith(MockitoExtension.class)
@SpringBootTest
public class DirectoryServiceTests {
    @Mock
    DirectoryService directoryService;

    @Mock
    DirectoryRepository directoryRepository;

    @Mock
    private UserRepository userRepository;

    @BeforeEach
    public void setup(){
        directoryService = new DirectoryService(directoryRepository, userRepository);
    }

    @Test
    public void addDirectory_shouldSaveDirectory(){
        // Call the readFile method under test with a mocked folder name, parentId, and userId
        directoryService.addDirectory("folder1", 1L, 1L);
        // Verify that the save method of the directory repository was called with the expected file
        Mockito.verify(directoryRepository, Mockito.times(1)).save(Mockito.any(DirectoryEntity.class));
    }

    @Test
    public void deleteDir_checkDB(){
        // try to delete a directory
        directoryService.deleteDirectory("test", 1L);
        // check if delete method was called once
        Mockito.verify(directoryRepository, Mockito.times(1)).delete(Mockito.any(DirectoryEntity.class));
    }

}
