import RegisterForm from "./Logout/Register";
import LoginForm from "./Logout/Login";
import { BrowserRouter, Route, Link } from "react-router-dom";
import ResetPassword from "./Logout/Password";

export default function Welcome() {
    return (
        <div className="welcome">
            <header>
                <h1>
                    Welcome to a social network for connecting during your
                    coffee breaks
                </h1>
            </header>
            <BrowserRouter>
                <Route path="/" exact>
                    <RegisterForm />

                    <Link to="/login">
                        <div className="links">
                            Already registered? Login now!
                        </div>
                    </Link>
                </Route>
                <Route path="/login" exact>
                    <LoginForm />

                    <Link to="/">
                        <div className="links">
                            Not Having an account? Register Now!
                        </div>
                    </Link>
                    <Link to="/reset-password">
                        <div className="links">Forgot Password? </div>
                    </Link>
                </Route>
                <Route path="/reset-password" exact>
                    <ResetPassword />
                    <Link to="/login">
                        {" "}
                        <div className="links"> Come back to login</div>
                    </Link>
                </Route>
            </BrowserRouter>
        </div>
    );
}
