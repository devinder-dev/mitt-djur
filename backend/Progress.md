# 🐾 Mitt Djur — Project Progress

> Last updated: 2026-05-28 — Frontend bug fixes, Notifications + Friends screens built, mission fixes, security audit
> Updated by: Devinder

---

## 👥 Team Roles

| Role | Members | Responsibility |
|---|---|---|
| Fullstack (Backend lead) | Devinder | ALL backend coding + frontend coding support |
| Fullstack | Elias, Osameh, Gogita | Frontend coding support |
| DevOps | Kabir, Angelica | Docker, CI/CD pipeline, tests — no feature code |
| UI/UX | Viktoria, Gogita | Figma design only — no code |
| Mobile/Web | Osameh, Ali | Figma/design support only — no code |

---

## 🎯 App Vision

**Mitt Djur** is a habit and wellness app where a virtual pet grows, stays healthy, and evolves based on the user's real-life habits and personal goals. The pet is a daily accountability tool — if you take care of yourself, your pet thrives.

---

## 🔄 App Flow

```
1. Register account
       ↓
2. Onboarding — choose pet animal + select personal goals
   (quit smoking, quit snus, meditate, run more, sleep better etc.)
       ↓
3. Home — complete daily basic tasks (steps, water, sleep, read)
   → Keeps pet healthy (health bar)
   → Miss tasks → pet loses 20 health (healthDecay cron at 00:05 Stockholm)
       ↓
4. Missions — pick from a filtered list based on your selected goals
   → Complete missions → earn XP + coins
   → XP → pet grows, levels up, changes stage
       ↓
5. Streaks — complete daily tasks every day → streak bonus XP
   Break streak → pet loses extra health
       ↓
6. Shop — spend coins on pet accessories and clothes (visual only)
       ↓
7. Friends — compare pets, leaderboard ranked by XP/level
```

---

## 🏆 Reward System

| Action | XP | Coins | Pet Effect |
|---|---|---|---|
| Daily basic task (steps/water/sleep/read) | 10-20 | 0 | Pet stays healthy |
| Gratitude entry | 5 | 0 | Pet gains XP |
| Gratitude 3rd entry bonus | +10 | 0 | Pet gains extra XP |
| Mission — easy | 20 | 10 | Pet grows |
| Mission — medium | 30 | 20 | Pet grows faster |
| Mission — hard | 50 | 30 | Pet grows much faster |
| Daily streak bonus | +10 | 0 | Pet mood = happy |
| Miss all daily tasks | 0 | 0 | Pet loses 20 health |
| Health hits 0 (1st or 2nd time) | 0 | 0 | Warning — pet survives |
| Health hits 0 (3rd time) | 0 | 0 | Pet dies permanently |

> Coins are completely separate from health — spending coins does not affect the pet's health. You can only spend coins you have (no negative balance).

---

## 🐾 Pet System

| Mechanic | How it works |
|---|---|
| Health (0–100) | Decays -20/day if no activity. Maintained by daily tasks |
| XP | Earned from missions + activities. Drives level-up |
| Level | Calculated from total XP. Drives stage change |
| Stage | egg → chick → small_bird → bird → parrot → eagle → dragon |
| Mood | happy (all tasks done) / neutral (some done) / sad (none done) |
| Animal type | Chosen at onboarding — visual only, no gameplay difference |
| Accessories | Bought from shop with coins — visual only |
| healthHitsZero | Counter (0–3). At 3 → pet dies permanently |
| status | `alive` or `dead`. Dead pets are archived, not deleted |
| diedAt | Timestamp saved when pet dies — shown in history |

### Pet Death Rules
- Health hits 0 → `healthHitsZero` increments by 1. Pet survives with 1 health.
- `healthHitsZero` reaches 3 → pet status set to `dead`, `diedAt` saved.
- User must go to onboarding to choose a new pet animal.
- Dead pet stays in DB — full history (created, activities, death) shown in app history.
- User can change their goals at any time from profile settings.
- Maximum **5 active missions** at once.

---

## ✅ Completed — Sprint 1 — Grund & Konto

