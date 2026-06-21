import "./ScoreBreakdown.css";

function ScoreBreakdown({ breakdown, highlightStyle }) {
    if (!breakdown) return null;

    var personalized = breakdown.personalized;
    var popularity = breakdown.popularity;

    return (
        <div className="score-breakdown">
            {personalized && (
                <div className="score-breakdown-block score-breakdown-block--main">
                    <div className="score-breakdown-header">
                        <h3>למה הציון הזה?</h3>
                        <span className="score-breakdown-total">{personalized.score} / 100</span>
                    </div>
                    <p className="score-breakdown-sub">
                        ציון התאמה אישית לטיול שלך
                    </p>

                    {personalized.factors.map(function(factor, index) {
                        return (
                            <div key={index} className="score-breakdown-factor">
                                <div className="score-breakdown-factor-head">
                                    <span className="score-breakdown-factor-label">{factor.label}</span>
                                    <span className="score-breakdown-factor-meta">
                                        {factor.score} · {factor.weight}
                                    </span>
                                </div>
                                <div className="score-breakdown-bar">
                                    <div
                                        className="score-breakdown-bar-fill"
                                        style={{ width: factor.score + '%' }}
                                    />
                                </div>
                                <ul className="score-breakdown-reasons">
                                    {(factor.reasons || []).map(function(reason, i) {
                                        return <li key={i}>{reason}</li>;
                                    })}
                                </ul>
                            </div>
                        );
                    })}
                </div>
            )}

            {popularity && (
                <div className="score-breakdown-block">
                    <div className="score-breakdown-header">
                        <h3>פופולריות כללית</h3>
                        <span className="score-breakdown-total">{popularity.score} / 100</span>
                    </div>
                    <ul className="score-breakdown-reasons">
                        {(popularity.reasons || []).map(function(reason, i) {
                            return <li key={i}>{reason}</li>;
                        })}
                    </ul>
                </div>
            )}

            {breakdown.audience && highlightStyle && breakdown.audience[highlightStyle] && (
                <div className="score-breakdown-block">
                    <div className="score-breakdown-header">
                        <h3>פירוט לסגנון הטיול שלך</h3>
                        <span className="score-breakdown-total">
                            {breakdown.audience[highlightStyle].score} / 100
                        </span>
                    </div>
                    <ul className="score-breakdown-reasons">
                        {breakdown.audience[highlightStyle].reasons.map(function(reason, i) {
                            return <li key={i}>{reason}</li>;
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default ScoreBreakdown;
