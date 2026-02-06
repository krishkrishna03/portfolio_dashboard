# Deployment Guide

## Prerequisites

- Backend deployed on Render.com or similar service
- Frontend to be deployed on Netlify or Vercel

## Backend Deployment (Render.com)

### 1. Create Web Service on Render

1. Go to https://render.com and create a new Web Service
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: `portfolio-dashboard-api` (or any name you prefer)
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### 2. Environment Variables

Add the following environment variables in Render dashboard:

```
PORT=5000
NODE_ENV=production
DEBUG=false
CORS_ORIGIN=https://your-netlify-app.netlify.app,https://financedashboardk.netlify.app
```

**Important**: Replace `your-netlify-app.netlify.app` with your actual Netlify deployment URL.

### 3. Deploy

Click "Deploy" and wait for the deployment to complete. Note the URL provided by Render (e.g., `https://portfolio-dashboard-2pyx.onrender.com`).

## Frontend Deployment (Netlify)

### 1. Create New Site on Netlify

1. Go to https://netlify.com and create a new site
2. Connect your GitHub repository
3. Configure build settings:
   - **Base directory**: Leave empty (root of repo)
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

### 2. Environment Variables

Add the following environment variable in Netlify dashboard:

Go to **Site Settings > Environment Variables** and add:

```
VITE_API_URL=https://portfolio-dashboard-2pyx.onrender.com/api
```

**Important**: Replace the URL with your actual Render backend URL (the one you noted in step 3 of backend deployment).

### 3. Deploy

Click "Deploy site" and wait for the deployment to complete.

## Troubleshooting

### Frontend shows "Loading..." forever

**Issue**: The frontend cannot connect to the backend API.

**Solutions**:
1. Check browser console for errors (F12 > Console tab)
2. Verify `VITE_API_URL` is set correctly in Netlify environment variables
3. Ensure backend is running and accessible at the URL
4. Check CORS configuration on backend includes your Netlify URL

### CORS Errors in Browser Console

**Issue**: Backend is blocking requests from frontend due to CORS policy.

**Solution**:
1. Add your Netlify URL to the `CORS_ORIGIN` environment variable on Render
2. Format: `CORS_ORIGIN=https://your-app.netlify.app,https://other-url.com`
3. Separate multiple URLs with commas (no spaces)
4. Redeploy backend after changing environment variables

### Backend API Returns 401 Errors (Yahoo Finance)

**Issue**: Yahoo Finance API is blocking requests.

**Solution**:
This is normal. The backend automatically falls back to mock data when Yahoo Finance returns 401 errors. The app will still function with realistic sample data.

### Environment Variables Not Working

**Issue**: Changes to environment variables not reflected in deployment.

**Solution**:
1. After adding/changing environment variables, you MUST trigger a new deployment
2. On Netlify: Go to Deploys > Trigger Deploy > Deploy site
3. On Render: Go to your service > Manual Deploy > Deploy latest commit
4. Environment variables are only loaded during build time

## Testing Deployment

### 1. Test Backend

Visit your backend URL directly in browser:
```
https://your-render-url.onrender.com/health
```

You should see:
```json
{
  "status": "ok",
  "timestamp": "2026-02-06T12:00:00.000Z",
  "version": "1.0.0"
}
```

### 2. Test API Endpoints

```
https://your-render-url.onrender.com/api/holdings
https://your-render-url.onrender.com/api/portfolio-summary
https://your-render-url.onrender.com/api/sector-summaries
```

All should return JSON data.

### 3. Test Frontend

1. Open your Netlify site URL
2. Open browser console (F12)
3. Look for messages like "Fetching from: https://..."
4. Verify the URL matches your backend URL
5. Portfolio should load within 2-3 seconds

## Production Checklist

- [ ] Backend deployed on Render with correct environment variables
- [ ] Backend `/health` endpoint returns 200 OK
- [ ] Backend `/api/holdings` returns JSON data
- [ ] Frontend deployed on Netlify
- [ ] `VITE_API_URL` environment variable set in Netlify
- [ ] Frontend loads without errors in browser console
- [ ] Portfolio data displays correctly
- [ ] Backend CORS includes frontend URL
- [ ] Excel file (data.xlsx) exists in server directory

## Common Issues

### Render Free Tier Sleep Mode

Render free tier services go to sleep after 15 minutes of inactivity. The first request after sleep will be slow (30-60 seconds). Consider:

1. Using a paid Render plan
2. Implementing a keep-alive ping from frontend
3. Accepting the initial delay for free hosting

### Netlify Build Fails

If Netlify build fails:

1. Check build logs in Netlify dashboard
2. Verify `package.json` has correct dependencies
3. Run `npm run build` locally to test
4. Ensure Node.js version matches (use `.nvmrc` file)

### Data Not Updating

If portfolio data doesn't update:

1. Check backend logs on Render
2. Verify Excel file exists in server directory
3. Check if API calls are returning cached data
4. Clear cache using `/api/clear-cache` endpoint

## Support

For additional help:
1. Check browser console for detailed error messages
2. Check Render logs for backend errors
3. Verify all environment variables are set correctly
4. Test API endpoints directly in browser
5. Review CORS configuration

---

Last Updated: February 6, 2026
