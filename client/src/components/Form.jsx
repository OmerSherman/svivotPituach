import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Form.css";

function FormField(props) {
    const [value, setValue] = useState("");

    return (
        <div className="form-field">
            <label>{props.label}</label>
            <input
                type={props.type}
                name={props.name}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                required={props.required}
            />
        </div>
    );
}

function Form({ configForm }) {
    const fields = configForm.fields;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const formData = new FormData(e.target);
            const dataToSubmit = Object.fromEntries(formData.entries());

            await configForm.onSubmit(dataToSubmit);
            // navigate only if config requested it
            if (configForm.navigate) navigate(configForm.navigate);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    // button text from config, with defaults
    const btnText = configForm.buttonText || "שלח";
    const btnLoading = configForm.buttonLoading || "שולח...";

    return (
        <div className="form-card">
            <h1>{configForm.title}</h1>

            <form onSubmit={handleSubmit}>
                {fields.map(function(field) {
                    return (
                        <FormField
                            key={field.name}
                            label={field.label}
                            name={field.name}
                            type={field.type}
                            required={field.required}
                        />
                    );
                })}

                {error && <p className="form-error">{error}</p>}

                <button type="submit" className="form-submit" disabled={loading}>
                    {loading ? btnLoading : btnText}
                </button>
            </form>
        </div>
    );
}

export default Form;
