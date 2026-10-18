/* VIDLYRA HALLOWEEN FEST 2026 - DAY 6 - HAUNTED MANSION
   Works as a normal <script> or as type="module" (Supabase is loaded with dynamic import).

   What's in here
   - Start screen (unlocks audio, goes fullscreen on phones)
   - Floating analog joystick + hold-to-attack button for touch screens
   - 3 enemy waves (14 enemies, 4 types) + boss with phases, spell volleys and summons
   - Everything is measured in "design pixels" scaled by U (screen height / 700) so
     phones and big monitors play the same
   - Supabase: access gate -> save with retries / session refresh / offline recovery */
(() => {
"use strict";

const $ = (id) => document.getElementById(id);
const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
const rand = (a, b) => a + Math.random() * (b - a);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------- DOM ---------- */
const game = $("game"), world = $("gameWorld"), hudEl = $("hud");
const player = $("player"), boss = $("boss");
const attackEffect = $("attackEffect"), dashEffect = $("dashEffect"), hurtEffect = $("hurtEffect");
const enemyLayer = $("enemyLayer"), projLayer = $("projectileLayer"), damageFlash = $("damageFlash");
const crystals = [...document.querySelectorAll(".crystal")];
const healthOrbs = [...document.querySelectorAll(".healthOrb")];
const healthFill = $("healthFill"), spiritFill = $("spiritFill"), healthText = $("healthText"), spiritText = $("spiritText");
const crystalCounter = $("crystalCounter"), scoreCounter = $("scoreCounter");
const speedControl = $("speedControl"), speedSlider = $("speedSlider"), speedValue = $("speedValue");
const missionCrystal = $("missionCrystal"), missionSoldier = $("missionSoldier"), missionBoss = $("missionBoss");
const bossHUD = $("bossHUD"), bossHealthFill = $("bossHealthFill");
const notification = $("notification"), interactionText = $("interactionText");
const startScreen = $("startScreen"), startButton = $("startButton"), startStatus = $("startStatus");
const gateScreen = $("gateScreen"), gateTitle = $("gateTitle"), gateMessage = $("gateMessage"), gateButton = $("gateButton");
const pauseMenu = $("pauseMenu"), victoryScreen = $("victoryScreen"), gameOverScreen = $("gameOverScreen");
const resumeButton = $("resumeButton"), exitButton = $("exitButton"), pauseButton = $("pauseButton");
const continueButton = $("continueButton"), mapButton = $("mapButton"), victoryStats = $("victoryStats");
const retryButton = $("retryButton"), gameOverMapButton = $("gameOverMapButton");
const A = {};
["bgMusic", "footstepSound", "collectSound", "attackSound", "dashSound", "hurtSound", "soldierSound", "bossMusic", "bossRoar", "victorySound", "gameOverSound"]
    .forEach((id) => { A[id] = $(id); });

/* ---------- CONFIG (distances are design px, multiplied by U at use) ---------- */
const FESTIVAL_ID = "halloween_2026";
const NEXT_URL = "day7-quiz.html", MAP_URL = "map.html", LOGIN_URL = "login.html";
const PENDING_KEY = "day6PendingSave";
const ENEMY_SRC = "assets/images/day6/mansion soldier.png";

const P_SPEED = 330;
const ATTACK_RANGE = 170, ATTACK_DAMAGE = 25, ATTACK_COOLDOWN = 0.35;
const DASH_COST = 25, DASH_TIME = 0.18, DASH_DIST = 190, DASH_COOLDOWN = 0.6;
const IFRAMES = 0.6, PICKUP_RADIUS = 80, CLICK_RADIUS = 280;
const ORB_HEAL = 30, ORB_RESPAWN = 18;
const BOSS_REACH = 140;
const JOY_DEAD = 0.12;

/* enemy types — all re-use the soldier art, tinted in CSS */
const ENEMY_TYPES = {
    soldier: { cls: "t-soldier", hp: 100, speed: 105, dmg: 8,  size: 1.0,  reach: 95,  delay: 1.4, windup: 0.30, score: 300, resist: 0.0 },
    specter: { cls: "t-specter", hp: 50,  speed: 175, dmg: 6,  size: 0.8,  reach: 80,  delay: 1.0, windup: 0.22, score: 250, resist: 0.0, weave: true },
    brute:   { cls: "t-brute",   hp: 240, speed: 68,  dmg: 18, size: 1.35, reach: 125, delay: 1.9, windup: 0.50, score: 600, resist: 0.7 },
    wraith:  { cls: "t-wraith",  hp: 70,  speed: 90,  dmg: 8,  size: 0.95, reach: 0,   delay: 2.2, windup: 0.38, score: 400, resist: 0.0, ranged: true, range: 430, keep: 290 }
};
const WAVES = [
    ["soldier", "soldier", "soldier"],
    ["soldier", "soldier", "specter", "specter", "wraith"],
    ["brute", "soldier", "soldier", "wraith", "wraith", "specter"]
];
const TOTAL_ENEMIES = WAVES.reduce((n, w) => n + w.length, 0);

/* ---------- SUPABASE STATE ---------- */
let supabase = null;
let festivalUser = null, day6Saved = false, day6SaveInProgress = false, rowExists = false;

/* ---------- GAME STATE ---------- */
const state = {
    started: false, running: false, paused: false, gameOver: false, victory: false,
    lastTime: 0, speedMultiplier: 1, time: 0,
    score: 0, crystals: 0, kills: 0, wave: 0, waveTimer: 1.2,
    health: 100, maxHealth: 100, spirit: 100, maxSpirit: 100,
    attackHeld: false,
    joy: { active: false, x: 0, y: 0 },
    player: { x: 50, y: 15, facing: 1, attacking: false, dashing: false, attackCd: 0, dashCd: 0, dashT: 0, dashDx: 1, dashDy: 0, invincible: 0, stepT: 0 },
    boss: { active: false, defeated: false, x: 50, y: 40, health: 360, maxHealth: 360, speed: 85, attackCooldown: 1.5, attackDelay: 2, hitCooldown: 0, damage: 15, phase: 1, windup: 0, windupType: "melee", volleyCd: 3 },
    keys: { up: false, down: false, left: false, right: false }
};
let enemies = [];
const projectiles = [];
const spawnQueue = [];

/* ---------- WORLD SIZE ---------- */
let W = innerWidth, H = innerHeight, U = 1;
const px = (n) => n * U;
function measure() {
    const r = world.getBoundingClientRect();
    W = r.width || innerWidth; H = r.height || innerHeight;
    U = clamp(H / 700, 0.55, 1.2);
    const root = document.documentElement.style;
    root.setProperty("--u", U.toFixed(3));
    root.setProperty("--hudH", `${(hudEl.offsetHeight || 90) + 6}px`);
}
function delta(ax, ay, bx, by) {            /* vector a -> b in px, y up */
    const dx = (bx - ax) * W / 100, dy = (by - ay) * H / 100;
    return { dx, dy, d: Math.hypot(dx, dy) };
}
function nudge(e, dxPx, dyPx, x0 = 3, x1 = 97, y0 = 3, y1 = 68) {
    e.x = clamp(e.x + dxPx / W * 100, x0, x1);
    e.y = clamp(e.y + dyPx / H * 100, y0, y1);
}
const playerCenter = () => ({ x: state.player.x * W / 100, y: state.player.y * H / 100 + px(55) });

/* ---------- HELPERS ---------- */
function playSound(a, vol = 1) {
    if (!a) return;
    try { a.volume = clamp(vol, 0, 1); a.currentTime = 0; const p = a.play(); if (p && p.catch) p.catch(() => {}); } catch (_) {}
}
function setSprite(img, src) { if (img && !img.src.endsWith(src)) img.src = src; }
const show = (el) => el && el.classList.remove("hidden");
const hide = (el) => el && el.classList.add("hidden");
const retrigger = (el, cls) => { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };
const fmtTime = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const buzz = (ms) => { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (_) {} };
let noteTimer = null;
function showNotification(text) {
    if (!notification) return;
    notification.textContent = text;
    notification.classList.add("show");
    clearTimeout(noteTimer);
    noteTimer = setTimeout(() => notification.classList.remove("show"), 2200);
}
function playEffect(el) {
    if (!el) return;
    el.style.left = `${state.player.x}%`; el.style.bottom = `${state.player.y}%`;
    el.style.scale = state.player.facing < 0 ? "-1 1" : "1 1";
    retrigger(el, "active");
    clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove("active"), 400);
}
const allWavesCleared = () => state.wave >= WAVES.length && spawnQueue.length === 0 && !enemies.some((e) => e.active && !e.minion);
function updateHint() {
    if (!interactionText) return;
    if (state.boss.active) { interactionText.textContent = "DEFEAT THE HAUNTED GUARDIAN"; return; }
    const parts = [];
    if (state.crystals < 6) parts.push(`CRYSTALS ${state.crystals}/6`);
    if (!allWavesCleared()) parts.push(`ENEMIES ${state.kills}/${TOTAL_ENEMIES}`);
    interactionText.textContent = parts.length ? `OBJECTIVE: ${parts.join("  •  ")}` : "THE GUARDIAN AWAKENS…";
}
function updateMissionEnemies() {
    const done = allWavesCleared();
    missionSoldier.textContent = `${done ? "◆" : "◇"} Defeat all Mansion Enemies (${state.kills}/${TOTAL_ENEMIES}) • Wave ${Math.max(1, state.wave)}/${WAVES.length}`;
    missionSoldier.classList.toggle("complete", done);
}
function resetInputs() {
    for (const k in state.keys) state.keys[k] = false;
    state.attackHeld = false;
    if (joystickReset) joystickReset();
}

/* ---------- ACCESS GATE UI ---------- */
function showGate(title, message, buttonText, url) {
    gateTitle.textContent = title;
    gateMessage.textContent = message;
    gateButton.textContent = buttonText;
    gateButton.onclick = () => { if (url) location.href = url; else location.reload(); };
    hide(startScreen); show(gateScreen);
}

/* ---------- SUPABASE ---------- */
async function checkFestivalAccess() {
    try {
        ({ supabase } = await import("./supabase.js"));

        let user = null;
        const { data: userData, error: authError } = await supabase.auth.getUser();
        user = userData && userData.user;
        if (authError || !user) {
            /* getUser needs the network; fall back to the stored session if there is one */
            const { data: sessData } = await supabase.auth.getSession();
            user = sessData && sessData.session && sessData.session.user;
        }
        if (!user) {
            showGate("SIGN IN REQUIRED", "Please sign in to play VIDLYRA Halloween Fest 2026.", "GO TO LOGIN", LOGIN_URL);
            return false;
        }
        festivalUser = user;

        const { data, error } = await supabase
            .from("festival_progress")
            .select("day4, day5, day6")
            .eq("user_id", user.id)
            .eq("festival", FESTIVAL_ID)
            .maybeSingle();
        if (error) {
            console.error("Progress lookup failed:", error);
            showGate("COULDN'T LOAD PROGRESS", "We couldn't reach the festival servers. Check your connection and try again.", "TRY AGAIN", null);
            return false;
        }
        if (!data) {
            showGate("PROGRESS NOT FOUND", "Festival progress was not found for your account. Start from the map.", "BACK TO MAP", MAP_URL);
            return false;
        }
        rowExists = true;
        if (data.day5 !== true) {
            showGate("DAY 6 IS LOCKED", "Complete Day 5 — The Haunted Cemetery — before entering the mansion.", "BACK TO MAP", MAP_URL);
            return false;
        }
        day6Saved = data.day6 === true;
        return true;
    } catch (err) {
        console.error("Unexpected festival access error:", err);
        showGate("CONNECTION PROBLEM", "Unable to verify festival access. Please try again.", "TRY AGAIN", null);
        return false;
    }
}

/* One write with retries. Refreshes the session if the token looks expired. */
async function writeDay6() {
    if (!supabase || !festivalUser || !rowExists) return false;
    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            const { data, error } = await supabase
                .from("festival_progress")
                .update({ day6: true })
                .eq("user_id", festivalUser.id)
                .eq("festival", FESTIVAL_ID)
                .eq("day5", true)
                .select("day6")
                .maybeSingle();
            if (error) throw error;
            if (data && data.day6 === true) return true;

            /* update may have worked but the row wasn't returned (RLS select) — verify directly */
            const { data: chk, error: chkErr } = await supabase
                .from("festival_progress")
                .select("day6")
                .eq("user_id", festivalUser.id)
                .eq("festival", FESTIVAL_ID)
                .maybeSingle();
            if (!chkErr && chk && chk.day6 === true) return true;
            throw new Error("Supabase did not confirm day6=true. Check the row and RLS policies.");
        } catch (err) {
            console.error(`Day 6 save attempt ${attempt + 1} failed:`, err);
            const msg = String((err && err.message) || "").toLowerCase();
            if ((err && err.status === 401) || msg.includes("jwt") || msg.includes("expired")) {
                try { await supabase.auth.refreshSession(); } catch (_) {}
            }
            if (attempt < 2) await sleep(700 * (attempt + 1));
        }
    }
    return false;
}

