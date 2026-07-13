# Quick Start Guide

## Prerequisites

Make sure you have installed:
- **Node.js** (v16+) - https://nodejs.org
- **MySQL Server** - https://dev.mysql.com/downloads/mysql/

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Check Database Connection
```bash
npm run db:check
```

This will verify:
- ✓ Can connect to MySQL
- ✓ Database exists
- ✓ All required tables are present
- ✓ Table record counts

**Expected Output:**
```
✓ Connected successfully
✓ users (0 records)
✓ uploads (0 records)
✓ analyses (0 records)
✓ reports (0 records)
✓ saved_items (0 records)
✓ notifications (0 records)
✓ activity_logs (0 records)
✓ settings (0 records)
✓ learning_lessons (0 records)

✓ Database is healthy and ready to use!
```

### 3. Initialize Database (First Time Only)
```bash
npm run db:init
```

This creates all tables and schema.

### 4. Seed Learning Content (Optional)
```bash
npm run db:seed
```

This adds 10 lessons to the learning center.

### 5. Start the Application
```bash
# Development (auto-reload on file changes)
npm run dev

# Production
npm start
```

Visit: **http://localhost:3000**

## Database Commands Reference

| Command | Purpose |
|---------|---------|
| `npm run db:check` | Health check - verify database status |
| `npm run db:init` | Initialize database and create tables |
| `npm run db:seed` | Populate learning lessons |
| `npm run dev` | Start development server |
| `npm start` | Start production server |

## First Steps After Setup

1. **Register an account** - Visit http://localhost:3000/auth/register
2. **Create an account** - Sign up with email and password
3. **Upload a design** - Click "Analyze Design" to upload an image
4. **View results** - See design analysis with AI insights
5. **Explore features** - Check dashboard, history, saved items

## Troubleshooting

### "Can't connect to localhost:3306"
**MySQL server is not running**

- **Windows**: Check Services or start MySQL from Start menu
- **macOS**: `brew services start mysql`
- **Linux**: `sudo systemctl start mysql`

### "Access denied for user 'root'@'localhost'"
**Wrong database password in .env**

Update `.env`:
```dotenv
DB_PASSWORD=your_actual_password
```

### "Unknown database 'design_resource_finder'"
**Database not initialized**

Run:
```bash
npm run db:init
```

### "Table doesn't exist" error
**Tables not created**

```bash
npm run db:check  # Check status
npm run db:init   # Reinitialize if needed
```

## Configuration

Edit `.env` to customize:

```dotenv
# Port
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d

# OpenAI (for design analysis)
OPENAI_API_KEY=sk-your-key

# Cloudinary (for image hosting)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# App Settings
UPLOAD_MAX_SIZE=10485760
SITE_URL=http://localhost:3000
```

## Project Structure

```
├── config/              # Database and app config
├── controllers/         # Business logic
├── database/           # DB init, seed, health check
├── middleware/         # Auth, error handling, uploads
├── models/             # Data models (User, Analysis)
├── public/             # CSS, JS, images, uploads
├── routes/             # API and page routes
├── utils/              # AI service, PDF generation, etc
├── views/              # EJS templates
├── server.js           # Entry point
└── package.json        # Dependencies
```

## Performance Tips

1. **Database Indexes** - Already set up on frequently searched columns
2. **Connection Pool** - Configured with 10 connections
3. **Caching** - Implement Redis for session caching (optional)
4. **CDN** - Use Cloudinary for image delivery

## Security Notes

⚠️ **Before Production:**
- Change `JWT_SECRET` to a strong random value
- Use strong `DB_PASSWORD`
- Set `NODE_ENV=production`
- Set `SITE_URL` to your domain
- Enable HTTPS
- Add API rate limiting (already implemented)
- Sanitize user inputs (already implemented with middleware)

## Need Help?

1. Check the **DATABASE_SETUP.md** for detailed database info
2. Review error messages in the console
3. Run `npm run db:check` to diagnose issues
4. Check server logs for specific errors

## Next: Production Deployment

See `DEPLOYMENT.md` for deploying to production.
