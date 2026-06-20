import { useContext, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import DataTable from "../components/DataTable";
import ItemCard from "../components/ItemCard";
import SearchBar from "../components/SearchBar";
import AttractionForm from "../components/AttractionForm";
import TahiniLoader from "../components/TahiniLoader";
import citiesService from "../services/citiesService";
import attractionsService from "../services/attractionsService";
import userContext from "../contexts/userContext";
import "./CityAttractions.css";

function CityAttractions() {
    const { id } = useParams();
    const { user } = useContext(userContext);

    // helpers to check role-based permissions (matches the server middleware)
    const isAdmin = user && user.userRole === "admin";
    const isManager = user && user.userRole === "manager"; // fixed: server uses "manager"
    const canEdit = isAdmin || isManager;     // admin + manager can edit
    const canDelete = isAdmin;                 // only admin can delete
    const canCreate = isAdmin;                 // only admin can create

    const [city, setCity] = useState(null);
    const [attractions, setAttractions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // search
    const [searchTerm, setSearchTerm] = useState("");

    // admin form state - either creating (showForm=true) or editing (editingAttr=obj)
    const [showForm, setShowForm] = useState(false);
    const [editingAttr, setEditingAttr] = useState(null);

    useEffect(function() {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

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

    // admin actions

    async function handleCreate(data) {
        try {
            await attractionsService.create(data);
            await loadData();
            setShowForm(false);
        } catch (err) {
            alert("שגיאה ביצירת אטרקציה: " + err.message);
            throw err; // re-throw so the form sees it
        }
    }

    async function handleUpdate(data) {
        try {
            await attractionsService.update(editingAttr.id, data);
            await loadData();
            setEditingAttr(null);
        } catch (err) {
            alert("שגיאה בעדכון אטרקציה: " + err.message);
            throw err;
        }
    }

    async function handleDelete(attrId, attrName) {
        if (!window.confirm("למחוק את האטרקציה \"" + attrName + "\"?")) return;
        try {
            await attractionsService.remove(attrId);
            await loadData();
        } catch (err) {
            alert("שגיאה במחיקת אטרקציה: " + err.message);
        }
    }

    // client-side search filter
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

    // table columns - admins get an extra "actions" column
    const baseColumns = [
        { key: "name_he",          label: "שם" },
        { key: "type",             label: "סוג",      render: renderType },
        { key: "popularity_score", label: "פופולריות", render: renderScore },
        { key: "tags",             label: "תגיות",    render: renderTags },
        { key: "best_months",      label: "חודשים מומלצים", render: renderMonths }
    ];

    const adminColumn = {
        key: "id",
        label: "פעולות",
        render: function(_, row) {
            return (
                <div className="city-row-actions">
                    {canEdit && (
                        <button
                            className="city-action-btn"
                            onClick={function() { setEditingAttr(row); }}
                            title="עריכה"
                        >
                            ✏
                        </button>
                    )}
                    {canDelete && (
                        <button
                            className="city-action-btn city-action-btn-danger"
                            onClick={function() { handleDelete(row.id, row.name_he); }}
                            title="מחיקה"
                        >
                            🗑
                        </button>
                    )}
                </div>
            );
        }
    };

    const columns = canEdit ? baseColumns.concat([adminColumn]) : baseColumns;

    if (loading) {
        return (
            <div className="city-page">
                <TahiniLoader />
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
                {city.summary_he && <p className="city-summary">{city.summary_he}</p>}
            </header>

            {/* search + admin create button */}
            <div className="city-toolbar">
                <SearchBar
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="חיפוש אטרקציה לפי שם, תיאור או תגית..."
                />
                {canCreate && (
                    <button
                        className="city-add-btn"
                        onClick={function() { setShowForm(true); }}
                    >
                        + אטרקציה חדשה
                    </button>
                )}
            </div>

            {searchTerm && (
                <p className="city-search-count">
                    נמצאו {filteredAttractions.length} מתוך {attractions.length} אטרקציות
                </p>
            )}

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
                                <div key={attr.id} className="city-card-wrapper">
                                    <ItemCard
                                        title={attr.name_he}
                                        description={attr.description_he}
                                        imageUrl={attr.image_url}
                                        badge={typeLabel(attr.type)}
                                        score={attr.popularity_score}
                                        tags={attr.tags}
                                    />
                                    {/* admin action buttons under the card */}
                                    {canEdit && (
                                        <div className="city-card-actions">
                                            <button
                                                onClick={function() { setEditingAttr(attr); }}
                                            >
                                                ✏ עריכה
                                            </button>
                                            {canDelete && (
                                                <button
                                                    onClick={function() { handleDelete(attr.id, attr.name_he); }}
                                                >
                                                    🗑 מחיקה
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* create or edit modal */}
            {showForm && (
                <AttractionForm
                    cityId={parseInt(id)}
                    onSave={handleCreate}
                    onCancel={function() { setShowForm(false); }}
                />
            )}

            {editingAttr && (
                <AttractionForm
                    cityId={parseInt(id)}
                    initialData={editingAttr}
                    onSave={handleUpdate}
                    onCancel={function() { setEditingAttr(null); }}
                />
            )}
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
