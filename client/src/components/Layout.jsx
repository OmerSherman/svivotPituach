import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

function Layout({ children }) {
    const [year, setYear] = useState("");
//     useEffect(() => {
//     async function fetchYear() {
//         const res = await fetch("https://worldtimeapi.org/api/timezone/Asia/Jerusalem");
//         const data = await res.json();
//         const currentYear = new Date(data.datetime).getFullYear();
//         setYear(currentYear);
//     }
//     fetchYear();
// }, []);
    return (
        <div>
            <Navbar />
            <main>
                {children}
            </main>
            <Footer year={year} />
        </div>
    );
    }
export default Layout;
