/* VIDLYRA HALLOWEEN FEST 2026 - DAY 6 - HAUNTED MANSION
   Works as a normal <script> or as type="module" (Supabase is loaded with dynamic import). */
(() => {
"use strict";

const $ = (id) => document.getElementById(id);
const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

/* ---------- DOM ---------- */
const world = $("gameWorld"), player = $("player"), boss = $("boss");
const attackEffect = $("attackEffect"), dashEffect = $("dashEffect"), hurtEffect = $("hurtEffect");
const soldierEls = [...document.querySelectorAll(".mansion-soldier")];
const crystals = [...document.querySelectorAll(".crystal")];
const healthOrbs = [...document.querySelectorAll(".healthOrb")];
const healthFill = $("healthFill"), spiritFill = $("spiritFill"), healthText = $("healthText"), spiritText = $("spiritText");
const crystalCounter = $("crystalCounter"), scoreCounter = $("scoreCounter");
const speedSlider = $("speedSlider"), speedValue = $("speedValue");
const missionCrystal = $("missionCrystal"), missionSoldier = $("missionSoldier"), missionBoss = $("missionBoss");
const bossHUD = $("bossHUD"), bossHealthFill = $("bossHealthFill");
const notification = $("notification"), interactionText = $("interactionText");
const pauseMenu = $("pauseMenu"), victoryScreen = $("victoryScreen"), gameOverScreen = $("gameOverScreen");
const resumeButton = $("resumeButton"), continueButton = $("continueButton"), retryButton = $("retryButton");
const A = {};
["bgMusic", "footstepSound", "collectSound", "attackSound", "dashSound", "hurtSound", "soldierSound", "bossMusic", "bossRoar", "victorySound", "gameOverSound"]
    .forEach((id) => { A[id] = $(id); });

/* ---------- CONFIG ---------- */
const FESTIVAL_ID = "halloween_2026";
const NEXT_URL = "day7-quiz.html";
const ORB_HEAL = 30, ORB_RESPAWN = 18;
const ATTACK_RANGE = 170, ATTACK_DAMAGE = 25, ATTACK_COOLDOWN = 0.35;   /* px */
const DASH_COST = 25, DASH_TIME = 0.18, DASH_SPEED = 90, DASH_COOLDOWN = 0.6;
const IFRAMES = 0.6, PICKUP_RADIUS = 70, CLICK_RADIUS = 260;            /* px */
const SOLDIER_REACH = 95, BOSS_REACH = 140;                              /* px */

let supabase = null;
let festivalUser = null, day6Saved = false, day6SaveInProgress = false, rowExists = false;

const state = {
    running: true, paused: false, gameOver: false, victory: false, lastTime: 0, speedMultiplier: 1,
    score: 0, crystals: 0, kills: 0, health: 100, maxHealth: 100, spirit: 100, maxSpirit: 100,
    player: { x: 50, y: 15, speed: 24, facing: 1, attacking: false, dashing: false, attackCd: 0, dashCd: 0, dashT: 0, dashDx: 1, dashDy: 0, invincible: 0, stepT: 0 },
    soldiers: [
        { active: true, x: 72, y: 20, health: 100, maxHealth: 100, speed: 110, attackCooldown: 1, attackDelay: 1.4, damage: 8 },
        { active: true, x: 22, y: 22, health: 100, maxHealth: 100, speed: 118, attackCooldown: 1, attackDelay: 1.4, damage: 8 },
        { active: true, x: 58, y: 60, health: 100, maxHealth: 100, speed: 100, attackCooldown: 1, attackDelay: 1.4, damage: 8 }
    ],
    boss: { active: false, defeated: false, x: 50, y: 40, health: 300, maxHealth: 300, speed: 85, attackCooldown: 1.5, attackDelay: 2, hitCooldown: 0, damage: 15, phase: 1 },
    keys: { up: false, down: false, left: false, right: false }
};

/* ---------- WORLD SIZE (all distances are measured in real pixels) ---------- */
let W = innerWidth, H = innerHeight;
function measure() { const r = world.getBoundingClientRect(); W = r.width || innerWidth; H = r.height || innerHeight; }
addEventListener("resize", measure);
function delta(ax, ay, bx, by) {            /* vector a -> b in px, y up */
    const dx = (bx - ax) * W / 100, dy = (by - ay) * H / 100;
    return { dx, dy, d: Math.hypot(dx, dy) };
}

/* ---------- HELPERS ---------- */
function playSound(a, vol = 1) {
    if (!a) return;
    try { a.volume = clamp(vol, 0, 1); a.currentTime = 0; const p = a.play(); if (p && p.catch) p.catch(() => {}); } catch (_) {}
}
function setSprite(img, src) { if (img && !img.src.endsWith(src)) img.src = src; }
const show = (el) => el && el.classList.remove("hidden");
const hide = (el) => el && el.classList.add("hidden");
const retrigger = (el, cls) => { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };
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
    el.style.scale = state.player.facing < 0 ? "-1 1" : "1 1";   /* composes with the CSS keyframes */
    retrigger(el, "active");
    clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove("active"), 400);
}
const allSoldiersDefeated = () => state.soldiers.every((s) => !s.active);
function updateHint() {
    if (!interactionText) return;
    if (state.boss.active) interactionText.textContent = "DEFEAT THE HAUNTED GUARDIAN";
    else if (state.crystals < 6) interactionText.textContent = `COLLECT THE ANCIENT CRYSTALS (${state.crystals}/6)`;
    else if (!allSoldiersDefeated()) interactionText.textContent = "DEFEAT THE MANSION SOLDIERS";
}

