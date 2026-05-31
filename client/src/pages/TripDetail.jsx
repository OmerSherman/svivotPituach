import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import DataTable from "../components/DataTable";
import ItemCard from "../components/ItemCard";
import tripsService from "../services/tripsService";
import citiesService from "../services/citiesService";
import attractionsService from "../services/attractionsService";
import "./TripDetail.css";

var COUNTRY_NAMES = { 1: "פרו", 2: "ארגנטינה", 3: "ברזיל" };
var STYLE_NAMES = { solo: "מוצ'ילר", couple: "רומנטי", family: "משפחתי", group: "קבוצתי" };
var MONTH_NAMES = ["", "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
                   "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];

function TripDetail() {
    var { id } = useParams();

    var [trip, setTrip] = useState(null);
    var [attractions, setAttractions] = useState([]);
    var [cities, setCities] = useState([]);
    var [loading, setLoading] = useState(true);
    var [error, setError] = useState("");

    useEffect(function() {
        async function loadData() {
            try {
                var tripData = tripsService.getById(id);
                if (!tripData) {
                    setError("הטיול לא נמצא");
                    setLoading(false);
                    return;
                }
                setTrip(tripData);

                // fetch cities + attractions from server
                var [citiesData, attractionsData] = await Promise.all([
                    citiesService.getAll(),
                    attractionsService.getAll()
                ]);
                setCities(citiesData);

                // find city ids that belong to this trip's country
                var countryCityIds = citiesData
                    .filter(function(c) { return c.country_id === tripData.countryId; })
                    .map(function(c) { return c.id; });

                // filter attractions by country
                var filtered = attractionsData.filter(function(a) {
                    return countryCityIds.includes(a.city_id);
                });

                // filter by trip months
                var monthRange = getMonthRange(tripData.startMonth, tripData.endMonth);
                filtered = filtered.filter(function(a) {
                    if (!a.best_months || a.best_months.length === 0) return true;
                    // check if any trip month overlaps with best_months
                    return monthRange.some(function(m) {
                        return a.best_months.includes(m);
                    });
                });

                // sort by audience score for trip's travel style
                filtered.sort(function(a, b) {
                    var scoreA = (a.audience_scores && a.audience_scores[tripData.travelStyle]) || 0;
                    var scoreB = (b.audience_scores && b.audience_scores[tripData.travelStyle]) || 0;
                    return scoreB - scoreA;
                });

                setAttractions(filtered);
            } catch (err) {
                setError("שגיאה בטעינה: " + err.message);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [id]);

    function handleToggleFavorite(attractionId) {
        var updated = tripsService.toggleFavorite(id, attractionId);
        if (updated) setTrip({ ...updated });
    }

    // build month range array (handles wrap around dec->jan)
    function getMonthRange(start, end) {
        var months = [];
        var current = start;
        while (true) {
            months.push(current);
            if (current === end) break;
            current = current === 12 ? 1 : current + 1;
        }
        return months;
    }

    // find city name for an attraction
    function getCityName(cityId) {
        var city = cities.find(function(c) { return c.id === cityId; });
        return city ? city.name_he : "";
    }

    // table columns
    var columns = [
        { key: "name_he", label: "שם" },
        { key: "city_id", label: "עיר", render: function(val) { return getCityName(val); } },
        { key: "type", label: "סוג", render: function(val) {
            if (val === "site") return "אתר";
            if (val === "tour") return "סיור";
            if (val === "route") return "מסלול";
            return val;
        }},
        { key: "popularity_score", label: "ציון", render: function(val) { return <strong>{val}</strong>; } }
    ];

    if (loading) {
        return (
            <div className="trip-detail-page">
                <p className="trip-detail-loading">טוען...</p>
            </div>
        );
    }

    if (error || !trip) {
        return (
            <div className="trip-detail-page">
                <p className="trip-detail-error">{error || "הטיול לא נמצא"}</p>
                <Link to="/" className="trip-detail-back">← חזרה לטיולים שלי</Link>
            </div>
        );
    }

    var isFav = function(aId) {
        return trip.favorites && trip.favorites.includes(aId);
    };

    return (
        <div className="trip-detail-page">
            <Link to="/" className="trip-detail-back">← חזרה לטיולים שלי</Link>

            <header className="trip-detail-header">
                <h1>{trip.name}</h1>
                <div className="trip-detail-meta">
                    <span>📍 {COUNTRY_NAMES[trip.countryId]}</span>
                    <span>📅 {MONTH_NAMES[trip.startMonth]} – {MONTH_NAMES[trip.endMonth]}</span>
                    <span>🎒 {STYLE_NAMES[trip.travelStyle]}</span>
                </div>
            </header>

            {/* table view */}
            <section className="trip-detail-section">
                <h2>אטרקציות מומלצות</h2>
                <DataTable
                    columns={columns}
                    rows={attractions}
                    rowKey="id"
                    emptyMessage="לא נמצאו אטרקציות מתאימות לתאריכים שבחרת"
                />
            </section>

            {/* cards with favorites */}
            <section className="trip-detail-section">
                <h2>בחרו מועדפים</h2>
                {attractions.length === 0 ? (
                    <p className="trip-detail-empty">לא נמצאו אטרקציות</p>
                ) : (
                    <div className="trip-detail-grid">
                        {attractions.map(function(attr) {
                            var score = (attr.audience_scores && attr.audience_scores[trip.travelStyle]) || attr.popularity_score;
                            var favorited = isFav(attr.id);
                            return (
                                <div key={attr.id} className="trip-detail-card-wrapper">
                                    <ItemCard
                                        title={attr.name_he}
                                        subtitle={getCityName(attr.city_id)}
                                        description={attr.description_he}
                                        imageUrl={attr.image_url}
                                        score={score}
                                        tags={attr.tags}
                                    />
                                    <button
                                        className={"fav-btn" + (favorited ? " fav-btn-active" : "")}
                                        onClick={function() { handleToggleFavorite(attr.id); }}
                                    >
                                        {favorited ? "❤ במועדפים" : "🤍 הוסף למועדפים"}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}

export default TripDetail;
