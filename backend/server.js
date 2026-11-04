/**
 * Pradumn Bharat Saindane — portfolio API + static server.
 *
 * Deliberately dependency-free (no Express, no npm install required) so
 * `node server.js` works the moment you clone the project. Swap in Express,
 * a real database, and an email provider later without changing the routes
 * the frontend already calls:
 *
 *   GET  /api/health       -> { status: "ok" }
 *   GET  /api/content      -> { profile, scenes, projects, stack, experience }
 *   POST /api/contact      -> { ok: true }            (validates + appends to data/messages.json)
 *   *    /                 -> serves ../frontend as static files
 */
"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = Number(process.env.PORT) || 3000;
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const CONTENT_FILE = path.join(DATA_DIR, "content.json");
const MESSAGES_FILE = path.join(DATA_DIR, "messages.json");
const FRONTEND_DIR = path.join(ROOT, "..", "frontend");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

/* ---------- tiny JSON helpers (file-based storage; swap for a real DB later) ---------- */
function readJSON(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); }
  catch (e) { return fallback; }
}
function writeJSON(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}
function getContent() {
  return readJSON(CONTENT_FILE, { profile: {}, scenes: [], projects: [], stack: [], experience: [] });
}

/* ---------- request body parsing ---------- */
function readBody(req, limit = 1e6) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (c) => {
      size += c.length;
      if (size > limit) { reject(Object.assign(new Error("Payload too large"), { statusCode: 413 })); req.destroy(); return; }
      chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

/* ---------- response helpers ---------- */
function sendJSON(res, status, body) {
  const json = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(json),
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(json);
}

function serveStatic(req, res, pathname) {
  let rel = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.normalize(path.join(FRONTEND_DIR, rel));
  // Prevent path traversal outside the frontend directory.
  if (!filePath.startsWith(FRONTEND_DIR)) { res.writeHead(403); return res.end("Forbidden"); }
  fs.readFile(filePath, (err, buf) => {
    if (err) {
      if (err.code === "ENOENT") { res.writeHead(404, { "Content-Type": "text/plain" }); return res.end("Not found"); }
      res.writeHead(500); return res.end("Server error");
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(buf);
  });
}

/* ---------- validation ---------- */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function validateContact(body) {
  const errors = [];
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const message = String(body.message || "").trim();
  if (name.length < 2 || name.length > 120) errors.push("Name must be 2–120 characters.");
  if (!EMAIL_RE.test(email)) errors.push("Enter a valid email address.");
  if (message.length < 10 || message.length > 4000) errors.push("Message must be 10–4000 characters.");
  return { errors, value: { name, email, message } };
}

/* ---------- routes ---------- */
const routes = [
  { method: "GET", pattern: /^\/api\/health$/, handler: (req, res) => sendJSON(res, 200, { status: "ok", time: new Date().toISOString() }) },

  { method: "GET", pattern: /^\/api\/content$/, handler: (req, res) => sendJSON(res, 200, getContent()) },
  { method: "GET", pattern: /^\/api\/scenes$/, handler: (req, res) => sendJSON(res, 200, getContent().scenes) },
  { method: "GET", pattern: /^\/api\/projects$/, handler: (req, res) => sendJSON(res, 200, getContent().projects) },
  { method: "GET", pattern: /^\/api\/stack$/, handler: (req, res) => sendJSON(res, 200, getContent().stack) },
  { method: "GET", pattern: /^\/api\/experience$/, handler: (req, res) => sendJSON(res, 200, getContent().experience) },

  {
    method: "POST",
    pattern: /^\/api\/contact$/,
    handler: async (req, res) => {
      let body;
      try { body = JSON.parse((await readBody(req)) || "{}"); }
      catch (e) { return sendJSON(res, 400, { ok: false, errors: ["Request body must be valid JSON."] }); }

      const { errors, value } = validateContact(body);
      if (errors.length) return sendJSON(res, 422, { ok: false, errors });

      if (process.env.VERCEL) {
        return sendJSON(res, 503, {
          ok: false,
          error: "Contact form storage is not configured for this deployment. Please use the email link instead.",
        });
      }

      const entry = {
        id: crypto.randomUUID(),
        ...value,
        receivedAt: new Date().toISOString(),
        ip: (req.socket.remoteAddress || "").replace("::ffff:", ""),
      };
      const messages = readJSON(MESSAGES_FILE, []);
      messages.push(entry);
      writeJSON(MESSAGES_FILE, messages);

      // No outbound email provider is configured in this starter — the message
      // is durably stored in data/messages.json. Wire SendGrid/SES/etc. here
      // when you have real credentials; never fabricate a "sent" response.
      sendJSON(res, 201, { ok: true, id: entry.id });
    },
  },
];

async function handleRequest(req, res) {
  const { pathname } = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === "OPTIONS" && pathname.startsWith("/api/")) {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    return res.end();
  }

  const route = routes.find((r) => r.method === req.method && r.pattern.test(pathname));
  if (route) {
    try { await route.handler(req, res); }
    catch (err) { sendJSON(res, err.statusCode || 500, { ok: false, error: "Internal server error" }); }
    return;
  }

  if (pathname.startsWith("/api/")) return sendJSON(res, 404, { ok: false, error: "Unknown endpoint" });

  if (req.method === "GET" || req.method === "HEAD") return serveStatic(req, res, pathname);

  res.writeHead(405, { "Content-Type": "text/plain" });
  res.end("Method not allowed");
}

if (require.main === module) {
  const server = http.createServer(handleRequest);
  server.listen(PORT, () => {
    console.log(`Pradumn portfolio API + site running at http://localhost:${PORT}`);
    console.log(`  GET  /api/content`);
    console.log(`  POST /api/contact`);
  });
}

module.exports = handleRequest;
