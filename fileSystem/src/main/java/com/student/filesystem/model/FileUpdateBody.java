package com.student.filesystem.model;

/**
 * The reqeust class of /updateFile endpoint
 *
 * @param fileName The name of the file to be updated.
 * @param content The new content to be written to the file.
 */
public record FileUpdateBody(String fileName, String content) {
}
