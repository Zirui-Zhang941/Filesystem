package com.student.filesystem.db;


import com.student.filesystem.db.entity.UserEntity;
import org.springframework.data.repository.ListCrudRepository;


/**
 * Interface representing a repository for user entities
 */
public interface UserRepository extends ListCrudRepository<UserEntity, Long> {
    UserEntity findByUsername(String username);

}

