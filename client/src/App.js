import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Home from "./pages/Home";
import TripDetail from "./pages/TripDetail";
import Settings from "./pages/Settings";
import CityAttractions from "./pages/CityAttractions";
import userContext from "./contexts/userContext";
import { useState } from "react";
import AdminPortal from "./pages/adminPortal";
import AdminPortaluser from "./pages/adminPortaluser";

function App() {
    // start user state from local storage so refresh keeps the user logged in
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem("user");
        return stored ? JSON.parse(stored) : null;
    });

    return (
        <userContext.Provider value={{ user, setUser }}>
            <BrowserRouter>
                <Layout>
                    <Routes>
                        {/* public */}
                        <Route path="/login" element={<Login />} />

                        {/* protected */}
                        <Route path="/" element={
                            <ProtectedRoute><Home /></ProtectedRoute>
                        } />
                        <Route path="/trips/:id" element={
                            <ProtectedRoute><TripDetail /></ProtectedRoute>
                        } />
                        <Route path="/settings" element={
                            <ProtectedRoute><Settings /></ProtectedRoute>
                        } />
                        <Route path="/cities/:id" element={
                            <ProtectedRoute><CityAttractions /></ProtectedRoute>
                        } />
                        <Route path="/adminPortal" element={
                            <ProtectedRoute><AdminPortal /></ProtectedRoute>
                        } />
                        <Route path="/adminPortaluser" element={
                            <ProtectedRoute><AdminPortaluser /></ProtectedRoute>
                        } />
                    </Routes>
                </Layout>
            </BrowserRouter>
        </userContext.Provider>
    );
}

export default App;
