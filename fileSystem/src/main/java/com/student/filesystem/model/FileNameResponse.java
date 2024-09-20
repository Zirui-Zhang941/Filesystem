package com.student.filesystem.model;

import java.util.List;

/**
 * The response class of /viewAllFile endpoint
 *
 * @param directoryName The name of the directory.
 * @param filenames The list of filenames in the directory.
 * @param subDirectories The list of subdirectories.
 */
public record FileNameResponse(String directoryName, List<String> filenames, List<FileNameResponse> subDirectories) {
}
