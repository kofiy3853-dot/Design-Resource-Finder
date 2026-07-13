# Demo Mode - View Dashboard Without Login

## Quick Access

You can now view the dashboard demo without entering a password!

### Option 1: Direct Demo URL
Visit this URL directly in your browser:
```
http://localhost:3000/dashboard?demo=true
```

### Option 2: Enable Demo Mode Globally
To enable demo mode for all users (useful for presentations), set this environment variable:

**In `.env` file:**
```dotenv
DEMO_MODE=true
```

Then restart the server:
```bash
npm run dev
```

Now visiting `http://localhost:3000/dashboard` will show the demo.

---

## What's Included in Demo Mode

### Dashboard Features Displayed
- ✓ Welcome message for "Demo User"
- ✓ 4 stat cards showing:
  - 24 total analyses
  - 8 saved items
  - 5 generated reports
  - 24 total activity
- ✓ 6 recent analyses with varying statuses:
  - **Completed** (3 analyses with 88-96% confidence)
  - **Processing** (1 analysis with animated pulse)
  - **Pending** (1 analysis)
- ✓ 3 sample notifications
- ✓ Quick action shortcuts
- ✓ Learning tips

### Demo Limitations
- ✗ Cannot upload designs
- ✗ Cannot save items
- ✗ Cannot generate reports
- ✗ Cannot access profile or settings
- ✗ All analysis items are read-only
- ✗ No real database integration

### Demo Indicators
- Blue info banner at top stating "Demo Mode"
- Links to create account or sign up
- Grayed out analysis cards (not clickable)
- "Sign Up" button in hero section

---

## Use Cases

### Presentations
Enable `DEMO_MODE=true` in .env and present the dashboard to show features without needing:
- Database setup
- User registration
- Sample data

### Screenshots
Append `?demo=true` to dashboard URL to capture demo screenshots:
```
http://localhost:3000/dashboard?demo=true
```

### Testing UI
Quickly iterate on dashboard design without:
- Creating user accounts
- Uploading sample files
- Waiting for analysis to process

---

## Demo Data

### Sample Analyses
1. **Modern Minimalist Website** - 2 days ago, 95% confidence, completed
2. **Brand Identity Pack** - 1 day ago, 88% confidence, completed
3. **Mobile App Mockup** - 6 hours ago, processing
4. **Product Launch Campaign** - 3 days ago, 92% confidence, completed
5. **UI Kit Components** - 5 days ago, 96% confidence, completed
6. **Poster Design Series** - 12 hours ago, pending

### Sample Notifications
- Analysis Complete: "Your Modern Minimalist Website analysis is ready"
- Report Generated: "PDF report for Brand Identity Pack has been created"
- Pro Tip: "Batch processing can save you time on multiple designs"

### Sample Stats
- Total Analyses: 24
- Saved Items: 8
- Generated Reports: 5

---

## Switching Between Demo and Real Mode

### To Show Demo:
```bash
# Option 1: Add query parameter
http://localhost:3000/dashboard?demo=true

# Option 2: Set environment variable
DEMO_MODE=true
npm run dev
```

### To Show Real Dashboard:
```bash
# Remove demo mode from .env
# Remove ?demo=true from URL
# Log in with real account

http://localhost:3000/auth/login
# Sign in with credentials
http://localhost:3000/dashboard
```

---

## Customizing Demo Data

To modify demo data, edit `/controllers/pageController.js` in the `dashboard` function where it checks `if (req.user?.demo)`:

```javascript
// Example: Change sample analyses
analyses: [
  {
    id: 1,
    title: 'Your Custom Title',
    status: 'completed',
    created_at: new Date(),
    confidence_score: 95
  },
  // Add more samples...
]
```

---

## Notes

- Demo mode doesn't require MySQL to be running
- Demo data is re-generated on each page load
- Demo user can still access public pages (home, learning center, features)
- Demo user cannot create real accounts or upload files
- Perfect for showcasing the UI/UX without backend complexity

---

## Disable Demo Mode

To completely disable demo access:

1. Remove `?demo=true` from URLs
2. Remove `DEMO_MODE=true` from `.env`
3. Change route to require real authentication (restore original `authenticate` middleware)

---

## Links for Demo

**Share these links to preview the dashboard:**
- Dashboard: `http://localhost:3000/dashboard?demo=true`
- Features: `http://localhost:3000/features`
- Learning: `http://localhost:3000/learning`
- Home: `http://localhost:3000/`

**For real usage:**
- Sign Up: `http://localhost:3000/auth/register`
- Log In: `http://localhost:3000/auth/login`
