# Database Setup Checklist

## Pre-Setup ✓
- [ ] Node.js installed (`node --version`)
- [ ] MySQL Server installed and running
- [ ] `.env` file exists with database credentials
- [ ] Project dependencies installed (`npm install`)

## Initial Setup ✓

### Step 1: Verify MySQL is Running
```bash
# Test connection
npm run db:check
```
**Expected**: Shows "✓ Connected successfully"

**If fails**: 
- Windows: Start MySQL from Services
- macOS: `brew services start mysql`
- Linux: `sudo systemctl start mysql`

### Step 2: Initialize Database
```bash
npm run db:init
```
**Expected**: "Database initialized successfully."

**If fails**:
- Check `.env` credentials
- Verify MySQL is running
- Check MySQL user permissions

### Step 3: Seed Learning Content (Optional)
```bash
npm run db:seed
```
**Expected**: "10 lessons seeded successfully."

**If fails**: Database might not be initialized yet (run Step 2 first)

### Step 4: Verify Setup
```bash
npm run db:check
```
**Expected**: Shows all 9 tables with record counts

---

## Verification Checklist ✓

After setup, verify each component:

- [ ] **Connection**: Can connect to MySQL server
- [ ] **Database exists**: `design_resource_finder` database created
- [ ] **Tables created**: All 9 tables present
  - [ ] users
  - [ ] uploads
  - [ ] analyses
  - [ ] reports
  - [ ] saved_items
  - [ ] notifications
  - [ ] activity_logs
  - [ ] settings
  - [ ] learning_lessons
- [ ] **Learning content**: 10 lessons seeded (if you ran db:seed)
- [ ] **Indexes**: Foreign keys and indexes configured

### Manual Verification
```bash
# Connect to MySQL
mysql -u root

# Select database
USE design_resource_finder;

# Check tables
SHOW TABLES;
# Should show 9 tables

# Check record counts
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM learning_lessons;

# Exit
EXIT;
```

---

## Common Issues & Solutions ✓

### ❌ "Can't connect to localhost:3306"
| Symptom | Solution |
|---------|----------|
| Connection refused | Verify MySQL is running |
| Port in use | Check if another MySQL is running |
| Wrong host/port | Verify `.env` DB_HOST and DB_PORT |

**Fix**:
1. Check if MySQL service is running
2. Update `.env` if using different host/port
3. Run `npm run db:check` again

---

### ❌ "Access denied for user 'root'@'localhost'"
| Symptom | Solution |
|---------|----------|
| Wrong password | Update DB_PASSWORD in .env |
| User doesn't exist | Create user in MySQL |
| No password set | Leave DB_PASSWORD empty in .env |

**Fix**:
1. Update `.env` with correct credentials
2. Test with: `mysql -u root -p` (if password set)
3. Run `npm run db:check` again

---

### ❌ "Unknown database 'design_resource_finder'"
| Symptom | Solution |
|---------|----------|
| Database not initialized | Run `npm run db:init` |
| Connection to wrong server | Check DB_HOST in .env |

**Fix**:
1. Run: `npm run db:init`
2. Verify with: `npm run db:check`

---

### ❌ "Table 'X' doesn't exist"
| Symptom | Solution |
|---------|----------|
| Partial initialization | Reinitialize tables |
| Migration issue | Check Node.js logs |

**Fix**:
```bash
# Reset database (WARNING: deletes all data)
mysql -u root -e "DROP DATABASE IF EXISTS design_resource_finder;"
npm run db:init
npm run db:seed
```

---

### ❌ "Duplicate entry for key 'email'"
| Symptom | Solution |
|---------|----------|
| Email already registered | Use different email to register |
| Trying to seed twice | Data already exists, that's OK |

**Fix**: No action needed, this is expected behavior

---

## Configuration Reference ✓

### Environment Variables (.env)
```dotenv
# Database Connection
DB_HOST=localhost          # MySQL server address
DB_PORT=3306              # MySQL port (default)
DB_USER=root              # MySQL username
DB_PASSWORD=              # MySQL password (empty if none)
DB_NAME=design_resource_finder  # Database name

# Application
PORT=3000                 # App port
NODE_ENV=development      # dev or production

# Security
JWT_SECRET=drf_jwt_secret_change_in_production
JWT_EXPIRES_IN=7d

# AI & Storage (Optional)
OPENAI_API_KEY=          # For design analysis
CLOUDINARY_CLOUD_NAME=   # For image CDN
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Upload
UPLOAD_MAX_SIZE=10485760 # 10MB
SITE_URL=http://localhost:3000
```

