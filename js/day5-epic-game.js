/* VIDLYRA HALLOWEEN FEST 2026 - DAY 5 - THE HAUNTED CEMETERY
   Mobile + enemy + Supabase rewrite.

   - Camera zooms to the screen height, so phones see the same game as desktops
   - Floating analog joystick, hold-to-attack, auto-face nearest enemy
   - 4 enemy types guard the 7 lanterns (20 ghosts), boss casts spells + summons wisps
   - All movement is time-based (same speed on 60Hz and 120Hz screens)
   - Supabase: access check -> save with retries / session refresh / offline recovery */

const $ = (s) => document.querySelector(s);
const on = (el, ev, fn, opt) => { if (el) el.addEventListener(ev, fn, opt); };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rand = (a, b) => Math.random() * (b - a) + a;
const dist = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);
const pad6 = (n) => String(n).padStart(6, "0");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const buzz = (ms) => { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (_) {} };

/* ---------- DOM ---------- */
const E = {};
[
    "loadingScreen", "loadingFill", "loadingPercent", "loadingMessage", "startButton",
    "gameWorld", "gameRoot", "player", "playerContainer", "slashEffect", "dashTrail",
    "healthFill", "spiritFill", "healthText", "spiritText", "lanternCounter", "scoreCounter",
    "missionPopup", "mission1", "mission2", "mission3", "objectiveTracker",
    "ghostKing", "bossHUD", "bossHealthFill", "bossIntroScreen", "bossWarning", "ghostKingSprite",
    "pauseMenu", "resumeButton", "restartButton", "openSettingsButton", "exitGameButton", "settingsPanel",
    "closeSettingsButton", "musicSlider", "effectsSlider", "brightnessSlider", "screenShakeToggle",
    "mobileControls", "joystickZone", "joystickBase", "joystickStick",
    "attackButton", "dashButton", "skillButton", "interactButton", "pauseButton",
    "victoryScreen", "continueButton", "gameOverScreen", "retryGameButton", "quitEventButton",
    "notificationContainer", "interactionPrompt", "playerX", "playerY", "aliveGhosts", "activeLanterns",
    "day6Portal", "lightningLayer", "miniPlayer", "miniBoss", "miniMapFrame", "compassNeedle",
    "enemyLayer", "lanternLayer", "projectileLayer", "batLayer",
    "bgMusic", "ambientWind", "rainSound", "ghostAttack", "lanternLight", "swordSlash", "heroDash",
    "bossRoar", "lightningSound", "victorySound", "gameOverSound", "portalSound",
    "damageOverlay", "healOverlay", "statSpirit", "ghostKillCount", "muteButton", "saveIndicator",
    "rainCanvasFront", "inventoryPanel", "closeInventory", "questPanel"
].forEach((id) => { E[id] = document.getElementById(id); });

/* ---------- CONFIG ---------- */
const CONFIG = {
    PLAYER_SPEED: 360, DASH_SPEED: 960,
    ATTACK_DAMAGE: 25, MAX_HEALTH: 100, MAX_SPIRIT: 100, MAX_STAMINA: 100,
    TOTAL_LANTERNS: 7, WORLD_WIDTH: 5000, WORLD_HEIGHT: 2200, CAMERA_SMOOTH: 0.12,
    LANTERN_HINT: 320, LANTERN_PICKUP: 200, ACTIVE_RADIUS: 1500,
    NEXT_LEVEL_URL: "day6-video.html", MAP_URL: "index.html", LOGIN_URL: "login.html",
    FESTIVAL: "halloween_2026", PENDING_KEY: "day5PendingSave"
};
const GHOST_SRC = "assets/images/day5/Ghost.png";

/* four enemy types — all use the Ghost art, tinted in CSS */
const GHOST_TYPES = {
    ghost:    { cls: "g-ghost",    hp: 100, speed: 110, dmg: 8,  size: 1.0,  reach: 95,  cd: 1.4, windup: 0.30, score: 250, resist: 0,   detect: 480 },
    wisp:     { cls: "g-wisp",     hp: 45,  speed: 215, dmg: 5,  size: 0.72, reach: 75,  cd: 1.0, windup: 0.20, score: 200, resist: 0,   detect: 620, weave: true },
    banshee:  { cls: "g-banshee",  hp: 80,  speed: 95,  dmg: 9,  size: 1.0,  reach: 0,   cd: 2.4, windup: 0.40, score: 350, resist: 0,   detect: 720, ranged: true, range: 540, keep: 380 },
    revenant: { cls: "g-revenant", hp: 260, speed: 70,  dmg: 16, size: 1.4,  reach: 130, cd: 1.9, windup: 0.50, score: 600, resist: 0.6, detect: 520 }
};
/* each lantern is guarded by a pack; a few roam the middle of the map */
const LANTERN_GUARDS = [
    ["ghost", "wisp"],
    ["ghost", "ghost"],
    ["wisp", "wisp", "banshee"],
    ["ghost", "banshee"],
    ["revenant", "wisp"],
    ["revenant", "banshee", "ghost"],
    ["revenant", "banshee", "wisp"]
];
const ROAMERS = ["ghost", "wisp", "banshee"];

/* ---------- STATE ---------- */
const GAME = { started: false, running: false, paused: false, victory: false, gameOver: false, mobile: false, score: 0, lanterns: 0, kills: 0, muted: false, totalGhosts: 0, attackHeld: false };
const PLAYER = { x: 500, y: 1600, health: 100, maxHealth: 100, spirit: 100, maxSpirit: 100, stamina: 100, maxStamina: 100, facing: 1, vx: 0, vy: 0, attacking: false, invincible: false, iframes: 0 };
const INPUT = { left: false, right: false, up: false, down: false };
const FX = { effects: 0.9, shake: true, shakePower: 0, shakeUntil: 0 };
const PORTAL = { active: false, entered: false, x: 0, y: 0 };
const DASH = { active: false, duration: 0.2, cooldown: 0.7, speed: CONFIG.DASH_SPEED, timer: 0, cd: 0, dx: 0, dy: 0 };
const ATTACK = { combo: 0, cd: 0, range: 150, damage: CONFIG.ATTACK_DAMAGE };
const SKILL = { cooldown: 10, timer: 0, cost: 30, damage: 50, radius: 300 };
const BOSS = { active: false, intro: false, defeated: false, phase: 1, health: 1000, maxHealth: 1000, damage: 18, speed: 150, attackCooldown: 1.8, cd: 0.9, windup: 0, windupType: "melee", volleyCd: 3, x: 2500, y: 900 };
const JOY = { active: false, id: null, cx: 0, cy: 0, x: 0, y: 0 };
const CAM = { x: 0, y: 0, w: innerWidth, h: innerHeight };
const GHOSTS = [], LANTERNS = [], PROJ = [];
const ACCESS = { user: null, checked: false, completed: false, saving: false };
const ENGINE = { last: 0 };
let supabase = null;
let Z = 1;                                             /* camera zoom */

const pcx = () => PLAYER.x;                            /* player body centre */
const pcy = () => PLAYER.y - 80;

/* ---------- SOUND ---------- */
function sfx(a, vol = 1) {
    if (!a) return;
    try { a.volume = clamp(vol * FX.effects, 0, 1); a.currentTime = 0; const p = a.play(); if (p && p.catch) p.catch(() => {}); } catch (_) {}
}
function setVol(a, v) { if (a) a.volume = clamp(v, 0, 1); }
function unlockAudio() {
    /* phones only allow sounds that were "touched" during a tap */
    document.querySelectorAll("audio").forEach((a) => {
        if (a === E.bgMusic || a === E.ambientWind || a === E.rainSound) return;
        try {
            a.muted = true;
            const p = a.play();
            const done = () => { a.pause(); a.currentTime = 0; a.muted = GAME.muted; };
            if (p && p.then) p.then(done).catch(() => { a.muted = GAME.muted; }); else done();
        } catch (_) { a.muted = GAME.muted; }
    });
}

