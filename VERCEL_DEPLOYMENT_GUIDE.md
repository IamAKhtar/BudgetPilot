# Budget Tracker - Vercel Deployment Guide

This guide will walk you through deploying your Budget Tracker application to Vercel.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup) (free tier works fine)
2. A [GitHub account](https://github.com/signup)
3. Your code pushed to a GitHub repository
4. A PostgreSQL database (we recommend using your existing Neon database or creating a new one)

---

## Step 1: Prepare Your Database

### Option A: Use Your Existing Neon Database

If you're already using a Neon database on Replit, you can use the same database for Vercel:

1. Get your database connection string from Replit:
   - In your Replit project, check the `Secrets` tab
   - Copy the value of `DATABASE_URL`
   - It should look like: `postgresql://username:password@hostname/database?sslmode=require`

### Option B: Create a New Neon Database

1. Go to [neon.tech](https://neon.tech) and sign up/login
2. Click **"Create Project"**
3. Choose a project name (e.g., "budget-tracker")
4. Select a region close to your users
5. Click **"Create Project"**
6. Copy the connection string (starts with `postgresql://`)

### Option C: Use Vercel Postgres

1. After creating your Vercel project (Step 3), go to the project dashboard
2. Navigate to **Storage** → **Create Database** → **Postgres**
3. Follow the prompts to create your database
4. Vercel will automatically add the `DATABASE_URL` environment variable

---

## Step 2: Push Your Code to GitHub

If you haven't already:

1. Create a new repository on GitHub
2. Push your code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Budget Tracker"
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git branch -M main
   git push -u origin main
   ```

---

## Step 3: Deploy to Vercel

### Method 1: Using Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and log in
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure the project:
   - **Project Name**: budget-tracker (or your preferred name)
   - **Framework Preset**: Leave as detected or select "Vite"
   - **Root Directory**: `.` (leave as default)
   - **Build Command**: Leave as default (uses `npm run build`)
   - **Output Directory**: Leave as default
   - **Install Command**: Leave as default

5. **Add Environment Variables** (CRITICAL):
   - Click **"Environment Variables"**
   - Add the following:
     - **Name**: `DATABASE_URL`
     - **Value**: Your PostgreSQL connection string (from Step 1)
     - **Environment**: Select all (Production, Preview, Development)
   
6. Click **"Deploy"**

Vercel will now build and deploy your application. This usually takes 1-3 minutes.

### Method 2: Using Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Follow the prompts and add your `DATABASE_URL` when asked for environment variables

---

## Step 4: Set Up Database Schema

After your first deployment, you need to initialize the database:

1. **Run Database Migration** (Choose one method):

   **Method A: Run from Your Local Machine or Replit**
   - Temporarily set the `DATABASE_URL` environment variable to your production database:
     ```bash
     export DATABASE_URL="your-production-database-url"
     ```
   - Run Drizzle push command to create the tables:
     ```bash
     npm run db:push
     ```
   - This will create all the necessary tables based on your Drizzle schema

   **Method B: Use Drizzle Studio**
   - You can also use Drizzle Studio to visualize and manage your schema
   - Run: `npx drizzle-kit studio`
   - Connect to your production database and apply the schema

   **IMPORTANT**: Never manually write SQL migrations. Always use Drizzle's schema management tools (`npm run db:push`) to ensure your database matches your schema definitions exactly.

---

## Step 5: Verify Your Deployment

1. Vercel will provide you with a URL (e.g., `https://budget-tracker.vercel.app`)
2. Open the URL in your browser
3. You should see your Budget Tracker application
4. Try adding a commitment to verify the database connection works

---

## Environment Variables Reference

Make sure these environment variables are set in your Vercel project:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host/db` |

To add/edit environment variables later:
1. Go to your project on Vercel
2. Navigate to **Settings** → **Environment Variables**
3. Add or modify variables
4. **Redeploy** your project for changes to take effect

---

## Troubleshooting

### Issue: "Failed to fetch commitments" or database errors

**Solution**: 
- Verify your `DATABASE_URL` is correctly set in Vercel environment variables
- Check that the database tables exist (see Step 4)
- Neon databases handle SSL automatically - no need to add `?sslmode=require`

### Issue: API routes return 404

**Solution**:
- Check that `vercel.json` exists in your root directory
- Verify the API routes start with `/api`
- Try redeploying the project

### Issue: Build fails

**Solution**:
- Check the build logs in Vercel dashboard
- Ensure all dependencies are in `package.json` (not just devDependencies)
- Make sure TypeScript compilation succeeds

### Issue: App works on Replit but not on Vercel

**Solution**:
- Vercel uses a serverless architecture; the app runs differently than on Replit
- Check browser console for errors (F12 → Console tab)
- Verify all environment variables are set
- Check the Vercel function logs in the dashboard

---

## Continuous Deployment

Once set up, every push to your GitHub repository will automatically:
1. Trigger a new build on Vercel
2. Run tests (if configured)
3. Deploy to production if successful
4. Provide a unique preview URL for each pull request

---

## Custom Domain (Optional)

To use your own domain (e.g., `mybudgettracker.com`):

1. Go to your project on Vercel
2. Navigate to **Settings** → **Domains**
3. Click **"Add"**
4. Enter your domain name
5. Follow Vercel's instructions to update your DNS records
6. Wait for DNS propagation (can take up to 48 hours)

---

## Cost Considerations

**Vercel Free Tier Includes:**
- Unlimited deployments
- Automatic HTTPS
- 100GB bandwidth per month
- Serverless function execution (100GB-hours)
- Perfect for personal projects

**Database Costs:**
- **Neon Free Tier**: 0.5GB storage, enough for personal budgeting
- **Vercel Postgres**: Paid service, starts at $20/month

For this personal budget tracker, the free tier should be more than sufficient!

---

## Support

If you encounter issues:
1. Check the [Vercel Documentation](https://vercel.com/docs)
2. Review the [Vercel Community Forums](https://github.com/vercel/vercel/discussions)
3. Check your Vercel dashboard logs for detailed error messages

---

## Summary

Your Budget Tracker is now deployed with:
- ✅ Automatic HTTPS
- ✅ Global CDN for fast loading
- ✅ Serverless API endpoints
- ✅ Automatic deployments on git push
- ✅ Production-grade PostgreSQL database

Enjoy your deployed Budget Tracker! 🎉