---

## Quick Command Reference ✓

```bash
# Database operations
npm run db:check          # Health check
npm run db:init           # Initialize tables
npm run db:seed           # Load lessons
npm run dev               # Start dev server
npm start                 # Start production

# MySQL direct access
mysql -u root -p          # Connect with password
mysql -u root design_resource_finder  # Direct DB access

# Backup database
mysqldump -u root design_resource_finder > backup.sql

# Restore database
mysql -u root design_resource_finder < backup.sql
```

---

## Production Readiness ✓

Before deploying to production:

- [ ] **Database Credentials**
  - [ ] Change DB_PASSWORD to strong password
  - [ ] Update DB_USER if not using 'root'
  - [ ] Update DB_HOST to server IP/domain
  
- [ ] **Security**
  - [ ] Change JWT_SECRET to random 32+ char string
  - [ ] Set NODE_ENV=production
  - [ ] Enable SSL/HTTPS
  - [ ] Configure firewall (only allow from app server)
  
- [ ] **Backups**
  - [ ] Set up automated daily backups
  - [ ] Test restore procedures
  - [ ] Store backups off-server
  
- [ ] **Monitoring**
  - [ ] Set up database monitoring
  - [ ] Configure alerts for errors
  - [ ] Track query performance
  
- [ ] **Performance**
  - [ ] Optimize indexes
  - [ ] Archive old logs monthly
  - [ ] Consider read replicas for scaling

---

## Testing ✓

### Test New User Registration
```bash
# Start app
npm run dev

# Visit http://localhost:3000
# Click "Get Started"
# Register with test account
# Check database
mysql -u root design_resource_finder
SELECT * FROM users;  # Should show your test user
EXIT;
```

### Test Analysis Workflow
```bash
# 1. Log in as test user
# 2. Click "Analyze Design"
# 3. Upload a design file
# 4. Check database
mysql -u root design_resource_finder
SELECT * FROM uploads;   # Should show upload
SELECT * FROM analyses;  # Should show pending analysis
EXIT;
```

### Test Reports Generation
```bash
# 1. View completed analysis
# 2. Generate PDF report
# 3. Check database
mysql -u root design_resource_finder
SELECT * FROM reports;   # Should show report
EXIT;
```

---

## Troubleshooting Workflow ✓

**Follow this order when issues occur:**

1. **Run health check**: `npm run db:check`
2. **Check logs**: Look for error messages
3. **Verify MySQL**: Is service running?
4. **Check credentials**: Are .env settings correct?
5. **Test connectivity**: `mysql -u root -e "SHOW DATABASES;"`
6. **Review schema**: Run `npm run db:init` again
7. **Check permissions**: User has CREATE/ALTER privileges?
8. **Consult docs**: Review DATABASE_SETUP.md, DATABASE_SCHEMA.md

---

## Next Steps ✓

After successful setup:

1. ✓ Database initialized
2. ✓ Tables created
3. ✓ Learning content seeded
4. → **Start the application**: `npm run dev`
5. → **Create user account**: Register at http://localhost:3000
6. → **Upload designs**: Start analyzing
7. → **Deploy to production**: See QUICKSTART.md

---

## Support Resources

| Resource | Purpose |
|----------|---------|
| QUICKSTART.md | Get up and running quickly |
| DATABASE_SETUP.md | Detailed database setup guide |
| DATABASE_SCHEMA.md | Schema documentation |
| .env | Configuration settings |
| npm run db:check | Verify database health |

---

## Database Version Info

- **MySQL**: 5.7+ recommended, 8.0+ preferred
- **Character Set**: utf8mb4 (Unicode support)
- **Storage Engine**: InnoDB (ACID compliance)
- **Created**: 2024
- **Schema Version**: 1.0

---

**Status**: ✓ Ready to proceed with application development

**Last Updated**: 2024