/* ---------- SUPABASE ---------- */
async function checkFestivalAccess() {
    try {
        ({ supabase } = await import("./supabase.js"));
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            alert("Please sign in to play VIDLYRA Halloween Fest 2026.");
            location.href = "login.html";
            return false;
        }
        festivalUser = user;
        const { data, error } = await supabase
            .from("festival_progress")
            .select("day4, day5, day6")
            .eq("user_id", user.id)
            .eq("festival", FESTIVAL_ID)
            .maybeSingle();
        if (error) { console.error("Progress lookup failed:", error); alert("Unable to load festival progress. Please try again."); location.href = "map.html"; return false; }
        if (!data) { alert("Festival progress was not found for your account."); location.href = "map.html"; return false; }
        rowExists = true;
        if (data.day5 !== true) { alert("🔒 Complete Day 5 — The Haunted Cemetery — before entering Day 6."); location.href = "map.html"; return false; }
        day6Saved = data.day6 === true;
        return true;
    } catch (err) {
        console.error("Unexpected festival access error:", err);
        alert("Unable to verify festival access. Please try again.");
        location.href = "map.html";
        return false;
    }
}

async function saveDay6Completion() {
    if (day6Saved) return true;
    if (!state.victory) return false;
    if (!supabase || !festivalUser || !rowExists) { showNotification("SIGN IN REQUIRED TO SAVE PROGRESS"); return false; }
    if (day6SaveInProgress) return false;
    day6SaveInProgress = true;
    continueButton.disabled = true; continueButton.textContent = "SAVING PROGRESS...";
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
        if (!data || data.day6 !== true) throw new Error("Supabase did not confirm day6=true. Check the row and RLS policies.");
        day6Saved = true;
        try { localStorage.setItem("day6Complete", "true"); localStorage.setItem("day6Score", String(state.score)); } catch (_) {}
        showNotification("DAY 6 COMPLETE — DAY 7 UNLOCKED");
        continueButton.disabled = false; continueButton.textContent = "CONTINUE TO DAY 7";
        return true;
    } catch (err) {
        console.error("Failed to save Day 6 completion:", err);
        showNotification("SAVE FAILED — CLICK CONTINUE TO RETRY");
        continueButton.disabled = false; continueButton.textContent = "RETRY SAVE / CONTINUE";
        return false;
    } finally {
        day6SaveInProgress = false;
    }
}

