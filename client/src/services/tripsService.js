import api from "./api";

// server uses 'travelerType' and 'budgetLevel', the UI uses 'travelStyle' and 'budget'.
// these helpers translate between the two shapes.

function fromServer(p) {
    return {
        id: p.id,
        name: p.name,
        countryId: p.countryId,
        startMonth: p.startMonth,
        endMonth: p.endMonth,
        travelStyle: p.travelerType,
        budget: p.budgetLevel,
        interests: p.interests || [],
        favorites: p.favorites || [],
        createdAt: p.createdAt
    };
}

function toServer(t) {
    return {
        name: t.name,
        countryId: Number(t.countryId),
        startMonth: Number(t.startMonth),
        endMonth: Number(t.endMonth),
        travelerType: t.travelStyle,
        budgetLevel: t.budget,
        interests: t.interests || []
    };
}

async function getAll() {
    const res = await api.get("/profile");
    return res.data.map(fromServer);
}

async function getById(tripId) {
    const res = await api.get("/profile/" + tripId);
    return fromServer(res.data);
}

async function create(tripData) {
    const res = await api.post("/profile", toServer(tripData));
    return fromServer(res.data);
}

async function update(tripId, updates) {
    const res = await api.put("/profile/" + tripId, toServer(updates));
    return fromServer(res.data);
}

async function remove(tripId) {
    await api.del("/profile/" + tripId);
}

async function toggleFavorite(tripId, attractionId) {
    const res = await api.post("/profile/" + tripId + "/favorites", {
        attractionId: attractionId
    });
    return fromServer(res.data);
}

const tripsService = { getAll, getById, create, update, remove, toggleFavorite };
export default tripsService;