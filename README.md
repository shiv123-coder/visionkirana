<div align="center">

# 🏪 VisionKirana
### *AI-Powered Micro-Lending Intelligence for Unbanked Kirana Stores*

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React%2019%20%2B%20TypeScript-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL%20(Neon)-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Storage-Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white" alt="Cloudinary" />
  <img src="https://img.shields.io/badge/ML-OpenCV%20%7C%20EasyOCR-FF4B4B?style=for-the-badge&logo=python&logoColor=white" alt="ML Stack" />
  <img src="https://img.shields.io/badge/Deployment-Docker%20%7C%20Render-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
</p>

---

<img src="./docs/diagrams/system-architecture.png" alt="VisionKirana System Architecture" width="800" style="border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);" />

</div>

## 📖 Overview

**VisionKirana** is an enterprise-grade fintech platform designed to democratize micro-lending for millions of Kirana (mom-and-pop) store owners across India. Traditional banking models rely heavily on structured credit scores (CIBIL), locking out cash-heavy businesses with thin financial histories. 

VisionKirana bypasses legacy constraints by utilizing **Computer Vision, OCR, and Voice Intelligence** to dynamically assess loan eligibility based on physical inventory health, invoice consistency, and geographic data.

## ⚠️ The Problem

- **Thin Credit Files:** Over 80% of Kirana stores lack formal credit histories, making them invisible to traditional lenders.
- **Manual Verification:** Loan officers physically inspect shops, creating a massive scalability bottleneck.
- **Fraud Risks:** Forged documents and exaggerated sales figures are difficult to catch without extensive auditing.

## 💡 The Solution

VisionKirana digitizes the underwriting process using AI:
1. **Visual Health Proxy:** Machine learning models evaluate shelf density and brand diversity from uploaded photos.
2. **Automated Auditing:** OCR extracts and cross-verifies supplier invoices.
3. **Continuous Monitoring:** Real-time dashboards provide loan officers with an aggregated **0-100 Business Health Score**.

---

<div align="center">
  <img src="./docs/diagrams/ml-pipeline.png" alt="AI/ML Intelligence Pipeline" width="800" style="border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);" />
  <br />
  <em>The automated intelligence pipeline generating dynamic credit scores.</em>
</div>

---

## ✨ Core Features

- 📱 **Offline-First PWA:** Built to handle spotty network connectivity with robust caching and offline queue submission.
- 🧠 **Computer Vision Pipeline:** Instantly proxies inventory health using OpenCV and Scikit-Image.
- 📄 **OCR Validation Engine:** Extracts and intelligently maps supplier invoice data using PyMuPDF and EasyOCR.
- 🎙️ **Voice Intelligence:** NLP-powered business summarization directly from merchant voice recordings.
- 🔐 **Robust Security:** JWT-based stateless authentication with strict Role-Based Access Control.
- ☁️ **Cloud Native:** Direct-to-Cloudinary image uploading to reduce backend memory exhaustion.

## 🧑‍💻 Portals & Roles

VisionKirana implements strict route separation and Role-Based Access Control (RBAC):

- **Admin Portal (`/admin`)**: Full access to all applications, shops, users, audit logs, and settings.
- **Loan Officer Portal (`/officer`)**: Restricted access to review applications and shops, without system-level administration.
- **Shop Owner Dashboard (`/dashboard`)**: The primary interface for merchants to apply for loans and check statuses.


## 🛠 Tech Stack & Architecture

### **Frontend**
- **Framework:** React 19 + TypeScript + Vite
- **Styling:** TailwindCSS
- **State & Routing:** Context API + React Router
- **PWA:** Vite-PWA plugin for offline capabilities

### **Backend & APIs**
- **Framework:** FastAPI (Python 3.12)
- **Database:** PostgreSQL (Neon Free Tier) with SQLAlchemy ORM
- **Authentication:** Google OAuth2.0 + JWT + Bcrypt
- **Architecture:** Controller-Service-Repository pattern with synchronous database sessions

