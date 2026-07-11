# VisionKirana Production Deployment Guide

This guide describes how to deploy the VisionKirana microservice architecture to production on the free tiers of Vercel, Render, Neon, and Cloudinary.

## Architecture

*   **Frontend**: React + Vite + TypeScript (Hosted on Vercel)
*   **Backend API**: FastAPI + SQLAlchemy (Hosted on Render Web Service)
*   **ML API Service**: FastAPI + OpenCV/EasyOCR (Hosted on Render Web Service)
*   **Database**: Neon PostgreSQL Free Tier
*   **Storage**: Cloudinary Free Plan
*   **Authentication**: Google OAuth Login + Backend JWT + RBAC

## Step 1: Services Setup

### 1. Database (Neon)
1. Go to Neon.tech and create a new project.
2. Get the Postgres connection string.
3. Ensure `sslmode=require` is present at the end of the URL.

### 2. Storage (Cloudinary)
1. Go to Cloudinary.com and create a free account.
2. Note your Cloud Name, API Key, and API Secret.

### 3. Authentication (Google Cloud Console)
1. Set up OAuth 2.0 Client IDs.
2. Add your Vercel URL and localhost to the Authorized JavaScript Origins.
3. Add your Vercel URL and localhost to Authorized redirect URIs.

## Step 2: Deploying ML Service (Render)
1. Connect your GitHub repository to Render.
2. Create a new "Web Service".
3. Root Directory: `ml-service`
4. Environment: `Docker` (or `Python 3` if you don't use the Dockerfile). If using Python, start command is `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
5. Note the generated Render URL (e.g., `https://visionkirana-ml-service.onrender.com`).

## Step 3: Deploying Backend (Render)
1. Create a new "Web Service".
2. Root Directory: `backend`
3. Environment: `Python 3`
4. Build Command: `pip install -r requirements.txt`
5. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add the environment variables from `.env.example`. Make sure to set `ML_API_BASE_URL` to the URL from Step 2.
7. Set `FRONTEND_URL` to the URL you will get from Vercel.
8. Set your `ADMIN_EMAIL`.

## Step 4: Deploying Frontend (Vercel)
1. Connect your GitHub repository to Vercel.
2. Framework Preset: `Vite`
3. Root Directory: `frontend`
4. Add Environment Variables:
   - `VITE_API_BASE_URL`: The URL of your Backend Render service (e.g., `https://visionkirana-api.onrender.com/api/v1`)
   - `VITE_ML_API_BASE_URL`: The URL of your ML Service (e.g., `https://visionkirana-ml-service.onrender.com/api/v1`)
   - `VITE_GOOGLE_CLIENT_ID`: Your Google OAuth client ID.
5. Deploy!

## Step 5: Post-Deployment
1. After all services are up, go to `https://<YOUR_FRONTEND_URL>/system-status` to ensure everything is communicating and healthy.
2. Login with your `ADMIN_EMAIL` via Google. You will automatically be assigned the `ADMIN` role.