/* ---------- INIT ---------- */
async function init() {
    if (!(await checkFestivalAccess())) return;
    measure();
    setupKeyboard(); setupSpeedControl(); setupPickups(); setupMobileControls(); setupButtons();
    document.addEventListener("visibilitychange", () => {
        state.lastTime = 0;
        if (document.hidden && state.running && !state.paused) togglePause();
    });
    state.soldiers.forEach((s, i) => { s.el = soldierEls[i] || null; if (s.el) makeBar(s); renderSoldier(s); });
    updateMissionSoldierText(); updateHint(); updateHUD(); renderPlayer();
    A.bgMusic.volume = 0.35;
    A.bgMusic.play().catch(() => {
        document.addEventListener("pointerdown", () => { if (!state.paused && !state.boss.active && !state.victory && !state.gameOver) A.bgMusic.play().catch(() => {}); }, { once: true });
    });
    showNotification("ENTER THE HAUNTED MANSION");
    requestAnimationFrame(gameLoop);
}

/* ---------- INPUT ---------- */
const KEYMAP = { w: "up", arrowup: "up", s: "down", arrowdown: "down", a: "left", arrowleft: "left", d: "right", arrowright: "right" };
function setupKeyboard() {
    addEventListener("keydown", (e) => {
        const k = e.key.toLowerCase();
        if (KEYMAP[k]) { e.preventDefault(); state.keys[KEYMAP[k]] = true; return; }
        if (e.repeat) return;
        if (k === " " || k === "e") { e.preventDefault(); attack(); }
        else if (k === "shift") dash();
        else if (k === "p" || k === "escape") togglePause();
    });
    addEventListener("keyup", (e) => { const d = KEYMAP[e.key.toLowerCase()]; if (d) state.keys[d] = false; });
    addEventListener("blur", () => { for (const k in state.keys) state.keys[k] = false; });
}
function setupSpeedControl() {
    speedSlider.addEventListener("input", () => {
        state.speedMultiplier = Number(speedSlider.value);
        speedValue.textContent = `${state.speedMultiplier.toFixed(1)}x`;
    });
}
function setupMobileControls() {
    document.querySelectorAll(".moveButton").forEach((b) => {
        const dir = b.dataset.key;
        const set = (v) => (e) => { e.preventDefault(); state.keys[dir] = v; };
        b.addEventListener("pointerdown", set(true));
        ["pointerup", "pointerleave", "pointercancel"].forEach((ev) => b.addEventListener(ev, set(false)));
    });
    const act = (id, fn) => { const b = $(id); if (b) b.addEventListener("pointerdown", (e) => { e.preventDefault(); fn(); }); };
    act("mobileAttack", attack); act("mobileDash", dash);
}
function setupButtons() {
    resumeButton.addEventListener("click", togglePause);
    retryButton.addEventListener("click", () => location.reload());
    continueButton.addEventListener("click", async () => {
        if (!state.victory) return;
        if (await saveDay6Completion()) location.href = NEXT_URL;
    });
}
function togglePause() {
    if (state.gameOver || state.victory) return;
    state.paused = !state.paused;
    if (state.paused) { show(pauseMenu); A.bgMusic.pause(); A.bossMusic.pause(); for (const k in state.keys) state.keys[k] = false; }
    else { hide(pauseMenu); state.lastTime = 0; (state.boss.active ? A.bossMusic : A.bgMusic).play().catch(() => {}); }
}

