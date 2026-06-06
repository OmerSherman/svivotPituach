import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import DataTable from "../components/DataTable";
import ItemCard from "../components/ItemCard";
import SearchBar from "../components/SearchBar";
import citiesService from "../services/citiesService";
import attractionsService from "../services/attractionsService";
import "./CityAttractions.css";

function CityAttractions() {
    const { id } = useParams();

    const [city, setCity] = useState(null);
    const [attractions, setAttractions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // search state (client-side filtering)
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(function() {
        async function loadData() {
            setLoading(true);
            setError("");
            try {
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

    // filter attractions by search term - checks name, description, and tags
    function matchesSearch(attr) {
        if (searchTerm.trim() === "") return true;
        const term = searchTerm.trim().toLowerCase();

        if (attr.name_he && attr.name_he.includes(searchTerm)) return true;
        if (attr.name && attr.name.toLowerCase().includes(term)) return true;
        if (attr.description_he && attr.description_he.includes(searchTerm)) return true;
        if (attr.tags && attr.tags.some(function(t) { return t.includes(searchTerm); })) return true;

        return false;
    }

    const filteredAttractions = attractions.filter(matchesSearch);

    // table columns
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
            <header className="city-header">
                <Link to="/" className="city-back-link">← חזרה לדף הבית</Link>
                <h1>{city.name_he}</h1>
                <p className="city-subtitle">{city.name}</p>
                {city.summary_he && <p className="city-summary">{city.summary_he}</p>}
            </header>

            {/* search bar for attractions */}
            <div className="city-search-wrapper">
                <SearchBar
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="חיפוש אטרקציה לפי שם, תיאור או תגית..."
                />
                {searchTerm && (
                    <p className="city-search-count">
                        נמצאו {filteredAttractions.length} מתוך {attractions.length} אטרקציות
                    </p>
                )}
            </div>

            {/* table view */}
            <section className="city-section">
                <h2>טבלת אטרקציות</h2>
                <DataTable
                    columns={columns}
                    rows={filteredAttractions}
                    rowKey="id"
                    emptyMessage={
                        searchTerm
                            ? "לא נמצאו אטרקציות התואמות לחיפוש"
                            : "לא נמצאו אטרקציות בעיר זו"
                    }
                />
            </section>

            {/* cards view */}
            <section className="city-section">
                <h2>כרטיסיות אטרקציות</h2>
                {filteredAttractions.length === 0 ? (
                    <p className="city-empty">
                        {searchTerm
                            ? "לא נמצאו אטרקציות התואמות לחיפוש"
                            : "לא נמצאו אטרקציות בעיר זו"}
                    </p>
                ) : (
                    <div className="city-grid">
                        {filteredAttractions.map(function(attr) {
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

// helpers for the table cells

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
