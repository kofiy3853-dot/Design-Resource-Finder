# Image Upload - Quick Fix (5 Minutes)

## 🎯 The Problem

**Your MySQL database is not running.** Without it, uploads fail because the app can't save file information to the database.

---

## ⚡ Quick Fix Steps

### Step 1: Start MySQL (Choose Your OS)

**Windows:**
1. Press `Windows Key + R`
2. Type `services.msc`
3. Find "MySQL80" (or "MySQL57", "MySQL56")
4. Right-click it → Click "Start"
5. Wait a few seconds

**Or in PowerShell (run as Administrator):**
```powershell
Start-Service MySQL80
```

**macOS:**
```bash
brew services start mysql
```

**Linux:**
```bash
sudo systemctl start mysql
```

### Step 2: Verify MySQL is Running

```bash
npm run db:check
```

**Should show:**
```
✓ Connected successfully
✓ users (X records)
✓ uploads (X records)
...
✓ Database is healthy and ready to use!
```

**If still fails:** Database tables missing, run:
```bash
npm run db:init
```

### Step 3: Restart Node Server

Stop your current server (Ctrl+C) and restart:
```bash
npm run dev
```

### Step 4: Test Upload

1. Go to: http://localhost:3000/upload
2. Select an image file
3. Click "Analyze Design"
4. Should work now! 🎉

---

## ✓ Done!

If this worked, you're all set. If not, see detailed guide: **UPLOAD_TROUBLESHOOTING.md**

---

## 🆘 Still Not Working?

Try this in order:

1. **Confirm MySQL is really running:**
   ```bash
   mysql -u root
   # Should show mysql> prompt
   # Type: EXIT
   ```

2. **Check .env file has right database settings:**
   ```dotenv
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=design_resource_finder
   ```

3. **Initialize database:**
   ```bash
   npm run db:init
   npm run db:seed
   ```

4. **Check server logs** for error messages (look for red text)

5. **Restart everything:**
   - Stop Node (Ctrl+C)
   - Stop MySQL (Services or `brew services stop mysql`)
   - Start MySQL (from Step 1)
   - Run `npm run dev`
   - Try upload again

---

## 📞 Common Issues

| Issue | Solution |
|-------|----------|
| "Access Denied" error | MySQL password is set but .env is empty. Update `DB_PASSWORD` in .env |
| "Unknown database" error | Run `npm run db:init` to create database |
| "Table doesn't exist" error | Run `npm run db:init` to create tables |
| File appears but no redirect | Database connection failed. Check `npm run db:check` |

---

That's it! You should now be able to upload images. 🚀