/* ---------- CRYSTALS + VITALITY ORBS ---------- */
function setupPickups() {
    crystals.forEach((c) => {
        c._px = parseFloat(c.style.left) || 0; c._py = parseFloat(c.style.bottom) || 0;
        c.addEventListener("click", () => {
            if (delta(state.player.x, state.player.y, c._px, c._py).d <= CLICK_RADIUS) collectCrystal(c);
            else showNotification("MOVE CLOSER TO THE CRYSTAL");
        });
    });
    healthOrbs.forEach((o) => {
        o._px = parseFloat(o.style.left) || 0; o._py = parseFloat(o.style.bottom) || 0; o._respawn = 0;
        o.addEventListener("click", () => {
            if (delta(state.player.x, state.player.y, o._px, o._py).d <= CLICK_RADIUS) collectOrb(o, true);
            else showNotification("MOVE CLOSER TO THE ORB");
        });
    });
}
function collectCrystal(c) {
    if (c.classList.contains("collected")) return;
    c.classList.add("collected");
    state.crystals++; state.score += 500;
    playSound(A.collectSound, 0.65);
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
    const p = state.player;
    crystals.forEach((c) => { if (!c.classList.contains("collected") && delta(p.x, p.y, c._px, c._py).d <= PICKUP_RADIUS) collectCrystal(c); });
    healthOrbs.forEach((o) => { if (o._respawn <= 0 && state.health < state.maxHealth && delta(p.x, p.y, o._px, o._py).d <= PICKUP_RADIUS) collectOrb(o); });
}
function updateOrbs(dt) {
    healthOrbs.forEach((o) => {
        if (o._respawn <= 0) return;
        o._respawn -= dt;
        if (o._respawn <= 0) { o._respawn = 0; o.classList.remove("collected"); retrigger(o, "ready-pulse"); setTimeout(() => o.classList.remove("ready-pulse"), 700); }
    });
}

/* ---------- PLAYER ---------- */
function updatePlayer(dt) {
    const p = state.player;
    p.attackCd = Math.max(0, p.attackCd - dt); p.dashCd = Math.max(0, p.dashCd - dt); p.invincible = Math.max(0, p.invincible - dt);
    if (!p.dashing) state.spirit = Math.min(state.maxSpirit, state.spirit + 6 * dt);
    if (p.dashing) {
        p.dashT -= dt;
        p.x = clamp(p.x + p.dashDx * DASH_SPEED * dt, 5, 95);
        p.y = clamp(p.y + p.dashDy * DASH_SPEED * dt, 5, 65);
        if (p.dashT <= 0) p.dashing = false;
        checkPickups();
        return;
    }
    let dx = 0, dy = 0;
    if (state.keys.left) dx--; if (state.keys.right) dx++; if (state.keys.up) dy++; if (state.keys.down) dy--;
    if (dx) p.facing = dx;
    if (!dx && !dy) { if (!p.attacking) setSprite(player, "assets/images/day6/player-idle.png"); return; }
    const l = Math.hypot(dx, dy), m = p.speed * state.speedMultiplier * dt;
    p.x = clamp(p.x + dx / l * m, 5, 95); p.y = clamp(p.y + dy / l * m, 5, 65);
    if (!p.attacking) setSprite(player, "assets/images/day6/player-walk.png");
    p.stepT -= dt; if (p.stepT <= 0) { p.stepT = 0.38; playSound(A.footstepSound, 0.18); }
    checkPickups();
}
function renderPlayer() {
    const p = state.player;
    player.style.left = `${p.x}%`; player.style.bottom = `${p.y}%`;
    player.style.transform = `translateX(-50%) scaleX(${p.facing < 0 ? -1 : 1})`;   /* keeps the CSS centering */
    player.style.opacity = p.invincible > 0 && !p.dashing ? (Math.floor(performance.now() / 80) % 2 ? "0.45" : "1") : "1";
}
function inFront(p, dx) { return dx === 0 || Math.sign(dx) === p.facing || Math.abs(dx) < 60; }
function attack() {
    const p = state.player;
    if (!state.running || state.paused || p.attackCd > 0 || p.dashing) return;
    p.attackCd = ATTACK_COOLDOWN; p.attacking = true;
    setSprite(player, "assets/images/day6/player-attack.png");
    playSound(A.attackSound, 0.6); playEffect(attackEffect);
    setTimeout(() => { p.attacking = false; }, 260);
    let hits = 0;
    state.soldiers.forEach((s) => {
        if (!s.active) return;
        const v = delta(p.x, p.y, s.x, s.y);
        if (Math.abs(v.dx) > ATTACK_RANGE || Math.abs(v.dy) > ATTACK_RANGE * 0.8 || !inFront(p, v.dx)) return;
        hits++; s.health -= ATTACK_DAMAGE; s.x = clamp(s.x + p.facing * 2.5, 3, 97);
        if (s.el) { s.el.style.filter = "brightness(2)"; setTimeout(() => { if (s.el) s.el.style.filter = ""; }, 120); }
        if (s.health <= 0) killSoldier(s); else renderSoldier(s);
    });
    const b = state.boss;
    if (b.active && !b.defeated && b.hitCooldown <= 0) {
        const v = delta(p.x, p.y, b.x, b.y);
        if (Math.abs(v.dx) <= ATTACK_RANGE + 40 && Math.abs(v.dy) <= ATTACK_RANGE && inFront(p, v.dx)) { hits++; hurtBoss(ATTACK_DAMAGE); }
    }
    if (hits) state.score += 10 * hits;
    updateHUD();
}
function dash() {
    const p = state.player;
    if (!state.running || state.paused || p.dashing || p.dashCd > 0) return;
    if (state.spirit < DASH_COST) { showNotification("NOT ENOUGH SPIRIT"); return; }
    let dx = (state.keys.right ? 1 : 0) - (state.keys.left ? 1 : 0), dy = (state.keys.up ? 1 : 0) - (state.keys.down ? 1 : 0);
    if (!dx && !dy) dx = p.facing;
    const l = Math.hypot(dx, dy);
    p.dashDx = dx / l; p.dashDy = dy / l; p.dashing = true; p.dashT = DASH_TIME; p.dashCd = DASH_COOLDOWN; p.invincible = DASH_TIME + 0.1;
    state.spirit -= DASH_COST;
    playSound(A.dashSound, 0.6); playEffect(dashEffect);
}
function hurtPlayer(amount) {
    const p = state.player;
    if (p.invincible > 0 || !state.running) return;
    state.health = Math.max(0, state.health - amount);
    p.invincible = IFRAMES;
    playSound(A.hurtSound, 0.7); playEffect(hurtEffect);
    player.classList.add("hurt"); setTimeout(() => player.classList.remove("hurt"), 250);
    updateHUD();
    if (state.health <= 0) playerDie();
}
function playerDie() {
    if (state.gameOver) return;
    state.gameOver = true; state.running = false;
    for (const k in state.keys) state.keys[k] = false;
    A.bgMusic.pause(); A.bossMusic.pause();
    playSound(A.gameOverSound, 0.8);
    show(gameOverScreen);
}

