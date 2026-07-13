# Image Upload Not Working - Troubleshooting Guide

## 🔍 Root Cause Identified

**The main issue is: MySQL database is not running or accessible**

When you try to upload an image, the app tries to save it to the database, but the connection fails. This causes the upload to fail silently.

---

## ✅ Solution - Start MySQL Server

### Step 1: Check if MySQL is Running

**Windows:**
```powershell
# Check Services
Get-Service "MySQL80" | Select-Object Status

# Or search for MySQL in Services app
# Open Services > Look for "MySQL80" or "MySQL57"
```

**macOS:**
```bash
# Check if MySQL is running
brew services list | grep mysql

# Or check process
ps aux | grep mysql
```

**Linux:**
```bash
# Check if MySQL is running
sudo systemctl status mysql

# Or check process
ps aux | grep mysql
```

### Step 2: Start MySQL Service

**Windows:**
```powershell
# Start MySQL Service
Start-Service MySQL80

# Or via Services app:
# 1. Press Win+R
# 2. Type "services.msc"
# 3. Find "MySQL80"
# 4. Right-click > Start
```

**macOS:**
```bash
# Start MySQL with Homebrew
brew services start mysql

# Or start manually
mysql.server start
```

**Linux:**
```bash
# Start MySQL service
sudo systemctl start mysql

# Or on older systems
sudo service mysql start
```

### Step 3: Verify MySQL is Running

```bash
# Test connection
mysql -u root

# You should see "mysql>" prompt
# Type: EXIT
```

---

## 🔧 Check .env Database Credentials

Make sure your `.env` file has the correct MySQL credentials:

```dotenv
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=design_resource_finder
```

**If MySQL has a password:**
```dotenv
DB_PASSWORD=your_mysql_password
```

---

## 🗄️ Initialize Database (If Not Done)

After MySQL is running, initialize the database:

```bash
npm run db:init
```

This creates all necessary tables for storing uploads.

---

## 📋 Full Upload Workflow

Here's what happens when you upload:

```
1. Select image file → file input validated
2. Click "Analyze Design" → form submitted to /upload
3. Server receives file → multer middleware processes
4. File saved to disk → public/uploads/ directory
5. Database INSERT → uploads table record created
6. Analysis INSERT → analyses table created with status "processing"
7. Response sent → redirects to /analysis/:id page
8. AI Processing → background task analyzes image
```

**Any failure in steps 4-6 causes upload to fail.**

---

## 🐛 Common Error Scenarios

### Error: "Upload Failed" with No Message
**Cause:** Database connection error  
**Solution:** Check MySQL is running, test with `npm run db:check`

### Error: "Access Denied" 
**Cause:** Wrong MySQL password  
**Solution:** Update DB_PASSWORD in .env to match your MySQL password

### Error: "Unknown Database"
**Cause:** Database not initialized  
**Solution:** Run `npm run db:init` to create tables

### Error: "File Too Large"
**Cause:** File exceeds 10MB limit  
**Solution:** Compress image or upload smaller file

### Error: "Unsupported File Type"
**Cause:** File format not allowed  
**Solution:** Use PNG, JPG, WEBP, SVG, or PDF

---

## 🔐 Step-by-Step Diagnostic Checklist

Run through this checklist to find the issue:

### ✓ Is MySQL Running?
```bash
npm run db:check
```
**Expected:** "✓ Connected successfully"  
**If fails:** Start MySQL service

### ✓ Is Database Initialized?
```bash
npm run db:check
```
**Expected:** All 9 tables listed  
**If fails:** Run `npm run db:init`

### ✓ Are Tables Created?
```bash
mysql -u root design_resource_finder
SHOW TABLES;
EXIT;
```
**Expected:** 9 tables shown (users, uploads, analyses, etc.)  
**If fails:** Run `npm run db:init`

### ✓ Does Uploads Directory Exist?
```bash
# Windows
Test-Path public/uploads

# Mac/Linux
ls -la public/uploads/
```
**Expected:** Directory exists with .gitkeep file  
**If fails:** Directory will be created on first upload

### ✓ Is Node Server Running?
```bash
npm run dev
```
**Expected:** Server starts on http://localhost:3000  
**If fails:** Check for error messages in console

### ✓ Can You Access Dashboard?
Visit: http://localhost:3000/dashboard  
**Expected:** Dashboard loads  
**If fails:** Check Node server is running

### ✓ Can You Access Upload Page?
Visit: http://localhost:3000/upload  
**Expected:** Upload page loads  
**If fails:** Check authentication is working

---

## 🚀 Full Setup from Scratch

If nothing works, start completely fresh:

### 1. Stop Everything
```bash
# Stop Node server (Ctrl+C in terminal)
# Stop MySQL service
```

### 2. Restart MySQL
**Windows:**
```powershell
Start-Service MySQL80
Start-Sleep -Seconds 3
```

**macOS:**
```bash
brew services start mysql
sleep 3
```

**Linux:**
```bash
sudo systemctl start mysql
sleep 3
```

### 3. Check Database
```bash
npm run db:check
```
Should show all tables connected.

### 4. Initialize if Needed
```bash
npm run db:init
npm run db:seed
```

### 5. Start Node Server
```bash
npm run dev
```

### 6. Test Upload
1. Visit http://localhost:3000/upload
2. Select an image file
3. Click "Analyze Design"
4. Should redirect to analysis page

---

## 📝 Detailed Upload Error Messages

### Server Console

Watch the server console for error messages:

```
Upload error: Access denied for user 'root'@'localhost'
→ MySQL not running or wrong credentials

Upload error: Unknown database
→ Database not initialized (run npm run db:init)

Upload error: Table 'uploads' doesn't exist
→ Tables not created (run npm run db:init)

Upload error: ENOENT: no such file or directory
→ Uploads directory missing (will be created on next upload)
```

### Browser Console (F12)

Check browser console for client-side errors:
- Failed to fetch
- Network error
- 500 server error
- 401 unauthorized

---

## 🔄 Recovery Steps

If upload was working but stopped:

### 1. Check Server Status
```bash
# Terminal shows any errors?
# Look for red error messages
```

### 2. Verify Database Connection
```bash
npm run db:check
```

### 3. Check MySQL Service
```bash
# Windows: Services app or PowerShell
# Mac: brew services list
# Linux: sudo systemctl status mysql
```

### 4. Restart Everything
```bash
# 1. Stop Node (Ctrl+C)
# 2. Restart MySQL
# 3. npm run dev
# 4. Try upload again
```

---

## 📊 Testing Upload Without Database

If you just want to test file upload (without database):

1. Comment out database code in `uploadController.js`
2. File will upload to `public/uploads/`
3. Check console for any errors
4. Then fix database connection

---

## 🎯 Success Indicators

✅ Upload working correctly if you see:
- File appears in `/public/uploads/` directory
- Database record created in `uploads` table
- Analysis record created in `analyses` table
- Redirect to `/analysis/:id` page
- Processing page shows analysis steps

---

## 📞 Asking for Help

If you need help, provide:
1. Output of `npm run db:check`
2. Error message from upload attempt
3. Server console output
4. Browser console errors (F12)
5. MySQL service status
6. Your `.env` file (without passwords)

---

## 🔗 Related Documentation

- DATABASE_SETUP.md - Database configuration
- QUICKSTART.md - Getting started guide
- DATABASE_SCHEMA.md - Database structure

---

## Summary

**Most common cause:** MySQL not running  
**Quick fix:** Start MySQL service  
**Verify:** Run `npm run db:check`  
**Test upload:** Try uploading image again  

If still not working, go through the diagnostic checklist step by step.