### Backend ✅
- [x] Bun + Fastify + TypeScript initialized
- [x] MongoDB Atlas connected (plain driver, no Mongoose)
- [x] Environment validation with Zod (`config/env.ts`)
- [x] Clean layered architecture (routes → controllers → services → repositories → models)
- [x] Plugins: MongoDB, JWT, cookies, error handler, CORS, rate limit, authenticate
- [x] `POST /api/auth/register` — create user + auto-create pet + coins: 0
- [x] `POST /api/auth/login` — verify credentials, return access token + refresh cookie
- [x] `POST /api/auth/refresh` — issue new tokens using httpOnly cookie
- [x] `POST /api/auth/logout` — clear refresh token + cookie
- [x] `GET /api/users/me` — own profile
- [x] `PATCH /api/users/me` — update username / avatarUrl
- [x] `DELETE /api/users/me` — delete account + all related data
- [x] Models: User, Pet, ActivityLog, Friendship, Mission

### Frontend (Fullstack)
- [x] Login + Register screens (React)
- [x] Welcome screen
- [x] API client with auto-refresh on 401 (`src/api/client.js`)
- [x] Auth API connected — login, register, logout, session restore (`src/api/auth.js`)
- [x] Users API connected — getMe, updateMe, completeOnboarding (`src/api/users.js`)
- [x] Profile screen — username, avatar, streak, dark mode toggle
- [ ] Zustand store for auth state

### DevOps
- [ ] Docker + Docker Compose (backend, MongoDB)
- [ ] CI pipeline (lint, typecheck)
- [ ] Branch strategy (main/develop/feature)

### Design (Figma only)
- [ ] Login + Register screen designs
- [ ] Profile page design
- [ ] Dark/light mode design

---

## ✅ Completed — Sprint 2 — Djuret & Steg

### Backend ✅
- [x] `GET /api/pet` — pet data (level, xp, health, stage, mood, status)
- [x] `PATCH /api/pet/name` — rename pet
- [x] `GET /api/pet/history` — last 90 days for calendar heatmap
- [x] `GET /api/activity/today` — today's activity log
- [x] `POST /api/activity/steps` — sync steps → earn XP
- [x] `POST /api/activity/log` — log walk/water/sleep/read → earn XP
- [x] `POST /api/activity/gratitude` — max 3/day, bonus XP on 3rd
- [x] `POST /api/activity/note` — daily journal note (overwrites)
- [x] `xpService.ts` — XP calculation, level-up, stage thresholds
- [x] `petService.ts` — get pet, rename, history
- [x] `healthDecay.ts` — 4-step bulk system: mood update, normal decay, 3-strike warning, death

### Frontend (Fullstack)
- [x] Home screen — daily habits (walk/water/read), check-in mood, energy bar
- [x] Pet screen — XP bar, health bar, rename pet, level + stage display
- [x] Activity API connected — logActivity, getToday, syncSteps, addGratitude, addNote (`src/api/activity.js`)
- [x] Pet API connected — getPet, updatePetName, getPetHistory, revivePet (`src/api/pet.js`)
- [ ] Step sync UI — no button/counter on home screen (API exists)
- [ ] Gratitude entry UI — no input on home screen (API exists)
- [ ] Daily note UI — no input on home screen (API exists)
- [ ] Streak display on home screen
- [ ] Pet death + revival UI flow

### DevOps
- [ ] Health check endpoint monitoring

### Design (Figma only)
- [ ] Home screen / pet display design
- [ ] Activity log design
- [ ] Gratitude journal design

---

## ✅ Completed — Sprint 3 — Uppdrag, Butik & Mynt

