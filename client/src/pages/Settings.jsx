// pages/Settings.jsx
// Settings page (Assignment 3 requirement #4).
// - loads the current settings from GET /api/settings
// - lets the user edit them in a form
// - validates and sends a PUT /api/settings on submit
// - shows loading / success / error states

import { useEffect, useState } from "react";
import settingsService from "../services/settingsService";
import "./Settings.css";

function Settings() {
    // form values (controlled inputs)
    const [firstName,    setFirstName]    = useState("");
    const [lastName,     setLastName]     = useState("");
    const [email,        setEmail]        = useState("");
    const [theme,        setTheme]        = useState("light");
    const [budgetLevel,  setBudgetLevel]  = useState("medium");

    // ui states - the assignment specifically asks for loading/success/error
    const [initialLoading, setInitialLoading] = useState(true);
    const [saving,         setSaving]         = useState(false);
    const [error,          setError]          = useState("");
    const [success,        setSuccess]        = useState("");

    // 1) load current settings on mount
    useEffect(function() {
        async function loadSettings() {
            try {
                const data = await settingsService.get();
                setFirstName(data.firstName || "");
                setLastName(data.lastName || "");
                setEmail(data.email || "");
                setTheme(data.theme || "light");
                setBudgetLevel(data.budgetLevel || "medium");
            } catch (err) {
                setError("שגיאה בטעינת ההגדרות: " + err.message);
            } finally {
                setInitialLoading(false);
            }
        }
        loadSettings();
    }, []);

    // simple email format check ("a@b.c"-ish)
    function isValidEmail(value) {
        if (!value) return false;
        const trimmed = value.trim();
        const atIndex  = trimmed.indexOf("@");
        const dotIndex = trimmed.lastIndexOf(".");
        return atIndex > 0 && dotIndex > atIndex + 1 && dotIndex < trimmed.length - 1;
    }

    // 2) on submit - validate, then PUT to backend
    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSuccess("");

        // client-side validation
        if (!firstName.trim()) {
            setError("חובה למלא שם פרטי");
            return;
        }
        if (!lastName.trim()) {
            setError("חובה למלא שם משפחה");
            return;
        }
        if (!isValidEmail(email)) {
            setError("כתובת אימייל לא תקינה");
            return;
        }

        setSaving(true);
        try {
            await settingsService.update({
                firstName:   firstName.trim(),
                lastName:    lastName.trim(),
                email:       email.trim(),
                theme:       theme,
                budgetLevel: budgetLevel
            });
            setSuccess("ההגדרות נשמרו בהצלחה");
        } catch (err) {
            setError("שמירה נכשלה: " + err.message);
        } finally {
            setSaving(false);
        }
    }

    if (initialLoading) {
        return (
            <div className="settings-page">
                <p className="settings-loading">טוען הגדרות...</p>
            </div>
        );
    }

    return (
        <div className="settings-page">
            <header className="settings-header">
                <h1>הגדרות</h1>
                <p>עדכון פרטי המשתמש והעדפות התצוגה.</p>
            </header>

            <form className="settings-form" onSubmit={handleSubmit}>

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

                <label className="settings-field">
                    <span>ערכת נושא</span>
                    <select
                        value={theme}
                        onChange={function(e) { setTheme(e.target.value); }}
                        disabled={saving}
                    >
                        <option value="light">בהיר</option>
                        <option value="dark">כהה</option>
                    </select>
                </label>

                <label className="settings-field">
                    <span>רמת תקציב</span>
                    <select
                        value={budgetLevel}
                        onChange={function(e) { setBudgetLevel(e.target.value); }}
                        disabled={saving}
                    >
                        <option value="low">חסכוני</option>
                        <option value="medium">בינוני</option>
                        <option value="high">פרימיום</option>
                    </select>
                </label>

                {/* feedback messages */}
                {error   && <p className="settings-error">{error}</p>}
                {success && <p className="settings-success">{success}</p>}

                <button type="submit" className="settings-submit" disabled={saving}>
                    {saving ? "שומר..." : "שמור שינויים"}
                </button>
            </form>
        </div>
    );
}

export default Settings;
