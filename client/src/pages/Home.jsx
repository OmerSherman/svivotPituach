// pages/Home.jsx
// Dashboard / Home page (Assignment 3 requirement #5).
// Fetches cities and attractions from the backend and shows them as cards.
// Demonstrates: loading state, error state, empty state, and reuse of ItemCard.

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ItemCard from "../components/ItemCard";
import citiesService from "../services/citiesService";
import attractionsService from "../services/attractionsService";
import authService from "../services/authService";
import "./Home.css";

function Home() {
    const navigate = useNavigate();

    // who is logged in (just for the greeting)
    const currentUser = authService.getStoredUser();

    // section 1 - cities
    const [cities, setCities] = useState([]);
    const [citiesLoading, setCitiesLoading] = useState(true);
    const [citiesError, setCitiesError] = useState("");

    // section 2 - top attractions
    const [topAttractions, setTopAttractions] = useState([]);
    const [attractionsLoading, setAttractionsLoading] = useState(true);
    const [attractionsError, setAttractionsError] = useState("");

    // fetch cities once on mount
    useEffect(function() {
        async function fetchCities() {
            try {
                const data = await citiesService.getAll();
                setCities(data);
            } catch (err) {
                setCitiesError("לא ניתן לטעון את הערים: " + err.message);
            } finally {
                setCitiesLoading(false);
            }
        }
        fetchCities();
    }, []);

    // fetch attractions once on mount
    useEffect(function() {
        async function fetchAttractions() {
            try {
                const data = await attractionsService.getAll();
                // sort by popularity (highest first) and take top 6
                const sorted = data
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

    return (
        <div className="home-page">
            {/* greeting */}
            <header className="home-hero">
                <h1>
                    {currentUser
                        ? "שלום " + currentUser.firstName + " 👋"
                        : "ברוכים הבאים לשביל הטחינה"}
                </h1>
                <p className="home-subtitle">
                    גלו את היעדים המומלצים ביותר בדרום אמריקה — ערים, אתרים, מסלולים וסיורים.
                </p>
            </header>

            {/* SECTION 1 - cities grid (ItemCard reuse #1) */}
            <section className="home-section">
                <h2>ערים שכדאי להכיר</h2>

                {citiesLoading && (
                    <p className="home-loading">טוען ערים...</p>
                )}

                {citiesError && (
                    <p className="home-error">{citiesError}</p>
                )}

                {!citiesLoading && !citiesError && cities.length === 0 && (
                    <p className="home-empty">לא נמצאו ערים להצגה.</p>
                )}

                {!citiesLoading && !citiesError && cities.length > 0 && (
                    <div className="home-grid">
                        {cities.map(function(city) {
                            return (
                                <ItemCard
                                    key={city.id}
                                    title={city.name_he}
                                    subtitle={city.name}
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

            {/* SECTION 2 - top attractions (ItemCard reuse #2) */}
            <section className="home-section">
                <h2>האטרקציות המובילות</h2>

                {attractionsLoading && (
                    <p className="home-loading">טוען אטרקציות...</p>
                )}

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
                                    subtitle={attr.name}
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
        </div>
    );
}

// little helper - turn the english type into a Hebrew label
function translateType(type) {
    if (type === "site")  return "אתר";
    if (type === "tour")  return "סיור";
    if (type === "route") return "מסלול";
    return type;
}

export default Home;
