import { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";


//component for form field
function FormField(  props ) {
    const [value, setValue] = useState("");

    return (
        <div>
            <label>{props.label}</label>
            <input 
                type={props.type} 
                name={props.name}
                value={value}
                onChange={(e) => setValue(e.target.value)} 
                required = {props.required}
            />
        </div>
    );
}

function Form({configForm}){
    const fields = configForm.fields
    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState("");
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const formData = new FormData(e.target);
            const dataToSubmit = Object.fromEntries(formData.entries());
            
            await configForm.onSubmit(dataToSubmit);
            configForm.navigate && navigate(configForm.navigate); 
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
            <div style={{ maxWidth: 380, margin: "60px auto", padding: 24,
                        background: "#fff", borderRadius: 12,
                        border: "1px solid #e0e0e0" }}>
                <h1 style={{ marginTop: 0 }}>{configForm.title}</h1>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {
                        fields.map(field => (
                            <FormField label ={field.label} name={field.name} type={field.type} required={field.required}/>
                        ))
                    }
                    
                    {error && <p style={{ color: "#a32525" }}>{error}</p>}

                    <button type="submit" disabled={loading}
                            style={{ padding: 10, background: "#3b4cca", color: "#fff",
                                    border: "none", borderRadius: 8, cursor: "pointer" }}>
                        {loading ? "מתחבר..." : "התחבר"}
                    </button>
                </form>
            </div>
        );
}
export default Form;