/* ---------- SOLDIERS ---------- */
function makeBar(s) {
    const bar = document.createElement("div"), fill = document.createElement("div");
    Object.assign(bar.style, { position: "absolute", width: "60px", height: "6px", background: "#222", borderRadius: "4px", overflow: "hidden", pointerEvents: "none", transform: "translateX(-50%)", transition: "left .05s linear, bottom .05s linear" });
    Object.assign(fill.style, { width: "100%", height: "100%", background: "linear-gradient(90deg,#ff4444,#ff9999)", transition: "width .15s" });
    bar.appendChild(fill); s.el.parentElement.appendChild(bar); s.bar = bar; s.barFill = fill;
}
function renderSoldier(s) {
    if (!s.el) return;
    s.el.style.left = `${s.x}%`; s.el.style.bottom = `${s.y}%`;
    s.el.style.transform = `translateX(-50%) scaleX(${s.x > state.player.x ? -1 : 1})`;
    if (s.bar) {
        s.bar.style.left = `${s.x}%`; s.bar.style.bottom = `calc(${s.y}% + ${(s.el.offsetHeight || 140) + 6}px)`;
        s.barFill.style.width = `${clamp(s.health / s.maxHealth, 0, 1) * 100}%`;
    }
}
function updateSoldiers(dt) {
    const p = state.player;
    state.soldiers.forEach((s) => {
        if (!s.active) return;
        s.attackCooldown = Math.max(0, s.attackCooldown - dt);
        const v = delta(s.x, s.y, p.x, p.y);
        if (v.d > SOLDIER_REACH && v.d < 900) {
            s.x += v.dx / v.d * s.speed * dt / W * 100;
            s.y += v.dy / v.d * s.speed * dt / H * 100;
        } else if (v.d <= SOLDIER_REACH && s.attackCooldown <= 0) {
            s.attackCooldown = s.attackDelay; playSound(A.soldierSound, 0.4); hurtPlayer(s.damage);
        }
        renderSoldier(s);
    });
}
function killSoldier(s) {
    s.active = false; state.kills++; state.score += 300;
    if (s.el) { s.el.style.opacity = "0"; setTimeout(() => { s.el.style.display = "none"; }, 300); }
    if (s.bar) s.bar.style.display = "none";
    updateMissionSoldierText(); updateHint(); updateHUD();
    showNotification(`SOLDIER DEFEATED ${state.kills}/${state.soldiers.length}`);
    maybeActivateBoss();
}
function updateMissionSoldierText() {
    const done = allSoldiersDefeated();
    missionSoldier.textContent = `${done ? "◆" : "◇"} Defeat all Mansion Soldiers (${state.kills}/${state.soldiers.length})`;
    missionSoldier.classList.toggle("complete", done);
}

