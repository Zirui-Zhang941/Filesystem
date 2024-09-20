DROP TABLE IF EXISTS permissions;
DROP TABLE IF EXISTS authorities;
DROP TABLE IF EXISTS files;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS directory;

CREATE TABLE users
(
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    enabled  TINYINT      NOT NULL DEFAULT 1
);

CREATE TABLE authorities
(
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    username  VARCHAR(50) NOT NULL UNIQUE,
    authority VARCHAR(50) NOT NULL,
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE directory
(
    id   INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    parent_directory_id INT,
    create_user_id INT NOT NULL ,
    last_modify_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    creation_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_and_directory_name_combo(create_user_id, name)
);

CREATE TABLE files
(
    id   INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL ,
    directory_id INT NOT NULL,
    create_user_id INT NOT NULL,
    creation_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_modify_data TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    content LONGTEXT,
    FOREIGN KEY (directory_id) REFERENCES directory(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_and_file_name_combo(create_user_id, name)
);

CREATE TABLE permissions
(
    id   INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    type VARCHAR(25),
    user_id INT NOT NULL,
    file_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_and_file_combo(user_id, file_id)
);