function markSaved() {
    day6Saved = true;
    try {
        localStorage.setItem("day6Complete", "true");
        localStorage.setItem("day6Score", String(state.score));
        localStorage.removeItem(PENDING_KEY);
    } catch (_) {}
}

async function saveDay6Completion() {
    if (day6Saved) return true;
    if (!state.victory) return false;
    if (!supabase || !festivalUser || !rowExists) { showNotification("SIGN IN REQUIRED TO SAVE PROGRESS"); return false; }
    if (day6SaveInProgress) return false;
    day6SaveInProgress = true;
    continueButton.disabled = true; continueButton.textContent = "SAVING PROGRESS...";
    try { localStorage.setItem(PENDING_KEY, festivalUser.id); } catch (_) {}   /* so a reload can finish the save */
    try {
        const ok = await writeDay6();
        if (ok) {
            markSaved();
            showNotification("DAY 6 COMPLETE — DAY 7 UNLOCKED");
            continueButton.disabled = false; continueButton.textContent = "CONTINUE TO DAY 7";
            return true;
        }
        showNotification(navigator.onLine ? "SAVE FAILED — TAP CONTINUE TO RETRY" : "YOU'RE OFFLINE — WILL RETRY WHEN BACK ONLINE");
        continueButton.disabled = false; continueButton.textContent = "RETRY SAVE / CONTINUE";
        return false;
    } finally {
        day6SaveInProgress = false;
    }
}

