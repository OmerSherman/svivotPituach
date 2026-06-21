import "./AboutModal.css";

// shows an "about us" modal with project info
// props: onClose
function AboutModal({ onClose }) {

    // close when clicking the dark overlay (not the modal itself)
    function handleOverlayClick(e) {
        if (e.target.classList.contains("about-overlay")) {
            onClose();
        }
    }

    return (
        <div className="about-overlay" onClick={handleOverlayClick}>
            <div className="about-modal">
                <button className="about-close" onClick={onClose}>✕</button>

                <div className="about-header">
                    <span className="about-emoji">✈️</span>
                    <h2>על "שביל הטחינה"</h2>
                </div>

                <div className="about-content">
                    <p>
                        <strong>שביל הטחינה</strong> הוא מדריך טיולים אינטראקטיבי
                        לטיולים בדרום אמריקה — פרו, ארגנטינה, ברזיל וקולומביה.
                    </p>

                    <p>
                        השם נשען על המסורת הישראלית המפורסמת של אחרי-צבא:
                        טיול ארוך בדרום אמריקה. האפליקציה עוזרת לך לתכנן את הטיול
                        הבא שלך לפי העדפות אישיות וחושפת אותך ליעדים מקוריים שלא חשבת עליהם - אז אולי תצא קצת משביל החומוס?
                    </p>

                    <h3>איך זה עובד?</h3>
                    <ul>
                        <li>צור <strong>טיול חדש</strong> ובחר יעד, תאריכים, סגנון ותחומי עניין</li>
                        <li>האתר ימליץ לך על <strong>אטרקציות מותאמות אישית</strong> מתוך מסד נתונים מקיף</li>
                        <li>סמן אטרקציות כ<strong>מועדפים</strong> ותראה איך צנצנת הטחינה מתמלאת</li>
                        <li>נהל כמה טיולים מתוכננים במקביל — כל אחד עם פרופיל משלו</li>
                    </ul>

                    <h3>הצוות</h3>
                    <p>
                        Omer Sherman · Hillel Zilberman · Michal Adam<br/>
                        סטודנטים להנדסת תוכנה ומערכות מידע, אוניברסיטת בן-גוריון.
                    </p>

                    <p className="about-footer-note">
                        פרויקט סופי לקורס סביבות פיתוח באינטרנט
                    </p>
                </div>
            </div>
        </div>
    );
}

export default AboutModal;
