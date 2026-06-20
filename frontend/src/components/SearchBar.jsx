import "./SearchBar.css";

// reusable search input
// props: value, onChange (called with new string), placeholder (optional)
function SearchBar({ value, onChange, placeholder }) {
    return (
        <div className="search-bar">
            <span className="search-bar-icon">🔍</span>
            <input
                type="text"
                value={value}
                onChange={function(e) { onChange(e.target.value); }}
                placeholder={placeholder || "חיפוש..."}
                className="search-bar-input"
            />
            {/* the X clear button - shown only when there's text */}
            {value && (
                <button
                    type="button"
                    className="search-bar-clear"
                    onClick={function() { onChange(""); }}
                    aria-label="נקה חיפוש"
                >
                    ✕
                </button>
            )}
        </div>
    );
}

export default SearchBar;
