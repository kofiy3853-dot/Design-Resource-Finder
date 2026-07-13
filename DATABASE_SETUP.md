# Database Setup Guide

## Current Configuration

### Database Credentials (from `.env`)
- **Host**: `localhost`
- **Port**: `3306`
- **User**: `root`
- **Password**: (empty - no password)
- **Database Name**: `design_resource_finder`

## Prerequisites

You need to have **MySQL Server** installed and running on your system.

### Windows Installation
1. Download MySQL from: https://dev.mysql.com/downloads/mysql/
2. Run the installer and follow the setup wizard
3. Choose "Standalone MySQL Server"
4. Configure MySQL Server with default settings (port 3306, port 33060)
5. MySQL Notifier will run at startup

### macOS Installation
```bash
# Using Homebrew (recommended)
brew install mysql
brew services start mysql

# Or download from: https://dev.mysql.com/downloads/mysql/
```

### Linux Installation (Ubuntu/Debian)
```bash
sudo apt-get install mysql-server
sudo systemctl start mysql
```

## Setup Steps

### 1. Start MySQL Server
Make sure MySQL is running:
```bash
# Windows - MySQL should run automatically
# macOS
brew services start mysql

# Linux
sudo systemctl start mysql
```

### 2. Initialize the Database
Run the database initialization script:
```bash
npm run db:init
```

**What this does:**
- Creates the `design_resource_finder` database
- Creates all required tables: users, uploads, analyses, reports, saved_items, notifications, activity_logs, settings, learning_lessons
- Sets up proper indexes for performance
- Configures foreign key relationships

### 3. Seed Learning Lessons (Optional)
Populate the learning center with educational content:
```bash
npm run db:seed
```

**What this does:**
- Adds 10 learning lessons covering:
  - Typography Fundamentals
  - Color Theory for Designers
  - Composition & Layout
  - White Space in Design
  - Branding Fundamentals
  - Flyer & Poster Design
  - Social Media Design
  - Accessibility in Design
  - Visual Hierarchy
  - Design Style Guide

## Database Schema Overview

### Tables

**users**
- User accounts with hashed passwords
- Profile info: name, email, avatar, role (user/admin)
- Verification status and password reset tokens
- Created/updated timestamps

**uploads**
- Stores uploaded design files
- File metadata: original name, MIME type, size
- Cloud storage URLs (Cloudinary)
- Thumbnails

**analyses**
- Design analysis results
- Status tracking: pending, processing, completed, failed
- Extracted data: fonts, colors, typography, layout, etc.
- AI explanations and resource recommendations
- Confidence scores

**reports**
- Generated design reports (PDF, JSON, CSV)
- Links analyses to reports
- File paths and creation timestamps

**saved_items**
- User's saved/favorite items
- Item types: analysis, report, resource, guide
- User notes

**notifications**
- System notifications (e.g., analysis complete)
- Read/unread status
- Notification types and timestamps

**activity_logs**
- Tracks user actions (view analysis, etc.)
- IP address and user agent logging
- Action details in JSON format

**settings**
- Global application settings
- Key-value pairs stored as JSON

**learning_lessons**
- Educational content for the learning center
- Organized by category
- Searchable by slug
- Publication status and order index

## Verification

To verify the database is set up correctly:

```bash
# Connect to MySQL
mysql -u root

# Check database exists
mysql> SHOW DATABASES;
mysql> USE design_resource_finder;

# Check tables
mysql> SHOW TABLES;

# Count records (should have 10 lessons if seeded)
mysql> SELECT COUNT(*) FROM learning_lessons;

# Exit
mysql> EXIT;
```

## Troubleshooting

### Connection Error: "Can't connect to localhost:3306"
- **Issue**: MySQL server is not running
- **Solution**: Start MySQL service
  - Windows: Check MySQL in Services
  - macOS: `brew services start mysql`
  - Linux: `sudo systemctl start mysql`

### Access Denied for user 'root'@'localhost'
- **Issue**: MySQL password is set but .env has empty password
- **Solution**: Update `.env` with correct password:
  ```
  DB_PASSWORD=your_mysql_password
  ```

### Database 'design_resource_finder' doesn't exist
- **Issue**: Database initialization hasn't been run
- **Solution**: Execute `npm run db:init`

### Port 3306 already in use
- **Issue**: Another MySQL instance or service is using the port
- **Solution**: Change port in `.env` and MySQL config, or stop the other service

### Permission Error on Windows
- **Issue**: MySQL service has permission issues
- **Solution**: Run Command Prompt as Administrator and restart MySQL

## Environment Variables

Update `.env` for your setup:

```dotenv
# Database Configuration
DB_HOST=localhost        # MySQL host
DB_PORT=3306            # MySQL port
DB_USER=root            # MySQL username
DB_PASSWORD=            # MySQL password (leave empty if no password)
DB_NAME=design_resource_finder

# Optional: For production, add these
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
OPENAI_API_KEY=your_openai_key
```

## Running the Application

Once database is initialized:

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

Visit `http://localhost:3000` in your browser.

## Reset Database (Caution!)

To completely reset and reinitialize:

```bash
# This will DROP the database and recreate it
mysql -u root -e "DROP DATABASE IF EXISTS design_resource_finder;"
npm run db:init
npm run db:seed
```

⚠️ **Warning**: This will delete all data. Only do this during development.

## Next Steps

1. ✅ Database initialized
2. ✅ Tables created
3. ✅ Learning content seeded (optional)
4. Create a user account by registering
5. Start uploading designs and analyzing them!
