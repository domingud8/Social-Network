import React from "react";

export default class ResetPassword extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            step: 1,
            error: null,
            message: null,
        };
        this.onStepOneSubmit = this.onStepOneSubmit.bind(this);
        this.onStepTwoSubmit = this.onStepTwoSubmit.bind(this);
        this.goNext = this.goNext.bind(this);
    }
    goNext(event) {
        event.preventDefault();
        this.setState({ step: 2 });
    }
    onStepOneSubmit(event) {
        event.preventDefault();
        console.log("step one submit", event.target.email.value);
        const email = event.target.email.value;
        fetch("/api/password/reset", {
            method: "POST",
            body: JSON.stringify({ email }),
            headers: { "Content-Type": "application/json" },
        })
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                console.log(data);
                if (data.error_message) {
                    this.setState({
                        error: data.error_message,
                    });
                    return;
                }
                this.setState({ message: data.message });
            });
    }
    onStepTwoSubmit(event) {
        event.preventDefault();
        const password = event.target.password.value;
        const code = event.target.code.value;
        fetch("/api/password/reset", {
            method: "PUT",
            body: JSON.stringify({ code, password }),
            headers: { "Content-Type": "application/json" },
        })
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                console.log(data);
                if (data.error_message) {
                    this.setState({ error: data.error_message });
                    return;
                }
                this.setState({ message: data.message });
                this.setState({ step: 3 });
            });
    }
    renderStepOne() {
        return (
            <div>
                <h3> Please enter your email address </h3>
                <form
                    className="logoutexp-form"
                    onSubmit={this.onStepOneSubmit}
                >
                    <input
                        name="email"
                        type="email"
                        required
                        placeholder="Email"
                    />
                    <button type="submit">Send</button>
                </form>
                {this.state.message && (
                    <form className="logoutexp-form" onSubmit={this.goNext}>
                        <button>Next</button>
                    </form>
                )}
            </div>
        );
    }
    renderStepTwo() {
        return (
            <div>
                <h2>
                    Please enter your new password and the verification code
                </h2>
                <form
                    className="logoutexp-form"
                    onSubmit={this.onStepTwoSubmit}
                >
                    <input name="password" type="password" required />
                    <input
                        name="code"
                        type="text"
                        required
                        placeholder="your code"
                    />
                    <button type="submit">Submit</button>
                </form>
                {this.state.error && <p>{this.state.error}</p>}
            </div>
        );
    }
    renderStepThree() {
        return (
            <div>
                <h2> {this.state.message && <p>{this.state.message}</p>} </h2>
            </div>
        );
    }
    renderStep() {
        if (this.state.step === 1) {
            return this.renderStepOne();
        }
        if (this.state.step === 2) {
            return this.renderStepTwo();
        }
        if (this.state.step === 3) {
            return this.renderStepThree();
        }
    }
    render() {
        return (
            <div>
                <h2> Reset Pasword </h2>
                {this.renderStep()}
                {this.state.error && <p> {this.state.error} </p>}
                {this.state.message && <p> {this.state.message} </p>}
            </div>
        );
    }
}