/* If the win happened but the save didn't land (closed tab, no signal), finish it next visit */
async function recoverPendingSave() {
    if (day6Saved) return;
    let pending = null;
    try { pending = localStorage.getItem(PENDING_KEY); } catch (_) {}
    if (!pending || !festivalUser || pending !== festivalUser.id) return;
    if (await writeDay6()) { markSaved(); showNotification("PROGRESS RECOVERED — DAY 7 UNLOCKED"); }
}

addEventListener("online", () => { if (state.victory && !day6Saved) saveDay6Completion(); });

/* ---------- INIT ---------- */
let joystickReset = null;

async function init() {
    measure();
    addEventListener("resize", measure);
    addEventListener("orientationchange", () => setTimeout(measure, 250));
    if (window.visualViewport) window.visualViewport.addEventListener("resize", measure);
    document.addEventListener("contextmenu", (e) => e.preventDefault());
    ["gesturestart", "gesturechange"].forEach((ev) => document.addEventListener(ev, (e) => e.preventDefault()));

    placeSpeedControl();
    setupKeyboard(); setupSpeedControl(); setupPickups(); setupJoystick(); setupActionButtons(); setupButtons();
    document.addEventListener("visibilitychange", () => {
        state.lastTime = 0;
        if (document.hidden && state.running && !state.paused) togglePause();
    });

    if (!(await checkFestivalAccess())) return;

    updateMissionEnemies(); updateHint(); updateHUD(); renderPlayer();
    if (day6Saved) startStatus.textContent = "Day 6 already completed — replay for fun any time.";
    else startStatus.textContent = "Collect 6 crystals, survive 3 waves, defeat the Guardian.";
    startButton.disabled = false; startButton.textContent = "ENTER THE MANSION";
    recoverPendingSave();
}

const isTouch = () => matchMedia("(pointer: coarse)").matches;

function tryFullscreen() {
    if (!isTouch()) return;
    const el = document.documentElement;
    const req = el.requestFullscreen || el.webkitRequestFullscreen;
    if (!req || document.fullscreenElement) return;
    try {
        const p = req.call(el);
        if (p && p.then) p.then(() => {
            if (screen.orientation && screen.orientation.lock) screen.orientation.lock("landscape").catch(() => {});
        }).catch(() => {});
    } catch (_) {}
}

function unlockAudio() {
    /* iOS/Android only allow sounds that were "touched" during a tap */
    Object.keys(A).forEach((k) => {
        if (k === "bgMusic") return;
        const a = A[k];
        if (!a) return;
        try {
            a.muted = true;
            const p = a.play();
            const done = () => { a.pause(); a.currentTime = 0; a.muted = false; };
            if (p && p.then) p.then(done).catch(() => { a.muted = false; }); else done();
        } catch (_) { a.muted = false; }
    });
}

function startGame() {
    if (state.started) return;
    state.started = true; state.running = true; state.lastTime = 0;
    hide(startScreen);
    measure();
    unlockAudio();
    A.bgMusic.volume = 0.35;
    A.bgMusic.play().catch(() => {});
    tryFullscreen();
    setTimeout(measure, 400);
    showNotification("ENTER THE HAUNTED MANSION");
}

