import "./Footer.css";

function Footer() {
    return (
        <footer className="footer">
            <p className="footer-title">שביל הטחינה — מדריך הטיולים שלך לדרום אמריקה</p>
            <p className="footer-credit">Omer Sherman, Hillel Zilberman, Michal Adam · {new Date().getFullYear()}</p>
        </footer>
    );
}

export default Footer;
