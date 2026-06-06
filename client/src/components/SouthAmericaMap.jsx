import { useNavigate } from "react-router-dom";
import "./SouthAmericaMap.css";

// converts lat/lng to x/y on our SVG viewBox (0 0 300 400)
// our map spans: latitude 12 to -55, longitude -82 to -34
function project(lat, lng) {
    const x = (lng + 82) * (300 / 48);
    const y = (12 - lat) * (400 / 67);
    return { x: x, y: y };
}

// props: cities (array from server)
function SouthAmericaMap({ cities }) {
    const navigate = useNavigate();

    return (
        <div className="sa-map-wrapper">
            <svg viewBox="0 0 300 400" className="sa-map-svg" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    {/* soft gradient for the continent */}
                    <linearGradient id="continentGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"  stopColor="#cde7d6"/>
                        <stop offset="100%" stopColor="#a3d0b1"/>
                    </linearGradient>
                </defs>

                {/* simplified outline of south america */}
                <path
                    className="sa-map-continent"
                    d="M 25 5
                       L 80 0
                       L 130 8
                       L 200 25
                       L 240 55
                       L 270 90
                       L 290 130
                       L 285 170
                       L 270 200
                       L 260 215
                       L 240 245
                       L 215 280
                       L 190 315
                       L 175 345
                       L 162 380
                       L 145 395
                       L 130 380
                       L 115 350
                       L 95 320
                       L 78 285
                       L 65 245
                       L 55 205
                       L 45 165
                       L 35 125
                       L 28 85
                       L 22 50
                       Z"
                    fill="url(#continentGrad)"
                    stroke="#7ab089"
                    strokeWidth="2"
                />

                {/* city dots */}
                {cities.map(function(city) {
                    const pos = project(city.latitude, city.longitude);
                    return (
                        <g
                            key={city.id}
                            className="sa-map-pin"
                            onClick={function() { navigate("/cities/" + city.id); }}
                        >
                            {/* outer pulsing ring */}
                            <circle cx={pos.x} cy={pos.y} r="12" className="sa-map-pulse"/>
                            {/* main dot */}
                            <circle cx={pos.x} cy={pos.y} r="6" className="sa-map-dot"/>
                            {/* city name label */}
                            <text
                                x={pos.x}
                                y={pos.y - 12}
                                className="sa-map-label"
                                textAnchor="middle"
                            >
                                {city.name_he}
                            </text>
                        </g>
                    );
                })}
            </svg>

            <p className="sa-map-hint">💡 לחצו על נקודה כדי לגלות אטרקציות בעיר</p>
        </div>
    );
}

export default SouthAmericaMap;
