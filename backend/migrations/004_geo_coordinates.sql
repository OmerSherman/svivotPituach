-- Migration 004: add map coordinates to countries and cities
-- (the attraction table already had latitude/longitude from the baseline schema;
-- this brings country/city in line with backend/models/schema.prisma)
ALTER TABLE country ADD COLUMN latitude DOUBLE NULL;
ALTER TABLE country ADD COLUMN longitude DOUBLE NULL;

ALTER TABLE city ADD COLUMN latitude DOUBLE NULL;
ALTER TABLE city ADD COLUMN longitude DOUBLE NULL;