/* ---------- DEVICE + VIEW ---------- */
function measure() {
    Z = clamp(innerHeight / 800, 0.55, 1.15);
    CAM.w = innerWidth / Z; CAM.h = innerHeight / Z;
}
function detectDevice() {
    const coarse = matchMedia("(pointer: coarse)").matches;
    GAME.mobile = coarse || (navigator.maxTouchPoints > 0 && innerWidth <= 992);
    document.body.classList.toggle("touch", GAME.mobile);
}
function tryFullscreen() {
    if (!GAME.mobile) return;
    const el = document.documentElement, req = el.requestFullscreen || el.webkitRequestFullscreen;
    if (!req || document.fullscreenElement) return;
    try {
        const p = req.call(el);
        if (p && p.then) p.then(() => { if (screen.orientation && screen.orientation.lock) screen.orientation.lock("landscape").catch(() => {}); }).catch(() => {});
    } catch (_) {}
}
function onResize() { measure(); detectDevice(); sizeRain(); }
addEventListener("resize", onResize);
addEventListener("orientationchange", () => setTimeout(onResize, 250));

/* ---------- LOADING + START ---------- */
const MESSAGES = ["Entering the cemetery...", "Summoning spirits...", "Lighting cursed lanterns...", "Awakening the Ghost King...", "Preparing your sword...", "Loading haunted world..."];
let loadDone = false, accessOk = false;

function startLoading() {
    let p = 0;
    const t = setInterval(() => {
        p = Math.min(100, p + rand(5, 11));
        if (E.loadingFill) E.loadingFill.style.width = p + "%";
        if (E.loadingPercent) E.loadingPercent.textContent = Math.floor(p) + "%";
        if (E.loadingMessage && !accessOk) E.loadingMessage.textContent = MESSAGES[Math.min(MESSAGES.length - 1, Math.floor(p / 100 * MESSAGES.length))];
        if (p >= 100) { clearInterval(t); loadDone = true; maybeReady(); }
    }, 130);
}
function maybeReady() {
    if (!loadDone) return;
    if (!accessOk) { if (E.loadingMessage) E.loadingMessage.textContent = "Verifying your progress..."; return; }
    if (E.loadingMessage) E.loadingMessage.textContent = ACCESS.completed ? "Day 5 already completed — replay any time." : "The cemetery awaits...";
    if (E.startButton) { E.startButton.style.display = "block"; E.startButton.disabled = false; }
}
function startGame() {
    if (GAME.started) return;
    GAME.started = true; GAME.running = true; ENGINE.last = 0;
    const ls = E.loadingScreen;
    if (ls) { ls.style.opacity = "0"; ls.style.pointerEvents = "none"; setTimeout(() => { ls.style.display = "none"; }, 600); }
    measure(); unlockAudio(); tryFullscreen(); setTimeout(onResize, 400);
    if (E.missionPopup) { E.missionPopup.style.opacity = "1"; setTimeout(() => { E.missionPopup.style.opacity = "0"; }, 3500); }
    setVol(E.bgMusic, 0.5); setVol(E.ambientWind, 0.3); setVol(E.rainSound, 0.2);
    [E.bgMusic, E.ambientWind, E.rainSound].forEach((a) => { if (a) { const p = a.play(); if (p && p.catch) p.catch(() => {}); } });
}
on(E.startButton, "click", startGame);

/* ---------- INPUT: KEYBOARD ---------- */
function resetInputs() {
    INPUT.left = INPUT.right = INPUT.up = INPUT.down = false;
    GAME.attackHeld = false;
    joyEnd();
}
addEventListener("keydown", (e) => {
    switch (e.code) {
        case "ArrowLeft": case "KeyA": INPUT.left = true; break;
        case "ArrowRight": case "KeyD": INPUT.right = true; break;
        case "ArrowUp": case "KeyW": INPUT.up = true; break;
        case "ArrowDown": case "KeyS": INPUT.down = true; break;
        case "Space": e.preventDefault(); GAME.attackHeld = true; if (!e.repeat) startAttack(); break;
        case "ShiftLeft": case "ShiftRight": if (!e.repeat) startDash(); break;
        case "KeyE": if (!e.repeat) castSpiritSkill(); break;
        case "KeyF": if (!e.repeat) tryInteract(); break;
        case "KeyI": if (!e.repeat && E.inventoryPanel) E.inventoryPanel.classList.toggle("active"); break;
        case "Escape": case "KeyP": if (!e.repeat) togglePause(); break;
    }
});
addEventListener("keyup", (e) => {
    switch (e.code) {
        case "ArrowLeft": case "KeyA": INPUT.left = false; break;
        case "ArrowRight": case "KeyD": INPUT.right = false; break;
        case "ArrowUp": case "KeyW": INPUT.up = false; break;
        case "ArrowDown": case "KeyS": INPUT.down = false; break;
        case "Space": GAME.attackHeld = false; break;
    }
});
addEventListener("blur", resetInputs);
document.addEventListener("contextmenu", (e) => e.preventDefault());
["gesturestart", "gesturechange"].forEach((ev) => document.addEventListener(ev, (e) => e.preventDefault()));
document.addEventListener("visibilitychange", () => { ENGINE.last = 0; if (document.hidden && GAME.running && !GAME.paused) togglePause(); });

/* ---------- INPUT: FLOATING ANALOG JOYSTICK ---------- */
const JOY_DEAD = 0.12;
function joyUpdate(e) {
    const base = E.joystickBase, max = (base.offsetWidth || 128) * 0.5;
    let dx = e.clientX - JOY.cx, dy = e.clientY - JOY.cy;
    const len = Math.hypot(dx, dy);
    if (len > max) { dx = dx / len * max; dy = dy / len * max; }
    E.joystickStick.style.transform = `translate(-50%,-50%) translate(${dx}px,${dy}px)`;
    const m = Math.min(1, Math.hypot(dx, dy) / max);
    if (m < JOY_DEAD) { JOY.x = 0; JOY.y = 0; return; }
    const k = (m - JOY_DEAD) / (1 - JOY_DEAD), l = Math.hypot(dx, dy) || 1;
    JOY.x = dx / l * k; JOY.y = dy / l * k;          /* screen y is down, and so is the game's y */
}
function joyEnd(e) {
    if (e && e.pointerId !== JOY.id) return;
    JOY.active = false; JOY.id = null; JOY.x = JOY.y = 0;
    if (E.joystickStick) E.joystickStick.style.transform = "translate(-50%,-50%)";
    if (E.joystickBase) { E.joystickBase.classList.remove("active"); E.joystickBase.style.left = ""; E.joystickBase.style.top = ""; E.joystickBase.style.bottom = ""; }
}
on(E.joystickZone, "pointerdown", (e) => {
    if (JOY.active) return;
    e.preventDefault();
    const zone = E.joystickZone, base = E.joystickBase, r = zone.getBoundingClientRect(), size = base.offsetWidth || 128;
    const lx = clamp(e.clientX - r.left, size / 2, r.width - size / 2), ly = clamp(e.clientY - r.top, size / 2, r.height - size / 2);
    JOY.active = true; JOY.id = e.pointerId; JOY.cx = r.left + lx; JOY.cy = r.top + ly;
    base.style.left = `${lx - size / 2}px`; base.style.top = `${ly - size / 2}px`; base.style.bottom = "auto";
    base.classList.add("active");
    try { zone.setPointerCapture(e.pointerId); } catch (_) {}
    joyUpdate(e);
});
on(E.joystickZone, "pointermove", (e) => { if (JOY.active && e.pointerId === JOY.id) { e.preventDefault(); joyUpdate(e); } });
["pointerup", "pointercancel", "lostpointercapture"].forEach((ev) => on(E.joystickZone, ev, joyEnd));

/* action buttons */
const press = (el, down, up) => {
    on(el, "pointerdown", (e) => { e.preventDefault(); try { el.setPointerCapture(e.pointerId); } catch (_) {} el.classList.add("pressed"); down(); });
    ["pointerup", "pointercancel", "lostpointercapture"].forEach((ev) => on(el, ev, () => { el.classList.remove("pressed"); if (up) up(); }));
};
press(E.attackButton, () => { GAME.attackHeld = true; startAttack(); }, () => { GAME.attackHeld = false; });
press(E.dashButton, startDash);
press(E.skillButton, castSpiritSkill);
press(E.interactButton, tryInteract);
press(E.pauseButton, togglePause);

