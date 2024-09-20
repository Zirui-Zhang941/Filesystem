package com.student.filesystem.model;

// the request body of register
public record RegisterBody (
    String username,
    String password
){}
