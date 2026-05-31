import { Link } from 'react-router-dom';
import "./Navbar.css";

function Navbar() {
    return (
        <nav className="navbar">
            <div className="navbar-logo">🌎 שביל הטחינה</div>
            <div className="navbar-links">
                <Link to="/">דף הבית</Link>
                <Link to="/settings">הגדרות</Link>
                <Link to="/login">התחברות</Link>
            </div>
        </nav>
    );
}

export default Navbar;