/* ---------- MENUS ---------- */
function togglePause() {
    if (!GAME.started || GAME.gameOver || GAME.victory) return;
    GAME.paused = !GAME.paused;
    resetInputs();
    if (E.pauseMenu) E.pauseMenu.style.display = GAME.paused ? "flex" : "none";
    if (!GAME.paused && E.settingsPanel) E.settingsPanel.style.display = "none";
    ENGINE.last = 0;
}
on(E.resumeButton, "click", () => { if (GAME.paused) togglePause(); });
on(E.restartButton, "click", () => location.reload());
on(E.exitGameButton, "click", () => { location.href = CONFIG.MAP_URL; });
on(E.openSettingsButton, "click", () => { E.settingsPanel.style.display = "flex"; });
on(E.closeSettingsButton, "click", () => { E.settingsPanel.style.display = "none"; });
on(E.musicSlider, "input", (e) => { const v = e.target.value / 100; setVol(E.bgMusic, v); setVol(E.ambientWind, v * 0.6); });
on(E.effectsSlider, "input", (e) => { FX.effects = e.target.value / 100; });
on(E.brightnessSlider, "input", (e) => { if (E.gameRoot) E.gameRoot.style.filter = `brightness(${e.target.value}%)`; });
on(E.screenShakeToggle, "change", (e) => { FX.shake = e.target.checked; });
on(E.closeInventory, "click", () => E.inventoryPanel.classList.remove("active"));
on(E.muteButton, "click", () => {
    GAME.muted = !GAME.muted;
    document.querySelectorAll("audio").forEach((a) => { a.muted = GAME.muted; });
    E.muteButton.textContent = GAME.muted ? "🔇" : "🔊";
});

/* ---------- PLAYER ---------- */
function applyMovement(dt) {
    let vx = 0, vy = 0;
    if (INPUT.left) vx--; if (INPUT.right) vx++; if (INPUT.up) vy--; if (INPUT.down) vy++;
    if (vx || vy) { const l = Math.hypot(vx, vy); vx /= l; vy /= l; }
    else if (JOY.active) { vx = JOY.x; vy = JOY.y; }
    const len = Math.hypot(vx, vy);
    if (len > 0.05) {
        const k = Math.min(1, len) / len, mag = JOY.active && !(INPUT.left || INPUT.right || INPUT.up || INPUT.down) ? Math.max(0.5, Math.min(1, len)) : 1;
        vx *= k; vy *= k;
        PLAYER.x += vx * mag * CONFIG.PLAYER_SPEED * dt;
        PLAYER.y += vy * mag * CONFIG.PLAYER_SPEED * dt;
        if (vx < -0.15) PLAYER.facing = -1; else if (vx > 0.15) PLAYER.facing = 1;
        PLAYER.vx = vx; PLAYER.vy = vy;
    } else { PLAYER.vx = 0; PLAYER.vy = 0; }
    PLAYER.x = clamp(PLAYER.x, 60, CONFIG.WORLD_WIDTH - 60);
    PLAYER.y = clamp(PLAYER.y, 260, CONFIG.WORLD_HEIGHT - 60);
}
function renderPlayer() {
    const el = E.playerContainer; if (!el) return;
    el.style.left = PLAYER.x + "px"; el.style.top = PLAYER.y + "px";
    el.style.transform = `translate(-50%,-100%) scaleX(${PLAYER.facing})`;
    el.style.opacity = PLAYER.iframes > 0 && !DASH.active ? (Math.floor(performance.now() / 80) % 2 ? "0.5" : "1") : "1";
}
let lastHUD = "";
function updateHUD() {
    const h = Math.max(0, Math.round(PLAYER.health)), s = Math.round(PLAYER.spirit);
    const key = `${h}|${s}|${GAME.kills}`;
    if (key === lastHUD) return;
    lastHUD = key;
    if (E.healthFill) {
        E.healthFill.style.width = (h / PLAYER.maxHealth * 100) + "%";
        E.healthFill.style.background = h <= 30 ? "linear-gradient(90deg,#ff0000,#ff5555)" : "";
    }
    if (E.spiritFill) E.spiritFill.style.width = (s / PLAYER.maxSpirit * 100) + "%";
    if (E.healthText) E.healthText.textContent = `${h} / ${PLAYER.maxHealth}`;
    if (E.spiritText) E.spiritText.textContent = `${s} / ${PLAYER.maxSpirit}`;
    if (E.statSpirit) E.statSpirit.textContent = s;
    if (E.ghostKillCount) E.ghostKillCount.textContent = GAME.kills;
}
function setScore(add) { GAME.score += add; if (E.scoreCounter) E.scoreCounter.textContent = pad6(GAME.score); }
function regenerate(dt) {
    PLAYER.health = clamp(PLAYER.health + 2 * dt, 0, PLAYER.maxHealth);
    PLAYER.spirit = clamp(PLAYER.spirit + 10 * dt, 0, PLAYER.maxSpirit);
    PLAYER.stamina = clamp(PLAYER.stamina + 30 * dt, 0, PLAYER.maxStamina);
}
function hurtPlayer(amount, shakePower) {
    if (PLAYER.invincible || PLAYER.iframes > 0 || GAME.gameOver || GAME.victory) return;
    PLAYER.health = Math.max(0, PLAYER.health - amount);
    PLAYER.iframes = 0.5;
    sfx(E.ghostAttack, 0.8); shake(shakePower || 8, 200); buzz(40);
    if (E.player) { E.player.classList.add("hurt"); setTimeout(() => E.player.classList.remove("hurt"), 250); }
    if (E.damageOverlay) { E.damageOverlay.style.opacity = "1"; setTimeout(() => { E.damageOverlay.style.opacity = "0"; }, 120); }
    updateHUD();
    if (PLAYER.health <= 0) playerDie();
}

/* ---------- CAMERA (zoomed to screen height) ---------- */
function shake(power, ms) { if (!FX.shake) return; FX.shakePower = power; FX.shakeUntil = performance.now() + ms; }
function updateCamera(snap, dt) {
    const tx = PLAYER.x - CAM.w / 2, ty = PLAYER.y - 80 - CAM.h / 2;
    const k = snap ? 1 : 1 - Math.pow(1 - CONFIG.CAMERA_SMOOTH, (dt || 0.016) * 60);
    CAM.x += (tx - CAM.x) * k; CAM.y += (ty - CAM.y) * k;
    CAM.x = clamp(CAM.x, 0, Math.max(0, CONFIG.WORLD_WIDTH - CAM.w));
    CAM.y = clamp(CAM.y, 0, Math.max(0, CONFIG.WORLD_HEIGHT - CAM.h));
    let ox = 0, oy = 0;
    if (performance.now() < FX.shakeUntil) { ox = (Math.random() - 0.5) * FX.shakePower; oy = (Math.random() - 0.5) * FX.shakePower; }
    if (E.gameWorld) E.gameWorld.style.transform = `scale(${Z}) translate(${-CAM.x + ox}px,${-CAM.y + oy}px)`;
}

/* ---------- COMBAT ---------- */
function retrigger(el, cls) { if (!el) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }
const hit = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
function swordBox() {
    const b = { x: PLAYER.x, y: PLAYER.y - 170, w: ATTACK.range, h: 180 };
    b.x += PLAYER.facing > 0 ? -20 : -(ATTACK.range - 20);
    return b;
}
/* turn towards the closest enemy so taps on a phone don't whiff */
function autoFace() {
    let best = null, bd = 300;
    GHOSTS.forEach((g) => { if (!g.alive || !g.awake) return; const d = dist(pcx(), pcy(), g.x, g.y); if (d < bd) { bd = d; best = g; } });
    if (BOSS.active && !BOSS.intro) { const d = dist(pcx(), pcy(), BOSS.x, BOSS.y) - 120; if (d < bd) { bd = d; best = BOSS; } }
    if (best && Math.abs(best.x - PLAYER.x) > 20) PLAYER.facing = best.x > PLAYER.x ? 1 : -1;
}
function startAttack() {
    if (!GAME.running || GAME.paused || GAME.gameOver || GAME.victory || ATTACK.cd > 0 || DASH.active) return;
    ATTACK.cd = 0.28; PLAYER.attacking = true;
    ATTACK.combo = (ATTACK.combo % 3) + 1;
    autoFace();
    sfx(E.swordSlash, 0.8); buzz(8);
    retrigger(E.slashEffect, "play");
    if (E.player) { E.player.classList.remove("attack1", "attack2", "attack3"); void E.player.offsetWidth; E.player.classList.add("attack" + ATTACK.combo); }
    const box = swordBox();
    damageGhosts(ATTACK.damage, box);
    deflectProjectiles(box);
    if (BOSS.active && dist(pcx(), pcy(), BOSS.x, BOSS.y) <= ATTACK.range + 110) hurtBoss(ATTACK.damage);
}

