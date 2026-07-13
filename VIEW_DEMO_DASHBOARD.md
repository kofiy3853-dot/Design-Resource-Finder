# 🚀 View Dashboard Demo - No Login Required!

## Get Started in 10 Seconds

### Step 1: Start the Server
```bash
npm run dev
```

### Step 2: Visit Demo Dashboard
Open this URL in your browser:
```
http://localhost:3000/dashboard?demo=true
```

**That's it!** You'll see a fully functional demo dashboard with sample data.

---

## What You'll See

### Dashboard Features
✅ Welcome section with personalized greeting  
✅ 4 stat cards showing analytics (24 analyses, 8 saved, 5 reports)  
✅ 6 recent design analyses with different statuses  
✅ 3 notifications from the system  
✅ Quick action shortcuts  
✅ Pro tips for power users  
✅ Modern design with smooth animations  

### Sample Data Included
- **Modern Minimalist Website** - completed (95% confidence)
- **Brand Identity Pack** - completed (88% confidence)
- **Mobile App Mockup** - processing
- **Product Launch Campaign** - completed (92% confidence)
- **UI Kit Components** - completed (96% confidence)
- **Poster Design Series** - pending

---

## Two Ways to Enable Demo Mode

### Option A: URL Query Parameter (Recommended for Quick Testing)
```
http://localhost:3000/dashboard?demo=true
```
✓ Works immediately  
✓ No configuration needed  
✓ Keep everything else normal  

### Option B: Environment Variable (For Presentations)
Edit `.env` and add:
```dotenv
DEMO_MODE=true
```

Restart server:
```bash
npm run dev
```

Then just visit:
```
http://localhost:3000/dashboard
```

---

## Demo Mode Banner

You'll see a blue info banner at the top:
> "Demo Mode - You're viewing a demo dashboard with sample data. Create an account to start analyzing your own designs."

This clearly indicates you're viewing a demo, not real data.

---

## What You CAN'T Do in Demo Mode

The demo intentionally disables:
- ✗ Uploading designs
- ✗ Saving items  
- ✗ Generating reports
- ✗ Viewing analysis details
- ✗ Accessing profile/settings

This keeps the demo focused on UI/UX showcase without backend requirements.

---

## Links You Can Use

When in demo mode, these links work:
- ✓ Learning Center - `/learning`
- ✓ Features page - `/features`
- ✓ Sign Up - `/auth/register`
- ✓ Log In - `/auth/login`

Navigation items that require a real account redirect to sign up.

---

## Use Cases

### For Developers
- **Showcase UI/UX** without database setup
- **Test dashboard design** before creating real accounts
- **Iterate on styling** without data dependencies
- **Share preview links** with team

### For Presentations
```bash
DEMO_MODE=true npm run dev
# Now anyone can visit /dashboard without login
```

### For Screenshots
```
http://localhost:3000/dashboard?demo=true
```
Perfect for documentation, marketing, or GitHub README.

---

## Customize Demo Data

Edit `/controllers/pageController.js` around line 35:

```javascript
if (req.user?.demo) {
  return res.render('dashboard', {
    // Modify these arrays:
    analyses: [ ... ],        // Sample designs
    notifications: [ ... ],   // Sample alerts
    stats: { ... }            // Sample stats
  });
}
```

---

## Switch Back to Real Mode

Just remove the query parameter or disable DEMO_MODE:

```bash
# Remove from .env
DEMO_MODE=false
```

Then create a real account:
1. Visit `http://localhost:3000/auth/register`
2. Sign up with email/password
3. Upload a design
4. See your real analytics on dashboard

---

## Technical Details

### How It Works
1. New middleware `authenticateOrDemo` checks for demo mode
2. If `?demo=true` or `DEMO_MODE=true`, creates fake user object
3. Controller detects `req.user.demo` flag
4. Returns mock data instead of querying database
5. Dashboard renders identically with sample data

### No Database Required
Demo mode works without:
- MySQL running
- Database initialized
- User accounts created
- Files uploaded

Perfect for offline work or presentations!

---

## Files Modified

- `middleware/auth.js` - Added `authenticateOrDemo` function
- `routes/pages.js` - Dashboard uses `authenticateOrDemo` instead of `authenticate`
- `controllers/pageController.js` - Added demo data generation
- `views/dashboard.ejs` - Added demo indicators and disabled features

---

## Questions?

See detailed docs:
- `DEMO_MODE.md` - Full demo mode documentation
- `QUICKSTART.md` - Quick setup guide
- `DATABASE_SETUP.md` - Database configuration

---

## Summary

| Feature | Status |
|---------|--------|
| View dashboard | ✅ No login needed |
| See sample data | ✅ 6 analyses, 3 notifications |
| Analytics stats | ✅ All displayed |
| Upload designs | ❌ Demo only |
| Save items | ❌ Demo only |
| Access analysis | ❌ Read-only demo cards |

**Ready?** Open your browser and go to:
```
http://localhost:3000/dashboard?demo=true
```

Enjoy! 🎨
