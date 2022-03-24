import ReactDOM from "react-dom";

import Welcome from "./Welcome";
import App from "./App";

fetch("/api/users/me")
    .then((response) => response.json())
    .then((user) => {
        if (!user) {
            ReactDOM.render(<Welcome />, document.querySelector("main"));
            return;
        }
        ReactDOM.render(
            <div>
                <App />
            </div>,
            document.querySelector("main")
        );
    });
