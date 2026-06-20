-- Baseline schema for Assignment 4 (matches prisma/schema.prisma)
-- Run once on a fresh MySQL database, or use: npm run db:push

CREATE TABLE IF NOT EXISTS user (
    userId INT AUTO_INCREMENT PRIMARY KEY,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    userRole VARCHAR(50) NOT NULL DEFAULT 'user',
    createDate VARCHAR(20) NOT NULL,
    updateDate VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS country (
    countryId INT AUTO_INCREMENT PRIMARY KEY,
    countryNameEn VARCHAR(100) NOT NULL,
    countryNameHe VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS city (
    cityId INT AUTO_INCREMENT PRIMARY KEY,
    cityNameEn VARCHAR(100) NOT NULL,
    cityNameHe VARCHAR(100) NOT NULL,
    countryId INT NOT NULL,
    summary_he TEXT,
    banner_image_url VARCHAR(2048),
    FOREIGN KEY (countryId) REFERENCES country(countryId)
);

CREATE TABLE IF NOT EXISTS attraction (
    attractionId INT AUTO_INCREMENT PRIMARY KEY,
    cityId INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    nameHE VARCHAR(255),
    type VARCHAR(50) NOT NULL,
    descriptionHe TEXT,
    tags JSON,
    img_url VARCHAR(500),
    popularity_score INT DEFAULT 0,
    audience_scores JSON,
    best_months JSON,
    avoid_months JSON,
    seasonal_note_he TEXT,
    latitude DOUBLE,
    longitude DOUBLE,
    FOREIGN KEY (cityId) REFERENCES city(cityId)
);

CREATE TABLE IF NOT EXISTS trip (
    tripId INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    tripName VARCHAR(255) NOT NULL,
    countryId INT NOT NULL,
    startMonth INT NOT NULL,
    endMonth INT NOT NULL,
    travelStyle VARCHAR(50) NOT NULL,
    budget VARCHAR(50) NOT NULL,
    interests JSON,
    createdAt VARCHAR(20) NOT NULL,
    FOREIGN KEY (userId) REFERENCES user(userId)
);

CREATE TABLE IF NOT EXISTS trip_attraction (
    tripId INT NOT NULL,
    attractionId INT NOT NULL,
    PRIMARY KEY (tripId, attractionId),
    FOREIGN KEY (tripId) REFERENCES trip(tripId) ON DELETE CASCADE,
    FOREIGN KEY (attractionId) REFERENCES attraction(attractionId) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS settings (
    userId INT PRIMARY KEY,
    theme VARCHAR(50) DEFAULT 'light',
    fontSize VARCHAR(50) DEFAULT 'medium',
    density VARCHAR(50) DEFAULT 'normal',
    FOREIGN KEY (userId) REFERENCES user(userId) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS message (
    messageId INT AUTO_INCREMENT PRIMARY KEY,
    room VARCHAR(100) NOT NULL,
    userId INT NOT NULL,
    userName VARCHAR(100) NOT NULL,
    text TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_message_room (room)
);
