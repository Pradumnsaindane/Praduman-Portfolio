"use strict";
/**
 * This file no longer hardcodes the profile, projects, stack, experience or
 * scene data — all of that now lives server-side in backend/data/content.json
 * and is fetched once from GET /api/content when the page loads. Everything
 * below `boot()` is unchanged from the static version, just reorganised to
 * run after the fetch resolves instead of at parse time.
 */
const CYCLE_MS = 3800;
const CHARS = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.:/+!?-&";
const DIGITS = "0123456789", N_DRUMS = 9;
const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (s, r = document) => r.querySelector(s);
const mod = (a, n) => ((a % n) + n) % n;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

/* ============ SOUND ============ */
const Sound = {
  on: false, ctx: null,
  click() {
    if (!this.on) return;
    const c = this.ctx, n = c.sampleRate * .03, b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    f.type = "bandpass"; f.frequency.value = 1800; g.gain.value = .25;
    s.buffer = b; s.connect(f).connect(g).connect(c.destination); s.start();
  },
};

/* ============ TWEEN ENGINE ============ */
const tweens = new Set(); let running = false;
const backOut = t => { const c = 1.35, u = t - 1; return 1 + (c + 1) * u * u * u + c * u * u; };
function addTween(tw) { tw.start = performance.now(); tweens.add(tw); if (!running) { running = true; requestAnimationFrame(tick); } }
function tick() {
  const now = performance.now();
  for (const tw of tweens) {
    const t = (now - tw.start - tw.delay) / (tw.dur * 1000);
    if (t < 0) continue;
    if (t >= 1) { tw.drum.render(tw.to); tweens.delete(tw); if (tw.sound) Sound.click(); tw.end && tw.end(); }
    else tw.drum.render(tw.from + (tw.to - tw.from) * (tw.ease || backOut)(t));
  }
  if (tweens.size) requestAnimationFrame(tick); else running = false;
}

/* ============ DRUM (projected cylinder, 6 faces) ============ */
const STEP = 34 * Math.PI / 180, R_K = 1 / (2 * Math.sin(17 * Math.PI / 180));
class Drum {
  constructor(el, chars) {
    this.el = el; this.chars = chars; this.pos = 0; this.target = 0; this.tw = null;
    this.faces = Array.from({ length: 6 }, () => { const f = document.createElement("div"); f.className = "face"; el.appendChild(f); return f; });
    this.measure(); this.render(0);
  }
  measure() { this.h = this.el.clientHeight / 1.62; this.R = this.h * R_K; }
  render(pos) {
    this.pos = pos; const b = Math.floor(pos), fr = pos - b, n = this.chars.length;
    for (let i = 0; i < 6; i++) {
      const o = i - 2, a = (o - fr) * STEP, f = this.faces[i];
      if (Math.abs(a) >= Math.PI / 2) { f.style.visibility = "hidden"; continue; }
      f.style.visibility = "visible";
      f.style.transform = `translateY(${this.R * Math.sin(a)}px) scaleY(${Math.cos(a)})`;
      const ch = this.chars[mod(b + o, n)]; if (f.textContent !== ch) f.textContent = ch;
    }
  }
  /* roll forward to char index `idx`; extra = additional full turns */
  to(idx, { extra = 0, delay = 0, sound = true } = {}) {
    const n = this.chars.length, d = mod(idx - this.target, n) + extra * n;
    if (!d) return; if (this.tw) tweens.delete(this.tw);
    const from = this.pos, to = this.target + d; this.target = to;
    if (REDUCED) { this.render(to); return; }
    this.tw = { drum: this, from, to, delay, dur: Math.min(2.2, .6 + .022 * d), sound };
    addTween(this.tw);
  }
  flick() {
    if (REDUCED || tweens.has(this.tw)) return; const p = this.pos;
    addTween({
      drum: this, from: p, to: p + .3, delay: 0, dur: .14, ease: t => 1 - (1 - t) * (1 - t), sound: false,
      end: () => addTween({ drum: this, from: p + .3, to: p, delay: 0, dur: .5, sound: false }),
    });
  }
}

const toast = msg => {
  const t = $("#toast"); t.textContent = msg; t.classList.add("on");
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("on"), 3200);
};

