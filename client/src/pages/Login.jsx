import { useContext, useState } from "react";
import authService from "../services/authService";
import Form from "../components/Form.jsx";
import userContext from "../contexts/userContext";

function Login() {
    const { setUser } = useContext(userContext);
    const [isLogin, setForm] = useState(true);

    const loginConfig = {
        title: "התחברות",
        buttonText: "התחבר",
        buttonLoading: "מתחבר...",
        fields: [
            { label: "אימייל",  name: "email",    type: "email",    required: true },
            { label: "סיסמה",   name: "password", type: "password", required: true }
        ],
        onSubmit: async (formData) => {
            // password length check (assignment requires 6+ chars)
            if (!formData.password || formData.password.length < 6) {
                throw new Error("הסיסמה חייבת להיות באורך 6 תווים לפחות");
            }
            const user = await authService.login(formData.email, formData.password);
            setUser(user);
        },
        navigate: "/"
    };

    const registerConfig = {
        title: "הרשמה",
        buttonText: "הירשם",
        buttonLoading: "נרשם...",
        fields: [
            { label: "אימייל",    name: "email",     type: "email",    required: true },
            { label: "סיסמה",     name: "password",  type: "password", required: true },
            { label: "שם פרטי",   name: "firstName", type: "text",     required: true },
            { label: "שם משפחה",  name: "lastName",  type: "text",     required: true }
        ],
        onSubmit: async (formData) => {
            if (!formData.password || formData.password.length < 6) {
                throw new Error("הסיסמה חייבת להיות באורך 6 תווים לפחות");
            }
            await authService.register(formData.firstName, formData.lastName, formData.email, formData.password);
            // after register, switch back to the login form
            setForm(true);
        }
    };

    return (
        <div>
            {isLogin ? (
                <div>
                    <Form configForm={loginConfig} />
                    <button onClick={() => setForm(false)}>מטייל חדש?</button>
                </div>
            ) : (
                <div>
                    <Form configForm={registerConfig} />
                    <button onClick={() => setForm(true)}>כבר יש לך משתמש?</button>
                </div>
            )}
        </div>
    );
}

export default Login;
