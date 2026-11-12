# Ferrero Hazelnut Pricing Intelligence Platform

> AI-powered dashboard for Ferrero's global hazelnut pricing, risk management, and supply chain optimization.

---

## Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React 18 + Vite + Tailwind CSS    |
| Backend   | Python 3.11+ / FastAPI / Uvicorn  |
| Data      | Pandas, CSV seed data, ChromaDB   |
| AI Engine | Rule-based + Ollama Cloud (optional) |

---

## Project Structure

```
Ferrero/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entry point
│   │   ├── api/routes/          # REST endpoints
│   │   ├── services/            # Business logic engines
│   │   ├── data/                # Data loader & vector store
│   │   └── config.py            # Settings
│   ├── data/seed/               # CSV & JSON seed data
│   └── requirements.txt         # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── api/client.js        # API client (with offline fallback)
│   │   ├── pages/               # Dashboard, Scenarios, AI Advisor, Weather, Market
│   │   ├── components/          # Reusable UI components
│   │   ├── services/            # Client-side engines (scenario + advisor)
│   │   └── data/liveData.json   # Baked-in data for serverless mode
│   ├── vercel.json              # SPA routing config
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## Local Development

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend runs at `http://localhost:8000`. API docs at `http://localhost:8000/docs`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

---

## AWS Deployment Guide

### Option A: AWS Amplify (Simplest — Frontend + Static Backend Data)

The frontend includes a built-in offline engine that computes scenarios and AI advice client-side. No backend server needed for demos.

1. Push code to GitHub (already done: `https://github.com/samarthomar/ferrero`)
2. Go to **AWS Amplify Console** → "New App" → "Host Web App"
3. Connect the GitHub repo (`samarthomar/ferrero`)
4. Set build settings:
   - **App root:** `frontend`
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
5. Add a **Rewrite rule** for SPA routing:
   - Source: `</^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json)$)([^.]+$)/>`
   - Target: `/index.html`
   - Type: `200 (Rewrite)`
6. Deploy

### Option B: Full Stack on AWS (Backend + Frontend)

#### Backend → AWS ECS (Fargate) or EC2

1. **Create a Dockerfile** in `backend/`:

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

2. **Build & push to ECR:**
```bash
docker build -t ferrero-backend ./backend
aws ecr create-repository --repository-name ferrero-backend
docker tag ferrero-backend:latest <account-id>.dkr.ecr.<region>.amazonaws.com/ferrero-backend
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/ferrero-backend
```

3. **Deploy on ECS Fargate** with an Application Load Balancer on port 8000.

#### Frontend → S3 + CloudFront

1. **Build the frontend:**
```bash
cd frontend
npm run build
```

2. **Update API base URL** in `frontend/src/api/client.js`:
```js
baseURL: 'https://your-alb-domain.amazonaws.com/api'
```

3. **Upload `dist/` to S3:**
```bash
aws s3 sync dist/ s3://ferrero-frontend-bucket --delete
```

4. **Create CloudFront distribution** pointing to the S3 bucket.
5. **Add error page rule:** 403/404 → `/index.html` (status 200) for SPA routing.

#### Backend → AWS Lambda + API Gateway (Serverless)

Alternatively, use **Mangum** to wrap FastAPI for Lambda:

1. Add `mangum` to `requirements.txt`
2. Create `handler.py`:
```python
from mangum import Mangum
from app.main import app
handler = Mangum(app)
```
3. Deploy via SAM or Serverless Framework.

---

## Environment Variables (Optional)

| Variable          | Description                    | Default    |
|-------------------|--------------------------------|------------|
| `OLLAMA_API_KEY`  | Ollama Cloud API key for LLM   | None (uses rule engine) |
| `OLLAMA_MODEL`    | Model name                     | `gemma2:27b` |
| `OLLAMA_CLOUD_URL`| Ollama API endpoint            | `https://api.ollama.com/v1` |

---

## Key Features

- **Unified Dashboard** — Real-time KPIs, price trends, risk radar, supplier overview
- **Scenario Simulator** — What-if analysis with 7 adjustable parameters + AI presets
- **AI Advisor** — Query-driven recommendations with confidence scoring
- **Weather Intelligence** — Crop health monitoring, frost risk, harvest calendar
- **Market Intelligence** — Price trends, signals, alerts, regional analysis

---

## GitHub Repository

`https://github.com/samarthomar/ferrero`
