import React from "react";
import "../style.css";
import { BrowserRouter, NavLink, Switch, Route } from "react-router-dom";

import { ProfileBio } from "./Login/Bio";
import { FormPictureModal } from "./Login/ProfilePictureModal.js";
import { ProfilePicture } from "./Login/ProfilePicture.js";
import { FindPeople } from "./Login/FindPeople.js";

import { OtherUserProfile } from "./Login/OtherUserProfile.js";
import Friends from "./Login/Friends.js";
import ChatTogether from "./Login/ChatTogether.js";
export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            profile_picture_url: "",
            fname: "",
            sname: "",
            bio: "",
        };
        this.onFormSubmit = this.onFormSubmit.bind(this);
        this.toggleClassVisible = this.toggleClassVisible.bind(this);
        this.onSaveBio = this.onSaveBio.bind(this);
    }
    componentDidMount() {
        fetch("/api/users/me")
            .then((response) => response.json())
            .then((user) => {
                this.setState(user);
            });
    }
    onSaveBio(bio_text) {
        console.log(bio_text);
        this.setState({ bio: bio_text });
    }
    toggleClassVisible() {
        console.log("onClick");
        const currentstate = this.state.visible;
        this.setState({ visible: !currentstate });
    }
    onFormSubmit(profile_picture_url) {
        const currentstate = this.state.visible;
        this.setState({
            profile_picture_url: profile_picture_url,
            visible: !currentstate,
        });
    }
    render() {
        return (
            <BrowserRouter>
                <div className="app-login-experience">
                    <header>
                        <img src="./cookies.png" />
                        <nav>
                            <NavLink exact to="/">
                                Your Profile
                            </NavLink>
                            <NavLink exact to="/users">
                                Find People
                            </NavLink>
                            <NavLink exact to="/friends">
                                Friends
                            </NavLink>
                            <NavLink exact to="/chat">
                                Chat
                            </NavLink>
                        </nav>
                        <ProfilePicture
                            onClick={this.toggleClassVisible}
                            {...this.state}
                        />
                    </header>
                    <main>
                        <Switch>
                            <Route path="/users" exact>
                                <FindPeople />
                            </Route>
                            <Route path="/users/:id" exact>
                                <OtherUserProfile />
                            </Route>
                            <Route path="/" exact>
                                <ProfileBio
                                    onSaveBio={this.onSaveBio}
                                    fname={this.state.fname}
                                    sname={this.state.sname}
                                    profile_picture_url={
                                        this.state.profile_picture_url
                                    }
                                    bio={this.state.bio}
                                />
                            </Route>
                            <Route path="/friends" exact>
                                <Friends />
                            </Route>
                            <Route path="/chat" exact>
                                <ChatTogether />
                            </Route>
                        </Switch>
                    </main>
                </div>
                <div
                    className={`modal-comp ${
                        this.state.visible ? "visible" : ""
                    }`}
                >
                    <button
                        onClick={this.toggleClassVisible}
                        className="close-button"
                    >
                        &times;
                    </button>
                    <FormPictureModal
                        onSubmitUploadPicture={this.onFormSubmit}
                    />
                </div>
            </BrowserRouter>
        );
    }
}