### Backend ✅
- [x] Update `userModel.ts` — added `goals`, `petAnimal`, `onboardingComplete`, `streak`, `lastStreakDate`
- [x] Update `petModel.ts` — added `mood`, `status`, `healthHitsZero`, `diedAt`, `petAnimal`
- [x] `PATCH /api/users/me/onboarding` — save pet animal + goals (can be updated anytime)
- [x] `data/missions.json` — 50 predefined missions across 10 goal categories
- [x] `GET /api/missions` — mission list filtered by user's goals
- [x] `POST /api/missions/select/:id` — select mission (max 3 active at once)
- [x] `GET /api/missions/my` — user's active missions
- [x] `POST /api/missions/:id/complete` — complete mission → earn XP + coins
- [x] Pet death system — 3-strike logic in `healthDecay.ts`
- [x] `POST /api/pet/revive` — create new pet after death
- [x] `GET /api/pet/history/all` — full pet history including dead pets
- [x] Pet mood — updated daily by `healthDecay.ts`
- [x] `GET /api/users/me/streak` — streak count + last streak date
- [x] Streak logic — increments on any daily activity, resets if day missed
- [x] `data/shopItems.json` — 20 predefined accessories across 4 categories
- [x] `GET /api/shop` — all shop items with owned status
- [x] `POST /api/shop/buy/:itemId` — buy item with coins → equips to pet
- [x] `GET /api/users/me/coins` — current coin balance
- [x] Controllers reorganized into domain subfolders (auth/, users/, pet/, activity/, missions/, shop/)

### Frontend (Fullstack)
- [x] PetSelect screen — pet animal picker at registration
- [x] Missions screen — view active missions, select new missions, complete missions
- [x] Missions API connected — getAvailableMissions, getMyMissions, selectMission, completeMission (`src/api/missions.js`)
- [x] Shop screen — category tabs, item grid, coin display, buy button
- [x] ✅ Shop connected to backend — `getShop()` + `buyItem()` wired up (branch: feature/frontend-improvements)
- [x] ✅ Onboarding goals fixed — PetSelect.jsx now has 2-step flow: pick pet, then multi-select goals (min 1 required). `completeOnboarding` receives real goals array (branch: feature/frontend-improvements)
- [x] ✅ Pet name now saved — `petApi.updatePetName()` called after onboarding with the name the user typed (branch: feature/frontend-improvements)

### DevOps
- [ ] Seed missions.json + shopItems.json on Docker startup

### Design (Figma only)
- [ ] Onboarding screen design (goals step)
- [ ] Missions screen design
- [ ] Shop screen design

---

## ✅ Completed — Sprint 4 — Vänner, Rankning & Notiser

### Backend ✅
- [x] `POST /api/friends/add` — send friend request by username
- [x] `GET /api/friends` — list accepted friends + their pet data
- [x] `GET /api/friends/leaderboard` — friends ranked by XP (includes self)
- [x] `GET /api/friends/requests` — incoming pending friend requests
- [x] `POST /api/friends/:id/accept` — accept a friend request
- [x] `DELETE /api/friends/:id` — remove friend or decline request
- [x] `GET /api/notifications` — latest 50 notifications (read + unread)
- [x] `PATCH /api/notifications/:id/read` — mark one notification as read
- [x] `PATCH /api/notifications/read-all` — mark all notifications as read
- [x] Notification types: friend_request, friend_accepted, pet_warning, pet_died, level_up, streak_milestone
- [x] `GET /api/achievements` — list user's earned achievements
- [x] Achievements: first_mission, missions_30, streak_7, streak_14, streak_30, level_10, first_friend, first_purchase
- [x] Achievement checks hooked into missions, streaks, shop services
- [x] Achievement notification sent when earned

### Frontend (Fullstack)
- [x] ✅ Friends + Leaderboard screen built — two tabs (Vänner / Topplista), add friend, accept requests, friends list with pet images + health, top-3 medals, self highlighted (branch: feature/frontend-improvements)
- [x] ✅ Notifications screen built — load list, tap to mark read, mark all read, back arrow, unread dot + badge (branch: feature/frontend-improvements)
- [ ] Achievements/badges screen — not built
- [x] `src/api/friends.js` — addFriend, getFriends, getLeaderboard, getFriendRequests, acceptRequest, removeOrDecline ✅ (handed off 2026-05-27)
- [x] `src/api/notifications.js` — getNotifications, markRead, markAllRead ✅ (handed off 2026-05-27)
- [x] `src/api/achievements.js` — getAchievements ✅ (handed off 2026-05-27)

### Design (Figma only)
- [ ] Friends + leaderboard design
- [ ] Notifications design
- [ ] Achievements/badges design

---

## ✅ Completed — Sprint 5 — Kalender, HUD & Aktivitetslogg

