-- Migration 003: add editorial content (Hebrew summary + banner image) to countries
ALTER TABLE country ADD COLUMN summary_he TEXT NULL;
ALTER TABLE country ADD COLUMN banner_image_url VARCHAR(2048) NULL;

UPDATE country SET
    summary_he = 'מדינה של האנדים, יערות גשם, חופים ומורשת אינקאית. בית למאצ''ו פיצ''ו, קוסקו ולימה.',
    banner_image_url = 'https://loremflickr.com/800/600/machupicchu,peru/all'
WHERE countryId = 1;

UPDATE country SET
    summary_he = 'טנגו, סטייקים, יין מנדoza ואדריכלות אירופאית. בואנוס איירס — "פריז של דרום אמריקה".',
    banner_image_url = 'https://loremflickr.com/800/600/buenosaires,argentina/all'
WHERE countryId = 2;

UPDATE country SET
    summary_he = 'קרנבל, חופים, פסל הישו ויער האמזונס. ברזיל — היעד הגדול ביותר בדרום אמריקה.',
    banner_image_url = 'https://loremflickr.com/800/600/riodejaneiro,brazil/all'
WHERE countryId = 3;

UPDATE country SET
    summary_he = 'קפה, סלסה, קaribיים ורכסי האנדים. קולומביה — מגוון נופים ותרבות עשירה.',
    banner_image_url = 'https://loremflickr.com/800/600/bogota,colombia/all'
WHERE countryId = 4;
