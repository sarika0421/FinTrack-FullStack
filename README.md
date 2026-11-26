# FinTrack — Full-Stack Personal Finance Tracker

A beginner-friendly full-stack finance tracker built with React, Node.js, Express and MongoDB.

## Features
- Dashboard with balance, income and expense totals
- Add, edit and delete transactions
- Search transactions and filter by type
- Monthly summary and category-wise spending chart
- MongoDB persistence through a REST API
- Responsive layout for desktop and mobile

## Tech stack
- Frontend: React + Vite + CSS + Recharts + Lucide
- Backend: Node.js + Express + Mongoose
- Database: MongoDB

## 1. Requirements
Install Node.js (LTS) and MongoDB Community Server, or create a free MongoDB Atlas database.

## 2. Configure the backend
Open `backend/.env.example`, copy it as `backend/.env`, then set your MongoDB connection string.

Example for local MongoDB:
`MONGODB_URI=mongodb://127.0.0.1:27017/fintrack`

## 3. Install dependencies
From the project root terminal:

```bash
npm install
npm --prefix frontend install
npm --prefix backend install
```

## 4. Run the app
```bash
npm run dev
```
Frontend: http://localhost:5173
Backend: http://localhost:5000
API health check: http://localhost:5000/api/health

## 5. Build frontend
```bash
npm run build
```

## API routes
- `GET /api/transactions` — list transactions
- `POST /api/transactions` — create transaction
- `PUT /api/transactions/:id` — update transaction
- `DELETE /api/transactions/:id` — delete transaction
- `GET /api/summary` — dashboard summary

## Important notes
- This version is a single-user demo and does not include authentication.
- Never commit `backend/.env` or publish your MongoDB connection string.
- For production deployment, host the frontend and backend separately, configure `CLIENT_URL` and `VITE_API_URL`, and use MongoDB Atlas.
- Add authentication, validation/rate limiting, and stronger security before using it for real financial data.
