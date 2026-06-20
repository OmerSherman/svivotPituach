import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import DataTable from "../components/DataTable";
import ItemCard from "../components/ItemCard";
import AttractionModal from "../components/AttractionModal";
import TahiniLoader from "../components/TahiniLoader";
import TahiniProgress from "../components/TahiniProgress";
import tripsService from "../services/tripsService";
import citiesService from "../services/citiesService";
import attractionsService from "../services/attractionsService";
import aiService from "../services/aiService";
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

    // modal state - which attraction is currently open
    var [selectedAttraction, setSelectedAttraction] = useState(null);

    var [summary, setSummary] = useState("");
    var [summaryLoading, setSummaryLoading] = useState(false);
    var [summaryError, setSummaryError] = useState("");

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
                    attractionsService.getAll({
                        travelStyle: tripData.travelStyle,
                        startMonth: tripData.startMonth,
                        endMonth: tripData.endMonth,
                        interests: tripData.interests || []
                    })
                ]);
                setCities(citiesData);

                // filter attractions by trip country
                var countryCityIds = citiesData
                    .filter(function(c) { return c.country_id === tripData.countryId; })
                    .map(function(c) { return c.id; });

                var filtered = attractionsData.filter(function(a) {
                    return countryCityIds.includes(a.city_id);
                });

                // filter by month range - skip if attraction has no months listed
                var monthRange = getMonthRange(tripData.startMonth, tripData.endMonth);
                filtered = filtered.filter(function(a) {
                    if (!a.best_months || a.best_months.length === 0) return true;
                    return monthRange.some(function(m) {
                        return a.best_months.includes(m);
                    });
                });

                // sort by personalized score from server (tags + style + months + interests)
                filtered.sort(function(a, b) {
                    var scoreA = a.personalized_score || a.popularity_score || 0;
                    var scoreB = b.personalized_score || b.popularity_score || 0;
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

    async function handleToggleFavorite(attractionId) {
        try {
            var updated = await tripsService.toggleFavorite(id, attractionId);
            if (updated) setTrip({ ...updated });
        } catch (err) {
            alert("שגיאה בשמירת המועדף: " + err.message);
        }
    }

    async function handleSummarize() {
        setSummaryLoading(true);
        setSummaryError("");
        try {
            var text = await aiService.summarizeTrip(id);
            setSummary(text);
        } catch (err) {
            setSummary("");
            setSummaryError(err.message || "לא ניתן ליצור סיכום כרגע");
        } finally {
            setSummaryLoading(false);
        }
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

    function getScoreHint(attraction) {
        var personalized = attraction.score_breakdown && attraction.score_breakdown.personalized;
        if (!personalized) return null;

        var topFactor = personalized.factors && personalized.factors[0];
        if (topFactor && topFactor.reasons && topFactor.reasons.length > 0) {
            return topFactor.reasons[0];
        }
        if (personalized.matchedTags && personalized.matchedTags.length > 0) {
            return 'תחומי עניין משותפים: ' + personalized.matchedTags.join(', ');
        }
        return null;
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
        { key: "popularity_score", label: "ציון כללי", render: function(val) { return <strong>{val}</strong>; } },
        { key: "personalized_score", label: "התאמה לטיול", render: function(val) { return <strong>{val ?? "—"}</strong>; } }
    ];

    if (loading) {
        return <div className="trip-detail-page"><TahiniLoader /></div>;
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
                </div>
                {trip.interests && trip.interests.length > 0 && (
                    <div className="trip-detail-interests">
                        <span>תחומי עניין: </span>
                        {trip.interests.map(function(t, i) {
                            return <span key={i} className="trip-detail-interest-tag">{t}</span>;
                        })}
                    </div>
                )}
                <button
                    type="button"
                    className="trip-detail-summary-btn"
                    onClick={handleSummarize}
                    disabled={summaryLoading}
                >
                    {summaryLoading ? "מכין סיכום..." : "✨ סכם את הטיול עם AI"}
                </button>
            </header>

            {(summary || summaryError) && (
                <section className={"trip-detail-summary" + (summaryError ? " trip-detail-summary--error" : "")}>
                    <h2>סיכום AI לטיול</h2>
                    {summaryError ? (
                        <p className="trip-detail-summary-text">{summaryError}</p>
                    ) : (
                        <p className="trip-detail-summary-text">{summary}</p>
                    )}
                </section>
            )}

            {/* gamification - tahini jar that fills with favorites */}
            <TahiniProgress
                current={favoriteAttractions.length}
                total={attractions.length}
            />

            {/* favorites section - only shown when there are favorites */}
            {favoriteAttractions.length > 0 && (
                <section className="trip-detail-section trip-favorites-section">
                    <h2>❤ המועדפים שלי בטיול הזה</h2>
                    <div className="trip-detail-grid">
                        {favoriteAttractions.map(function(attr) {
                            var score = attr.personalized_score
                                || (attr.audience_scores && attr.audience_scores[trip.travelStyle])
                                || attr.popularity_score;
                            return (
                                <div key={attr.id} className="trip-detail-card-wrapper">
                                    <div onClick={function() { setSelectedAttraction(attr); }}>
                                        <ItemCard
                                            title={attr.name_he}
                                            subtitle={getCityName(attr.city_id)}
                                            description={attr.description_he}
                                            imageUrl={attr.image_url}
                                            score={score}
                                            scoreHint={getScoreHint(attr)}
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

            {/* cards view - click to expand */}
            <section className="trip-detail-section">
                <h2>בחרו מועדפים</h2>
                <p className="trip-detail-hint">💡 לחצו על כרטיסיה לפרטים ופירוט הציון</p>
                {attractions.length === 0 ? (
                    <p className="trip-detail-empty">לא נמצאו אטרקציות</p>
                ) : (
                    <div className="trip-detail-grid">
                        {attractions.map(function(attr) {
                            var score = attr.personalized_score
                                || (attr.audience_scores && attr.audience_scores[trip.travelStyle])
                                || attr.popularity_score;
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
                                            scoreHint={getScoreHint(attr)}
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
                    travelStyle={trip.travelStyle}
                    onClose={function() { setSelectedAttraction(null); }}
                />
            )}
        </div>
    );
}

export default TripDetail;