/* ---------- GHOSTS ---------- */
function createGhost(type, x, y, minion) {
    const T = GHOST_TYPES[type];
    const el = document.createElement("div");
    el.className = `ghost ${T.cls}`;
    Object.assign(el.style, { position: "absolute", width: `${110 * T.size}px`, height: `${140 * T.size}px`, left: x + "px", top: y + "px", display: "flex", animation: "none", transform: "translate(-50%,-50%)" });
    const img = document.createElement("img");
    img.src = GHOST_SRC; img.alt = ""; img.draggable = false;
    const bar = document.createElement("div"), fill = document.createElement("div");
    bar.className = "enemyHealth"; fill.className = "enemyHealthFill"; bar.appendChild(fill);
    el.append(img, bar);
    E.enemyLayer.appendChild(el);
    const g = {
        type, T, el, img, fill, alive: true, awake: true, minion: !!minion, health: T.hp, maxHealth: T.hp,
        x, y, facing: 1, cd: rand(0.8, 1.6), windup: 0, stun: 0, spawnT: minion ? 0.6 : 0,
        wanderT: 0, vx: 0, vy: 0, strafe: Math.random() < 0.5 ? 1 : -1, strafeT: rand(1, 2.5),
        float: rand(0, 1000), seed: Math.random() * 6.28, age: 0, lastHit: 0, dot: null
    };
    if (minion) el.style.opacity = "0.3";
    if (!minion && E.miniMapFrame) {
        const dot = document.createElement("div");
        dot.className = "miniGhost"; E.miniMapFrame.appendChild(dot); g.dot = dot;
    }
    GHOSTS.push(g);
    return g;
}
const ghostsLeft = () => GHOSTS.filter((g) => g.alive && !g.minion).length;

function initGhosts() {
    GHOSTS.length = 0;
    document.querySelectorAll(".ghost").forEach((n) => n.remove());
    LANTERNS.forEach((l, i) => {
        (LANTERN_GUARDS[i] || []).forEach((type) => {
            const a = rand(0, Math.PI * 2), r = rand(230, 400);
            createGhost(type, clamp(l.x + Math.cos(a) * r, 150, CONFIG.WORLD_WIDTH - 150), clamp(l.y + Math.sin(a) * r * 0.7, 330, CONFIG.WORLD_HEIGHT - 120));
        });
    });
    ROAMERS.forEach((type) => createGhost(type, 2500 + rand(-700, 700), 1250 + rand(-350, 350)));
    GAME.totalGhosts = GHOSTS.length;
    updateGhostCounter(); updateMissions();
}
function updateGhostCounter() { if (E.aliveGhosts) E.aliveGhosts.textContent = ghostsLeft(); }

function updateGhosts(dt) {
    const now = performance.now(), near = [];
    for (const g of GHOSTS) {
        if (!g.alive) continue;
        const T = g.T;
        const awake = dist(pcx(), pcy(), g.x, g.y) < CONFIG.ACTIVE_RADIUS;
        if (awake !== g.awake) { g.awake = awake; g.el.style.visibility = awake ? "visible" : "hidden"; }
        if (!awake) continue;
        near.push(g);
        g.age += dt; g.cd = Math.max(0, g.cd - dt);
        if (g.spawnT > 0) { g.spawnT -= dt; if (g.spawnT <= 0) g.el.style.opacity = "1"; renderGhost(g, now); continue; }
        if (g.stun > 0) { g.stun -= dt; renderGhost(g, now); continue; }

        const dx = pcx() - g.x, dy = pcy() - g.y, d = Math.hypot(dx, dy) || 1;
        if (g.windup > 0) {                                   /* telegraphed attack — time to dash away */
            g.windup -= dt;
            if (g.windup <= 0) { g.el.classList.remove("windup"); ghostStrike(g); }
            renderGhost(g, now); continue;
        }
        const spd = T.speed * dt;
        if (d < T.detect) {
            if (T.ranged) {
                if (d > T.range) { g.x += dx / d * spd; g.y += dy / d * spd; }
                else if (d < T.keep) { g.x -= dx / d * spd; g.y -= dy / d * spd; }
                else {
                    g.strafeT -= dt; if (g.strafeT <= 0) { g.strafe = -g.strafe; g.strafeT = rand(1, 2.5); }
                    g.x += -dy / d * spd * 0.55 * g.strafe; g.y += dx / d * spd * 0.55 * g.strafe;
                }
                if (g.cd <= 0 && d <= T.range * 1.05) { g.windup = T.windup; g.el.classList.add("windup"); }
            } else if (d > T.reach) {
                let mx = dx / d, my = dy / d;
                if (T.weave) { const w = Math.sin(g.age * 4 + g.seed) * 0.7; const tx = mx - my * w, ty = my + mx * w; mx = tx; my = ty; }
                g.x += mx * spd; g.y += my * spd;
            } else if (g.cd <= 0) { g.windup = T.windup; g.el.classList.add("windup"); }
        } else {
            g.wanderT -= dt;
            if (g.wanderT <= 0) { const a = Math.random() * Math.PI * 2; g.vx = Math.cos(a) * 40; g.vy = Math.sin(a) * 40; g.wanderT = rand(1, 3); }
            g.x += g.vx * dt; g.y += g.vy * dt;
        }
        g.x = clamp(g.x, 60, CONFIG.WORLD_WIDTH - 60);
        g.y = clamp(g.y, 300, CONFIG.WORLD_HEIGHT - 60);
    }
    /* keep ghosts from stacking on top of each other */
    for (let i = 0; i < near.length; i++) {
        for (let j = i + 1; j < near.length; j++) {
            const a = near[i], b = near[j], d = dist(a.x, a.y, b.x, b.y), min = 70 * (a.T.size + b.T.size) / 2;
            if (d >= min) continue;
            const push = (min - d) / 2, ux = d > 0.01 ? (b.x - a.x) / d : Math.cos(i + j), uy = d > 0.01 ? (b.y - a.y) / d : Math.sin(i + j);
            a.x -= ux * push; a.y -= uy * push; b.x += ux * push; b.y += uy * push;
        }
    }
    near.forEach((g) => renderGhost(g, now));
}
function renderGhost(g, now) {
    g.el.style.left = g.x + "px";
    g.el.style.top = (g.y + Math.sin(now * 0.002 + g.float) * 8) + "px";
    if (g.img) g.img.style.transform = pcx() > g.x ? "scaleX(1)" : "scaleX(-1)";
}
function ghostStrike(g) {
    const T = g.T;
    g.cd = T.cd;
    if (T.ranged) {
        const dx = pcx() - g.x, dy = pcy() - g.y, d = Math.hypot(dx, dy) || 1;
        fireProjectile(g.x, g.y - 20, dx / d, dy / d, 340, T.dmg, "ghost");
        sfx(E.ghostAttack, 0.4);
    } else if (dist(pcx(), pcy(), g.x, g.y) <= T.reach * 1.3) {
        hurtPlayer(T.dmg, 8);
    }
}
function damageGhosts(amount, box) {
    const now = performance.now();
    let hits = 0;
    GHOSTS.forEach((g) => {
        if (!g.alive || !g.awake || g.spawnT > 0) return;
        const s = g.T.size;
        if (!hit(box, { x: g.x - 50 * s, y: g.y - 70 * s, w: 100 * s, h: 140 * s })) return;
        if (now - g.lastHit < 200) return;
        g.lastHit = now; hits++;
        harmGhost(g, amount, true);
    });
    if (hits) shake(5, 120);
}
function harmGhost(g, amount, knock) {
    g.health -= amount;
    if (g.fill) g.fill.style.width = Math.max(0, g.health / g.maxHealth * 100) + "%";
    if (g.health <= 0) { killGhost(g); return; }
    if (knock) {
        const dir = g.x >= PLAYER.x ? 1 : -1;
        g.x = clamp(g.x + dir * 55 * (1 - g.T.resist), 60, CONFIG.WORLD_WIDTH - 60);
        g.stun = 0.18 * (1 - g.T.resist);
        if (g.windup > 0 && g.T.resist < 0.5) { g.windup = 0; g.el.classList.remove("windup"); g.cd = 0.6; }
    }
    g.el.classList.add("hit"); setTimeout(() => g.el.classList.remove("hit"), 120);
}
function killGhost(g) {
    if (!g.alive) return;
    g.alive = false; g.el.classList.remove("windup");
    setScore(g.T.score);
    g.el.style.transition = "opacity .5s"; g.el.style.opacity = "0";
    setTimeout(() => g.el.remove(), 500);
    if (g.dot) g.dot.style.display = "none";
    if (g.minion) return;
    GAME.kills++;
    updateGhostCounter(); updateHUD(); updateMissions();
    if (ghostsLeft() === 0) { notify("ALL GHOSTS DEFEATED!"); maybeSpawnBoss(); }
    else notify(`GHOST DEFEATED ${GAME.kills}/${GAME.totalGhosts}`);
}

