require('dotenv').config();
const mysql = require('mysql2/promise');
const { PrismaClient } = require('@prisma/client');

const pool = mysql.createPool({
    host:     process.env.DB_HOST     || 'localhost',
    port:     parseInt(process.env.DB_PORT || '3306', 10),
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'mydb',
    charset:  'utf8mb4',
    waitForConnections: true,
    connectionLimit:    10,
    queueLimit:         0
});

const prisma = new PrismaClient();

// Default export: mysql2 pool (scraper scripts)
module.exports = pool;
module.exports.pool = pool;
module.exports.prisma = prisma;
