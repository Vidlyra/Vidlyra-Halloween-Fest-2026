import { supabase } from "./supabase.js";

/* VIDLYRA HALLOWEEN FEST 2026 - DAY 5 - fixed build */

const $ = (s) => document.querySelector(s);
const on = (el, ev, fn, opt) => { if (el) el.addEventListener(ev, fn, opt); };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rand = (a, b) => Math.random() * (b - a) + a;
const dist = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);
const pad6 = (n) => String(n).padStart(6, "0");

function safePlay(a) {
    if (!a) return;
    try { a.currentTime = 0; const p = a.play(); if (p && p.catch) p.catch(() => {}); } catch (e) {}
}

/* ---------- DOM ---------- */
const E = {};
[
    "loadingScreen", "loadingFill", "loadingPercent", "loadingMessage", "gameWorld", "gameRoot",
    "player", "playerContainer", "slashEffect", "dashTrail", "healthFill", "spiritFill", "healthText",
    "spiritText", "lanternCounter", "scoreCounter", "missionPopup", "mission1", "mission2", "mission3",
    "ghostKing", "bossHUD", "bossHealthFill", "bossIntroScreen", "bossWarning", "ghostKingSprite",
    "pauseMenu", "resumeButton", "restartButton", "openSettingsButton", "exitGameButton", "settingsPanel",
    "closeSettingsButton", "musicSlider", "effectsSlider", "brightnessSlider", "screenShakeToggle",
    "mobileControls", "joystickBase", "joystickStick", "attackButton", "dashButton", "skillButton",
    "interactButton", "pauseButton", "victoryScreen", "continueButton", "gameOverScreen", "retryGameButton",
    "quitEventButton", "notificationContainer", "interactionPrompt", "playerX", "playerY", "aliveGhosts",
    "activeLanterns", "day6Portal", "portalSound", "lightningLayer", "miniPlayer", "miniBoss", "miniMapFrame",
    "compassNeedle", "bgMusic", "ambientWind", "ghostAttack", "lanternLight", "swordSlash", "heroDash",
    "bossRoar", "lightningSound", "victorySound", "gameOverSound", "damageOverlay", "healOverlay",
    "statSpirit", "ghostKillCount", "muteButton", "saveIndicator", "rainCanvasFront", "inventoryPanel",
    "closeInventory"
].forEach((id) => { E[id] = document.getElementById(id); });

/* ---------- STATE ---------- */
const CONFIG = {
    PLAYER_SPEED: 6, DASH_SPEED: 16, ATTACK_DAMAGE: 25, MAX_HEALTH: 100, MAX_SPIRIT: 100, MAX_STAMINA: 100,
    TOTAL_LANTERNS: 7, WORLD_WIDTH: 5000, WORLD_HEIGHT: 2200, CAMERA_SMOOTH: 0.12,
    LANTERN_HINT: 320, LANTERN_PICKUP: 200, NEXT_LEVEL_URL: "day6-video.html",
    FESTIVAL: "halloween_2026"
};
const GAME = { running: false, paused: false, victory: false, gameOver: false, mobile: false, score: 0, lanterns: 0, kills: 0, muted: false };
const PLAYER = {
    x: 500, y: 1600, health: 100, maxHealth: 100, spirit: 100, maxSpirit: 100, stamina: 100, maxStamina: 100,
    facing: 1, vx: 0, vy: 0, attacking: false, invincible: false
};
const INPUT = { left: false, right: false, up: false, down: false };
const FX = { effects: 0.9, shake: true, shakePower: 0, shakeUntil: 0 };
const PORTAL = { active: false, entered: false, x: 0, y: 0 };
const DASH = { active: false, duration: 200, cooldown: 700, speed: CONFIG.DASH_SPEED, timer: 0, cd: 0, dx: 0, dy: 0 };
const ATTACK = { combo: 0, cooldown: false, range: 150, damage: CONFIG.ATTACK_DAMAGE };
const SKILL = { cooldown: 10000, timer: 0, cost: 30, damage: 50 };
const BOSS = { active: false, intro: false, defeated: false, phase: 1, health: 1000, maxHealth: 1000, damage: 18, speed: 2.4, attackCooldown: 1800, attackTimer: 900, x: 2500, y: 900 };
const JOY = { active: false, id: null, cx: 0, cy: 0, dx: 0, dy: 0, radius: 55 };
const CAM = { x: 0, y: 0, w: innerWidth, h: innerHeight };
const GHOSTS = [], LANTERNS = [];
const GHOST_AI = { detect: 480, attack: 95, cooldown: 1400 };
const ACCESS = { user: null, checked: false, completed: false, saving: false };
const ENGINE = { last: 0, frames: 0, timer: 0 };

const pcx = () => PLAYER.x;           // player body centre
const pcy = () => PLAYER.y - 80;

