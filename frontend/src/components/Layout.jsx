import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "./Layout.css";

function Layout({ children }) {
    var location = useLocation();
    var isForum = location.pathname === "/forum";

    return (
        <div className="layout">
            <Navbar />
            <main className={'layout-main' + (isForum ? ' layout-main--forum' : '')}>
                {children}
            </main>
            {!isForum && <Footer />}
        </div>
    );
}

export default Layout;
