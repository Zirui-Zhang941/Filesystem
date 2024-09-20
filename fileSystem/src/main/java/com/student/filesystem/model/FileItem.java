package com.student.filesystem.model;

import org.springframework.core.io.InputStreamResource;

import java.time.Instant;

/**
 * The response class of /viewFile endpoint
 * @param name the name of current file
 * @param content the content of current file
 * @param creationDate the creation data of the file
 * @param lastModifyData the last modification data of the file
 */
public record FileItem(String name, String content, Instant creationDate, Instant lastModifyData) {
}
