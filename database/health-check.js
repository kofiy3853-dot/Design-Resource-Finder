const mysql = require('mysql2/promise');
require('dotenv').config();

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

async function healthCheck() {
  console.log(`\n${colors.cyan}[DATABASE HEALTH CHECK]${colors.reset}\n`);

  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'design_resource_finder',
  };

  console.log(`${colors.cyan}Configuration:${colors.reset}`);
  console.log(`  Host: ${config.host}`);
  console.log(`  Port: ${config.port}`);
  console.log(`  User: ${config.user}`);
  console.log(`  Database: ${config.database}\n`);

  try {
    // Test connection
    console.log(`${colors.cyan}Connecting to database...${colors.reset}`);
    const connection = await mysql.createConnection(config);
    console.log(`${colors.green}[OK] Connected successfully${colors.reset}\n`);

    // Check tables
    console.log(`${colors.cyan}Checking tables:${colors.reset}`);
    const [tables] = await connection.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = ?`,
      [config.database]
    );

    const expectedTables = [
      'users',
      'uploads',
      'analyses',
      'reports',
      'saved_items',
      'notifications',
      'activity_logs',
      'settings',
      'learning_lessons',
    ];

    const existingTables = tables.map((t) => t.table_name);
    let allTablesExist = true;

    for (const table of expectedTables) {
      if (existingTables.includes(table)) {
        const [rows] = await connection.query(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`  ${colors.green}[OK]${colors.reset} ${table} (${rows[0].count} records)`);
      } else {
        console.log(
          `  ${colors.red}[FAIL]${colors.reset} ${table} - ${colors.red}MISSING${colors.reset}`
        );
        allTablesExist = false;
      }
    }

    console.log();

    // Check for extra tables
    const extraTables = existingTables.filter((t) => !expectedTables.includes(t));
    if (extraTables.length > 0) {
      console.log(`${colors.yellow}Extra tables:${colors.reset}`);
      extraTables.forEach((table) => {
        console.log(`  [WARN] ${table}`);
      });
      console.log();
    }

    // Database size
    console.log(`${colors.cyan}Database Statistics:${colors.reset}`);
    const [sizeResult] = await connection.query(
      `
      SELECT
        SUM(data_length + index_length) as size_bytes,
        COUNT(*) as table_count
      FROM information_schema.tables
      WHERE table_schema = ?
    `,
      [config.database]
    );

    const sizeBytes = sizeResult[0].size_bytes || 0;
    const sizeKB = (sizeBytes / 1024).toFixed(2);
    const sizeMB = (sizeBytes / (1024 * 1024)).toFixed(2);

    console.log(`  Tables: ${sizeResult[0].table_count}`);
    console.log(`  Size: ${sizeKB} KB (${sizeMB} MB)\n`);

    // Final status
    if (allTablesExist) {
      console.log(`${colors.green}[OK] Database is healthy and ready to use!${colors.reset}\n`);
    } else {
      console.log(
        `${colors.red}[FAIL] Some tables are missing. Run 'npm run db:init' to initialize.${colors.reset}\n`
      );
    }

    await connection.end();
  } catch (err) {
    console.error(`${colors.red}[FAIL] Error: ${err.message}${colors.reset}\n`);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.log(
        `${colors.yellow}Suggestion: Make sure MySQL server is running.${colors.reset}\n`
      );
    } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log(
        `${colors.yellow}Suggestion: Check database credentials in .env file.${colors.reset}\n`
      );
    } else if (err.code === 'ER_BAD_DB_ERROR') {
      console.log(
        `${colors.yellow}Suggestion: Database doesn't exist. Run 'npm run db:init' to create it.${colors.reset}\n`
      );
    }
    process.exit(1);
  }
}

healthCheck();
