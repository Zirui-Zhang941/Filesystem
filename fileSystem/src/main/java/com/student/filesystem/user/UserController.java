package com.student.filesystem.user;

import com.student.filesystem.model.RegisterBody;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

/**
 * Controller class for handling user-related operations
 */
@RestController
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }


    /**
     * Handle the request of register a new user
     * @param body the instance with username and password
     */
    @RequestMapping(value="/register", method = RequestMethod.POST, headers = "Content-Type=application/json")
    @ResponseStatus(value = HttpStatus.OK)
    public void register(@RequestBody RegisterBody body) {
        userService.register(body.username(), body.password());
    }
}
