/* VIDLYRA HALLOWEEN FEST 2026 - DAY 6 - HAUNTED MANSION (fixed, complete) */
import { supabase } from "./supabase.js";

const $ = (id) => document.getElementById(id);
const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

/* ---------- DOM ---------- */
const player = $("player"), boss = $("boss");
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

/* ---------- CONFIG / STATE ---------- */
const FESTIVAL_ID = "halloween_2026";
const NEXT_URL = "day7-video.html";
const ORB_HEAL = 30, ORB_RESPAWN = 18;
const ATTACK_RANGE = 14, ATTACK_DAMAGE = 25, ATTACK_COOLDOWN = 0.35;
const DASH_COST = 25, DASH_TIME = 0.18, DASH_SPEED = 90, DASH_COOLDOWN = 0.6;
const IFRAMES = 0.6;

let festivalUser = null, day6Saved = false, day6SaveInProgress = false, festivalProgressRowExists = false;

const state = {
    running: true, paused: false, gameOver: false, victory: false, lastTime: 0, speedMultiplier: 1,
    score: 0, crystals: 0, kills: 0, health: 100, maxHealth: 100, spirit: 100, maxSpirit: 100,
    player: { x: 50, y: 15, speed: 24, facing: 1, attacking: false, dashing: false, hurt: false, attackCd: 0, dashCd: 0, dashT: 0, dashDx: 1, dashDy: 0, invincible: 0, stepT: 0 },
    soldiers: [
        { active: true, x: 72, y: 20, health: 100, maxHealth: 100, speed: 8, attackCooldown: 0, attackDelay: 1.4, damage: 8 },
        { active: true, x: 22, y: 22, health: 100, maxHealth: 100, speed: 8.5, attackCooldown: 0, attackDelay: 1.4, damage: 8 },
        { active: true, x: 58, y: 60, health: 100, maxHealth: 100, speed: 7.5, attackCooldown: 0, attackDelay: 1.4, damage: 8 }
    ],
    boss: { active: false, defeated: false, x: 50, y: 40, health: 300, maxHealth: 300, speed: 5, attackCooldown: 1.5, attackDelay: 2, hitCooldown: 0, damage: 15, phase: 1 },
    keys: { up: false, down: false, left: false, right: false }
};

/* ---------- HELPERS ---------- */
function playSound(a, vol = 1) {
    if (!a) return;
    try { a.volume = clamp(vol, 0, 1); a.currentTime = 0; const p = a.play(); if (p && p.catch) p.catch(() => {}); } catch (_) {}
}
function setSprite(img, src) { if (img && !img.src.endsWith(src)) img.src = src; }
function show(el) { if (!el) return; el.classList.remove("hidden"); el.style.display = "flex"; }
function hide(el) { if (!el) return; el.classList.add("hidden"); el.style.display = "none"; }
let noteTimer = null;
function showNotification(text) {
    if (!notification) return;
    notification.textContent = text;
    notification.classList.add("show", "visible");
    notification.style.opacity = "1";
    clearTimeout(noteTimer);
    noteTimer = setTimeout(() => { notification.classList.remove("show", "visible"); notification.style.opacity = "0"; }, 2200);
}
function flash(el, ms) {
    if (!el) return;
    const p = state.player;
    el.style.left = `${p.x}%`; el.style.bottom = `${p.y}%`;
    el.style.transform = p.facing < 0 ? "scaleX(-1)" : "scaleX(1)";
    el.style.display = "block"; el.style.pointerEvents = "none";
    clearTimeout(el._t);
    el._t = setTimeout(() => { el.style.display = "none"; }, ms);
}
const allSoldiersDefeated = () => state.soldiers.every((s) => !s.active);

/* ---------- SUPABASE ---------- */
async function checkFestivalAccess() {
    try {
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
        festivalProgressRowExists = true;
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
    if (!festivalUser || !festivalProgressRowExists) { showNotification("SIGN IN REQUIRED TO SAVE PROGRESS"); return false; }
    if (day6SaveInProgress) return false;
    if (!state.victory) return false;
    day6SaveInProgress = true;
    if (continueButton) { continueButton.disabled = true; continueButton.textContent = "SAVING PROGRESS..."; }
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
        if (continueButton) { continueButton.disabled = false; continueButton.textContent = "CONTINUE TO DAY 7"; }
        return true;
    } catch (err) {
        console.error("Failed to save Day 6 completion:", err);
        showNotification("SAVE FAILED — CLICK CONTINUE TO RETRY");
        if (continueButton) { continueButton.disabled = false; continueButton.textContent = "RETRY SAVE / CONTINUE"; }
        return false;
    } finally {
        day6SaveInProgress = false;
    }
}

