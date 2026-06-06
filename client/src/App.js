import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Home from "./pages/Home";
import TripDetail from "./pages/TripDetail";
import Settings from "./pages/Settings";
import CityAttractions from "./pages/CityAttractions";
<<<<<<< HEAD
import AdminPortal from "./pages/adminPortal";
import AdminPortaluser from "./pages/adminPortaluser";
import userContext from "./contexts/userContext";
import preferencesContext from "./contexts/preferencesContext";
import settingsService from "./services/settingsService";

const PREFS_KEY = "preferences";
const DEFAULT_PREFS = { theme: "light", fontSize: "medium", density: "normal" };
=======
import userContext from "./contexts/userContext";
import preferencesContext from "./contexts/preferencesContext";
import { useEffect, useState } from "react";
import AdminPortal from "./pages/adminPortal";
import AdminPortaluser from "./pages/adminPortaluser";
import settingsService from "./services/settingsService";

const PREFERENCES_KEY = "preferences";

// default values - used when nothing is in localStorage yet
const DEFAULT_PREFERENCES = { theme: "light", fontSize: "medium", density: "normal" };
>>>>>>> 76c7c9d41d44c5868b9be93fe723082befe287fc

function App() {
    // start user state from localStorage so refresh keeps the user logged in
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem("user");
        return stored ? JSON.parse(stored) : null;
    });

<<<<<<< HEAD
    // start preferences from local storage too - prevents a flash of wrong theme on refresh
    const [preferences, setPreferences] = useState(() => {
        const stored = localStorage.getItem(PREFS_KEY);
        if (!stored) return DEFAULT_PREFS;
        try {
            return Object.assign({}, DEFAULT_PREFS, JSON.parse(stored));
        } catch (err) {
            return DEFAULT_PREFS;
        }
    });

    // every time preferences change:
    //   1. save to local storage so refresh keeps them
    //   2. apply as data-* attributes on <html> so the css picks up
    useEffect(function() {
        localStorage.setItem(PREFS_KEY, JSON.stringify(preferences));
=======
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
>>>>>>> 76c7c9d41d44c5868b9be93fe723082befe287fc
        document.documentElement.setAttribute("data-theme",     preferences.theme);
        document.documentElement.setAttribute("data-font-size", preferences.fontSize);
        document.documentElement.setAttribute("data-density",   preferences.density);
    }, [preferences]);

    // when the user logs in - fetch their saved preferences from the server
    useEffect(function() {
<<<<<<< HEAD
        async function fetchFromServer() {
            if (!user) return;
            try {
                const data = await settingsService.get();
                // the server returns user info + prefs flat, pick only the pref fields
                const serverPrefs = {
                    theme:    data.theme    || DEFAULT_PREFS.theme,
                    fontSize: data.fontSize || DEFAULT_PREFS.fontSize,
                    density:  data.density  || DEFAULT_PREFS.density
                };
                setPreferences(serverPrefs);
            } catch (err) {
                // not critical - we already have something from local storage
                console.warn("could not load preferences from server:", err.message);
            }
        }
        fetchFromServer();
=======
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
>>>>>>> 76c7c9d41d44c5868b9be93fe723082befe287fc
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
