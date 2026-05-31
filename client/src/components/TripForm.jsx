import { useState } from "react";
import "./TripForm.css";

var COUNTRIES = [
    { id: 1, name: "פרו" },
    { id: 2, name: "ארגנטינה" },
    { id: 3, name: "ברזיל" }
];

var MONTHS = [
    { value: 1,  label: "ינואר" },
    { value: 2,  label: "פברואר" },
    { value: 3,  label: "מרץ" },
    { value: 4,  label: "אפריל" },
    { value: 5,  label: "מאי" },
    { value: 6,  label: "יוני" },
    { value: 7,  label: "יולי" },
    { value: 8,  label: "אוגוסט" },
    { value: 9,  label: "ספטמבר" },
    { value: 10, label: "אוקטובר" },
    { value: 11, label: "נובמבר" },
    { value: 12, label: "דצמבר" }
];

// used for both create and edit
// props: initialData (optional), onSave, onCancel
function TripForm({ initialData, onSave, onCancel }) {
    var defaults = initialData || {};

    var [name, setName]             = useState(defaults.name || "");
    var [countryId, setCountryId]   = useState(defaults.countryId || 1);
    var [startMonth, setStartMonth] = useState(defaults.startMonth || 1);
    var [endMonth, setEndMonth]     = useState(defaults.endMonth || 1);
    var [travelStyle, setTravelStyle] = useState(defaults.travelStyle || "solo");
    var [budget, setBudget]         = useState(defaults.budget || "medium");
    var [error, setError]           = useState("");

    function handleSubmit(e) {
        e.preventDefault();
        setError("");

        if (!name.trim()) {
            setError("חובה לתת שם לטיול");
            return;
        }

        onSave({
            name: name.trim(),
            countryId: Number(countryId),
            startMonth: Number(startMonth),
            endMonth: Number(endMonth),
            travelStyle: travelStyle,
            budget: budget
        });
    }

    return (
        <div className="trip-form-overlay">
            <form className="trip-form" onSubmit={handleSubmit}>
                <h2>{initialData ? "עריכת טיול" : "טיול חדש"}</h2>

                <label className="trip-form-field">
                    <span>שם הטיול</span>
                    <input type="text" value={name}
                        placeholder="למשל: חופשת קיץ בארגנטינה"
                        onChange={function(e) { setName(e.target.value); }} />
                </label>

                <label className="trip-form-field">
                    <span>יעד (מדינה)</span>
                    <select value={countryId} onChange={function(e) { setCountryId(e.target.value); }}>
                        {COUNTRIES.map(function(c) {
                            return <option key={c.id} value={c.id}>{c.name}</option>;
                        })}
                    </select>
                </label>

                <div className="trip-form-row">
                    <label className="trip-form-field">
                        <span>מחודש</span>
                        <select value={startMonth} onChange={function(e) { setStartMonth(e.target.value); }}>
                            {MONTHS.map(function(m) {
                                return <option key={m.value} value={m.value}>{m.label}</option>;
                            })}
                        </select>
                    </label>
                    <label className="trip-form-field">
                        <span>עד חודש</span>
                        <select value={endMonth} onChange={function(e) { setEndMonth(e.target.value); }}>
                            {MONTHS.map(function(m) {
                                return <option key={m.value} value={m.value}>{m.label}</option>;
                            })}
                        </select>
                    </label>
                </div>

                <label className="trip-form-field">
                    <span>סגנון טיול</span>
                    <select value={travelStyle} onChange={function(e) { setTravelStyle(e.target.value); }}>
                        <option value="solo">מוצ'ילר / יחיד</option>
                        <option value="couple">רומנטי / זוגי</option>
                        <option value="family">משפחתי</option>
                        <option value="group">קבוצתי</option>
                    </select>
                </label>

                <label className="trip-form-field">
                    <span>תקציב</span>
                    <select value={budget} onChange={function(e) { setBudget(e.target.value); }}>
                        <option value="low">חסכוני</option>
                        <option value="medium">בינוני</option>
                        <option value="high">פרימיום</option>
                    </select>
                </label>

                {error && <p className="trip-form-error">{error}</p>}

                <div className="trip-form-buttons">
                    <button type="submit" className="trip-form-save">
                        {initialData ? "שמור שינויים" : "צור טיול"}
                    </button>
                    <button type="button" className="trip-form-cancel" onClick={onCancel}>
                        ביטול
                    </button>
                </div>
            </form>
        </div>
    );
}

export default TripForm;
