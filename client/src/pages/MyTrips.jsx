import { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import tripsService from "../services/tripsService";
import TripForm from "../components/TripForm";
import "./MyTrips.css";

var COUNTRY_NAMES = { 1: "פרו", 2: "ארגנטינה", 3: "ברזיל" };
var STYLE_NAMES = { solo: "מוצ'ילר", couple: "רומנטי", family: "משפחתי", group: "קבוצתי" };
var BUDGET_NAMES = { low: "חסכוני", medium: "בינוני", high: "פרימיום" };
var MONTH_NAMES = ["", "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
                   "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];

function MyTrips() {
    var navigate = useNavigate();
    var currentUser = authService.getStoredUser();

    var [trips, setTrips] = useState(tripsService.getAll());
    var [showForm, setShowForm] = useState(false);
    var [editingTrip, setEditingTrip] = useState(null);

    function handleCreate(data) {
        tripsService.create(data);
        setTrips(tripsService.getAll());
        setShowForm(false);
    }

    function handleUpdate(data) {
        tripsService.update(editingTrip.id, data);
        setTrips(tripsService.getAll());
        setEditingTrip(null);
    }

    function handleDelete(tripId) {
        if (window.confirm("למחוק את הטיול?")) {
            tripsService.remove(tripId);
            setTrips(tripsService.getAll());
        }
    }

    function openEdit(trip) {
        setEditingTrip(trip);
    }

    return (
        <div className="my-trips-page">
            <header className="my-trips-header">
                <h1>
                    {currentUser
                        ? "הטיולים של " + currentUser.firstName + " 🌎"
                        : "הטיולים שלי"}
                </h1>
                <button className="my-trips-add-btn" onClick={function() { setShowForm(true); }}>
                    + טיול חדש
                </button>
            </header>

            {trips.length === 0 && (
                <div className="my-trips-empty">
                    <p>עדיין אין טיולים מתוכננים</p>
                    <p>לחצו על "טיול חדש" כדי להתחיל לתכנן!</p>
                </div>
            )}

            {trips.length > 0 && (
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

            {/* create form */}
            {showForm && (
                <TripForm
                    onSave={handleCreate}
                    onCancel={function() { setShowForm(false); }}
                />
            )}

            {/* edit form */}
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
