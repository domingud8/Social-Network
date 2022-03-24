const express = require("express");
const app = express();
const cookieSession = require("cookie-session");
const compression = require("compression");
const path = require("path");
const { uploader } = require("./uploader");
const { Bucket, s3upload } = require("./s3");
const {
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
} = require("./db");
const cryptoRandomString = require("crypto-random-string");

app.use(compression());

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const cookieSessionMiddleware = cookieSession({
    secret: `I'm always angry.`,
    maxAge: 1000 * 60 * 60 * 24 * 14,
});
app.use(cookieSessionMiddleware);

app.use(express.static(path.join(__dirname, "..", "client", "public")));

app.get("/api/users/me", (request, response) => {
    if (!request.session.user_id) {
        response.json(null);
        return;
    }
    getUserById(request.session.user_id)
        .then((user) => {
            response.json(user);
        })
        .catch((error) => {
            console.log("[error register]", error);
            response
                .status(500)
                .json({ error_message: "Error by registering" });
        });
});

app.post("/api/users/", (request, response) => {
    const { email, password, fname, sname } = request.body;
    if (!email || !password || !fname || !sname) {
        response
            .status(400)
            .json({ error_message: "Please, fill out all the fields!" });
        return;
    }
    createUser(request.body)
        .then((user) => {
            request.session.user_id = user.id;
            response.json(user);
        })
        .catch((error) => {
            if (error.constraint === "users_email_key") {
                response
                    .status(400)
                    .json({ error_message: "This email is already used" });
                return;
            }
            response.status(500).json({ error_message: "Error creating user" });
        });
});

app.post("/api/login/", (request, response) => {
    const { email, password } = request.body;
    if (!email || !password) {
        response
            .status(400)
            .json({ error_message: "Please, missing credentials for login!" });
        return;
    }
    login(request.body)
        .then((user) => {
            if (!user) {
                response
                    .status(401)
                    .json({ error_message: "Wrong credentials" });
                return;
            }
            request.session.user_id = user.id;
            response.status(200).json(user);
        })
        .catch((error) => {
            console.log("[error handling post login", error);
            response.status(500).json({ error_message: "Error while log in" });
        });
});

app.post("/api/password/reset", (request, response) => {
    const { email } = request.body;
    if (!email) {
        response.status(400).json({ error_message: "Please enter your email" });
        return;
    }
    getUserByEmail(email)
        .then((user) => {
            if (!user) {
                response.status(400).json({ error_message: "Email not found" });
                return;
            }
            console.log("resting password to user", user.email);
            const code = cryptoRandomString({ length: 6 });
            createCodePasswordResetting({ email: user.email, code })
                .then((user_code) => {
                    /////here still need to implement Send Email!
                    console.log("code sent by email", user_code.code);
                    response.json({
                        message: "Verification code was sent to your email",
                    });
                })
                .catch((error) => {
                    console.log("error while password resetting", error);
                    response
                        .status(500)
                        .json({ message_error: "Error by password resetting" });
                });
        })
        .catch((error) => {
            console.log("error", error);
            response
                .status(500)
                .json({ error_message: "Error resetting password" });
        });
});

app.put("/api/password/reset", (request, response) => {
    const { code, password } = request.body;
    if (!code || !password) {
        response
            .status(400)
            .json({ error_message: "Please complete information" });
        return;
    }
    getUserPasswordResetCodeByCode(code)
        .then((user_code) => {
            console.log(user_code);
            if (!user_code) {
                response.status(400).json({ message_error: "Wrong code" });
                return;
            }
            const email = user_code.email;
            updatePassword({ password, email }).then(() =>
                response.json({ message: "Password Updated Successful" })
            );
        })
        .catch((error) => {
            console.log("error while resetting password", error);
            response
                .status(500)
                .json({ error_message: "Error resetting password" });
        });
});

app.post(
    "/api/users/me/picture",
    uploader.single("profile_picture"),
    s3upload,
    (request, response) => {
        const id = request.session.user_id;
        const url = `https://s3.amazonaws.com/${Bucket}/${request.file.filename}`;
        console.log(id, url);
        updateUserProfilePicture({ url, id })
            .then((user) => response.json(user))
            .catch((error) => {
                console.log("error uploading picture", error);
                response
                    .status(500)
                    .json({ error_message: "error uploading profile picture" });
            });
    }
);

app.post("/api/users/me/bio", (request, response) => {
    const id = request.session.user_id;
    const { bio } = request.body;
    updateUserProfileBio({ bio, id })
        .then((user) => response.json(user))
        .catch((error) => {
            console.log("error uploading bio", error);
            response
                .status(500)
                .json({ error_message: "error updating bio profile" });
        });
});

app.get("/api/users/recent", (request, response) => {
    getRecentUsers(request.query).then((users) => response.json(users));
});

