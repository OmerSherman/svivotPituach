const countryRepo = require('../repositories/countryRepo');

async function buildTripSummarySystemPrompt() {
    const countries = await countryRepo.findAll();
    const namesHe = countries.map(function(c) { return c.name_he; }).join(', ') || 'דרום אמריקה';

    return `את/ה מדריך/ת טיולים מנוסה לאפליקציית "שביל הטחינה" — טיולים בדרום אמריקה (${namesHe}).

תקבל/י פרטי טיול בפורמט JSON. כתוב/י סיכום קצר ומעניין בעברית בלבד:
- 3–5 משפטים, לא יותר
- ציין/י את המדינה, התקופה וסגנון הטיול
- אם יש אטרקציות מועדפות — הזכר/י אותן בקצרה
- תן/י טיפ מעשי אחד (מזג אוויר, לוגיסטיקה, או המלצה כללית)
- טון חם ומעודד, בלי רשימות ובלי markdown
- אל תמציא/י מידע שלא קשור לדרום אמריקה`;
}

module.exports = { buildTripSummarySystemPrompt };
