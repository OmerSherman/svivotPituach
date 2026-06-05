import { useNavigate } from "react-router-dom";
function UsersList({users , setUsersList}){
    const navigate = useNavigate()

    const handleClick = (user) => {
        navigate("/adminPortaluser",  {state : {user: user}}) //navigate to specific user admin portal with state as the user

    }
    const roles= {"admin" : "אדמין", "manager": "מנהל" , "user": "משתמש"}
    

    return (
        <div className="grid-container">
            <table className="data-grid" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr style={{ backgroundColor: "#f4f4f4", textAlign: "left" }}>
                        <th>ID</th>
                        <th>שם מלא (Full Name)</th>
                        <th>אימייל (Email)</th>
                        <th>תפקיד (Role)</th>
                        <th>תאריך הצטרפות (Joined)</th>
                        <th>תאריך עריכה (Last Updated)</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr 
                            key={user.userId} 
                            onClick={() => handleClick(user)}
                            style={{ cursor: "pointer", borderBottom: "1px solid #ddd" }}
                            className="grid-row"
                        >
                            <td>{user.userId}</td>
                            <td>{user.firstName} {user.lastName}</td>
                            <td>{user.email}</td>
                            <td>{roles[user.userRole]}</td>
                            <td>
                                {new Date(user.createDate).toLocaleDateString("he-IL")}
                            </td>
                            {/* התוספת החדשה: שליפת תאריך העדכון ופירמוט שלו */}
                            <td>
                                {new Date(user.updateDate).toLocaleDateString("he-IL")}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default UsersList