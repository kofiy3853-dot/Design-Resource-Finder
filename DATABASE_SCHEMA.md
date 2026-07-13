# Database Schema Documentation

## Overview

The Design Resource Finder uses MySQL to store user data, design analyses, and application state.

**Total Tables**: 9  
**Primary Keys**: All tables have auto-increment `id` primary keys  
**Foreign Keys**: Properly configured for data integrity  
**Character Set**: UTF8MB4 (supports emoji and special characters)

---

## Table Schemas

### users
Stores user accounts and profile information.

```
id (INT, PRIMARY KEY, AUTO_INCREMENT)
name (VARCHAR 100)
email (VARCHAR 255, UNIQUE)
password (VARCHAR 255, bcrypt hashed)
avatar (VARCHAR 500, nullable - profile picture URL)
role (ENUM: 'user', 'admin')
is_verified (TINYINT, 0=not verified, 1=verified)
reset_token (VARCHAR 500, nullable - password reset token)
reset_token_expires (DATETIME, nullable - token expiration)
preferences (JSON, nullable - user settings)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)

INDEXES:
  - idx_email: UNIQUE on email
  - idx_role: for admin queries
```

**Records**: ~0 on fresh install  
**Typical Size**: ~500 bytes per user

---

### uploads
Stores uploaded design files and metadata.

```
id (INT, PRIMARY KEY, AUTO_INCREMENT)
user_id (INT, FOREIGN KEY → users.id)
filename (VARCHAR 255, stored filename)
original_name (VARCHAR 255, original uploaded name)
mime_type (VARCHAR 50, e.g., 'image/jpeg')
size (INT, file size in bytes)
path (VARCHAR 500, local storage path)
cloudinary_url (VARCHAR 500, nullable - CDN URL)
thumbnail_url (VARCHAR 500, nullable - thumbnail URL)
created_at (TIMESTAMP)

INDEXES:
  - idx_user: for fetching user uploads
  - FOREIGN KEY: user_id → users.id (CASCADE delete)
```

**Records**: Increases with uploads  
**Typical Size**: ~600 bytes per upload  
**Relationship**: One user can have many uploads

---

### analyses
Stores design analysis results and AI insights.

```
id (INT, PRIMARY KEY, AUTO_INCREMENT)
user_id (INT, FOREIGN KEY → users.id)
upload_id (INT, FOREIGN KEY → uploads.id, nullable)
title (VARCHAR 255, nullable - analysis title)
status (ENUM: 'pending', 'processing', 'completed', 'failed')
fonts (JSON, nullable - extracted font data)
colors (JSON, nullable - color palette)
typography (JSON, nullable - typography analysis)
layout (JSON, nullable - layout structure)
background (JSON, nullable - background properties)
shapes (JSON, nullable - detected shapes)
objects (JSON, nullable - detected objects)
design_style (JSON, nullable - style classification)
accessibility (JSON, nullable - accessibility report)
ai_explanation (TEXT, nullable - AI insights)
resource_recommendations (JSON, nullable - suggested resources)
prompts (JSON, nullable - generation prompts)
recreation_guides (JSON, nullable - step-by-step guides)
confidence_score (DECIMAL 5,2, nullable - 0-100)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)

INDEXES:
  - idx_user: for user's analyses
  - idx_status: for filtering by status
  - idx_created: for sorting by date
  - FOREIGN KEY: user_id → users.id (CASCADE delete)
  - FOREIGN KEY: upload_id → uploads.id (SET NULL on delete)
```

**Records**: Grows with user activity  
**Typical Size**: ~5-10 KB per analysis  
**Relationship**: One analysis linked to one upload, but one user has many analyses

---

### reports
Generated design reports (PDF, JSON, CSV exports).

```
id (INT, PRIMARY KEY, AUTO_INCREMENT)
user_id (INT, FOREIGN KEY → users.id)
analysis_id (INT, FOREIGN KEY → analyses.id)
title (VARCHAR 255, nullable - report title)
format (ENUM: 'pdf', 'json', 'csv')
file_path (VARCHAR 500, nullable - file location)
created_at (TIMESTAMP)

INDEXES:
  - idx_user: for user's reports
  - FOREIGN KEY: user_id → users.id (CASCADE delete)
  - FOREIGN KEY: analysis_id → analyses.id (CASCADE delete)
```

**Records**: ~1 per analysis  
**Typical Size**: ~200 bytes per report (file stored separately)  
**Relationship**: One report per analysis

---

### saved_items
User's saved/favorited items.

```
id (INT, PRIMARY KEY, AUTO_INCREMENT)
user_id (INT, FOREIGN KEY → users.id)
analysis_id (INT, FOREIGN KEY → analyses.id, nullable)
item_type (ENUM: 'analysis', 'report', 'resource', 'guide')
notes (TEXT, nullable - user notes)
created_at (TIMESTAMP)

INDEXES:
  - idx_user: for user's saved items
  - FOREIGN KEY: user_id → users.id (CASCADE delete)
  - FOREIGN KEY: analysis_id → analyses.id (SET NULL on delete)
```

**Records**: Variable, user-determined  
**Typical Size**: ~300 bytes per saved item  
**Relationship**: Many-to-many relationship between users and analyses

---

### notifications
System notifications for users.