/* ============ API ============ */
async function fetchContent() {
  const res = await fetch("/api/content", { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`GET /api/content failed (${res.status})`);
  const data = await res.json();
  if (!Array.isArray(data.scenes) || !data.scenes.length) throw new Error("API returned no scenes");
  return data;
}

async function submitContact(payload) {
  const res = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  let body = {};
  try { body = await res.json(); } catch (e) { /* non-JSON error page */ }
  if (!res.ok) throw new Error((body.errors && body.errors.join(" ")) || body.error || `Request failed (${res.status})`);
  return body;
}

/* ============ BOOT ============ */
async function boot() {
  const statusEl = $("#boot-status"), msgEl = $("#boot-msg");
  let content;
  try {
    content = await fetchContent();
  } catch (err) {
    statusEl.classList.add("err");
    statusEl.innerHTML = `<span>Could not load the portfolio content from the API.<br>${esc(err.message)}</span>`;
    const retry = document.createElement("button");
    retry.textContent = "Retry";
    retry.addEventListener("click", () => { statusEl.classList.remove("err"); statusEl.innerHTML = ""; statusEl.appendChild(msgEl); boot(); });
    statusEl.appendChild(retry);
    return;
  }

  const { profile, scenes: SCENES, projects: PROJECTS, stack: STACK, experience: EXPERIENCE } = content;
  const RESUME_URL = profile.resumeUrl || "";
  const LINKEDIN_URL = profile.linkedinUrl || "";

  document.body.classList.remove("loading");
  statusEl.hidden = true;

  /* ---- build drums ---- */
  const drums = [];
  for (let i = 0; i < N_DRUMS; i++) {
    const el = document.createElement("div"); el.className = "drum"; $("#win").appendChild(el);
    const d = new Drum(el, CHARS); drums.push(d); el.addEventListener("mouseenter", () => d.flick());
  }
  const clockDrums = [];
  for (let i = 0; i < 6; i++) {
    if (i && i % 2 === 0) { const s = document.createElement("i"); s.textContent = ":"; $("#clock").appendChild(s); }
    const el = document.createElement("div"); el.className = "drum"; $("#clock").appendChild(el); clockDrums.push(new Drum(el, DIGITS));
  }
  const segs = SCENES.map(() => { const b = document.createElement("b"); $("#segs").appendChild(b); return b; });
  $("#segs").style.setProperty("--cyc", CYCLE_MS + "ms");
  const measureAll = () => [...drums, ...clockDrums].forEach(d => { d.measure(); d.render(d.pos); });
  addEventListener("resize", measureAll);
  document.fonts && document.fonts.ready.then(measureAll);

  /* ---- clock ---- */
  function updateClock(first) {
    const t = new Date(), s = [t.getHours(), t.getMinutes(), t.getSeconds()].flatMap(v => [Math.floor(v / 10), v % 10]);
    clockDrums.forEach((d, i) => { if (first) { d.target = s[i]; d.render(s[i]); } else d.to(s[i], { sound: false }); });
  }
  updateClock(true); setInterval(updateClock, 1000);

  /* ---- scenes ---- */
  let scene = -1, timer = null, lastWheel = 0, heroOn = true; /* heroOn: pause auto-cycle while the hero is off-screen */
  function cycle() { if (!heroOn) { timer = setTimeout(cycle, 400); return; } showScene(scene + 1, { extra: Math.random() < .3 ? 1 : 0 }); }
  const orders = [
    () => [...Array(N_DRUMS).keys()],
    () => [...Array(N_DRUMS).keys()].reverse(),
    () => [...Array(N_DRUMS).keys()].sort((a, b) => Math.abs(a - 4) - Math.abs(b - 4)),
  ];
  function setCaption(text) {
    const items = []; let glue = false; /* glue: previous segment ended without a space, so punctuation stays on that word */
    text.split("*").forEach((seg, k) => seg.split(" ").forEach((t, j) => {
      if (!t) { glue = false; return; }
      const piece = k % 2 ? `<i>${esc(t)}</i>` : esc(t);
      if (glue && j === 0 && items.length) items[items.length - 1].push(piece); else items.push([piece]);
      glue = true;
    }));
    $("#caption").innerHTML = items.map((it, n) => `<span class="w"><span style="--i:${n}">${it.join("")}</span></span>`).join(" ");
  }
  function showScene(i, { extra = 0, perDrum = null, order = null } = {}) {
    scene = mod(i, SCENES.length);
    const label = SCENES[scene][0], pad = Math.floor((N_DRUMS - label.length) / 2);
    const ord = order || orders[scene % 3]();
    ord.forEach((di, rank) => {
      const ch = label[di - pad] || " ";
      drums[di].to(CHARS.indexOf(ch), { extra: perDrum ? perDrum(di) : extra, delay: (perDrum ? 120 : 75) * rank });
    });
    setCaption(SCENES[scene][1]);
    $("#plate").innerHTML = `<span>NO. ${String(scene + 1).padStart(3, "0")} / ${String(SCENES.length).padStart(3, "0")}</span>`;
    segs.forEach((b, k) => { b.className = k < scene ? "done" : ""; });
    void $("#segs").offsetWidth; segs[scene].className = "on";
    clearTimeout(timer); timer = setTimeout(cycle, CYCLE_MS);
  }
  const next = () => showScene(scene + 1, { extra: 1 });
  function pull() {
    let k; do { k = Math.floor(Math.random() * SCENES.length); } while (k === scene);
    showScene(k, { perDrum: () => 1 + Math.floor(Math.random() * 3) });
  }

  /* ---- interactions ---- */
  const counter = $("#win");
  counter.addEventListener("click", e => { if (!e.target.closest("#card")) next(); });
  counter.addEventListener("keydown", e => { if ((e.key === "Enter" || e.key === " ") && e.target === counter) { e.preventDefault(); if (!e.repeat) next(); } });
  counter.addEventListener("wheel", e => {
    e.preventDefault(); const n = performance.now(); if (n - lastWheel < 650) return; lastWheel = n;
    showScene(scene + (e.deltaY > 0 ? 1 : -1), { extra: 1 });
  }, { passive: false });
  $("#knob").addEventListener("click", pull);

  $("#card").addEventListener("click", e => {
    e.stopPropagation(); const c = e.currentTarget; c.classList.add("out");
    setTimeout(() => c.classList.remove("out"), 900);
    if (RESUME_URL) window.open(RESUME_URL, "_blank", "noopener"); else toast("Résumé link not set — set profile.resumeUrl in backend/data/content.json.");
  });

  $("#sound").addEventListener("click", e => {
    const b = e.currentTarget; Sound.on = !Sound.on; b.setAttribute("aria-pressed", Sound.on);
    if (Sound.on) { Sound.ctx = Sound.ctx || new (window.AudioContext || window.webkitAudioContext)(); Sound.ctx.resume(); }
  });

  /* mouse: glow, tilt, light, cursor */
  const cur = $("#cur"); let cx = 0, cy = 0, tx = 0, ty = 0, curRaf = 0;
  function curLoop() {
    cx += (tx - cx) * .2; cy += (ty - cy) * .2; cur.style.transform = `translate(${cx}px,${cy}px)`;
    curRaf = (Math.abs(tx - cx) > .1 || Math.abs(ty - cy) > .1) ? requestAnimationFrame(curLoop) : 0;
  }
  if (matchMedia("(hover:hover)").matches) {
    addEventListener("mousemove", e => {
      tx = e.clientX; ty = e.clientY;
      if (!cur.classList.contains("show")) { cx = tx; cy = ty; cur.classList.add("show"); }
      if (!curRaf) curRaf = requestAnimationFrame(curLoop);
      const nx = e.clientX / innerWidth - .5, ny = e.clientY / innerHeight - .5, s = document.documentElement.style;
      s.setProperty("--mx", e.clientX + "px"); s.setProperty("--my", e.clientY + "px");
      if (!REDUCED) { s.setProperty("--rx", (-ny * 8) + "deg"); s.setProperty("--ry", (nx * 10) + "deg"); s.setProperty("--sx", (nx * 14) + "px"); s.setProperty("--sy", (ny * 14) + "px"); }
      const t = e.target.closest("[data-cur]"); cur.classList.toggle("big", !!t); if (t) cur.textContent = t.dataset.cur; else cur.textContent = "";
    });
  }

  /* ---- sections, populated from the API payload ---- */
  const rows = (sel, items) => { $(sel).innerHTML = items.map(([a, b, c]) => `<div class="row"><h3>${esc(a)}</h3><div><p>${esc(b)}</p>${c ? `<small>${esc(c)}</small>` : ""}</div></div>`).join(""); };
  rows("#work-list", PROJECTS);
  rows("#stack-list", STACK);
  if (EXPERIENCE.length) rows("#exp-list", EXPERIENCE.map(x => [`${x.role}, ${x.org}`, x.note, x.period]));
  else $("#exp-list").innerHTML = `<p class="lead">No formal roles are listed yet. The projects under Work show what I build.</p>`;
  $(".lead", $("#about")) && ($(".lead", $("#about")).textContent = profile.about || $(".lead", $("#about")).textContent);
  $("#mail").href = "mailto:" + profile.email; $("#mail").textContent = profile.email;
  $("#elsewhere").innerHTML = profile.links.concat(LINKEDIN_URL ? [["LinkedIn", LINKEDIN_URL]] : [])
    .map(l => `<a href="${esc(l[1])}" target="_blank" rel="noopener">${esc(l[0])}</a>`).join("");

  /* ---- contact form -> POST /api/contact ---- */
  const cform = $("#cform"), cerr = $("#cf-err"), csubmit = $("#cf-submit");
  cform.addEventListener("submit", async e => {
    e.preventDefault();
    cerr.textContent = ""; csubmit.disabled = true; csubmit.textContent = "Sending…";
    try {
      await submitContact({ name: $("#cf-name").value, email: $("#cf-email").value, message: $("#cf-message").value });
      cform.reset(); toast("Message sent — thanks for reaching out.");
    } catch (err) {
      cerr.textContent = err.message;
    } finally {
      csubmit.disabled = false; csubmit.textContent = "Send message";
    }
  });

  /* ---- nav: active section (IntersectionObserver) ---- */
  const navEl = $("nav"), navLinks = [...document.querySelectorAll(".links a, #mnav a")];
  function setActive(id) {
    navLinks.forEach(a => a.getAttribute("href") === "#" + id ? a.setAttribute("aria-current", "location") : a.removeAttribute("aria-current"));
    navEl.classList.toggle("stuck", id !== "hero");
  }
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setActive(e.target.id); }), { rootMargin: "-45% 0px -50% 0px" });
  ["hero", "work", "about", "stack", "experience", "contact"].forEach(id => io.observe(document.getElementById(id)));
  new IntersectionObserver(es => { heroOn = es[0].isIntersecting; }).observe(document.getElementById("hero"));

  /* ---- nav: mobile menu ---- */
  const menu = $("#menu"), mnav = $("#mnav");
  function setMenu(open) {
    mnav.hidden = !open; menu.setAttribute("aria-expanded", open); menu.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.documentElement.style.overflow = open ? "hidden" : "";
    if (open) mnav.querySelector("a").focus();
  }
  menu.addEventListener("click", () => setMenu(mnav.hidden));
  mnav.addEventListener("click", e => { if (e.target.closest("a")) setMenu(false); });
  addEventListener("keydown", e => {
    if (mnav.hidden) return;
    if (e.key === "Escape") { setMenu(false); menu.focus(); }
    else if (e.key === "Tab") { const f = [menu, ...mnav.querySelectorAll("a")], i = f.indexOf(document.activeElement); e.preventDefault(); f[i < 0 ? 0 : mod(i + (e.shiftKey ? -1 : 1), f.length)].focus(); }
  });
  matchMedia("(min-width:901px)").addEventListener("change", e => { if (e.matches && !mnav.hidden) setMenu(false); });

  /* ---- initial scramble -> 2 turns -> scene 1 ---- */
  drums.forEach((d, i) => d.to(Math.floor(Math.random() * CHARS.length), { delay: i * 40, sound: false }));
  setTimeout(() => showScene(0, { extra: 2 }), REDUCED ? 0 : 600);
}

boot();
