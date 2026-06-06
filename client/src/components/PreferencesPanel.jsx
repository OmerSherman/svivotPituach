import { useContext, useEffect, useRef } from "react";
import preferencesContext from "../contexts/preferencesContext";
import userContext from "../contexts/userContext";
import settingsService from "../services/settingsService";
import "./PreferencesPanel.css";

// dropdown panel that lets the user pick theme, font size, density.
// shown right under the "תצוגה" button in the navbar.
// props: onClose (called when the user clicks outside)
function PreferencesPanel({ onClose }) {
    const { preferences, setPreferences } = useContext(preferencesContext);
    const { user } = useContext(userContext);
    const panelRef = useRef(null);

    // close the panel when the user clicks anywhere outside it
    useEffect(function() {
        function handleClickOutside(e) {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                // also ignore clicks on the toggle button itself
                if (!e.target.closest(".navbar-display-btn")) {
                    onClose();
                }
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return function() {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onClose]);

    // when the user picks a value - update context immediately, save to server in background
    function updatePref(key, value) {
        const newPrefs = { ...preferences, [key]: value };
        setPreferences(newPrefs);

        // save to server too (fire and forget - we don't block the ui)
        if (user) {
            settingsService.updatePreferences(newPrefs).catch(function(err) {
                console.warn("could not save preferences:", err.message);
            });
        }
    }

    // helper to render a row of toggle buttons for one preference
    function renderToggleRow(label, prefKey, options) {
        return (
            <div className="pp-row">
                <div className="pp-label">{label}</div>
                <div className="pp-options">
                    {options.map(function(opt) {
                        const isActive = preferences[prefKey] === opt.value;
                        return (
                            <button
                                key={opt.value}
                                type="button"
                                className={"pp-option" + (isActive ? " pp-option-active" : "")}
                                onClick={function() { updatePref(prefKey, opt.value); }}
                            >
                                {opt.label}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    }

    return (
        <div className="pp-panel" ref={panelRef}>
            <div className="pp-title">הגדרות תצוגה</div>

            {renderToggleRow("ערכת נושא", "theme", [
                { value: "light", label: "☀️ בהיר" },
                { value: "dark",  label: "🌙 כהה"  }
            ])}

            {renderToggleRow("גודל טקסט", "fontSize", [
                { value: "small",  label: "קטן"  },
                { value: "medium", label: "רגיל" },
                { value: "large",  label: "גדול" }
            ])}

            {renderToggleRow("צפיפות כרטיסיות", "density", [
                { value: "compact",  label: "קומפקטי" },
                { value: "normal",   label: "רגיל"    },
                { value: "spacious", label: "מרווח"   }
            ])}
        </div>
    );
}

export default PreferencesPanel;
