


--@block
CREATE TABLE IF NOT EXISTS Users(
    id INT PRIMARY KEY AUTO_INCREMENT, 
    firstName VARCHAR(32),
    lastName VARCHAR(32),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    user_role VARCHAR(16),
    createDate DATE,
    updateDate DATE
);

--@block
CREATE TABLE IF NOT EXISTS Travelers_profiles(
    user_id INT PRIMARY KEY,
    FOREIGN KEY (user_id) REFERENCES Users(id) 
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    interests JSON,
    budget_level VARCHAR(8)

);

--@block
CREATE TABLE IF NOT EXISTS Countries(
    id INT PRIMARY KEY AUTO_INCREMENT,
    c_name VARCHAR(32) UNIQUE,
    code VARCHAR(2) UNIQUE
);

INSERT IGNORE INTO Countries (c_name, code) VALUES
('Argentina', 'AR'),
('Belize', 'BZ'),
('Bolivia', 'BO'),
('Brazil', 'BR'),
('Chile', 'CL'),
('Colombia', 'CO'),
('Costa Rica', 'CR'),
('Cuba', 'CU'),
('Dominican Republic', 'DO'),
('Ecuador', 'EC'),
('El Salvador', 'SV'),
('French Guiana', 'GF'),
('Guatemala', 'GT'),
('Guyana', 'GY'),
('Haiti', 'HT'),
('Honduras', 'HN'),
('Mexico', 'MX'),
('Nicaragua', 'NI'),
('Panama', 'PA'),
('Paraguay', 'PY'),
('Peru', 'PE'),
('Suriname', 'SR'),
('Uruguay', 'UY'),
('Venezuela', 'VE'),
('Aruba', 'AW'),
('Netherlands Antilles', 'AN'),
('Trinidad and Tobago', 'TT');

--@block
CREATE TABLE IF NOT EXISTS Cities(
    id INT PRIMARY KEY AUTO_INCREMENT,
    country_id INT,
    FOREIGN KEY (country_id) REFERENCES Countries(id) ON UPDATE CASCADE,
    city_name VARCHAR(32),
    city_name_he VARCHAR(32),
    summery_he TEXT,
    banner_img_url TEXT,
    lat DECIMAL, 
    long DECIMAL

);

--@block
CREATE TABLE IF NOT EXISTS Attractions(
    id INT PRIMARY KEY AUTO_INCREMENT,
    attraction_name VARCHAR(64),
    attraction_name_he VARCHAR(64),
    country_id INT, 
    FOREIGN KEY (country_id) REFERENCES Countries(id) ON UPDATE CASCADE,
    country_name VARCHAR(32),
    city_id INT, 
    FOREIGN KEY  (city_id) REFERENCES Cities(id) ON UPDATE CASCADE,
    city_name VARCHAR(32),
    type_of_att VARCHAR(32)
    tags JSON ,
    score DECIMAL(3,1),
    audience_scores JSON,
    descript TEXT,
    descript_he TEXT,
    best_month JSON,
    avoid_month JSON,
    lat DECIMAL,
    long DECIMAL,
    source_article_ids JSON,
    img_url TEXT
    

);