/* ---------- INPUT: KEYBOARD ---------- */
const KEYMAP = { w: "up", arrowup: "up", s: "down", arrowdown: "down", a: "left", arrowleft: "left", d: "right", arrowright: "right" };
function setupKeyboard() {
    addEventListener("keydown", (e) => {
        const k = e.key.toLowerCase();
        if (KEYMAP[k]) { e.preventDefault(); state.keys[KEYMAP[k]] = true; return; }
        if (k === " " || k === "e") { e.preventDefault(); state.attackHeld = true; if (!e.repeat) attack(); return; }
        if (e.repeat) return;
        if (k === "shift") dash();
        else if (k === "p" || k === "escape") togglePause();
    });
    addEventListener("keyup", (e) => {
        const k = e.key.toLowerCase();
        const d = KEYMAP[k]; if (d) state.keys[d] = false;
        if (k === " " || k === "e") state.attackHeld = false;
    });
    addEventListener("blur", resetInputs);
}
function setupSpeedControl() {
    speedSlider.addEventListener("input", () => {
        state.speedMultiplier = Number(speedSlider.value);
        speedValue.textContent = `${state.speedMultiplier.toFixed(1)}x`;
    });
}
/* On touch screens the speed slider lives inside the pause menu to keep the play area clear */
function placeSpeedControl() {
    const home = speedControl.parentElement, slot = $("pauseSpeedSlot");
    const mq = matchMedia("(pointer: coarse), (max-width: 900px)");
    const place = () => { (mq.matches && slot ? slot : home).appendChild(speedControl); };
    place();
    if (mq.addEventListener) mq.addEventListener("change", place); else if (mq.addListener) mq.addListener(place);
}

/* ---------- INPUT: TOUCH JOYSTICK (floating, analog, multi-touch safe) ---------- */
function setupJoystick() {
    const zone = $("joystickZone"), base = $("joystickBase"), knob = $("joystickKnob");
    if (!zone || !base || !knob) return;
    let pid = null, cx = 0, cy = 0;   /* stick centre, relative to the zone */

    const update = (e) => {
        const r = zone.getBoundingClientRect();
        const max = base.offsetWidth * 0.5;
        let dx = e.clientX - (r.left + cx), dy = e.clientY - (r.top + cy);
        const len = Math.hypot(dx, dy);
        if (len > max) { dx = dx / len * max; dy = dy / len * max; }
        knob.style.transform = `translate(${dx}px, ${dy}px)`;
        const m = Math.min(1, Math.hypot(dx, dy) / max);
        if (m < JOY_DEAD) { state.joy.x = 0; state.joy.y = 0; return; }
        const k = (m - JOY_DEAD) / (1 - JOY_DEAD), l = Math.hypot(dx, dy) || 1;
        state.joy.x = dx / l * k;
        state.joy.y = -dy / l * k;              /* screen y is down, game y is up */
    };
    const reset = () => {
        pid = null;
        state.joy.active = false; state.joy.x = 0; state.joy.y = 0;
        knob.style.transform = "";
        base.classList.remove("active");
        base.style.left = ""; base.style.top = ""; base.style.bottom = "";
    };
    joystickReset = reset;

    zone.addEventListener("pointerdown", (e) => {
        if (pid !== null) return;
        e.preventDefault();
        pid = e.pointerId;
        try { zone.setPointerCapture(pid); } catch (_) {}
        const r = zone.getBoundingClientRect(), size = base.offsetWidth;
        cx = clamp(e.clientX - r.left, size / 2, r.width - size / 2);
        cy = clamp(e.clientY - r.top, size / 2, r.height - size / 2);
        base.style.left = `${cx - size / 2}px`; base.style.top = `${cy - size / 2}px`; base.style.bottom = "auto";
        base.classList.add("active");
        state.joy.active = true;
        update(e);
    });
    zone.addEventListener("pointermove", (e) => { if (e.pointerId === pid) { e.preventDefault(); update(e); } });
    ["pointerup", "pointercancel", "lostpointercapture"].forEach((ev) =>
        zone.addEventListener(ev, (e) => { if (e.pointerId === pid) reset(); }));
}

function setupActionButtons() {
    const atk = $("mobileAttack"), dsh = $("mobileDash");
    if (atk) {
        const release = () => { state.attackHeld = false; atk.classList.remove("pressed"); };
        atk.addEventListener("pointerdown", (e) => {
            e.preventDefault();
            try { atk.setPointerCapture(e.pointerId); } catch (_) {}
            state.attackHeld = true; atk.classList.add("pressed"); attack();
        });
        ["pointerup", "pointercancel", "lostpointercapture"].forEach((ev) => atk.addEventListener(ev, release));
    }
    if (dsh) {
        dsh.addEventListener("pointerdown", (e) => { e.preventDefault(); dsh.classList.add("pressed"); dash(); });
        ["pointerup", "pointercancel", "pointerleave"].forEach((ev) => dsh.addEventListener(ev, () => dsh.classList.remove("pressed")));
    }
}

function setupButtons() {
    startButton.addEventListener("click", startGame);
    pauseButton.addEventListener("click", togglePause);
    resumeButton.addEventListener("click", togglePause);
    exitButton.addEventListener("click", () => { location.href = MAP_URL; });
    mapButton.addEventListener("click", () => { location.href = MAP_URL; });
    gameOverMapButton.addEventListener("click", () => { location.href = MAP_URL; });
    retryButton.addEventListener("click", () => location.reload());
    continueButton.addEventListener("click", async () => {
        if (!state.victory) return;
        if (day6Saved || (await saveDay6Completion())) location.href = NEXT_URL;
    });
}

function togglePause() {
    if (!state.started || state.gameOver || state.victory) return;
    state.paused = !state.paused;
    if (state.paused) {
        show(pauseMenu); A.bgMusic.pause(); A.bossMusic.pause(); resetInputs();
    } else {
        hide(pauseMenu); state.lastTime = 0;
        (state.boss.active ? A.bossMusic : A.bgMusic).play().catch(() => {});
    }
}

