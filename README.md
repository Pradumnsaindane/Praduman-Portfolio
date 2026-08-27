# Pradumn Saindane — Portfolio

A full-stack **MERN** portfolio: a React front-end backed by an Express + MongoDB API with a private admin dashboard. Projects and contact messages live in the database, so the site is editable without touching code — sign in at `/admin`, add a project, and it appears on the home page.

- **Client** — React 18 + Vite, React Router, a hand-built design system (no UI kit).
- **Server** — Express 4, MongoDB (Mongoose), JWT auth, rate limiting, Helmet.
- **Design** — "Engineer's Ledger": warm stone canvas, pine-charcoal ink, a single verdigris accent; Fraunces / Hanken Grotesk / JetBrains Mono. Light + dark.

---

## Table of contents

1. [Architecture](#architecture)
2. [Project structure](#project-structure)
3. [Local development](#local-development)
4. [Environment variables](#environment-variables)
5. [Seeding the database](#seeding-the-database)
6. [API reference](#api-reference)
7. [Deploying](#deploying-vercel--render--atlas)
8. [Editing your content](#editing-your-content)

---

## Architecture

```
┌────────────────────┐        HTTPS         ┌─────────────────────┐        ┌──────────────┐
│   React client     │  ── /api/* ─────────▶ │   Express API       │  ────▶ │  MongoDB     │
│   (Vercel)         │ ◀───── JSON ───────── │   (Render)          │ ◀────  │  Atlas       │
│                    │                       │                     │        │              │
│  • Landing page    │                       │  • JWT auth         │        │  users       │
│  • /admin dashboard│                       │  • Projects CRUD    │        │  projects    │
│                    │                       │  • Messages inbox   │        │  messages    │
└────────────────────┘                       └─────────────────────┘        └──────────────┘
```

The public page fetches published projects from `GET /api/projects`. The contact form posts to `POST /api/messages`. The `/admin` area authenticates with a JWT (stored in `localStorage`) and can create/edit/delete projects and read/delete messages.

---

## Project structure

```
pradumn-portfolio/
├── package.json              # monorepo scripts (dev, seed, build, start)
├── docker-compose.yml        # one-command local run (mongo + api + web)
├── render.yaml               # Render blueprint for the API
├── .editorconfig             # IDE-neutral formatting
├── client/                   # React + Vite front-end
│   ├── vercel.json           # SPA rewrites (so /admin refreshes work)
│   ├── vite.config.js        # dev proxy /api → :5000
│   ├── .env.example
│   └── src/
│       ├── api/client.js         # axios instance + JWT interceptors
│       ├── context/AuthContext   # auth state (login/logout/me)
│       ├── hooks/                # useTheme, useReveal
│       ├── data/site.js          # ← YOUR editable content
│       ├── components/           # Navbar, Hero, Work, Contact, …
│       ├── pages/                # Home, Login
│       ├── pages/admin/          # AdminLayout, Overview, ProjectsPanel, MessagesPanel
│       └── styles/               # index.css (design system) + admin.css
└── server/                   # Express + MongoDB API
    ├── server.js             # entry point
    ├── .env.example
    └── src/
        ├── app.js            # middleware + route mounting
        ├── config/db.js      # Mongoose connection
        ├── models/           # User, Project, Message
        ├── controllers/      # auth, project, message logic
        ├── routes/           # /auth, /projects, /messages
        ├── middleware/       # auth (protect), error handler
        ├── utils/            # generateToken
        └── seed.js           # creates admin + sample projects
```

---

## Local development

Two ways to run it — pick whichever suits you. **Option A** needs nothing but Docker; **Option B** is a plain Node setup.

### Option A — Docker (one command, zero setup)

**Prerequisite:** [Docker Desktop](https://www.docker.com/products/docker-desktop/).

```bash
docker compose up
```

That starts MongoDB, the API, and the web dev server together, and seeds an admin + sample projects automatically. Then open:

- Site: **http://localhost:5173**
- API health: **http://localhost:5000/api/health**
- Admin: **http://localhost:5173/admin** → `admin@example.com` / `changeme123`

Stop with `Ctrl+C`; `docker compose down` removes the containers (your data persists in the `mongo-data` volume — `docker compose down -v` wipes that too). The seeded credentials/secrets in `docker-compose.yml` are **for local dev only**.

### Option B — Node + your own MongoDB

**Prerequisites:** Node 18+ and a MongoDB connection string (a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster works, or a local `mongod`).

```bash
# 1. Install everything (root + client + server)
npm run install:all

# 2. Create env files from the examples
cp server/.env.example server/.env
cp client/.env.example client/.env
#    → open server/.env and fill in MONGO_URI, JWT_SECRET, and the ADMIN_* values

# 3. Seed the admin account + sample projects
npm run seed

# 4. Run client + server together
npm run dev
```

- Client: **http://localhost:5173**
- API: **http://localhost:5000** (health check at `/api/health`)
- Admin: **http://localhost:5173/admin** → sign in with your `ADMIN_EMAIL` / `ADMIN_PASSWORD`

In this mode Vite proxies `/api` to the server, so no CORS setup is needed locally.

### Opening in an IDE

It's a standard Node project — open the `pradumn-portfolio` folder in VS Code, WebStorm, or any editor. There's no IDE-specific config to worry about; an `.editorconfig` is included so indentation stays consistent everywhere.

---

## Environment variables

### `server/.env`

| Variable         | Required | Description |
|------------------|:--------:|-------------|
| `PORT`           |          | API port (default `5000`; Render sets this automatically). |
| `NODE_ENV`       |          | `development` or `production`. |
| `MONGO_URI`      | ✅       | MongoDB connection string. |
| `JWT_SECRET`     | ✅       | Long random string used to sign tokens. |
| `JWT_EXPIRES_IN` |          | Token lifetime (default `7d`). |
| `ADMIN_NAME`     | ✅       | Seeded admin's display name. |
| `ADMIN_EMAIL`    | ✅       | Seeded admin's login email. |
| `ADMIN_PASSWORD` | ✅       | Seeded admin's password (hashed on save). |
| `CLIENT_URL`     | ✅ (prod)| Comma-separated allowed origins for CORS. |

Generate a strong `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### `client/.env`

| Variable       | Description |
|----------------|-------------|
| `VITE_API_URL` | Leave **blank** in dev. In production set to your Render URL **including** `/api`, e.g. `https://pradumn-portfolio-api.onrender.com/api`. |

---

## Seeding the database

```bash
npm run seed
```

This creates the admin user from your `ADMIN_*` env values (skipped if it already exists) and inserts three sample projects if the `projects` collection is empty. Safe to re-run — it won't duplicate.

---

## API reference

Base path: `/api`. Protected routes require `Authorization: Bearer <token>`.

### Auth
| Method | Route          | Access  | Body / Notes |
|--------|----------------|---------|--------------|
| POST   | `/auth/login`  | Public  | `{ email, password }` → `{ token, user }`. Rate-limited. |
| GET    | `/auth/me`     | Private | Returns the current `{ user }`. |

### Projects
| Method | Route            | Access  | Notes |
|--------|------------------|---------|-------|
| GET    | `/projects`      | Public  | All projects, sorted (featured → order → newest). |
| GET    | `/projects/:id`  | Public  | Fetch by id **or** slug. |
| POST   | `/projects`      | Private | Create. `{ title, summary, … }` |
| PUT    | `/projects/:id`  | Private | Update. |
| DELETE | `/projects/:id`  | Private | Delete. |

### Messages
| Method | Route                 | Access  | Notes |
|--------|-----------------------|---------|-------|
| POST   | `/messages`           | Public  | `{ name, email, message }`. Rate-limited. |
| GET    | `/messages`           | Private | `{ count, unread, messages }`. |
| PATCH  | `/messages/:id/read`  | Private | Toggle read/unread. |
| DELETE | `/messages/:id`       | Private | Delete. |

---

## Deploying (Vercel + Render + Atlas)

> This app can't run on GitHub Pages — that's static-only, and this has a live API and database. The split below keeps everything on free tiers.

### 1 — Database: MongoDB Atlas

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. **Database Access** → add a user with a password.
3. **Network Access** → allow `0.0.0.0/0` (or Render's IPs).
4. **Connect → Drivers** → copy the connection string; that's your `MONGO_URI`.

### 2 — API: Render

Render reads the included `render.yaml` blueprint.

1. Push this repo to GitHub.
2. On [Render](https://render.com): **New → Blueprint**, select the repo.
3. When prompted, fill in the `sync: false` env vars: `MONGO_URI`, `CLIENT_URL` (your Vercel URL — you'll have it after step 3, so you can paste a placeholder now and update later), `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`. `JWT_SECRET` is generated for you.
4. Deploy. Note the service URL, e.g. `https://pradumn-portfolio-api.onrender.com`.
5. **Seed once:** in the Render shell (or locally, pointed at the same `MONGO_URI`) run `npm run seed`.

> Prefer manual setup? Create a **Web Service**, root directory `server`, build `npm install`, start `node server.js`, health-check path `/api/health`, and add the env vars yourself.

### 3 — Client: Vercel

1. On [Vercel](https://vercel.com): **New Project**, import the repo.
2. Set **Root Directory** to `client`. (Framework: Vite — auto-detected. `vercel.json` handles SPA routing.)
3. Add an environment variable: `VITE_API_URL = https://<your-render-url>/api`.
4. Deploy. Copy the resulting URL, e.g. `https://pradumn-portfolio.vercel.app`.

### 4 — Wire CORS

Back on Render, set `CLIENT_URL` to your Vercel URL (comma-separate if you have several) and redeploy. Done — the front-end can now reach the API.

---

## Editing your content

- **Text, bio, skills, experience, links:** edit `client/src/data/site.js` — it's commented and the single source of truth for static copy.
- **Projects:** manage them from `/admin` (they're stored in the database). No redeploy needed.
- **Messages:** contact-form submissions land in `/admin → Messages`.
- **Colors & type:** the design tokens live at the top of `client/src/styles/index.css` under `:root` (light) and `[data-theme='dark']`.

---

Built with the MERN stack. Set in Fraunces, Hanken Grotesk, and JetBrains Mono.
