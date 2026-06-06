import { useNavigate } from "react-router-dom";
import "./UsersList.css"; 

function UsersList({ users, setUsersList }) {
    const navigate = useNavigate();

    const handleClick = (user) => {
        navigate("/adminPortaluser", { state: { user: user } });
    };
    
    const roles = { admin: "אדמין", manager: "מנהל", user: "משתמש" };

    return (
        <div className="grid-container">
            <table className="data-grid">
                <thead>
                    <tr>
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
                            className="grid-row"
                        >
                            <td>{user.userId}</td>
                            <td>{user.firstName} {user.lastName}</td>
                            <td>{user.email}</td>
                            <td>{roles[user.userRole]}</td>
                            <td>
                                {new Date(user.createDate).toLocaleDateString("he-IL")}
                            </td>
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

export default UsersList;