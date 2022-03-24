import { useState, useEffect, useRef } from "react";

import io from "socket.io-client";

function formatDate(timestamp) {
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()} @ ${date.toLocaleTimeString()}`;
}

let socket;
export default function ChatTogether() {
    const [messages, setMessages] = useState([]);
    const lastMessageRef = useRef(null);
    const inputRef = useRef(null);
    const [myId, setMyId] = useState(null);
    const [usersOnline, setUsersOnline] = useState([]);

    useEffect(() => {
        if (!socket) {
            socket = io.connect();
        }
        inputRef.current.focus();
        socket.on("userIdON", (user_id) => {
            console.log("I am online userID: ", user_id);
            setMyId(user_id);
        });
        socket.on("recentChats", (messages) => {
            console.log(messages);

            setMessages(messages.reverse());
        });

        socket.on("onlineUsers", (users_data) => {
            const users = users_data.filter((x) => !!x);
            setUsersOnline(users);
        });

        return () => {
            socket.off("recentMessages");
            socket.disconnect();
            socket = null;
        };
    }, []);

    function onSubmit(event) {
        event.preventDefault();
        socket.emit("sendMessage", event.target.text.value);
        event.target.text.value = "";
    }

    useEffect(() => {
        if (!lastMessageRef.current) {
            return;
        }
        socket.on("newMessage", (newMessage) => {
            console.log(newMessage);
            setMessages([...messages, newMessage]);

            inputRef.current.focus();
            lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
        });
        return () => {
            /*socket.off("newMessage");*/
        };
    }, [messages]);

    useEffect(() => {}, []);

    return (
        <section className="chat">
            <div className="online-users">
                Online Users:
                <ul className="list-online-persons">
                    {usersOnline.map((user) => {
                        return (
                            <li key={user.id}>
                                <img
                                    src={user.profile_picture_url}
                                    width="80px"
                                    height="80px"
                                />
                                {user.fname} {user.sname}
                            </li>
                        );
                    })}
                </ul>
            </div>
            <div className="chat-online">
                <div>
                    <h2>Chat</h2>
                    {messages.length ? (
                        <ul className="chat-messages">
                            {messages.map((message) => (
                                <li
                                    className={
                                        message.sender_id == myId
                                            ? "mymessage"
                                            : ""
                                    }
                                    key={message.id}
                                    ref={lastMessageRef}
                                >
                                    <div className="chat-intro">
                                        <img
                                            src={message.profile_picture_url}
                                            width="50px"
                                            height="50px"
                                        />
                                        {message.fname} {message.sname} at
                                        {" " +
                                            formatDate(message.created_at)}{" "}
                                        wrote:{" "}
                                    </div>
                                    <div className="chat-text">
                                        {message.text}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="chat-placeholder">
                            It is very silent here.
                        </div>
                    )}
                </div>
                <div>
                    <form
                        className="form-submit-chat"
                        onSubmit={onSubmit}
                        autoComplete="off"
                    >
                        <input
                            ref={inputRef}
                            name="text"
                            required
                            placeholder="Type something..."
                        />
                        <button className="btn-2">Send</button>
                    </form>
                </div>
            </div>
        </section>
    );
}
