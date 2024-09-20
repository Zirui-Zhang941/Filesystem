package com.student.filesystem.user;

import com.student.filesystem.db.UserRepository;
import com.student.filesystem.db.entity.UserEntity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.UserDetailsManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service class for handling user-related operations.
 */
@Service

public class UserService {
    private final UserDetailsManager userDetailsManager;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;

    public UserService(UserDetailsManager userDetailsManager, PasswordEncoder passwordEncoder, UserRepository userRepository) {
        this.userDetailsManager = userDetailsManager;
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
    }

    /**
     * Create a user with UserDetailManager and save it in DB
     * @param username
     * @param password
     */
    @Transactional
    public void register(String username, String password){
        // create the user with encoded password
        UserDetails user = User.builder().username(username).password(passwordEncoder.encode(password)).roles("USER").build();
        userDetailsManager.createUser(user);
    }

    /**
     * Search the userid from its username
     * @param username
     * @return the userId
     */
    public UserEntity findByUsername(String username) {
        return userRepository.findByUsername(username);
    }
}