/* ---------- INIT ---------- */
async function init() {
    if (!(await checkFestivalAccess())) return;
    [attackEffect, dashEffect, hurtEffect].forEach((e) => { if (e) e.style.display = "none"; });
    if (boss) boss.style.display = "none";
    hide(pauseMenu); hide(victoryScreen); hide(gameOverScreen);
    if (bossHUD) bossHUD.style.display = "none";
    setupKeyboard(); setupSpeedControl(); setupCrystals(); setupHealthOrbs(); setupMobileControls(); setupButtons(); setupVisibility();
    state.soldiers.forEach((s, i) => { s.el = soldierEls[i] || null; if (s.el) makeBar(s); updateSoldierVisual(s); });
    updateMissionSoldierText(); updateHUD(); updatePlayerVisual();
    startAudio();
    showNotification("ENTER THE HAUNTED MANSION");
    requestAnimationFrame(gameLoop);
}

function startAudio() {
    A.bgMusic.volume = 0.35;
    A.bgMusic.play().catch(() => {
        document.addEventListener("pointerdown", () => { if (!state.paused && !state.boss.active) A.bgMusic.play().catch(() => {}); }, { once: true });
    });
}

/* ---------- INPUT ---------- */
const KEYMAP = { w: "up", arrowup: "up", s: "down", arrowdown: "down", a: "left", arrowleft: "left", d: "right", arrowright: "right" };
function setupKeyboard() {
    addEventListener("keydown", (e) => {
        const k = e.key.toLowerCase();
        if (KEYMAP[k]) { e.preventDefault(); state.keys[KEYMAP[k]] = true; return; }
        if (e.repeat) return;
        if (k === " ") { e.preventDefault(); attack(); }
        else if (k === "shift") dash();
        else if (k === "e") attack();
        else if (k === "p" || k === "escape") togglePause();
    });
    addEventListener("keyup", (e) => { const d = KEYMAP[e.key.toLowerCase()]; if (d) state.keys[d] = false; });
    addEventListener("blur", () => { Object.keys(state.keys).forEach((k) => { state.keys[k] = false; }); });
}
function setupVisibility() {
    document.addEventListener("visibilitychange", () => {
        state.lastTime = 0;
        if (document.hidden && state.running && !state.gameOver && !state.victory && !state.paused) togglePause();
    });
}
function setupSpeedControl() {
    if (!speedSlider) return;
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
    if (resumeButton) resumeButton.addEventListener("click", togglePause);
    if (retryButton) retryButton.addEventListener("click", () => location.reload());
    if (continueButton) continueButton.addEventListener("click", async () => {
        if (!state.victory) return;
        if (day6Saved || await saveDay6Completion()) location.href = NEXT_URL;
    });
}
function togglePause() {
    if (state.gameOver || state.victory) return;
    state.paused = !state.paused;
    if (state.paused) { show(pauseMenu); A.bgMusic.pause(); A.bossMusic.pause(); }
    else {
        hide(pauseMenu); state.lastTime = 0;
        (state.boss.active ? A.bossMusic : A.bgMusic).play().catch(() => {});
    }
}

