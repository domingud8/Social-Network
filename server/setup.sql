DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS  password_reset_codes;

CREATE TABLE users(
    id  SERIAL PRIMARY KEY,
    fname VARCHAR(255) NOT NULL,
    sname VARCHAR(255) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR NOT NULL,
    profile_picture_url VARCHAR,
    bio TEXT ,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



INSERT INTO users 
(fname, sname, email, password_hash, profile_picture_url, bio) 
VALUES 
('Daniela','Dominguez','ddmguez8@gmail.com','$2a$10$0PL1RwDrfA3X0T2hc87/w.ypDLiBkXm4rW2afVEZGO4I0P88VhIAm','https://s3.amazonaws.com/diego-spiced/3sgljvBBVxiEvKsdOzJ14qlMyXK_F2HP.jpg',  'sometext');

CREATE TABLE password_reset_codes (
    id              SERIAL PRIMARY KEY,
    code            VARCHAR(50) NOT NULL,
    email           VARCHAR(50) NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE friendships (
    id              SERIAL PRIMARY KEY,
    sender_id       INT REFERENCES users(id) NOT NULL,
    recipient_id    INT REFERENCES users(id) NOT NULL,
    accepted        BOOLEAN DEFAULT false,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE chat_messages (
    id SERIAL PRIMARY KEY,
    sender_id INT REFERENCES user(id) NOT NULL,
    text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

SELECT chat_messages.*, users.fname, users.sname, users.profile_picture_url
FROM chat_messages
JOIN users
ON users.id = chat_messages.sender_id
ORDER BY chat_messages.id DESC
LIMIT 3;