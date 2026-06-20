# שביל הטחינה (Shvil HaTahina)

אפליקציית תכנון טיולים לדרום אמריקה — ערים, אטרקציות, פרופילי טיול, פורום צ'אט בזמן אמת, ועוזר AI לתכנון.

**קורס:** סביבות פיתוח באינטרנט · אוניברסיטת בן-גוריון בנגב  
**צוות:** Omer Sherman · Hillel Zilberman · Michal Adam

---

## תוכן עניינים

1. [יכולות האפליקציה](#יכולות-האפליקציה)
2. [דרישות מקדימות](#דרישות-מקדימות)
3. [התקנה והרצה](#התקנה-והרצה)
4. [משתמשי בדיקה](#משתמשי-בדיקה)
5. [מבנה הפרויקט](#מבנה-הפרויקט)
6. [בסיס נתונים: Prisma מול ORM ידני](#בסיס-נתונים-prisma-מול-orm-ידני)
7. [API — REST](#api--rest)
8. [WebSockets](#websockets)
9. [AI](#ai)
10. [Tech Stack](#tech-stack)

---

## יכולות האפליקציה

- התחברות והרשמה (user / manager / admin)
- עיון בערים ואטרקציות בדרום אמריקה
- יצירת פרופיל טיול: יעד, חודשים, סגנון, תקציב, תחומי עניין
- ניקוד אטרקציות מותאם אישית + הסבר "למה הציון הזה?"
- מועדפים לכל טיול (טבלת junction `trip_attraction`)
- העדפות תצוגה לכל משתמש: theme, fontSize, density
- פורום צ'אט לפי מדינה/עיר (Socket.IO + MySQL)
- תכנון טיול בשיחה עם AI (WebSocket) + סיכום טיול (REST)
- ניהול משתמשים ואטרקציות (admin/manager)
- מפות Leaflet בפורום ובאטרקציות

---

## דרישות מקדימות

| כלי | גרסה |
|-----|------|
| Node.js | 18+ |
| MySQL | 8.0+ |
| npm | מגיע עם Node |

---

## התקנה והרצה

### 1. Clone והתקנת חבילות

```powershell
cd Server
npm install

cd ../client
npm install
```

### 2. הגדרת משתני סביבה

**Server** — העתיקי `Server/.env.example` ל-`Server/.env` ומלאי:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=YOUR_PASSWORD
DB_NAME=mydb
DATABASE_URL=mysql://root:YOUR_PASSWORD@localhost:3306/mydb
GROQ_API_KEY=YOUR_GROQ_KEY
GROQ_MODEL=llama-3.3-70b-versatile
```

**Client** — העתיקי `client/.env.example` ל-`client/.env`:

```env
PORT=5173
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_SOCKET_URL=http://localhost:3000
```

### 3. ייבוא בסיס הנתונים

> **חשוב:** ייבוא דרך PowerShell (`Get-Content | mysql`) עלול לשבור עברית. השתמשי בסקריפט Node:

```powershell
# מהשורש של הפרויקט
node fix-db-encoding.js
```

הסקריפט:
- מייבא את `mydb_dump.sql` עם קידוד UTF-8
- יוצר את טבלת `message` לפורום
- מציג דוגמת ערים בעברית לאימות

**אלטרנטיבה — DB ריק (ללא נתוני seed):**

```powershell
cd Server
npm run db:push
```

### 4. הרצה (שני טרמינלים)

```powershell
# טרמינל 1 — Backend
cd Server
npm start
# → http://localhost:3000

# טרמינל 2 — Frontend
cd client
npm start
# → http://localhost:5173
```

### 5. Prisma Studio (אופציונלי — צפייה ב-DB)

```powershell
cd Server
npm run db:studio
```

---

## משתמשי בדיקה

סיסמה לכולם: `123456`

| Email | Role |
|-------|------|
| michal@example.com | admin |
| omersherman22@gmail.com | admin |
| hillel@example.com | manager |
| user@example.com | user |

---

## מבנה הפרויקט

```
svivotPituach/
├── client/                     # React SPA (פורט 5173)
│   └── src/
│       ├── App.js              # routing + context
│       ├── pages/              # Home, TripDetail, Forum, Settings...
│       ├── components/         # Navbar, ItemCard, ForumChat, AiTripChatModal...
│       ├── services/           # api.js, tripsService, socket.js...
│       └── contexts/           # userContext, preferencesContext
│
├── Server/                     # Express + Socket.IO (פורט 3000)
│   ├── app.js                  # entry point
│   ├── db.js                   # mysql2 pool + Prisma client export
│   ├── routes/                 # REST routers
│   ├── controllers/            # business logic
│   ├── ORM/                    # mysql2 queries (runtime DB access)
│   ├── socket/                 # forum_socket.js, aiTripSocket.js
│   ├── services/               # groqService.js
│   ├── prisma/schema.prisma    # DB schema definition
│   └── migrations/001_init.sql
│
├── mydb_dump.sql               # seed data (Omer)
├── fix-db-encoding.js          # import script (UTF-8 safe)
├── ARCHITECTURE.md             # מסמך ארכיטקטורה מפורט
└── README.md
```

---

## בסיס נתונים: Prisma מול ORM ידני

### התשובה הקצרה

**שניהם מדברים עם אותו MySQL (`mydb`), אבל לתפקידים שונים:**

| | Prisma | ORM ידני (`Server/ORM/`) |
|---|--------|--------------------------|
| **מה זה** | כלי הגדרת סכמה + migrations | שכבת גישה ל-DB בזמן ריצה |
| **איפה מוגדר** | `Server/prisma/schema.prisma` | `Server/ORM/*.js` |
| **איך שואלים DB** | `prisma.user.findMany()` | `pool.query('SELECT ...')` |
| **מתי בשימוש** | פיתוח, `db:push`, Studio | **כל בקשת API בזמן ריצה** |
| **מי קורא** | מפתחים (`npm run db:*`) | controllers → ORM → mysql2 |

**Prisma לא "מחובר" ל-ORM הידני בקוד** — אין שכבת גשר. שניהם פונים לאותה DB בנפרד.

### דיאגרמה

```
                    ┌─────────────────────────┐
                    │   MySQL — mydb          │
                    │   (8 tables)            │
                    └───────────┬─────────────┘
                                │
              ┌─────────────────┴─────────────────┐
              │                                   │
              ▼                                   ▼
   ┌──────────────────────┐          ┌──────────────────────┐
   │  Prisma              │          │  mysql2 pool (db.js) │
   │  schema.prisma       │          │                      │
   │  npm run db:push     │          │  UserORM.js          │
   │  npm run db:studio   │          │  TripORM.js          │
   │                      │          │  AttractionORM.js    │
   │  ❌ לא בשימוש ב-API  │          │  CityORM.js ...      │
   └──────────────────────┘          └──────────┬───────────┘
                                                │
                                                ▼
                                     ┌──────────────────────┐
                                     │  controllers/        │
                                     │  (auth, profiles,    │
                                     │   attractions...)    │
                                     └──────────────────────┘
```

### חיבור טכני — `Server/db.js`

```javascript
// זה מה שה-ORM משתמש בו בזמן ריצה:
const pool = mysql.createPool({ database: 'mydb', charset: 'utf8mb4', ... });
module.exports = pool;

// Prisma client — נוצר אבל controllers לא קוראים לו:
module.exports.prisma = new PrismaClient();
```

### טבלאות

| טבלה | Prisma model | ORM |
|------|--------------|-----|
| `user` | User | UserORM |
| `country` | Country | — (אין API, רק scraper) |
| `city` | City | CityORM |
| `attraction` | Attraction | AttractionORM |
| `trip` | Trip | TripORM |
| `trip_attraction` | TripAttraction | TripORM (favorites) |
| `settings` | Settings | SettingsORM |
| `message` | Message | MessageORM |

### פקודות Prisma שימושיות

```powershell
cd Server
npm run db:generate   # יוצר @prisma/client מ-schema
npm run db:push       # מסנכרן schema → MySQL (DB ריק/חדש)
npm run db:studio     # UI לצפייה ועריכה ב-DB
```

---

## API — REST

כל התשובות בפורmat:

```json
{ "success": true, "data": {}, "error": null }
```

**אימות:** headers `x-user-id` ו-`x-user-role` (לאחר login, הלקוח שולח אותם אוטומטית).

### Auth

| Method | Path | תיאור |
|--------|------|--------|
| POST | `/api/auth/register` | הרשמה |
| POST | `/api/auth/login` | התחברות |
| POST | `/api/auth/logout` | התנתקות |

### Users

| Method | Path | הרשאה |
|--------|------|--------|
| GET | `/api/users/me` | logged in |
| PUT | `/api/users/me` | logged in |
| GET | `/api/users` | admin |
| GET | `/api/users/:id` | open |
| POST | `/api/users` | admin |
| PUT | `/api/users/:id` | admin/manager |
| DELETE | `/api/users/:id` | admin or self |

### Cities

| Method | Path | תיאור |
|--------|------|--------|
| GET | `/api/cities` | כל הערים |
| GET | `/api/cities/search?q=` | חיפוש |
| GET | `/api/cities/:id` | עיר בודדת |

### Attractions

| Method | Path | הרשאה |
|--------|------|--------|
| GET | `/api/attractions` | logged in |
| GET | `/api/attractions/map?city_id=` | logged in |
| GET | `/api/attractions/:id` | logged in |
| POST | `/api/attractions` | admin |
| PUT | `/api/attractions/:id` | admin/manager |
| DELETE | `/api/attractions/:id` | admin |

Query params ל-GET `/api/attractions`:
- `type`, `city_id`
- `travelStyle`, `startMonth`, `endMonth`, `interests` — לניקוד מותאם אישית

### Trips (Profile)

| Method | Path | תיאור |
|--------|------|--------|
| GET | `/api/profile` | הטיולים שלי |
| POST | `/api/profile` | יצירת טיול |
| GET | `/api/profile/:id` | טיול בודד |
| PUT | `/api/profile/:id` | עדכון |
| DELETE | `/api/profile/:id` | מחיקה |
| POST | `/api/profile/:id/favorites` | toggle מועדף `{ attractionId }` |

### Settings

| Method | Path | תיאור |
|--------|------|--------|
| GET | `/api/settings` | פרופיל + העדפות תצוגה |
| PUT | `/api/settings` | עדכון |

### Forum

| Method | Path | תיאור |
|--------|------|--------|
| GET | `/api/forum/:room/messages` | 50 הודעות אחרונות (למשל `country_1`, `city_3`) |

### AI (REST)

| Method | Path | Body | תיאור |
|--------|------|------|--------|
| POST | `/api/ai/trip-summary` | `{ tripId }` | סיכום AI לטיול קיים |

> דורש `GROQ_API_KEY` ב-`.env`

---

## WebSockets

חיבור: `REACT_APP_SOCKET_URL` (ברירת מחדל `http://localhost:3000`)

### פורום — `forum_socket.js`

| Client → Server | תיאור |
|-----------------|--------|
| `room:join` | `{ room }` |
| `room:leave` | `{ room }` |
| `message:send` | `{ room, userId, userName, text }` |

| Server → Client | תיאור |
|-----------------|--------|
| `message:new` | הודעה חדשה (נשמרת ב-MySQL) |
| `presence:update` | `{ room, count }` |
| `message:error` | שגיאה |

### AI Trip Chat — `aiTripSocket.js`

חיבור עם `auth: { userId }`.

| Client → Server | תיאור |
|-----------------|--------|
| `ai-trip:start` | התחלת שיחה |
| `ai-trip:user-message` | `{ text }` |
| `ai-trip:reset` | איפוס |

| Server → Client | תיאור |
|-----------------|--------|
| `ai-trip:bot-message` | `{ text, draft }` |
| `ai-trip:bot-typing` | `{ typing }` |
| `ai-trip:draft-ready` | `{ draft }` — טיוטה מוכנה לשמירה |
| `ai-trip:error` | שגיאה |

---

## AI

| ערוץ | פרוטוקול | שימוש |
|------|----------|-------|
| צ'אט תכנון טיול | WebSocket | שיחה → טיוטת טיול → שמירה ב-DB |
| סיכום טיול | REST `POST /api/ai/trip-summary` | טקסט סיכום לטיול קיים |

מודל ברירת מחדל: `llama-3.3-70b-versatile` (Groq).

---

## Tech Stack

| שכבה | טכנולוגיה |
|------|-----------|
| Frontend | React 19, React Router 7, Leaflet, Socket.IO Client |
| Backend | Node.js, Express 5, Socket.IO 4 |
| Database | MySQL 8, mysql2 (runtime), Prisma (schema) |
| AI | Groq SDK |
| Auth | Header-based (`x-user-id`, `x-user-role`) + localStorage |

---

## הערות

- המשתמש והעדפות נשמרים ב-`localStorage` — רענון לא מנתק.
- ייבוא DB: **תמיד** `node fix-db-encoding.js` (לא PowerShell pipe) לשמירת עברית.
- מסמך ארכיטקטורה מפורט: [`ARCHITECTURE.md`](./ARCHITECTURE.md)
- תיעוד API מורחב (Assignment 2): [`Server/docs/README.md`](./Server/docs/README.md)
