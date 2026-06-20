import "./TahiniProgress.css";

// shows a tahini jar that fills based on how many favorites the user picked
// props: current (number of favorites), total (number of available attractions)
function TahiniProgress({ current, total }) {
    // calculate fill percentage and height
    const percentage = total === 0 ? 0 : Math.min(100, (current / total) * 100);
    const fillHeight = (percentage / 100) * 80;  // max fill is 80 units tall
    const fillY = 110 - fillHeight;              // fill grows up from y=110

    // pick a motivational message based on progress
    let message;
    if (total === 0)             message = "אין אטרקציות מתאימות לטיול הזה";
    else if (current === 0)      message = "התחילו לאסוף מועדפים!";
    else if (percentage === 100) message = "🎉 צנצנת מלאה!";
    else if (percentage >= 75)   message = "כמעט שם!";
    else if (percentage >= 50)   message = "חצי הדרך!";
    else if (percentage >= 25)   message = "צוברים תאוצה!";
    else                         message = "הוסיפו עוד מועדפים!";

    return (
        <div className="tahini-progress">
            <svg viewBox="0 0 100 130" width="80" height="100" className="tahini-jar">
                <defs>
                    {/* tahini color gradient */}
                    <linearGradient id="tahiniFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"  stopColor="#f0d9a8"/>
                        <stop offset="100%" stopColor="#d4ab66"/>
                    </linearGradient>
                </defs>

                {/* jar lid */}
                <rect x="20" y="15" width="60" height="12" rx="3" fill="#c97447"/>
                <rect x="20" y="15" width="60" height="3" fill="#a06035"/>

                {/* jar body */}
                <rect x="22" y="27" width="56" height="85" rx="4"
                      fill="#f8f5ee" stroke="#c4b89f" strokeWidth="2"/>

                {/* tahini fill - animated via CSS transition */}
                <rect x="24" y={fillY} width="52" height={fillHeight}
                      fill="url(#tahiniFill)"
                      className="tahini-fill-rect"/>

                {/* decorative sesame seeds on the jar */}
                <circle cx="35" cy="60" r="1.2" fill="#8a6d3e" opacity="0.55"/>
                <circle cx="50" cy="70" r="1.2" fill="#8a6d3e" opacity="0.55"/>
                <circle cx="65" cy="55" r="1.2" fill="#8a6d3e" opacity="0.55"/>
                <circle cx="42" cy="85" r="1.2" fill="#8a6d3e" opacity="0.55"/>
                <circle cx="60" cy="95" r="1.2" fill="#8a6d3e" opacity="0.55"/>
            </svg>

            <div className="tahini-progress-info">
                <div className="tahini-progress-count">{current} / {total}</div>
                <div className="tahini-progress-label">אטרקציות במועדפים</div>
                <div className="tahini-progress-message">{message}</div>
            </div>
        </div>
    );
}

export default TahiniProgress;
