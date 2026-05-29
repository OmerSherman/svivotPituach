// Layout component - wraps every page with Navbar + Footer.
// this is a minimal version added so the app compiles. The full styled

import Navbar from "./Navbar";
import Footer from "./Footer";

function Layout({ children }) {
    const year = new Date().getFullYear();

    return (
        <div className="app-layout">
            <Navbar />
            <main className="app-main">
                {children}
            </main>
            <Footer year={year} />
        </div>
    );
}

export default Layout;
