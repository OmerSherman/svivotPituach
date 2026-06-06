import { useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import usersService from "../services/usersService";
import userContext from "../contexts/userContext";
import "./adminPortaluser.css";

// hebrew labels for roles
const ROLE_LABELS = { admin: "אדמין", manager: "מנהל", user: "משתמש" };

// numeric levels for permission comparison (higher = more power)
const ROLE_LEVELS = { user: 0, manager: 1, admin: 2 };

function AdminPortaluser() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useContext(userContext);

    // the user we're managing - passed from the list page via router state
    const passedUser = location.state && location.state.user;
    const [currUser, setCurrUser] = useState(passedUser);

    // edit mode state
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        firstName: (passedUser && passedUser.firstName) || "",
        lastName:  (passedUser && passedUser.lastName)  || "",
        email:     (passedUser && passedUser.email)     || ""
    });

    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    // guard - if someone got here without passing a user, show fallback
    if (!currUser) {
        return (
            <div className="aup-page">
                <p className="aup-error">לא נבחר משתמש להצגה.</p>
                <button className="aup-back-btn" onClick={function() { navigate("/adminPortal"); }}>
                    חזרה לרשימה
                </button>
            </div>
        );
    }

    // permission logic - can the current user manage this user?
    // rule: you can only manage users with a lower role level than yours
    const myLevel    = ROLE_LEVELS[user.userRole]    || 0;
    const theirLevel = ROLE_LEVELS[currUser.userRole] || 0;
    const canManage  = myLevel > theirLevel;

    function formatDate(iso) {
        if (!iso) return "—";
        try {
            return new Date(iso).toLocaleDateString("he-IL");
        } catch (err) {
            return "—";
        }
    }

    // change the user's role on the server
    async function handleRoleChange(newRole) {
        setError("");
        setSaving(true);
        try {
            const updated = { ...currUser, userRole: newRole };
            await usersService.update(currUser.userId, updated);
            setCurrUser(updated);
        } catch (err) {
            setError(err.message || "לא ניתן לעדכן את התפקיד");
        } finally {
            setSaving(false);
        }
    }

    // delete this user
    async function handleDelete() {
        const confirmed = window.confirm(
            "האם אתה בטוח שברצונך למחוק את המשתמש " + currUser.firstName + " " + currUser.lastName + "?"
        );
        if (!confirmed) return;

        setError("");
        setSaving(true);
        try {
            await usersService.del(currUser.userId);
            navigate("/adminPortal");
        } catch (err) {
            setError(err.message || "המחיקה נכשלה");
            setSaving(false);
        }
    }

    // start editing - keep current values as starting point
    function startEditing() {
        setEditData({
            firstName: currUser.firstName,
            lastName:  currUser.lastName,
            email:     currUser.email
        });
        setIsEditing(true);
    }

    function cancelEditing() {
        setIsEditing(false);
        setError("");
    }

    function handleInputChange(e) {
        setEditData({ ...editData, [e.target.name]: e.target.value });
    }

    function isValidEmail(value) {
        if (!value) return false;
        const trimmed = value.trim();
        const atIndex  = trimmed.indexOf("@");
        const dotIndex = trimmed.lastIndexOf(".");
        return atIndex > 0 && dotIndex > atIndex + 1 && dotIndex < trimmed.length - 1;
    }

    // save the edits
    async function handleSaveChanges() {
        setError("");

        if (!editData.firstName.trim() || !editData.lastName.trim()) {
            setError("שם פרטי ושם משפחה הם שדות חובה");
            return;
        }
        if (!isValidEmail(editData.email)) {
            setError("כתובת אימייל לא תקינה");
            return;
        }

        setSaving(true);
        try {
            const updated = {
                ...currUser,
                firstName: editData.firstName.trim(),
                lastName:  editData.lastName.trim(),
                email:     editData.email.trim()
            };
            await usersService.update(currUser.userId, updated);
            setCurrUser(updated);
            setIsEditing(false);
        } catch (err) {
            setError(err.message || "השמירה נכשלה");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="aup-page">
            <button className="aup-back-link" onClick={function() { navigate("/adminPortal"); }}>
                ← חזרה לרשימת המשתמשים
            </button>

            <header className="aup-header">
                <div className="aup-avatar">
                    {(currUser.firstName && currUser.firstName.charAt(0).toUpperCase()) || "?"}
                </div>
                <div>
                    <h1>{currUser.firstName} {currUser.lastName}</h1>
                    <div className="aup-meta-row">
                        <span className={"aup-role-badge aup-role-" + currUser.userRole}>
                            {ROLE_LABELS[currUser.userRole] || currUser.userRole}
                        </span>
                        <span className="aup-id">#{currUser.userId}</span>
                    </div>
                </div>
            </header>

            {error && <div className="aup-error">{error}</div>}

            <div className="aup-card">
                <h3 className="aup-section-title">פרטי משתמש</h3>

                {isEditing ? (
                    <div className="aup-fields">
                        <label className="aup-field">
                            <span>שם פרטי</span>
                            <input
                                type="text"
                                name="firstName"
                                value={editData.firstName}
                                onChange={handleInputChange}
                                disabled={saving}
                            />
                        </label>

                        <label className="aup-field">
                            <span>שם משפחה</span>
                            <input
                                type="text"
                                name="lastName"
                                value={editData.lastName}
                                onChange={handleInputChange}
                                disabled={saving}
                            />
                        </label>

                        <label className="aup-field">
                            <span>אימייל</span>
                            <input
                                type="email"
                                name="email"
                                value={editData.email}
                                onChange={handleInputChange}
                                disabled={saving}
                            />
                        </label>
                    </div>
                ) : (
                    <dl className="aup-details">
                        <dt>שם פרטי</dt>
                        <dd>{currUser.firstName}</dd>

                        <dt>שם משפחה</dt>
                        <dd>{currUser.lastName}</dd>

                        <dt>אימייל</dt>
                        <dd className="aup-email">{currUser.email}</dd>

                        <dt>תאריך הצטרפות</dt>
                        <dd>{formatDate(currUser.createDate)}</dd>

                        <dt>עדכון אחרון</dt>
                        <dd>{formatDate(currUser.updateDate)}</dd>
                    </dl>
                )}
            </div>

            {/* action buttons - what shows depends on permissions */}
            {canManage && (
                <div className="aup-card aup-actions-card">
                    <h3 className="aup-section-title">פעולות</h3>

                    <div className="aup-actions">
                        {isEditing ? (
                            <>
                                <button
                                    className="aup-btn aup-btn-primary"
                                    onClick={handleSaveChanges}
                                    disabled={saving}
                                >
                                    {saving ? "שומר..." : "💾 שמור שינויים"}
                                </button>
                                <button
                                    className="aup-btn aup-btn-ghost"
                                    onClick={cancelEditing}
                                    disabled={saving}
                                >
                                    ביטול
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    className="aup-btn aup-btn-primary"
                                    onClick={startEditing}
                                    disabled={saving}
                                >
                                    ✏ ערוך פרטים
                                </button>

                                {/* role change buttons - only when not editing */}
                                {currUser.userRole === "user" && (
                                    <button
                                        className="aup-btn aup-btn-secondary"
                                        onClick={function() { handleRoleChange("manager"); }}
                                        disabled={saving}
                                    >
                                        ⬆ הפוך למנהל
                                    </button>
                                )}

                                {currUser.userRole === "manager" && (
                                    <button
                                        className="aup-btn aup-btn-secondary"
                                        onClick={function() { handleRoleChange("user"); }}
                                        disabled={saving}
                                    >
                                        ⬇ הפוך למשתמש רגיל
                                    </button>
                                )}

                                {user.userRole === "admin" && currUser.userRole !== "admin" && (
                                    <button
                                        className="aup-btn aup-btn-secondary"
                                        onClick={function() { handleRoleChange("admin"); }}
                                        disabled={saving}
                                    >
                                        ⭐ הפוך לאדמין
                                    </button>
                                )}

                                <button
                                    className="aup-btn aup-btn-danger"
                                    onClick={handleDelete}
                                    disabled={saving}
                                >
                                    🗑 מחק משתמש
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {!canManage && (
                <div className="aup-no-permissions">
                    אין לך הרשאה לערוך משתמש זה
                </div>
            )}
        </div>
    );
}

export default AdminPortaluser;
