# 🐾 Mitt Djur — Gamified Pet Wellness App

> A school project built at Chas Academy (2025–2026) by a team of 8 fullstack developers.
> Users adopt a virtual pet that lives and dies based on real-world wellness habits — steps, mood, gratitude, and daily activity.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🐶 Virtual Pet | Adopt a cat, dog, rabbit, or raccoon. Pet health decays daily unless you log activity. |
| 👣 Steps & Activity | Log steps and activities to keep your pet healthy and earn XP |
| 😊 Mood & Gratitude | Daily mood check-in and gratitude notes |
| 🏆 Missions | Accept up to 5 missions, track daily progress, earn coins on completion |
| 🏅 Achievements | Unlock badges for milestones (streaks, steps, missions) |
| 🛒 Shop | Spend coins on cosmetic items to dress up your pet |
| 👥 Friends | Add friends, view a leaderboard, accept/reject requests |
| 🔔 Notifications | In-app alerts for friend requests, mission completions, and milestones |
| 💀 Pet Revival | If your pet dies from neglect, spend coins to revive it |
| 🔐 Auth | Register / Login with JWT access tokens + httpOnly refresh cookie |

---

## 🛠 Tech Stack

### Backend
| Tool | Purpose |
|---|---|
| [Bun](https://bun.sh) | JavaScript runtime & package manager |
| [Fastify](https://fastify.dev) | HTTP server framework |
| TypeScript | Type-safe backend code |
| MongoDB Atlas | Cloud NoSQL database |
| `@fastify/jwt` | JWT access token signing & verification |
| `@fastify/cookie` | httpOnly refresh token cookie |
| `@fastify/cors` | Cross-Origin Resource Sharing |
| `@fastify/rate-limit` | Rate limiting per IP |
| Zod | Request schema validation |
| bcrypt | Password hashing |
| node-cron | Scheduled jobs (daily health decay, weekly summary) |

### Frontend
| Tool | Purpose |
|---|---|
| React 18 | UI framework |
| Vite + Bun | Build tool & dev server |
| Vanilla CSS | Styling (no UI library) |
| React Router | Client-side routing |

### Infrastructure
| Tool | Purpose |
|---|---|
| Docker | Multi-stage builds (Bun → Alpine) |
| nginx | Serves the React SPA, handles routing |
| Kubernetes | Deployment manifests (namespace, deployment, service, ingress, secrets) |
| GitLab CI | Build → Test → Package → Deploy pipeline |

---

## 🏗 Architecture

The backend follows a strict **layered architecture**:

```
Route → Controller → Service → Repository → Model
```

- **Route** — registers the path and calls the controller
- **Controller** — validates input, calls service, sends response
- **Service** — business logic (no DB access directly)
- **Repository** — all MongoDB queries
- **Model** — TypeScript interfaces for DB documents

---

## 👥 Team

| Name | Role |
|---|---|
| Devinder Singh | Backend lead — auth, activity, missions, shop, friends, notifications, achievements, HUD, streaks, pet death/revival, all cron jobs, security fixes, CI/CD fixes |
| Elias Fritioff | Database setup (MongoDB Atlas), initial schema design |
| Amalia Lindh | Frontend — pet screen, home, welcome, navigation |
| Oscar Björk | Frontend — shop UI, profile |
| Anton Svanberg | Frontend — missions UI, achievements |
| Lina Hasic | Frontend — friends UI |
| AnLa (Anna-Lena) | DevOps — Portainer, Kubernetes cluster |
| (Team member 8) | Frontend — onboarding, register/login screens |

---

## 🚀 Devinder's Contributions

### Sprint 1 — Foundation
- Project scaffolding: Fastify server, MongoDB connection, plugin registration
- `buildServer` pattern — clean testable server factory
- Auth: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `POST /api/auth/refresh`
- JWT middleware (`authenticate.ts`) used by all protected routes
- Zod schema validation utility (`validate.ts`)
- `AppError` class for consistent error responses

### Sprint 2 — Core Features
- Activity: `POST /api/activity/log`, `GET /api/activity/today`, `GET /api/activity/history`
- Mood: `POST /api/activity/mood`
- Gratitude/Notes: `POST /api/activity/gratitude`, `POST /api/activity/note`
- Steps sync: `POST /api/activity/steps`
- Pet: `GET /api/pet`, `PATCH /api/pet/name`, `POST /api/pet/revive`, `GET /api/pet/history`, `GET /api/pet/all-history`
- User CRUD: `GET /api/users/me`, `PATCH /api/users/me`, `DELETE /api/users/me`
- Onboarding: `POST /api/users/onboarding`
- Coins: `GET /api/users/coins`

### Sprint 3 — Gamification
- Shop: `GET /api/shop`, `POST /api/shop/buy`, `POST /api/shop/equip`, `POST /api/shop/unequip`
- Missions: `GET /api/missions`, `GET /api/missions/my`, `POST /api/missions/select`, `POST /api/missions/complete`
- XP & Coins system integrated into activity logging
- Pet health decay cron job (runs daily at midnight)
- Weekly summary cron job (runs every Sunday)

### Sprint 4 — Social & Achievements
- Friends: `POST /api/friends/add`, `GET /api/friends`, `GET /api/friends/leaderboard`, `GET /api/friends/requests`, `POST /api/friends/accept`, `DELETE /api/friends/remove`
- Notifications: `GET /api/notifications`, `PATCH /api/notifications/:id/read`, `PATCH /api/notifications/read-all`
- Achievements: `GET /api/achievements`
- Streak tracking: `GET /api/users/streak`
- HUD endpoint: `GET /api/hud`

### Post-Sprint — Bug Fixes & Security
- **Mission bugs**: removed 6-mission display cap, raised active limit 3→5, added same-day re-completion block (`lastProgressDate`)
- **XSS fix**: `safeSrc()` sanitizer in Shop.jsx blocks non-`/` or `https://` image URLs
- **NoSQL injection fix**: email regex validation in `giveCoins.ts` script
- **Dockerfile fix**: backend was running in dev mode (`npm run dev`) in production — rewrote to use `bun run src/server.ts` directly
- **nginx SPA fix**: added `nginx.conf` with `try_files` so direct URL navigation doesn't 404
- **Ingress fix**: removed `rewrite-target: /` annotation that was stripping all API paths
- **CI/CD fix**: added `docker:dind` service, fixed deploy_job syntax error, added TypeScript check step

---

## 🏃 Running Locally

### Prerequisites
- [Bun](https://bun.sh) installed
- MongoDB Atlas account (or local MongoDB)

### Backend
```bash
cd backend
cp src/.env.example src/.env   # fill in MONGODB_URI, JWT secrets
bun install
bun run src/server.ts
# API running at http://localhost:3000
```

### Frontend
```bash
cd frontend
bun install
# Create .env with: VITE_API_URL=http://localhost:3000/api
bun run dev
# App running at http://localhost:5173
```

### With Docker Compose
```bash
cd backend
docker compose up --build
# Backend at http://localhost:3000
```

---

## 📡 API Overview

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login, get access token |
| POST | `/api/auth/logout` | ✅ | Logout, clear refresh cookie |
| POST | `/api/auth/refresh` | 🍪 | Refresh access token |
| GET | `/api/pet` | ✅ | Get user's pet |
| GET | `/api/hud` | ✅ | Heads-up display data (pet + user summary) |
| POST | `/api/activity/log` | ✅ | Log activity (walks, gym, etc.) |
| POST | `/api/activity/steps` | ✅ | Sync step count |
| POST | `/api/activity/mood` | ✅ | Set today's mood |
| GET | `/api/missions` | ✅ | All available missions |
| POST | `/api/missions/select` | ✅ | Accept a mission |
| POST | `/api/missions/complete` | ✅ | Record daily mission progress |
| GET | `/api/shop` | ✅ | Get shop items + inventory |
| POST | `/api/shop/buy` | ✅ | Purchase item with coins |
| GET | `/api/friends` | ✅ | List friends |
| GET | `/api/friends/leaderboard` | ✅ | Friends ranked by XP |
| GET | `/api/notifications` | ✅ | List notifications |
| GET | `/api/achievements` | ✅ | List user achievements |

---

## 🔒 Security

- Passwords hashed with **bcrypt** (cost factor 10)
- Access tokens stored in memory (not localStorage)
- Refresh tokens in **httpOnly cookies** (not accessible to JS)
- Input validated with **Zod** on every endpoint
- Rate limiting on all routes via `@fastify/rate-limit`
- CORS restricted to `FRONTEND_URL` env variable
- Image URLs sanitized in frontend to prevent DOM XSS
- Admin scripts validate email format to prevent NoSQL injection
- No real secrets in version control — use env variables or Kubernetes Secrets

---

## 📁 Project Structure

```
grupp-17/
├── backend/
│   ├── src/
│   │   ├── config/         # env.ts, db.ts
│   │   ├── controllers/    # one file per endpoint
│   │   ├── services/       # business logic
│   │   ├── repositories/   # MongoDB queries
│   │   ├── models/         # TypeScript interfaces
│   │   ├── routes/         # Fastify route registration
│   │   ├── middleware/     # authenticate.ts
│   │   ├── schemas/        # Zod validation schemas
│   │   ├── jobs/           # cron jobs (healthDecay, weeklySummary)
│   │   ├── utils/          # validate.ts, AppError.ts
│   │   └── data/           # missions.json, shopItems.json
│   ├── scripts/            # giveCoins.ts admin script
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/            # one file per domain (auth, pet, shop…)
│   │   ├── components/     # React screens + CSS
│   │   └── lib/            # petImage.js, useEquippedPreview.js
│   ├── nginx.conf          # SPA routing config
│   ├── Dockerfile
│   └── vite.config.js
├── kubernetes/             # k8s manifests
└── .gitlab-ci.yml          # CI/CD pipeline
```

---

## 📝 License

School project — Chas Academy 2025–2026. Not for production use.
