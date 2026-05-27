import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Settings from "./pages/Settings";
import CityAttractions from "./pages/CityAttractions";

function App() {
    return (
        <BrowserRouter>
            <Layout>
                <Routes>
                    <Route path="/"             element={<Home />} />
                    <Route path="/login"        element={<Login />} />
                    <Route path="/settings"     element={<Settings />} />
                    <Route path="/cities/:id"   element={<CityAttractions />} />
                </Routes>
            </Layout>
        </BrowserRouter>
    );
}

export default App;
