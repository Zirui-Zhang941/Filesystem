package com.student.filesystem.model;

public record PermissionBody(
        String type,
        String username,
        String fileName
){}