/* ---------- CRYSTALS + VITALITY ORBS ---------- */
function setupPickups() {
    crystals.forEach((c) => {
        c._px = parseFloat(c.style.left) || 0; c._py = parseFloat(c.style.bottom) || 0;
        c.addEventListener("click", () => {
            if (!state.running) return;
            if (delta(state.player.x, state.player.y, c._px, c._py).d <= px(CLICK_RADIUS)) collectCrystal(c);
            else showNotification("MOVE CLOSER TO THE CRYSTAL");
        });
    });
    healthOrbs.forEach((o) => {
        o._px = parseFloat(o.style.left) || 0; o._py = parseFloat(o.style.bottom) || 0; o._respawn = 0;
        o.addEventListener("click", () => {
            if (!state.running) return;
            if (delta(state.player.x, state.player.y, o._px, o._py).d <= px(CLICK_RADIUS)) collectOrb(o, true);
            else showNotification("MOVE CLOSER TO THE ORB");
        });
    });
}
function collectCrystal(c) {
    if (c.classList.contains("collected")) return;
    c.classList.add("collected");
    state.crystals++; state.score += 500;
    playSound(A.collectSound, 0.65); buzz(20);
    showNotification(`ANCIENT CRYSTAL ${state.crystals}/6`);
    if (state.crystals >= 6) {
        missionCrystal.classList.add("complete"); missionCrystal.textContent = "◆ Collect all 6 Ancient Crystals";
        maybeActivateBoss();
    }
    updateHint(); updateHUD();
}
function collectOrb(o, fromClick) {
    if (o._respawn > 0) return;
    if (state.health >= state.maxHealth) { if (fromClick) showNotification("VITALITY ALREADY FULL"); return; }
    state.health = Math.min(state.maxHealth, state.health + ORB_HEAL);
    state.score += 100; o.classList.add("collected"); o._respawn = ORB_RESPAWN;
    playSound(A.collectSound, 0.5); updateHUD();
    showNotification(`+${ORB_HEAL} HEALTH`);
}
function checkPickups() {
    const p = state.player, r = px(PICKUP_RADIUS);
    crystals.forEach((c) => { if (!c.classList.contains("collected") && delta(p.x, p.y, c._px, c._py).d <= r) collectCrystal(c); });
    healthOrbs.forEach((o) => { if (o._respawn <= 0 && state.health < state.maxHealth && delta(p.x, p.y, o._px, o._py).d <= r) collectOrb(o); });
}
function updateOrbs(dt) {
    healthOrbs.forEach((o) => {
        if (o._respawn <= 0) return;
        o._respawn -= dt;
        if (o._respawn <= 0) { o._respawn = 0; o.classList.remove("collected"); retrigger(o, "ready-pulse"); setTimeout(() => o.classList.remove("ready-pulse"), 700); }
    });
}

/* ---------- PLAYER ---------- */
function moveVector() {
    const k = state.keys;
    const kx = (k.right ? 1 : 0) - (k.left ? 1 : 0), ky = (k.up ? 1 : 0) - (k.down ? 1 : 0);
    if (kx || ky) { const l = Math.hypot(kx, ky); return { x: kx / l, y: ky / l, mag: 1 }; }
    const j = state.joy;
    const m = Math.hypot(j.x, j.y);
    if (j.active && m > 0.001) return { x: j.x / m, y: j.y / m, mag: Math.max(0.45, Math.min(1, m)) };
    return null;
}
function updatePlayer(dt) {
    const p = state.player;
    p.attackCd = Math.max(0, p.attackCd - dt); p.dashCd = Math.max(0, p.dashCd - dt); p.invincible = Math.max(0, p.invincible - dt);
    if (!p.dashing) state.spirit = Math.min(state.maxSpirit, state.spirit + 6 * dt);
    if (state.attackHeld) attack();
    if (p.dashing) {
        p.dashT -= dt;
        const s = px(DASH_DIST) / DASH_TIME * dt;
        nudge(p, p.dashDx * s, p.dashDy * s, 5, 95, 5, 65);
        if (p.dashT <= 0) p.dashing = false;
        checkPickups();
        return;
    }
    const mv = moveVector();
    if (!mv) { if (!p.attacking) setSprite(player, "assets/images/day6/player-idle.png"); return; }
    if (Math.abs(mv.x) > 0.2) p.facing = mv.x > 0 ? 1 : -1;
    const step = px(P_SPEED) * state.speedMultiplier * mv.mag * dt;
    nudge(p, mv.x * step, mv.y * step, 5, 95, 5, 65);
    if (!p.attacking) setSprite(player, "assets/images/day6/player-walk.png");
    p.stepT -= dt; if (p.stepT <= 0) { p.stepT = 0.38; playSound(A.footstepSound, 0.18); }
    checkPickups();
}
function renderPlayer() {
    const p = state.player;
    player.style.left = `${p.x}%`; player.style.bottom = `${p.y}%`;
    player.style.transform = `translateX(-50%) scaleX(${p.facing < 0 ? -1 : 1})`;
    player.style.opacity = p.invincible > 0 && !p.dashing ? (Math.floor(performance.now() / 80) % 2 ? "0.45" : "1") : "1";
}
function inFront(p, dx) { return dx === 0 || Math.sign(dx) === p.facing || Math.abs(dx) < px(60); }

