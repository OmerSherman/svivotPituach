# שביל הטחינה (Shvil HaTahina)

אפליקציית תכנון טיולים לדרום אמריקה — ערים, אטרקציות, פרופילי טיול, פורום צ'אט, ועוזר AI.

**קורס:** סביבות פיתוח באינטרנט · אוניברסיטת בן-גוריון  
**צוות:** Omer Sherman · Hillel Zilberman · Michal Adam

---

## איך זה עובד?

```
MySQL (mydb)  ←  Prisma  ←  Express (backend)  ←  React (frontend)
```

- **בזמן ריצה** — כל הנתונים (ערים, טיולים, הודעות פורום…) נשמרים **ב-MySQL בלבד**.
- **קבצי `backend/src/seed/`** — משמשים רק ל**בנייה ראשונית** של ה-DB (`npm run db:setup`). לא נקראים בזמן שימוש רגיל.

---

## דרישות מקדימות

| כלי | הערות |
|-----|--------|
| Node.js 18+ | |
| MySQL 8.0+ | מותקן ו**רץ** (MySQL Workbench / XAMPP / MySQL Server) |
| npm | מגיע עם Node |

---

## התקנה — פעם ראשונה על מחשב חדש

### 0. MySQL — יצירת בסיס הנתונים

אם עדיין אין בסיס בשם `mydb`, פתחי MySQL Workbench (או CLI) והריצי:

```sql
CREATE DATABASE IF NOT EXISTS mydb
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

> **שרת חיצוני (מטלה):** במקום `localhost` ב-`.env` — הכניסי את כתובת השרת, המשתמש והסיסמה שקיבלתם. שאר התהליך זהה.

### 1. חבילות

```powershell
cd backend
npm install
cd ../frontend
npm install
```

### 2. קובץ `.env`

**Backend** — העתיקי `backend/.env.example` ל-`backend/.env` ומלאי:

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

**Frontend** — העתיקי `frontend/.env.example` ל-`frontend/.env`:

```env
PORT=5173
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_SOCKET_URL=http://localhost:3000
```

### 3. יצירת ה-DB והנתונים — פקודה אחת

```powershell
cd backend
npm run db:setup
```

הפקודה מבצעת שני שלבים:

| שלב | מה קורה |
|-----|---------|
| **1** | Prisma יוצר את כל הטבלאות ב-MySQL לפי `backend/models/schema.prisma` |
| **2** | הסקריפט ממלא נתונים מ-`backend/src/seed/` |

**מה נכנס בפעם הראשונה:**

| טבלה | כמות | מקור |
|------|------|------|
| מדינות | 4 | `seed/countries.json` |
| ערים | 6 | `seed/cities.json` |
| אטרקציות | 20 | `seed/attractions.json` |
| משתמשים | 4 | `seed/users.json` |
| העדפות | 2 | `seed/settings.json` |

> **אחרי עדכון `schema.prisma`:** הריצי `npm run db:setup` (מוסיף עמודות חדשות + ממלא מיקומים למפה).

**אימות:** אחרי ההרצה:

```powershell
npm run db:studio
```

נפתח דפדפן — בדקי שיש נתונים בטבלאות `city`, `attraction`, `user`.

### 4. הרצה

```powershell
# טרמינל 1 — Backend
cd backend
npm start
# → http://localhost:3000

# טרמינל 2 — Frontend
cd frontend
npm start
# → http://localhost:5173
```

---

## שימוש יומיומי (אחרי ההתקנה)

```powershell
cd backend && npm start    # טרמינל 1
cd frontend && npm start    # טרמינל 2
```

**לא צריך** להריץ `db:setup` שוב.

מכאן והלאה האפליקציה שומרת ישירות ל-MySQL:

| פעולה | טבלה |
|--------|------|
| התחברות / הרשמה | `user` |
| יצירת טיול | `trip` |
| מועדפים | `trip_attraction` |
| הודעה בפורום | `message` |
| שינוי theme | `settings` |
| admin מוסיף אטרקציה | `attraction` |

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

## בסיס הנתונים — קבצים ופקודות

```
backend/
├── models/schema.prisma           ← מבנה 8 הטבלאות
├── migrations/                     ← עותק SQL ישן (אינפורמטיבי בלבד)
├── src/
│   ├── seed/                       ← נתוני התחלה (עריכה + db:setup)
│   │   ├── countries.json
│   │   ├── cities.json
│   │   ├── attractions.json
│   │   ├── users.json
│   │   └── settings.json
│   ├── scripts/setup-database.js  ← npm run db:setup
│   └── repositories/              ← קריאה/כתיבה ל-MySQL בזמן ריצה
```

| פקודה | מתי להשתמש |
|--------|------------|
| `npm run db:setup` | פעם ראשונה, או **איפוס מלא** (מוחק הכל!) |
| `npm run db:seed` | DB ריק אחרי `db push` — ממלא בלי למחוק |
| `npm run db:studio` | צפייה / עריכה ידנית בלי לאפס |
| `npm run db:generate` | אחרי שינוי ב-`schema.prisma`, ואז `db:setup` |

**API לנתונים:** `GET /api/countries` ו-`GET /api/cities` — טופס טיול ומפת הפורום טוענים מכאן (Prisma → MySQL).

### עריכת נתונים

**דרך 1 — JSON (מומלץ לשינוי גדול):**

1. ערכי קובץ ב-`backend/src/seed/`
2. `npm run db:setup` (שוב — **מוחק** נתונים קיימים)

**דרך 2 — Prisma Studio (בלי למחוק):**

```powershell
cd backend
npm run db:studio
```

> שדות בעברית: `cityNameHe`, `nameHE`, `descriptionHe`, `summary_he`  
> שדות באנגלית (`name`, `cityNameEn`) — פנימיים בלבד, לא מוצגים בממשק

---

## מבנה הפרויקט (קצר)

```
svivotPituach/
├── frontend/            React — דפים, רכיבים, שירותי API
├── backend/
│   ├── src/
│   │   ├── app.js           Express + Socket.IO
│   │   ├── repositories/    גישה ל-MySQL (Prisma)
│   │   ├── controllers/     לוגיקה
│   │   ├── routes/          REST endpoints
│   │   └── seed/            נתוני התחלה ל-db:setup
│   ├── models/schema.prisma ORM (Prisma) — מבנה הטבלאות
│   └── migrations/          עותק SQL ישן (אינפורמטיבי בלבד)
└── README.md
```

---

## API, WebSockets, AI

תיעוד מלא: [`backend/docs/README.md`](./backend/docs/README.md)  
Postman: [`backend/docs/postman_collection.json`](./backend/docs/postman_collection.json)  
ארכיטקטורה: [`ARCHITECTURE.md`](./ARCHITECTURE.md)

**WebSockets:** פורום + צ'אט AI  
**AI REST:** `POST /api/ai/trip-summary` (דורש `GROQ_API_KEY`)

---

## Tech Stack

React 19 · Express 5 · MySQL 8 · Prisma · Socket.IO · Groq
