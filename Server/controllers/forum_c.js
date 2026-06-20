// Omer owns MessageORM - adjust the require path if needed
const MessageORM = require('../ORM/MessageORM');

// GET /api/forum/:room/messages
// returns the last 50 messages for a room (e.g. "country_1" or "city_2")
async function getMessages(req, res, next) {
    try {
        var room = req.params.room;

        if (!room) {
            return res.status(400).json({
                success: false,
                data: null,
                error: { code: 'VALIDATION_ERROR', message: 'room is required', details: {} }
            });
        }

        var messages = await MessageORM.findByRoom(room, 50);

        return res.status(200).json({ success: true, data: messages, error: null });
    } catch (err) {
        next(err);
    }
}

module.exports = { getMessages };
