# Coding Standard Documentation

## Introduction

This document outlines the coding standards to be followed by all developers working on the projects under the jurisdiction of 506 Studs. Adhering to these standards will ensure consistency, readability, and maintainability across all codebases.

All projects will use React JS version 18.2.0. and Java SDK 17.

# React Coding Standard

## Consistent Formatting

- Maintain consistent indentation, spacing, and code formatting throughout the codebase.

```e.g.
// Inconsistent formatting
function   fetchData(  url ){
    return   fetch( url )
 .then((response) => {
 return response.json();
 });
}

// Consistent formatting
function fetchData(url) {
    return fetch(url)
        .then((response) => {
            return response.json();
        });
}

```

## Naming Conventions

- Use descriptive and meaningful names for variables, functions, classes, and other entities. Follow conventions like camelCase or kebab-case for naming.

```e.g.
// Non-descriptive variable name
let x = 10;

// Descriptive variable name following camelCase
let numberOfItems = 10;
```

## Comments and Documentation

- Include clear and concise comments to explain complex logic, assumptions, or any other information that might not be obvious from the code itself. Also, document APIs, components, and modules using tools like JSDoc.

```e.g.
// Function to calculate the square of a number
function square(number) {
    return number * number; // Returns the square of the input number
}
```

## Modularization

- Organize code into reusable and modular components. Follow principles like the Single Responsibility Principle (SRP) to ensure each component has a clear and focused purpose.

```e.g.
// Example of modularization in React
// File: Button.js
import React from 'react';

function Button(props) {
    return <button onClick={props.onClick}>{props.label}</button>;
}

export default Button;
```

## Code Structure and Architecture

- In React, organize components into folders based on features or functionality, following a component-based architecture.

## Accessibility

- Ensure that the frontend is accessible to users with disabilities by following accessibility best practices such as providing appropriate alternative text for images.

## Error Handling and Logging

- Implement proper error handling and logging mechanisms to detect and handle errors gracefully. Provide meaningful error messages to aid in debugging and troubleshooting.

```e.g.
// Error handling example in JavaScript
try {
    // Code that might throw an error
    throw new Error('An error occurred');
} catch (error) {
    console.error('Error:', error.message);
}
```

## Version Control and Collaboration

- Use version control systems Git for managing code changes, branching, and collaboration. Follow branching strategies like Gitflow or feature branching to facilitate parallel development and code reviews.

## Testing

- Write automated tests (unit tests, integration tests, and end-to-end tests) to ensure the correctness and robustness of the frontend code. Use testing frameworks like Jest, Mocha, or Cypress for testing.

## Continuous Integration and Deployment (CI/CD)

- Set up automated CI/CD pipelines to automate the build, testing, and deployment processes.

# SpringBoot Coding Standard

## Consistent Formatting

- Use consistent indentation (typically four spaces or tabs) for blocks of code. Ensure that indentation remains consistent across all classes and methods. Use an empty line between methods and logical sections within a class.

```Java
public void example(int number){
    System.out.println("This is an example of consistent function.");
}

public void example2(int number){
    System.out.println("This is an example of consistent function.");
}
```

- Place annotations consistently, either above the element they're annotating or on the same line.

## Naming Convention

- Use meaningful and descriptive package names that reflect the functionality or layer of the application. Use lowercase letters with optional periods to separate parts of the package name. For example, `package com.student.filesystem.user`

- Choose descriptive and meaningful names that accurately represent the purpose of the class. Use nouns or noun phrases for class names (eg., `UserController`).

- Use camelCase for method names. Use verbs or verb phrases that describe the action performed by the method. Choose descriptive names that convey the purpose of the method without the need for extensive comments. Follow the JavaBeans naming convention for getter and setter methods (eg., `findByUsername`).

- Use camelCase for variable names. Choose meaningful and descriptive names that indicate the purpose or contents of the variable.Avoid single-letter variable names except for loop counters or well-known conventions. Use nouns or noun phrases for variable names (eg., `username`).

- Use uppercase letters with underscores (\_) to separate words in constant names (e.g., MAX_RETRY_ATTEMPTS, DEFAULT_TIMEOUT_MS). Use descriptive names that clearly convey the purpose or value of the constant.

## Comments and Documentation

- Provide a brief overview of the class's purpose and functionality.

```Java
/**
 * Controller class for handling user-related operations.
 */
@RestController
public class UserController {
    // Class implementation...
}
```

- Describe the purpose of the method. Document parameters, return values, and exceptions

```Java
/**
 * Retrieves a user by their ID.
 *
 * @param id The ID of the user to retrieve.
 * @return The list of UserEntity if found, or ResponseEntity with status 404 if not found.
 */
@GetMapping("/{id}")
public List<UserEntity> getUserById(@RequestParm Long id) {
    // Method implementation...
}
```

- Use comments to clarify complex logic, edge cases, or non-obvious behavior. Explain the purpose of specific code blocks, loops, or conditionals. Provide context or rationale for certain design decisions.
- Explain the purpose and significance of the variable.
- Describe the purpose of the configuration. Explain any configuration options or dependencies.
- Document the exception being handled. Explain the reason for handling the exception and the response format.

## Modulization

Organize packages by feature (e.g., `User`, `File`, `Directory`). Separate concerns to maintain a clear and modular structure

## Coding Structure and Architecture

- Keep classes and methods focused on a single responsibility
- Spring Boot applications follow the Model-View-Controller (MVC) architectural pattern. Controllers act as the entry point for HTTP requests, delegating business logic to services and returning responses to clients. Services contain business logic and interact with repositories to perform CRUD operations on data. Repositories handle database access and data manipulation.

## Error Handling and Logging

- Provide meaningful error messages and use consistent error code conventions. Use `@ControllerAdvice` to create global exception handlers that catch and handle exceptions thrown by controllers. Handle common exceptions and return appropriate HTTP status codes and error messages.
- Define custom exception classes to represent different types of application-specific errors. Include relevant information in the exception message or properties for debugging purposes.
- Logging include contextual information such as request details, user information, or stack traces for better debugging.

## Testing

- Use a consistent naming convention for test classes and methods (e.g., ClassNameTest, testMethodName).Include relevant information in test method names to describe the scenario being tested.
- Use _unit test_ to test individual components, and verify that each component behaves as expected under various conditions.
- Use _integration test_ to test interactions between different components or layers of the application.
