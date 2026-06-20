import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ItemCard from "../components/ItemCard";
import TripForm from "../components/TripForm";
import AiTripChatModal from "../components/AiTripChatModal";
import SearchBar from "../components/SearchBar";
import TahiniLoader from "../components/TahiniLoader";
import citiesService from "../services/citiesService";
import attractionsService from "../services/attractionsService";
import tripsService from "../services/tripsService";
import userContext from "../contexts/userContext";
import "./Home.css";

// constants used in the trip cards
var COUNTRY_NAMES = { 1: "פרו", 2: "ארגנטינה", 3: "ברזיל", 4: "קולומביה" };
var STYLE_NAMES = { solo: "מוצ'ילר", couple: "רומנטי", family: "משפחתי", group: "קבוצתי" };
var BUDGET_NAMES = { low: "חסכוני", medium: "בינוני", high: "פרימיום" };
var MONTH_NAMES = ["", "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
                   "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];

function Home() {
    const navigate = useNavigate();
    const { user } = useContext(userContext);

    // cities - keep full list separately so we can restore it when search clears
    const [allCities, setAllCities] = useState([]);
    const [displayCities, setDisplayCities] = useState([]);
    const [citiesLoading, setCitiesLoading] = useState(true);
    const [citiesError, setCitiesError] = useState("");
    const [citySearch, setCitySearch] = useState("");

    // top attractions
    const [topAttractions, setTopAttractions] = useState([]);
    const [attractionsLoading, setAttractionsLoading] = useState(true);
    const [attractionsError, setAttractionsError] = useState("");

    // my trips
    const [trips, setTrips] = useState([]);
    const [tripsLoading, setTripsLoading] = useState(true);
    const [tripsError, setTripsError] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingTrip, setEditingTrip] = useState(null);
    const [showAiChat, setShowAiChat] = useState(false);

    // fetch cities on mount
    useEffect(function() {
        async function fetchCities() {
            try {
                const data = await citiesService.getAll();
                setAllCities(data);
                setDisplayCities(data);
            } catch (err) {
                setCitiesError("לא ניתן לטעון את הערים: " + err.message);
            } finally {
                setCitiesLoading(false);
            }
        }
        fetchCities();
    }, []);

    // debounced city search - waits 300ms before calling the api
    useEffect(function() {
        if (citySearch.trim() === "") {
            setDisplayCities(allCities);
            return;
        }

        const handler = setTimeout(async function() {
            try {
                const results = await citiesService.search(citySearch);
                setDisplayCities(results);
            } catch (err) {
                console.warn("city search failed:", err.message);
            }
        }, 300);

        return function() { clearTimeout(handler); };
    }, [citySearch, allCities]);

    // fetch top attractions on mount
    useEffect(function() {
        async function fetchAttractions() {
            try {
                const data = await attractionsService.getAll();
                const sorted = data
                    .filter(function(a) { return a.id <= 20 && a.popularity_score >= 80; })
                    .slice()
                    .sort(function(a, b) { return b.popularity_score - a.popularity_score; })
                    .slice(0, 6);
                setTopAttractions(sorted);
            } catch (err) {
                setAttractionsError("לא ניתן לטעון את האטרקציות: " + err.message);
            } finally {
                setAttractionsLoading(false);
            }
        }
        fetchAttractions();
    }, []);

    // fetch trips on mount
    useEffect(function() {
        loadTrips();
    }, []);

    async function loadTrips() {
        setTripsLoading(true);
        setTripsError("");
        try {
            const data = await tripsService.getAll();
            setTrips(data);
        } catch (err) {
            setTripsError("שגיאה בטעינת הטיולים: " + err.message);
        } finally {
            setTripsLoading(false);
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

    return (
        <div className="home-page">
            {/* hero / welcome header */}
            <header className="home-hero">
                <h1>
                    {user
                        ? "שלום " + user.firstName + " 👋"
                        : "ברוכים הבאים לשביל הטחינה"}
                </h1>
                <p className="home-subtitle">
                    גלו את היעדים המומלצים ביותר בדרום אמריקה — ערים, אתרים, מסלולים וסיורים.
                </p>
            </header>

            {/* section 1 - cities */}
            <section className="home-section">
                <h2>ערים שכדאי להכיר</h2>

                <SearchBar
                    value={citySearch}
                    onChange={setCitySearch}
                    placeholder="חיפוש עיר לפי שם..."
                />

                {citiesLoading && <TahiniLoader />}

                {citiesError && (
                    <p className="home-error">{citiesError}</p>
                )}

                {!citiesLoading && !citiesError && displayCities.length === 0 && (
                    <p className="home-empty">
                        {citySearch ? "לא נמצאו ערים התואמות לחיפוש." : "לא נמצאו ערים להצגה."}
                    </p>
                )}

                {!citiesLoading && !citiesError && displayCities.length > 0 && (
                    <div className="home-grid">
                        {displayCities.map(function(city) {
                            return (
                                <ItemCard
                                    key={city.id}
                                    title={city.name_he}
                                    description={city.summary_he}
                                    imageUrl={city.banner_image_url}
                                    badge="עיר"
                                    onClick={function() { navigate("/cities/" + city.id); }}
                                />
                            );
                        })}
                    </div>
                )}
            </section>

            {/* section 2 - top attractions */}
            <section className="home-section">
                <h2>האטרקציות המובילות</h2>

                {attractionsLoading && <TahiniLoader />}

                {attractionsError && (
                    <p className="home-error">{attractionsError}</p>
                )}

                {!attractionsLoading && !attractionsError && topAttractions.length === 0 && (
                    <p className="home-empty">לא נמצאו אטרקציות להצגה.</p>
                )}

                {!attractionsLoading && !attractionsError && topAttractions.length > 0 && (
                    <div className="home-grid">
                        {topAttractions.map(function(attr) {
                            return (
                                <ItemCard
                                    key={attr.id}
                                    title={attr.name_he}
                                    description={attr.description_he}
                                    imageUrl={attr.image_url}
                                    badge={translateType(attr.type)}
                                    score={attr.popularity_score}
                                    tags={attr.tags}
                                />
                            );
                        })}
                    </div>
                )}
            </section>

            {/* section 3 - my trips */}
            <section className="home-section" id="my-trips">
                <div className="home-trips-header">
                    <h2>הטיולים שלי</h2>
                    <div className="home-trips-header-actions">
                        <button className="home-add-trip-btn" onClick={function() { setShowForm(true); }}>
                            + טיול חדש
                        </button>
                        <button className="home-add-trip-btn home-add-trip-btn-ai" onClick={function() { setShowAiChat(true); }}>
                            תכנן לי טיול ✨
                        </button>
                    </div>
                </div>

                {tripsLoading && <TahiniLoader />}

                {tripsError && (
                    <p className="home-error">{tripsError}</p>
                )}

                {!tripsLoading && !tripsError && trips.length === 0 && (
                    <div className="home-trips-empty">
                        <p>עדיין אין טיולים מתוכננים</p>
                        <p>לחצו על "טיול חדש" כדי להתחיל לתכנן!</p>
                    </div>
                )}

                {!tripsLoading && !tripsError && trips.length > 0 && (
                    <div className="home-trips-grid">
                        {trips.map(function(trip) {
                            return (
                                <div key={trip.id} className="home-trip-card">
                                    <div className="home-trip-body"
                                         onClick={function() { navigate("/trips/" + trip.id); }}>
                                        <h3>{trip.name}</h3>
                                        <p className="home-trip-dest">
                                            📍 {COUNTRY_NAMES[trip.countryId] || "לא ידוע"}
                                        </p>
                                        <p className="home-trip-dates">
                                            📅 {MONTH_NAMES[trip.startMonth]} – {MONTH_NAMES[trip.endMonth]}
                                        </p>
                                        <div className="home-trip-tags">
                                            <span className="home-trip-tag">{STYLE_NAMES[trip.travelStyle]}</span>
                                            <span className="home-trip-tag">{BUDGET_NAMES[trip.budget]}</span>
                                            {trip.favorites && trip.favorites.length > 0 && (
                                                <span className="home-trip-tag home-trip-tag-fav">
                                                    ❤ {trip.favorites.length} מועדפים
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="home-trip-actions">
                                        <button onClick={function() { setEditingTrip(trip); }}>✏ עריכה</button>
                                        <button onClick={function() { handleDelete(trip.id); }}>🗑 מחיקה</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* trip form modal */}
            {showForm && (
                <TripForm onSave={handleCreate} onCancel={function() { setShowForm(false); }} />
            )}

            {editingTrip && (
                <TripForm
                    initialData={editingTrip}
                    onSave={handleUpdate}
                    onCancel={function() { setEditingTrip(null); }}
                />
            )}

            {showAiChat && (
                <AiTripChatModal
                    onConfirm={handleCreate}
                    onCancel={function() { setShowAiChat(false); }}
                />
            )}
        </div>
    );
}

function translateType(type) {
    if (type === "site")  return "אתר";
    if (type === "tour")  return "סיור";
    if (type === "route") return "מסלול";
    return type;
}

export default Home;
