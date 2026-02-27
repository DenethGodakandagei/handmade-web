# Handmade Web (ArtisanConnect)

- **Frontend**: Vite + React (in `client/`)
- **Backend**: Node.js + Express + MongoDB + Socket.IO (in `server/`)

## Requirements

- Node.js (recommended: latest LTS)
- MongoDB connection string (local or hosted)

## Quick start (development)

### 1) Backend (API)

```bash
cd server
npm install
```

Create `server/.env` (see template below), then run:

```bash
npm run dev
```

The API defaults to `http://localhost:4000` and mounts routes under `/api/v1`.

Swagger UI:

- `http://localhost:4000/api-docs`

### 2) Frontend (web)

```bash
cd client
npm install
npm run dev
```

Vite defaults to `http://localhost:5173`.

## Environment variables

### Backend: `server/.env`

```env
# Server
NODE_ENV=development
PORT=4000
CLIENT_URL=http://localhost:5173

# Database
MONGO_URI=mongodb://127.0.0.1:27017/handmade

# Auth
JWT_SECRET=change_me
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30

# Email (Resend)
RESEND_API_KEY=
EMAIL_FROM=
EMAIL_FROM_NAME=

# Cloudinary (uploads)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Payments (Stripe)
STRIPE_SECRET_KEY=

# Arcjet (optional)
ARCJET_KEY=
ARCJET_ENV=
```

Notes:

- `CLIENT_URL` is used for CORS and Socket.IO origin.
- Stripe is initialized only when `STRIPE_SECRET_KEY` is set.

### Frontend: `client/.env`

```env
# API base should include /api/v1
VITE_API_BASE_URL=http://localhost:4000/api/v1

# Stripe (client)
VITE_STRIPE_PUBLISHABLE_KEY=
```

## Tests (backend)

```bash
cd server
npm test
```

Integration tests:

```bash
cd server
npm run test:integration
```

## Repo layout

- `client/` – Vite + React app
- `server/` – Express API, DB models, routes, middleware, tests

## Common dev URLs

- Frontend: `http://localhost:5173`
- API: `http://localhost:4000/api/v1`
- Swagger: `http://localhost:4000/api-docs`