/* ---------- PROJECTILES ---------- */
function fireProjectile(x, y, dirx, diry, speed, dmg, kind) {
    const r = kind === "boss" ? 26 : 16, el = document.createElement("div");
    el.className = `wail${kind === "boss" ? " boss" : ""}`;
    el.style.width = el.style.height = `${r * 2}px`;
    E.projectileLayer.appendChild(el);
    const p = { el, x, y, vx: dirx * speed, vy: diry * speed, dmg, life: 5, r };
    PROJ.push(p); drawProjectile(p);
}
function drawProjectile(p) { p.el.style.transform = `translate(${p.x - p.r}px,${p.y - p.r}px)`; }
function updateProjectiles(dt) {
    for (let i = PROJ.length - 1; i >= 0; i--) {
        const p = PROJ[i];
        p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
        let remove = p.life <= 0 || p.x < -100 || p.x > CONFIG.WORLD_WIDTH + 100 || p.y < -100 || p.y > CONFIG.WORLD_HEIGHT + 100;
        if (!remove && !PLAYER.invincible && PLAYER.iframes <= 0 && dist(p.x, p.y, pcx(), pcy()) < p.r + 38) { hurtPlayer(p.dmg, 10); remove = true; }
        if (remove) { p.el.remove(); PROJ.splice(i, 1); } else drawProjectile(p);
    }
}
function deflectProjectiles(box) {
    for (let i = PROJ.length - 1; i >= 0; i--) {
        const p = PROJ[i];
        if (hit(box, { x: p.x - p.r, y: p.y - p.r, w: p.r * 2, h: p.r * 2 })) { p.el.remove(); PROJ.splice(i, 1); setScore(20); }
    }
}
function clearProjectiles() { PROJ.forEach((p) => p.el.remove()); PROJ.length = 0; }

/* ---------- LANTERNS ---------- */
function initLanterns() {
    LANTERNS.length = 0;
    Array.from(document.querySelectorAll("#lanternLayer .lantern")).slice(0, CONFIG.TOTAL_LANTERNS).forEach((el, i, arr) => {
        const a = i / Math.max(1, arr.length) * Math.PI * 2;
        const x = clamp(2500 + Math.cos(a) * 1100, 200, CONFIG.WORLD_WIDTH - 200);
        const y = clamp(1200 + Math.sin(a) * 1100 * 0.55, 350, CONFIG.WORLD_HEIGHT - 200);
        Object.assign(el.style, { position: "absolute", left: x + "px", top: y + "px", display: "flex", transform: "translate(-50%,-50%)", cursor: "pointer", zIndex: "20" });
        const data = { id: i + 1, el, x, y, lit: false };
        LANTERNS.push(data);
        on(el, "pointerdown", (e) => { e.preventDefault(); if (dist(pcx(), pcy(), x, y) <= CONFIG.LANTERN_HINT * 1.5) lightLantern(data); });
    });
    updateLanternCounter();
}
function updateLanternCounter() {
    if (E.lanternCounter) E.lanternCounter.textContent = `${GAME.lanterns} / ${CONFIG.TOTAL_LANTERNS}`;
    if (E.activeLanterns) E.activeLanterns.textContent = GAME.lanterns;
}
function sparkles(x, y) {
    for (let i = 0; i < 10; i++) {
        const s = document.createElement("div"), a = (i / 10) * Math.PI * 2;
        s.className = "lanternSparkle";
        s.style.left = x + "px"; s.style.top = y + "px";
        s.style.setProperty("--sx", `${Math.cos(a) * 80}px`); s.style.setProperty("--sy", `${Math.sin(a) * 80 - 20}px`);
        E.lanternLayer.appendChild(s); setTimeout(() => s.remove(), 650);
    }
}
function lightLantern(l) {
    if (l.lit) return;
    l.lit = true;
    l.el.classList.remove("inRange"); l.el.classList.add("collected");
    GAME.lanterns++; setScore(100); updateLanternCounter(); updateMissions();
    PLAYER.spirit = clamp(PLAYER.spirit + 15, 0, PLAYER.maxSpirit);
    PLAYER.health = clamp(PLAYER.health + 10, 0, PLAYER.maxHealth);
    if (E.healOverlay) { E.healOverlay.style.opacity = "1"; setTimeout(() => { E.healOverlay.style.opacity = "0"; }, 150); }
    sfx(E.lanternLight, 0.8); buzz(25); sparkles(l.x, l.y);
    notify(`SPIRIT LANTERN RESTORED ${GAME.lanterns}/${CONFIG.TOTAL_LANTERNS}`);
    setTimeout(() => { l.el.style.display = "none"; }, 550);
    if (GAME.lanterns >= CONFIG.TOTAL_LANTERNS) { notify("ALL LANTERNS RESTORED!"); maybeSpawnBoss(); }
}
function updateLanterns() {
    let near = Infinity;
    LANTERNS.forEach((l) => {
        if (l.lit) return;
        const d = dist(pcx(), pcy(), l.x, l.y);
        near = Math.min(near, d);
        l.el.classList.toggle("inRange", d <= CONFIG.LANTERN_HINT);
        if (d <= CONFIG.LANTERN_PICKUP) lightLantern(l);
    });
    const ip = E.interactionPrompt;
    if (ip && !PORTAL.active) {
        if (near <= CONFIG.LANTERN_HINT) { ip.style.display = "flex"; ip.textContent = GAME.mobile ? "WALK CLOSER OR TAP 🖐 TO COLLECT" : "WALK CLOSER OR PRESS F TO COLLECT"; }
        else ip.style.display = "none";
    }
}
function tryInteract() {
    if (!GAME.running || GAME.paused || GAME.gameOver) return;
    let best = null, bd = Infinity;
    LANTERNS.forEach((l) => { if (l.lit) return; const d = dist(pcx(), pcy(), l.x, l.y); if (d < bd) { bd = d; best = l; } });
    if (best && bd <= 420) return lightLantern(best);
    if (PORTAL.active && !PORTAL.entered && dist(pcx(), pcy(), PORTAL.x, PORTAL.y) <= 220) return goToDay6();
    notify("MOVE CLOSER TO A LANTERN");
}

/* ---------- MISSIONS ---------- */
function updateMissions() {
    const lanternsDone = GAME.lanterns >= CONFIG.TOTAL_LANTERNS, ghostsDone = GAME.totalGhosts > 0 && ghostsLeft() === 0;
    const set = (el, text, done) => { if (!el) return; el.textContent = text; el.style.textDecoration = done ? "line-through" : ""; el.style.opacity = done ? "0.6" : ""; };
    set(E.mission1, `Restore all 7 Spirit Lanterns (${GAME.lanterns}/${CONFIG.TOTAL_LANTERNS})`, lanternsDone);
    set(E.mission2, `Defeat every Cemetery Ghost (${GAME.kills}/${GAME.totalGhosts})`, ghostsDone);
    set(E.mission3, "Defeat the Ghost King", BOSS.defeated);
    if (E.objectiveTracker) {
        E.objectiveTracker.textContent = BOSS.active ? "DEFEAT THE GHOST KING"
            : (lanternsDone && ghostsDone) ? "THE GHOST KING AWAKENS…"
            : `LANTERNS ${GAME.lanterns}/${CONFIG.TOTAL_LANTERNS}  •  GHOSTS ${GAME.kills}/${GAME.totalGhosts}`;
    }
    if (E.questPanel) {
        const items = E.questPanel.querySelectorAll(".questItem"), states = [true, lanternsDone, ghostsDone, BOSS.defeated], names = ["Enter the Haunted Cemetery", "Restore 7 Spirit Lanterns", "Defeat Cemetery Ghosts", "Defeat the Ghost King"];
        let activeSet = false;
        items.forEach((it, i) => {
            const done = states[i], act = !done && !activeSet; if (act) activeSet = true;
            it.className = `questItem${done ? " completed" : act ? " active" : ""}`;
            it.textContent = `${done ? "✓" : act ? "➜" : "○"} ${names[i]}`;
        });
    }
}

