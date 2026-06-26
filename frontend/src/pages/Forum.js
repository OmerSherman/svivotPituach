import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, CircleMarker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import ForumChat from '../components/ForumChat';
import ForumRoomList from '../components/ForumRoomList';
import countriesService from '../services/countriesService';
import citiesService from '../services/citiesService';
import MapResize from '../components/MapResize';
import TahiniLoader from '../components/TahiniLoader';
import './Forum.css';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon.default || markerIcon,
    iconRetinaUrl: markerIcon2x.default || markerIcon2x,
    shadowUrl: markerShadow.default || markerShadow,
});

function toCountryRoom(c) {
    return {
        room: 'country_' + c.id,
        name: c.name_he,
        lat: c.latitude,
        lng: c.longitude
    };
}

function toCityRoom(c) {
    return {
        room: 'city_' + c.id,
        name: c.name_he,
        lat: c.latitude,
        lng: c.longitude
    };
}

function Forum() {
    var [selectedRoom, setSelectedRoom] = useState(null);
    var [selectedName, setSelectedName] = useState('');
    var [forumCountries, setForumCountries] = useState([]);
    var [forumCities, setForumCities] = useState([]);
    var [loading, setLoading] = useState(true);
    var [loadError, setLoadError] = useState('');

    useEffect(function() {
        async function loadForumData() {
            try {
                const countries = await countriesService.getAll();
                const cities = await citiesService.getAll();
                setForumCountries(countries.map(toCountryRoom).filter(function(c) {
                    return c.lat != null && c.lng != null;
                }));
                setForumCities(cities.map(toCityRoom).filter(function(c) {
                    return c.lat != null && c.lng != null;
                }));
            } catch (err) {
                setLoadError('לא ניתן לטעון נתוני פורום: ' + err.message);
            } finally {
                setLoading(false);
            }
        }
        loadForumData();
    }, []);

    function openRoom(room, name) {
        setSelectedRoom(room);
        setSelectedName(name);
    }

    function closeRoom() {
        setSelectedRoom(null);
        setSelectedName('');
    }

    if (loading) {
        return (
            <div className="forum-page">
                <TahiniLoader />
            </div>
        );
    }

    return (
        <div className="forum-page">
            <header className="forum-header">
                <div className="forum-header-text">
                    <h2 className="forum-heading">פורום מטיילים — דרום אמריקה</h2>
                    <p className="forum-sub">
                        שתף טיפים, שאל שאלות והתחבר עם מטיילים בזמן אמת
                    </p>
                </div>
                <div className="forum-header-stats">
                    <span className="forum-stat">
                        <strong>{forumCountries.length}</strong> מדינות
                    </span>
                    <span className="forum-stat">
                        <strong>{forumCities.length}</strong> ערים
                    </span>
                </div>
            </header>

            {loadError && <p className="forum-load-error">{loadError}</p>}

            <div className="forum-layout">
                <ForumRoomList
                    countries={forumCountries}
                    cities={forumCities}
                    selectedRoom={selectedRoom}
                    onSelect={openRoom}
                />

                <div className="forum-map-wrap">
                    <MapContainer
                        center={[-18, -60]}
                        zoom={4}
                        className="forum-map"
                    >
                        <MapResize />
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution="© OpenStreetMap contributors"
                        />

                        {forumCountries.map(function(c) {
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

                        {forumCities.map(function(c) {
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

                    <div className="forum-map-legend">
                        <span className="forum-legend-item">
                            <span className="forum-legend-pin" />
                            מדינה
                        </span>
                        <span className="forum-legend-item">
                            <span className="forum-legend-dot" />
                            עיר
                        </span>
                    </div>
                </div>

                <div className="forum-chat-wrap">
                    {selectedRoom ? (
                        <ForumChat
                            room={selectedRoom}
                            roomName={selectedName}
                            onClose={closeRoom}
                        />
                    ) : (
                        <div className="forum-placeholder">
                            <div className="forum-placeholder-icon">💬</div>
                            <h3>ברוכים הבאים לפורום</h3>
                            <p>בחר מדינה או עיר מהרשימה או מהמפה כדי להצטרף לצ׳אט הציבורי</p>
                            <ul className="forum-placeholder-tips">
                                <li>שתף המלצות על מקומות שביקרת</li>
                                <li>שאל מטיילים אחרים על מסלולים ותקציב</li>
                                <li>ראה כמה משתמשים מחוברים בזמן אמת</li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Forum;