/* ---------- UI FIX: fixed-position UI must NOT live inside the transformed #gameWorld ---------- */
function hoistUI() {
    [
        "hud", "missionPanel", "missionPopup", "bossHUD", "notificationContainer", "interactionPrompt",
        "inventoryPanel", "questPanel", "dialogueContainer", "miniMap", "compass", "playerStats", "saveIndicator",
        "mobileControls", "audioControls", "debugPanel", "touchBlocker", "bossIntroScreen", "bossWarning",
        "cutsceneOverlay", "levelCompleteBanner", "popupNotification", "screenFlash", "damageOverlay",
        "healOverlay", "lightningOverlay", "screenDarkness", "vignetteEffect", "rainCanvasFront",
        "victoryScreen", "gameOverScreen", "pauseMenu", "settingsPanel"
    ].forEach((id) => {
        const el = document.getElementById(id);
        if (el && el.parentElement !== document.body) document.body.appendChild(el);
    });
    ["playerLevelBox", "xpBar", "objectiveTracker", "gameTimer", "fpsCounter", "bossTriggerZone", "dialogueContainer"]
        .forEach((id) => { const el = document.getElementById(id); if (el) el.style.display = "none"; });

    const nc = E.notificationContainer;
    if (nc) Object.assign(nc.style, { position: "fixed", top: "90px", left: "50%", transform: "translateX(-50%)", zIndex: "13000", pointerEvents: "none", display: "flex", flexDirection: "column", alignItems: "center" });
    const ip = E.interactionPrompt;
    if (ip) Object.assign(ip.style, { position: "fixed", bottom: "250px", left: "50%", transform: "translateX(-50%)", zIndex: "1300", padding: "10px 20px", borderRadius: "30px", background: "rgba(0,0,0,.8)", border: "1px solid rgba(255,255,255,.15)", gap: "8px", alignItems: "center", fontWeight: "700", display: "none", pointerEvents: "none" });
    if (E.mobileControls) E.mobileControls.style.pointerEvents = "none";
    if (E.damageOverlay) E.damageOverlay.style.transition = "opacity .35s";
    if (E.healOverlay) E.healOverlay.style.transition = "opacity .35s";
    ["victoryScreen", "gameOverScreen", "pauseMenu", "settingsPanel"].forEach((id) => {
        const el = E[id]; if (!el) return;
        el.style.position = "fixed"; el.style.inset = "0"; el.style.zIndex = "100000"; el.style.display = "none";
    });
    if (E.gameRoot) { E.gameRoot.style.height = "100dvh"; }
    if (E.miniMapFrame) {
        document.querySelectorAll(".miniLantern").forEach((d) => { d.style.transform = "translate(-50%,-50%)"; });
        if (E.miniBoss) E.miniBoss.style.transform = "translate(-50%,-50%)";
    }
}

function detectDevice() {
    const touch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    GAME.mobile = touch && innerWidth <= 992;
    if (E.mobileControls) E.mobileControls.style.display = GAME.mobile ? "flex" : "none";
}

/* ---------- LOADING ---------- */
const MESSAGES = ["Entering the cemetery...", "Summoning spirits...", "Lighting cursed lanterns...", "Awakening the Ghost King...", "Preparing your sword...", "Loading haunted world..."];

function startLoading() {
    let p = 0;
    const t = setInterval(() => {
        p = Math.min(100, p + rand(5, 11));
        if (E.loadingFill) E.loadingFill.style.width = p + "%";
        if (E.loadingPercent) E.loadingPercent.textContent = Math.floor(p) + "%";
        if (E.loadingMessage) E.loadingMessage.textContent = MESSAGES[Math.min(MESSAGES.length - 1, Math.floor(p / 100 * MESSAGES.length))];
        if (p >= 100) { clearInterval(t); setTimeout(finishLoading, 400); }
    }, 130);
}

function finishLoading() {
    GAME.running = true;
    const ls = E.loadingScreen;
    if (ls) { ls.style.opacity = "0"; ls.style.pointerEvents = "none"; setTimeout(() => { ls.style.display = "none"; }, 600); }
    if (E.missionPopup) { E.missionPopup.style.opacity = "1"; setTimeout(() => { E.missionPopup.style.opacity = "0"; }, 3500); }
    setVol(E.bgMusic, 0.5); setVol(E.ambientWind, 0.3);
    safePlay(E.bgMusic); safePlay(E.ambientWind);
}

function setVol(a, v) { if (a) a.volume = clamp(v, 0, 1); }

/* ---------- INPUT ---------- */
addEventListener("keydown", (e) => {
    if (e.repeat) return;
    switch (e.code) {
        case "ArrowLeft": case "KeyA": INPUT.left = true; break;
        case "ArrowRight": case "KeyD": INPUT.right = true; break;
        case "ArrowUp": case "KeyW": INPUT.up = true; break;
        case "ArrowDown": case "KeyS": INPUT.down = true; break;
        case "Space": e.preventDefault(); startAttack(); break;
        case "ShiftLeft": case "ShiftRight": startDash(); break;
        case "KeyE": castSpiritSkill(); break;
        case "KeyF": tryInteract(); break;
        case "KeyI": if (E.inventoryPanel) E.inventoryPanel.classList.toggle("active"); break;
        case "Escape": case "KeyP": togglePause(); break;
    }
});
addEventListener("keyup", (e) => {
    switch (e.code) {
        case "ArrowLeft": case "KeyA": INPUT.left = false; break;
        case "ArrowRight": case "KeyD": INPUT.right = false; break;
        case "ArrowUp": case "KeyW": INPUT.up = false; break;
        case "ArrowDown": case "KeyS": INPUT.down = false; break;
    }
});
addEventListener("blur", () => { INPUT.left = INPUT.right = INPUT.up = INPUT.down = false; });

