import authService from "../services/authService";
import Form from "../components/Form.jsx"

function Login() {
    const loginConfig = {
        title: "התחברות",
        buttonText: "התחבר",
        buttonLoading: "מתחבר...",
        fields: [
            { label: "אימייל",  name: "email",    type: "email",    required: true },
            { label: "סיסמה",   name: "password", type: "password", required: true }
        ],
        onSubmit: async (formData) => {
            await authService.login(formData.email, formData.password);
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
            await authService.register(formData.firstName, formData.lastName, formData.email, formData.password);
        },
        navigate: "/login"
    };

    return (
        <div>
            <Form configForm={loginConfig} />
            <Form configForm={registerConfig} />
        </div>
    )
}
export default Login;
