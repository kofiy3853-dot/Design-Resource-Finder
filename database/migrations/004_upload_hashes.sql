-- Upload hash table for caching
CREATE TABLE IF NOT EXISTS upload_hashes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  file_hash VARCHAR(64) NOT NULL,
  analysis_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_hash (file_hash),
  INDEX idx_analysis (analysis_id),
  FOREIGN KEY (analysis_id) REFERENCES analyses(id) ON DELETE CASCADE
) ENGINE=InnoDB;