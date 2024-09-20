## Introduction

This is the API documentation of our MySQL filesystem. The following APIs allow you to perform various operations on database.

## Create a User

Create a new user account.

### Authorization

Do not require user access token

### URL

`POST` `/register`

### Request Body Parameters

- username (required, String): The username for the new account.
- password (required, String): The password for the new account.

### Response Code

- 200 OK: Account successfully created.
- 400 Bad Request: Invalid request parameters.

## User Login

Authenticate a user and generate an access token.

### Authorization

Do not require user access token

### URL

`POST` `/login`

### Request Body Parameters

**Should not user JSON, use FormData**

- `username` (required, String): The username of the user.
- `password` (required, String): The password of the user.

### Response Code

- 204 OK: Account successfully login.
- 401 Unauthorized: Username or Password incorrect.

## Upload a .txt File

### URL

`POST` `/upload`

### Request Body (use FormData)

- `path` (required): directory / folder (The folder that the new file belong to)
- `file` (required): Text file.
- `username` (required): The username of the user.

### Response Body

### Response Code

- 200 OK: File successfully uploaded.
- 400 Bad Request: Path does not exist.
- 401 Unauthorized: The access token is not valid. The user with current access token does not have permission.

## View a file

### Authorization

Require a user access token that has permission

### URL

`GET` `/viewFile`

### Request Query Parameters

- `fileName`(require): the name of the file (without `.txt`)
- `username`(required): The username of the user.

#### fetch URL example

`http://localhost:8080/viewFile?fileName=test&username=test`

### Response Body

- `name`: the name of the file
- `content`: the content of the file
- `creationDate`: the create date of the file
- `lastModifyDate`: the last modify date of the file

### Response Code

- 200 OK: File information successfully returned.
- 400 Bad Request: File does not exist.
- 401 Unauthorized: The access token is not valid. The user with current access token does not have permission.

## View all file(s) name in directory

### Authorization

Require a user access token that has permission

### URL

`GET` `/viewAllFileName`

### Request Query Parameters

- `username` (required): The username of the user.

### Response Body

- `directoryName`: current directory name
- `filenames`: a list of string that represent the name of files in current directory
- `subDirectories`: the sub-directory file object (include directoryName, filenames, and subDirectories)

- example response
  ```
  {
    "directoryName": "main",
    "filenames": [
        "test.txt"
    ],
    "subDirectories": [
        {
            "directoryName": "folder1",
            "filenames": [],
            "subDirectories": []
        }
    ]
  }
  ```

### Response Code

- 200 OK: File information in current directory successfully returned.
- 401 Unauthorized: The access token is not valid. The user with current access token does not have permission.

## Create a new folder

### Authorization

Require a user access token that has permission

### URL

`POST` `/createFolder`

### Request Body Parameters

- `name` (required): new folder name.
- `path` (required): directory / folder from.

### Response Code

- 200 OK: File information in current directory successfully returned.
- 400 Bad Request: Parent folder does not exist.
- 401 Unauthorized: The access token is not valid. The user with current access token does not have permission.

## Update the content of an exist file

### Authorization

Require a user access token that has permission

### URL

`POST` `/updateFile`

### Request query Parameters (user FormData)

- `fileName` (required): the name of the file (without `.txt`).
- `content` (required): the new content of the file.

### Response Code

- 200 OK: File information in current directory successfully returned.
- 400 Bad Request: Parent folder does not exist.
- 401 Unauthorized: The access token is not valid. The user with current access token does not have permission.

## Delete a file

### Authorization

Require a user access token that has permission

### URL

`DELETE` `/deleteFile`

### Request Query Parameters

- `fileName`(require): the name of the file.

#### fetch URL example

`http://localhost:8080/deleteFile?fileName=test`

### Response Code

- 200 OK: File information successfully returned.
- 400 Bad Request: File does not exist.
- 401 Unauthorized: The access token is not valid. The user with current access token does not have permission.

## Change permission

### Authorization

Requires a user access token that has admin permission to a file

### URL

`POST` `/permission`

### Request Body Parameters

- `username` (String required): the name of the new user being added to permission
- `fileName` (String required): the file that is going to have its permission updated
- `type` (String required): the type of permission to be added (write, read, admin)

### Response Code

- 200 OK: File information updated successfully
- 400 Bad Request: File information wasn't updated properly

## Move File

### Authorization

Requires a user access token that has admin permission to a file

### URL

`POST` `/movefile`

### Request Parameters

-`username` (required): the user that is currently logged in
- `fileName` (required): the file that you are trying to move
- `folderName` (required): The directory that you want to move the file to

### Response Code

- 200 OK: File information updated successfully
- 400 Bad Request: File information wasn't updated properly

## Clone File
### Authorization

Requires the users name of the person to update the file

### URL

`POST` `/cloneFile`

### Request Param

- `username` (String required): The username that is currently logged in
- `fileName` (String required): The file that we wan to clone
- `newName` (String required): What we want to name the clone file
- `folder` (String required): The folder that we want to create this new file in

## Response Code
- 200 OK: File cloned properly
- 400 Bad Request: the file wasn't cloned properly

## Move Folder

### Authorization

Requires the name of the person to move the folder

### URL

`POST` `/moveFolder`

### Request Param
- `userName`(String required): the name of the user that we are logged in as
- `directoryName`(String required): the folder that we want to move
- `destination`(String required): the final destination of the folder

### Response Code

- 200 OK: Folder moved properly
- 400 Bad Request: the folder wasn't able to be moved
