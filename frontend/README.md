# Frontend: Smart Cardiovascular Risk Analysis System

## Stack
- Vite + React 19 + TypeScript
- React Router
- Tailwind CSS
- shadcn/ui (Radix primitives)
- TanStack Query
- React Hook Form + Zod
- Recharts + Framer Motion

## Setup
```bash
cd frontend
npm install
```

## Configure API URL
Create `.env.local` in `frontend/`:
```bash
VITE_API_BASE_URL=http://localhost:8000/api
```

## Run (Development)
```bash
cd frontend
npm run dev
```

## Build + Preview (Production-like)
```bash
npm run build
npm run start
```

## Routes
- `/` Landing
- `/dashboard` Main prediction workflow
- `/models` Model benchmark analytics
- `/what-if` Scenario simulation
- `/history` Prediction history and trend
- `/about` Architecture and system notes

## Features
- Real API calls to FastAPI backend
- Real-time health and data refresh indicators
- Validated forms and error handling
- Interactive charts for model and risk analysis
- Dark mode support