/* ---------- CRYSTALS / ORBS ---------- */
function setupCrystals() {
    crystals.forEach((c) => {
        c._px = parseFloat(c.style.left) || 0; c._py = parseFloat(c.style.bottom) || 0;
        c.addEventListener("click", () => { if (Math.hypot(state.player.x - c._px, state.player.y - c._py) < 30) collectCrystal(c); else showNotification("MOVE CLOSER TO THE CRYSTAL"); });
    });
}
function collectCrystal(c) {
    if (c.classList.contains("collected")) return;
    c.classList.add("collected"); c.style.pointerEvents = "none";
    state.crystals++; state.score += 500;
    playSound(A.collectSound, 0.65);
    updateHUD();
    showNotification(`ANCIENT CRYSTAL ${state.crystals}/6`);
    if (state.crystals >= 6) {
        missionCrystal.classList.add("complete"); missionCrystal.textContent = "◆ All 6 Ancient Crystals collected";
        maybeActivateBoss();
    }
}
function setupHealthOrbs() {
    healthOrbs.forEach((o) => {
        o._px = parseFloat(o.style.left) || 0; o._py = parseFloat(o.style.bottom) || 0; o._respawn = 0;
        o.addEventListener("click", () => { if (Math.hypot(state.player.x - o._px, state.player.y - o._py) < 30) collectOrb(o); });
    });
}
function collectOrb(o) {
    if (o._respawn > 0) return;
    if (state.health >= state.maxHealth) { showNotification("VITALITY ALREADY FULL"); return; }
    state.health = Math.min(state.maxHealth, state.health + ORB_HEAL);
    state.score += 100; o.style.display = "none"; o._respawn = ORB_RESPAWN;
    playSound(A.collectSound, 0.5); updateHUD();
    showNotification(`+${ORB_HEAL} HEALTH`);
}
function checkPickups() {
    const p = state.player;
    crystals.forEach((c) => { if (!c.classList.contains("collected") && Math.hypot(p.x - c._px, p.y - c._py) < 6) collectCrystal(c); });
    healthOrbs.forEach((o) => { if (o._respawn <= 0 && state.health < state.maxHealth && Math.hypot(p.x - o._px, p.y - o._py) < 6) collectOrb(o); });
}
function updateOrbs(dt) {
    healthOrbs.forEach((o) => {
        if (o._respawn <= 0) return;
        o._respawn -= dt;
        if (o._respawn <= 0) { o._respawn = 0; o.style.display = ""; }
    });
}

/* ---------- PLAYER ---------- */
function updatePlayer(dt) {
    const p = state.player;
    p.attackCd = Math.max(0, p.attackCd - dt); p.dashCd = Math.max(0, p.dashCd - dt); p.invincible = Math.max(0, p.invincible - dt);
    state.spirit = Math.min(state.maxSpirit, state.spirit + (p.dashing ? 0 : 6 * dt));
    if (p.dashing) {
        p.dashT -= dt;
        p.x = clamp(p.x + p.dashDx * DASH_SPEED * dt, 5, 95);
        p.y = clamp(p.y + p.dashDy * DASH_SPEED * dt, 5, 65);
        if (p.dashT <= 0) { p.dashing = false; }
        checkPickups();
        return;
    }
    let dx = 0, dy = 0;
    if (state.keys.left) dx--; if (state.keys.right) dx++; if (state.keys.up) dy++; if (state.keys.down) dy--;
    if (dx) p.facing = dx;
    if (!dx && !dy) { if (!p.attacking) setSprite(player, "assets/images/day6/player-idle.png"); return; }
    const l = Math.hypot(dx, dy); dx /= l; dy /= l;
    const m = p.speed * state.speedMultiplier * dt;
    p.x = clamp(p.x + dx * m, 5, 95); p.y = clamp(p.y + dy * m, 5, 65);
    if (!p.attacking) setSprite(player, "assets/images/day6/player-walk.png");
    p.stepT -= dt; if (p.stepT <= 0) { p.stepT = 0.38; playSound(A.footstepSound, 0.18); }
    checkPickups();
}
function updatePlayerVisual() {
    player.style.left = `${state.player.x}%`; player.style.bottom = `${state.player.y}%`;
    player.style.transform = state.player.facing < 0 ? "scaleX(-1)" : "scaleX(1)";
    player.style.opacity = state.player.invincible > 0 && !state.player.dashing ? (Math.floor(performance.now() / 80) % 2 ? "0.45" : "1") : "1";
}
function attack() {
    const p = state.player;
    if (!state.running || state.paused || state.gameOver || state.victory || p.attackCd > 0 || p.dashing) return;
    p.attackCd = ATTACK_COOLDOWN; p.attacking = true;
    setSprite(player, "assets/images/day6/player-attack.png");
    playSound(A.attackSound, 0.6); flash(attackEffect, 220);
    setTimeout(() => { p.attacking = false; }, 260);
    let hits = 0;
    state.soldiers.forEach((s) => {
        if (!s.active) return;
        const dx = s.x - p.x;
        if (Math.abs(dx) > ATTACK_RANGE || Math.abs(s.y - p.y) > ATTACK_RANGE * 0.8 || (dx !== 0 && Math.sign(dx) !== p.facing && Math.abs(dx) > 4)) return;
        hits++; s.health -= ATTACK_DAMAGE; s.x = clamp(s.x + p.facing * 2.5, 3, 97);
        if (s.el) { s.el.style.filter = "brightness(2)"; setTimeout(() => { if (s.el) s.el.style.filter = ""; }, 120); }
        if (s.health <= 0) killSoldier(s); else updateSoldierVisual(s);
    });
    const b = state.boss;
    if (b.active && !b.defeated && b.hitCooldown <= 0) {
        const dx = b.x - p.x;
        if (Math.abs(dx) <= ATTACK_RANGE + 4 && Math.abs(b.y - p.y) <= ATTACK_RANGE && (Math.sign(dx) === p.facing || Math.abs(dx) < 5)) { hits++; hurtBoss(ATTACK_DAMAGE); }
    }
    if (hits) state.score += 10 * hits;
    updateHUD();
}
function dash() {
    const p = state.player;
    if (!state.running || state.paused || state.gameOver || state.victory || p.dashing || p.dashCd > 0) return;
    if (state.spirit < DASH_COST) { showNotification("NOT ENOUGH SPIRIT"); return; }
    let dx = (state.keys.right ? 1 : 0) - (state.keys.left ? 1 : 0), dy = (state.keys.up ? 1 : 0) - (state.keys.down ? 1 : 0);
    if (!dx && !dy) dx = p.facing;
    const l = Math.hypot(dx, dy);
    p.dashDx = dx / l; p.dashDy = dy / l; p.dashing = true; p.dashT = DASH_TIME; p.dashCd = DASH_COOLDOWN; p.invincible = DASH_TIME + 0.1;
    state.spirit -= DASH_COST;
    playSound(A.dashSound, 0.6); flash(dashEffect, 260);
}
function hurtPlayer(amount) {
    const p = state.player;
    if (p.invincible > 0 || state.gameOver || state.victory) return;
    state.health = Math.max(0, state.health - amount);
    p.invincible = IFRAMES;
    playSound(A.hurtSound, 0.7); flash(hurtEffect, 250);
    updateHUD();
    if (state.health <= 0) playerDie();
}
function playerDie() {
    if (state.gameOver) return;
    state.gameOver = true; state.running = false;
    A.bgMusic.pause(); A.bossMusic.pause();
    playSound(A.gameOverSound, 0.8);
    show(gameOverScreen);
}

