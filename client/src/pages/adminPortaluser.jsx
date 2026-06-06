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

    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        firstName: passedUser?.firstName || "",
        lastName: passedUser?.lastName || "",
        email: passedUser?.email || ""
    });

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

    const handleInputChange = (e) => {
        setEditData({
            ...editData,
            [e.target.name]: e.target.value
        });
    };

    const handleSaveChanges = async () => {
        try {
            const updatedUser = {
                ...currUser,
                firstName: editData.firstName,
                lastName: editData.lastName,
                email: editData.email
            };
            
            await usersService.update(currUser.userId, updatedUser);
            setCurrUser(updatedUser);
            setIsEditing(false); 
            
        } catch (err) {
            console.log(err);
            setError(err.message || "Failed to save changes");
        }
    };

    const cancelEditing = () => {
        setEditData({
            firstName: currUser.firstName,
            lastName: currUser.lastName,
            email: currUser.email
        });
        setIsEditing(false);
    };

    return (
        <div className="user-profile-container" style={{ padding: "20px", border: "1px solid #ccc", borderRadius: "8px", maxWidth: "500px" }}>
            <h2>פרטי משתמש: {currUser.firstName} {currUser.lastName}</h2>
            
            <div className="user-details" style={{ marginBottom: "20px", lineHeight: "1.6" }}>
                <p><strong>מזהה (ID):</strong> {currUser.userId}</p>
                {isEditing ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "15px" }}>
                        <label>
                            <strong>שם פרטי:</strong>
                            <input 
                                type="text" 
                                name="firstName" 
                                value={editData.firstName} 
                                onChange={handleInputChange} 
                                style={{ marginLeft: "10px" }}
                            />
                        </label>
                        <label>
                            <strong>שם משפחה:</strong>
                            <input 
                                type="text" 
                                name="lastName" 
                                value={editData.lastName} 
                                onChange={handleInputChange} 
                                style={{ marginLeft: "10px" }}
                            />
                        </label>
                        <label>
                            <strong>אימייל:</strong>
                            <input 
                                type="email" 
                                name="email" 
                                value={editData.email} 
                                onChange={handleInputChange} 
                                style={{ marginLeft: "10px" }}
                            />
                        </label>
                    </div>
                ) : (
                    <>
                        <p><strong>אימייל:</strong> {currUser.email}</p>
                    </>
                )}
                <p><strong>אימייל:</strong> {currUser.email}</p>
                <p><strong>תפקיד:</strong> {currUser.userRole === "admin" ? "מנהל" : "משתמש רגיל"}</p>
                <p><strong>תאריך הצטרפות:</strong> {new Date(currUser.createDate).toLocaleDateString("he-IL")}</p>
                <p><strong>תאריך עדכון אחרון:</strong> {new Date(currUser.updateDate).toLocaleDateString("he-IL")}</p>
            </div>

            <div className="actions" style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "15px" }}>
                
                {isEditing ? (
                    <>
                        <button 
                            type="button" 
                            onClick={handleSaveChanges} 
                            style={{ backgroundColor: "#4CAF50", color: "white", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer" }}
                        >
                            שמור שינויים
                        </button>
                        <button 
                            type="button" 
                            onClick={cancelEditing} 
                            style={{ backgroundColor: "#ccc", color: "black", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer" }}
                        >
                            ביטול
                        </button>
                    </>
                ) : (
                    canManageUser && (
                        <button 
                            type="button" 
                            onClick={() => setIsEditing(true)} 
                            style={{ backgroundColor: "#ff9800", color: "white", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer" }}
                        >
                            ערוך פרטים
                        </button>
                    )
                )}

                {!isEditing && (role === "manager" || role === "admin") && currUser.userRole === "user" && (
                    <button 
                        type="button"
                        className="btn-role" 
                        onClick={() => handleRoleChange("manager")}
                        style={{ backgroundColor: "#4CAF50", color: "white", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer" }}
                    >
                        הפוך למנג'ר
                    </button>
                )}
                
                {!isEditing && role === "admin" && currUser.userRole === "manager" && (
                    <button 
                        type="button"
                        className="btn-role" 
                        onClick={() => handleRoleChange("user")}
                        style={{ backgroundColor: "#4CAF50", color: "white", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer" }}
                    >
                        הפוך למשתמש
                    </button>
                )}
                
                {!isEditing && role === "admin" && currUser.userRole !== "admin" && (
                    <button 
                        type="button"
                        className="btn-role" 
                        onClick={() => handleRoleChange("admin")}
                        style={{ backgroundColor: "#2196F3", color: "white", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer" }}
                    >
                        הפוך לאדמין
                    </button>
                )}

                {!isEditing && canManageUser && (
                    <button 
                        type="button"
                        className="btn-delete" 
                        onClick={() => handleDelete(currUser.userId)}
                        style={{ backgroundColor: "red", color: "white", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer" }}
                    >
                        מחק משתמש
                    </button>  
                )}              
            </div>

            {error && <p style={{ color: "red" }}>{error}</p>}
            
            <button className="btn-back" type="button" onClick={handleGoBack}>חזרה לרשימת המשתמשים</button>

        </div>
    );
}                

export default AdminPortaluser