/* ---------- BOSS ---------- */
function maybeSpawnBoss() {
    if (BOSS.active || BOSS.defeated) return;
    if (GAME.lanterns < CONFIG.TOTAL_LANTERNS || ghostsLeft() > 0) return;
    activateBoss();
}
function activateBoss() {
    Object.assign(BOSS, { active: true, intro: true, defeated: false, health: BOSS.maxHealth, phase: 1, x: 2500, y: 1000, cd: 1.5, windup: 0, volleyCd: 3 });
    if (E.ghostKing) Object.assign(E.ghostKing.style, { display: "flex", opacity: "1", left: BOSS.x + "px", top: BOSS.y + "px", transform: "translate(-50%,-50%)" });
    if (E.bossHUD) E.bossHUD.style.display = "block";
    if (E.bossHealthFill) E.bossHealthFill.style.width = "100%";
    if (E.bossWarning) { E.bossWarning.style.display = "flex"; setTimeout(() => { E.bossWarning.style.display = "none"; }, 2200); }
    if (E.bossIntroScreen) { E.bossIntroScreen.style.display = "flex"; setTimeout(() => { E.bossIntroScreen.style.display = "none"; }, 2600); }
    sfx(E.bossRoar, 1); shake(20, 900); notify("THE GHOST KING AWAKENS!");
    updateMissions();
    setTimeout(() => { BOSS.intro = false; }, 2800);
}
function placeBoss() {
    if (!E.ghostKing) return;
    E.ghostKing.style.left = BOSS.x + "px"; E.ghostKing.style.top = BOSS.y + "px";
    E.ghostKing.style.transform = `translate(-50%,-50%) scaleX(${pcx() > BOSS.x ? 1 : -1})`;
}
function updateBoss(dt) {
    if (!BOSS.active || BOSS.intro || BOSS.defeated) return;
    BOSS.cd = Math.max(0, BOSS.cd - dt); BOSS.volleyCd -= dt;
    const dx = pcx() - BOSS.x, dy = pcy() - BOSS.y, d = Math.hypot(dx, dy) || 1;
    if (BOSS.windup > 0) {
        BOSS.windup -= dt;
        if (BOSS.windup <= 0) {
            E.ghostKing.classList.remove("casting");
            if (BOSS.windupType === "volley") bossVolley();
            else if (dist(pcx(), pcy(), BOSS.x, BOSS.y) <= 190 * 1.3) { sfx(E.bossRoar, 0.6); hurtPlayer(BOSS.damage, 14); }
            BOSS.cd = BOSS.attackCooldown;
        }
        placeBoss(); return;
    }
    if (BOSS.phase >= 2 && BOSS.volleyCd <= 0) {
        BOSS.windup = 0.7; BOSS.windupType = "volley"; BOSS.volleyCd = BOSS.phase === 3 ? 3.2 : 4.8;
        E.ghostKing.classList.add("casting"); placeBoss(); return;
    }
    if (d > 190) { BOSS.x += dx / d * BOSS.speed * dt; BOSS.y += dy / d * BOSS.speed * dt; }
    else if (BOSS.cd <= 0) { BOSS.windup = 0.5; BOSS.windupType = "melee"; E.ghostKing.classList.add("casting"); }
    BOSS.x = clamp(BOSS.x, 200, CONFIG.WORLD_WIDTH - 200); BOSS.y = clamp(BOSS.y, 350, CONFIG.WORLD_HEIGHT - 150);
    placeBoss();
}
function bossVolley() {
    const ox = BOSS.x, oy = BOSS.y - 40, base = Math.atan2(pcy() - oy, pcx() - ox), count = BOSS.phase === 3 ? 5 : 3;
    for (let i = 0; i < count; i++) {
        const a = base + (i - (count - 1) / 2) * 0.3;
        fireProjectile(ox, oy, Math.cos(a), Math.sin(a), 320, 10, "boss");
    }
    sfx(E.bossRoar, 0.6);
}
function summonWisps(n) {
    for (let i = 0; i < n; i++) {
        if (GHOSTS.filter((g) => g.alive && g.minion).length >= 4) break;
        createGhost("wisp", clamp(BOSS.x + rand(-250, 250), 150, CONFIG.WORLD_WIDTH - 150), clamp(BOSS.y + rand(-150, 150), 330, CONFIG.WORLD_HEIGHT - 120), true);
    }
}
function hurtBoss(amount) {
    if (!BOSS.active || BOSS.intro || BOSS.defeated) return;
    BOSS.health = Math.max(0, BOSS.health - amount);
    if (E.bossHealthFill) E.bossHealthFill.style.width = (BOSS.health / BOSS.maxHealth * 100) + "%";
    shake(6, 120); retrigger(E.ghostKingSprite, "hit");
    if (BOSS.phase === 1 && BOSS.health < 650) { BOSS.phase = 2; BOSS.speed += 36; BOSS.damage += 4; BOSS.attackCooldown = 1.5; notify("THE GHOST KING GROWS STRONGER!"); summonWisps(2); }
    if (BOSS.phase === 2 && BOSS.health < 300) { BOSS.phase = 3; BOSS.speed += 36; BOSS.damage += 6; BOSS.attackCooldown = 1.1; shake(16, 400); notify("GHOST KING — RAGE MODE!"); summonWisps(2); }
    if (BOSS.health <= 0) bossDefeated();
}
function bossDefeated() {
    if (BOSS.defeated) return;
    BOSS.defeated = true; BOSS.active = false;
    setScore(5000);
    E.ghostKing.classList.remove("casting");
    GHOSTS.forEach((g) => { if (g.alive && g.minion) killGhost(g); });
    clearProjectiles();
    shake(24, 700); sfx(E.bossRoar, 1);
    if (E.ghostKing) { E.ghostKing.style.transition = "opacity .8s"; E.ghostKing.style.opacity = "0"; setTimeout(() => { E.ghostKing.style.display = "none"; }, 800); }
    if (E.bossHUD) E.bossHUD.style.display = "none";
    notify("THE GHOST KING HAS FALLEN!");
    updateMissions();
    activatePortal(BOSS.x, BOSS.y);
    setTimeout(winGame, 2000);
}

/* ---------- SKILL / DASH ---------- */
function castSpiritSkill() {
    if (!GAME.running || GAME.paused || SKILL.timer > 0) return;
    if (PLAYER.spirit < SKILL.cost) return notify("NOT ENOUGH SPIRIT");
    PLAYER.spirit -= SKILL.cost; SKILL.timer = SKILL.cooldown;
    GHOSTS.forEach((g) => { if (g.alive && g.awake && dist(pcx(), pcy(), g.x, g.y) <= SKILL.radius) harmGhost(g, SKILL.damage, true); });
    if (BOSS.active && dist(pcx(), pcy(), BOSS.x, BOSS.y) <= SKILL.radius + 120) hurtBoss(SKILL.damage);
    for (let i = PROJ.length - 1; i >= 0; i--) if (dist(PROJ[i].x, PROJ[i].y, pcx(), pcy()) <= SKILL.radius + 60) { PROJ[i].el.remove(); PROJ.splice(i, 1); }
    const ring = document.createElement("div");
    ring.className = "spiritBurst"; ring.style.left = pcx() + "px"; ring.style.top = pcy() + "px";
    E.lanternLayer.appendChild(ring); setTimeout(() => ring.remove(), 600);
    shake(10, 200); buzz(30); notify("SPIRIT BURST!");
}
function startDash() {
    if (!GAME.running || GAME.paused || DASH.active || DASH.cd > 0 || PLAYER.stamina < 20) return;
    let dx = PLAYER.vx, dy = PLAYER.vy;
    if (!dx && !dy) { dx = PLAYER.facing; dy = 0; }
    const l = Math.hypot(dx, dy);
    DASH.dx = dx / l; DASH.dy = dy / l;
    DASH.active = true; DASH.timer = DASH.duration; DASH.cd = DASH.cooldown;
    PLAYER.invincible = true; PLAYER.stamina -= 20;
    sfx(E.heroDash, 0.8); retrigger(E.dashTrail, "play");
    if (E.player) E.player.classList.add("dash");
}
function updateTimers(dt) {
    ATTACK.cd = Math.max(0, ATTACK.cd - dt);
    PLAYER.attacking = ATTACK.cd > 0.03;
    PLAYER.iframes = Math.max(0, PLAYER.iframes - dt);
    if (DASH.cd > 0) DASH.cd -= dt;
    if (SKILL.timer > 0) SKILL.timer -= dt;
    if (E.dashButton) E.dashButton.style.opacity = DASH.cd > 0 || PLAYER.stamina < 20 ? "0.5" : "1";
    if (E.skillButton) E.skillButton.style.opacity = SKILL.timer > 0 || PLAYER.spirit < SKILL.cost ? "0.5" : "1";
    if (GAME.attackHeld) startAttack();
}
function updateDash(dt) {
    if (!DASH.active) return;
    DASH.timer -= dt;
    PLAYER.x = clamp(PLAYER.x + DASH.dx * DASH.speed * dt, 60, CONFIG.WORLD_WIDTH - 60);
    PLAYER.y = clamp(PLAYER.y + DASH.dy * DASH.speed * dt, 260, CONFIG.WORLD_HEIGHT - 60);
    if (DASH.timer <= 0) { DASH.active = false; PLAYER.invincible = false; if (E.player) E.player.classList.remove("dash"); }
}

