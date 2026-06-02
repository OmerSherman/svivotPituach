import authService from "../services/authService";
import Form from "../components/Form.jsx"
import { useState } from "react";
import userContext from "../contexts/userContext";
import { useContext } from "react";
function Login() {
    const {user , setUser} = useContext(userContext)

    const loginConfig = {
        title: "התחברות",
        buttonText: "התחבר",
        buttonLoading: "מתחבר...",
        fields: [
            { label: "אימייל",  name: "email",    type: "email",    required: true },
            { label: "סיסמה",   name: "password", type: "password", required: true }
        ],
        onSubmit: async (formData) => {
            try{
                const user = await authService.login(formData.email, formData.password);
                setUser(user) 
            }
            catch{

            }
            
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
    const [isLogin , setform] = useState(true)

    return (
        <div>
            {isLogin ?( 
                <div>
                    <Form configForm={loginConfig}/>
                    <button onClick={()=> setform(!isLogin)}>מטייל חדש?</button>
                </div>
            ):(
                <div>
                    <Form configForm={registerConfig }/>
                    <button onClick={()=> setform(!isLogin)}>כבר יש לך משתמש?</button>
                </div>
            )
            }
        </div>
    )
}
export default Login;
