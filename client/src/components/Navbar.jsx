import { useContext, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import authService from "../services/authService";
import usersService from "../services/usersService";
import userContext from "../contexts/userContext";
import logo from "../assets/logo-transparent.svg";
import "./Navbar.css";

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, setUser } = useContext(userContext);

    // refresh user info from server (assignment requires GET /api/users/me)
    useEffect(() => {
        async function fetchMe() {
            if (!user) return;
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

    // smooth scroll to the my-trips section
    function handleMyTripsClick(e) {
        e.preventDefault();
        if (location.pathname === "/") {
            const el = document.getElementById("my-trips");
            if (el) el.scrollIntoView({ behavior: "smooth" });
        } else {
            navigate("/");
            setTimeout(function() {
                const el = document.getElementById("my-trips");
                if (el) el.scrollIntoView({ behavior: "smooth" });
            }, 100);
        }
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
                        <Link to="/">דף הבית</Link>
                        <Link to="/#my-trips" onClick={handleMyTripsClick}>הטיולים שלי</Link>
                        <Link to="/settings">הגדרות</Link>
                        <Link to="/forum">פורום</Link>
                        {/* fixed - was "maneger" before, server uses "manager" */}
                        {(user.userRole === "admin" || user.userRole === "manager") && (
                            <Link to="/adminPortal">ניהול</Link>
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
