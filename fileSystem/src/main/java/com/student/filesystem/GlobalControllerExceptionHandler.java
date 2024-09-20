package com.student.filesystem;

import com.student.filesystem.model.FilesystemErrorResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.server.ResponseStatusException;

/**
 * Controller to handle exception globally in the application
 */
@ControllerAdvice
public class GlobalControllerExceptionHandler {
    // Logger instance for logging exceptions
    Logger logger = LoggerFactory.getLogger(GlobalControllerExceptionHandler.class);

    /**
     * Handle default exception for type Exception
     * @param e the exception to handle
     * @return a response entity with a generic error message and status code
     */
    @ExceptionHandler(Exception.class)
    public final ResponseEntity<FilesystemErrorResponse> handleDefaultException(Exception e) {
        logger.error("", e); // log exception
        return new ResponseEntity<>(
                new FilesystemErrorResponse("Something went wrong, please try again later.",
                        e.getClass().getName(),
                        e.getMessage()
                ),
                HttpStatus.INTERNAL_SERVER_ERROR
        );
    }

    /**
     * Handle exceptions of type ResponseStatusException.
     * @param e the ResponseStatusException to handle
     * @return a response entity with the reason from the ResponseStatusException and its cause details
     */
    @ExceptionHandler(ResponseStatusException.class)
    public final ResponseEntity<FilesystemErrorResponse> handleResponseStatusException(ResponseStatusException e) {
        logger.error("", e.getCause());// log exception
        return new ResponseEntity<>(
                new FilesystemErrorResponse(e.getReason(), e.getCause().getClass().getName(), e.getCause().getMessage()),
                e.getStatusCode()
        );
    }
}
