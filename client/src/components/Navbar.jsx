import { useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../services/authService";
import usersService from "../services/usersService";
import logo from "../assets/logo-transparent.svg";
import "./Navbar.css";
import userContext from "../contexts/userContext";

function Navbar() {
    const navigate = useNavigate();
    const { user, setUser } = useContext(userContext);

    // refresh user info from server (assignment requires GET /api/users/me)
    useEffect(() => {
        async function fetchMe() {
            if (!user) return; // not logged in, skip
            try {
                const fresh = await usersService.getMe();
                setUser(fresh);
            } catch (err) {
                console.warn("could not refresh user info:", err.message);
            }
        }
        fetchMe();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function handleLogout() {
        await authService.logout();
        setUser(null);
        localStorage.removeItem("user");
        navigate("/login");
    }

    return (
        <nav className="navbar">
            <div className="navbar-logo">
                <img src={logo} alt="שביל הטחינה" />
                <span>שביל הטחינה</span>
            </div>
            <div className="navbar-links">
                {user ? (
                    <>
                        <Link to="/">הטיולים שלי</Link>
                        <Link to="/settings">הגדרות</Link>
                        {(user.userRole === "admin" || user.userRole === "maneger") && (
                            <Link to="adminPortal">ניהול</Link>
                        )}
                        <span className="navbar-user">שלום, {user.firstName}</span>
                        <button className="navbar-logout" onClick={handleLogout}>התנתק</button>
                    </>
                ) : (
                    <Link to="/login">התחברות</Link>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