### Backend ✅
- [x] `GET /api/pet/history` — last 90 days for calendar heatmap (done Sprint 2)
- [x] `GET /api/activity/history` — last 60 days of full activity logs (ISSUE-20 ✅)
- [x] `GET /api/hud` — today's summary (steps, xp, pet health, mood, active missions, streak, coins) (ISSUE-21 ✅)
- [x] Weekly summary cron — every Sunday 20:00 Stockholm, sends `weekly_summary` notification (ISSUE-22 ✅)

### Frontend (Fullstack)
- [ ] Calendar heatmap screen
- [ ] Activity history screen
- [ ] HUD / home dashboard (use GET /api/hud instead of multiple calls)
- [ ] Weekly summary screen

### Design (Figma only)
- [ ] Calendar design
- [ ] HUD design
- [ ] Weekly summary design

---

## ⚠️ Frontend Gaps — Must Fix Before Release

Found in frontend audit 2026-05-26. All backend endpoints exist and are ready. All API client files created 2026-05-27.

| Gap | API client | Status |
|---|---|---|
| Shop not connected to backend | `src/api/shop.js` ✅ | ✅ Fixed — feature/frontend-improvements |
| Goal selection broken | `src/api/users.js` ✅ | ✅ Fixed — feature/frontend-improvements |
| Pet name never saved | `src/api/pet.js` ✅ | ✅ Fixed — feature/frontend-improvements |
| Notification bell did nothing | `src/api/notifications.js` ✅ | ✅ Fixed — feature/frontend-improvements |
| Friends screen missing | `src/api/friends.js` ✅ | ✅ Built — feature/frontend-improvements |
| Notifications screen missing | `src/api/notifications.js` ✅ | ✅ Built — feature/frontend-improvements |
| Missions capped at 6 visible | `src/api/missions.js` ✅ | ✅ Fixed — feature/ISSUE-20-mission-fixes |
| Could complete mission 7x/day | `src/api/missions.js` ✅ | ✅ Fixed — feature/ISSUE-20-mission-fixes |
| Achievements screen missing | `src/api/achievements.js` ✅ | ⏳ Not built yet |
| Gratitude + daily note UI missing | `src/api/activity.js` ✅ | ⏳ Not built yet |
| Steps sync UI missing | `src/api/activity.js` ✅ | ⏳ Not built yet |
| Streak not on home screen | `src/api/users.js` ✅ | ⏳ Not built yet |
| Pet death + revival flow | `src/api/pet.js` ✅ | ⏳ Not built yet |
| HUD not used on Home screen | `src/api/hud.js` ✅ | ⏳ Not built yet |

---

## ✅ Completed — Sprint 6 — Release & Polish

### Backend ✅
- [x] `toObjectId` crash fix — safe ObjectId helper for URL params → returns 400 instead of raw BSONError 500 (affects missionService, notificationService, friendService)
- [x] N+1 query fix in friendService — `getFriends` + `getPendingRequests` refactored from 2N+1 queries to 3 queries using `$in` batch loads + in-memory Maps
- [x] MongoDB indexes added on startup in `db.ts` — 7 collections indexed (users, pets, activity_logs, user_missions, notifications, friendships, user_achievements)
- [x] Auth rate limit tightened — login + register now have 10 req/min per IP (down from global 60 req/min)
- [x] Orphan controller files removed (`getAllPetsHistoryController.ts`, `revivePetController.ts`)
- [x] `activityService.ts` bug fix — was calling `findPetByUserId` instead of `findAlivePetByUserId`
- [x] Snyk scan — 0 security issues

### Frontend API Clients — Handed off to team ✅
- [x] `src/api/shop.js` — getShop(), buyItem(itemId)
- [x] `src/api/hud.js` — getHud()
- [x] `src/api/friends.js` — addFriend, getFriends, getLeaderboard, getFriendRequests, acceptRequest, removeOrDecline
- [x] `src/api/notifications.js` — getNotifications, markRead, markAllRead
- [x] `src/api/achievements.js` — getAchievements
- [x] `src/api/users.js` — added getStreak(), getCoins()
- [x] `src/api/activity.js` — added getActivityHistory()

### DevOps (Kabir / Angelica)
- [ ] Production Docker setup
- [ ] CI/CD pipeline — auto deploy on merge to main
- [ ] Environment secrets management
- [ ] Load testing
- ⚠️ 5 pipeline bugs found and reported to Kabir/Angelica (dockerfile, docker-compose.yaml, .gitlab-ci.yml, kubernetes/deployment.yaml)

