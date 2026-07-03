# Restaurant Reservation Management System

A full-stack restaurant table reservation system built with the MERN stack
(MongoDB, Express, React, Node.js), featuring JWT authentication, role-based
access control, and a race-condition-safe table allocation algorithm.

## Table of Contents

- [Project Architecture](#project-architecture)
- [Setup Instructions](#setup-instructions)
- [Reservation Logic](#reservation-logic)
- [Role-Based Access](#role-based-access)
- [API Reference](#api-reference)
- [Assumptions](#assumptions)
- [Future Improvements](#future-improvements)

## Project Architecture

```
restaurant-reservation-system/
├── backend/
│   ├── config/db.js              MongoDB connection
│   ├── models/                   Mongoose schemas (User, Table, Reservation)
│   ├── controllers/              Request handling, thin & delegating
│   ├── services/                 Business logic (table allocation algorithm)
│   ├── routes/                   Express routers
│   ├── middleware/                Auth, role checks, centralized error handling
│   ├── utils/                    Token generation, custom errors, seed script
│   └── server.js                 App entry point
└── frontend/
    └── src/
        ├── pages/                Route-level views
        ├── components/            Reusable UI pieces (Navbar, ProtectedRoute, table)
        ├── services/              Axios API calls
        └── context/               AuthContext (global auth state)
```

The backend follows a **controller → service → model** layering:
controllers parse the request and format the response; services hold all
business rules (in particular, the reservation allocation algorithm);
models define schema and data-level constraints. This keeps the allocation
logic independently reusable and testable, separate from HTTP concerns.

## Setup Instructions

### Prerequisites

- Node.js 18+
- A MongoDB connection string (local `mongod` or MongoDB Atlas)

### Backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env with your MONGO_URI and JWT_SECRET
npm run seed      # populates 10 initial tables
npm run dev        # starts on http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# edit .env if your API isn't on localhost:5000
npm start           # starts on http://localhost:3000
```

### First-time use

1. Register a normal account at `/register` — this creates a `customer`.
2. To create an `admin` account, register normally, then either:
   - manually update that user's `role` field to `"admin"` in MongoDB, or
   - POST to `/api/auth/register` with `"role": "admin"` in the body
     (e.g. via Postman/curl) — the public frontend form does not expose
     this to avoid self-service admin signup.

### Deployment

Use Render for the backend and GitHub Pages for the frontend.

#### Backend on Render

1. Create a new Render Web Service from this repo, or import it and let Render use [render.yaml](render.yaml).
2. Use `backend` as the service root if you configure it manually.
3. Set these values:
  - Build command: `npm install`
  - Start command: `npm start`
  - Node version: 18 or newer
4. Add these environment variables in Render:
  - `NODE_ENV=production`
  - `MONGO_URI=<your MongoDB Atlas connection string>`
  - `JWT_SECRET=<long random production secret>`
  - `CLIENT_URL=<your GitHub Pages URL>`
5. Deploy and confirm the API responds on `/`.

#### Frontend on GitHub Pages

1. Make sure `frontend/package.json` has `"homepage": "."` and the app uses `HashRouter`.
2. Set the API URL at build time, because GitHub Pages serves static files:
  - PowerShell example: `$env:REACT_APP_API_URL='https://your-render-service.onrender.com/api'`
3. Build and deploy from the `frontend` folder:
  - Install once: `npm install`
  - Deploy: `npm run deploy`
4. In your GitHub repository settings, enable GitHub Pages from the `gh-pages` branch.
5. After the site is live, copy the GitHub Pages URL back into Render as `CLIENT_URL`.

#### MongoDB Atlas

1. Create a MongoDB Atlas cluster and database user.
2. Copy the connection string into `MONGO_URI`.
3. Allow network access from Render's outbound IPs, or temporarily allow all (`0.0.0.0/0`) while testing.

#### Production checklist

- Use a strong, unique `JWT_SECRET` in production.
- Make sure `CLIENT_URL` points to the deployed GitHub Pages URL, not localhost.
- Make sure `REACT_APP_API_URL` points to the deployed Render API, not localhost.
- Do not rely on the local in-memory MongoDB fallback in production.

## Reservation Logic

This is the core of the system. When a customer requests a reservation for
a given `date`, `timeSlot`, and `guests` count:

1. **Filter** all active tables where `capacity >= guests`, sorted by
   capacity ascending (best-fit first — a party of 2 shouldn't take a
   6-seat table while 2-seat tables sit empty).
2. **Check availability**: for each candidate table, look for an existing
   `status: "booked"` reservation with the same `table`, `date`, and
   `timeSlot`.
3. **Assign** the first table with no conflicting reservation, and create
   the reservation record.
4. If **no table** in the candidate list is free, respond with:
   `"No tables available for the selected date and time."` (HTTP 409)

### Concurrency / double-booking prevention

Two customers could pass the availability check at the same instant for
the same table and slot. To close that race condition, the `Reservation`
schema defines a **partial unique index**:

```js
reservationSchema.index(
  { table: 1, date: 1, timeSlot: 1 },
  { unique: true, partialFilterExpression: { status: 'booked' } }
);
```

This means MongoDB itself — not just application logic — refuses a second
`booked` reservation for the same table/date/slot. If two requests race,
the loser's `create()` call throws a duplicate key error (code `11000`),
which the service layer catches and uses to automatically retry the next
candidate table, rather than failing the customer's request outright.

## Role-Based Access

Two roles: `customer` and `admin`, embedded directly in the JWT payload.

| Action                          | Customer | Admin |
|----------------------------------|:--------:|:-----:|
| Register / Login                 | ✅        | ✅     |
| Create reservation               | ✅        | ❌     |
| View own reservations            | ✅        | ❌     |
| Cancel own reservation           | ✅        | ✅     |
| View all reservations            | ❌        | ✅     |
| Filter reservations by date      | ❌        | ✅     |
| Update any reservation           | ❌        | ✅     |
| Cancel any reservation           | ❌        | ✅     |

Enforced via two middlewares: `authMiddleware` (verifies JWT, attaches
`req.user`) and `roleMiddleware` (checks `req.user.role` against an
allow-list per route). The shared cancel route additionally checks
ownership inside the controller for customers.

## API Reference

Base URL: `/api`

### Auth (public)

| Method | Endpoint         | Body                              |
|--------|------------------|------------------------------------|
| POST   | `/auth/register` | `{ name, email, password }`        |
| POST   | `/auth/login`    | `{ email, password }`              |

### Tables (authenticated)

| Method | Endpoint   | Description         |
|--------|------------|----------------------|
| GET    | `/tables`  | List all tables      |

### Customer (authenticated, role: customer)

| Method | Endpoint                     | Body / Query                         |
|--------|-------------------------------|----------------------------------------|
| POST   | `/reservations`               | `{ date, timeSlot, guests }`          |
| GET    | `/reservations/my-reservations` | —                                    |
| DELETE | `/reservations/:id`           | — (cancels own)                        |

### Admin (authenticated, role: admin)

| Method | Endpoint                | Body / Query                              |
|--------|--------------------------|---------------------------------------------|
| GET    | `/reservations`          | `?date=YYYY-MM-DD` (optional filter)        |
| PUT    | `/reservations/:id`      | `{ date?, timeSlot?, guests?, status? }`    |
| DELETE | `/reservations/:id`      | — (cancels any)                              |

All responses follow the shape: `{ success, data | message }`.

## Assumptions

- Time slots are fixed, one-hour windows (see `TIME_SLOTS` in
  `Reservation.js`) rather than free-form time entry, to keep slot
  matching for double-booking checks unambiguous.
- `date` is stored as a plain `YYYY-MM-DD` string rather than a `Date`
  object, avoiding timezone-conversion bugs when comparing "same day"
  across client and server.
- Cancelling a reservation sets `status: "cancelled"` rather than deleting
  the document, preserving history for the admin dashboard.
- There's no payment or deposit flow — this system manages allocation
  only, not billing.
- Table capacity is fixed at seed time; the current API doesn't expose a
  create/edit-table endpoint (see Future Improvements).

## Future Improvements

- Admin endpoints to add/edit/deactivate tables without touching the
  seed script directly.
- Email/SMS confirmation on booking and cancellation.
- Waitlist behavior when no table is available (revisiting the original
  Virtual Waiting Room concept as a fallback queue instead of a hard
  rejection).
- Pagination and search on the admin reservations list.
- Automated tests (Jest + Supertest) around the allocation algorithm,
  particularly concurrent-request race conditions.
- Refresh tokens instead of a single long-lived JWT.
