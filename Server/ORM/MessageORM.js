// TEMPORARY in-memory store — replace this file with Omer's MySQL implementation.
// The interface expected by forum_socket.js and forum_c.js:
//   MessageORM.create({ room, userId, userName, text })  → saved message object
//   MessageORM.findByRoom(room, limit)                   → array of message objects (oldest first)

var nextId = 1;

// pre-loaded sample messages so the forum looks alive from the start
var messages = [
    { id: nextId++, room: 'country_1', userId: 2, userName: 'דניאל',    text: 'מישהו היה במאצ׳ו פיצ׳ו לאחרונה? כמה זמן לוקחת העלייה?',                        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5) },
    { id: nextId++, room: 'country_1', userId: 3, userName: 'מיכל',     text: 'אני הייתי לפני חודש! ה-Sun Gate לוקח בערך 3 שעות מ-Aguas Calientes.',          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4) },
    { id: nextId++, room: 'country_1', userId: 4, userName: 'יואב',     text: 'מומלץ לקחת הסעה? או להגיע ברגל?',                                                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3) },
    { id: nextId++, room: 'country_1', userId: 3, userName: 'מיכל',     text: 'ב-6 בבוקר יש אוטובוסים — אבל ללכת ברגל לאחור זה שווה את זה בשביל הנוף!',       createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) },

    { id: nextId++, room: 'country_2', userId: 5, userName: 'נועה',     text: 'בואנוס איירס הכי טוב להגיע באפריל — מזג אוויר מושלם',                          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6) },
    { id: nextId++, room: 'country_2', userId: 6, userName: 'אורי',     text: 'מסכים! ובסן טלמו חייבים לנסות את ה-empanadas ב-Mercado de San Telmo',           createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4) },
    { id: nextId++, room: 'country_2', userId: 5, userName: 'נועה',     text: 'איזה שכונה הכי מומלצת ללינה?',                                                   createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3) },
    { id: nextId++, room: 'country_2', userId: 7, userName: 'שירה',     text: 'Palermo Soho — מלא קפה, ברים ופארקים. מושלם לרגל',                              createdAt: new Date(Date.now() - 1000 * 60 * 30) },

    { id: nextId++, room: 'country_3', userId: 8, userName: 'תום',      text: 'ריו — מי יודע מתי הכי פחות עמוס בקופקבאנה?',                                    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8) },
    { id: nextId++, room: 'country_3', userId: 9, userName: 'ליאת',     text: 'בשעות הבוקר המוקדמות לפני 9 זה שקט יחסית',                                       createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6) },
    { id: nextId++, room: 'country_3', userId: 8, userName: 'תום',      text: 'תודה! ומה עם Christ the Redeemer — צריך להזמין מראש?',                          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5) },
    { id: nextId++, room: 'country_3', userId: 9, userName: 'ליאת',     text: 'כן! כרטיסים אוזלים מהר בתקופות שיא. הזמינו דרך האתר הרשמי',                      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4) },

    { id: nextId++, room: 'city_1',   userId: 2, userName: 'דניאל',    text: 'לימה — Miraflores או Barranco? לאיזה שכונה כדאי ללכת?',                          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3) },
    { id: nextId++, room: 'city_1',   userId: 3, userName: 'מיכל',     text: 'Barranco מלא אמנות רחוב וחיי לילה, Miraflores יותר שקט ובטוח.',                  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) },

    { id: nextId++, room: 'city_2',   userId: 5, userName: 'נועה',     text: 'מישהו היה בקבר אבן בלה? שווה את הכרטיס?',                                        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 7) },
    { id: nextId++, room: 'city_2',   userId: 6, userName: 'אורי',     text: 'בהחלט! בעיקר בערב — התאורה שם מדהימה',                                           createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6) },

    { id: nextId++, room: 'city_3',   userId: 8, userName: 'תום',      text: 'ריו — מומלץ לעלות ל-Sugarloaf בשקיעה, הנוף שם פשוט מטורף!',                     createdAt: new Date(Date.now() - 1000 * 60 * 60 * 10) },

    { id: nextId++, room: 'city_4',   userId: 4, userName: 'יואב',     text: 'קוסקו — כמה ימים מספיקים לפני שממשיכים למאצ׳ו פיצ׳ו?',                          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12) },
    { id: nextId++, room: 'city_4',   userId: 3, userName: 'מיכל',     text: 'לפחות 2 ימים לאקלום + לראות את העיר ההיסטורית',                                  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 11) },
];

var MessageORM = {

    // save a new message and return it (same shape a DB row would have)
    create: async function(data) {
        var msg = {
            id:        nextId++,
            room:      data.room,
            userId:    data.userId,
            userName:  data.userName,
            text:      data.text,
            createdAt: new Date()
        };
        messages.push(msg);
        return msg;
    },

    // return the last `limit` messages for a room, oldest first
    findByRoom: async function(room, limit) {
        var roomMessages = messages.filter(function(m) {
            return m.room === room;
        });
        return roomMessages.slice(-limit);
    }

};

module.exports = MessageORM;