function attack() {
    const p = state.player;
    if (!state.running || state.paused || p.attackCd > 0 || p.dashing) return;
    p.attackCd = ATTACK_COOLDOWN; p.attacking = true;
    setSprite(player, "assets/images/day6/player-attack.png");
    playSound(A.attackSound, 0.6); playEffect(attackEffect); buzz(8);
    setTimeout(() => { p.attacking = false; }, 260);

    let hits = 0;
    const range = px(ATTACK_RANGE);
    for (const e of enemies) {
        if (!e.active || e.spawnT > 0) continue;
        const v = delta(p.x, p.y, e.x, e.y);
        if (Math.abs(v.dx) > range + px(25) * e.T.size || Math.abs(v.dy) > range * 0.8 || !inFront(p, v.dx)) continue;
        hits++; damageEnemy(e, ATTACK_DAMAGE);
    }

    /* swing at enemy spells to knock them out of the air */
    const pc = playerCenter();
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const pr = projectiles[i], dx = pr.x - pc.x;
        if (Math.abs(dx) <= range && Math.abs(pr.y - pc.y) <= range && inFront(p, dx)) {
            pr.el.remove(); projectiles.splice(i, 1); state.score += 20;
        }
    }

    const b = state.boss;
    if (b.active && !b.defeated && b.hitCooldown <= 0) {
        const v = delta(p.x, p.y, b.x, b.y);
        if (Math.abs(v.dx) <= range + px(40) && Math.abs(v.dy) <= range && inFront(p, v.dx)) { hits++; hurtBoss(ATTACK_DAMAGE); }
    }
    if (hits) state.score += 10 * hits;
    updateHUD();
}
function dash() {
    const p = state.player;
    if (!state.running || state.paused || p.dashing || p.dashCd > 0) return;
    if (state.spirit < DASH_COST) { showNotification("NOT ENOUGH SPIRIT"); return; }
    const mv = moveVector();
    let dx = mv ? mv.x : p.facing, dy = mv ? mv.y : 0;
    const l = Math.hypot(dx, dy) || 1;
    p.dashDx = dx / l; p.dashDy = dy / l; p.dashing = true; p.dashT = DASH_TIME; p.dashCd = DASH_COOLDOWN; p.invincible = DASH_TIME + 0.1;
    if (Math.abs(dx) > 0.2) p.facing = dx > 0 ? 1 : -1;
    state.spirit -= DASH_COST;
    playSound(A.dashSound, 0.6); playEffect(dashEffect);
}
function hurtPlayer(amount) {
    const p = state.player;
    if (p.invincible > 0 || !state.running) return;
    state.health = Math.max(0, state.health - amount);
    p.invincible = IFRAMES;
    playSound(A.hurtSound, 0.7); playEffect(hurtEffect); buzz(40);
    player.classList.add("hurt"); setTimeout(() => player.classList.remove("hurt"), 250);
    retrigger(damageFlash, "active"); setTimeout(() => damageFlash.classList.remove("active"), 450);
    retrigger(world, "shake"); setTimeout(() => world.classList.remove("shake"), 300);
    updateHUD();
    if (state.health <= 0) playerDie();
}
function playerDie() {
    if (state.gameOver) return;
    state.gameOver = true; state.running = false;
    resetInputs();
    A.bgMusic.pause(); A.bossMusic.pause();
    playSound(A.gameOverSound, 0.8);
    game.classList.remove("lowhp");
    show(gameOverScreen);
}

