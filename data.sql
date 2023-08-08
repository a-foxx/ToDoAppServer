CREATE DATABASE todoapp;

CREATE TABLE todos (
    id UUID PRIMARY KEY ,
    user_email VARCHAR(255),
    title VARCHAR(30),
    progress INT,
    date VARCHAR(300)
);

CREATE TABLE users (
    email TEXT PRIMARY KEY,
    hashed_password VARCHAR(255)
);