/* joystick (pointer events: works for touch and mouse, anchored to base centre) */
function joyMove(e) {
    if (!JOY.active || e.pointerId !== JOY.id) return;
    let dx = e.clientX - JOY.cx, dy = e.clientY - JOY.cy;
    const len = Math.hypot(dx, dy);
    if (len > JOY.radius) { dx = dx / len * JOY.radius; dy = dy / len * JOY.radius; }
    JOY.dx = dx; JOY.dy = dy;
    if (E.joystickStick) E.joystickStick.style.transform = `translate(-50%,-50%) translate(${dx}px,${dy}px)`;
}
function joyEnd(e) {
    if (e && e.pointerId !== JOY.id) return;
    JOY.active = false; JOY.id = null; JOY.dx = JOY.dy = 0;
    if (E.joystickStick) E.joystickStick.style.transform = "translate(-50%,-50%)";
}
on(E.joystickBase, "pointerdown", (e) => {
    e.preventDefault();
    const r = E.joystickBase.getBoundingClientRect();
    JOY.active = true; JOY.id = e.pointerId; JOY.cx = r.left + r.width / 2; JOY.cy = r.top + r.height / 2;
    try { E.joystickBase.setPointerCapture(e.pointerId); } catch (_) {}
    joyMove(e);
});
on(E.joystickBase, "pointermove", joyMove);
on(E.joystickBase, "pointerup", joyEnd);
on(E.joystickBase, "pointercancel", joyEnd);

const btn = (el, fn) => on(el, "pointerdown", (e) => { e.preventDefault(); fn(); });
btn(E.attackButton, startAttack);
btn(E.dashButton, startDash);
btn(E.skillButton, castSpiritSkill);
btn(E.interactButton, tryInteract);
btn(E.pauseButton, togglePause);

/* ---------- MENUS ---------- */
function togglePause() {
    if (GAME.gameOver || GAME.victory || !GAME.running && !GAME.paused) return;
    GAME.paused = !GAME.paused;
    if (E.pauseMenu) E.pauseMenu.style.display = GAME.paused ? "flex" : "none";
    if (!GAME.paused && E.settingsPanel) E.settingsPanel.style.display = "none";
}
on(E.resumeButton, "click", () => { GAME.paused = false; E.pauseMenu.style.display = "none"; });
on(E.restartButton, "click", () => location.reload());
on(E.exitGameButton, "click", () => { location.href = "index.html"; });
on(E.openSettingsButton, "click", () => { E.settingsPanel.style.display = "flex"; });
on(E.closeSettingsButton, "click", () => { E.settingsPanel.style.display = "none"; });
on(E.musicSlider, "input", (e) => {
    const v = e.target.value / 100;
    setVol(E.bgMusic, v); setVol(E.ambientWind, v * 0.6);
});
on(E.effectsSlider, "input", (e) => { FX.effects = e.target.value / 100; });
on(E.brightnessSlider, "input", (e) => { if (E.gameRoot) E.gameRoot.style.filter = `brightness(${e.target.value}%)`; });
on(E.screenShakeToggle, "change", (e) => { FX.shake = e.target.checked; });
on(E.closeInventory, "click", () => E.inventoryPanel.classList.remove("active"));
on(E.muteButton, "click", () => {
    GAME.muted = !GAME.muted;
    document.querySelectorAll("audio").forEach((a) => { a.muted = GAME.muted; });
    E.muteButton.textContent = GAME.muted ? "🔇" : "🔊";
});
addEventListener("resize", () => { CAM.w = innerWidth; CAM.h = innerHeight; detectDevice(); sizeRain(); });

/* ---------- PLAYER ---------- */
function applyMovement() {
    let vx = 0, vy = 0;
    if (INPUT.left) vx--; if (INPUT.right) vx++; if (INPUT.up) vy--; if (INPUT.down) vy++;
    if (JOY.active) { vx += JOY.dx / JOY.radius; vy += JOY.dy / JOY.radius; }
    const len = Math.hypot(vx, vy);
    if (len > 0.05) {
        const k = Math.min(1, len) / len;
        vx *= k; vy *= k;
        PLAYER.x += vx * CONFIG.PLAYER_SPEED;
        PLAYER.y += vy * CONFIG.PLAYER_SPEED;
        if (vx < -0.1) PLAYER.facing = -1; else if (vx > 0.1) PLAYER.facing = 1;
        PLAYER.vx = vx; PLAYER.vy = vy;
    } else { PLAYER.vx = 0; PLAYER.vy = 0; }
    PLAYER.x = clamp(PLAYER.x, 60, CONFIG.WORLD_WIDTH - 60);
    PLAYER.y = clamp(PLAYER.y, 260, CONFIG.WORLD_HEIGHT - 60);
}

function renderPlayer() {
    const el = E.playerContainer; if (!el) return;
    el.style.left = PLAYER.x + "px";
    el.style.top = PLAYER.y + "px";
    el.style.transform = `translate(-50%,-100%) scaleX(${PLAYER.facing})`;
}

