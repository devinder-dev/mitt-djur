# 🐾 Mitt Djur — Gamified Pet Wellness App

**Mitt Djur** ("My Animal" in Swedish) is a habit and wellness app where a **virtual pet lives and dies based on your real-life habits**. Log your steps, mood, and daily tasks → your pet stays healthy. Skip your habits → your pet loses health, and if it hits zero three times, it dies permanently.

This is a school group project built at **Chas Academy (2025–2026)** by a team of 8. **I (Devinder Singh) was the sole backend developer** — I designed and built the entire REST API from scratch using Bun + Fastify + TypeScript, covering all 30+ endpoints, JWT authentication, cron jobs, security hardening, Dockerfiles, and CI/CD pipeline fixes. The rest of the team worked on frontend UI, design (Figma), and DevOps.

---

## 🗺 What I Built (Devinder Singh — Backend Lead)

| Area | What I did |
|---|---|
| **Auth** | Register, Login, Logout, Token Refresh — JWT access tokens + httpOnly refresh cookies |
| **Activity** | Log activity, sync steps, set mood, add gratitude/notes, get today + history |
| **Pet system** | Get pet, update name, revive dead pet, pet history — with health/XP/level/stage logic |
| **Missions** | Browse, accept (up to 5 active), record daily progress, complete — coins + XP reward |
| **Shop** | Browse items, buy with coins, equip/unequip cosmetics on pet |
| **Friends** | Add, list, leaderboard, pending requests, accept, remove |
| **Notifications** | In-app alerts, mark read, mark all read |
| **Achievements** | Unlock badges for milestones, list user achievements |
| **Cron jobs** | Daily health decay (runs at midnight), weekly XP summary |
| **Security fixes** | XSS sanitizer in frontend, NoSQL injection block in admin script, Snyk scan → 0 issues |
| **Infrastructure** | Fixed broken Dockerfiles, wrote nginx SPA config, fixed Kubernetes ingress, rewrote CI/CD |

---

## ✨ App Features

| Feature | Description |
|---|---|
| 🐶 Virtual Pet | Adopt a cat, dog, rabbit, or raccoon at onboarding |
| 💪 Daily Habits | Log steps, water, sleep, and exercise to keep pet healthy |
| 🏆 Missions | Accept up to 5 missions filtered by your personal goals. Complete daily → earn coins + XP |
| 🏅 Achievements | Unlock badges for streaks, steps, and mission milestones |
| 🛒 Shop | Spend coins on hats, glasses, bandanas and accessories for your pet |
| 👥 Friends | Add friends, compare pets, view XP leaderboard |
| 🔔 Notifications | In-app alerts for friend requests, mission completions, and milestones |
| 💀 Pet Death | If health hits 0 three times the pet dies permanently — spend coins to revive |
| 🔐 Auth | Secure JWT auth — access token in memory, refresh token in httpOnly cookie |

---

## 🛠 Tech Stack

