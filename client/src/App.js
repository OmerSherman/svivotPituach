import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Home from "./pages/Home";
import TripDetail from "./pages/TripDetail";
import Settings from "./pages/Settings";
import CityAttractions from "./pages/CityAttractions";
import userContext from "./contexts/userContext";
import preferencesContext from "./contexts/preferencesContext";
import { useEffect, useState } from "react";
import AdminPortal from "./pages/adminPortal";
import AdminPortaluser from "./pages/adminPortaluser";
import settingsService from "./services/settingsService";

const PREFERENCES_KEY = "preferences";

// default values - used when nothing is in localStorage yet
const DEFAULT_PREFERENCES = { theme: "light", fontSize: "medium", density: "normal" };

function App() {
    // start user state from localStorage so refresh keeps the user logged in
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem("user");
        return stored ? JSON.parse(stored) : null;
    });

    // preferences start from localStorage too (no flash of wrong theme on refresh)
    const [preferences, setPreferences] = useState(() => {
        const stored = localStorage.getItem(PREFERENCES_KEY);
        if (!stored) return DEFAULT_PREFERENCES;
        try {
            return Object.assign({}, DEFAULT_PREFERENCES, JSON.parse(stored));
        } catch (err) {
            return DEFAULT_PREFERENCES;
        }
    });

    // when preferences change - save to localStorage AND apply to the html element
    useEffect(function() {
        localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
        // apply via data-* attributes that the css listens to
        document.documentElement.setAttribute("data-theme",     preferences.theme);
        document.documentElement.setAttribute("data-font-size", preferences.fontSize);
        document.documentElement.setAttribute("data-density",   preferences.density);
    }, [preferences]);

    // when the user logs in - fetch their saved preferences from the server
    useEffect(function() {
        async function fetchPreferences() {
            if (!user) return;
            try {
                const data = await settingsService.get();
                if (data.preferences) {
                    setPreferences(Object.assign({}, DEFAULT_PREFERENCES, data.preferences));
                }
            } catch (err) {
                // not critical - just use whatever is in localStorage
                console.warn("could not load server preferences:", err.message);
            }
        }
        fetchPreferences();
    }, [user]);

    return (
        <userContext.Provider value={{ user, setUser }}>
            <preferencesContext.Provider value={{ preferences, setPreferences }}>
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
            </preferencesContext.Provider>
        </userContext.Provider>
    );
}

export default App;
