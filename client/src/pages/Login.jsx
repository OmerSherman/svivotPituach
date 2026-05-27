// {
//             "method": "POST",
//             "url": "http://localhost:3000/api/users/register",
//             "header": [{"key": "Content-Type", "value": "application/json"}],
//             "body": {"mode": "raw", "raw": "{\n  \"firstName\": \"dana\",\n  \"lastName\": \"levi\",\n  \"email\": \"dana@example.com\",\n  \"password\": \"1234\"\n}"}
//           }
function Register_forum(){

    async function handleSubmit(e) {
        e.preventDefault();
        //get the data of the forum
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        const { first_name, last_name, email, password } = data;
        
        const res = await fetch("http://localhost:3000/api/users/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                "firstName": first_name,
                "lastName": last_name,
                "email": email,
                "password": password
            })
        });
    const data_res = await res.json();
    console.log(data_res);
    }

    return(
        <div class="register forum">
            <forum>
                <label for="title">New Travaler?</label>
                
                <label for="first_name">שם פרטי:</label>
                <input type="text" id="first_name" name="first_name" required/>


                <label for="last_name">שם משפחה:</label>
                <input type="text" id="last_name" name="last_name" required/>

                <label for="email">אימייל (דוא"ל):</label>
                <input type="email" id="email" name="email" required/>

                <label for="password">סיסמה:</label>
                <input type="password" id="password" name="password" required/>

                <button type="submit">שלח</button>
                        

            </forum>
        </div>
    )

}




function Login_page(){



    return(
        <div>
            <Register_forum/>
            
        </div>
    )
}
export default Login_page