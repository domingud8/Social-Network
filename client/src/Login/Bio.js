import React from "react";

class BioEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isEditing: false,
        };
        this.toggleEdit = this.toggleEdit.bind(this);
        this.onFormSubmit = this.onFormSubmit.bind(this);
    }
    toggleEdit() {
        this.setState({
            isEditing: !this.state.isEditing,
        });
    }
    onFormSubmit(event) {
        event.preventDefault();
        const bio = event.target.bio.value;
        fetch("/api/users/me/bio", {
            method: "POST",
            body: JSON.stringify({ bio }),
            headers: { "Content-Type": "application/json" },
        })
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                if (data.error_message) {
                    console.log(data.error_message);
                    alert("Error updating bio");
                    return;
                }
                this.toggleEdit();
                this.props.onSaveBio(event.target.bio.value);
            });
    }
    render() {
        return (
            <div className="bio-editor">
                {this.state.isEditing ? (
                    <div className="edit-mode">
                        <form
                            className="form-edit-mode"
                            onSubmit={this.onFormSubmit}
                        >
                            <textarea
                                defaultValue={this.props.bio}
                                required
                                name="bio"
                            />
                            <div className="buttons-form-edit-mode">
                                <button className="btn" type="submit">
                                    Save bio
                                </button>
                                <button
                                    className="btn"
                                    onClick={this.toggleEdit}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="display-mode">
                        <p> A bit about me: </p>
                        <div className="about-bio">
                            <p>{this.props.bio}</p>
                        </div>

                        <button className="btn" onClick={this.toggleEdit}>
                            Edit bio
                        </button>
                    </div>
                )}
            </div>
        );
    }
}

export function ProfileBio({
    onSaveBio,
    profile_picture_url,
    fname,
    sname,
    bio,
}) {
    return (
        <div className="profile-wrapper">
            <div className="welcome">
                <h2>
                    Welcome to "Coffee & Cookies" {fname} {sname}!!
                </h2>
                <p> Edit your public profile here.</p>
            </div>
            <div className="img-profile">
                {profile_picture_url && <img src={profile_picture_url} />}
            </div>
            <div className="bio-profile">
                <BioEditor onSaveBio={onSaveBio} bio={bio} />
            </div>
        </div>
    );
}
