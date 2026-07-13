CREATE TABLE IF NOT EXISTS generated_backgrounds (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  style VARCHAR(50) NOT NULL,
  color_theme VARCHAR(50) DEFAULT 'auto',
  custom_prompt TEXT,
  image_url VARCHAR(500) NOT NULL,
  prompt_used TEXT,
  provider VARCHAR(50) DEFAULT 'mock',
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);