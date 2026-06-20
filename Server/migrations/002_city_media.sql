-- Add city summary + banner image URL
ALTER TABLE city ADD COLUMN summary_he TEXT NULL;
ALTER TABLE city ADD COLUMN banner_image_url VARCHAR(2048) NULL;

-- Seed main cities (ids 1-4 from dump)
UPDATE city SET
    summary_he = 'בירת פרו, עיר של קוויצ''ה מעולה, שכונות קולוניאליות וחופי האוקיינוס השקט. שער הכניסה לפרו ומרכז גסטרונומי עולמי.',
    banner_image_url = 'https://loremflickr.com/800/600/lima,peru001/all'
WHERE cityId = 1;

UPDATE city SET
    summary_he = 'בירתה התוססת של ארגנטינה, המכונה פריז של דרום אמריקה בזכות האדריכלות האירופאית והתרבות העשירה.',
    banner_image_url = 'https://loremflickr.com/800/600/buenosaires,argentina/all'
WHERE cityId = 2;

UPDATE city SET
    summary_he = 'עיר החופים והקרנבל המפורסם בברזיל. ביתם של פסל הישו, גבעת הסוכר וחופי קופקבאנה ואיפאנמה.',
    banner_image_url = 'https://loremflickr.com/800/600/riodejaneiro,brazil/all'
WHERE cityId = 3;

UPDATE city SET
    summary_he = 'עיר עתיקה בלב הרי האנדים, שהייתה בירת האימפריה האינקאית. שער הכניסה למאצ''ו פיצ''ו ומרכז תרבותי עשיר.',
    banner_image_url = 'https://loremflickr.com/800/600/cusco,peru/all'
WHERE cityId = 4;

UPDATE city SET
    summary_he = 'עיר תוססת בדרום קולומביה, מוקד תרבות הסלסה והקפה.',
    banner_image_url = 'https://loremflickr.com/800/600/cali,colombia/all'
WHERE cityId = 5;

UPDATE city SET
    summary_he = 'בירת קולומביה בגובה 2,640 מטר — עיר של מוזיאונים, קולינריה ו-Ciclovía.',
    banner_image_url = 'https://loremflickr.com/800/600/bogota,colombia/all'
WHERE cityId = 6;

-- Default banner for attractions missing img_url (placeholder by type)
UPDATE attraction
SET img_url = CONCAT('https://loremflickr.com/800/600/', LOWER(REPLACE(name, ' ', '')), '/all')
WHERE img_url IS NULL OR img_url = '';
