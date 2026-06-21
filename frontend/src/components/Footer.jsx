import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
    return (
        <footer className="footer">
            <p className="footer-title">שביל הטחינה — מדריך הטיולים שלך לדרום אמריקה</p>
            <p className="footer-credit">Omer Sherman, Hillel Zilberman, Michal Adam · {new Date().getFullYear()}</p>
            <div className="footer-links">
                <Link to="/">דף הבית</Link>
                <Link to="/forum">פורום מטיילים</Link>
                <Link to="/settings">הגדרות</Link>
            </div>
        </footer>
    );
}

export default Footer;
