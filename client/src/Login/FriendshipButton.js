import { useState, useEffect } from "react";

export function FriendshipButton({ id }) {
    const [buttonText, setButtonText] = useState("");
    const [existing, setExisting] = useState(false);
    const [incoming, setIncoming] = useState(false);
    const [accepted, setAccepted] = useState(false);

    // decide what's in the initial state
    useEffect(() => {
        fetch("/api/friendships/" + id)
            .then((response) => response.json())
            .then((data) => {
                if (data.error_message) {
                    setExisting(false);
                    setIncoming(false);
                    setAccepted(false);
                    return;
                }
                setExisting(true);
                setIncoming(id == data.sender_id);
                setAccepted(data.accepted);
            });
    }, [id]);

    useEffect(() => {
        if (!existing) {
            setButtonText("Send friend request");
            return;
        }
        if (accepted) {
            setButtonText("Unfriend");
            return;
        }
        if (incoming) {
            setButtonText("Accept Friend");
            return;
        }
        setButtonText("Cancel request");
    }, [existing, incoming, accepted]);

    function onClick() {
        if (!existing) {
            fetch("/api/friendships/" + id, { method: "POST" })
                .then((response) => response.json())
                .then(() => {
                    setExisting(true);
                });
            return;
        }
        if (incoming && !accepted) {
            fetch("/api/friendships/" + id, { method: "PUT" })
                .then((response) => response.json())
                .then(() => {
                    setAccepted(true);
                });
            return;
        }
        fetch("/api/friendships/" + id, { method: "DELETE" })
            .then((response) => response.json())
            .then(() => {
                setExisting(false);
                setAccepted(false);
                setIncoming(false);
            });
    }

    return (
        <button className="action btn" onClick={onClick}>
            {buttonText}
        </button>
    );
}
