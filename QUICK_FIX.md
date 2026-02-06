# Quick Fix for Loading Page Issue

## Problem
After deployment, the frontend shows only a loading page and never displays data.

## Root Cause
The frontend cannot connect to the backend API due to missing or incorrect environment configuration.

## Solution

### Step 1: Set Environment Variable on Netlify

1. Go to your Netlify dashboard
2. Select your site
3. Go to **Site settings** > **Environment variables**
4. Add a new variable:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://portfolio-dashboard-2pyx.onrender.com/api`

   (Replace with your actual Render backend URL)

5. Save the variable

### Step 2: Update CORS on Backend (Render)

1. Go to your Render dashboard
2. Select your backend service
3. Go to **Environment** tab
4. Update the `CORS_ORIGIN` variable to include your Netlify URL:
   ```
   CORS_ORIGIN=https://your-netlify-app.netlify.app,http://localhost:5173
   ```

   (Replace `your-netlify-app.netlify.app` with your actual Netlify URL)

5. Save and redeploy

### Step 3: Trigger New Deployment on Netlify

1. Go to **Deploys** tab
2. Click **Trigger deploy** > **Deploy site**
3. Wait for deployment to complete (2-3 minutes)
4. Open your site URL

## How to Find Your URLs

### Backend URL (Render)
- Go to Render dashboard
- Open your backend service
- Look for the URL at the top (e.g., `https://portfolio-dashboard-2pyx.onrender.com`)
- Add `/api` at the end for the API URL

### Frontend URL (Netlify)
- Go to Netlify dashboard
- Open your site
- The URL is shown at the top (e.g., `https://your-app-name.netlify.app`)

## Verification

After redeploying, verify:

1. **Backend is running**:
   - Visit: `https://your-backend-url.onrender.com/health`
   - Should see: `{"status":"ok","timestamp":"...","version":"1.0.0"}`

2. **API returns data**:
   - Visit: `https://your-backend-url.onrender.com/api/holdings`
   - Should see: JSON array with stock holdings

3. **Frontend connects**:
   - Open your Netlify site
   - Open browser console (press F12)
   - Look for: `Fetching from: https://...`
   - Should see data loading within 3-5 seconds

## Still Not Working?

### Check Browser Console

1. Open your deployed site
2. Press F12 to open Developer Tools
3. Go to Console tab
4. Look for errors (red text)
5. Share the error messages for further help

### Common Errors and Solutions

**Error**: `Failed to fetch`
- **Cause**: Backend URL is wrong or backend is down
- **Fix**: Verify `VITE_API_URL` is correct and backend is running

**Error**: `CORS policy blocked`
- **Cause**: Backend CORS doesn't allow your frontend URL
- **Fix**: Add your Netlify URL to `CORS_ORIGIN` on backend

**Error**: `API request failed: 500`
- **Cause**: Backend server error
- **Fix**: Check Render logs for backend errors

**Error**: Nothing (infinite loading)
- **Cause**: Missing environment variable
- **Fix**: Add `VITE_API_URL` to Netlify and redeploy

## Quick Test Locally

To test if the issue is deployment-specific:

```bash
# Terminal 1: Start backend
cd server
npm run dev

# Terminal 2: Start frontend
npm run dev
```

If it works locally but not on deployment, the issue is definitely environment configuration.

---

Need more help? Check the detailed DEPLOYMENT_GUIDE.md
