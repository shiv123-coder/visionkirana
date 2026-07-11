# VisionKirana Local Development Guide

This guide contains the commands to run all three microservices locally for development.

Make sure you have copied the contents of `.env.example` into a `.env` file within the `frontend/`, `backend/`, and `ml-service/` directories respectively before running these commands.

## Running the Backend

The Backend API handles authentication, users, shops, routing files to Cloudinary, and delegating analysis to the ML service.

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## Running the ML Service

The ML Service handles the heavy computer vision, OCR, and voice intelligence tasks.

```bash
cd ml-service
python -m venv venv

# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

## Running the Frontend

The Frontend is a React application built with Vite and TypeScript.

```bash
cd frontend
npm install
npm run dev
```

## Docker Compose (Legacy/Alternative)

If you prefer not to start each service individually, you can use the legacy Docker Compose file in the root directory. This will boot the entire stack at once using Docker.

```bash
# From the root directory
docker-compose up --build
```
*Note: Ensure your root `.env` file is properly populated if using Docker Compose.*
