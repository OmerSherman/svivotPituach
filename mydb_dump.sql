-- MySQL dump 10.13  Distrib 9.7.0, for Win64 (x86_64)
--
-- Host: localhost    Database: mydb
-- ------------------------------------------------------
-- Server version	9.7.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '16fcb737-5421-11f1-ba31-088fc3d8b3b7:1-203,
9605fe3d-6c00-11f1-81e5-088fc3d8b3b7:1-15';

--
-- Current Database: `mydb`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `mydb` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `mydb`;

--
-- Table structure for table `attraction`
--

DROP TABLE IF EXISTS `attraction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attraction` (
  `attractionId` int NOT NULL AUTO_INCREMENT,
  `cityId` int DEFAULT NULL,
  `name` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nameHE` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tags` json DEFAULT NULL,
  `descriptionHe` varchar(2048) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `img_url` varchar(2048) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `popularity_score` int DEFAULT NULL,
  `audience_scores` json DEFAULT NULL,
  `best_months` json DEFAULT NULL,
  `avoid_months` json DEFAULT NULL,
  `seasonal_note_he` varchar(2048) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `latitude` decimal(9,6) DEFAULT NULL,
  `longitude` decimal(10,6) DEFAULT NULL,
  PRIMARY KEY (`attractionId`),
  KEY `fk_cityId_attraction_idx` (`cityId`),
  CONSTRAINT `fk_cityId_attraction` FOREIGN KEY (`cityId`) REFERENCES `city` (`cityId`)
) ENGINE=InnoDB AUTO_INCREMENT=54 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attraction`
--

LOCK TABLES `attraction` WRITE;
/*!40000 ALTER TABLE `attraction` DISABLE KEYS */;
INSERT INTO `attraction` VALUES (1,2,'La Boca & Caminito','לה בוקה וקמיניטו','site','[\"תרבות\", \"אמנות\", \"צילום\", \"טנגו\"]','שכונת הנמל הצבעונית של בואנוס איירס','https://loremflickr.com/800/600/caminito,laboca/all',91,'{\"solo\": 85, \"group\": 90, \"couple\": 88, \"family\": 80}','[3, 4, 5, 9, 10, 11]','[1, 2]','הקיץ הארגנטינאי (ינואר-פברואר) חם מאוד.',-34.634500,-58.363100),(2,2,'Teatro Colón','תיאטרו קולון','tour','[\"תרבות\", \"אדריכלות\", \"מוזיקה\", \"אופרה\"]','אחד מבתי האופרה היפים בעולם','https://loremflickr.com/800/600/teatrocolon,buenosaires/all',96,'{\"solo\": 88, \"group\": 75, \"couple\": 92, \"family\": 70}','[3, 4, 5, 6, 7, 8, 9, 10]','[1, 2]','עונת האופרה הרשמית היא מרץ עד נובמבר.',-34.601100,-58.383300),(3,2,'Recoleta Cemetery','בית הקברות רקולטה','site','[\"היסטוריה\", \"אדריכלות\", \"תרבות\", \"ייחודי\"]','בית קברות מרהיב שבו קבורה אבא גנוש של פרון','https://loremflickr.com/800/600/recoleta,cemetery/all',89,'{\"solo\": 90, \"group\": 78, \"couple\": 82, \"family\": 65}','[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]','[]','פתוח כל השנה. מומלץ להגיע בשעות הבוקר.',-34.587500,-58.393400),(4,2,'San Telmo Market','שוק סן תלמו','site','[\"שווקים\", \"אוכל\", \"אנטיקים\", \"אותנטי\"]','השכונה ההיסטורית הוותיקה עם שוק מקורה','https://loremflickr.com/800/600/santelmo,market/all',87,'{\"solo\": 88, \"group\": 90, \"couple\": 85, \"family\": 82}','[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]','[]','השוק החיצוני פעיל בסופי שבוע בלבד.',-34.620500,-58.373100),(5,2,'Puerto Madero Waterfront','רצועת הנמל פוארטו מדרו','route','[\"הליכה\", \"נוף\", \"מודרני\", \"רומנטי\"]','מסלול הליכה לאורך הנמל המחודש','https://loremflickr.com/800/600/puertomadero,waterfront/all',83,'{\"solo\": 78, \"group\": 80, \"couple\": 93, \"family\": 85}','[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]','[]','נעים כל השנה.',-34.610000,-58.360000),(6,2,'Tango Show - El Viejo Almacén','מופע טנגו - אל ויחו אלמסן','tour','[\"טנגו\", \"מופע\", \"תרבות\", \"לילה\"]','אחד ממופעי הטנגו האיכותיים בבואנוס איירס','https://loremflickr.com/800/600/tango,buenosaires/all',93,'{\"solo\": 80, \"group\": 88, \"couple\": 98, \"family\": 72}','[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]','[]','מופעים כל ערב.',-34.618800,-58.371400),(7,3,'Christ the Redeemer','פסל הישו הגואל','site','[\"נוף\", \"צילום\", \"אייקוני\", \"תרבות\"]','פסל הישו האייקוני על גבעת קורקובאדו','https://loremflickr.com/800/600/christtheredeemer,rio/all',97,'{\"solo\": 85, \"group\": 92, \"couple\": 88, \"family\": 90}','[5, 6, 7, 8, 9]','[1, 2]','עונת הגשמים עלולה לכסות את הפסל בערפל.',-22.951900,-43.210500),(8,3,'Copacabana Beach Walk','טיול לאורך חוף קופקבאנה','route','[\"חוף\", \"הליכה\", \"נוף\", \"ספורט\"]','מסלול הליכה אייקוני לאורך 4 ק\"מ','https://loremflickr.com/800/600/copacabana,beach/all',88,'{\"solo\": 88, \"group\": 82, \"couple\": 90, \"family\": 85}','[11, 12, 1, 2, 3]','[6, 7]','הקיץ הברזילאי הוא עונת החוף.',-22.971400,-43.182400),(9,4,'Machu Picchu','מאצ\'ו פיצ\'ו','site','[\"היסטוריה\", \"טבע\", \"אינקה\", \"אתר מורשת עולמי\"]','אחד מפלאי העולם החדשים','https://loremflickr.com/800/600/machupicchu,peru/all',99,'{\"solo\": 92, \"group\": 88, \"couple\": 95, \"family\": 75}','[4, 5, 6, 7, 8, 9]','[1, 2, 3]','מומלץ באפריל-ספטמבר.',-13.163100,-72.545000),(10,4,'Cusco City Tour','סיור בעיר קוסקו','tour','[\"היסטוריה\", \"אדריכלות\", \"אינקה\", \"קולוניאלי\"]','סיור ברגל בעיר העתיקה של קוסקו','https://loremflickr.com/800/600/cusco,plaza/all',85,'{\"solo\": 90, \"group\": 82, \"couple\": 85, \"family\": 78}','[4, 5, 6, 7, 8, 9, 10]','[1, 2]','הגובה דורש יום-יומיים הסתגלות.',-13.531900,-71.967500),(11,1,'Miraflores Cliff Walk','טיול לאורך מצוקי מירפלורס','route','[\"נוף\", \"הליכה\", \"גנים\", \"אוקיינוס\"]','מסלול הליכה לאורך מצוקי שכונת מירפלורס','https://loremflickr.com/800/600/miraflores,lima/all',82,'{\"solo\": 85, \"group\": 75, \"couple\": 92, \"family\": 80}','[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]','[]','נעים להליכה כל השנה.',-12.131800,-77.028100),(12,1,'Larco Museum','מוזיאון לארקו','site','[\"היסטוריה\", \"תרבות\", \"מוזיאון\", \"פרה-קולומביאני\"]','אחד המוזיאונים הטובים בדרום אמריקה','https://loremflickr.com/800/600/larcomuseum,peru/all',88,'{\"solo\": 93, \"group\": 78, \"couple\": 80, \"family\": 72}','[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]','[]','פתוח כל השנה כולל חגים.',-12.093100,-77.063100),(13,1,'Magic Water Circuit','פארק המים הקסום','site','[\"לילה\", \"פארק\", \"משפחה\", \"צילום\"]','פארק מזרקות מים מרהיב בלימה','https://loremflickr.com/800/600/magicwatercircuit,lima/all',86,'{\"solo\": 70, \"group\": 88, \"couple\": 85, \"family\": 95}','[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]','[]','כדאי להביא ז\'קט קל לערבים הקרירים.',-12.070800,-77.033600),(14,2,'Palermo Soho','פאלרמו סוהו','route','[\"קניות\", \"אוכל\", \"אמנות רחוב\", \"צעירים\"]','השכונה הטרנדית והאופנתית ביותר בבואנוס איירס','https://loremflickr.com/800/600/palermosoho,buenosaires/all',92,'{\"solo\": 90, \"group\": 95, \"couple\": 95, \"family\": 75}','[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]','[]','שוקק חיים במיוחד בסופי שבוע.',-34.588300,-58.429900),(15,3,'Sugarloaf Mountain','הר הסוכר (פאו דה אסוקר)','site','[\"נוף\", \"טבע\", \"רכבל\", \"אייקוני\"]','עלייה בשני רכבלים אל פסגת הר הסוכר','https://loremflickr.com/800/600/sugarloaf,rio/all',96,'{\"solo\": 85, \"group\": 90, \"couple\": 95, \"family\": 92}','[5, 6, 7, 8, 9]','[1, 2]','כדאי להגיע לקראת השקיעה.',-22.949200,-43.156300),(16,4,'Sacsayhuamán','סקסייוואמן','site','[\"היסטוריה\", \"אינקה\", \"ארכיאולוגיה\", \"נוף\"]','מתחם מבוצר ענק של האינקה','https://loremflickr.com/800/600/sacsayhuaman,cusco/all',89,'{\"solo\": 90, \"group\": 85, \"couple\": 85, \"family\": 80}','[4, 5, 6, 7, 8, 9, 10]','[1, 2]','מצוין להסתגלות לגובה לפני הטרק למאצ\'ו פיצ\'ו.',-13.509700,-71.981700),(17,1,'Barranco District','שכונת באראנקו','site','[\"תרבות\", \"אמנות\", \"חיי לילה\", \"בוהמייני\"]','השכונה הבוהמיינית והציורית של לימה','https://loremflickr.com/800/600/barranco,lima/all',88,'{\"solo\": 88, \"group\": 90, \"couple\": 94, \"family\": 78}','[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]','[]','חיי הלילה תוססים במיוחד בסופי שבוע.',-12.148600,-77.021100),(18,2,'El Ateneo Grand Splendid','אל אטנאו גראנד ספלנדיד','site','[\"אדריכלות\", \"תרבות\", \"ספרים\", \"ייחודי\"]','אחת מחנויות הספרים היפות בעולם','https://loremflickr.com/800/600/elateneo,buenosaires/all',94,'{\"solo\": 95, \"group\": 82, \"couple\": 90, \"family\": 80}','[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]','[]','מקום סגור וממוזג, פתרון מושלם לימים חמים.',-34.596000,-58.403200),(19,3,'Tijuca National Park','הפארק הלאומי טיז\'וקה','route','[\"טבע\", \"יער גשם\", \"הליכה\", \"נוף\"]','יער הגשם העירוני הגדול בעולם','https://loremflickr.com/800/600/tijuca,rio/all',90,'{\"solo\": 82, \"group\": 92, \"couple\": 88, \"family\": 85}','[5, 6, 7, 8, 9]','[1, 2]','מומלץ להימנע מימים גשומים.',-22.951500,-43.275400),(20,4,'Maras Salt Mines','בריכות המלח של מאראס','site','[\"טבע\", \"היסטוריה\", \"אינקה\", \"צילום\"]','אלפי בריכות מלח קטנות הפועלות עוד מתקופת האינקה','https://loremflickr.com/800/600/maras,peru/all',91,'{\"solo\": 88, \"group\": 86, \"couple\": 90, \"family\": 82}','[5, 6, 7, 8, 9, 10]','[1, 2, 3]','בעונה היבשה הבריכות לבנות ובוהקות.',-13.333300,-72.158300),(21,2,'Feria Recoleta','Feria Recoleta','site','[\"קניות\", \"אמנות\", \"תרבות\"]','All sorts of artisan products, from jewelry to shawls.',NULL,0,NULL,NULL,NULL,NULL,NULL,NULL),(22,5,'St. Peter the Apostle Cathedral','St. Peter the Apostle Cathedral','site','[\"תרבות\", \"אדריכלות\"]','The mother church of the city of Cali, completed in 1841.',NULL,0,NULL,NULL,NULL,NULL,NULL,NULL),(23,5,'The River Cat statue','The River Cat statue','site','[\"תרבות\", \"חיי לילה\"]','Famous statue of a giant cat that, along with the statue of Belalcazar, the Three Crosses, and Jesus, has become a symbol for the city.  It is situated across the Cali River from the barrio of El Peñon.',NULL,0,NULL,NULL,NULL,NULL,NULL,NULL),(24,5,'Motolombia','Motolombia','tour','[\"הליכה\", \"נוף\", \"טבע\"]','Motolombia is a motorcycle tour and rental business run by Danish motorcycle world traveler Mike Thomsen. Motolombia offers guided tours on ATV in the mountains surrounding Cali and motorcycle tour all over Colombia.',NULL,0,NULL,NULL,NULL,NULL,NULL,NULL),(25,5,'Chipichape','Chipichape','site','[\"קניות\", \"אמנות\", \"תרבות\", \"נוף\", \"טבע\", \"אוכל\", \"חיי לילה\"]','Mall: a big indoor/outdoor shopping center built on an abandoned train station and warehouse north of downtown. It provides nearly everything and especially the possibility to have a drink at various outdoor bars, and to see many calenas. It\'s the best place to meet other foreigners, immigrants and English speaking natives. Also a great place to buy local handicrafts and souvenirs at Tu Tierra Linda store, 2nd floor. The mall has movie theaters, two food courts, a supermarket and a department store. A hotel is now under construction. Chimichape also has free wireless internet in the open air where all the cafe bars are located.',NULL,0,NULL,NULL,NULL,NULL,NULL,NULL),(26,5,'Unicentro','Unicentro','site','[\"קניות\", \"אמנות\", \"תרבות\", \"אוכל\"]','The largest mall in town located 10 km south of downtown. It has over 200 stores, 30 restaurants and cafes, a multiplex, casino, office space, a supermarket, a department store, and the largest water fountain in town.',NULL,0,NULL,NULL,NULL,NULL,NULL,NULL),(27,5,'Palmetto Plaza','Palmetto Plaza','site','[\"קניות\", \"חיי לילה\", \"תרבות\"]','Popular with the young crowd with its many outdoor bars and cafes.',NULL,0,NULL,NULL,NULL,NULL,NULL,NULL),(28,5,'El Solar','El Solar','site','[\"אוכל\"]','A fun place with outdoor seating, many options in the menu. Live music on weekends.',NULL,0,NULL,NULL,NULL,NULL,NULL,NULL),(29,5,'Pacífico','Pacífico','site','[\"אוכל\"]','Well-made seafood, many recipes from the Colombian Pacific.',NULL,0,NULL,NULL,NULL,NULL,NULL,NULL),(30,5,'Tizones','Tizones','site','[\"אוכל\"]','Great meat. Steaks & seafood.',NULL,0,NULL,NULL,NULL,NULL,NULL,NULL),(31,5,'Ringlete','Ringlete','site','[\"אוכל\"]','Well done and served local food. Many recipes with plantains.',NULL,0,NULL,NULL,NULL,NULL,NULL,NULL),(32,6,'Ciclovía','Ciclovía','tour','[\"הליכה\"]','Every Sunday and national holiday from 7AM-2PM, major avenues are closed to cars and thousands of people turn out to bike, skate, jog and walk. You can join on foot or by renting a bicycle in the Candelaria neighborhood with Bogotravel tours.',NULL,0,NULL,NULL,NULL,NULL,NULL,NULL),(33,6,'Sabana de Bogotá','Sabana de Bogotá','tour','[\"הליכה\", \"אמנות\", \"תרבות\", \"נוף\", \"טבע\"]','Who would have imagined that there exists a fascinating natural wonder right in the heart of Bogotá?  The wetlands of the Sabana (savannah) de Bogotá is where the rivers slow down a bit to rest on the plateau and “clean up”  after flowing down from mountains. The water then continues to flow into the valleys to rejoin with the rivers below, including the Bogotá and Magdalena rivers.',NULL,0,NULL,NULL,NULL,NULL,NULL,NULL),(34,7,'האובליסק של בואנוס איירס','האובליסק של בואנוס איירס','site','[]','',NULL,0,NULL,NULL,NULL,NULL,-34.603075,-58.381653),(35,7,'ארמון ברולו','ארמון ברולו','site','[]','','https://commons.wikimedia.org/wiki/Special:FilePath/Palacio%20Barolo.JPG',0,NULL,NULL,NULL,NULL,-34.609556,-58.385861),(36,7,'Palacio de Justicia','Palacio de Justicia','site','[]','',NULL,0,NULL,NULL,NULL,NULL,-34.602167,-58.385750),(37,7,'Pasaje Rivarola','Pasaje Rivarola','site','[]','',NULL,0,NULL,NULL,NULL,NULL,-34.606900,-58.385400),(38,7,'Plaza de Congreso','Plaza de Congreso','site','[]','',NULL,0,NULL,NULL,NULL,NULL,-34.609667,-58.390167),(39,7,'Casa Rosada','Casa Rosada','site','[]','',NULL,0,NULL,NULL,NULL,NULL,-34.608056,-58.370278),(40,7,'Confiteria Ideal','Confiteria Ideal','site','[]','',NULL,0,NULL,NULL,NULL,NULL,-34.603892,-58.379511),(41,7,'קאסה דה לה קולטורה','קאסה דה לה קולטורה','site','[]','',NULL,0,NULL,NULL,NULL,NULL,-34.608056,-58.374444),(42,7,'Libreria La Calesita','Libreria La Calesita','site','[]','',NULL,0,NULL,NULL,NULL,NULL,NULL,NULL),(43,7,'לה בוטיקה דל אנג\'ל','לה בוטיקה דל אנג\'ל','site','[]','',NULL,0,NULL,NULL,NULL,NULL,-34.615000,-58.387600),(44,8,'Archaeology and Anthropology museum','Archaeology and Anthropology museum','site','[\"אמנות\", \"תרבות\"]','',NULL,0,NULL,NULL,NULL,NULL,-31.422652,-64.187745),(45,8,'Dinosaur/fossil museum','Dinosaur/fossil museum','site','[\"אמנות\", \"תרבות\"]','',NULL,0,NULL,NULL,NULL,NULL,-31.427443,-64.181169),(46,8,'Hostel The One','Hostel The One','site','[]','',NULL,0,NULL,NULL,NULL,NULL,NULL,NULL),(47,8,'Baluch Backpackers','Baluch Backpackers','site','[]','',NULL,0,NULL,NULL,NULL,NULL,NULL,NULL),(48,8,'Mediterranea Hostel Cordoba','Mediterranea Hostel Cordoba','site','[]','',NULL,0,NULL,NULL,NULL,NULL,NULL,NULL),(49,8,'Che Salguero Hostel','Che Salguero Hostel','site','[]','',NULL,0,NULL,NULL,NULL,NULL,NULL,NULL),(50,8,'Kailash Hotel Boutique','Kailash Hotel Boutique','site','[\"קניות\"]','',NULL,0,NULL,NULL,NULL,NULL,NULL,NULL),(51,8,'Link Cordoba Hostel','Link Cordoba Hostel','site','[]','',NULL,0,NULL,NULL,NULL,NULL,NULL,NULL),(52,8,'Tango Hostel','Tango Hostel','site','[\"חיי לילה\", \"תרבות\"]','',NULL,0,NULL,NULL,NULL,NULL,NULL,NULL),(53,8,'Cordoba Backpackers','Cordoba Backpackers','site','[]','',NULL,0,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `attraction` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `city`
--

DROP TABLE IF EXISTS `city`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `city` (
  `cityId` int NOT NULL AUTO_INCREMENT,
  `cityNameHe` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cityNameEn` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `countryId` int DEFAULT NULL,
  PRIMARY KEY (`cityId`),
  KEY `fk_countryId_city_idx` (`countryId`),
  CONSTRAINT `fk_countryId_city` FOREIGN KEY (`countryId`) REFERENCES `country` (`countryId`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `city`
--

LOCK TABLES `city` WRITE;
/*!40000 ALTER TABLE `city` DISABLE KEYS */;
INSERT INTO `city` VALUES (1,'לימה','Lima',1),(2,'בואנוס איירס','Buenos Aires',2),(3,'ריו דה ז\'ניירו','Rio de Janeiro',3),(4,'קוסקו','Cusco',1),(5,'קאלי','Cali',4),(6,'בוגוטה','Bogotá',4),(7,'בואנוס איירס','בואנוס איירס',2),(8,'קורדובה (ארגנטינה)','קורדובה (ארגנטינה)',2);
/*!40000 ALTER TABLE `city` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `country`
--

DROP TABLE IF EXISTS `country`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `country` (
  `countryId` int NOT NULL AUTO_INCREMENT,
  `countryNameEn` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `countryNameHe` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`countryId`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `country`
--

LOCK TABLES `country` WRITE;
/*!40000 ALTER TABLE `country` DISABLE KEYS */;
INSERT INTO `country` VALUES (1,'Peru','פרו'),(2,'Argentina','ארגנטינה'),(3,'Brazil','ברזיל'),(4,'Colombia','קולומביה');
/*!40000 ALTER TABLE `country` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `settings`
--

DROP TABLE IF EXISTS `settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `settings` (
  `userId` int NOT NULL,
  `theme` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fontSize` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `density` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`userId`),
  CONSTRAINT `fk_userId_settings` FOREIGN KEY (`userId`) REFERENCES `user` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `settings`
--

LOCK TABLES `settings` WRITE;
/*!40000 ALTER TABLE `settings` DISABLE KEYS */;
INSERT INTO `settings` VALUES (1,'dark','medium','normal'),(2,'light','medium','normal');
/*!40000 ALTER TABLE `settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trip`
--

DROP TABLE IF EXISTS `trip`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trip` (
  `tripId` int NOT NULL AUTO_INCREMENT,
  `userId` int DEFAULT NULL,
  `tripName` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `countryId` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `startMonth` int DEFAULT NULL,
  `endMonth` int DEFAULT NULL,
  `travelStyle` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `budget` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `interests` json DEFAULT NULL,
  `createdAt` date DEFAULT NULL,
  PRIMARY KEY (`tripId`),
  KEY `fk_userId_idx` (`userId`),
  CONSTRAINT `fk_userId` FOREIGN KEY (`userId`) REFERENCES `user` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trip`
--

LOCK TABLES `trip` WRITE;
/*!40000 ALTER TABLE `trip` DISABLE KEYS */;
/*!40000 ALTER TABLE `trip` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trip_attraction`
--

DROP TABLE IF EXISTS `trip_attraction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trip_attraction` (
  `tripId` int NOT NULL,
  `attractionId` int NOT NULL,
  PRIMARY KEY (`tripId`,`attractionId`),
  KEY `attractionId_idx` (`attractionId`),
  CONSTRAINT `attractionId` FOREIGN KEY (`attractionId`) REFERENCES `attraction` (`attractionId`),
  CONSTRAINT `tripId` FOREIGN KEY (`tripId`) REFERENCES `trip` (`tripId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trip_attraction`
--

LOCK TABLES `trip_attraction` WRITE;
/*!40000 ALTER TABLE `trip_attraction` DISABLE KEYS */;
/*!40000 ALTER TABLE `trip_attraction` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `userId` int NOT NULL AUTO_INCREMENT,
  `firstName` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lastName` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userRole` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createDate` date DEFAULT NULL,
  `updateDate` date DEFAULT NULL,
  PRIMARY KEY (`userId`),
  UNIQUE KEY `iduser_UNIQUE` (`userId`),
  UNIQUE KEY `email_UNIQUE` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'michal','adam','michal@example.com','123456','admin','2026-05-02','2026-05-02'),(2,'omer','sherman','omersherman22@gmail.com','123456','admin','2026-05-02','2026-05-02'),(3,'hillel','zilberman','hillel@example.com','123456','manager','2026-05-02','2026-05-02'),(4,'test','user','user@example.com','123456','user','2026-05-02','2026-05-02'),(5,'alessandro','verdi','alessandro.verdi@example.com','123456','user','2026-05-10','2026-05-10'),(6,'gabriele','maggi','gabriele.maggi@example.com','123456','manager','2026-05-12','2026-05-12'),(7,'nicolò','molteni','nicolo.molteni@example.com','123456','user','2026-05-15','2026-05-15'),(8,'elsa','sherman','elsa.dog@example.com','123456','user','2026-05-20','2026-05-20'),(9,'koko','sherman','koko.dog@example.com','123456','user','2026-05-22','2026-05-22'),(11,'david','levi','david.l@example.com','123456','user','2026-06-01','2026-06-01'),(12,'sarah','katz','sarah.k@example.com','123456','user','2026-06-02','2026-06-03'),(13,'amit','bendavid','amit.b@example.com','123456','admin','2026-06-04','2026-06-04'),(14,'noa','golan','noa.g@example.com','123456','user','2026-06-05','2026-06-05');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-20 15:29:56
