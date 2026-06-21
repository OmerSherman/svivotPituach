import api from './api';

async function summarizeTrip(tripId) {
    const res = await api.post('/ai/trip-summary', { tripId: Number(tripId) });
    return res.data.summary;
}

const aiService = { summarizeTrip };
export default aiService;
