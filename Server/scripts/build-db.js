/**
 * Build complete mydb from dump + migrations + enrichment.
 * Run from project root: node Server/scripts/build-db.js
 */
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '../..');
const SERVER = path.join(ROOT, 'Server');

function loadEnv() {
    const envPath = path.join(SERVER, '.env');
    const env = {};
    if (!fs.existsSync(envPath)) return env;
    fs.readFileSync(envPath, 'utf8').split(/\r?\n/).forEach(function(line) {
        const m = line.match(/^([^#=]+)=(.*)$/);
        if (m) env[m[1].trim()] = m[2].trim();
    });
    return env;
}

function runMysql(args, password, sql) {
    return new Promise(function(resolve, reject) {
        const mysqlArgs = ['-u', args.user, '--default-character-set=utf8mb4'];
        if (password) mysqlArgs.push('-p' + password);

        const proc = spawn(args.mysqlBin, mysqlArgs, { stdio: ['pipe', 'inherit', 'inherit'] });
        proc.stdin.write(sql);
        proc.stdin.end();
        proc.on('close', function(code) {
            if (code !== 0) reject(new Error('mysql exited with ' + code));
            else resolve();
        });
    });
}

function runSqlFile(ctx, relativePath, optional) {
    const filePath = path.join(SERVER, relativePath);
    if (!fs.existsSync(filePath)) {
        if (optional) return Promise.resolve();
        return Promise.reject(new Error('Missing ' + filePath));
    }

    let sql = fs.readFileSync(filePath, 'utf8');
    sql = sql.replace(/--[^\n]*/g, '');
    const statements = sql.split(';').map(function(s) { return s.trim(); }).filter(Boolean);
    const full = ['USE mydb;'].concat(statements).join(';\n') + ';\n';

    console.log('Running', relativePath, '(' + statements.length + ' statements)...');
    return runMysql(ctx, ctx.password, full).catch(function(err) {
        if (optional) {
            console.warn('Warning:', relativePath, '-', err.message);
            return;
        }
        throw err;
    });
}

function importDump(ctx) {
    const dumpPath = path.join(ROOT, 'mydb_dump.sql');
    if (!fs.existsSync(dumpPath)) {
        return Promise.reject(new Error('mydb_dump.sql not found'));
    }

    let dump = fs.readFileSync(dumpPath, 'utf8');
    dump = dump.replace(/SET @@GLOBAL\.GTID_PURGED[^;]*;/s, '');

    console.log('Importing mydb_dump.sql...');
    return runMysql(ctx, ctx.password, dump);
}

async function main() {
    const env = loadEnv();
    const ctx = {
        mysqlBin: 'C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysql.exe',
        user: env.DB_USER || 'root',
        password: env.DB_PASSWORD || ''
    };

    if (!fs.existsSync(ctx.mysqlBin)) {
        console.error('mysql.exe not found. Install MySQL or update path in build-db.js');
        process.exit(1);
    }

    await importDump(ctx);

    await runMysql(ctx, ctx.password, [
        'USE mydb;',
        'CREATE TABLE IF NOT EXISTS message (',
        '  messageId INT AUTO_INCREMENT PRIMARY KEY,',
        '  room VARCHAR(100) NOT NULL,',
        '  userId INT NOT NULL,',
        '  userName VARCHAR(100) NOT NULL,',
        '  text TEXT NOT NULL,',
        '  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,',
        '  INDEX idx_message_room (room)',
        ');'
    ].join('\n'));

    await runSqlFile(ctx, 'migrations/002_city_media.sql', true);
    await runSqlFile(ctx, 'migrations/003_country_media.sql', true);

    console.log('\nRunning Prisma enrichment...');
    await require('./enrich-database').run();
    console.log('\n=== Build complete ===');
    console.log('Next: cd Server && npm run db:generate && npm start');
}

main().catch(function(err) {
    console.error(err.message);
    process.exit(1);
});
