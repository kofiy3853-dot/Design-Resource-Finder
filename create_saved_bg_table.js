const pool = require('./config/database');

async function createTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS saved_backgrounds (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      background_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (background_id) REFERENCES generated_backgrounds(id) ON DELETE CASCADE,
      UNIQUE KEY unique_user_bg (user_id, background_id)
    )
  `);
  console.log('saved_backgrounds table created');
  process.exit(0);
}

createTable().catch((e) => {
  console.error(e);
  process.exit(1);
});
