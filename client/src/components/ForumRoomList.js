import { useState } from 'react';

function ForumRoomList({ countries, cities, selectedRoom, onSelect }) {
    var [tab, setTab] = useState('countries');
    var rooms = tab === 'countries' ? countries : cities;
    var tabLabel = tab === 'countries' ? 'מדינות' : 'ערים';

    return (
        <aside className="forum-room-list">
            <div className="forum-room-tabs">
                <button
                    type="button"
                    className={'forum-room-tab' + (tab === 'countries' ? ' forum-room-tab--active' : '')}
                    onClick={function() { setTab('countries'); }}
                >
                    מדינות
                </button>
                <button
                    type="button"
                    className={'forum-room-tab' + (tab === 'cities' ? ' forum-room-tab--active' : '')}
                    onClick={function() { setTab('cities'); }}
                >
                    ערים
                </button>
            </div>

            <p className="forum-room-list-label">{tabLabel} — בחר חדר צ׳אט</p>

            <ul className="forum-room-items">
                {rooms.map(function(item) {
                    var isActive = selectedRoom === item.room;
                    return (
                        <li key={item.room}>
                            <button
                                type="button"
                                className={'forum-room-item' + (isActive ? ' forum-room-item--active' : '')}
                                onClick={function() { onSelect(item.room, 'פורום ' + item.name); }}
                            >
                                <span className="forum-room-item-icon">
                                    {tab === 'countries' ? '🌎' : '🏙️'}
                                </span>
                                <span className="forum-room-item-name">{item.name}</span>
                                {isActive && <span className="forum-room-item-live">פעיל</span>}
                            </button>
                        </li>
                    );
                })}
            </ul>
        </aside>
    );
}

export default ForumRoomList;
