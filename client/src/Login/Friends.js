import { useState, useEffect } from "react";

export default function Friends() {
    // having 2 state arrays makes your life easier
    const [wannabes, setWannabes] = useState([]);
    const [friends, setFriends] = useState([]);

    useEffect(() => {
        fetch("/api/friends")
            .then((response) => response.json())
            .then((data) => {
                const data_friends = data.filter((user) => user.accepted);
                const data_wannabes = data.filter((user) => !user.accepted);
                setWannabes(data_wannabes);
                setFriends(data_friends);
            });
    }, []);

    function onAcceptClick(friendship) {
        fetch("/api/friendships/" + friendship.user_id, {
            method: "PUT",
        })
            .then((response) => response.json())
            .then(() => {
                const newWannabes = wannabes.filter(
                    (x) => x.friendship_id !== friendship.friendship_id
                );
                setWannabes(newWannabes);
                const newFriends = [
                    wannabes.find((x) => x.user_id === friendship.user_id),
                    ...friends,
                ];
                setFriends(newFriends);
            });
    }

    function onUnfriendClick(friendship) {
        fetch("/api/friendships/" + friendship.user_id, {
            method: "DELETE",
        })
            .then((response) => response.json())
            .then(() => {
                const newFriends = friends.filter(
                    (x) => x.friendship_id !== friendship.friendship_id
                );
                setFriends(newFriends);
            });
    }

    return (
        <section className="friends-container">
            <section className="wannabes-section">
                <h3>Wannabes</h3>
                <ul className="list-wannables">
                    {wannabes.map((x) => (
                        <li key={x.friendship_id}>
                            <img
                                src={x.profile_picture_url}
                                width="100px"
                                height="100px"
                            />
                            {x.fname} {x.sname}
                            <button
                                className="btn-2"
                                onClick={() => {
                                    onAcceptClick(x);
                                }}
                            >
                                Accept
                            </button>
                        </li>
                    ))}
                </ul>
            </section>
            <section className="friends-section">
                <h3>Friends</h3>
                <ul className="list-friends">
                    {friends.map((x) => (
                        <li key={x.friendship_id}>
                            <img
                                src={x.profile_picture_url}
                                width="100px"
                                height="100px"
                            />
                            {x.fname} {x.sname}
                            <button
                                className="btn-2"
                                onClick={() => {
                                    onUnfriendClick(x);
                                }}
                            >
                                Unfriend
                            </button>
                        </li>
                    ))}
                </ul>
            </section>
        </section>
    );
}
