import { useContext, useEffect, useState } from "react";
import userContext from "../contexts/userContext";
import { useLocation, useNavigate } from "react-router-dom";
import usersService from "../services/usersService";


function AdminPortaluser(){
    const navigate = useNavigate()
    const location = useLocation();
    const passedUser = location.state?.user;
    const [error , setError] = useState("")
    const [currUser , setCurrUser] = useState(passedUser)
    const {user} = useContext(userContext)
    //get the current user 
    const role =user.userRole
    const roleLevels = {
        "user": 0,
        "manager": 1,
        "admin": 2
    };
    const roles= {"admin" : "אדמין", "manager": "מנהל" , "user": "משתמש"}

    const canManageUser = roleLevels[role] > roleLevels[currUser.userRole];

    const handleRoleChange =  async (role) => {
        try{
            const updatedUser = {
                ...currUser, 
                userRole :role
            }
            await usersService.update(currUser.userId , updatedUser)
            setCurrUser(updatedUser) // update the current user
        }
        catch(err){
            console.log(err)

            setError(err.message || `couldn't update to ${role}`)
        }
    }

    const handleDelete = async (id) => {
        try{
            await usersService.del(id)
            navigate("/adminPortal")

        }
        catch(err){
            setError(err.message || `couldn't delete ${id}`)
        }
    }

    const handleGoBack = () => {
        navigate("/adminPortal")
    }

    return (
        <div className="user-profile-container" style={{ padding: "20px", border: "1px solid #ccc", borderRadius: "8px", maxWidth: "500px" }}>
            <h2>פרטי משתמש: {currUser.firstName} {currUser.lastName}</h2>
            
            <div className="user-details" style={{ marginBottom: "20px", lineHeight: "1.6" }}>
                <p><strong>מזהה (ID):</strong> {currUser.userId}</p>
                <p><strong>אימייל:</strong> {currUser.email}</p>
                <p><strong>תפקיד:</strong> {roles[currUser.userRole]}</p>
                <p><strong>תאריך הצטרפות:</strong> {new Date(currUser.createDate).toLocaleDateString("he-IL")}</p>
                <p><strong>תאריך עדכון אחרון:</strong> {new Date(currUser.updateDate).toLocaleDateString("he-IL")}</p>
            </div>

            <div className="actions" style={{ display: "flex", gap: "10px" }}>
                

                    {/*change role to manager*/ }
                {(role === "manager" || role === "admin") && currUser.userRole === "user" && (
                    <button 
                        type = "button"
                        className="btn-role" 
                        onClick={() => handleRoleChange("manager")}
                        style={{ backgroundColor: "#4CAF50", color: "white", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer" }}
                    >
                        הפוך למנג'ר
                    </button>
                )}
                {role === "admin" && currUser.userRole === "manager" && (
                    <button 
                        type = "button"
                        className="btn-role" 
                        onClick={() => handleRoleChange("user")}
                        style={{ backgroundColor: "#4CAF50", color: "white", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer" }}
                    >
                        הפוך למשתמש
                    </button>
                )}
                    {/*change role to admin*/ }
                    {role === "admin" && currUser.userRole !== "admin" && (
                    <button 
                        type = "button"
                        className="btn-role" 
                        onClick={() => handleRoleChange("admin")}
                        style={{ backgroundColor: "#2196F3", color: "white", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer" }}
                    >
                        הפוך לאדמין
                    </button>
                )}
                {/*delete buttom*/}
                {canManageUser &&
                    <button 
                                        type = "button"
                                        className="btn-delete" 
                                        onClick={() => handleDelete(currUser.userId)}
                                        style={{ backgroundColor: "red", color: "white", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer" }}
                                    >
                                        מחק משתמש
                    </button>  
                }              
                {error&&(
                    <p>error</p>
                )}
            </div>
            {
                <button className="btn-back" type="button" onClick={() => handleGoBack()}>חזרה לרשימת המשתמשים</button>
            }

        </div>
    );
      
    

}
export default AdminPortaluser