### Frontend (Fullstack team)
- [x] ✅ Connect Shop screen to backend — `getShop()` + `buyItem()` wired up (branch: feature/frontend-improvements)
- [x] ✅ Fix onboarding goals — multi-select step in PetSelect.jsx, real goals passed to backend (branch: feature/frontend-improvements)
- [x] ✅ Fix pet name — `updatePetName()` called after onboarding with user's typed name (branch: feature/frontend-improvements)
- [x] ✅ Fix notification bell on Home — `onClick` added, unread count badge shows (branch: feature/frontend-improvements)
- [x] ✅ Build Notifications screen — full read/mark-read/mark-all-read flow (branch: feature/frontend-improvements)
- [x] ✅ Build Friends + Leaderboard screen — add friend, accept requests, list, leaderboard (branch: feature/frontend-improvements)
- [x] ✅ Profile → Friends link added (branch: feature/frontend-improvements)
- [x] ✅ Fix wrong file path comments in 20 backend controller files (branch: feature/frontend-improvements)
- [x] ✅ missionService.ts — changed `findPetByUserId` → `findAlivePetByUserId` (dead pet bug fix)
- [x] ✅ shopService.ts — `buyItem` animal check now uses `pet.petAnimal ?? user.petAnimal` (consistency fix)
- [ ] Build Achievements screen — API client ready
- [ ] Add Gratitude + daily note input to Home screen
- [ ] Add step sync button to Home screen
- [ ] Show streak counter on Home screen
- [ ] Pet death + revival UI flow

---

## ✅ Completed — Post-Sprint — Mission Fixes & Security Audit

> Branch: `feature/ISSUE-20-mission-fixes` — MR open 2026-05-28

### Backend ✅
- [x] Block same-day mission re-completion — `lastProgressDate` field added to `UserMission` model; `completeMission` throws 400 "Du har redan klarat det här uppdraget idag" if already done today
- [x] `updateMissionProgress` repository now writes `lastProgressDate` alongside `progressDays`
- [x] Active mission cap raised from **3 → 5** in `missionService.ts`
- [x] `giveCoins.ts` admin script — email regex validation added before MongoDB query (NoSQL injection fix)
- [x] Snyk code scan — 0 security issues

### Frontend ✅
- [x] `Missions.jsx` — removed `.slice(0, 6)` cap so **all** goal-matching missions are shown
- [x] `Missions.jsx` — active mission limit display raised from 3 → 5 (matches backend)
- [x] `Shop.jsx` — `safeSrc()` helper sanitizes all image `src` attributes — blocks `javascript:` and `data:` protocol XSS (CWE-79 fix)

---

## 🌐 API Reference — Ready to Integrate

All routes below are live and tested. All protected routes require `Authorization: Bearer <accessToken>` header.

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create account + auto-create pet |
| POST | `/api/auth/login` | No | Login → access token + refresh cookie |
| POST | `/api/auth/refresh` | No | Refresh tokens using httpOnly cookie |
| POST | `/api/auth/logout` | Yes | Logout + clear cookie |

### Users
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/users/me` | Yes | Own profile (includes goals, onboardingComplete, streak) |
| PATCH | `/api/users/me` | Yes | Update username / avatarUrl |
| DELETE | `/api/users/me` | Yes | Delete account |
| PATCH | `/api/users/me/onboarding` | Yes | Save pet animal + goals after register (can re-submit to change goals) |
| GET | `/api/users/me/streak` | Yes | Current streak count + last streak date |
| GET | `/api/users/me/coins` | Yes | Current coin balance |

### Pet
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/pet` | Yes | Pet data (level, xp, health, stage, mood, status, healthHitsZero) |
| PATCH | `/api/pet/name` | Yes | Rename pet |
| GET | `/api/pet/history` | Yes | Last 90 days activity for calendar heatmap |
| GET | `/api/pet/history/all` | Yes | All pets (alive + dead) for history view |
| POST | `/api/pet/revive` | Yes | Create new pet after current pet dies — body: `{ name, petAnimal }` |

