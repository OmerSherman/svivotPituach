# שביל הטחינה (Shvil HaTahina)

אפליקציית תכנון טיולים לדרום אמריקה — ערים, אטרקציות, פרופילי טיול, פורום צ'אט, ועוזר AI.

**קורס:** סביבות פיתוח באינטרנט · אוניברסיטת בן-גוריון  
**צוות:** Omer Sherman · Hillel Zilberman · Michal Adam

---

## התקנה — 4 שלבים

### 1. חבילות

```powershell
cd Server
npm install
cd ../client
npm install
```

### 2. קובץ `.env`

**Server** — העתיקי `Server/.env.example` ל-`Server/.env`:

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

### 3. בסיס נתונים — **פקודה אחת**

```powershell
cd Server
npm run db:setup
```

זה עושה הכל:
- יוצר מחדש את כל הטבלאות
- ממלא **4 מדינות**, **6 ערים**, **20 אטרקציות** (בעברית + תמונות)
- מוסיף **4 משתמשי בדיקה**

> **אזהרה:** הפקודה **מוחקת** את כל הנתונים הקיימים ב-`mydb`.

### 4. הרצה

```powershell
# טרמינל 1
cd Server
npm start

# טרמינל 2
cd client
npm start
```

- Backend: http://localhost:3000  
- Frontend: http://localhost:5173

---

## התחברות לבדיקה

סיסמה לכולם: `123456`

| Email | Role |
|-------|------|
| michal@example.com | admin |
| omersherman22@gmail.com | admin |
| hillel@example.com | manager |
| user@example.com | user |

---

## בסיס הנתונים — איפה הכל נמצא?

```
Server/
├── prisma/schema.prisma     ← מבנה הטבלאות (8 טבלאות)
├── seed/                    ← הנתונים (עריכה כאן!)
│   ├── countries.json       ← 4 מדינות
│   ├── cities.json          ← 6 ערים
│   ├── attractions.json     ← 20 אטרקציות
│   ├── users.json           ← משתמשים
│   └── settings.json        ← העדפות תצוגה
└── scripts/setup-database.js  ← הסקריפט היחיד (npm run db:setup)
```

| פקודה | מתי |
|--------|-----|
| `npm run db:setup` | בנייה מחדש — מוחק הכל וממלא מ-`seed/` |
| `npm run db:studio` | צפייה/עריכה ידנית בדפדפן |
| `npm run db:generate` | אחרי שינוי ב-`schema.prisma` |

### עריכה ידנית של הנתונים

**דרך 1 — קבצי JSON (מומלץ):**

1. ערכי קובץ ב-`Server/seed/` (למשל הוספת עיר ב-`cities.json`)
2. הריצי שוב: `npm run db:setup`

**דרך 2 — Prisma Studio (בלי למחוק):**

```powershell
cd Server
npm run db:studio
```

נפתח דפדפן → בחרי טבלה (`city`, `attraction`...) → ערכי שורות ישירות.

> שדות בעברית: `cityNameHe`, `nameHE`, `descriptionHe`, `summary_he`  
> שדות באנגלית (פנימי בלבד): `name`, `cityNameEn` — לא מוצגים בממשק

---

## מבנה הפרויקט (קצר)

```
svivotPituach/
├── client/          React — דפים, רכיבים, שירותי API
├── Server/
│   ├── app.js       שרת Express + Socket.IO
│   ├── repositories/  גישה ל-DB (Prisma)
│   ├── controllers/   לוגיקה
│   ├── routes/        REST endpoints
│   └── seed/          נתוני DB
└── README.md
```

---

## API, WebSockets, AI

תיעוד מלא: [`Server/docs/README.md`](./Server/docs/README.md)  
Postman: [`Server/docs/postman_collection.json`](./Server/docs/postman_collection.json)  
ארכיטקטורה: [`ARCHITECTURE.md`](./ARCHITECTURE.md)

**WebSockets:** פורום (`forum_socket.js`) + צ'אט AI (`aiTripSocket.js`)  
**AI REST:** `POST /api/ai/trip-summary` (דורש `GROQ_API_KEY`)

---

## Tech Stack

React 19 · Express 5 · MySQL 8 · Prisma · Socket.IO · Groq