/* ---------- WAVES + ENEMIES ---------- */
function startWave(n) {
    state.wave = n;
    WAVES[n - 1].forEach((type, i) => spawnQueue.push({ type, t: 0.25 + i * 0.55 }));
    state.waveTimer = 2.5;
    showNotification(n === WAVES.length ? `FINAL WAVE ${n}/${WAVES.length}` : `WAVE ${n}/${WAVES.length}`);
    playSound(A.bossRoar, 0.25);
    updateMissionEnemies(); updateHint();
}
function updateWaves(dt) {
    if (state.boss.active || state.boss.defeated) return;
    for (let i = spawnQueue.length - 1; i >= 0; i--) {
        const q = spawnQueue[i]; q.t -= dt;
        if (q.t <= 0) { spawnQueue.splice(i, 1); spawnEnemy(q.type, false); }
    }
    if (spawnQueue.length === 0 && state.wave < WAVES.length && !enemies.some((e) => e.active && !e.minion)) {
        state.waveTimer -= dt;
        if (state.waveTimer <= 0) startWave(state.wave + 1);
    }
}
function pickSpawn() {
    const p = state.player;
    for (let i = 0; i < 14; i++) {
        const x = Math.random() < 0.5 ? rand(5, 18) : rand(82, 95), y = rand(8, 60);
        if (delta(p.x, p.y, x, y).d > px(380)) return { x, y };
    }
    return { x: p.x < 50 ? 90 : 10, y: rand(10, 55) };
}
function spawnEnemy(type, minion, at) {
    const T = ENEMY_TYPES[type];
    const pos = at || pickSpawn();
    const wrap = document.createElement("div");
    wrap.className = `enemy ${T.cls}${minion ? " t-minion" : ""} spawning`;
    wrap.style.setProperty("--s", T.size);
    const bar = document.createElement("div"), fill = document.createElement("div");
    bar.className = "enemyBar"; bar.appendChild(fill);
    const sprite = document.createElement("div"); sprite.className = "sprite";
    const img = document.createElement("img");
    img.src = ENEMY_SRC; img.alt = ""; img.draggable = false;
    sprite.appendChild(img); wrap.appendChild(bar); wrap.appendChild(sprite);
    enemyLayer.appendChild(wrap);
    const e = {
        type, T, minion: !!minion, el: wrap, sprite, fill, active: true,
        x: pos.x, y: pos.y, hp: T.hp, maxHp: T.hp, facing: 1,
        cd: rand(0.8, 1.6), windup: 0, stun: 0, spawnT: 0.6,
        strafe: Math.random() < 0.5 ? 1 : -1, strafeT: rand(1, 2.5), seed: Math.random() * 6.28, age: 0
    };
    enemies.push(e);
    renderEnemy(e);
    return e;
}
function renderEnemy(e) {
    e.el.style.left = `${e.x}%`; e.el.style.bottom = `${e.y}%`;
    e.el.style.zIndex = String(100 - Math.round(e.y));
    e.sprite.style.transform = `scaleX(${e.facing})`;
    e.fill.style.width = `${clamp(e.hp / e.maxHp, 0, 1) * 100}%`;
}
function updateEnemies(dt) {
    const p = state.player;
    for (const e of enemies) {
        if (!e.active) continue;
        const T = e.T;
        e.age += dt; e.cd = Math.max(0, e.cd - dt);
        if (e.spawnT > 0) { e.spawnT -= dt; if (e.spawnT <= 0) e.el.classList.remove("spawning"); renderEnemy(e); continue; }
        if (e.stun > 0) { e.stun -= dt; renderEnemy(e); continue; }

        let v = delta(e.x, e.y, p.x, p.y);
        e.facing = e.x > p.x ? -1 : 1;

        if (e.windup > 0) {                       /* telegraphed attack — time to dash away */
            e.windup -= dt;
            if (e.windup <= 0) { e.el.classList.remove("windup"); enemyStrike(e); }
            renderEnemy(e); continue;
        }

        const spd = px(T.speed) * dt;
        if (T.ranged) {
            if (v.d > px(T.range)) nudge(e, v.dx / v.d * spd, v.dy / v.d * spd);
            else if (v.d < px(T.keep)) nudge(e, -v.dx / v.d * spd, -v.dy / v.d * spd);
            else {
                e.strafeT -= dt; if (e.strafeT <= 0) { e.strafe = -e.strafe; e.strafeT = rand(1, 2.5); }
                nudge(e, -v.dy / v.d * spd * 0.55 * e.strafe, v.dx / v.d * spd * 0.55 * e.strafe);
            }
            if (e.cd <= 0 && v.d <= px(T.range) * 1.05) { e.windup = T.windup; e.el.classList.add("windup"); }
        } else {
            if (v.d > px(T.reach)) {
                let mx = v.dx / v.d, my = v.dy / v.d;
                if (T.weave) { const w = Math.sin(e.age * 4 + e.seed) * 0.7; const tx = mx - my * w, ty = my + mx * w; mx = tx; my = ty; }
                nudge(e, mx * spd, my * spd);
            } else if (e.cd <= 0) { e.windup = T.windup; e.el.classList.add("windup"); }
        }
    }
    separate();
    for (let i = enemies.length - 1; i >= 0; i--) { if (!enemies[i].active) enemies.splice(i, 1); else renderEnemy(enemies[i]); }
}
function enemyStrike(e) {
    const p = state.player, T = e.T;
    e.cd = T.delay;
    const v = delta(e.x, e.y, p.x, p.y);
    if (T.ranged) {
        const ox = e.x * W / 100, oy = e.y * H / 100 + px(70 * T.size), pc = playerCenter();
        const dx = pc.x - ox, dy = pc.y - oy, d = Math.hypot(dx, dy) || 1;
        fireProjectile(ox, oy, dx / d, dy / d, px(330), T.dmg, "enemy");
        playSound(A.soldierSound, 0.35);
    } else if (v.d <= px(T.reach) * 1.3) {
        playSound(A.soldierSound, 0.4); hurtPlayer(T.dmg);
    }
}
function separate() {
    const list = enemies.filter((e) => e.active && e.spawnT <= 0);
    if (state.boss.active && !state.boss.defeated) list.push(Object.assign(state.boss, { T: { size: 1.7 } }));
    for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
            const a = list[i], b = list[j];
            const v = delta(a.x, a.y, b.x, b.y), min = px(62) * (a.T.size + b.T.size) / 2;
            if (v.d >= min) continue;
            const push = (min - v.d) / 2;
            const ux = v.d > 0.01 ? v.dx / v.d : Math.cos(i + j), uy = v.d > 0.01 ? v.dy / v.d : Math.sin(i + j);
            nudge(a, -ux * push, -uy * push); nudge(b, ux * push, uy * push);
        }
    }
}
function damageEnemy(e, amount) {
    const p = state.player, T = e.T;
    e.hp -= amount;
    const dir = e.x >= p.x ? 1 : -1;
    nudge(e, dir * px(32) * (1 - T.resist), 0);
    e.stun = 0.18 * (1 - T.resist);
    if (e.windup > 0 && T.resist < 0.5) { e.windup = 0; e.el.classList.remove("windup"); e.cd = 0.6; }
    e.el.classList.add("hit"); setTimeout(() => e.el.classList.remove("hit"), 120);
    if (e.hp <= 0) killEnemy(e); else renderEnemy(e);
}
function killEnemy(e) {
    e.active = false; e.hp = 0;
    state.score += e.T.score;
    e.el.style.opacity = "0"; setTimeout(() => e.el.remove(), 350);
    if (e.minion) { updateHUD(); return; }
    state.kills++;
    updateMissionEnemies(); updateHint(); updateHUD();
    if (allWavesCleared()) showNotification(state.crystals < 6 ? "ALL WAVES CLEARED — FIND THE CRYSTALS" : "ALL WAVES CLEARED");
    else showNotification(`ENEMY DEFEATED ${state.kills}/${TOTAL_ENEMIES}`);
    maybeActivateBoss();
}

/* ---------- PROJECTILES ---------- */
function fireProjectile(x, y, dirx, diry, speed, dmg, kind) {
    const el = document.createElement("div");
    el.className = `projectile${kind === "boss" ? " boss" : ""}`;
    projLayer.appendChild(el);
    const pr = { el, x, y, vx: dirx * speed, vy: diry * speed, dmg, life: 5, r: px(kind === "boss" ? 20 : 13) };
    projectiles.push(pr);
    drawProjectile(pr);
}
function drawProjectile(pr) { pr.el.style.transform = `translate(${pr.x - pr.r}px, ${-(pr.y - pr.r)}px)`; }
function updateProjectiles(dt) {
    const pc = playerCenter(), p = state.player;
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const pr = projectiles[i];
        pr.x += pr.vx * dt; pr.y += pr.vy * dt; pr.life -= dt;
        let remove = pr.life <= 0 || pr.x < -60 || pr.x > W + 60 || pr.y < -60 || pr.y > H + 60;
        if (!remove && p.invincible <= 0 && Math.hypot(pr.x - pc.x, pr.y - pc.y) < pr.r + px(26)) {
            hurtPlayer(pr.dmg); remove = true;
        }
        if (remove) { pr.el.remove(); projectiles.splice(i, 1); } else drawProjectile(pr);
    }
}
function clearProjectiles() { projectiles.forEach((p) => p.el.remove()); projectiles.length = 0; }

