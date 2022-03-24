import { useState } from "react";

import { useFormFields } from "../Hooks/useFormFields.js";
import { useFetchCall } from "../Hooks/useFetchCall.js";
import { useTitle } from "../Hooks/useTitle.js";
import { Link } from "react-router-dom";

export function FindPeople() {
    useTitle("Find people");
    const [searchUsers, setSearchUsers] = useState([]);
    const [textToShow, setTextToShow] = useState("");

    const { inputValues, onInput } = useFormFields();
    const lastUsers = useFetchCall("/api/users/recent");

    function onSubmit(event) {
        event.preventDefault();
        const query = Object.keys(inputValues)[0];
        const q = inputValues[query];

        fetch("/api/users/search?q=" + q)
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                setTextToShow("No results");
                setSearchUsers(data);
            });
    }

    return (
        <div className="find-people">
            <section className="list-last-people">
                <h2>Recent users</h2>
                <ul>
                    {lastUsers.map((user) => {
                        return (
                            <li key={user.id}>
                                <div className="each-user">
                                    <img src={user.profile_picture_url} />
                                    {user.fname} {user.sname}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </section>
            <section className="list-search-people">
                <h2>Look for people</h2>
                <form className="logoutexp-form" onSubmit={onSubmit}>
                    <input
                        type="search"
                        name="q"
                        required
                        minLength={3}
                        placeholder="Search users..."
                        onInput={onInput}
                    />
                    <button type="submit"> Submit</button>
                </form>
                {searchUsers.length ? (
                    <ul>
                        {searchUsers.map((user) => {
                            return (
                                <li key={user.id}>
                                    <Link
                                        to={`/users/${user.id}`}
                                        className="user"
                                    >
                                        <div className="each-user">
                                            <img
                                                src={user.profile_picture_url}
                                            />
                                            {user.fname} {user.sname}
                                        </div>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <p> {textToShow} </p>
                )}
            </section>
        </div>
    );
}
