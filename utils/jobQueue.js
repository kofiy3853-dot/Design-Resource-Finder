const pool = require('../config/database');
const EventEmitter = require('events');

class JobQueue extends EventEmitter {
  constructor() {
    super();
    this.pollInterval = null;
    this.handlers = new Map();
    this.processing = new Set();
  }

  register(type, handler) {
    this.handlers.set(type, handler);
  }

  async enqueue(type, payload, { priority = 0, maxRetries = 3 } = {}) {
    const [result] = await pool.query(
      'INSERT INTO job_queue (type, payload, status, priority, max_retries, progress) VALUES (?, ?, ?, ?, ?, ?)',
      [type, JSON.stringify(payload), 'pending', priority, maxRetries, 0]
    );
    return result.insertId;
  }

  async updateProgress(jobId, progress, step = null) {
    const updates = ['progress = ?', 'updated_at = NOW()'];
    const params = [Math.max(0, Math.min(100, progress))];

    if (step) {
      updates.push('current_step = ?');
      params.push(step);
    }

    params.push(jobId);
    await pool.query(`UPDATE job_queue SET ${updates.join(', ')} WHERE id = ?`, params);

    this.emit('progress', { jobId, progress, step });
  }

  async processNext() {
    const [jobs] = await pool.query(
      `SELECT * FROM job_queue
       WHERE status = 'pending'
         AND scheduled_at <= NOW()
       ORDER BY priority DESC, created_at ASC
       LIMIT 1`
    );

    if (jobs.length === 0) return null;
    const job = jobs[0];

    if (this.processing.has(job.id)) return null;
    this.processing.add(job.id);

    try {
      await pool.query('UPDATE job_queue SET status = ?, started_at = NOW() WHERE id = ?', [
        'processing',
        job.id,
      ]);

      const handler = this.handlers.get(job.type);
      if (!handler) {
        throw new Error(`No handler registered for job type: ${job.type}`);
      }

      // Pass progress callback to handler
      await handler(job, (progress, step) => this.updateProgress(job.id, progress, step));

      await pool.query(
        'UPDATE job_queue SET status = ?, completed_at = NOW(), progress = 100 WHERE id = ?',
        ['completed', job.id]
      );
      this.emit('progress', { jobId: job.id, progress: 100, step: 'completed' });

      return job;
    } catch (err) {
      const newRetryCount = (job.retry_count || 0) + 1;
      if (newRetryCount <= (job.max_retries || 3)) {
        await pool.query(
          'UPDATE job_queue SET status = ?, retry_count = ?, last_error = ? WHERE id = ?',
          ['pending', newRetryCount, err.message, job.id]
        );
      } else {
        await pool.query(
          'UPDATE job_queue SET status = ?, retry_count = ?, last_error = ? WHERE id = ?',
          ['failed', newRetryCount, err.message, job.id]
        );
        this.emit('progress', { jobId: job.id, progress: 0, step: 'failed', error: err.message });
      }
      return job;
    } finally {
      this.processing.delete(job.id);
    }
  }

  startPolling(intervalMs = 1000) {
    if (this.pollInterval) return;
    this.pollInterval = setInterval(() => {
      this.processNext().catch((err) => {
        console.error('[JobQueue] Poll error:', err.message);
      });
    }, intervalMs);
  }

  stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  async getPendingCount() {
    const [{ count }] = await pool.query(
      "SELECT COUNT(*) as count FROM job_queue WHERE status = 'pending'"
    );
    return count;
  }

  async getFailedJobs() {
    const [rows] = await pool.query(
      "SELECT * FROM job_queue WHERE status = 'failed' ORDER BY created_at DESC LIMIT 50"
    );
    return rows;
  }

  async retryFailed(id) {
    await pool.query(
      "UPDATE job_queue SET status = 'pending', retry_count = 0, last_error = NULL, progress = 0 WHERE id = ? AND status = 'failed'",
      [id]
    );
  }

  async retryAllFailed() {
    const [result] = await pool.query(
      "UPDATE job_queue SET status = 'pending', retry_count = 0, last_error = NULL, progress = 0 WHERE status = 'failed'"
    );
    return result.affectedRows;
  }

  async getJob(jobId) {
    const [rows] = await pool.query('SELECT * FROM job_queue WHERE id = ?', [jobId]);
    return rows[0] || null;
  }

  async getJobByAnalysisId(analysisId) {
    const [rows] = await pool.query(
      "SELECT * FROM job_queue WHERE JSON_EXTRACT(payload, '$.analysisId') = ? ORDER BY created_at DESC LIMIT 1",
      [analysisId]
    );
    return rows[0] || null;
  }
}

module.exports = new JobQueue();