/* ---------- SOLDIERS ---------- */
function makeBar(s) {
    const bar = document.createElement("div"), fill = document.createElement("div");
    Object.assign(bar.style, { position: "absolute", width: "60px", height: "6px", background: "#222", borderRadius: "4px", overflow: "hidden", pointerEvents: "none", transform: "translateX(-50%)" });
    Object.assign(fill.style, { width: "100%", height: "100%", background: "linear-gradient(90deg,#ff4444,#ff9999)" });
    bar.appendChild(fill); s.el.parentElement.appendChild(bar); s.bar = bar; s.barFill = fill;
}
function updateSoldierVisual(s) {
    if (!s.el) return;
    s.el.style.left = `${s.x}%`; s.el.style.bottom = `${s.y}%`;
    s.el.style.transform = s.x > state.player.x ? "scaleX(-1)" : "scaleX(1)";
    if (s.bar) {
        s.bar.style.left = `${s.x}%`; s.bar.style.bottom = `calc(${s.y}% + ${s.el.offsetHeight || 140}px)`;
        s.barFill.style.width = `${clamp(s.health / s.maxHealth, 0, 1) * 100}%`;
    }
}
function updateSoldiers(dt) {
    const p = state.player;
    state.soldiers.forEach((s) => {
        if (!s.active) return;
        s.attackCooldown = Math.max(0, s.attackCooldown - dt);
        const dx = p.x - s.x, dy = p.y - s.y, d = Math.hypot(dx, dy);
        if (d > 7 && d < 60) { s.x += dx / d * s.speed * dt; s.y += dy / d * s.speed * dt; }
        else if (d <= 7 && s.attackCooldown <= 0) { s.attackCooldown = s.attackDelay; playSound(A.soldierSound, 0.4); hurtPlayer(s.damage); }
        updateSoldierVisual(s);
    });
}
function killSoldier(s) {
    s.active = false; state.kills++; state.score += 300;
    if (s.el) { s.el.style.transition = "opacity .4s"; s.el.style.opacity = "0"; setTimeout(() => { s.el.style.display = "none"; }, 400); }
    if (s.bar) s.bar.style.display = "none";
    updateMissionSoldierText(); updateHUD();
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
    if (state.boss.active || state.boss.defeated) return;
    if (state.crystals < 6 || !allSoldiersDefeated()) {
        if (interactionText) interactionText.textContent = state.crystals < 6 ? "COLLECT THE REMAINING CRYSTALS" : "DEFEAT THE MANSION SOLDIERS";
        return;
    }
    const b = state.boss;
    b.active = true; b.attackCooldown = 1.5;
    boss.style.display = "block";
    if (bossHUD) bossHUD.style.display = "block";
    updateBossVisual();
    A.bgMusic.pause(); A.bossMusic.volume = 0.45; A.bossMusic.currentTime = 0; A.bossMusic.play().catch(() => {});
    playSound(A.bossRoar, 0.8);
    showNotification("THE HAUNTED GUARDIAN AWAKENS!");
    if (interactionText) interactionText.textContent = "DEFEAT THE HAUNTED GUARDIAN";
}
function updateBossVisual() {
    const b = state.boss;
    boss.style.left = `${b.x}%`; boss.style.bottom = `${b.y}%`;
    boss.style.transform = b.x > state.player.x ? "scaleX(-1)" : "scaleX(1)";
    if (bossHealthFill) bossHealthFill.style.width = `${clamp(b.health / b.maxHealth, 0, 1) * 100}%`;
}
function updateBoss(dt) {
    const b = state.boss;
    if (!b.active || b.defeated) return;
    b.hitCooldown = Math.max(0, b.hitCooldown - dt); b.attackCooldown = Math.max(0, b.attackCooldown - dt);
    const p = state.player, dx = p.x - b.x, dy = p.y - b.y, d = Math.hypot(dx, dy);
    if (d > 9) { b.x += dx / d * b.speed * dt; b.y += dy / d * b.speed * dt; }
    else if (b.attackCooldown <= 0) { b.attackCooldown = b.attackDelay; playSound(A.bossRoar, 0.5); hurtPlayer(b.damage); }
    updateBossVisual();
}
function hurtBoss(amount) {
    const b = state.boss;
    b.health = Math.max(0, b.health - amount); b.hitCooldown = 0.25; state.score += 50;
    boss.style.filter = "brightness(2)"; setTimeout(() => { boss.style.filter = ""; }, 120);
    if (b.phase === 1 && b.health < b.maxHealth * 0.6) { b.phase = 2; b.speed += 1.5; b.attackDelay = 1.6; showNotification("THE GUARDIAN GROWS ANGRY!"); }
    if (b.phase === 2 && b.health < b.maxHealth * 0.3) { b.phase = 3; b.speed += 1.5; b.attackDelay = 1.2; showNotification("GUARDIAN — RAGE MODE!"); }
    updateBossVisual();
    if (b.health <= 0) bossDefeated();
}
function bossDefeated() {
    const b = state.boss;
    if (b.defeated) return;
    b.defeated = true; b.active = false; state.score += 3000;
    boss.style.transition = "opacity .8s"; boss.style.opacity = "0";
    setTimeout(() => { boss.style.display = "none"; }, 800);
    if (bossHUD) bossHUD.style.display = "none";
    missionBoss.classList.add("complete"); missionBoss.textContent = "◆ The Haunted Guardian defeated";
    updateHUD();
    setTimeout(winGame, 1200);
}
async function winGame() {
    if (state.victory || state.gameOver) return;
    state.victory = true; state.running = false;
    A.bossMusic.pause(); A.bgMusic.pause();
    playSound(A.victorySound, 0.8);
    show(victoryScreen);
    await saveDay6Completion();
}

/* ---------- HUD ---------- */
function updateHUD() {
    const h = Math.round(state.health), s = Math.round(state.spirit);
    healthFill.style.width = `${h / state.maxHealth * 100}%`;
    healthFill.style.filter = h <= 30 ? "hue-rotate(-20deg) saturate(2)" : "";
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
        updatePlayerVisual(); updateHUD();
    }
    requestAnimationFrame(gameLoop);
}

if (document.readyState === "loading") addEventListener("DOMContentLoaded", init, { once: true });
else init();