/* ---------- BOSS ---------- */
function maybeActivateBoss() {
    const b = state.boss;
    if (b.active || b.defeated || state.crystals < 6 || !allSoldiersDefeated()) return;
    b.active = true; b.attackCooldown = 1.5;
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
    b.hitCooldown = Math.max(0, b.hitCooldown - dt); b.attackCooldown = Math.max(0, b.attackCooldown - dt);
    const p = state.player, v = delta(b.x, b.y, p.x, p.y);
    if (v.d > BOSS_REACH) { b.x += v.dx / v.d * b.speed * dt / W * 100; b.y += v.dy / v.d * b.speed * dt / H * 100; }
    else if (b.attackCooldown <= 0) { b.attackCooldown = b.attackDelay; playSound(A.bossRoar, 0.5); hurtPlayer(b.damage); }
    renderBoss();
}
function hurtBoss(amount) {
    const b = state.boss;
    b.health = Math.max(0, b.health - amount); b.hitCooldown = 0.25; state.score += 50;
    boss.style.filter = "brightness(2)"; setTimeout(() => { boss.style.filter = ""; }, 120);
    if (b.phase === 1 && b.health < b.maxHealth * 0.6) { b.phase = 2; b.speed += 20; b.attackDelay = 1.6; showNotification("THE GUARDIAN GROWS ANGRY!"); }
    if (b.phase === 2 && b.health < b.maxHealth * 0.3) { b.phase = 3; b.speed += 20; b.attackDelay = 1.2; showNotification("GUARDIAN — RAGE MODE!"); }
    renderBoss();
    if (b.health <= 0) bossDefeated();
}
function bossDefeated() {
    const b = state.boss;
    if (b.defeated) return;
    b.defeated = true; b.active = false; state.score += 3000;
    boss.classList.remove("active"); bossHUD.classList.remove("active");
    missionBoss.classList.add("complete"); missionBoss.textContent = "◆ Defeat the Haunted Guardian";
    updateHUD();
    setTimeout(winGame, 900);
}
async function winGame() {
    if (state.victory || state.gameOver) return;
    state.victory = true; state.running = false;
    for (const k in state.keys) state.keys[k] = false;
    A.bossMusic.pause(); A.bgMusic.pause();
    playSound(A.victorySound, 0.8);
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
}

/* ---------- LOOP ---------- */
function gameLoop(t) {
    if (!state.lastTime) state.lastTime = t;
    const dt = Math.min(0.05, (t - state.lastTime) / 1000);
    state.lastTime = t;
    if (state.running && !state.paused) {
        updatePlayer(dt); updateSoldiers(dt); updateBoss(dt); updateOrbs(dt);
        renderPlayer(); updateHUD();
    }
    requestAnimationFrame(gameLoop);
}

if (document.readyState === "loading") addEventListener("DOMContentLoaded", init, { once: true });
else init();
})();
