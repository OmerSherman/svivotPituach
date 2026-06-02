import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../services/authService";
import logo from "../assets/logo-transparent.svg";
import "./Navbar.css";
import userContext from "../contexts/userContext";

function Navbar() {
    const navigate = useNavigate();
    // local user starts from storage so the navbar paints immediately
    const {user , setUser} = useContext(userContext);

    async function handleLogout() {
        await authService.logout();
        setUser(null);
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
