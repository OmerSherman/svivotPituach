import { useNavigate } from "react-router-dom";
import "./usersList.css";

// hebrew labels for the role badges
const ROLE_LABELS = { admin: "אדמין", manager: "מנהל", user: "משתמש" };

function UsersList({ users }) {
    const navigate = useNavigate();

    // navigate to the user's profile page with the user object passed via state
    function handleRowClick(user) {
        navigate("/adminPortaluser", { state: { user: user } });
    }

    // format a date as dd/mm/yyyy in hebrew locale
    function formatDate(iso) {
        if (!iso) return "—";
        try {
            return new Date(iso).toLocaleDateString("he-IL");
        } catch (err) {
            return "—";
        }
    }

    // role badge with color matching the role
    function roleBadge(role) {
        const label = ROLE_LABELS[role] || role;
        const cls = "ul-badge ul-badge-" + (role || "user");
        return <span className={cls}>{label}</span>;
    }

    return (
        <div className="ul-wrapper">
            <table className="ul-table">
                <thead>
                    <tr>
                        <th>מזהה</th>
                        <th>שם מלא</th>
                        <th>אימייל</th>
                        <th>תפקיד</th>
                        <th>תאריך הצטרפות</th>
                        <th>עדכון אחרון</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(function(user) {
                        return (
                            <tr
                                key={user.userId}
                                onClick={function() { handleRowClick(user); }}
                                className="ul-row"
                            >
                                <td className="ul-id">#{user.userId}</td>
                                <td className="ul-name">{user.firstName} {user.lastName}</td>
                                <td className="ul-email">{user.email}</td>
                                <td>{roleBadge(user.userRole)}</td>
                                <td className="ul-date">{formatDate(user.createDate)}</td>
                                <td className="ul-date">{formatDate(user.updateDate)}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export default UsersList;
