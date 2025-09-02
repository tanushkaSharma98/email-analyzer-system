# Deployment Guide

## Prerequisites
- GitHub account with your code pushed
- MongoDB Atlas account (free tier available)
- Render account (free tier available)
- Vercel account (free tier available)

## Step 1: MongoDB Atlas Setup

### 1.1 Create MongoDB Atlas Cluster
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up/Login and create a new project
3. Click "Build a Database" → "Free" tier
4. Choose cloud provider (AWS/Google Cloud/Azure) and region
5. Click "Create Cluster"

### 1.2 Configure Database Access
1. Go to "Database Access" in left sidebar
2. Click "Add New Database User"
3. Username: `email-analyzer-user`
4. Password: Generate a secure password
5. Role: "Read and write to any database"
6. Click "Add User"

### 1.3 Configure Network Access
1. Go to "Network Access" in left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for Render)
4. Click "Confirm"

### 1.4 Get Connection String
1. Go to "Database" → "Connect"
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your user password
5. Replace `<dbname>` with `email-analyzer`

**Example:**
```
mongodb+srv://email-analyzer-user:yourpassword@cluster0.xxxxx.mongodb.net/email-analyzer?retryWrites=true&w=majority
```

## Step 2: Render Backend Deployment

### 2.1 Create Render Account
1. Go to [Render](https://render.com)
2. Sign up with GitHub
3. Connect your repository

### 2.2 Create Web Service
1. Click "New" → "Web Service"
2. Connect your GitHub repo
3. Configure:
   - **Name**: `email-analyzer-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`
   - **Plan**: `Free`

### 2.3 Set Environment Variables
Add these in Render dashboard:
```
MONGODB_URI=mongodb+srv://email-analyzer-user:yourpassword@cluster0.xxxxx.mongodb.net/email-analyzer?retryWrites=true&w=majority
IMAP_ENABLED=true
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_USER=your-gmail@gmail.com
IMAP_PASS=your-app-password
TEST_SUBJECT=Test Email Analysis
IMAP_POLL_MS=300000
PORT=10000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.vercel.app
```

### 2.4 Deploy
1. Click "Create Web Service"
2. Wait for build and deployment
3. Note your backend URL (e.g., `https://email-analyzer-backend.onrender.com`)

## Step 3: Vercel Frontend Deployment

### 3.1 Create Vercel Account
1. Go to [Vercel](https://vercel.com)
2. Sign up with GitHub
3. Import your repository

### 3.2 Configure Build Settings
1. **Framework Preset**: `Create React App`
2. **Build Command**: `npm run build`
3. **Output Directory**: `build`
4. **Install Command**: `npm install`

### 3.3 Set Environment Variables
Add in Vercel dashboard:
```
REACT_APP_API_URL=https://your-backend-url.onrender.com
```

### 3.4 Deploy
1. Click "Deploy"
2. Wait for build and deployment
3. Note your frontend URL (e.g., `https://email-analyzer.vercel.app`)

## Step 4: Update Backend Frontend URL

### 4.1 Update Render Environment
1. Go back to Render dashboard
2. Update `FRONTEND_URL` with your Vercel URL
3. Redeploy the service

## Step 5: Test Deployment

### 5.1 Verify Backend
1. Visit: `https://your-backend-url.onrender.com/health`
2. Should return status: "ok"

### 5.2 Verify Frontend
1. Visit your Vercel URL
2. Check if it loads without errors
3. Test the "Rescan Now" button

### 5.3 Test Email Processing
1. Send test email to your configured IMAP address
2. Subject: "Test Email Analysis"
3. Check if it appears on the live frontend

## Troubleshooting

### Backend Issues
- Check Render logs for errors
- Verify environment variables are set correctly
- Ensure MongoDB connection string is valid

### Frontend Issues
- Check Vercel build logs
- Verify `REACT_APP_API_URL` is correct
- Check browser console for API errors

### IMAP Issues
- Verify Gmail App Password is correct
- Check if IMAP is enabled in Gmail
- Ensure `TEST_SUBJECT` matches exactly

## Cost Estimation (Free Tier)
- **MongoDB Atlas**: 512MB storage, free forever
- **Render**: 750 hours/month, free
- **Vercel**: 100GB bandwidth/month, free

## Next Steps
- Set up custom domain (optional)
- Configure monitoring and alerts
- Set up CI/CD pipeline
- Add SSL certificates (automatic with Vercel/Render)
