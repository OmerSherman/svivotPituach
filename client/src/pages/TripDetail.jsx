import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import DataTable from "../components/DataTable";
import ItemCard from "../components/ItemCard";
import AttractionModal from "../components/AttractionModal";
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

    // modal state - which attraction is open
    var [selectedAttraction, setSelectedAttraction] = useState(null);

    useEffect(function() {
        async function loadData() {
            try {
                var tripData = await tripsService.getById(id);
                if (!tripData) {
                    setError("הטיול לא נמצא");
                    setLoading(false);
                    return;
                }
                setTrip(tripData);

                var [citiesData, attractionsData] = await Promise.all([
                    citiesService.getAll(),
                    attractionsService.getAll()
                ]);
                setCities(citiesData);

                // filter by country
                var countryCityIds = citiesData
                    .filter(function(c) { return c.country_id === tripData.countryId; })
                    .map(function(c) { return c.id; });

                var filtered = attractionsData.filter(function(a) {
                    return countryCityIds.includes(a.city_id);
                });

                // filter by month range
                var monthRange = getMonthRange(tripData.startMonth, tripData.endMonth);
                filtered = filtered.filter(function(a) {
                    if (!a.best_months || a.best_months.length === 0) return true;
                    return monthRange.some(function(m) {
                        return a.best_months.includes(m);
                    });
                });

                // sort: first by matching interest tags, then by audience score
                var userInterests = tripData.interests || [];
                filtered.sort(function(a, b) {
                    var matchA = countMatchingTags(a.tags, userInterests);
                    var matchB = countMatchingTags(b.tags, userInterests);
                    if (matchA !== matchB) {
                        return matchB - matchA; // more matches first
                    }
                    // tie-breaker: audience score for travel style
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

    // count how many of the user's interests match this attraction's tags
    function countMatchingTags(tags, interests) {
        if (!tags || !interests || interests.length === 0) return 0;
        return tags.filter(function(t) { return interests.includes(t); }).length;
    }

    function handleToggleFavorite(attractionId) {
        var updated = await tripsService.toggleFavorite(id, attractionId);
        if (updated) setTrip({ ...updated });
    }

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

    function getCityName(cityId) {
        var city = cities.find(function(c) { return c.id === cityId; });
        return city ? city.name_he : "";
    }

    function formatDateRange(start, end) {
        if (start === end) return MONTH_NAMES[start] + " בלבד";
        return MONTH_NAMES[start] + " – " + MONTH_NAMES[end];
    }

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
        return <div className="trip-detail-page"><p className="trip-detail-loading">טוען...</p></div>;
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

    var favoriteAttractions = attractions.filter(function(a) { return isFav(a.id); });

    return (
        <div className="trip-detail-page">
            <Link to="/" className="trip-detail-back">← חזרה לטיולים שלי</Link>

            <header className="trip-detail-header">
                <h1>{trip.name}</h1>
                <div className="trip-detail-meta">
                    <span>📍 {COUNTRY_NAMES[trip.countryId]}</span>
                    <span>📅 {formatDateRange(trip.startMonth, trip.endMonth)}</span>
                    <span>🎒 {STYLE_NAMES[trip.travelStyle]}</span>
                    <span>🎯 {attractions.length} אטרקציות מתאימות</span>
                    {favoriteAttractions.length > 0 && (
                        <span>❤ {favoriteAttractions.length} מועדפים</span>
                    )}
                </div>
                {trip.interests && trip.interests.length > 0 && (
                    <div className="trip-detail-interests">
                        <span>תחומי עניין: </span>
                        {trip.interests.map(function(t, i) {
                            return <span key={i} className="trip-detail-interest-tag">{t}</span>;
                        })}
                    </div>
                )}
            </header>

            {/* favorites section */}
            {favoriteAttractions.length > 0 && (
                <section className="trip-detail-section trip-favorites-section">
                    <h2>❤ המועדפים שלי בטיול הזה</h2>
                    <div className="trip-detail-grid">
                        {favoriteAttractions.map(function(attr) {
                            var score = (attr.audience_scores && attr.audience_scores[trip.travelStyle]) || attr.popularity_score;
                            return (
                                <div key={attr.id} className="trip-detail-card-wrapper">
                                    <div onClick={function() { setSelectedAttraction(attr); }}>
                                        <ItemCard
                                            title={attr.name_he}
                                            subtitle={getCityName(attr.city_id)}
                                            description={attr.description_he}
                                            imageUrl={attr.image_url}
                                            score={score}
                                            tags={attr.tags}
                                        />
                                    </div>
                                    <button
                                        className="fav-btn fav-btn-active"
                                        onClick={function() { handleToggleFavorite(attr.id); }}
                                    >
                                        ❤ הסר מהמועדפים
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* table */}
            <section className="trip-detail-section">
                <h2>אטרקציות מומלצות</h2>
                <DataTable
                    columns={columns}
                    rows={attractions}
                    rowKey="id"
                    emptyMessage="לא נמצאו אטרקציות מתאימות לתאריכים שבחרת"
                />
            </section>

            {/* card grid - click to expand */}
            <section className="trip-detail-section">
                <h2>בחרו מועדפים</h2>
                <p className="trip-detail-hint">💡 לחצו על כרטיסיה לפרטים נוספים</p>
                {attractions.length === 0 ? (
                    <p className="trip-detail-empty">לא נמצאו אטרקציות</p>
                ) : (
                    <div className="trip-detail-grid">
                        {attractions.map(function(attr) {
                            var score = (attr.audience_scores && attr.audience_scores[trip.travelStyle]) || attr.popularity_score;
                            var favorited = isFav(attr.id);
                            return (
                                <div key={attr.id} className="trip-detail-card-wrapper">
                                    <div onClick={function() { setSelectedAttraction(attr); }}>
                                        <ItemCard
                                            title={attr.name_he}
                                            subtitle={getCityName(attr.city_id)}
                                            description={attr.description_he}
                                            imageUrl={attr.image_url}
                                            score={score}
                                            tags={attr.tags}
                                        />
                                    </div>
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

            {/* the modal */}
            {selectedAttraction && (
                <AttractionModal
                    attraction={selectedAttraction}
                    cityName={getCityName(selectedAttraction.city_id)}
                    onClose={function() { setSelectedAttraction(null); }}
                />
            )}
        </div>
    );
}

export default TripDetail;
