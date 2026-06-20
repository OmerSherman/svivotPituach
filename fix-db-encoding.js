/**
 * Re-import mydb_dump.sql with correct UTF-8 encoding.
 * PowerShell piping corrupts Hebrew — this reads the file as bytes and pipes to mysql.
 *
 * Run from project root: node fix-db-encoding.js
 */
require('dotenv').config({ path: require('path').join(__dirname, 'Server', '.env') });
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const mysqlBin = 'C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysql.exe';
const dumpPath = path.join(__dirname, 'mydb_dump.sql');
const password = process.env.DB_PASSWORD || '';
const user = process.env.DB_USER || 'root';

if (!fs.existsSync(mysqlBin)) {
    console.error('mysql.exe not found at', mysqlBin);
    process.exit(1);
}

if (!fs.existsSync(dumpPath)) {
    console.error('mydb_dump.sql not found');
    process.exit(1);
}

let dump = fs.readFileSync(dumpPath, 'utf8');
dump = dump.replace(/SET @@GLOBAL\.GTID_PURGED[^;]*;/s, '');

console.log('Dropping and re-importing mydb with utf8mb4...');

const args = ['-u', user, '--default-character-set=utf8mb4'];
if (password) args.push(`-p${password}`);

const proc = spawn(mysqlBin, args, { stdio: ['pipe', 'inherit', 'inherit'] });
proc.stdin.write(dump);
proc.stdin.end();

proc.on('close', function(code) {
    if (code !== 0) {
        console.error('Import failed with code', code);
        process.exit(code);
    }

    console.log('Creating message table if missing...');
    const msgSql = `USE mydb;
CREATE TABLE IF NOT EXISTS message (
    messageId INT AUTO_INCREMENT PRIMARY KEY,
    room VARCHAR(100) NOT NULL,
    userId INT NOT NULL,
    userName VARCHAR(100) NOT NULL,
    text TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_message_room (room)
);`;

    const proc2 = spawn(mysqlBin, args, { stdio: ['pipe', 'inherit', 'inherit'] });
    proc2.stdin.write(msgSql);
    proc2.stdin.end();

    proc2.on('close', function(code2) {
        if (code2 !== 0) {
            console.error('message table step failed');
            process.exit(code2);
        }

        const verify = spawn(mysqlBin, args, {
            stdio: ['pipe', 'inherit', 'inherit']
        });
        verify.stdin.write('USE mydb; SELECT cityId, cityNameHe FROM city LIMIT 4;\n');
        verify.stdin.end();

        verify.on('close', function() {
            console.log('\nDone! Restart the Server (npm start) and refresh the browser.');
        });
    });
});
