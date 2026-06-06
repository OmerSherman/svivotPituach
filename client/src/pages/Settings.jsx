import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import settingsService from "../services/settingsService";
import usersService from "../services/usersService";
import userContext from "../contexts/userContext";
import preferencesContext from "../contexts/preferencesContext";
import TahiniLoader from "../components/TahiniLoader";
import "./Settings.css";

function Settings() {
    const navigate = useNavigate();
    const { user, setUser } = useContext(userContext);
    const { setPreferences } = useContext(preferencesContext);

    // form fields - personal info
    const [firstName, setFirstName] = useState("");
    const [lastName,  setLastName]  = useState("");
    const [email,     setEmail]     = useState("");

    // form fields - display preferences
    const [theme,    setTheme]    = useState("light");
    const [fontSize, setFontSize] = useState("medium");
    const [density,  setDensity]  = useState("normal");

    // ui states
    const [initialLoading, setInitialLoading] = useState(true);
    const [saving,         setSaving]         = useState(false);
    const [error,          setError]          = useState("");
    const [success,        setSuccess]        = useState("");

    // load current settings on mount
    useEffect(function() {
        async function loadSettings() {
            try {
                const data = await settingsService.get();
                setFirstName(data.firstName || "");
                setLastName(data.lastName || "");
                setEmail(data.email || "");
                setTheme(data.theme || "light");
                setFontSize(data.fontSize || "medium");
                setDensity(data.density || "normal");
            } catch (err) {
                setError("שגיאה בטעינת ההגדרות: " + err.message);
            } finally {
                setInitialLoading(false);
            }
        }
        loadSettings();
    }, []);

    function isValidEmail(value) {
        if (!value) return false;
        const trimmed = value.trim();
        const atIndex  = trimmed.indexOf("@");
        const dotIndex = trimmed.lastIndexOf(".");
        return atIndex > 0 && dotIndex > atIndex + 1 && dotIndex < trimmed.length - 1;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSuccess("");

        // validate
        if (!firstName.trim()) { setError("חובה למלא שם פרטי"); return; }
        if (!lastName.trim())  { setError("חובה למלא שם משפחה"); return; }
        if (!isValidEmail(email)) { setError("כתובת אימייל לא תקינה"); return; }

        setSaving(true);
        try {
            // send all fields in one PUT - the server accepts partial too
            const updated = await settingsService.update({
                firstName: firstName.trim(),
                lastName:  lastName.trim(),
                email:     email.trim(),
                theme:     theme,
                fontSize:  fontSize,
                density:   density
            });

            // apply preferences across the whole app immediately
            setPreferences({
                theme:    updated.theme,
                fontSize: updated.fontSize,
                density:  updated.density
            });

            // also update user in context so the navbar reflects name/email changes
            if (user) {
                setUser({
                    ...user,
                    firstName: updated.firstName,
                    lastName:  updated.lastName,
                    email:     updated.email
                });
                // and refresh the local storage copy
                localStorage.setItem("user", JSON.stringify({
                    ...user,
                    firstName: updated.firstName,
                    lastName:  updated.lastName,
                    email:     updated.email
                }));
            }

            setSuccess("ההגדרות נשמרו בהצלחה");
        } catch (err) {
            setError("שמירה נכשלה: " + err.message);
        } finally {
            setSaving(false);
        }
    }

    // optional - delete account (the partner added this feature)
    async function handleDelete() {
        const confirmed = window.confirm("האם אתה בטוח שברצונך למחוק את המשתמש?");
        if (!confirmed) return;
        try {
            await usersService.del(user.userId);
            alert("אנחנו נפרדים לשלום 👋");
            setUser(null);
            localStorage.removeItem("user");
            navigate("/login");
        } catch (err) {
            setError("המחיקה נכשלה: " + err.message);
        }
    }

    // show loader while we're fetching initial settings
    if (initialLoading) {
        return (
            <div className="settings-page">
                <TahiniLoader />
            </div>
        );
    }

    return (
        <div className="settings-page">
            <header className="settings-header">
                <h1>הגדרות</h1>
                <p>עדכן את הפרטים האישיים והעדפות התצוגה שלך</p>
            </header>

            <form className="settings-form" onSubmit={handleSubmit}>
                {/* personal info section */}
                <div className="settings-section">
                    <h3>פרטים אישיים</h3>

                    <label className="settings-field">
                        <span>שם פרטי</span>
                        <input
                            type="text"
                            value={firstName}
                            onChange={function(e) { setFirstName(e.target.value); }}
                            disabled={saving}
                        />
                    </label>

                    <label className="settings-field">
                        <span>שם משפחה</span>
                        <input
                            type="text"
                            value={lastName}
                            onChange={function(e) { setLastName(e.target.value); }}
                            disabled={saving}
                        />
                    </label>

                    <label className="settings-field">
                        <span>אימייל</span>
                        <input
                            type="email"
                            value={email}
                            onChange={function(e) { setEmail(e.target.value); }}
                            disabled={saving}
                        />
                    </label>
                </div>

                {/* display preferences section */}
                <div className="settings-section">
                    <h3>הגדרות תצוגה</h3>

                    <label className="settings-field">
                        <span>ערכת נושא</span>
                        <select
                            value={theme}
                            onChange={function(e) { setTheme(e.target.value); }}
                            disabled={saving}
                        >
                            <option value="light">☀️ בהיר</option>
                            <option value="dark">🌙 כהה</option>
                        </select>
                    </label>

                    <label className="settings-field">
                        <span>גודל טקסט</span>
                        <select
                            value={fontSize}
                            onChange={function(e) { setFontSize(e.target.value); }}
                            disabled={saving}
                        >
                            <option value="small">קטן</option>
                            <option value="medium">רגיל</option>
                            <option value="large">גדול</option>
                        </select>
                    </label>

                    <label className="settings-field">
                        <span>צפיפות כרטיסיות</span>
                        <select
                            value={density}
                            onChange={function(e) { setDensity(e.target.value); }}
                            disabled={saving}
                        >
                            <option value="compact">קומפקטי</option>
                            <option value="normal">רגיל</option>
                            <option value="spacious">מרווח</option>
                        </select>
                    </label>
                </div>

                {error   && <p className="settings-error">{error}</p>}
                {success && <p className="settings-success">{success}</p>}

                <button type="submit" className="settings-submit" disabled={saving}>
                    {saving ? "שומר..." : "שמור שינויים"}
                </button>

                <button type="button" className="settings-delete" onClick={handleDelete} disabled={saving}>
                    מחק משתמש 😢
                </button>
            </form>
        </div>
    );
}

export default Settings;
