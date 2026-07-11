# Deployment Guide & Production Checklist

VisionKirana is containerized and ready for scalable production deployment across AWS, GCP, or managed PaaS providers (e.g., Vercel + Render).

## Production Pre-flight Checklist

Before pushing to a production environment, ensure the following are verified:

### Security
- [ ] Ensure `.env` is NOT committed to version control.
- [ ] Change `SECRET_KEY` in `backend/.env` to a secure, 64-character randomized hex string.
- [ ] Disable FastAPI Swagger UI in production or hide it behind basic auth.
- [ ] Ensure CORS (`BACKEND_CORS_ORIGINS`) is strictly set to the production frontend domain (e.g., `https://app.visionkirana.com`).
- [ ] Ensure the PostgreSQL database is not publicly accessible (bind to VPC/internal network).

### Cloud Storage Integration
- [ ] Replace local Mock Cloud Providers with actual AWS S3, Cloudflare R2, or Supabase credentials.
- [ ] Ensure storage buckets are private and signed URLs are configured properly.

### Performance & Caching
- [ ] Verify Nginx is configured to serve frontend static assets with long-lived Cache-Control headers.
- [ ] Ensure the production database is connection-pooled (e.g., using PgBouncer) due to heavy background AI tasks.

---

## Deployment Strategy: Docker Swarm / Kubernetes

### 1. Build the Images
```bash
docker build -t your-registry/visionkirana-backend:latest ./backend
docker build -t your-registry/visionkirana-frontend:latest ./frontend
```

### 2. Configure Environment Variables
You must provide a production `.env` file to the backend container:
```env
DATABASE_URL=postgresql://user:securepassword@db-host:5432/visionkirana
SECRET_KEY=your_production_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
BACKEND_CORS_ORIGINS=["https://your-production-domain.com"]
STORAGE_PROVIDER=supabase
```

### 3. Run Migrations
Run Alembic migrations against the production database before booting the API:
```bash
docker run --env-file .env your-registry/visionkirana-backend:latest alembic upgrade head
```

### 4. Deploy Services
Use the provided `docker-compose.yml` as a base for your Kubernetes deployments or ECS task definitions. 

## Vercel (Frontend) + Render (Backend) Alternative

If you prefer managed platforms:
1. **Frontend (Vercel)**: Connect the GitHub repository. Set the framework to Vite. Ensure the Root Directory is set to `frontend/`.
2. **Backend (Render)**: Connect the repository. Choose "Docker" environment. Set Root Directory to `backend/`. Provide the `.env` variables in the Render dashboard. Attach a Managed PostgreSQL instance.