### Activity
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/activity/today` | Yes | Today's activity log |
| GET | `/api/activity/history` | Yes | Last 60 days of full activity logs |
| POST | `/api/activity/steps` | Yes | Sync steps → earn XP |
| POST | `/api/activity/log` | Yes | Log walk/water/sleep/read → earn XP |
| POST | `/api/activity/gratitude` | Yes | Add gratitude entry (max 3/day, bonus on 3rd) |
| POST | `/api/activity/note` | Yes | Set daily journal note |

### HUD
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/hud` | Yes | Today's home screen summary — pet, activity, active missions, streak, coins |

### Missions
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/missions` | Yes | All missions filtered by user's goals |
| GET | `/api/missions/my` | Yes | User's currently active missions (max 5) |
| POST | `/api/missions/select/:id` | Yes | Select a mission — `:id` is mission id from missions.json |
| POST | `/api/missions/:id/complete` | Yes | Complete a mission → earn XP + coins — `:id` is user_missions document id |

### Shop
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/shop` | Yes | All shop items — includes `owned: true` if already purchased |
| POST | `/api/shop/buy/:itemId` | Yes | Buy item with coins → adds to pet's accessoriesEquipped |

### Friends
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/friends/add` | Yes | Send friend request — body: `{ username }` |
| GET | `/api/friends` | Yes | Accepted friends list + pet data |
| GET | `/api/friends/leaderboard` | Yes | Friends + self ranked by XP |
| GET | `/api/friends/requests` | Yes | Incoming pending friend requests |
| POST | `/api/friends/:id/accept` | Yes | Accept a pending request — `:id` is friendship document id |
| DELETE | `/api/friends/:id` | Yes | Remove friend or decline request |

### Notifications
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/notifications` | Yes | Latest 50 notifications (read + unread) |
| PATCH | `/api/notifications/:id/read` | Yes | Mark one notification as read |
| PATCH | `/api/notifications/read-all` | Yes | Mark all notifications as read |

### Achievements
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/achievements` | Yes | All earned achievements with title, description, earnedAt |

---

## 🌿 Branch Naming Convention

```
feature/ISSUE-{number}-{short-description}

Examples:
feature/ISSUE-11-onboarding
feature/ISSUE-12-missions
feature/ISSUE-13-shop
feature/ISSUE-14-streaks
```

- Always branch off `develop`
- One feature per branch — never add a second feature to an open PR branch
- Merge order: build → commit → push → open MR → merge → new branch

---

## 📏 Architecture Rules

| Layer | Does | Does NOT |
|---|---|---|
| Route | Map URL to controller | Contain logic |
| Controller | Read request, validate, call service, send response | Talk to database |
| Service | Business logic | Read request or send response |
| Repository | Database queries only | Contain business logic |
| Model | Define data shape | Contain functions |
| Schema | Validate incoming data (Zod) | Contain types |
| Type | TypeScript types (compile-time) | Run at runtime |
| Middleware | Guard routes (auth checks) | Contain business logic |
| Plugin | Extend Fastify (db, cookies, errors) | Contain route logic |

---

## 🛠️ Tech Stack

- **Runtime:** Bun
- **Framework:** Fastify
- **Language:** TypeScript (strict mode)
- **Database:** MongoDB Atlas (plain driver, no Mongoose)
- **Auth:** JWT (access 15min + refresh 7d httpOnly cookie)
- **Validation:** Zod v4
- **Password hashing:** bcrypt (10 rounds)
- **Cron jobs:** node-cron (Stockholm timezone)

---

## 🚀 How to Run

```bash
cd backend
bun install
bun run dev
```

---

## 📌 Notes for Developers

- Always follow layered architecture — route → controller → service → repository
- One file per route handler (controller), one file per collection (repository)
- Validate ALL request bodies with Zod schemas before processing
- Use `AppError(message, statusCode)` to throw errors — the error handler catches them
- Protected routes use `{ preHandler: server.authenticate }` — sets `request.userId`
- Refresh token is httpOnly cookie on path `/api/auth` — JavaScript cannot read it
- `.env` must be in `backend/` root — Bun loads it from the working directory
- Cron jobs run in Stockholm timezone (`Europe/Stockholm`)
