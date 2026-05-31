import authService from "./authService";

function getStorageKey() {
    var user = authService.getStoredUser();
    return user ? "trips_" + user.userId : null;
}

function getAll() {
    var key = getStorageKey();
    if (!key) return [];
    try {
        return JSON.parse(localStorage.getItem(key)) || [];
    } catch (err) {
        return [];
    }
}

function getById(tripId) {
    var trips = getAll();
    return trips.find(function(t) { return t.id === tripId; }) || null;
}

function create(tripData) {
    var trips = getAll();
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
    save(trips);
    return newTrip;
}

function update(tripId, updates) {
    var trips = getAll();
    var index = trips.findIndex(function(t) { return t.id === tripId; });
    if (index === -1) return null;
    trips[index] = { ...trips[index], ...updates };
    save(trips);
    return trips[index];
}

function remove(tripId) {
    var trips = getAll().filter(function(t) { return t.id !== tripId; });
    save(trips);
}

function toggleFavorite(tripId, attractionId) {
    var trip = getById(tripId);
    if (!trip) return null;
    var favs = trip.favorites || [];
    if (favs.includes(attractionId)) {
        favs = favs.filter(function(id) { return id !== attractionId; });
    } else {
        favs.push(attractionId);
    }
    return update(tripId, { favorites: favs });
}

function save(trips) {
    var key = getStorageKey();
    if (key) localStorage.setItem(key, JSON.stringify(trips));
}

var tripsService = { getAll, getById, create, update, remove, toggleFavorite };
export default tripsService;
