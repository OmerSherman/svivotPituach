import { useContext, useEffect, useState } from "react";
import settingsService from "../services/settingsService";
import "./Settings.css";
import usersService from "../services/usersService";
import userContext from "../contexts/userContext";
import { useNavigate } from "react-router-dom";

function Settings() {
    const navigate = useNavigate()
    const {user, setUser} = useContext(userContext)
    // form fields
    const [firstName,    setFirstName]    = useState("");
    const [lastName,     setLastName]     = useState("");
    const [email,        setEmail]        = useState("");

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

    const handleDelete =async ()=>{
        const isConfirmed = window.confirm("האם אתה בטוח שברצונך למחוק משתמש זה?");
        if (!isConfirmed) return;
        try{
            await usersService.del(user.userId)
            alert("אנחנו נפרדים לשלום 👋");
            setUser(null)
            localStorage.removeItem("user");
            Navigate("/login")
        }
        catch(err){
            setError("המחיקה נכשלה" + err.message)
        }
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

                {error   && <p className="settings-error">{error}</p>}
                {success && <p className="settings-success">{success}</p>}

                <button type="submit" className="settings-submit" disabled={saving}>
                    {saving ? "שומר..." : "שמור שינויים"}
                </button>
                <button type="button" className="settings-delete" onClick={()=>handleDelete()}>
                    מחק משתמש ): 
                </button>
                
            </form>
        </div>
    );
}

export default Settings;