function updateHUD() {
    const h = Math.max(0, Math.round(PLAYER.health)), s = Math.round(PLAYER.spirit);
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

function setScore(add) {
    GAME.score += add;
    if (E.scoreCounter) E.scoreCounter.textContent = pad6(GAME.score);
}

function regenerate(dt) {
    PLAYER.health = clamp(PLAYER.health + 0.002 * dt, 0, PLAYER.maxHealth);
    PLAYER.spirit = clamp(PLAYER.spirit + 0.01 * dt, 0, PLAYER.maxSpirit);
    PLAYER.stamina = clamp(PLAYER.stamina + 0.03 * dt, 0, PLAYER.maxStamina);
}

function hurtPlayer(amount, shakePower) {
    if (PLAYER.invincible || GAME.gameOver || GAME.victory) return;
    PLAYER.health = Math.max(0, PLAYER.health - amount);
    safePlay(E.ghostAttack);
    shake(shakePower, 200);
    if (E.player) { E.player.classList.add("hurt"); setTimeout(() => E.player.classList.remove("hurt"), 250); }
    if (E.damageOverlay) { E.damageOverlay.style.opacity = "1"; setTimeout(() => { E.damageOverlay.style.opacity = "0"; }, 120); }
    updateHUD();
    if (PLAYER.health <= 0) playerDie();
}

/* ---------- CAMERA (shake is an offset, so it never fights the follow camera) ---------- */
function shake(power, ms) {
    if (!FX.shake) return;
    FX.shakePower = power; FX.shakeUntil = performance.now() + ms;
}
function updateCamera(snap) {
    const tx = PLAYER.x - CAM.w / 2, ty = PLAYER.y - 80 - CAM.h / 2;
    const k = snap ? 1 : CONFIG.CAMERA_SMOOTH;
    CAM.x += (tx - CAM.x) * k; CAM.y += (ty - CAM.y) * k;
    CAM.x = clamp(CAM.x, 0, Math.max(0, CONFIG.WORLD_WIDTH - CAM.w));
    CAM.y = clamp(CAM.y, 0, Math.max(0, CONFIG.WORLD_HEIGHT - CAM.h));
    let ox = 0, oy = 0;
    if (performance.now() < FX.shakeUntil) { ox = (Math.random() - .5) * FX.shakePower; oy = (Math.random() - .5) * FX.shakePower; }
    if (E.gameWorld) E.gameWorld.style.transform = `translate(${-CAM.x + ox}px,${-CAM.y + oy}px)`;
}

/* ---------- COMBAT ---------- */
function retrigger(el, cls) { if (!el) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }

function startAttack() {
    if (!GAME.running || GAME.paused || GAME.gameOver || GAME.victory || ATTACK.cooldown) return;
    ATTACK.cooldown = true; PLAYER.attacking = true;
    ATTACK.combo = (ATTACK.combo % 3) + 1;
    safePlay(E.swordSlash);
    retrigger(E.slashEffect, "play");
    if (E.player) { E.player.classList.remove("attack1", "attack2", "attack3"); void E.player.offsetWidth; E.player.classList.add("attack" + ATTACK.combo); }
    damageGhosts(ATTACK.damage, swordBox());
    if (BOSS.active) {
        const reach = ATTACK.range + 110;
        if (dist(pcx(), pcy(), BOSS.x, BOSS.y) <= reach) hurtBoss(ATTACK.damage);
    }
    setTimeout(() => { PLAYER.attacking = false; }, 250);
    setTimeout(() => { ATTACK.cooldown = false; }, 280);
}

function swordBox() {
    const b = { x: PLAYER.x, y: PLAYER.y - 170, w: ATTACK.range, h: 180 };
    b.x += PLAYER.facing > 0 ? -20 : -(ATTACK.range - 20);
    return b;
}
const hit = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

/* ---------- GHOSTS ---------- */
function initGhosts() {
    GHOSTS.length = 0;
    const els = Array.from(document.querySelectorAll(".ghost"));
    els.forEach((el, i) => {
        const a = i / Math.max(1, els.length) * Math.PI * 2, r = 650 + rand(-150, 250);
        const x = clamp(2500 + Math.cos(a) * r, 200, CONFIG.WORLD_WIDTH - 200);
        const y = clamp(1200 + Math.sin(a) * r * 0.6, 350, CONFIG.WORLD_HEIGHT - 200);
        Object.assign(el.style, { position: "absolute", left: x + "px", top: y + "px", display: "flex", animation: "none", transform: "translate(-50%,-50%)" });
        GHOSTS.push({ el, img: el.querySelector("img"), fill: el.querySelector(".enemyHealthFill"), alive: true, health: 100, maxHealth: 100, damage: 8, speed: rand(1.4, 2.2), x, y, vx: 0, vy: 0, state: "wander", attackTimer: 600, float: rand(0, 1000), lastHit: 0 });
    });
    updateGhostCounter();
}
const updateGhostCounter = () => { if (E.aliveGhosts) E.aliveGhosts.textContent = GHOSTS.filter((g) => g.alive).length; };

function updateGhosts(dt) {
    const now = performance.now();
    GHOSTS.forEach((g) => {
        if (!g.alive) return;
        const dx = pcx() - g.x, dy = pcy() - g.y, d = Math.hypot(dx, dy);
        if (d < GHOST_AI.attack) { g.state = "attack"; g.vx = g.vy = 0; }
        else if (d < GHOST_AI.detect) { g.state = "chase"; g.vx = dx / d * g.speed; g.vy = dy / d * g.speed; }
        else {
            g.state = "wander";
            if (Math.random() < 0.01) { const a = Math.random() * Math.PI * 2; g.vx = Math.cos(a) * 0.6; g.vy = Math.sin(a) * 0.6; }
        }
        g.x = clamp(g.x + g.vx, 60, CONFIG.WORLD_WIDTH - 60);
        g.y = clamp(g.y + g.vy, 300, CONFIG.WORLD_HEIGHT - 60);
        g.el.style.left = g.x + "px";
        g.el.style.top = (g.y + Math.sin(now * 0.002 + g.float) * 8) + "px";
        if (g.img) g.img.style.transform = pcx() > g.x ? "scaleX(1)" : "scaleX(-1)";
        if (g.state === "attack") {
            g.attackTimer -= dt;
            if (g.attackTimer <= 0) { g.attackTimer = GHOST_AI.cooldown; hurtPlayer(g.damage, 8); }
        }
    });
}

function damageGhosts(amount, box) {
    const now = performance.now();
    GHOSTS.forEach((g) => {
        if (!g.alive) return;
        if (!hit(box, { x: g.x - 50, y: g.y - 70, w: 100, h: 140 })) return;
        if (now - g.lastHit < 200) return;
        g.lastHit = now;
        harmGhost(g, amount);
    });
    shake(5, 120);
}
function harmGhost(g, amount) {
    g.health -= amount;
    if (g.fill) g.fill.style.width = Math.max(0, g.health / g.maxHealth * 100) + "%";
    if (g.health <= 0) killGhost(g);
}
function killGhost(g) {
    if (!g.alive) return;
    g.alive = false; GAME.kills++; setScore(250);
    g.el.style.transition = "opacity .5s"; g.el.style.opacity = "0";
    setTimeout(() => { g.el.style.display = "none"; }, 500);
    updateGhostCounter(); updateHUD();
    notify("+250 SCORE");
    if (GHOSTS.every((x) => !x.alive)) {
        if (E.mission2) E.mission2.style.textDecoration = "line-through";
        notify("ALL GHOSTS DEFEATED!");
        maybeSpawnBoss();
    }
}

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
function lightLantern(l) {
    if (l.lit) return;
    l.lit = true;
    l.el.classList.remove("inRange"); l.el.classList.add("collected");
    GAME.lanterns++; setScore(100); updateLanternCounter();
    PLAYER.spirit = clamp(PLAYER.spirit + 15, 0, PLAYER.maxSpirit);
    PLAYER.health = clamp(PLAYER.health + 10, 0, PLAYER.maxHealth);
    if (E.healOverlay) { E.healOverlay.style.opacity = "1"; setTimeout(() => { E.healOverlay.style.opacity = "0"; }, 150); }
    safePlay(E.lanternLight);
    notify("SPIRIT LANTERN RESTORED!");
    setTimeout(() => { l.el.style.display = "none"; }, 550);
    if (GAME.lanterns >= CONFIG.TOTAL_LANTERNS) {
        if (E.mission1) E.mission1.style.textDecoration = "line-through";
        notify("ALL LANTERNS RESTORED!");
        maybeSpawnBoss();
    }
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
        if (near <= CONFIG.LANTERN_HINT) { ip.style.display = "flex"; ip.textContent = "WALK CLOSER OR PRESS F TO COLLECT LANTERN"; }
        else ip.style.display = "none";
    }
}
function tryInteract() {
    if (!GAME.running || GAME.paused || GAME.gameOver) return;
    let best = null, bd = Infinity;
    LANTERNS.forEach((l) => { if (l.lit) return; const d = dist(pcx(), pcy(), l.x, l.y); if (d < bd) { bd = d; best = l; } });
    if (best && bd <= 420) return lightLantern(best);
    if (PORTAL.active && !PORTAL.entered && dist(pcx(), pcy(), PORTAL.x, PORTAL.y) <= 160) return goToDay6();
    notify("MOVE CLOSER TO A LANTERN");
}

