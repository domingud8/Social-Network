const spicedPg = require("spiced-pg");
const bcrypt = require("bcryptjs");

let db;
if (process.env.DATABASE_URL) {
    db = spicedPg(process.env.DATABASE_URL);
    console.log("social network running on Heroku");
} else {
    const { DB_USER, DB_PASS } = require("../secrets.json");
    const DATABASE_NAME = "socialnetwork";
    console.log(`[db] Connecting locally to: ${DATABASE_NAME}`);
    db = spicedPg(
        `postgres:${DB_USER}:${DB_PASS}@localhost:5432/${DATABASE_NAME}`
    );
}

const generateHash = (pasword) => {
    return bcrypt.genSalt().then((salt) => {
        return bcrypt.hash(pasword, salt);
    });
};

function createUser({ fname, sname, email, password }) {
    return generateHash(password).then((password_hash) => {
        return db
            .query(
                `INSERT INTO users (fname,sname,email,password_hash) VALUES ($1,$2,$3,$4) RETURNING id,fname,sname,email, created_at `,
                [fname, sname, email, password_hash]
            )
            .then((result) => {
                return result.rows[0];
            });
    });
}

function getUserById(id) {
    return db
        .query(
            `SELECT id,fname,sname,email, profile_picture_url, bio, created_at FROM users WHERE id=$1`,
            [id]
        )
        .then((data) => {
            return data.rows[0];
        });
}

function getUserByEmail(email) {
    return db
        .query(`SELECT * from users WHERE email=$1`, [email])
        .then((data) => {
            return data.rows[0];
        });
}

function login({ email, password }) {
    return getUserByEmail(email).then((found_user_byEmail) => {
        if (!found_user_byEmail) {
            return null;
        }
        return bcrypt
            .compare(password, found_user_byEmail.password_hash)
            .then((match) => {
                if (match) {
                    return found_user_byEmail;
                }
                return null;
            });
    });
}

function createCodePasswordResetting({ code, email }) {
    return db
        .query(
            `INSERT INTO password_reset_codes (code, email) VALUES ($1,$2) RETURNING * `,
            [code, email]
        )
        .then((result) => {
            return result.rows[0];
        });
}

function getUserPasswordResetCodeByCode(code) {
    return db
        .query(`SELECT * from password_reset_codes WHERE code=$1`, [code])
        .then((data) => {
            return data.rows[0];
        });
}

function updatePassword({ password, email }) {
    return generateHash(password).then((password_hash) => {
        return db
            .query(
                `UPDATE users
             SET 
             password_hash=$1
             WHERE
             email =$2
             RETURNING * `,
                [password_hash, email]
            )
            .then((result) => result.rows[0]);
    });
}

function updateUserProfilePicture({ url, id }) {
    return db
        .query(
            `UPDATE users
             SET 
             profile_picture_url=$1
             WHERE
             id =$2
             RETURNING * `,
            [url, id]
        )
        .then((result) => result.rows[0]);
}

function updateUserProfileBio({ bio, id }) {
    return db
        .query(
            `UPDATE users
             SET 
             bio=$1
             WHERE
             id =$2
             RETURNING * `,
            [bio, id]
        )
        .then((result) => result.rows[0]);
}

function getRecentUsers({ limit = 3 }) {
    return db
        .query(
            "SELECT id, fname, sname, email, password_hash, profile_picture_url, bio FROM users ORDER BY id DESC LIMIT $1",
            [limit]
        )
        .then((result) => result.rows);
}

function getSearchUsers({ q = "" }) {
    return db
        .query(
            "SELECT id, fname, sname, email, password_hash, profile_picture_url, bio FROM users WHERE fname ILIKE $1 OR sname ILIKE $1",
            [q + "%"]
        )
        .then((result) => result.rows);
}

function deleteFriendship({ first_id, second_id }) {
    return db
        .query(
            `DELETE FROM friendships
             WHERE sender_id=$1 AND recipient_id=$2
             OR sender_id=$2 AND recipient_id=$1 RETURNING * `,
            [first_id, second_id]
        )
        .then((result) => result.rows[0]);
}

function requestFriendship({ sender_id, recipient_id }) {
    return db
        .query(
            `INSERT INTO friendships (sender_id,recipient_id) VALUES ($1,$2) RETURNING *`,
            [sender_id, recipient_id]
        )
        .then((result) => result.rows[0]);
}

function acceptFriendship({ sender_id, recipient_id }) {
    return db
        .query(
            `UPDATE friendships
             SET 
             accepted=true
             WHERE
             recipient_id=$1
             AND sender_id=$2 
             RETURNING *`,
            [recipient_id, sender_id]
        )
        .then((result) => result.rows[0]);
}

function getFriendshipRequest({ first_id, second_id }) {
    return db
        .query(
            `SELECT * FROM friendships 
            WHERE sender_id=$1 AND recipient_id=$2
            OR sender_id=$2 AND recipient_id=$1 `,
            [first_id, second_id]
        )
        .then((result) => result.rows[0]);
}

function getFriendships({ user_id }) {
    return db
        .query(
            `SELECT friendships.accepted, friendships.id AS friendship_id,
             users.id AS user_id,
             users.fname, users.sname, users.profile_picture_url
             FROM friendships
             JOIN users
             ON (
                  users.id = friendships.sender_id
                  AND friendships.recipient_id = $1)
            OR (
                  users.id = friendships.recipient_id
                  AND friendships.sender_id = $1
                  AND accepted = true) `,
            [user_id]
        )
        .then((result) => result.rows);
}

function getChatMessages({ limit }) {
    return db
        .query(
            `SELECT chat_messages.*, users.fname, users.sname, users.profile_picture_url
                     FROM chat_messages
                     JOIN users
                     ON users.id = chat_messages.sender_id
                     ORDER BY chat_messages.id DESC
                    LIMIT $1;`,
            [limit]
        )
        .then((result) => result.rows);
}

function createChatMessage({ sender_id, text }) {
    return db
        .query(
            `INSERT INTO chat_messages (sender_id, text) VALUES ($1, $2) RETURNING *`,
            [sender_id, text]
        )
        .then((result) => result.rows[0]);
}

module.exports = {
    createUser,
    getUserById,
    login,
    getUserByEmail,
    createCodePasswordResetting,
    getUserPasswordResetCodeByCode,
    updatePassword,
    updateUserProfilePicture,
    updateUserProfileBio,
    getRecentUsers,
    getSearchUsers,
    deleteFriendship,
    requestFriendship,
    acceptFriendship,
    getFriendshipRequest,
    getFriendships,
    getChatMessages,
    createChatMessage,
};
