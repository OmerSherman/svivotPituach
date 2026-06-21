import { useContext, useEffect, useState } from "react";
import usersService from "../services/usersService";
import UsersList from "../components/usersList";
import SearchBar from "../components/SearchBar";
import TahiniLoader from "../components/TahiniLoader";
import userContext from "../contexts/userContext";
import "./adminPortal.css";

function AdminPortal() {
    const { user } = useContext(userContext);

    const [usersList, setUsersList] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // fetch all users on mount
    useEffect(function() {
        async function fetchUsers() {
            try {
                const data = await usersService.getAll();
                setUsersList(data);
            } catch (err) {
                setError(err.message || "לא ניתן לטעון את רשימת המשתמשים");
            } finally {
                setLoading(false);
            }
        }
        fetchUsers();
    }, []);

    // count users by role for the stats cards at the top
    function countByRole(role) {
        return usersList.filter(function(u) { return u.userRole === role; }).length;
    }

    // client-side filter by name/email/role
    function matchesSearch(u) {
        if (searchTerm.trim() === "") return true;
        const term = searchTerm.trim().toLowerCase();
        if (u.firstName && u.firstName.toLowerCase().includes(term)) return true;
        if (u.lastName && u.lastName.toLowerCase().includes(term)) return true;
        if (u.email && u.email.toLowerCase().includes(term)) return true;
        if (String(u.userId) === term) return true;
        return false;
    }

    const filteredUsers = usersList.filter(matchesSearch);

    return (
        <div className="admin-portal-page">
            <header className="admin-portal-header">
                <h1>ניהול משתמשים</h1>
                <p className="admin-portal-subtitle">
                    שלום {user && user.firstName} · ניהול וצפייה במשתמשי המערכת
                </p>
            </header>

            {/* stats cards - quick overview of the user base */}
            {!loading && !error && (
                <div className="admin-stats">
                    <div className="admin-stat-card">
                        <span className="admin-stat-value">{usersList.length}</span>
                        <span className="admin-stat-label">סה"כ משתמשים</span>
                    </div>
                    <div className="admin-stat-card admin-stat-admin">
                        <span className="admin-stat-value">{countByRole("admin")}</span>
                        <span className="admin-stat-label">אדמינים</span>
                    </div>
                    <div className="admin-stat-card admin-stat-manager">
                        <span className="admin-stat-value">{countByRole("manager")}</span>
                        <span className="admin-stat-label">מנהלים</span>
                    </div>
                    <div className="admin-stat-card admin-stat-user">
                        <span className="admin-stat-value">{countByRole("user")}</span>
                        <span className="admin-stat-label">משתמשים רגילים</span>
                    </div>
                </div>
            )}

            {/* search bar */}
            {!loading && !error && (
                <SearchBar
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="חיפוש לפי שם, אימייל או מזהה..."
                />
            )}

            {searchTerm && !loading && !error && (
                <p className="admin-search-count">
                    נמצאו {filteredUsers.length} מתוך {usersList.length} משתמשים
                </p>
            )}

            {/* loading / error / table */}
            {loading && <TahiniLoader />}

            {error && (
                <div className="admin-error">
                    <p>{error}</p>
                </div>
            )}

            {!loading && !error && filteredUsers.length === 0 && (
                <p className="admin-empty">
                    {searchTerm ? "לא נמצאו משתמשים התואמים לחיפוש." : "אין משתמשים במערכת."}
                </p>
            )}

            {!loading && !error && filteredUsers.length > 0 && (
                <UsersList users={filteredUsers} setUsersList={setUsersList} />
            )}
        </div>
    );
}

export default AdminPortal;