/* ---------- BOSS ---------- */
function maybeSpawnBoss() {
    if (BOSS.active || BOSS.defeated) return;
    if (GAME.lanterns < CONFIG.TOTAL_LANTERNS || GHOSTS.some((g) => g.alive)) return;
    activateBoss();
}
function activateBoss() {
    Object.assign(BOSS, { active: true, intro: true, defeated: false, health: BOSS.maxHealth, phase: 1, x: 2500, y: 1000 });
    if (E.ghostKing) Object.assign(E.ghostKing.style, { display: "flex", opacity: "1", left: BOSS.x + "px", top: BOSS.y + "px", transform: "translate(-50%,-50%)" });
    if (E.bossHUD) E.bossHUD.style.display = "block";
    if (E.bossHealthFill) E.bossHealthFill.style.width = "100%";
    if (E.bossWarning) { E.bossWarning.style.display = "flex"; setTimeout(() => { E.bossWarning.style.display = "none"; }, 2200); }
    if (E.bossIntroScreen) { E.bossIntroScreen.style.display = "flex"; setTimeout(() => { E.bossIntroScreen.style.display = "none"; }, 2600); }
    safePlay(E.bossRoar); shake(20, 900); notify("THE GHOST KING AWAKENS!");
    setTimeout(() => { BOSS.intro = false; }, 2800);
}
function updateBoss(dt) {
    if (!BOSS.active || BOSS.intro || BOSS.defeated) return;
    const dx = pcx() - BOSS.x, dy = pcy() - BOSS.y, d = Math.hypot(dx, dy);
    if (d > 190) { BOSS.x += dx / d * BOSS.speed; BOSS.y += dy / d * BOSS.speed; }
    else {
        BOSS.attackTimer -= dt;
        if (BOSS.attackTimer <= 0) { BOSS.attackTimer = BOSS.attackCooldown; safePlay(E.bossRoar); hurtPlayer(BOSS.damage, 14); }
    }
    if (E.ghostKing) {
        E.ghostKing.style.left = BOSS.x + "px"; E.ghostKing.style.top = BOSS.y + "px";
        E.ghostKing.style.transform = `translate(-50%,-50%) scaleX(${dx > 0 ? 1 : -1})`;
    }
}
function hurtBoss(amount) {
    if (!BOSS.active || BOSS.intro || BOSS.defeated) return;
    BOSS.health = Math.max(0, BOSS.health - amount);
    if (E.bossHealthFill) E.bossHealthFill.style.width = (BOSS.health / BOSS.maxHealth * 100) + "%";
    shake(6, 120); retrigger(E.ghostKingSprite, "hit");
    if (BOSS.phase === 1 && BOSS.health < 650) { BOSS.phase = 2; BOSS.speed += 0.6; BOSS.damage += 4; BOSS.attackCooldown = 1500; notify("THE GHOST KING GROWS STRONGER!"); }
    if (BOSS.phase === 2 && BOSS.health < 300) { BOSS.phase = 3; BOSS.speed += 0.6; BOSS.damage += 6; BOSS.attackCooldown = 1100; shake(16, 400); notify("GHOST KING — RAGE MODE!"); }
    if (BOSS.health <= 0) bossDefeated();
}
function bossDefeated() {
    if (BOSS.defeated) return;
    BOSS.defeated = true; BOSS.active = false;
    setScore(5000);
    if (E.mission3) E.mission3.style.textDecoration = "line-through";
    shake(24, 700); safePlay(E.bossRoar);
    if (E.ghostKing) { E.ghostKing.style.transition = "opacity .8s"; E.ghostKing.style.opacity = "0"; setTimeout(() => { E.ghostKing.style.display = "none"; }, 800); }
    if (E.bossHUD) E.bossHUD.style.display = "none";
    notify("THE GHOST KING HAS FALLEN!");
    activatePortal(BOSS.x, BOSS.y);
    setTimeout(winGame, 2000);
}

