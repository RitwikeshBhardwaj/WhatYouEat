# WhatYouEat

A full-stack nutrition tracking web app built with the MERN stack. Search foods via the USDA FoodData Central API, log meals, visualize macros on a dashboard, get health insights (BMI, TDEE, water), analyze recipes, create custom foods, and export a weekly PDF summary.

## Tech Stack

- **Frontend:** React + Vite, Tailwind CSS, React Router, Recharts, Axios
- **Backend:** Node + Express, JWT auth, bcryptjs, Joi validation, centralized error handling
- **Database:** MongoDB Atlas via Mongoose
- **External:** USDA FoodData Central API, Twilio (SMS OTP), Nodemailer (email reset)

## Project Layout

```
whatyoueat/
├── client/    # Vite + React frontend (port 5173)
├── server/    # Express API server (port 5050)
├── AGENTS.md  # repo guidance for OpenCode sessions
└── .env.example
```

## Setup

### 1. Install dependencies

```bash
npm install            # root deps (concurrently)
npm install --prefix client
npm install --prefix server
```

Or one-shot: `npm run install:all`

### 2. Environment variables

Copy the example and fill in real values:

```bash
cp .env.example server/.env
cp .env.example client/.env   # client only needs VITE_API_URL=/api
```

Required keys (see `.env.example` for the full list):

| Key | Where | Purpose |
|-----|-------|---------|
| `MONGODB_URI` | server | MongoDB Atlas connection string |
| `JWT_SECRET` | server | JWT signing secret |
| `USDA_API_KEY` | server | USDA FoodData Central API |
| `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_PHONE` | server | SMS OTP |
| `EMAIL_USER` / `EMAIL_PASS` | server | Nodemailer SMTP (use a Gmail app password) |
| `CLIENT_URL` | server | frontend origin (reset links, CORS) |
| `VITE_API_URL` | client | `/api` (proxied in dev) |

### 3. Get API keys

- **USDA FoodData Central:** Get a free API key at https://fdc.nal.usda.gov/api-key-signup.html. Copy the API key into server `.env`.
- **Twilio:** Sign up at https://www.twilio.com/console, grab Account SID, Auth Token, and a verified phone number.
- **Email:** Use Gmail with an [App Password](https://support.google.com/accounts/answer/185833) (regular password won't work with 2FA on).

### 4. Run in development

From the repo root:

```bash
npm run dev
```

This starts both the client (`http://localhost:5173`) and server (`http://localhost:5050`) concurrently. The Vite dev server proxies `/api` → `http://localhost:5050`, so the frontend uses relative paths.

### 5. Production build

```bash
npm run build        # builds client to client/dist
npm start --prefix server   # run API in production
```

## Features

1. **Auth** — signup/login/logout, JWT, password reset via email link (15 min) and SMS OTP (5 min)
2. **Food Search** — USDA FoodData Central API, calories + macros, health label badges
3. **Meal Logging** — breakfast/lunch/dinner/snack, portion scaling, per-user by date
4. **Dashboard** — calorie goal progress bar, macro donut chart, 7-day intake line chart, daily streak
5. **Health Insights** — BMI, TDEE + calorie recommendation, water tracker (8 glasses/day)
6. **Recipe Analyzer** — paste ingredient text and we estimate nutrition using USDA FoodData Central
7. **Custom Foods** — manually add homemade meals with custom macros, reusable per user
8. **PDF Export** — weekly nutrition summary (charts + numbers) downloadable

## Phases

The app was built in 6 phases (see `AGENTS.md`). Each is independently verifiable.

## Notes

- No test runner is configured. Verify by running both servers and hitting endpoints.
- USDA FoodData Central shared limits apply; food search results are cached server-side for 5 minutes.
