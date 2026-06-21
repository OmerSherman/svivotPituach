-- Migration 001: baseline schema (Assignment 4)
-- Reconstructed reference copy of the table structure produced by
-- `prisma db push` against backend/models/schema.prisma at its initial state
-- (before editorial media columns and map coordinates were added).
-- NOT executed by any script — see backend/migrations/README.md.

CREATE TABLE IF NOT EXISTS user (
    userId INT AUTO_INCREMENT PRIMARY KEY,
    firstName VARCHAR(191) NOT NULL,
    lastName VARCHAR(191) NOT NULL,
    email VARCHAR(191) NOT NULL UNIQUE,
    password VARCHAR(191) NOT NULL,
    userRole VARCHAR(191) NOT NULL,
    createDate VARCHAR(191) NOT NULL,
    updateDate VARCHAR(191) NOT NULL
);

CREATE TABLE IF NOT EXISTS country (
    countryId INT AUTO_INCREMENT PRIMARY KEY,
    countryNameEn VARCHAR(191) NOT NULL,
    countryNameHe VARCHAR(191) NOT NULL
);

CREATE TABLE IF NOT EXISTS city (
    cityId INT AUTO_INCREMENT PRIMARY KEY,
    cityNameEn VARCHAR(191) NOT NULL,
    cityNameHe VARCHAR(191) NOT NULL,
    countryId INT NOT NULL,
    FOREIGN KEY (countryId) REFERENCES country(countryId)
);

CREATE TABLE IF NOT EXISTS attraction (
    attractionId INT AUTO_INCREMENT PRIMARY KEY,
    cityId INT NOT NULL,
    name VARCHAR(191) NOT NULL,
    nameHE VARCHAR(255),
    type VARCHAR(191) NOT NULL,
    descriptionHe TEXT,
    tags JSON,
    img_url VARCHAR(2048),
    popularity_score INT NOT NULL DEFAULT 0,
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
    tripName VARCHAR(191) NOT NULL,
    countryId INT NOT NULL,
    startMonth INT NOT NULL,
    endMonth INT NOT NULL,
    travelStyle VARCHAR(191) NOT NULL,
    budget VARCHAR(191) NOT NULL,
    interests JSON,
    createdAt DATE NOT NULL,
    FOREIGN KEY (userId) REFERENCES user(userId),
    FOREIGN KEY (countryId) REFERENCES country(countryId)
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
    theme VARCHAR(191) NOT NULL DEFAULT 'light',
    fontSize VARCHAR(191) NOT NULL DEFAULT 'medium',
    density VARCHAR(191) NOT NULL DEFAULT 'normal',
    FOREIGN KEY (userId) REFERENCES user(userId) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS message (
    messageId INT AUTO_INCREMENT PRIMARY KEY,
    room VARCHAR(191) NOT NULL,
    userId INT NOT NULL,
    userName VARCHAR(191) NOT NULL,
    text TEXT NOT NULL,
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX idx_message_room (room)
);
