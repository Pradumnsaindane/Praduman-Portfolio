# Pradumn Bharat Saindane — Portfolio (frontend + API backend)

This is the same odometer portfolio, split into a real client/server app:

- **`backend/`** — a small Node.js API server (no `npm install` required; it
  uses only the built-in `http`/`fs` modules). It serves the frontend as
  static files and exposes the content and contact-form endpoints below.
- **`frontend/`** — `index.html`, `style.css`, `app.js`. On load, `app.js`
  fetches `/api/content` and builds the odometer, scenes, project list, stack
  list and contact links from that response — nothing is hardcoded in the
  page anymore.

## Run it

```bash
cd backend
node server.js
```

Then open **http://localhost:3000**. No build step, no dependencies to
install. (`npm start` / `npm run dev` also work if you prefer going through
`package.json`.)

## Deploy to Vercel

The root `vercel.json` serves the frontend from `frontend/` and routes API
requests through a Vercel Function. Link this repository to a Vercel project
or run `vercel` from the repository root.

The contact form is intentionally unavailable on Vercel until persistent
storage is configured: Vercel Functions do not provide durable local file
storage. The form returns an explicit error and the email link remains
available. Locally, valid submissions continue to be stored in
`backend/data/messages.json`.

## API

| Method | Path             | Description                                      |
|--------|------------------|---------------------------------------------------|
| GET    | `/api/health`    | Liveness check                                     |
| GET    | `/api/content`   | Everything the frontend needs: profile, scenes, projects, stack, experience |
| GET    | `/api/scenes`    | Just the 8 odometer scenes                         |
| GET    | `/api/projects`  | Just the project list                              |
| GET    | `/api/stack`     | Just the technical stack list                      |
| GET    | `/api/experience`| Just the experience entries (empty until you add some) |
| POST   | `/api/contact`   | `{name, email, message}` → validates server-side, stores to `backend/data/messages.json`, returns `201 {ok:true,id}` or `422 {ok:false,errors:[...]}` |

## Editing content

Everything the page shows — your bio, projects, stack, scene captions,
résumé/LinkedIn links — lives in **`backend/data/content.json`**. Edit that
file and refresh the page; there's nothing to rebuild.

```json
{
  "profile": { "resumeUrl": "", "linkedinUrl": "", ... },
  "scenes": [...],
  "projects": [...],
  "stack": [...],
  "experience": []
}
```

- `profile.resumeUrl` and `profile.linkedinUrl` are intentionally empty. Fill
  them in with your real links before deploying — the résumé card and the
  Contact section both handle the empty case gracefully (a toast message /
  omitting the link) rather than opening a broken URL.
- `experience` is an empty array. Add objects like
  `{"role": "...", "org": "...", "period": "...", "note": "..."}` and they'll
  appear in the Experience section automatically.

## Contact form

The Contact section has a real form (name, email, message) that `POST`s to
`/api/contact`. The server validates the fields, stores each submission in
`backend/data/messages.json` (created on first submission) and returns
`201` on success. **No email provider is wired up** — there's a comment in
`backend/server.js` marking exactly where to add SendGrid/SES/Nodemailer/etc.
when you have real credentials. Nothing fabricates a "sent" confirmation;
messages are durably stored and validated, but not emailed anywhere yet.

## What changed from the single-file version

- All data moved from inline `<script>` constants into
  `backend/data/content.json`, served via `GET /api/content`.
- The page shows a loading state while it fetches, and a retry button if the
  API call fails (tested by aborting the request in a browser automation run).
- The static "mailto" Contact section gained a real, server-validated form.
- CSS and JS were split out of the HTML file into `style.css` and `app.js`.
- All the original odometer mechanics (drum rendering, scene cycling, the
  PULL knob, the résumé card, the custom cursor, the mobile menu, reduced-
  motion support) are unchanged — only where the data comes from changed.

## Production notes

This backend is intentionally minimal (file-based storage, no auth, no rate
limiting, no outbound email) so it runs with zero setup. Before deploying for
real:

- Swap `backend/data/*.json` for a real database.
- Add rate limiting / spam protection to `POST /api/contact`.
- Wire an email or notification provider so you actually see new messages.
- Put the server behind HTTPS (a reverse proxy like Nginx, or a platform
  that terminates TLS for you).
