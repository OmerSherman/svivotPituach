import { Link, useNavigate } from "react-router-dom";
import authService from "../services/authService";
import logo from "../assets/logo-transparent.svg";
import "./Navbar.css";

function Navbar() {
    var navigate = useNavigate();
    var user = authService.getStoredUser();

    function handleLogout() {
        authService.logout();
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