```
id (INT, PRIMARY KEY, AUTO_INCREMENT)
user_id (INT, FOREIGN KEY → users.id)
type (VARCHAR 50, e.g., 'analysis_complete', 'report_ready')
title (VARCHAR 255)
message (TEXT, nullable)
is_read (TINYINT, 0=unread, 1=read)
created_at (TIMESTAMP)

INDEXES:
  - idx_user_unread: composite on user_id, is_read (for fetching unread)
  - FOREIGN KEY: user_id → users.id (CASCADE delete)
```

**Records**: Grows with user activity  
**Typical Size**: ~400 bytes per notification  
**Use Case**: Alert users when analyses complete or reports are ready

---

### activity_logs
Audit trail of user actions.

```
id (INT, PRIMARY KEY, AUTO_INCREMENT)
user_id (INT, FOREIGN KEY → users.id, nullable - null for anonymous)
action (VARCHAR 100, e.g., 'view_analysis', 'download_report')
details (JSON, nullable - action-specific data)
ip_address (VARCHAR 45, supports IPv4 and IPv6)
user_agent (VARCHAR 500, browser info)
created_at (TIMESTAMP)

INDEXES:
  - idx_user: for user activity history
  - idx_action: for analytics by action type
  - idx_created: for date-based queries
  - FOREIGN KEY: user_id → users.id (SET NULL on delete)
```

**Records**: High volume (every action logged)  
**Typical Size**: ~300 bytes per log  
**Use Case**: Security auditing, analytics, debugging

---

### settings
Global application settings as key-value pairs.

```
id (INT, PRIMARY KEY, AUTO_INCREMENT)
setting_key (VARCHAR 100, UNIQUE, e.g., 'max_upload_size')
setting_value (JSON, flexible format)
updated_at (TIMESTAMP)

INDEXES:
  - UNIQUE on setting_key
```

**Records**: Small (10-50 typical)  
**Typical Size**: ~200 bytes per setting  
**Use Case**: Store configurable app settings without redeploying

---

### learning_lessons
Educational content for the learning center.

```
id (INT, PRIMARY KEY, AUTO_INCREMENT)
title (VARCHAR 255)
slug (VARCHAR 255, UNIQUE - URL-friendly identifier)
category (VARCHAR 100, e.g., 'Typography', 'Color', 'Layout')
content (TEXT, lesson content/markdown)
order_index (INT, display order)
is_published (TINYINT, 0=draft, 1=published)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)

INDEXES:
  - idx_category: for filtering by category
  - idx_slug: UNIQUE on slug (for URL lookups)
```

**Records**: ~10-100 typical  
**Typical Size**: ~2-5 KB per lesson  
**Seeded With**: 10 design learning lessons

---

## Relationships Diagram

```
┌─────────┐
│  users  │ (1)
└────┬────┘
     │
     │ (many)
     ├──→ uploads (1:many)
     ├──→ analyses (1:many)
     ├──→ reports (1:many)
     ├──→ saved_items (1:many)
     ├──→ notifications (1:many)
     └──→ activity_logs (1:many)

┌─────────┐         ┌──────────┐
│ uploads │ (1)─────→│ analyses │ (many)
└─────────┘         └────┬─────┘
                         │ (1)
                         └──→ reports (1:1 typical)
                         └──→ saved_items (1:many)
```

---

## Data Types Used

| Type | Used For | Max Size |
|------|----------|----------|
| INT | IDs, counts | 2.1 billion |
| VARCHAR 255 | Names, emails, URLs | 255 characters |
| VARCHAR 500 | Long URLs, paths | 500 characters |
| TEXT | Long content | 64 KB |
| JSON | Complex data | 64 MB |
| DECIMAL 5,2 | Scores (0-999.99) | High precision |
| ENUM | Fixed options | Efficient storage |
| TINYINT | Boolean (0/1) | 1 byte |
| TIMESTAMP | Dates | Automatic timezone handling |

---

## Performance Considerations

### Indexes
All important search columns are indexed:
- User lookups: email, role
- Analysis lookups: user_id, status, created_at
- Activity queries: user_id, action, created_at

### Foreign Keys
Enabled for referential integrity:
- CASCADE DELETE: When user deleted, their uploads/analyses deleted
- SET NULL: When upload deleted, analysis upload_id set null

### Query Optimization
- Use prepared statements (parameterized queries)
- Batch operations when possible
- Archive old activity logs monthly (recommended)

---

## Backup Strategy

### Before Production
- Daily automated backups
- Retain 30 days of backups
- Test restore procedures monthly

### Commands
```bash
# Backup
mysqldump -u root design_resource_finder > backup.sql

# Restore
mysql -u root design_resource_finder < backup.sql

# Backup with compression
mysqldump -u root design_resource_finder | gzip > backup.sql.gz
```

---

## Maintenance

### Regular Tasks
- **Weekly**: Check database size with `npm run db:check`
- **Monthly**: Run `OPTIMIZE TABLE` on large tables
- **Quarterly**: Analyze indexes with `ANALYZE TABLE`

### SQL Commands
```sql
-- Optimize all tables
OPTIMIZE TABLE analyses, uploads, activity_logs;

-- Analyze indexes
ANALYZE TABLE users, analyses;

-- Check table health
CHECK TABLE uploads;

-- View database size
SELECT 
  table_name,
  ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
FROM information_schema.tables 
WHERE table_schema = 'design_resource_finder';
```

---

## Migration Path

When upgrading the app:
1. Add new columns with `ALTER TABLE`
2. Create new tables if needed
3. Run migrations safely in development first
4. Test thoroughly before production deploy

Example migration:
```sql
ALTER TABLE analyses 
ADD COLUMN new_field VARCHAR(255) DEFAULT NULL 
AFTER existing_field;
```