app.get("/api/users/search", (request, response) => {
    getSearchUsers(request.query).then((users) => response.json(users));
});

app.get("/api/users/:id", (request, response) => {
    const { id } = request.params;
    console.log("id", id);
    getUserById(id)
        .then((user) => {
            console.log("[user]", user, id);
            if (!user) {
                response.status(404).json({ error_message: "No user id" });
                return;
            }
            response.json(user);
        })
        .catch((error) => {
            console.log("[error register]", error);
            response.status(404).json({ error_message: "User not found" });
        });
});

/*POST Request Friendship */
app.post("/api/friendships/:user_id", (request, response) => {
    requestFriendship({
        sender_id: request.session.user_id,
        recipient_id: request.params.user_id,
    })
        .then((friendship) => response.json(friendship))
        .catch((error) => {
            console.log("error requesting friendship", error);
            response
                .status(500)
                .json({ error_message: "error while requesting friendship" });
        });
});

/*DELETE Delete Friendship */
app.delete("/api/friendships/:user_id", (request, response) => {
    deleteFriendship({
        first_id: request.session.user_id,
        second_id: request.params.user_id,
    })
        .then((removed) => response.json(removed))
        .catch((error) => {
            console.log("error deleting friendship bio", error);
            response
                .status(500)
                .json({ error_message: "error while unfriending" });
        });
});

/*PUT Accept Friendship*/
app.put("/api/friendships/:user_id", (request, response) => {
    acceptFriendship({
        sender_id: request.params.user_id,
        recipient_id: request.session.user_id,
    })
        .then((friendship) => response.json(friendship))
        .catch((error) => {
            console.log("error accepting friendship", error);
            response
                .status(500)
                .json({ error_message: "error while accepting friendship" });
        });
});

/*GET Friendships requests*/
app.get("/api/friendships/:user_id", (request, response) => {
    console.log("here", request.session.user_id, request.params.user_id);
    getFriendshipRequest({
        first_id: request.session.user_id,
        second_id: request.params.user_id,
    })
        .then((friendship) => {
            if (!friendship) {
                response.setStatus(404).response({
                    error_message: "There is no friendship request ongoing yet",
                });
                return;
            }
            response.json(friendship);
        })
        .catch((error) => {
            console.log("error getting friendship", error);
            response.status(500).json({
                error_message: "There is no  friendship request ongoing yet",
            });
        });
});

/*Get all friendships related to an specific user except the ones the user sent but still not accepted*/
app.get("/api/friends", (request, response) => {
    getFriendships({ user_id: request.session.user_id })
        .then((friendships) => {
            if (!friendships.length) {
                response.setStatus(404).response({
                    error_message:
                        "There are no friendships ongoing for the user",
                });
                return;
            }
            response.json(friendships);
        })
        .catch((error) => {
            console.log("error getting friendships", error);
            response.status(500).json({
                error_message: "Error getting friendships for user",
            });
        });
});

app.get("*", function (req, res) {
    res.sendFile(path.join(__dirname, "..", "client", "index.html"));
});

///setup for Chat socket.io
const socketCreator = require("socket.io");
const { Server } = require("http");
const server = Server(app);
const usersOnline = [];
const usersCache = [];

const io = socketCreator(server, {
    allowRequest: (req, callback) =>
        callback(null, req.headers.referer.startsWith("http://localhost:3000")),
});

io.use((socket, next) =>
    cookieSessionMiddleware(socket.request, socket.request.res, next)
);

io.on("connection", async (socket) => {
    console.log("incoming socket connection", socket.id);
    const { user_id } = socket.request.session;

    if (!usersOnline[user_id]) {
        if (!usersCache[user_id]) {
            const user = await getUserById(user_id);
            usersCache[user_id] = user;
        }
        usersOnline[user_id] = usersCache[user_id];
    }

    io.emit("onlineUsers", usersOnline);

    socket.on("disconnect", () => {
        console.log("user disconnected with id: ", socket.id);
        delete usersOnline[user_id];
        console.log("[online] ", usersOnline);
        io.emit("onlineUsers", usersOnline);
    });

    socket.emit("userIdON", user_id);
    const chatMessages = await getChatMessages({ limit: 3 });

    socket.emit("recentChats", chatMessages);

    socket.on("sendMessage", async (text) => {
        const sender = await getUserById(user_id);
        const message = await createChatMessage({
            sender_id: user_id,
            text: text,
        });
        io.emit("newMessage", {
            sender_id: user_id,
            fname: sender.fname,
            sname: sender.sname,
            profile_picture_url: sender.profile_picture_url,
            ...message,
        });
    });
});

server.listen(process.env.PORT || 3001, function () {
    console.log("I'm listening.");
});