/* ---------- SKILL / DASH ---------- */
function castSpiritSkill() {
    if (!GAME.running || GAME.paused || SKILL.timer > 0) return;
    if (PLAYER.spirit < SKILL.cost) return notify("NOT ENOUGH SPIRIT");
    PLAYER.spirit -= SKILL.cost; SKILL.timer = SKILL.cooldown;
    GHOSTS.forEach((g) => { if (g.alive && dist(pcx(), pcy(), g.x, g.y) <= 280) harmGhost(g, SKILL.damage); });
    if (BOSS.active && dist(pcx(), pcy(), BOSS.x, BOSS.y) <= 320) hurtBoss(SKILL.damage);
    shake(10, 200); notify("SPIRIT BURST!");
}
function startDash() {
    if (!GAME.running || GAME.paused || DASH.active || DASH.cd > 0 || PLAYER.stamina < 20) return;
    let dx = PLAYER.vx, dy = PLAYER.vy;
    if (!dx && !dy) { dx = PLAYER.facing; dy = 0; }
    const l = Math.hypot(dx, dy);
    DASH.dx = dx / l; DASH.dy = dy / l;
    DASH.active = true; DASH.timer = DASH.duration; DASH.cd = DASH.cooldown;
    PLAYER.invincible = true; PLAYER.stamina -= 20;
    safePlay(E.heroDash); retrigger(E.dashTrail, "play");
    if (E.player) E.player.classList.add("dash");
}
function updateDash(dt) {
    if (DASH.cd > 0) DASH.cd -= dt;
    if (SKILL.timer > 0) SKILL.timer -= dt;
    if (!DASH.active) return;
    DASH.timer -= dt;
    PLAYER.x = clamp(PLAYER.x + DASH.dx * DASH.speed, 60, CONFIG.WORLD_WIDTH - 60);
    PLAYER.y = clamp(PLAYER.y + DASH.dy * DASH.speed, 260, CONFIG.WORLD_HEIGHT - 60);
    if (DASH.timer <= 0) { DASH.active = false; PLAYER.invincible = false; if (E.player) E.player.classList.remove("dash"); }
}

/* ---------- PORTAL / END ---------- */
function activatePortal(x, y) {
    if (PORTAL.active) return;
    Object.assign(PORTAL, { active: true, entered: false, x, y });
    const p = E.day6Portal; if (!p) return;
    Object.assign(p.style, { display: "flex", position: "absolute", left: x + "px", top: y + "px", opacity: "0", pointerEvents: "auto", transform: "translate(-50%,-60%) scale(.2)", transition: "opacity .8s, transform .8s" });
    requestAnimationFrame(() => { p.style.opacity = "1"; p.style.transform = "translate(-50%,-60%) scale(1)"; });
    safePlay(E.portalSound);
}
function updatePortal() {
    if (!PORTAL.active || PORTAL.entered || !E.day6Portal) return;
    const near = dist(pcx(), pcy(), PORTAL.x, PORTAL.y) <= 220;
    E.day6Portal.classList.toggle("inRange", near);
}
function goToDay6() {
    if (!ACCESS.completed) return notify("SAVE DAY 5 PROGRESS BEFORE CONTINUING");
    if (PORTAL.entered) return;
    PORTAL.entered = true; GAME.running = false;
    safePlay(E.portalSound);
    if (E.victoryScreen) E.victoryScreen.style.display = "none";
    const t = document.createElement("div");
    Object.assign(t.style, { position: "fixed", inset: "0", background: "#000", zIndex: "999999", opacity: "0", transition: "opacity 1s", pointerEvents: "all" });
    document.body.appendChild(t);
    requestAnimationFrame(() => { t.style.opacity = "1"; });
    setTimeout(() => { location.href = CONFIG.NEXT_LEVEL_URL; }, 1100);
}
on(E.day6Portal, "pointerdown", (e) => { e.preventDefault(); if (BOSS.defeated) goToDay6(); else notify("DEFEAT THE GHOST KING FIRST!"); });

