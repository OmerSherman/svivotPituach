import { useState } from "react";
import "./AttractionForm.css";

// modal for creating or editing an attraction
// props:
//   cityId - the city this attraction belongs to (used when creating)
//   initialData - existing attraction data (for editing). null when creating
//   onSave - async callback, receives the form data
//   onCancel - close callback
function AttractionForm({ cityId, initialData, onSave, onCancel }) {
    const isEdit = initialData != null;

    // initial values - use existing data if editing, defaults if creating
    const [name, setName] = useState(initialData ? initialData.name : "");
    const [nameHe, setNameHe] = useState(initialData ? initialData.name_he : "");
    const [type, setType] = useState(initialData ? initialData.type : "site");
    const [descriptionHe, setDescriptionHe] = useState(initialData ? initialData.description_he : "");
    const [imageUrl, setImageUrl] = useState(initialData ? (initialData.image_url || "") : "");
    const [popularity, setPopularity] = useState(initialData ? initialData.popularity_score : 7);
    const [tagsText, setTagsText] = useState(
        initialData && initialData.tags ? initialData.tags.join(", ") : ""
    );

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        // basic validation
        if (!name.trim() || !nameHe.trim()) {
            setError("שם בעברית ושם באנגלית הם שדות חובה");
            return;
        }
        if (!descriptionHe.trim()) {
            setError("תיאור הוא שדה חובה");
            return;
        }

        // parse tags - split by comma and clean up
        const tags = tagsText
            .split(",")
            .map(function(t) { return t.trim(); })
            .filter(function(t) { return t.length > 0; });

        // build the payload exactly like the server expects
        const data = {
            city_id: cityId,
            name: name.trim(),
            name_he: nameHe.trim(),
            type: type,
            description_he: descriptionHe.trim(),
            image_url: imageUrl.trim() || null,
            popularity_score: Number(popularity),
            tags: tags
        };

        setSaving(true);
        try {
            await onSave(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    // close when clicking the dark overlay (but not when clicking the modal itself)
    function handleOverlayClick(e) {
        if (e.target.classList.contains("attr-form-overlay")) {
            onCancel();
        }
    }

    return (
        <div className="attr-form-overlay" onClick={handleOverlayClick}>
            <div className="attr-form-modal">
                <button className="attr-form-close" onClick={onCancel}>✕</button>

                <h2>{isEdit ? "עריכת אטרקציה" : "אטרקציה חדשה"}</h2>

                <form onSubmit={handleSubmit}>
                    <div className="attr-form-row">
                        <label>
                            שם בעברית *
                            <input
                                type="text"
                                value={nameHe}
                                onChange={function(e) { setNameHe(e.target.value); }}
                                required
                            />
                        </label>

                        <label>
                            שם באנגלית *
                            <input
                                type="text"
                                value={name}
                                onChange={function(e) { setName(e.target.value); }}
                                required
                            />
                        </label>
                    </div>

                    <div className="attr-form-row">
                        <label>
                            סוג *
                            <select value={type} onChange={function(e) { setType(e.target.value); }}>
                                <option value="site">אתר</option>
                                <option value="tour">סיור</option>
                                <option value="route">מסלול</option>
                            </select>
                        </label>

                        <label>
                            פופולריות (1-10)
                            <input
                                type="number"
                                min="1"
                                max="10"
                                value={popularity}
                                onChange={function(e) { setPopularity(e.target.value); }}
                            />
                        </label>
                    </div>

                    <label className="attr-form-full">
                        תיאור בעברית *
                        <textarea
                            rows="4"
                            value={descriptionHe}
                            onChange={function(e) { setDescriptionHe(e.target.value); }}
                            required
                        />
                    </label>

                    <label className="attr-form-full">
                        URL לתמונה
                        <input
                            type="url"
                            value={imageUrl}
                            onChange={function(e) { setImageUrl(e.target.value); }}
                            placeholder="https://example.com/image.jpg"
                        />
                    </label>

                    <label className="attr-form-full">
                        תגיות (מופרדות בפסיק)
                        <input
                            type="text"
                            value={tagsText}
                            onChange={function(e) { setTagsText(e.target.value); }}
                            placeholder="טבע, היסטוריה, אוכל"
                        />
                    </label>

                    {error && <p className="attr-form-error">{error}</p>}

                    <div className="attr-form-actions">
                        <button type="button" onClick={onCancel} disabled={saving}>
                            ביטול
                        </button>
                        <button type="submit" className="attr-form-submit" disabled={saving}>
                            {saving ? "שומר..." : (isEdit ? "שמירה" : "יצירה")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AttractionForm;
