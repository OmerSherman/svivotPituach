// pages/CityAttractions.jsx
// Page showing all attractions for a single city.
// - URL: /cities/:id
// - Fetches the city + its attractions from the backend
// - Renders the data in two complementary ways:
//     1) DataTable  (Assignment 3 requirement #7 - "Data Table Component")
//     2) ItemCard grid (Assignment 3 requirement #6 - "Card reused at least 3 times")

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import DataTable from "../components/DataTable";
import ItemCard from "../components/ItemCard";
import citiesService from "../services/citiesService";
import attractionsService from "../services/attractionsService";
import "./CityAttractions.css";

function CityAttractions() {
    const { id } = useParams();

    const [city, setCity] = useState(null);
    const [attractions, setAttractions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(function() {
        async function loadData() {
            setLoading(true);
            setError("");
            try {
                // fetch in parallel
                const [cityData, attractionsData] = await Promise.all([
                    citiesService.getById(id),
                    attractionsService.getAll({ cityId: id })
                ]);
                setCity(cityData);
                setAttractions(attractionsData);
            } catch (err) {
                setError("טעינת הנתונים נכשלה: " + err.message);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [id]);

    // describe the columns of the data table - this is the dynamic mapping
    // the assignment asks for: "Dynamically map over an array of data".
    const columns = [
        { key: "name_he",          label: "שם" },
        { key: "type",             label: "סוג",      render: renderType },
        { key: "popularity_score", label: "פופולריות", render: renderScore },
        { key: "tags",             label: "תגיות",    render: renderTags },
        { key: "best_months",      label: "חודשים מומלצים", render: renderMonths }
    ];

    if (loading) {
        return (
            <div className="city-page">
                <p className="city-loading">טוען נתוני העיר...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="city-page">
                <p className="city-error">{error}</p>
                <Link to="/" className="city-back-link">חזרה לדף הבית</Link>
            </div>
        );
    }

    if (!city) {
        return (
            <div className="city-page">
                <p className="city-empty">העיר לא נמצאה</p>
                <Link to="/" className="city-back-link">חזרה לדף הבית</Link>
            </div>
        );
    }

    return (
        <div className="city-page">
            {/* city header */}
            <header className="city-header">
                <Link to="/" className="city-back-link">← חזרה לדף הבית</Link>
                <h1>{city.name_he}</h1>
                <p className="city-subtitle">{city.name}</p>
                {city.summary_he && <p className="city-summary">{city.summary_he}</p>}
            </header>

            {/* DataTable - assignment requirement #7 */}
            <section className="city-section">
                <h2>טבלת אטרקציות</h2>
                <DataTable
                    columns={columns}
                    rows={attractions}
                    rowKey="id"
                    emptyMessage="לא נמצאו אטרקציות בעיר זו"
                />
            </section>

            {/* ItemCard grid - reuse #3 of the card */}
            <section className="city-section">
                <h2>כרטיסיות אטרקציות</h2>
                {attractions.length === 0 ? (
                    <p className="city-empty">לא נמצאו אטרקציות בעיר זו</p>
                ) : (
                    <div className="city-grid">
                        {attractions.map(function(attr) {
                            return (
                                <ItemCard
                                    key={attr.id}
                                    title={attr.name_he}
                                    subtitle={attr.name}
                                    description={attr.description_he}
                                    imageUrl={attr.image_url}
                                    badge={typeLabel(attr.type)}
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

// ---------- small render helpers used by the DataTable columns ----------

function typeLabel(type) {
    if (type === "site")  return "אתר";
    if (type === "tour")  return "סיור";
    if (type === "route") return "מסלול";
    return type;
}

function renderType(type) {
    return <span className="dt-chip">{typeLabel(type)}</span>;
}

function renderScore(score) {
    if (score === undefined || score === null) return "—";
    return <strong>{score}</strong>;
}

function renderTags(tags) {
    if (!tags || tags.length === 0) return "—";
    return (
        <>
            {tags.slice(0, 4).map(function(tag, index) {
                return <span key={index} className="dt-chip">{tag}</span>;
            })}
        </>
    );
}

function renderMonths(months) {
    if (!months || months.length === 0) return "כל השנה";
    return months.join(", ");
}

export default CityAttractions;