async function onContinue(e) {
    e.preventDefault(); e.stopPropagation();
    if (!ACCESS.completed) { if (await saveDay5Completion()) await winGame(true); return; }
    goToDay6();
}
on(E.continueButton, "click", onContinue);

function showOverlay(el) {
    if (!el) return;
    Object.assign(el.style, { position: "fixed", inset: "0", zIndex: "100000", display: "flex", pointerEvents: "auto" });
}
async function winGame(saved) {
    if (GAME.victory) return;
    GAME.running = false; GAME.paused = false;
    if (!saved && !(await saveDay5Completion())) {
        showOverlay(E.victoryScreen);
        if (E.continueButton) { E.continueButton.disabled = false; E.continueButton.textContent = "RETRY SAVE"; }
        return;
    }
    GAME.victory = true;
    safePlay(E.victorySound);
    showOverlay(E.victoryScreen);
    if (E.continueButton) { E.continueButton.disabled = false; E.continueButton.textContent = "CONTINUE TO DAY 6"; }
    notify("DAY 5 COMPLETE!");
}
function playerDie() {
    if (GAME.gameOver) return;
    GAME.gameOver = true; GAME.running = false;
    safePlay(E.gameOverSound);
    showOverlay(E.gameOverScreen);
}
on(E.retryGameButton, "click", () => location.reload());
on(E.quitEventButton, "click", () => { location.href = "index.html"; });

function notify(text) {
    if (!E.notificationContainer) return;
    const n = document.createElement("div");
    n.className = "notification"; n.textContent = text;
    E.notificationContainer.appendChild(n);
    while (E.notificationContainer.children.length > 4) E.notificationContainer.firstChild.remove();
    setTimeout(() => n.remove(), 1800);
}