/* ---------- PORTAL / END ---------- */
function activatePortal(x, y) {
    if (PORTAL.active) return;
    Object.assign(PORTAL, { active: true, entered: false, x, y });
    const p = E.day6Portal; if (!p) return;
    Object.assign(p.style, { display: "flex", position: "absolute", left: x + "px", top: y + "px", opacity: "0", pointerEvents: "auto", transform: "translate(-50%,-60%) scale(.2)", transition: "opacity .8s, transform .8s" });
    requestAnimationFrame(() => { p.style.opacity = "1"; p.style.transform = "translate(-50%,-60%) scale(1)"; });
    sfx(E.portalSound, 0.8);
}
function updatePortal() {
    if (!PORTAL.active || PORTAL.entered || !E.day6Portal) return;
    E.day6Portal.classList.toggle("inRange", dist(pcx(), pcy(), PORTAL.x, PORTAL.y) <= 220);
}
function goToDay6() {
    if (!ACCESS.completed) return notify("SAVING PROGRESS — ONE MOMENT");
    if (PORTAL.entered) return;
    PORTAL.entered = true; GAME.running = false;
    sfx(E.portalSound, 0.8);
    if (E.victoryScreen) E.victoryScreen.style.display = "none";
    const t = document.createElement("div");
    Object.assign(t.style, { position: "fixed", inset: "0", background: "#000", zIndex: "999999", opacity: "0", transition: "opacity 1s", pointerEvents: "all" });
    document.body.appendChild(t);
    requestAnimationFrame(() => { t.style.opacity = "1"; });
    setTimeout(() => { location.href = CONFIG.NEXT_LEVEL_URL; }, 1100);
}
on(E.day6Portal, "pointerdown", (e) => { e.preventDefault(); if (BOSS.defeated) goToDay6(); else notify("DEFEAT THE GHOST KING FIRST!"); });
on(E.continueButton, "click", async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (ACCESS.completed || (await saveDay5Completion())) goToDay6();
});

function showOverlay(el) {
    if (!el) return;
    Object.assign(el.style, { position: "fixed", inset: "0", zIndex: "100000", display: "flex", pointerEvents: "auto" });
}
async function winGame() {
    if (GAME.victory || GAME.gameOver) return;
    GAME.victory = true; GAME.running = false;
    resetInputs();
    if (E.bgMusic) E.bgMusic.pause();
    sfx(E.victorySound, 0.9);
    showOverlay(E.victoryScreen);
    notify("DAY 5 COMPLETE!");
    await saveDay5Completion();
}
function playerDie() {
    if (GAME.gameOver) return;
    GAME.gameOver = true; GAME.running = false;
    resetInputs();
    if (E.bgMusic) E.bgMusic.pause();
    sfx(E.gameOverSound, 0.9);
    showOverlay(E.gameOverScreen);
}
on(E.retryGameButton, "click", () => location.reload());
on(E.quitEventButton, "click", () => { location.href = CONFIG.MAP_URL; });

let lastNote = "", lastNoteAt = 0;
function notify(text) {
    if (!E.notificationContainer) return;
    const now = performance.now();
    if (text === lastNote && now - lastNoteAt < 700) return;
    lastNote = text; lastNoteAt = now;
    const n = document.createElement("div");
    n.className = "notification"; n.textContent = text;
    E.notificationContainer.appendChild(n);
    while (E.notificationContainer.children.length > 3) E.notificationContainer.firstChild.remove();
    setTimeout(() => n.remove(), 1800);
}

/* ---------- MINIMAP + COMPASS ---------- */
function updateMiniMap() {
    const f = E.miniMapFrame; if (!f) return;
    const w = f.clientWidth || 200, h = f.clientHeight || 200;
    const mx = (x) => x / CONFIG.WORLD_WIDTH * w, my = (y) => y / CONFIG.WORLD_HEIGHT * h;
    if (E.miniPlayer) { E.miniPlayer.style.left = mx(PLAYER.x) + "px"; E.miniPlayer.style.top = my(PLAYER.y) + "px"; }
    LANTERNS.forEach((l, i) => {
        const dot = document.getElementById("miniLantern" + (i + 1)); if (!dot) return;
        dot.style.left = mx(l.x) + "px"; dot.style.top = my(l.y) + "px"; dot.style.opacity = l.lit ? "0" : "0.9"; dot.style.transform = "translate(-50%,-50%)";
    });
    GHOSTS.forEach((g) => { if (g.dot && g.alive) { g.dot.style.left = mx(g.x) + "px"; g.dot.style.top = my(g.y) + "px"; } });
    if (E.miniBoss) {
        if (BOSS.active && !BOSS.defeated) { Object.assign(E.miniBoss.style, { display: "block", left: mx(BOSS.x) + "px", top: my(BOSS.y) + "px", transform: "translate(-50%,-50%)" }); }
        else E.miniBoss.style.display = "none";
    }
}
function updateCompass() {
    if (!E.compassNeedle) return;
    let target = null, bd = Infinity;
    LANTERNS.forEach((l) => { if (l.lit) return; const d = dist(PLAYER.x, PLAYER.y, l.x, l.y); if (d < bd) { bd = d; target = l; } });
    if (!target && BOSS.active) target = BOSS;
    if (!target && PORTAL.active) target = PORTAL;
    if (!target) return;
    E.compassNeedle.style.transform = `rotate(${Math.atan2(target.y - PLAYER.y, target.x - PLAYER.x) * 180 / Math.PI + 90}deg)`;
}

/* ---------- AMBIENT ---------- */
function spawnBats() {
    const layer = E.batLayer; if (!layer) return;
    for (let i = 0; i < (GAME.mobile ? 5 : 14); i++) {
        const b = document.createElement("div");
        b.className = "bat"; b.style.top = rand(50, 500) + "px";
        b.style.animationDuration = rand(10, 18) + "s"; b.style.animationDelay = rand(0, 8) + "s";
        layer.appendChild(b);
    }
}
function scheduleLightning() {
    const l = E.lightningLayer; if (!l) return;
    setTimeout(() => {
        if (GAME.running && !GAME.paused) {
            l.style.transition = "opacity .1s"; l.style.opacity = "0.9"; sfx(E.lightningSound, 0.6);
            setTimeout(() => { l.style.opacity = "0"; }, 150);
        }
        scheduleLightning();
    }, rand(6000, 14000));
}
const RAIN = { drops: [], ctx: null };
function sizeRain() { const c = E.rainCanvasFront; if (c) { c.width = innerWidth; c.height = innerHeight; } }
function initRain() {
    const c = E.rainCanvasFront; if (!c) return;
    sizeRain(); RAIN.ctx = c.getContext("2d");
    const n = GAME.mobile ? 50 : 130;
    for (let i = 0; i < n; i++) RAIN.drops.push({ x: rand(0, innerWidth), y: rand(0, innerHeight), l: rand(10, 22), s: rand(14, 24) });
}
function drawRain() {
    const c = RAIN.ctx; if (!c) return;
    c.clearRect(0, 0, E.rainCanvasFront.width, E.rainCanvasFront.height);
    c.strokeStyle = "rgba(170,200,255,.35)"; c.lineWidth = 1; c.beginPath();
    RAIN.drops.forEach((d) => {
        c.moveTo(d.x, d.y); c.lineTo(d.x - 3, d.y + d.l);
        d.y += d.s; d.x -= 1.5;
        if (d.y > innerHeight) { d.y = -20; d.x = rand(0, innerWidth + 50); }
    });
    c.stroke();
}