### Backend
| Tool | Purpose |
|---|---|
| [Bun](https://bun.sh) | Runtime & package manager |
| [Fastify](https://fastify.dev) | HTTP server framework |
| TypeScript | Fully typed backend |
| MongoDB Atlas | Cloud NoSQL database |
| `@fastify/jwt` | JWT access token signing & verification |
| `@fastify/cookie` | httpOnly refresh token cookie |
| `@fastify/cors` | CORS restricted to frontend URL |
| `@fastify/rate-limit` | Rate limiting per IP |
| Zod | Request body validation on every endpoint |
| bcrypt | Password hashing (cost factor 10) |
| node-cron | Scheduled jobs (daily health decay, weekly summary) |

### Frontend
| Tool | Purpose |
|---|---|
| React 18 | UI framework |
| Vite + Bun | Build tool and dev server |
| Vanilla CSS | Styling (no external UI library) |
| React Router | Client-side routing |

### Infrastructure
| Tool | Purpose |
|---|---|
| Docker | Multi-stage builds (Bun builder → Alpine runtime) |
| nginx | Serves the React SPA, handles client-side routing |
| Kubernetes | Deployment manifests for cluster hosting |
| GitLab CI | Build → Test → Docker push pipeline |

---

## 🏗 Backend Architecture

Strict **layered architecture** so every layer has one job:

```
Route → Controller → Service → Repository → Model
```

- **Route** — registers the URL path, attaches middleware, calls controller
- **Controller** — validates input with Zod, calls service, sends HTTP response
- **Service** — all business logic (no MongoDB access here)
- **Repository** — all MongoDB queries (no logic here)
- **Model** — TypeScript interfaces for every document shape

---

## 👥 Team

| Name | Role | Contribution |
|---|---|---|
| **Devinder Singh** | Fullstack — Backend lead | ALL backend code (30+ endpoints, auth, cron jobs, security, CI/CD fixes) + frontend bug fixes |
| Elias | Fullstack | Frontend coding support |
| Osameh | Fullstack / Mobile | Frontend coding support + design input |
| Gogita | Fullstack / UI | Frontend coding support + Figma design |
| Kabir | DevOps | Docker setup, CI/CD pipeline, tests |
| Angelica | DevOps | Docker setup, CI/CD pipeline, tests |
| Viktoria | UI/UX | Figma design only |
| Ali | Mobile/Web | Figma/design support |

---

## 🚀 Running Locally

### Prerequisites
- [Bun](https://bun.sh) installed (`curl -fsSL https://bun.sh/install | bash`)
- MongoDB Atlas account or local MongoDB

### Backend
```bash
cd backend
cp src/.env.example src/.env   # fill in MONGODB_URI and JWT secrets
bun install
bun run src/server.ts
# API running at http://localhost:3000
# Health check: http://localhost:3000/health
```

### Frontend
```bash
cd frontend
bun install
# Create frontend/.env: VITE_API_URL=http://localhost:3000/api
bun run dev
# App running at http://localhost:5173
```

### With Docker
```bash
cd backend
docker compose up --build
```

---

## 📡 API Reference

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Register new user, returns access token |
| POST | `/api/auth/login` | — | Login, sets refresh cookie, returns access token |
| POST | `/api/auth/logout` | ✅ | Clears refresh cookie |
| POST | `/api/auth/refresh` | 🍪 | Issues new access token from refresh cookie |
| GET | `/api/hud` | ✅ | All data needed for the home screen in one call |
| GET | `/api/pet` | ✅ | Get user's current pet (health, XP, level, stage, mood) |
| PATCH | `/api/pet/name` | ✅ | Rename pet |
| POST | `/api/pet/revive` | ✅ | Revive dead pet (costs coins) |
| POST | `/api/activity/log` | ✅ | Log activity (steps, workout, etc.) |
| POST | `/api/activity/steps` | ✅ | Sync step count |
| POST | `/api/activity/mood` | ✅ | Set today's mood |
| POST | `/api/activity/gratitude` | ✅ | Add a gratitude entry |
| GET | `/api/missions` | ✅ | All missions matching user's goals |
| POST | `/api/missions/select` | ✅ | Accept a mission (max 5 active) |
| POST | `/api/missions/complete` | ✅ | Record daily progress (once per day) |
| GET | `/api/shop` | ✅ | Shop items + user's inventory |
| POST | `/api/shop/buy` | ✅ | Purchase item with coins |
| POST | `/api/shop/equip` | ✅ | Equip item on pet |
| GET | `/api/friends` | ✅ | Friend list |
| GET | `/api/friends/leaderboard` | ✅ | Friends ranked by XP |
| POST | `/api/friends/add` | ✅ | Send friend request |
| POST | `/api/friends/accept` | ✅ | Accept incoming request |
| GET | `/api/notifications` | ✅ | All notifications for user |
| PATCH | `/api/notifications/read-all` | ✅ | Mark all notifications as read |
| GET | `/api/achievements` | ✅ | User's unlocked achievements |
| GET | `/api/users/me` | ✅ | Current user profile |
| PATCH | `/api/users/me` | ✅ | Update profile |

---

## 🔒 Security

- Passwords hashed with **bcrypt** (cost factor 10)
- Access tokens kept in JS memory only (never in localStorage)
- Refresh tokens in **httpOnly cookies** — invisible to JavaScript, sent automatically
- Every endpoint validates input with **Zod** — no raw request data reaches the service layer
- Rate limiting on all routes via `@fastify/rate-limit`
- CORS restricted to `FRONTEND_URL` env variable
- Image URLs sanitized in frontend to prevent DOM XSS attacks
- Admin scripts validate email format to prevent NoSQL injection
- **Snyk SAST scan result: 0 issues**
- No real secrets in version control — use environment variables

---

## 📁 Project Structure

```
grupp-17/
├── backend/
│   ├── src/
│   │   ├── config/         # env.ts (Zod-validated), db.ts (MongoDB connection)
│   │   ├── controllers/    # one file per endpoint — validate → call service → respond
│   │   ├── services/       # business logic — no DB access here
│   │   ├── repositories/   # all MongoDB queries — no logic here
│   │   ├── models/         # TypeScript interfaces for every DB document
│   │   ├── routes/         # Fastify route registration
│   │   ├── middleware/     # authenticate.ts — JWT verification
│   │   ├── schemas/        # Zod validation schemas
│   │   ├── jobs/           # healthDecay.ts, weeklySummary.ts (node-cron)
│   │   ├── utils/          # validate.ts, AppError.ts
│   │   └── data/           # missions.json, shopItems.json
│   ├── scripts/            # giveCoins.ts — admin CLI tool
│   ├── Dockerfile          # multi-stage: Bun builder → Bun Alpine runtime
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/            # one file per domain (auth, pet, shop, friends…)
│   │   ├── components/     # React screens + CSS modules
│   │   └── lib/            # petImage.js, useEquippedPreview.js
│   ├── nginx.conf          # SPA routing — try_files → index.html
│   ├── Dockerfile          # multi-stage: Bun builder → nginx Alpine
│   └── vite.config.js
├── kubernetes/             # namespace, deployment, service, ingress, secrets
└── .gitlab-ci.yml          # CI pipeline: build Docker images → push to registry
```

---

*Chas Academy — Group 17 — 2025–2026*