### **AI/ML Service**
- **Processing Engine:** FastAPI dedicated microservice
- **Libraries:** OpenCV, EasyOCR, scikit-image
- **Workflow:** Background task execution for heavy ML workloads to prevent HTTP timeouts

---

## 📂 Folder Structure

```text
📦 VisionKirana
 ┣ 📂 backend          # Core API (FastAPI, Auth, SQLAlchemy Models)
 ┃ ┣ 📂 app
 ┃ ┃ ┣ 📂 api        # Route Controllers
 ┃ ┃ ┣ 📂 core       # JWT Security & Configs
 ┃ ┃ ┣ 📂 models     # PostgreSQL Tables
 ┃ ┃ ┗ 📂 schemas    # Pydantic validation
 ┣ 📂 frontend         # React + Vite PWA Application
 ┃ ┣ 📂 src
 ┃ ┃ ┣ 📂 components # Reusable UI
 ┃ ┃ ┗ 📂 features   # Feature-based architecture
 ┣ 📂 ml-service       # Dedicated Python Microservice for CV/OCR
 ┣ 📂 docs             # Architecture Diagrams & Deployment guides
 ┗ 📜 docker-compose.yml
```

---

## 🚀 Setup & Execution

> [!WARNING]
> **Database Inactivity:** Since this project uses the Neon Free Tier for PostgreSQL, the database automatically pauses after 5 minutes of inactivity. **Before checking or running the app**, please visit the [Neon Console](https://console.neon.tech/) to resume the database if it is paused.

### 1. Prerequisites
- Docker & Docker Compose
- Node.js (v18+)
- Python (v3.12+)

### 2. Environment Variables

Create a `.env` file in the project root:

```env
# Backend Database
POSTGRES_USER=vision_user
POSTGRES_PASSWORD=vision_secret_pass
POSTGRES_DB=visionkirana
DATABASE_URL=postgresql://vision_user:vision_secret_pass@db:5432/visionkirana

# Security
SECRET_KEY=your_secure_jwt_secret_key
ACCESS_TOKEN_EXPIRE_MINUTES=30
GOOGLE_CLIENT_ID=your_google_oauth_client_id
ADMIN_EMAIL=admin@visionkirana.com

# Integrations
CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME
ML_API_BASE_URL=http://ml-service:8001/api/v1
```

### 3. Running Locally (Docker)

The fastest way to spin up the entire ecosystem (DB, Backend, Frontend):

```bash
docker-compose up --build
```
- **Frontend App:** `http://localhost:80`
- **Backend API Docs:** `http://localhost:8000/docs`
- **ML Service Docs:** `http://localhost:8001/docs`

---

## ☁️ Deployment Setup (Live Environments)

- **Frontend App:** [https://vision-kirana.vercel.app](https://vision-kirana.vercel.app) (Deployed via Vercel)
- **Backend API (Swagger Docs):** [https://visionkirana-api.onrender.com/docs](https://visionkirana-api.onrender.com/docs) (Deployed via Render)
- **ML Service (Swagger Docs):** [https://visionkirana-ml-service.onrender.com/docs](https://visionkirana-ml-service.onrender.com/docs) (Deployed via Render)

### Infrastructure Providers
- **Database:** Serverless **Neon PostgreSQL**
- **Media Storage:** **Cloudinary** for highly available image serving

---

## 🔮 Future Scope

1. **Async Database Engine:** Migrate from synchronous SQLAlchemy `Session` to `AsyncSession` to unblock FastAPI's event loop under heavy load.
2. **Message Broker Integration:** Implement RabbitMQ/Redis for the ML Pipeline to replace HTTP-based background tasks, ensuring durability during high-volume document uploads.
3. **Advanced Revocation Strategies:** Introduce Redis-backed JWT blocklists for secure, stateful refresh token rotation.
4. **Automated CI/CD:** Expand GitHub Actions to include comprehensive `pytest` suites and automated database schema migrations via Alembic.

<div align="center">
  <p><em>Built to empower the unbanked.</em></p>
</div>