/* ---------- MAIN LOOP ---------- */
function gameLoop(time) {
    if (!ENGINE.last) ENGINE.last = time;
    const dt = Math.min(0.05, (time - ENGINE.last) / 1000);
    ENGINE.last = time;
    if (GAME.running && !GAME.paused) {
        updateTimers(dt);
        if (DASH.active) updateDash(dt); else applyMovement(dt);
        regenerate(dt);
        updateGhosts(dt); updateBoss(dt); updateProjectiles(dt); updateLanterns(); updatePortal();
        updateCamera(false, dt); renderPlayer(); updateMiniMap(); updateCompass();
    }
    updateHUD(); drawRain();
    if (E.playerX) E.playerX.textContent = Math.round(PLAYER.x);
    if (E.playerY) E.playerY.textContent = Math.round(PLAYER.y);
    requestAnimationFrame(gameLoop);
}

/* ---------- SUPABASE ---------- */
function showAccessBlock(title, message, buttonText, url) {
    const old = document.getElementById("day5AccessBlock"); if (old) old.remove();
    const panel = document.createElement("div");
    panel.id = "day5AccessBlock";
    panel.style.cssText = "position:fixed;inset:0;z-index:200000;background:#05070d;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;text-align:center;font-family:system-ui,sans-serif;gap:14px;overflow-y:auto";
    const h = document.createElement("h1"); h.textContent = title; h.style.cssText = "color:#ff8a00;margin:0;font-size:clamp(24px,6vw,40px)";
    const p = document.createElement("p"); p.textContent = message; p.style.cssText = "max-width:600px;line-height:1.6";
    const mk = (text, primary, fn) => {
        const b = document.createElement("button"); b.textContent = text;
        b.style.cssText = `min-height:46px;padding:12px 24px;border-radius:8px;font-weight:800;cursor:pointer;${primary ? "border:0;background:#ff8a00;color:#05070d" : "border:1px solid #ff8a00;background:transparent;color:#ff8a00"}`;
        b.addEventListener("click", fn); return b;
    };
    panel.append(h, p, mk(buttonText, true, () => { if (url) location.href = url; else location.reload(); }));
    if (url !== CONFIG.MAP_URL) panel.append(mk("BACK TO MAP", false, () => { location.href = CONFIG.MAP_URL; }));
    document.body.appendChild(panel);
    if (E.loadingScreen) E.loadingScreen.style.display = "none";
}

async function verifyDay5Access() {
    try {
        ({ supabase } = await import("./supabase.js"));
        let user = null;
        const { data: ud } = await supabase.auth.getUser();
        user = (ud && ud.user) || null;
        if (!user) {                                                  /* getUser needs network; fall back to the stored session */
            const { data: sd } = await supabase.auth.getSession();
            user = (sd && sd.session && sd.session.user) || null;
        }
        if (!user) { showAccessBlock("SIGN IN REQUIRED", "Please sign in first. Day 5 needs a festival account with Day 4 completed.", "GO TO LOGIN", CONFIG.LOGIN_URL); return false; }
        const { data: progress, error } = await supabase
            .from("festival_progress")
            .select("user_id, festival, day4, day5")
            .eq("user_id", user.id)
            .eq("festival", CONFIG.FESTIVAL)
            .maybeSingle();
        if (error) throw error;
        if (!progress) { showAccessBlock("PROGRESS NOT FOUND", "Festival progress was not found for your account. Start from the map.", "BACK TO MAP", CONFIG.MAP_URL); return false; }
        if (progress.day4 !== true) { showAccessBlock("DAY 5 IS LOCKED", "Complete Day 4 first, then come back to the cemetery.", "BACK TO MAP", CONFIG.MAP_URL); return false; }
        ACCESS.user = user; ACCESS.checked = true; ACCESS.completed = progress.day5 === true;
        return true;
    } catch (err) {
        console.error("Day 5 Supabase access check failed:", err);
        showAccessBlock("CONNECTION PROBLEM", "Could not verify your festival progress. Check your connection and try again.", "TRY AGAIN", null);
        return false;
    }
}

/* one write with retries; refreshes the session if the token looks expired */
async function writeDay5() {
    if (!supabase || !ACCESS.user) return false;
    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            const { data, error } = await supabase
                .from("festival_progress")
                .update({ day5: true })
                .eq("user_id", ACCESS.user.id)
                .eq("festival", CONFIG.FESTIVAL)
                .eq("day4", true)
                .select("day5")
                .maybeSingle();
            if (error) throw error;
            if (data && data.day5 === true) return true;
            const { data: chk, error: chkErr } = await supabase
                .from("festival_progress").select("day5")
                .eq("user_id", ACCESS.user.id).eq("festival", CONFIG.FESTIVAL).maybeSingle();
            if (!chkErr && chk && chk.day5 === true) return true;
            throw new Error("Supabase did not confirm day5=true. Check UPDATE and SELECT RLS policies.");
        } catch (err) {
            console.error(`Day 5 save attempt ${attempt + 1} failed:`, err);
            const msg = String((err && err.message) || "").toLowerCase();
            if ((err && err.status === 401) || msg.includes("jwt") || msg.includes("expired")) { try { await supabase.auth.refreshSession(); } catch (_) {} }
            if (attempt < 2) await sleep(700 * (attempt + 1));
        }
    }
    return false;
}
function markSaved() {
    ACCESS.completed = true;
    try { localStorage.setItem("day5Complete", "true"); localStorage.setItem("day5Score", String(GAME.score)); localStorage.removeItem(CONFIG.PENDING_KEY); } catch (_) {}
}
async function saveDay5Completion() {
    if (ACCESS.completed) return true;
    if (ACCESS.saving) return false;
    if (!ACCESS.checked || !ACCESS.user) { notify("SIGN IN AND VERIFY ACCESS BEFORE SAVING"); return false; }
    if (GAME.lanterns < CONFIG.TOTAL_LANTERNS || ghostsLeft() > 0 || !BOSS.defeated) { notify("FINISH ALL OBJECTIVES FIRST"); return false; }
    ACCESS.saving = true;
    if (E.continueButton) { E.continueButton.disabled = true; E.continueButton.textContent = "SAVING PROGRESS…"; }
    try { localStorage.setItem(CONFIG.PENDING_KEY, ACCESS.user.id); } catch (_) {}     /* so a reload can finish the save */
    try {
        if (await writeDay5()) {
            markSaved();
            if (E.saveIndicator) { E.saveIndicator.style.opacity = "1"; setTimeout(() => { E.saveIndicator.style.opacity = "0"; }, 1800); }
            if (E.continueButton) { E.continueButton.disabled = false; E.continueButton.textContent = "CONTINUE TO DAY 6"; }
            return true;
        }
        notify(navigator.onLine ? "SAVE FAILED — TAP RETRY SAVE" : "OFFLINE — WILL RETRY WHEN BACK ONLINE");
        if (E.continueButton) { E.continueButton.disabled = false; E.continueButton.textContent = "RETRY SAVE"; }
        return false;
    } finally {
        ACCESS.saving = false;
    }
}
async function recoverPendingSave() {
    if (ACCESS.completed) return;
    let pending = null;
    try { pending = localStorage.getItem(CONFIG.PENDING_KEY); } catch (_) {}
    if (!pending || !ACCESS.user || pending !== ACCESS.user.id) return;
    if (await writeDay5()) { markSaved(); notify("PROGRESS RECOVERED — DAY 6 UNLOCKED"); }
}
addEventListener("online", () => { if (GAME.victory && !ACCESS.completed) saveDay5Completion(); });

/* ---------- INIT ---------- */
async function initializeGame() {
    detectDevice(); measure();
    startLoading();                                                   /* bar animates while access is verified */
    accessOk = await verifyDay5Access();
    if (!accessOk) return;
    initLanterns(); initGhosts(); spawnBats(); scheduleLightning(); initRain();
    if (E.bossHUD) E.bossHUD.style.display = "none";
    if (E.ghostKing) E.ghostKing.style.display = "none";
    if (E.interactionPrompt) E.interactionPrompt.style.display = "none";
    CAM.x = PLAYER.x - CAM.w / 2; CAM.y = PLAYER.y - CAM.h / 2;
    renderPlayer(); updateCamera(true); updateHUD(); updateMissions();
    requestAnimationFrame(gameLoop);
    maybeReady();
    recoverPendingSave();
}

if (document.readyState === "loading") addEventListener("DOMContentLoaded", initializeGame, { once: true });
else initializeGame();
