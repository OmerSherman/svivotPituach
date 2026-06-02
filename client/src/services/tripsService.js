import authService from "./authService";


function getStorageKey(userId) {
    return userId ? "trips_" + userId : null;
}

function getAll(userID) {
    var key = getStorageKey(userID);
    if (!key) return [];
    try {
        return JSON.parse(localStorage.getItem(key)) || [];
    } catch (err) {
        return [];
    }
}

function getById(userid, tripId) {
    var trips = getAll(userid);
    return trips.find(function(t) { return t.id === tripId; }) || null;
}

function create(userID , tripData) {
    var trips = getAll(userID);
    var newTrip = {
        id: "trip_" + Date.now(),
        name: tripData.name,
        countryId: Number(tripData.countryId),
        startMonth: Number(tripData.startMonth),
        endMonth: Number(tripData.endMonth),
        travelStyle: tripData.travelStyle,
        budget: tripData.budget,
        interests: tripData.interests || [],
        favorites: [],
        createdAt: new Date().toISOString()
    };
    trips.push(newTrip);
    save(userID, trips);
    return newTrip;
}

function update(userID , tripId, updates) {
    var trips = getAll();
    var index = trips.findIndex(function(t) { return t.id === tripId; });
    if (index === -1) return null;
    trips[index] = { ...trips[index], ...updates };
    save(trips);
    return trips[index];
}

function remove(userID, tripId) {
    var trips = getAll(userID).filter(function(t) { return t.id !== tripId; });
    save(trips);
}

function toggleFavorite(userID, tripId, attractionId) {
    var trip = getById(userID, tripId);
    if (!trip) return null;
    var favs = trip.favorites || [];
    if (favs.includes(attractionId)) {
        favs = favs.filter(function(id) { return id !== attractionId; });
    } else {
        favs.push(attractionId);
    }
    return update(userID, tripId, { favorites: favs });
}

function save(userID , trips) {
    var key = getStorageKey(userID);
    if (key) localStorage.setItem(key, JSON.stringify(trips));
}

var tripsService = { getAll, getById, create, update, remove, toggleFavorite };
export default tripsService;
