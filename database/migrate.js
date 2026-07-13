const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const MIGRATIONS_TABLE = '_migrations';
const DB_NAME = process.env.DB_NAME || 'design_resource_finder';

async function ensureDatabase(conn) {
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await conn.query(`USE \`${DB_NAME}\``);
}

async function ensureMigrationsTable(conn) {
  await conn.query(`
    CREATE TABLE IF NOT EXISTS \`${MIGRATIONS_TABLE}\` (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB
  `);
}

async function getAppliedMigrations(conn) {
  const [rows] = await conn.query(
    `SELECT name FROM \`${MIGRATIONS_TABLE}\` ORDER BY name ASC`
  );
  return new Set(rows.map(r => r.name));
}

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  try {
    await ensureDatabase(connection);
    await ensureMigrationsTable(connection);
    const applied = await getAppliedMigrations(connection);

    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    let count = 0;

    for (const file of files) {
      if (applied.has(file)) {
        console.log(`  SKIP ${file} (already applied)`);
        continue;
      }

      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      console.log(`  RUN  ${file}...`);

      try {
        await connection.query(sql);
        await connection.query(
          `INSERT INTO \`${MIGRATIONS_TABLE}\` (name) VALUES (?)`,
          [file]
        );
        console.log(`  DONE ${file}`);
        count++;
      } catch (err) {
        console.error(`  FAIL ${file}: ${err.message}`);
        process.exitCode = 1;
      }
    }

    if (count === 0) {
      console.log('No pending migrations.');
    } else {
      console.log(`Applied ${count} migration(s).`);
    }
  } finally {
    await connection.end();
  }
}

run();
