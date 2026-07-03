# 🌱 ReVora — Circular Economy Platform

> Connecting food waste generators with poultry farmers and composters to convert fruit & vegetable waste into compost and animal feed across Nigerian urban markets.

[![CI](https://github.com/your-username/revora/actions/workflows/ci.yml/badge.svg)](https://github.com/your-username/revora/actions)

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, MUI v5, React Leaflet, Recharts, Socket.IO client |
| Backend | Node.js 20, Express 4, Socket.IO 4 |
| Database | MongoDB Atlas (2dsphere geospatial indexing) |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Image storage | Cloudinary (multer-storage-cloudinary) |
| Testing | Jest + Supertest + mongodb-memory-server, React Testing Library |
| CI | GitHub Actions |
| Deployment | Vercel (frontend) + Railway (backend) |
| Containers | Docker + docker-compose |

---

## Quick start (local)

```bash
git clone https://github.com/your-username/revora.git && cd revora
pnpm install
cp server/.env.example server/.env   # fill in MONGO_URI, JWT_SECRET, Cloudinary keys
pnpm dev
# Frontend: http://localhost:3000  |  Backend: http://localhost:5000
```

### Seed pilot data

```bash
cd server && npm run seed:pilot
# Login: chidinma@pilot.ng / Revora2024!
```

---

## Docker (full stack incl. MongoDB)

```bash
docker-compose up --build
```

---

## Running tests

```bash
# Backend — 58 tests across 6 suites
pnpm -C server test

# Frontend — component tests
pnpm -C client test -- --watchAll=false
```

---

## API reference

### Auth
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Register with role + NDPR consent |
| POST | `/api/auth/login` | — | Login → JWT |
| GET | `/api/auth/me` | ✅ | Current user |

### Listings
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/listings` | — | Browse (`?lat=&lng=&radiusKm=&category=&targetUse=`) |
| POST | `/api/listings` | vendor | Create + photos (multipart) |
| GET | `/api/listings/:id` | — | View (increments views) |
| PUT | `/api/listings/:id` | vendor | Update |
| DELETE | `/api/listings/:id` | vendor/admin | Remove |

### Requests
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/requests` | farmer/composter | Send pickup request |
| GET | `/api/requests` | ✅ | My requests (role-aware) |
| PATCH | `/api/requests/:id/status` | vendor | Accept / reject / complete |

### Ratings
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/ratings` | ✅ | Rate (double-blind) |
| GET | `/api/ratings/user/:id` | — | Revealed ratings for a user |

### Impact
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/impact/platform` | — | Platform-wide CO₂ + by-product stats |
| GET | `/api/impact/me` | ✅ | Personal impact |
| POST | `/api/impact/estimate` | — | Quick estimate before listing |
| POST | `/api/impact/sus` | ✅ | Submit SUS survey |
| GET | `/api/impact/sus` | ✅ | All SUS responses |

### Admin
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/stats` | admin | Platform overview |
| GET | `/api/admin/users` | admin | User list |
| PATCH | `/api/admin/users/:id/verify` | admin | Toggle verified badge |
| PATCH | `/api/admin/users/:id/deactivate` | admin | Toggle active status |
| GET | `/api/admin/listings` | admin | All listings |
| DELETE | `/api/admin/listings/:id` | admin | Remove listing |

---

## Sprint roadmap

| Sprint | Weeks | Focus | Status |
|---|---|---|---|
| 1 | 1–2 | Setup, DB, Auth boilerplate | ✅ |
| 2 | 3–4 | User model, roles, profiles | ✅ |
| 3 | 5–6 | Listing CRUD, Cloudinary, Leaflet map | ✅ |
| 4 | 7–8 | Geo-matching, request flow, Socket.IO chat | ✅ |
| 5 | 9–10 | Double-blind ratings, trust badges | ✅ |
| 6 | 11–12 | Impact dashboard, Recharts, admin panel | ✅ |
| 7 | 13–14 | 58 backend tests, component tests, SUS modal | ✅ |
| 8 | 15–16 | Pilot deployment — 300 kg waste diversion goal | 🚀 |

---

## Impact methodology

| Metric | Factor | Source |
|---|---|---|
| CO₂ avoided | 0.55 kg CO₂e / kg waste | FAO, 2022 |
| Compost yield | 0.40 kg dry / kg input | Literature |
| Animal feed yield | 0.30 kg dry / kg input | Literature |
| CH₄ avoided | 0.10 kg / kg not landfilled | IPCC default |
| Tree equivalent | 21.77 kg CO₂ absorbed / tree / year | FAO |

---

## SDG alignment

SDG 2 · SDG 11 · SDG 12 · SDG 13

---

## Data protection

Consent-based data collection compliant with the **Nigeria Data Protection Regulation (NDPR)**.
Passwords bcrypt-hashed (12 rounds). JWT expiry 7d. Rate-limited API. Helmet.js security headers.
