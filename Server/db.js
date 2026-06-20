const mysql = require('mysql2/promise');

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

// Prisma client — used for schema/migrations; ORM layer still uses mysql2 pool
let prisma = null;
try {
    const { PrismaClient } = require('@prisma/client');
    prisma = new PrismaClient();
} catch (err) {
    console.warn('[db] Prisma client not generated yet. Run: npm run db:generate');
}

module.exports = pool;
module.exports.prisma = prisma;
