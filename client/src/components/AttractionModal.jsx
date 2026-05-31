import "./AttractionModal.css";

var MONTH_NAMES = ["", "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
                   "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];

var STYLE_LABELS = {
    family: { emoji: "👨‍👩‍👧", label: "משפחה" },
    couple: { emoji: "💑", label: "זוגי" },
    solo:   { emoji: "🎒", label: "מטייל יחיד" },
    group:  { emoji: "👥", label: "קבוצה" }
};

// props: attraction, cityName, onClose
function AttractionModal({ attraction, cityName, onClose }) {
    if (!attraction) return null;

    var bestMonths = attraction.best_months || [];
    var avoidMonths = attraction.avoid_months || [];
    var scores = attraction.audience_scores || {};

    // when user clicks the dark overlay (not the modal itself) - close
    function handleOverlayClick(e) {
        if (e.target.classList.contains("am-overlay")) {
            onClose();
        }
    }

    return (
        <div className="am-overlay" onClick={handleOverlayClick}>
            <div className="am-modal">
                <button className="am-close" onClick={onClose}>✕</button>

                {/* big image */}
                <div className="am-image">
                    {attraction.image_url ? (
                        <img src={attraction.image_url} alt={attraction.name_he} />
                    ) : (
                        <div className="am-image-placeholder">🌎</div>
                    )}
                </div>

                <div className="am-content">
                    <h2>{attraction.name_he}</h2>
                    <p className="am-subtitle">{attraction.name} · {cityName}</p>

                    {/* tags */}
                    {attraction.tags && attraction.tags.length > 0 && (
                        <div className="am-tags">
                            {attraction.tags.map(function(tag, i) {
                                return <span key={i} className="am-tag">{tag}</span>;
                            })}
                        </div>
                    )}

                    {/* full description */}
                    <p className="am-description">{attraction.description_he}</p>

                    {/* audience scores - who is this for */}
                    <div className="am-section">
                        <h3>למי זה מתאים?</h3>
                        <div className="am-scores">
                            {Object.keys(STYLE_LABELS).map(function(key) {
                                var score = scores[key] || 0;
                                var info = STYLE_LABELS[key];
                                return (
                                    <div key={key} className="am-score-row">
                                        <span className="am-score-label">
                                            {info.emoji} {info.label}
                                        </span>
                                        <div className="am-score-bar">
                                            <div
                                                className="am-score-fill"
                                                style={{ width: score + "%" }}
                                            />
                                        </div>
                                        <span className="am-score-num">{score}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* when to visit */}
                    <div className="am-section">
                        <h3>מתי הכי כדאי?</h3>
                        {bestMonths.length === 12 ? (
                            <p>כל השנה!</p>
                        ) : (
                            <div className="am-months">
                                {bestMonths.map(function(m) {
                                    return <span key={m} className="am-month am-month-good">{MONTH_NAMES[m]}</span>;
                                })}
                                {avoidMonths.length > 0 && avoidMonths.map(function(m) {
                                    return <span key={"a"+m} className="am-month am-month-bad">{MONTH_NAMES[m]} ⚠</span>;
                                })}
                            </div>
                        )}
                    </div>

                    {/* seasonal note */}
                    {attraction.seasonal_note_he && (
                        <div className="am-section">
                            <h3>הערה עונתית</h3>
                            <p className="am-note">💡 {attraction.seasonal_note_he}</p>
                        </div>
                    )}

                    {/* popularity */}
                    <div className="am-section">
                        <h3>ציון פופולריות כללי</h3>
                        <p className="am-pop"><strong>{attraction.popularity_score}</strong> / 100</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AttractionModal;
