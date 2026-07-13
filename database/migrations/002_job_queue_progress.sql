-- Add progress tracking to job_queue
ALTER TABLE job_queue 
ADD COLUMN progress INT DEFAULT 0,
ADD COLUMN current_step VARCHAR(100) DEFAULT NULL,
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Update existing rows to have progress 0
UPDATE job_queue SET progress = 0 WHERE progress IS NULL;