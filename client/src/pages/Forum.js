import { useState } from 'react';
import { MapContainer, TileLayer, Marker, CircleMarker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import ForumChat from '../components/ForumChat';
import './Forum.css';

// fix broken default marker icons under webpack / CRA
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

// one public room per country
var COUNTRIES = [
    { room: 'country_1', name: 'פרו',       lat: -9.19,   lng: -75.015 },
    { room: 'country_2', name: 'ארגנטינה',  lat: -38.416, lng: -63.616 },
    { room: 'country_3', name: 'ברזיל',     lat: -14.235, lng: -51.925 },
];

// one public room per city (matches mock_data/cities.json)
var CITIES = [
    { room: 'city_1', name: 'לימה',              lat: -12.046, lng: -77.043 },
    { room: 'city_2', name: 'בואנוס איירס',       lat: -34.604, lng: -58.382 },
    { room: 'city_3', name: "ריו דה ז'ניירו",    lat: -22.907, lng: -43.173 },
    { room: 'city_4', name: 'קוסקו',              lat: -13.532, lng: -71.967 },
];

function Forum() {
    var [selectedRoom, setSelectedRoom] = useState(null);
    var [selectedName, setSelectedName] = useState('');

    function openRoom(room, name) {
        setSelectedRoom(room);
        setSelectedName(name);
    }

    return (
        <div className="forum-page">
            <h2 className="forum-heading">פורום מטיילים — דרום אמריקה</h2>
            <p className="forum-sub">לחץ על מדינה או עיר במפה כדי להצטרף לצ׳אט הציבורי שלה</p>

            <div className="forum-layout">

                {/* ---- LEFT: Leaflet map ---- */}
                <div className="forum-map-wrap">
                    <MapContainer
                        center={[-18, -60]}
                        zoom={4}
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution="© OpenStreetMap contributors"
                        />

                        {/* country markers — default blue pin */}
                        {COUNTRIES.map(function(c) {
                            return (
                                <Marker key={c.room} position={[c.lat, c.lng]}>
                                    <Popup>
                                        <strong>{c.name}</strong>
                                        <br />
                                        <button
                                            className="forum-popup-btn"
                                            onClick={function() { openRoom(c.room, 'פורום ' + c.name); }}
                                        >
                                            כנס לצ׳אט
                                        </button>
                                    </Popup>
                                </Marker>
                            );
                        })}

                        {/* city markers — orange circle */}
                        {CITIES.map(function(c) {
                            return (
                                <CircleMarker
                                    key={c.room}
                                    center={[c.lat, c.lng]}
                                    radius={9}
                                    pathOptions={{ color: '#c0392b', fillColor: '#e67e22', fillOpacity: 0.9 }}
                                >
                                    <Popup>
                                        <strong>{c.name}</strong>
                                        <br />
                                        <button
                                            className="forum-popup-btn"
                                            onClick={function() { openRoom(c.room, 'פורום ' + c.name); }}
                                        >
                                            כנס לצ׳אט
                                        </button>
                                    </Popup>
                                </CircleMarker>
                            );
                        })}
                    </MapContainer>
                </div>

                {/* ---- RIGHT: chat panel ---- */}
                <div className="forum-chat-wrap">
                    {selectedRoom ? (
                        <ForumChat room={selectedRoom} roomName={selectedName} />
                    ) : (
                        <div className="forum-placeholder">
                            <span>📍</span>
                            <p>בחר מדינה או עיר במפה</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

export default Forum;
