import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import tripsService from "../services/tripsService";
import TripForm from "../components/TripForm";
import "./MyTrips.css";
import userContext from "../contexts/userContext";

var COUNTRY_NAMES = { 1: "פרו", 2: "ארגנטינה", 3: "ברזיל" };
var STYLE_NAMES = { solo: "מוצ'ילר", couple: "רומנטי", family: "משפחתי", group: "קבוצתי" };
var BUDGET_NAMES = { low: "חסכוני", medium: "בינוני", high: "פרימיום" };
var MONTH_NAMES = ["", "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
                   "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];

function MyTrips() {
    const navigate = useNavigate();
    const { user } = useContext(userContext);

    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editingTrip, setEditingTrip] = useState(null);

    // load trips from server on mount
    useEffect(function() {
        loadTrips();
    }, []);

    async function loadTrips() {
        setLoading(true);
        setError("");
        try {
            const data = await tripsService.getAll();
            setTrips(data);
        } catch (err) {
            setError("שגיאה בטעינת הטיולים: " + err.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleCreate(data) {
        try {
            await tripsService.create(data);
            await loadTrips();
            setShowForm(false);
        } catch (err) {
            alert("שגיאה ביצירת הטיול: " + err.message);
        }
    }

    async function handleUpdate(data) {
        try {
            await tripsService.update(editingTrip.id, data);
            await loadTrips();
            setEditingTrip(null);
        } catch (err) {
            alert("שגיאה בעדכון הטיול: " + err.message);
        }
    }

    async function handleDelete(tripId) {
        if (!window.confirm("למחוק את הטיול?")) return;
        try {
            await tripsService.remove(tripId);
            await loadTrips();
        } catch (err) {
            alert("שגיאה במחיקת הטיול: " + err.message);
        }
    }

    function openEdit(trip) {
        setEditingTrip(trip);
    }

    return (
        <div className="my-trips-page">
            <header className="my-trips-header">
                <h1>
                    {user
                        ? "הטיולים של " + user.firstName + " 🌎"
                        : "הטיולים שלי"}
                </h1>
                <button className="my-trips-add-btn" onClick={function() { setShowForm(true); }}>
                    + טיול חדש
                </button>
            </header>

            {loading && (
                <div className="my-trips-empty">
                    <p>טוען טיולים...</p>
                </div>
            )}

            {error && (
                <div className="my-trips-empty">
                    <p>{error}</p>
                </div>
            )}

            {!loading && !error && trips.length === 0 && (
                <div className="my-trips-empty">
                    <p>עדיין אין טיולים מתוכננים</p>
                    <p>לחצו על "טיול חדש" כדי להתחיל לתכנן!</p>
                </div>
            )}

            {!loading && !error && trips.length > 0 && (
                <div className="my-trips-grid">
                    {trips.map(function(trip) {
                        return (
                            <div key={trip.id} className="trip-card">
                                <div className="trip-card-body"
                                     onClick={function() { navigate("/trips/" + trip.id); }}>
                                    <h3>{trip.name}</h3>
                                    <p className="trip-card-dest">
                                        📍 {COUNTRY_NAMES[trip.countryId] || "לא ידוע"}
                                    </p>
                                    <p className="trip-card-dates">
                                        📅 {MONTH_NAMES[trip.startMonth]} – {MONTH_NAMES[trip.endMonth]}
                                    </p>
                                    <div className="trip-card-tags">
                                        <span className="trip-tag">{STYLE_NAMES[trip.travelStyle]}</span>
                                        <span className="trip-tag">{BUDGET_NAMES[trip.budget]}</span>
                                        {trip.favorites && trip.favorites.length > 0 && (
                                            <span className="trip-tag trip-tag-fav">
                                                ❤ {trip.favorites.length} מועדפים
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="trip-card-actions">
                                    <button onClick={function() { openEdit(trip); }}>✏ עריכה</button>
                                    <button onClick={function() { handleDelete(trip.id); }}>🗑 מחיקה</button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {showForm && (
                <TripForm
                    onSave={handleCreate}
                    onCancel={function() { setShowForm(false); }}
                />
            )}

            {editingTrip && (
                <TripForm
                    initialData={editingTrip}
                    onSave={handleUpdate}
                    onCancel={function() { setEditingTrip(null); }}
                />
            )}
        </div>
    );
}

export default MyTrips;