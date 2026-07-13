# Deployment Guide - Render

## Prerequisites
- GitHub repository with your code
- Render account (free tier works)

## Step 1: Push to GitHub

```bash
cd stitch_design_resource_finder
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

## Step 2: Create Render Account

1. Go to https://render.com
2. Sign up with GitHub
3. Click **New +** → **Blueprint**
4. Connect your GitHub repo
5. Select the `stitch_design_resource_finder` folder as root

## Step 3: Configure Environment Variables

After the blueprint deploys, go to your web service → **Environment** tab and set:

### Required
| Key | Value |
|-----|-------|
| `OPENROUTER_API_KEY` | Your OpenRouter API key |
| `SITE_URL` | Your Render URL (e.g., `https://design-resource-finder.onrender.com`) |

### Optional (for email features)
| Key | Value |
|-----|-------|
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | Your email |
| `SMTP_PASS` | Your app password |

## Step 4: Initialize Database

After first deploy, go to **Shell** tab and run:

```bash
npm run db:init
npm run db:seed
```

## Step 5: Set Up Database Connection

If the automatic database connection didn't work:

1. Go to your PostgreSQL database in Render
2. Copy the **Internal Database URL**
3. Update environment variables:
   - `DB_HOST` = your-db-host.render.com
   - `DB_PORT` = 5432
   - `DB_USER` = your-db-user
   - `DB_PASSWORD` = your-db-password
   - `DB_NAME` = design_resource_finder

## Step 6: Update Site URL

1. Go to **Environment** tab
2. Set `SITE_URL` to your actual Render URL

## Step 7: Custom Domain (Optional)

1. Go to **Settings** → **Custom Domains**
2. Add your domain
3. Update DNS records as shown
4. Update `SITE_URL` in environment variables

## Troubleshooting

### Database Connection Issues
- Check if database is running (Dashboard → your DB)
- Verify environment variables match the database details

### Build Failures
- Check build logs in Render dashboard
- Ensure `npm run build:tailwind` works locally first

### File Upload Issues
- Render's free tier has ephemeral storage (files delete on restart)
- For persistent storage, use Cloudinary (set `CLOUDINARY_*` env vars)

### AI Analysis Not Working
- Verify `OPENROUTER_API_KEY` is set correctly
- Check logs for API errors
- Test with a smaller image first

## Free Tier Limitations
- 750 hours/month (enough for hobby projects)
- Spins down after 15 min inactivity (first request takes ~30s)
- 512 MB RAM
- Ephemeral disk (uploads lost on restart)

## Upgrade Options
- **Starter ($7/mo)**: Always on, more RAM
- **Pro ($25/mo)**: Custom domains, more resources
