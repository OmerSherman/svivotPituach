# ארכיטקטורת הפרויקט — שביל הטחינה

מסמך זה מתאר את המבנה המלא של האפליקציה: שכבות, זרימת מידע, בסיס נתונים, WebSockets, ואינטגרציית AI.

---

## תוכן עניינים

1. [סקירה כללית](#1-סקירה-כללית)
2. [מבנה התיקיות](#2-מבנה-התיקיות)
3. [ארכיטקטורת השרת (Backend)](#3-ארכיטקטורת-השרת-backend)
4. [ארכיטקטורת הלקוח (Frontend)](#4-ארכיטקטורת-הלקוח-frontend)
5. [בסיס הנתונים](#5-בסיס-הנתונים)
6. [אימות והרשאות](#6-אימות-והרשאות)
7. [זרימות מידע מפורטות](#7-זרימות-מידע-מפורטות)
8. [WebSockets](#8-websockets)
9. [אינטגרציית AI](#9-אינטגרציית-ai)
10. [אלגוריתם ניקוד אטרקציות](#10-אלגוריתם-ניקוד-אטרקציות)
11. [משתני סביבה והרצה](#11-משתני-סביבה-והרצה)
12. [נקודות חשובות ופערים ידועים](#12-נקודות-חשובות-ופערים-ידועים)

---

## 1. סקירה כללית

**שביל הטחינה** היא אפליקציית תכנון טיולים לדרום אמריקה. המערכת בנויה כ-**Full Stack** עם הפרדה ברורה בין לקוח לשרת.

```
┌─────────────────────────────────────────────────────────────────┐
│                        דפדפן (React SPA)                        │
│  localhost:5173  │  RTL עברית  │  Leaflet Maps  │  Socket.IO  │
└────────────────────────────┬────────────────────────────────────┘
                             │
              ┌──────────────┼──────────────┐
              │ REST (fetch) │  WebSocket   │
              ▼              ▼              │
┌─────────────────────────────────────────────────────────────────┐
│                   Node.js Server (Express 5)                    │
│  localhost:3000  │  REST API  │  Socket.IO  │  Groq AI        │
└────────────────────────────┬────────────────────────────────────┘
                             │ mysql2 pool (utf8mb4)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     MySQL — בסיס הנתונים mydb                    │
│  user │ city │ attraction │ trip │ trip_attraction │ message   │
└─────────────────────────────────────────────────────────────────┘
```

| שכבה | טכנולוגיה | תפקיד |
|------|-----------|--------|
| Frontend | React 19, React Router, Leaflet | ממשק משתמש, ניווט, מפות |
| API | Express 5, REST | CRUD, אימות, לוגיקה עסקית |
| Real-time | Socket.IO 4 | פורום צ'אט, תכנון טיול AI |
| AI | Groq SDK (Llama) | צ'אט לתכנון טיול, סיכום טיול |
| DB Runtime | mysql2 (connection pool) | כל השאילתות בזמן ריצה |
| DB Schema | Prisma | הגדרת סכמה, migrations, Studio |
| DB Engine | MySQL 8 | אחסון נתונים |

---

## 2. מבנה התיקיות

```
svivotPituach/
├── client/                    # React SPA (פורט 5173)
│   └── src/
│       ├── App.js             # ניתוב ראשי + Context
│       ├── pages/             # דפי האפליקציה
│       ├── components/        # רכיבי UI משותפים
│       ├── services/          # קריאות API ו-Socket
│       ├── contexts/          # userContext, preferencesContext
│       └── data/              # נתונים סטטיים (חדרי פורום)
│
├── Server/                    # Node.js Backend (פורט 3000)
│   ├── app.js                 # נקודת כניסה — Express + Socket.IO
│   ├── db.js                  # mysql2 pool + Prisma client
│   ├── routes/                # הגדרת endpoints
│   ├── controllers/           # לוגיקה עסקית
│   ├── ORM/                   # שכבת גישה ל-DB (SQL גולמי)
│   ├── services/              # Groq AI
│   ├── socket/                # forum_socket, aiTripSocket
│   ├── middleware/            # logger, roleCheck, checkFields
│   ├── utils/                 # attractionScoring, validateTripDraft
│   ├── prompts/               # פרומפטים ל-AI
│   ├── prisma/                # schema.prisma
│   └── migrations/            # SQL migrations
│
├── mydb_dump.sql              # גיבוי נתוני Omer
├── fix-db-encoding.js         # ייבוא dump עם UTF-8 תקין
└── import-db.ps1              # סקריפט ייבוא (PowerShell)
```

---

## 3. ארכיטקטורת השרת (Backend)

### 3.1 נקודת כניסה — `Server/app.js`

השרת בונה **שרת HTTP אחד** שמשרת גם REST וגם WebSocket:

```
app.js
  ├── dotenv.config()
  ├── cors (רק localhost:5173)
  ├── express.json()
  ├── logger middleware
  ├── mount 9 routers תחת /api/*
  ├── errorHandler (אחרון)
  ├── http.createServer(app)
  ├── new Server(io) — Socket.IO על אותו פורט
  ├── registerAiTripSocket(io)
  ├── registerForumSocket(io)
  └── server.listen(3000)
```

### 3.2 שכבת Routes → Controllers → ORM

כל בקשת API עוברת בשלוש שכבות:

```
HTTP Request
    → Route (מתאים URL + method)
        → Middleware (roleCheck / checkFields)
            → Controller (לוגיקה + ולידציה)
                → ORM (SQL)
                    → MySQL
    ← JSON Response
```

### 3.3 טבלת כל ה-API Endpoints

| Prefix | קובץ Route | דוגמאות Endpoints | Controller |
|--------|-----------|-------------------|------------|
| `/api/auth` | `auth_r.js` | POST `/login`, `/register`, `/logout` | `auth_c.js` |
| `/api/users` | `users_r.js` | GET `/me`, GET `/`, PUT `/:id` | `users_c.js` |
| `/api/profile` | `profiles_r.js` | CRUD טיולים + POST `/:id/favorites` | `profiles_c.js` |
| `/api/cities` | `cities_r.js` | GET `/`, `/search?q=`, `/:id` | `cities_c.js` |
| `/api/attractions` | `attractions_r.js` | GET `/`, `/map`, CRUD | `attractions_c.js` |
| `/api/favorites` | `favorites_r.js` | GET/POST/DELETE | `favorites_c.js` ⚠️ |
| `/api/settings` | `settings_r.js` | GET/PUT `/` | `settings_c.js` |
| `/api/forum` | `forum_r.js` | GET `/:room/messages` | `forum_c.js` |
| `/api/ai` | `ai_r.js` | POST `/trip-summary` | `ai_c.js` |

> ⚠️ `/api/favorites` משתמש במערך בזיכרון — לא ב-DB (ראו סעיף 12).

### 3.4 Controllers — מה כל אחד עושה

| Controller | אחריות עיקרית |
|------------|---------------|
| `auth_c.js` | הרשמה והתחברות — מחזיר `{ userId, firstName, userRole }` |
| `users_c.js` | CRUD משתמשים; `getMe` / `updateMe` לפי header |
| `profiles_c.js` | ניהול **טיולים** (profiles) — CRUD + מועדפים |
| `attractions_c.js` | אטרקציות + **ניקוד דינמי** (`enrichAttraction`) |
| `cities_c.js` | ערים — קריאה בלבד |
| `forum_c.js` | היסטוריית הודעות (50 אחרונות) |
| `settings_c.js` | העדפות תצוגה (theme, fontSize, density) |
| `ai_c.js` | סיכום טיול ב-AI (REST) |

### 3.5 שכבת ORM — `Server/ORM/`

כל ה-ORM classes משתמשים ב-**mysql2 connection pool** מ-`db.js` עם SQL גולמי. אין שימוש ב-Prisma בשאילתות runtime.

| ORM | טבלאות | שיטות עיקריות |
|-----|--------|---------------|
| `UserORM.js` | `user` | findAll, findById, findByEmail, create, update, delete |
| `TripORM.js` | `trip`, `trip_attraction` | CRUD + toggleFavorite + _attachFavorites |
| `AttractionORM.js` | `attraction` | findAll, findById, findMapPins, CRUD |
| `CityORM.js` | `city` | findAll, findById, search |
| `MessageORM.js` | `message` | create, findByRoom |
| `SettingsORM.js` | `settings` | findByUser, upsert |
| `FavoriteORM.js` | `trip_attraction` | **קיים אך לא מחובר ל-controller** |

**מיפוי שדות:** ה-ORM ממפה שמות עמודות DB לשמות API:
- `tripName` → `name`
- `travelStyle` → `travelerType`
- `nameHE` → `name_he`
- `interests`, `tags` — JSON string ↔ array

### 3.6 Middleware

| Middleware | קובץ | תפקיד |
|------------|------|--------|
| `logger` | `middleware/logger.js` | לוג: timestamp, method, path, status, duration |
| `roleCheck(...roles)` | `middleware/roleCheck.js` | בודק header `x-user-role` — 403 אם לא מורשה |
| `checkFields([...])` | `middleware/checkFields.js` | בודק שדות חובה ב-body — 400 אם חסר |
| `errorHandler` | `middleware/errorHandler.js` | תפיסת שגיאות גלובלית — 404/500 |

### 3.7 `db.js` — חיבור לבסיס הנתונים

```javascript
// mysql2 pool — כל ה-ORM משתמשים בזה
const pool = mysql.createPool({
    host, port, user, password,
    database: 'mydb',
    charset: 'utf8mb4'   // חשוב לעברית!
});

// Prisma — רק לכלי פיתוח (db:push, db:studio)
module.exports.prisma = new PrismaClient();
```

---

## 4. ארכיטקטורת הלקוח (Frontend)

### 4.1 נקודת כניסה — `client/src/App.js`

```
index.js → App.js
    ├── userContext (user, setUser)
    ├── preferencesContext (theme, fontSize, density)
    ├── BrowserRouter
    │   └── Layout (Navbar + main + Footer)
    │       └── Routes
    │           ├── /login          → Login (ציבורי)
    │           └── ProtectedRoute  → כל השאר (דורש login)
    └── useEffect: טעינת preferences מהשרת אחרי login
```

### 4.2 דפים (Pages)

| דף | Route | תפקיד |
|----|-------|--------|
| `Login.jsx` | `/login` | התחברות / הרשמה |
| `Home.jsx` | `/` | דשבורד: ערים, אטרקציות מובילות, הטיולים שלי, AI planner |
| `TripDetail.jsx` | `/trips/:id` | פרטי טיול, אטרקציות מותאמות, מועדפים, סיכום AI |
| `CityAttractions.jsx` | `/cities/:id` | אטרקציות לפי עיר + CRUD (admin) |
| `Settings.jsx` | `/settings` | פרופיל + העדפות תצוגה |
| `Forum.js` | `/forum` | פורום צ'אט + מפה |
| `adminPortal.jsx` | `/adminPortal` | ניהול משתמשים (admin/manager) |
| `adminPortaluser.jsx` | `/adminPortaluser` | עריכת משתמש בודד |

### 4.3 שירותים (Services) — `client/src/services/`

כל קריאת API עוברת דרך `api.js`:

```
api.js
  ├── קורא REACT_APP_API_URL (ברירת מחדל: localhost:3000/api)
  ├── בונה headers: x-user-id, x-user-role מ-localStorage
  └── מחזיר/זורק שגיאה עם הודעה מהשרת

authService.js      → /auth/*
usersService.js     → /users/*
tripsService.js     → /profile/*  (מתרגם שמות שדות UI ↔ server)
citiesService.js    → /cities/*
attractionsService.js → /attractions/*
settingsService.js  → /settings/*
aiService.js        → POST /ai/trip-summary
socket.js           → Socket.IO singleton (פורום)
aiTripSocketService.js → Socket.IO נפרד (AI chat, עם auth.userId)
```

### 4.4 ניהול State

**אין Redux** — React Context + state מקומי בדפים:

| מקור | מה נשמר | איפה |
|------|---------|------|
| `userContext` | משתמש מחובר | React state + `localStorage "user"` |
| `preferencesContext` | theme, fontSize, density | React state + `localStorage "preferences"` + DB |
| דפים | נתוני עמוד (ערים, טיולים...) | `useState` + `useEffect` fetch |

**תבנית טעינת נתונים בדף:**
```
useEffect → setLoading(true) → service.get() → setData → setLoading(false)
```

---

## 5. בסיס הנתונים

### 5.1 שם וחיבור

- **שם בסיס הנתונים:** `mydb` (לא `my_db`)
- **קידוד:** `utf8mb4` (חובה לעברית)
- **ייבוא נתונים:** `node fix-db-encoding.js` (לא PowerShell piping!)

### 5.2 דיאגרמת יחסים (ER)

```
user ──────────────< trip
  │                    │
  │                    └──< trip_attraction >── attraction
  │                                              │
  └─── settings (1:1)                            │
                                                 │
country ──────────< city ────────────────────────┘

message (עצמאי — forum, ללא FK ל-user)
```

### 5.3 טבלאות

| טבלה | תיאור | שדות מרכזיים |
|------|--------|--------------|
| `user` | משתמשים | userId, email, password, firstName, userRole |
| `country` | מדינות | countryId, countryName, countryNameHe |
| `city` | ערים | cityId, countryId, cityName, cityNameHe |
| `attraction` | אטרקציות | attractionId, cityId, nameHE, type, tags, lat/lng |
| `trip` | פרופילי טיול | tripId, userId, countryId, travelStyle, interests |
| `trip_attraction` | מועדפים בטיול | tripId + attractionId (מפתח מורכב) |
| `settings` | העדפות UI | userId, theme, fontSize, density |
| `message` | הודעות פורום | messageId, room, userId, userName, text |

### 5.4 Prisma vs mysql2

| כלי | שימוש |
|-----|--------|
| **Prisma** (`schema.prisma`) | הגדרת סכמה, `npm run db:push`, Prisma Studio |
| **mysql2 ORM** | **כל השאילתות בזמן ריצה** של האפליקציה |

---

## 6. אימות והרשאות

### 6.1 מודל האימות (פשוט — לפיתוח)

```
אין JWT / Sessions / Cookies

Login:
  Client → POST /api/auth/login { email, password }
  Server → בודק ב-DB (סיסמה בטקסט גלוי!)
  Server → מחזיר { userId, firstName, userRole }
  Client → שומר ב-localStorage
  Client → שולח בכל בקשה:
           headers: x-user-id, x-user-role
  Server → סומך על ה-headers (ללא אימות חוזר!)
```

### 6.2 תפקידים (Roles)

| Role | הרשאות |
|------|---------|
| `user` | צפייה, טיולים אישיים, פורום |
| `manager` | + עריכת אטרקציות, ניהול משתמשים |
| `admin` | + יצירת אטרקציות, מחיקת משתמשים |

בדיקת תפקיד: `roleCheck('admin', 'manager')` ב-routes.

---

## 7. זרימות מידע מפורטות

### 7.1 התחברות (Login)

```
[דפדפן]                          [שרת]                    [DB]
   │                                │                        │
   │  POST /api/auth/login          │                        │
   │  { email, password }           │                        │
   │ ─────────────────────────────► │  UserORM.findByEmail   │
   │                                │ ──────────────────────► │
   │                                │ ◄────────────────────── │
   │  { userId, firstName, role }   │                        │
   │ ◄───────────────────────────── │                        │
   │                                │                        │
   │  localStorage.setItem("user")  │                        │
   │  GET /api/users/:id            │                        │
   │ ─────────────────────────────► │  UserORM.findById      │
   │ ◄───────────────────────────── │                        │
   │  setUser(fullProfile)          │                        │
   │  navigate("/")                 │                        │
   │  GET /api/settings             │                        │
   │ ─────────────────────────────► │  SettingsORM.findByUser│
   │ ◄───────────────────────────── │                        │
   │  setPreferences(theme...)      │                        │
```

### 7.2 דף הבית — טעינת ערים ואטרקציות

```
Home.jsx (mount)
    │
    ├── citiesService.getAll()
    │       → GET /api/cities
    │       → cities_c.getAll → CityORM.findAll → SELECT * FROM city
    │       → [{ cityId, cityName, cityNameHe, countryId, ... }]
    │
    ├── attractionsService.getAll()
    │       → GET /api/attractions
    │       → attractions_c.getAll → AttractionORM.findAll
    │       → enrichAttraction (ניקוד) על כל אטרקציה
    │       → [{ ..., popularity_score, personalized_score }]
    │
    └── tripsService.getAll()
            → GET /api/profile
            → profiles_c.getAll → TripORM.findByUser (לפי x-user-id)
            → [{ tripId, name, countryId, favorites: [...] }]
```

### 7.3 יצירת טיול

```
[אפשרות א': ידנית]
  Home → כפתור "טיול חדש" → TripForm modal
    → tripsService.create({ name, countryId, months, style, budget, interests })
    → POST /api/profile
    → profiles_c.create → TripORM.create → INSERT INTO trip
    → reload trips

[אפשרות ב': עם AI]
  Home → "תכנן עם AI" → AiTripChatModal
    → aiTripSocketService.connect({ auth: { userId } })
    → socket.emit("ai-trip:start")
    → [ראו סעיף 9 — AI Socket]
    → ai-trip:draft-ready → TripForm (מלא מראש) → create
```

### 7.4 דף טיול — אטרקציות מותאמות אישית

```
TripDetail.jsx
    │
    ├── tripsService.getById(id) → GET /api/profile/:id
    │
    ├── attractionsService.getAll({
    │       travelStyle: trip.travelerType,
    │       startMonth, endMonth,
    │       interests: trip.interests
    │   })
    │   → GET /api/attractions?travelStyle=...&interests=...
    │   → attractions_c מפעיל enrichAttraction עם personalization context
    │   → מחזיר personalized_score + score_breakdown לכל אטרקציה
    │
    └── Client-side filter:
            רק אטרקציות במדינת הטיול
            + חודשי הטיול מתאימים ל-best_months
```

### 7.5 הוספת מועדף לטיול

```
TripDetail → לחיצה על כוכב באטרקציה
    → tripsService.toggleFavorite(tripId, attractionId)
    → POST /api/profile/:tripId/favorites { attractionId }
    → profiles_c.toggleFavorite
    → TripORM.toggleFavorite
        → אם קיים: DELETE FROM trip_attraction
        → אם לא: INSERT INTO trip_attraction
    → מחזיר trip מעודכן עם favorites[]
```

### 7.6 פורום — שליחת הודעה

```
[דפדפן]                    [Socket.IO]              [שרת]           [DB]
   │                           │                      │               │
   │  socket.emit              │                      │               │
   │  "message:send"           │                      │               │
   │  { room, userId, text }   │                      │               │
   │ ─────────────────────────►│  forum_socket        │               │
   │                           │ ────────────────────►│ MessageORM    │
   │                           │                      │ .create()     │
   │                           │                      │ ─────────────►│
   │                           │                      │ ◄─────────────│
   │                           │  io.to(room)         │               │
   │                           │  .emit("message:new")│               │
   │ ◄─────────────────────────│                      │               │
   │  (כל המחוברים לחדר)       │                      │               │
```

---

## 8. WebSockets

השרת מריץ **Socket.IO אחד** על פורט 3000, עם **שני handlers נפרדים**:

### 8.1 פורום — `socket/forum_socket.js`

| אירוע (Client → Server) | פעולה |
|-------------------------|--------|
| `room:join` | `socket.join(room)` + עדכון presence |
| `room:leave` | `socket.leave(room)` |
| `message:send` | שמירה ב-DB + broadcast `message:new` |
| `disconnect` | עדכון presence |

| אירוע (Server → Client) | תוכן |
|-------------------------|------|
| `message:new` | אובייקט הודעה שנשמר |
| `presence:update` | `{ room, count }` — כמה מחוברים |
| `message:error` | שגיאה |

**חדרים:** `country_1`, `city_3` וכו' — מוגדרים ב-`client/src/data/forumRooms.js`.

**היסטוריה:** REST `GET /api/forum/:room/messages` (50 אחרונות) — נטען לפני הצ'אט.

### 8.2 AI Trip Chat — `socket/aiTripSocket.js`

| אירוע (Client → Server) | פעולה |
|-------------------------|--------|
| `ai-trip:start` | יצירת session + הודעת פתיחה מהבוט |
| `ai-trip:user-message` | שליחה ל-Groq + תשובה + עדכון draft |
| `ai-trip:reset` | איפוס שיחה |

| אירוע (Server → Client) | תוכן |
|-------------------------|------|
| `ai-trip:bot-message` | `{ text, draft }` |
| `ai-trip:bot-typing` | `{ typing: true/false }` |
| `ai-trip:draft-ready` | `{ draft }` — כשהטיוטה תקינה |
| `ai-trip:error` | שגיאה |

**Sessions:** Map בזיכרון (`socketId → { history, draft, status }`), ניקוי אחרי 30 דקות חוסר פעילות.

**אימות:** `socket.handshake.auth.userId` — חובה ל-AI events.

---

## 9. אינטגרציית AI

### 9.1 שני ערוצי AI

| ערוץ | פרוטוקול | שימוש | קובץ |
|------|----------|-------|------|
| צ'אט תכנון טיול | WebSocket | שיחה אינטראקטיבית → טיוטת טיול | `aiTripSocket.js` |
| סיכום טיול | REST POST | טקסט סיכום לטיול קיים | `ai_c.js` + `aiService.js` |

### 9.2 Groq Service — `services/groqService.js`

```
GROQ_API_KEY (מ-.env)
    → Groq SDK
    → Model: llama-3.3-70b-versatile (ברירת מחדל)

getNextAiResponse(history, draft)
    → prompt: TRIP_CHAT_SYSTEM_PROMPT
    → response_format: json_object
    → parse JSON → validateTripDraft
    → retry אם JSON פגום

summarizeTrip(tripContext)
    → prompt: TRIP_SUMMARY_SYSTEM_PROMPT
    → טקסט עברית חופשי
```

### 9.3 זרימת AI Chat (יצירת טיול)

```
Client: AiTripChatModal
    │
    ├── connect(userId)
    ├── emit("ai-trip:start")
    │
    ▼
Server: aiTripSocket
    ├── createSession()
    ├── advanceConversation() → groqService.getNextAiResponse()
    ├── emit("ai-trip:bot-message", { text, draft })
    │
    ▼ (לולאת שיחה)
Client: משתמש כותב → emit("ai-trip:user-message")
Server: מוסיף להיסטוריה → Groq → עדכון draft
    │
    ▼ (כש-draft תקין)
Server: emit("ai-trip:draft-ready", { draft })
Client: פותח TripForm עם הנתונים → tripsService.create()
```

---

## 10. אלגוריתם ניקוד אטרקציות

הניקוד **מחושב בזמן קריאה** — לא נשמר ב-DB.

קובץ: `Server/utils/attractionScoring.js`

```
GET /api/attractions?travelStyle=...&interests=...&startMonth=...
    │
    ▼
attractions_c.getAll()
    ├── AttractionORM.findAll()  → שורות מ-DB
    └── לכל אטרקציה: enrichAttraction(attraction, context)
            │
            ├── computePopularityScore()
            │     לפי: type, tags, מספר תגיות
            │
            ├── computeAudienceScores()
            │     לפי: travelStyle (משפחות, זוגות, backpackers...)
            │
            └── computePersonalizedScore()
                  לפי: interests + חודשי טיול + travelStyle
                  → score_breakdown (הסבר "למה הציון הזה?")
```

הלקוח מציג את `personalized_score` ו-`ScoreBreakdown` ב-`AttractionModal`.

---

## 11. משתני סביבה והרצה

### 11.1 Server — `Server/.env`

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=...
DB_NAME=mydb
DATABASE_URL=mysql://root:...@localhost:3306/mydb
GROQ_API_KEY=...          # חובה ל-AI
GROQ_MODEL=llama-3.3-70b-versatile
```

### 11.2 Client — `client/.env`

```env
PORT=5173
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_SOCKET_URL=http://localhost:3000
```

### 11.3 הרצה

```powershell
# טרמינל 1 — שרת
cd Server
npm start          # → http://localhost:3000

# טרמינל 2 — לקוח
cd client
npm start          # → http://localhost:5173

# ייבוא DB (פעם ראשונה או אחרי קורפציה)
node fix-db-encoding.js
```

### 11.4 משתמשי בדיקה (מה-dump)

| Email | Password | Role |
|-------|----------|------|
| michal@example.com | 123456 | admin |
| user@example.com | 123456 | user |

---

## 12. נקודות חשובות ופערים ידועים

| נושא | מצב |
|------|-----|
| `/api/favorites` | מערך בזיכרון — לא DB. מועדפי טיול עובדים דרך `/api/profile/:id/favorites` |
| `FavoriteORM.js` | קיים אך לא מחובר |
| Prisma | סכמה בלבד — לא שאילתות runtime |
| אימות | header-trust ללא JWT — מתאים לפיתוח בלבד |
| סיסמאות | plaintext ב-DB |
| `ai_c.js` trip-summary | עלול להתייחס ל-mock data — לבדוק מול TripORM |
| `ForumChat.js` | hardcoded `localhost:3000` במקום `REACT_APP_API_URL` |
| `MyTrips.jsx` | קיים אך לא ב-routing — הטיולים ב-Home |
| קידוד עברית | חובה `utf8mb4` + ייבוא דרך `fix-db-encoding.js` |
| `message` table | לא ב-dump המקורי — נוצר ב-import script |

---

## סיכום זרימה כללית

```
משתמש פותח דפדפן
    → React SPA (5173)
    → ProtectedRoute בודק localStorage
    → דף טוען נתונים דרך services → api.js → REST (3000)
    → Controller → ORM → MySQL (mydb)
    → JSON חזרה → React מציג

פורום / AI Chat:
    → Socket.IO (3000) ← אותו שרת
    → handler מתאים (forum / aiTrip)
    → DB ו/או Groq API
    → events חזרה ללקוח בזמן אמת
```

---

*מסמך זה עודכן לפי מצב הקוד בפרויקט svivotPituach.*
