import { useState, useEffect } from "react";

export function useFetchCall(url) {
    const [variable, setVariable] = useState([]);
    useEffect(() => {
        fetch(url, {})
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                if (data.error_message) {
                    console.log(data.error_message);
                    history.replaceState("/");
                    return;
                }
                setVariable(data);
            });
    }, []);
    return variable;
}
