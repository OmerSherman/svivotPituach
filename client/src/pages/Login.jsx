import { useContext, useState } from "react";
import authService from "../services/authService";
import Form from "../components/Form.jsx";
import userContext from "../contexts/userContext";
import logo from "../assets/logo.svg";
import "./Login.css";

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
            // after register, switch back to login form
            setForm(true);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                {/* logo + title at the top */}
                <div className="login-brand">
                    <img src={logo} alt="שביל הטחינה" className="login-logo"/>
                    <h2 className="login-tagline">שביל הטחינה</h2>
                    <p className="login-subtitle">המדריך שלך לדרום אמריקה</p>
                </div>

                {isLogin ? (
                    <>
                        <Form configForm={loginConfig} />
                        <button className="login-toggle" onClick={() => setForm(false)}>
                            מטייל חדש? הירשם כאן
                        </button>
                    </>
                ) : (
                    <>
                        <Form configForm={registerConfig} />
                        <button className="login-toggle" onClick={() => setForm(true)}>
                            כבר יש לך משתמש? התחבר
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default Login;
