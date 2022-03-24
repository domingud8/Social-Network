import { useState } from "react";

export function useFormFields() {
    const [inputValues, setInputValues] = useState({});
    function onInput(event) {
        setInputValues({
            ...inputValues,
            [event.target.name]: event.target.value,
        });
    }
    return { inputValues, onInput };
}
