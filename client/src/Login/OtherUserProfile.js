import { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { useTitle } from "../Hooks/useTitle.js";
import { FriendshipButton } from "./FriendshipButton.js";

export function OtherUserProfile() {
    const { id } = useParams();
    const [user, setUser] = useState({});
    const history = useHistory();

    useEffect(() => {
        fetch("/api/users/" + id)
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                if (data.error_message) {
                    history.replace("/");
                } else {
                    setUser(data);
                }
            });
    }, [id]);
    const title = "Profile " + user.fname;
    useTitle(title);
    return (
        <div className="other_profile">
            <div className="each-user-d">
                <img src={user.profile_picture_url} />
                <FriendshipButton id={id} />
            </div>
            <div>
                {user.fname} {user.sname} <br />
            </div>
            <div>
                {user.bio} <br />{" "}
            </div>
            <p> Joined us on: {user.created_at}</p>
        </div>
    );
}