/* ---------- MINIMAP + COMPASS ---------- */
function toMini(x, y) {
    const w = E.miniMapFrame.clientWidth || 200, h = E.miniMapFrame.clientHeight || 200;
    return { l: x / CONFIG.WORLD_WIDTH * w, t: y / CONFIG.WORLD_HEIGHT * h };
}
function updateMiniMap() {
    if (!E.miniMapFrame) return;
    if (E.miniPlayer) { const p = toMini(PLAYER.x, PLAYER.y); E.miniPlayer.style.left = p.l + "px"; E.miniPlayer.style.top = p.t + "px"; }
    LANTERNS.forEach((l, i) => {
        const dot = document.getElementById("miniLantern" + (i + 1)); if (!dot) return;
        const p = toMini(l.x, l.y);
        dot.style.left = p.l + "px"; dot.style.top = p.t + "px"; dot.style.opacity = l.lit ? "0" : "0.9";
    });
    if (E.miniBoss) {
        if (BOSS.active && !BOSS.defeated) { const p = toMini(BOSS.x, BOSS.y); Object.assign(E.miniBoss.style, { display: "block", left: p.l + "px", top: p.t + "px" }); }
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
    const a = Math.atan2(target.y - PLAYER.y, target.x - PLAYER.x) * 180 / Math.PI + 90;
    E.compassNeedle.style.transform = `rotate(${a}deg)`;
}

/* ---------- AMBIENT ---------- */
function spawnBats() {
    const layer = $("#batLayer"); if (!layer) return;
    for (let i = 0; i < (GAME.mobile ? 6 : 14); i++) {
        const b = document.createElement("div");
        b.className = "bat"; b.style.top = rand(50, 500) + "px";
        b.style.animationDuration = rand(10, 18) + "s"; b.style.animationDelay = rand(0, 8) + "s";
        layer.appendChild(b);
    }
}
function scheduleLightning() {
    const l = E.lightningLayer; if (!l) return;
    setTimeout(() => {
        l.style.transition = "opacity .1s"; l.style.opacity = "0.9"; safePlay(E.lightningSound);
        setTimeout(() => { l.style.opacity = "0"; }, 150);
        scheduleLightning();
    }, rand(6000, 14000));
}
const RAIN = { drops: [], ctx: null };
function sizeRain() {
    const c = E.rainCanvasFront; if (!c) return;
    c.width = innerWidth; c.height = innerHeight;
}
function initRain() {
    const c = E.rainCanvasFront; if (!c) return;
    Object.assign(c.style, { position: "fixed", inset: "0", width: "100%", height: "100%", pointerEvents: "none", zIndex: "40" });
    sizeRain(); RAIN.ctx = c.getContext("2d");
    const n = GAME.mobile ? 60 : 130;
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
    const dt = Math.min(50, time - ENGINE.last || 16);
    ENGINE.last = time;
    if (GAME.running && !GAME.paused) {
        applyMovement(); updateDash(dt); regenerate(dt);
        updateGhosts(dt); updateBoss(dt); updateLanterns(); updatePortal();
        updateCamera(false); renderPlayer(); updateMiniMap(); updateCompass();
    }
    updateHUD(); drawRain();
    if (E.playerX) E.playerX.textContent = Math.round(PLAYER.x);
    if (E.playerY) E.playerY.textContent = Math.round(PLAYER.y);
    requestAnimationFrame(gameLoop);
}

/* ---------- SUPABASE ---------- */
function showAccessBlock(message) {
    const old = document.getElementById("day5AccessBlock"); if (old) old.remove();
    const panel = document.createElement("div");
    panel.id = "day5AccessBlock";
    panel.style.cssText = "position:fixed;inset:0;z-index:200000;background:#05070d;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:28px;text-align:center;font-family:system-ui,sans-serif;gap:14px";
    const h = document.createElement("h1"); h.textContent = "DAY 5 LOCKED"; h.style.cssText = "color:#ff8a00;margin:0";
    const p = document.createElement("p"); p.textContent = message; p.style.cssText = "max-width:600px;line-height:1.6";
    const b = document.createElement("button"); b.textContent = "RETRY CHECK";
    b.style.cssText = "padding:12px 22px;border:0;border-radius:8px;background:#ff8a00;color:#05070d;font-weight:800;cursor:pointer";
    b.addEventListener("click", () => location.reload());
    const back = document.createElement("button"); back.textContent = "BACK TO MAP";
    back.style.cssText = "padding:10px 20px;border:1px solid #ff8a00;border-radius:8px;background:transparent;color:#ff8a00;font-weight:700;cursor:pointer";
    back.addEventListener("click", () => { location.href = "index.html"; });
    panel.append(h, p, b, back);
    document.body.appendChild(panel);
    if (E.loadingScreen) E.loadingScreen.style.display = "none";
}

async function verifyDay5Access() {
    try {
        const { data: sd, error: se } = await supabase.auth.getSession();
        if (se) throw se;
        const user = sd?.session?.user;
        if (!user) { showAccessBlock("Please sign in first. Day 5 requires an authenticated festival account and Day 4 completion."); return false; }
        const { data: progress, error } = await supabase
            .from("festival_progress")
            .select("user_id, festival, day4, day5")
            .eq("user_id", user.id)
            .eq("festival", CONFIG.FESTIVAL)
            .maybeSingle();
        if (error) throw error;
        if (!progress || progress.day4 !== true) { showAccessBlock("Complete Day 4 first. Day 5 access is checked against your own festival_progress row."); return false; }
        ACCESS.user = user; ACCESS.checked = true; ACCESS.completed = progress.day5 === true;
        return true;
    } catch (err) {
        console.error("Day 5 Supabase access check failed:", err);
        showAccessBlock("Could not verify your festival progress. Check your connection and Supabase RLS policies, then retry.");
        return false;
    }
}

async function saveDay5Completion() {
    if (ACCESS.saving) return false;
    if (ACCESS.completed) return true;
    if (!ACCESS.checked || !ACCESS.user) { notify("SIGN IN AND VERIFY ACCESS BEFORE SAVING"); return false; }
    if (GAME.lanterns < CONFIG.TOTAL_LANTERNS || GHOSTS.some((g) => g.alive) || !BOSS.defeated) { notify("FINISH ALL OBJECTIVES FIRST"); return false; }
    ACCESS.saving = true;
    if (E.continueButton) { E.continueButton.disabled = true; E.continueButton.textContent = "SAVING PROGRESS…"; }
    try {
        const { data, error } = await supabase
            .from("festival_progress")
            .update({ day5: true })
            .eq("user_id", ACCESS.user.id)
            .eq("festival", CONFIG.FESTIVAL)
            .eq("day4", true)
            .select("user_id, festival, day4, day5");
        if (error) throw error;
        if (!Array.isArray(data) || data.length !== 1 || data[0].day5 !== true) throw new Error("Supabase did not confirm the Day 5 update. Check UPDATE and SELECT RLS policies.");
        ACCESS.completed = true;
        try { localStorage.setItem("day5Complete", "true"); localStorage.setItem("day5Score", String(GAME.score)); } catch (_) {}
        if (E.saveIndicator) { E.saveIndicator.style.opacity = "1"; setTimeout(() => { E.saveIndicator.style.opacity = "0"; }, 1800); }
        return true;
    } catch (err) {
        console.error("Day 5 completion save failed:", err);
        notify("SAVE FAILED — PRESS RETRY SAVE");
        if (E.continueButton) { E.continueButton.disabled = false; E.continueButton.textContent = "RETRY SAVE"; }
        return false;
    } finally {
        ACCESS.saving = false;
    }
}

/* ---------- INIT ---------- */
async function initializeGame() {
    hoistUI();
    if (E.loadingMessage) E.loadingMessage.textContent = "Verifying your progress...";
    if (!(await verifyDay5Access())) return;
    detectDevice();
    initGhosts(); initLanterns(); spawnBats(); scheduleLightning(); initRain();
    if (E.bossHUD) E.bossHUD.style.display = "none";
    if (E.ghostKing) E.ghostKing.style.display = "none";
    if (E.interactionPrompt) E.interactionPrompt.style.display = "none";
    CAM.x = PLAYER.x - CAM.w / 2; CAM.y = PLAYER.y - CAM.h / 2;
    renderPlayer(); updateCamera(true); updateHUD();
    ENGINE.last = performance.now();
    startLoading();
    requestAnimationFrame(gameLoop);
}

if (document.readyState === "loading") addEventListener("DOMContentLoaded", initializeGame, { once: true });
else initializeGame();