/* ---------- BOSS ---------- */
function maybeActivateBoss() {
    const b = state.boss;
    if (b.active || b.defeated || state.crystals < 6 || !allWavesCleared()) return;
    b.active = true; b.attackCooldown = 1.5; b.volleyCd = 3;
    renderBoss();
    boss.classList.add("active"); bossHUD.classList.add("active");
    A.bgMusic.pause(); A.bossMusic.volume = 0.45; A.bossMusic.currentTime = 0; A.bossMusic.play().catch(() => {});
    playSound(A.bossRoar, 0.8);
    showNotification("THE HAUNTED GUARDIAN AWAKENS!");
    updateHint();
}
function renderBoss() {
    const b = state.boss;
    boss.style.left = `${b.x}%`; boss.style.bottom = `${b.y}%`;
    boss.style.transform = `translateX(-50%) scaleX(${b.x > state.player.x ? -1 : 1})`;
    bossHealthFill.style.width = `${clamp(b.health / b.maxHealth, 0, 1) * 100}%`;
}
function updateBoss(dt) {
    const b = state.boss;
    if (!b.active || b.defeated) return;
    b.hitCooldown = Math.max(0, b.hitCooldown - dt); b.attackCooldown = Math.max(0, b.attackCooldown - dt); b.volleyCd -= dt;
    const p = state.player, v = delta(b.x, b.y, p.x, p.y);

    if (b.windup > 0) {
        b.windup -= dt;
        if (b.windup <= 0) {
            boss.classList.remove("casting");
            if (b.windupType === "volley") bossVolley();
            else if (delta(b.x, b.y, p.x, p.y).d <= px(BOSS_REACH) * 1.3) { playSound(A.bossRoar, 0.5); hurtPlayer(b.damage); }
            b.attackCooldown = b.attackDelay;
        }
        renderBoss(); return;
    }
    if (b.phase >= 2 && b.volleyCd <= 0) {
        b.windup = 0.6; b.windupType = "volley"; b.volleyCd = b.phase === 3 ? 3.2 : 4.5;
        boss.classList.add("casting"); renderBoss(); return;
    }
    if (v.d > px(BOSS_REACH)) nudge(b, v.dx / v.d * px(b.speed) * dt, v.dy / v.d * px(b.speed) * dt);
    else if (b.attackCooldown <= 0) { b.windup = 0.45; b.windupType = "melee"; boss.classList.add("casting"); }
    renderBoss();
}
function bossVolley() {
    const b = state.boss, ox = b.x * W / 100, oy = b.y * H / 100 + px(110), pc = playerCenter();
    const base = Math.atan2(pc.y - oy, pc.x - ox), count = b.phase === 3 ? 5 : 3;
    for (let i = 0; i < count; i++) {
        const a = base + (i - (count - 1) / 2) * 0.28;
        fireProjectile(ox, oy, Math.cos(a), Math.sin(a), px(300), 9, "boss");
    }
    playSound(A.bossRoar, 0.6);
}
function summonMinions(n) {
    const b = state.boss;
    for (let i = 0; i < n; i++) {
        if (enemies.filter((e) => e.active && e.minion).length >= 4) break;
        spawnEnemy("specter", true, { x: clamp(b.x + rand(-10, 10), 6, 94), y: clamp(b.y + rand(-8, 8), 8, 60) });
    }
}
function hurtBoss(amount) {
    const b = state.boss;
    b.health = Math.max(0, b.health - amount); b.hitCooldown = 0.25; state.score += 50;
    boss.style.filter = "brightness(2)"; setTimeout(() => { boss.style.filter = ""; }, 120);
    if (b.phase === 1 && b.health < b.maxHealth * 0.6) { b.phase = 2; b.speed += 20; b.attackDelay = 1.6; showNotification("THE GUARDIAN GROWS ANGRY!"); summonMinions(2); }
    if (b.phase === 2 && b.health < b.maxHealth * 0.3) { b.phase = 3; b.speed += 20; b.attackDelay = 1.2; showNotification("GUARDIAN — RAGE MODE!"); summonMinions(2); }
    renderBoss();
    if (b.health <= 0) bossDefeated();
}
function bossDefeated() {
    const b = state.boss;
    if (b.defeated) return;
    b.defeated = true; b.active = false; state.score += 3000;
    boss.classList.remove("active", "casting"); bossHUD.classList.remove("active");
    enemies.forEach((e) => { if (e.active) { e.active = false; e.el.style.opacity = "0"; setTimeout(() => e.el.remove(), 350); } });
    clearProjectiles();
    missionBoss.classList.add("complete"); missionBoss.textContent = "◆ Defeat the Haunted Guardian";
    updateHUD();
    setTimeout(winGame, 900);
}
async function winGame() {
    if (state.victory || state.gameOver) return;
    state.victory = true; state.running = false;
    resetInputs();
    A.bossMusic.pause(); A.bgMusic.pause();
    playSound(A.victorySound, 0.8);
    game.classList.remove("lowhp");
    victoryStats.textContent = `SCORE ${String(state.score).padStart(6, "0")}  •  KILLS ${state.kills}/${TOTAL_ENEMIES}  •  TIME ${fmtTime(state.time)}`;
    show(victoryScreen);
    await saveDay6Completion();
}

/* ---------- HUD ---------- */
function updateHUD() {
    const h = Math.round(state.health), s = Math.round(state.spirit);
    healthFill.style.width = `${h / state.maxHealth * 100}%`;
    healthFill.style.filter = h <= 30 ? "brightness(1.4) saturate(1.6)" : "";
    spiritFill.style.width = `${s / state.maxSpirit * 100}%`;
    healthText.textContent = `${h} / ${state.maxHealth}`;
    spiritText.textContent = `${s} / ${state.maxSpirit}`;
    crystalCounter.textContent = `${state.crystals} / 6`;
    scoreCounter.textContent = String(state.score).padStart(6, "0");
    game.classList.toggle("lowhp", h <= 30 && h > 0 && !state.gameOver && !state.victory);
}

/* ---------- LOOP ---------- */
function gameLoop(t) {
    if (!state.lastTime) state.lastTime = t;
    const dt = Math.min(0.05, (t - state.lastTime) / 1000);
    state.lastTime = t;
    if (state.running && !state.paused) {
        state.time += dt;
        updatePlayer(dt); updateWaves(dt); updateEnemies(dt); updateBoss(dt); updateProjectiles(dt); updateOrbs(dt);
        renderPlayer(); updateHUD();
    }
    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
if (document.readyState === "loading") addEventListener("DOMContentLoaded", init, { once: true });
else init();
})();
