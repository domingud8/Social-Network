import React from "react";

export default class RegisterForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            fname: "",
            sname: "",
            email: "",
            password: "",
            error: "",
        };
        this.onSubmit = this.onSubmit.bind(this);
        this.onInput = this.onInput.bind(this);
    }
    onSubmit(event) {
        event.preventDefault();
        fetch("/api/users/", {
            method: "POST",
            body: JSON.stringify(this.state),
            headers: { "Content-Type": "application/json" },
        })
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                if (data.error_message) {
                    this.setState({ error: data.error_message });
                    return;
                }
                window.location.href = "/";
            });
    }
    onInput(event) {
        this.setState({ [event.target.name]: event.target.value });
    }
    render() {
        return (
            <div>
                <form className="logoutexp-form" onSubmit={this.onSubmit}>
                    <input
                        type="text"
                        name="fname"
                        required
                        placeholder="First name"
                        onInput={this.onInput}
                    />
                    <input
                        type="text"
                        name="sname"
                        required
                        placeholder="Second name"
                        onInput={this.onInput}
                    />
                    <input
                        type="email"
                        name="email"
                        required
                        placeholder="Email"
                        onInput={this.onInput}
                    />
                    <input
                        type="password"
                        name="password"
                        required
                        placeholder="Password"
                        onInput={this.onInput}
                    />
                    <button type="submit">Register</button>
                    {this.state.error && (
                        <p className="error-text"> {this.state.error} </p>
                    )}
                </form>
            </div>
        );
    }
}
