-- Add image hash for caching
ALTER TABLE uploads 
ADD COLUMN file_hash VARCHAR(64) DEFAULT NULL,
ADD COLUMN cached_analysis_id INT DEFAULT NULL;

CREATE INDEX idx_file_hash ON uploads(file_hash);
CREATE INDEX idx_cached_analysis ON uploads(cached_analysis_id);

ALTER TABLE uploads 
ADD CONSTRAINT fk_cached_analysis FOREIGN KEY (cached_analysis_id) REFERENCES analyses(id) ON DELETE SET NULL;