// temporary login form for testing - real version coming on the login branch

import authService from "../services/authService";
import Form from "../components/Form.jsx"

function Login(){
    const loginConfig = {
        title: "Login",
        fields:[
            {
                "label":"email",
                "name":"email",
                "type":"email",
                "required": true

            },
            {
                "label": "password",
                "name": "password",
                "type": "password",
                "required": true
            }

        ],
        onSubmit : async (formData)=> {
            await authService.login(formData.email, formData.password)
        },
        navigate: "/" 
    }
    const registerConfig = {
        title: "Register",
        fields:[
            {
                "label":"email",
                "name":"email",
                "type":"email",
                "required": true
            },
            {
                "label": "password",
                "name": "password",
                "type": "password",
                "required": true

            },
            {
                "label": "First name",
                "name": "firstName",
                "type": "text",
                "required": true

            },
            {
                "label": "Last name",
                "name": "lastName",
                "type": "text",
                "required": true
            }
        ]    
    }
    return(
        <div>
            <Form configForm={loginConfig} />
        
            <Form configForm={registerConfig}/>
        </div>
    )
}
export default Login;
