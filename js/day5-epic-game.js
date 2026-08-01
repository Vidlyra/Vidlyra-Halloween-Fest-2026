"use strict";

/*=========================================================
VIDLYRA HALLOWEEN FEST 2026
DAY 5 - THE HAUNTED CEMETERY
FIXED BUILD
=========================================================*/

/*=========================================================
DOM HELPERS
=========================================================*/

const $  = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function on(el, evt, fn, opts) {
    if (el) el.addEventListener(evt, fn, opts);
}
function safePlay(audioEl) {
    if (!audioEl) return;
    try {
        audioEl.currentTime = 0;
        audioEl.play().catch(() => {});
    } catch (e) {}
}

/*=========================================================
DOM REFERENCES (match index.html exactly)
=========================================================*/

const loadingScreen  = $("#loadingScreen");
const loadingFill    = $("#loadingFill");
const loadingPercent = $("#loadingPercent");
const loadingMessage = $("#loadingMessage");

const gameWorld = $("#gameWorld");

const player       = $("#player");

const healthFill     = $("#healthFill");
const spiritFill     = $("#spiritFill");
const healthText     = $("#healthText");
const spiritText     = $("#spiritText");
const lanternCounter = $("#lanternCounter");
const scoreCounter   = $("#scoreCounter");

const missionPopup = $("#missionPopup");
const mission1 = $("#mission1");
const mission2 = $("#mission2");
const mission3 = $("#mission3");

const bossEl         = $("#ghostKing");
const bossHUD        = $("#bossHUD");
const bossHealthFill = $("#bossHealthFill");

const inventoryPanel  = $("#inventoryPanel");
const closeInventory  = $("#closeInventory");

const pauseMenu           = $("#pauseMenu");
const resumeButton        = $("#resumeButton");
const restartButton       = $("#restartButton");
const openSettingsButton  = $("#openSettingsButton");
const exitGameButton      = $("#exitGameButton");
const settingsPanel       = $("#settingsPanel");
const closeSettingsButton = $("#closeSettingsButton");
const musicSlider         = $("#musicSlider");
const effectsSlider       = $("#effectsSlider");
const screenShakeToggle   = $("#screenShakeToggle");

const mobileControls = $("#mobileControls");
const joystickBase   = $("#joystickBase");
const joystickStick  = $("#joystickStick");
const attackButton   = $("#attackButton");
const dashButton     = $("#dashButton");
const skillButton    = $("#skillButton");
const interactButton = $("#interactButton");
const pauseButton    = $("#pauseButton");

const victoryScreen   = $("#victoryScreen");
const continueButton  = $("#continueButton");
const gameOverScreen  = $("#gameOverScreen");
const retryGameButton = $("#retryGameButton");
const quitEventButton = $("#quitEventButton");

const notificationContainer = $("#notificationContainer");

const fpsValue     = $("#fpsValue");
const playerXLabel = $("#playerX");
const playerYLabel = $("#playerY");
const aliveGhostsLabel    = $("#aliveGhosts");
const activeLanternsLabel = $("#activeLanterns");

const bossIntroScreen = $("#bossIntroScreen");
const bossWarning     = $("#bossWarning");

const lightningLayer = $("#lightningLayer");

const bgMusic       = $("#bgMusic");
const ambientWind   = $("#ambientWind");
const ghostAttackSound = $("#ghostAttack");
const lanternSound  = $("#lanternLight");
const swordSlashSound = $("#swordSlash");
const heroDashSound = $("#heroDash");
const bossRoarSound = $("#bossRoar");
const lightningSound = $("#lightningSound");
const victorySound  = $("#victorySound");
const gameOverSound = $("#gameOverSound");

/*=========================================================
CONFIG
=========================================================*/

const CONFIG = {
    PLAYER_SPEED: 6,
    DASH_SPEED: 16,
    ATTACK_DAMAGE: 25,
    MAX_HEALTH: 100,
    MAX_SPIRIT: 100,
    TOTAL_LANTERNS: 7,
    WORLD_WIDTH: 5000,
    WORLD_HEIGHT: 2200,
    CAMERA_SMOOTH: 0.1
};

/*=========================================================
GLOBAL STATE
=========================================================*/

const GAME = {
    running: false,
    paused: false,
    loading: true,
    victory: false,
    gameOver: false,
    mobile: false,
    score: 0,
    lanterns: 0,
    kills: 0
};

const PLAYER = {
    x: 500,
    y: 1600,
    health: CONFIG.MAX_HEALTH,
    maxHealth: CONFIG.MAX_HEALTH,
    spirit: CONFIG.MAX_SPIRIT,
    maxSpirit: CONFIG.MAX_SPIRIT,
    runSpeed: CONFIG.PLAYER_SPEED,
    facing: 1,
    moving: false,
    attacking: false,
    invincible: false,
    velocityX: 0,
    velocityY: 0,
    stamina: 100,
    maxStamina: 100,
    state: "idle"
};

const INPUT = {
    left: false, right: false, up: false, down: false
};

const JOYSTICK = {
    active: false,
    startX: 0, startY: 0,
    dx: 0, dy: 0,
    radius: 55
};

const AUDIOSETTINGS = { effects: 0.9, screenShake: true };

/*=========================================================
HELPERS
=========================================================*/

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function random(min, max) { return Math.random() * (max - min) + min; }

/*=========================================================
DEVICE DETECTION (real touch capability, not just UA sniffing)
=========================================================*/

function detectDevice() {
    const touchCapable =
        ("ontouchstart" in window) ||
        (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);

    const narrowViewport = window.innerWidth <= 992;

    GAME.mobile = touchCapable && narrowViewport;

    if (mobileControls) {
        mobileControls.style.display = GAME.mobile ? "flex" : "none";
    }
}

window.addEventListener("resize", detectDevice);
window.addEventListener("orientationchange", detectDevice);

/*=========================================================
LOADING SCREEN
=========================================================*/

const loadingMessages = [
    "Entering the cemetery...",
    "Summoning spirits...",
    "Lighting cursed lanterns...",
    "Awakening the Ghost King...",
    "Preparing your sword...",
    "Loading haunted world..."
];

function startLoading() {
    let progress = 0;

    const interval = setInterval(() => {
        progress += random(4, 12);
        if (progress >= 100) progress = 100;

        if (loadingFill) loadingFill.style.width = progress + "%";
        if (loadingPercent) loadingPercent.textContent = Math.floor(progress) + "%";

        if (loadingMessage) {
            const idx = Math.min(
                loadingMessages.length - 1,
                Math.floor((progress / 100) * loadingMessages.length)
            );
            loadingMessage.textContent = loadingMessages[idx];
        }

        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(finishLoading, 400);
        }
    }, 140);
}

function finishLoading() {
    GAME.loading = false;
    GAME.running = true;

    if (loadingScreen) {
        loadingScreen.style.opacity = "0";
        loadingScreen.style.pointerEvents = "none";
        setTimeout(() => { loadingScreen.style.display = "none"; }, 500);
    }

    if (missionPopup) {
        missionPopup.style.opacity = "1";
        setTimeout(() => { missionPopup.style.opacity = "0"; }, 3500);
    }

    if (bgMusic) { bgMusic.volume = 0.5; safePlay(bgMusic); }
    if (ambientWind) { ambientWind.volume = 0.3; safePlay(ambientWind); }
}

/*=========================================================
KEYBOARD INPUT
=========================================================*/

window.addEventListener("keydown", (e) => {
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
        case "Escape": togglePause(); break;
    }
});

window.addEventListener("keyup", (e) => {
    switch (e.code) {
        case "ArrowLeft": case "KeyA": INPUT.left = false; break;
        case "ArrowRight": case "KeyD": INPUT.right = false; break;
        case "ArrowUp": case "KeyW": INPUT.up = false; break;
        case "ArrowDown": case "KeyS": INPUT.down = false; break;
    }
});

/*=========================================================
MOBILE JOYSTICK (matches #joystickBase / #joystickStick)
=========================================================*/

function joystickPointFromEvent(e) {
    const touch = e.touches ? e.touches[0] : e;
    return { x: touch.clientX, y: touch.clientY };
}

on(joystickBase, "touchstart", (e) => {
    e.preventDefault();
    const p = joystickPointFromEvent(e);
    JOYSTICK.active = true;
    JOYSTICK.startX = p.x;
    JOYSTICK.startY = p.y;
}, { passive: false });

on(joystickBase, "touchmove", (e) => {
    e.preventDefault();
    if (!JOYSTICK.active) return;

    const p = joystickPointFromEvent(e);
    let dx = p.x - JOYSTICK.startX;
    let dy = p.y - JOYSTICK.startY;

    const dist = Math.hypot(dx, dy);
    if (dist > JOYSTICK.radius) {
        const angle = Math.atan2(dy, dx);
        dx = Math.cos(angle) * JOYSTICK.radius;
        dy = Math.sin(angle) * JOYSTICK.radius;
    }

    JOYSTICK.dx = dx;
    JOYSTICK.dy = dy;

    if (joystickStick) {
        joystickStick.style.transform = `translate(-50%,-50%) translate(${dx}px, ${dy}px)`;
    }
}, { passive: false });

function resetJoystick() {
    JOYSTICK.active = false;
    JOYSTICK.dx = 0;
    JOYSTICK.dy = 0;
    if (joystickStick) joystickStick.style.transform = "translate(-50%,-50%)";
}

on(joystickBase, "touchend", resetJoystick);
on(joystickBase, "touchcancel", resetJoystick);

on(attackButton, "touchstart", (e) => { e.preventDefault(); startAttack(); });
on(dashButton, "touchstart", (e) => { e.preventDefault(); startDash(); });
on(skillButton, "touchstart", (e) => { e.preventDefault(); castSpiritSkill(); });
on(interactButton, "touchstart", (e) => { e.preventDefault(); tryInteract(); });
on(pauseButton, "touchstart", (e) => { e.preventDefault(); togglePause(); });

/*=========================================================
PAUSE / SETTINGS
=========================================================*/

function togglePause() {
    if (GAME.gameOver || GAME.victory) return;

    GAME.paused = !GAME.paused;
    if (pauseMenu) pauseMenu.style.display = GAME.paused ? "flex" : "none";
}

on(resumeButton, "click", () => { GAME.paused = false; if (pauseMenu) pauseMenu.style.display = "none"; });
on(restartButton, "click", () => window.location.reload());
on(openSettingsButton, "click", () => { if (settingsPanel) settingsPanel.style.display = "flex"; });
on(closeSettingsButton, "click", () => { if (settingsPanel) settingsPanel.style.display = "none"; });
on(exitGameButton, "click", () => window.location.reload());

on(musicSlider, "input", (e) => { if (bgMusic) bgMusic.volume = e.target.value / 100; });
on(effectsSlider, "input", (e) => { AUDIOSETTINGS.effects = e.target.value / 100; });
on(screenShakeToggle, "change", (e) => { AUDIOSETTINGS.screenShake = e.target.checked; });

/*=========================================================
CAMERA
=========================================================*/

const CAMERA = {
    x: 0, y: 0,
    targetX: 0, targetY: 0,
    smooth: CONFIG.CAMERA_SMOOTH,
    width: window.innerWidth,
    height: window.innerHeight
};

window.addEventListener("resize", () => {
    CAMERA.width = window.innerWidth;
    CAMERA.height = window.innerHeight;
});

function updateCamera() {
    CAMERA.targetX = PLAYER.x - CAMERA.width / 2;
    CAMERA.targetY = PLAYER.y - CAMERA.height / 2;

    CAMERA.x += (CAMERA.targetX - CAMERA.x) * CAMERA.smooth;
    CAMERA.y += (CAMERA.targetY - CAMERA.y) * CAMERA.smooth;

    CAMERA.x = clamp(CAMERA.x, 0, Math.max(0, CONFIG.WORLD_WIDTH - CAMERA.width));
    CAMERA.y = clamp(CAMERA.y, 0, Math.max(0, CONFIG.WORLD_HEIGHT - CAMERA.height));

    if (gameWorld) {
        gameWorld.style.transform = `translate(${-CAMERA.x}px, ${-CAMERA.y}px)`;
    }
}

function cameraShake(power = 10, duration = 300) {
    if (!AUDIOSETTINGS.screenShake || !gameWorld) return;

    const start = performance.now();

    function shake(time) {
        const elapsed = time - start;

        if (elapsed >= duration) {
            gameWorld.style.transform = `translate(${-CAMERA.x}px, ${-CAMERA.y}px)`;
            return;
        }

        const offsetX = (Math.random() - 0.5) * power;
        const offsetY = (Math.random() - 0.5) * power;

        gameWorld.style.transform =
            `translate(${-CAMERA.x + offsetX}px, ${-CAMERA.y + offsetY}px)`;

        requestAnimationFrame(shake);
    }

    requestAnimationFrame(shake);
}

/*=========================================================
PLAYER MOVEMENT
=========================================================*/

function applyMovement() {
    PLAYER.velocityX = 0;
    PLAYER.velocityY = 0;

    if (INPUT.left) PLAYER.velocityX--;
    if (INPUT.right) PLAYER.velocityX++;
    if (INPUT.up) PLAYER.velocityY--;
    if (INPUT.down) PLAYER.velocityY++;

    if (JOYSTICK.active) {
        PLAYER.velocityX += JOYSTICK.dx / JOYSTICK.radius;
        PLAYER.velocityY += JOYSTICK.dy / JOYSTICK.radius;
    }

    PLAYER.moving = PLAYER.velocityX !== 0 || PLAYER.velocityY !== 0;

    if (PLAYER.moving) {
        const len = Math.hypot(PLAYER.velocityX, PLAYER.velocityY);
        PLAYER.velocityX /= len;
        PLAYER.velocityY /= len;

        const speed = DASH.active ? DASH.speed : PLAYER.runSpeed;

        PLAYER.x += PLAYER.velocityX * speed;
        PLAYER.y += PLAYER.velocityY * speed;

        PLAYER.x = clamp(PLAYER.x, 60, CONFIG.WORLD_WIDTH - 60);
        PLAYER.y = clamp(PLAYER.y, 60, CONFIG.WORLD_HEIGHT - 60);

        if (PLAYER.velocityX < -0.1) PLAYER.facing = -1;
        if (PLAYER.velocityX > 0.1) PLAYER.facing = 1;

        PLAYER.state = DASH.active ? "dash" : "walk";
    } else if (!PLAYER.attacking) {
        PLAYER.state = "idle";
    }
}

function renderPlayer() {
    const container = document.getElementById("playerContainer");
    if (!container) return;

    container.style.left = PLAYER.x + "px";
    container.style.top = PLAYER.y + "px";
    container.style.transform = `translate(-50%,-100%) scaleX(${PLAYER.facing})`;
}

function updatePlayerHUD() {
    const hp = Math.round(PLAYER.health);
    const sp = Math.round(PLAYER.spirit);

    if (healthFill) healthFill.style.width = hp + "%";
    if (spiritFill) spiritFill.style.width = sp + "%";
    if (healthText) healthText.textContent = hp + " / " + PLAYER.maxHealth;
    if (spiritText) spiritText.textContent = sp + " / " + PLAYER.maxSpirit;
}

/*=========================================================
DASH
=========================================================*/

const DASH = {
    active: false,
    duration: 200,
    cooldown: 700,
    speed: CONFIG.DASH_SPEED,
    timer: 0,
    cooldownTimer: 0
};

function startDash() {
    if (!GAME.running || GAME.paused) return;
    if (DASH.active || DASH.cooldownTimer > 0) return;
    if (PLAYER.stamina < 20) return;

    DASH.active = true;
    DASH.timer = DASH.duration;
    DASH.cooldownTimer = DASH.cooldown;
    PLAYER.invincible = true;
    PLAYER.stamina -= 20;

    safePlay(heroDashSound);
    if (player) player.classList.add("dash");
}

function updateDash(delta) {
    if (DASH.cooldownTimer > 0) DASH.cooldownTimer -= delta;

    if (!DASH.active) return;

    DASH.timer -= delta;

    if (DASH.timer <= 0) {
        DASH.active = false;
        PLAYER.invincible = false;
        if (player) player.classList.remove("dash");
    }
}

/*=========================================================
ATTACK / COMBAT
=========================================================*/

const ATTACK = {
    combo: 0,
    cooldown: false,
    duration: 250,
    damage: CONFIG.ATTACK_DAMAGE,
    range: 140
};

function startAttack() {
    if (!GAME.running || GAME.paused) return;
    if (ATTACK.cooldown) return;

    ATTACK.cooldown = true;
    PLAYER.attacking = true;
    PLAYER.state = "attack";
    ATTACK.combo = (ATTACK.combo % 3) + 1;

    safePlay(swordSlashSound);

    if (player) {
        player.classList.remove("attack1", "attack2", "attack3");
        void player.offsetWidth;
        player.classList.add("attack" + ATTACK.combo);
    }

    damageGhosts();
    damageBossIfInRange();

    setTimeout(() => { PLAYER.attacking = false; }, ATTACK.duration);
    setTimeout(() => { ATTACK.cooldown = false; }, 200);
}

function getSwordHitbox() {
    const box = { x: PLAYER.x, y: PLAYER.y, width: ATTACK.range, height: 160 };
    if (PLAYER.facing > 0) box.x += 40; else box.x -= ATTACK.range + 40;
    return box;
}

function rectCollision(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

/*=========================================================
GHOSTS
=========================================================*/

const GHOSTS = [];

function initGhosts() {
    const els = $$(".ghost");

    els.forEach((el, index) => {
        const angle = (index / els.length) * Math.PI * 2;
        const radius = 700 + random(-150, 250);

        const spawnX = clamp(2500 + Math.cos(angle) * radius, 200, CONFIG.WORLD_WIDTH - 200);
        const spawnY = clamp(1200 + Math.sin(angle) * radius * 0.6, 200, CONFIG.WORLD_HEIGHT - 200);

        el.style.position = "absolute";
        el.style.left = spawnX + "px";
        el.style.top = spawnY + "px";
        el.style.display = "flex";

        GHOSTS.push({
            id: index,
            element: el,
            alive: true,
            health: 100,
            maxHealth: 100,
            damage: 8,
            speed: random(1.4, 2.2),
            x: spawnX,
            y: spawnY,
            state: "wander",
            velocityX: 0,
            velocityY: 0,
            attackTimer: 0,
            floatOffset: random(0, 1000),
            lastHit: 0
        });
    });
}

const GHOST_AI = {
    detectRange: 420,
    attackRange: 90,
    attackCooldown: 1400
};

function updateGhostAI(delta) {
    GHOSTS.forEach((ghost) => {
        if (!ghost.alive) return;

        const dx = PLAYER.x - ghost.x;
        const dy = PLAYER.y - ghost.y;
        const distance = Math.hypot(dx, dy);

        if (distance < GHOST_AI.attackRange) {
            ghost.state = "attack";
            ghost.velocityX = 0;
            ghost.velocityY = 0;
        } else if (distance < GHOST_AI.detectRange) {
            ghost.state = "chase";
            ghost.velocityX = (dx / distance) * ghost.speed;
            ghost.velocityY = (dy / distance) * ghost.speed;
        } else {
            ghost.state = "wander";
            if (Math.random() < 0.01) {
                const angle = Math.random() * Math.PI * 2;
                ghost.velocityX = Math.cos(angle) * 0.6;
                ghost.velocityY = Math.sin(angle) * 0.6;
            }
        }

        ghost.x = clamp(ghost.x + ghost.velocityX, 60, CONFIG.WORLD_WIDTH - 60);
        ghost.y = clamp(ghost.y + ghost.velocityY, 60, CONFIG.WORLD_HEIGHT - 60);

        const floatY = Math.sin(performance.now() * 0.002 + ghost.floatOffset) * 8;
        ghost.element.style.left = ghost.x + "px";
        ghost.element.style.top = (ghost.y + floatY) + "px";
        ghost.element.style.transform = PLAYER.x > ghost.x ? "scaleX(1)" : "scaleX(-1)";

        if (ghost.state === "attack") {
            ghost.attackTimer -= delta;
            if (ghost.attackTimer <= 0) {
                ghost.attackTimer = GHOST_AI.attackCooldown;
                ghostAttacksPlayer(ghost);
            }
        }
    });
}

function damageGhosts() {
    const sword = getSwordHitbox();

    GHOSTS.forEach((ghost) => {
        if (!ghost.alive) return;

        const enemyBox = { x: ghost.x - 45, y: ghost.y - 60, width: 90, height: 120 };
        if (!rectCollision(sword, enemyBox)) return;
        if (performance.now() - ghost.lastHit < 250) return;

        ghost.lastHit = performance.now();
        ghost.health -= ATTACK.damage;
        updateGhostHealthBar(ghost);
        cameraShake(5, 120);

        if (ghost.health <= 0) killGhost(ghost);
    });
}

function updateGhostHealthBar(ghost) {
    const fill = ghost.element.querySelector(".enemyHealthFill");
    if (fill) fill.style.width = Math.max(0, (ghost.health / ghost.maxHealth) * 100) + "%";
}

function killGhost(ghost) {
    if (!ghost.alive) return;

    ghost.alive = false;
    GAME.kills++;
    GAME.score += 250;

    if (scoreCounter) scoreCounter.textContent = GAME.score.toString().padStart(6, "0");
    if (aliveGhostsLabel) aliveGhostsLabel.textContent = GHOSTS.filter(g => g.alive).length;

    ghost.element.style.transition = "opacity .5s, transform .5s";
    ghost.element.style.opacity = "0";

    setTimeout(() => { ghost.element.style.display = "none"; }, 500);

    showNotification("+250 SCORE");
    checkGhostsCleared();
}

function ghostAttacksPlayer(ghost) {
    if (PLAYER.invincible) return;

    PLAYER.health = Math.max(0, PLAYER.health - ghost.damage);
    safePlay(ghostAttackSound);
    cameraShake(8, 180);

    if (player) {
        player.classList.add("hurt");
        setTimeout(() => player.classList.remove("hurt"), 250);
    }

    if (PLAYER.health <= 0) playerDie();
}

function checkGhostsCleared() {
    if (GHOSTS.every(g => !g.alive)) {
        if (mission2) mission2.style.textDecoration = "line-through";
        showNotification("All ghosts defeated!");
        maybeSpawnBoss();
    }
}

/*=========================================================
LANTERNS
=========================================================*/

const LANTERNS = [];

function initLanterns() {
    const els = $$(".lantern");

    els.forEach((el, index) => {
        const angle = (index / els.length) * Math.PI * 2;
        const radius = 1100;

        const x = clamp(2500 + Math.cos(angle) * radius, 200, CONFIG.WORLD_WIDTH - 200);
        const y = clamp(1200 + Math.sin(angle) * radius * 0.55, 200, CONFIG.WORLD_HEIGHT - 200);

        el.style.left = x + "px";
        el.style.top = y + "px";

        const data = { element: el, x, y, lit: false };
        LANTERNS.push(data);

        el.addEventListener("click", () => lightLantern(data));
        el.addEventListener("touchstart", (e) => { e.preventDefault(); lightLantern(data); });
    });
}

function lightLantern(data) {
    if (data.lit) return;

    const dist = Math.hypot(PLAYER.x - data.x, PLAYER.y - data.y);
    if (dist > 160) {
        showNotification("Get closer to the lantern");
        return;
    }

    data.lit = true;
    data.element.style.filter = "brightness(1.6) drop-shadow(0 0 20px gold)";

    GAME.lanterns++;

    if (lanternCounter) lanternCounter.textContent = `${GAME.lanterns} / ${CONFIG.TOTAL_LANTERNS}`;
    if (activeLanternsLabel) activeLanternsLabel.textContent = GAME.lanterns;

    safePlay(lanternSound);
    showNotification("Spirit Lantern Restored!");

    if (GAME.lanterns >= CONFIG.TOTAL_LANTERNS) {
        if (mission1) mission1.style.textDecoration = "line-through";
        showNotification("All Lanterns Restored!");
        maybeSpawnBoss();
    }
}

/*=========================================================
INTERACT
=========================================================*/

function tryInteract() {
    const nearLantern = LANTERNS.find(l => !l.lit && Math.hypot(PLAYER.x - l.x, PLAYER.y - l.y) < 160);
    if (nearLantern) lightLantern(nearLantern);
}

/*=========================================================
BOSS: GHOST KING
=========================================================*/

const BOSS = {
    active: false,
    intro: false,
    defeated: false,
    phase: 1,
    health: 1000,
    maxHealth: 1000,
    damage: 18,
    speed: 2.2,
    attackCooldown: 1800,
    attackTimer: 0,
    x: 2500,
    y: 900
};

function maybeSpawnBoss() {
    if (BOSS.active) return;
    if (GAME.lanterns < CONFIG.TOTAL_LANTERNS) return;
    if (GHOSTS.some(g => g.alive)) return;

    activateGhostKing();
}

function activateGhostKing() {
    BOSS.active = true;
    BOSS.intro = true;

    if (bossEl) {
        bossEl.style.display = "flex";
        bossEl.style.left = BOSS.x + "px";
        bossEl.style.top = BOSS.y + "px";
    }
    if (bossHUD) bossHUD.style.display = "block";

    if (bossWarning) {
        bossWarning.style.display = "flex";
        setTimeout(() => { bossWarning.style.display = "none"; }, 2200);
    }

    if (bossIntroScreen) {
        bossIntroScreen.style.display = "flex";
        setTimeout(() => { bossIntroScreen.style.display = "none"; }, 2600);
    }

    cameraShake(20, 900);
    safePlay(bossRoarSound);

    setTimeout(() => { BOSS.intro = false; }, 2800);
}

function updateBoss(delta) {
    if (!BOSS.active || BOSS.intro || BOSS.defeated) return;

    const dx = PLAYER.x - BOSS.x;
    const dy = PLAYER.y - BOSS.y;
    const distance = Math.hypot(dx, dy);

    if (distance > 180) {
        const angle = Math.atan2(dy, dx);
        BOSS.x += Math.cos(angle) * BOSS.speed;
        BOSS.y += Math.sin(angle) * BOSS.speed;
    } else {
        BOSS.attackTimer -= delta;
        if (BOSS.attackTimer <= 0) {
            BOSS.attackTimer = BOSS.attackCooldown;
            bossHitPlayer();
        }
    }

    if (bossEl) {
        bossEl.style.left = BOSS.x + "px";
        bossEl.style.top = BOSS.y + "px";
        bossEl.style.transform = dx > 0 ? "scaleX(1)" : "scaleX(-1)";
    }
}

function bossHitPlayer() {
    if (PLAYER.invincible) return;

    PLAYER.health = Math.max(0, PLAYER.health - BOSS.damage);
    cameraShake(14, 220);

    if (player) {
        player.classList.add("hurt");
        setTimeout(() => player.classList.remove("hurt"), 250);
    }

    if (PLAYER.health <= 0) playerDie();
}

function damageBossIfInRange() {
    if (!BOSS.active || BOSS.intro || BOSS.defeated) return;

    const distance = Math.hypot(PLAYER.x - BOSS.x, PLAYER.y - BOSS.y);
    if (distance > ATTACK.range + 60) return;

    BOSS.health = Math.max(0, BOSS.health - ATTACK.damage);

    if (bossHealthFill) bossHealthFill.style.width = (BOSS.health / BOSS.maxHealth * 100) + "%";

    cameraShake(6, 120);

    if (BOSS.phase === 1 && BOSS.health < 650) {
        BOSS.phase = 2;
        BOSS.speed += 0.6;
        BOSS.damage += 4;
        showNotification("The Ghost King grows stronger!");
    }
    if (BOSS.phase === 2 && BOSS.health < 300) {
        BOSS.phase = 3;
        BOSS.speed += 0.6;
        BOSS.damage += 6;
        BOSS.attackCooldown = 1100;
        showNotification("RAGE MODE!");
    }

    if (BOSS.health <= 0) bossDefeated();
}

function bossDefeated() {
    if (BOSS.defeated) return;

    BOSS.defeated = true;
    BOSS.active = false;

    if (mission3) mission3.style.textDecoration = "line-through";
    if (bossEl) bossEl.style.opacity = "0";

    winGame();
}

/*=========================================================
SPIRIT SKILL
=========================================================*/

const SKILL = {
    cooldown: 10000,
    timer: 0,
    spiritCost: 30,
    damage: 50
};

function updateSkill(delta) {
    if (SKILL.timer > 0) SKILL.timer -= delta;
}

function castSpiritSkill() {
    if (!GAME.running || GAME.paused) return;
    if (SKILL.timer > 0) return;
    if (PLAYER.spirit < SKILL.spiritCost) {
        showNotification("Not enough Spirit");
        return;
    }

    PLAYER.spirit -= SKILL.spiritCost;
    SKILL.timer = SKILL.cooldown;

    GHOSTS.forEach((ghost) => {
        if (!ghost.alive) return;
        const distance = Math.hypot(ghost.x - PLAYER.x, ghost.y - PLAYER.y);
        if (distance > 260) return;

        ghost.health -= SKILL.damage;
        updateGhostHealthBar(ghost);
        if (ghost.health <= 0) killGhost(ghost);
    });

    if (Math.hypot(BOSS.x - PLAYER.x, BOSS.y - PLAYER.y) < 260) {
        damageBossIfInRange();
    }

    cameraShake(10, 200);
    showNotification("Spirit Burst!");
}

/*=========================================================
REGEN
=========================================================*/

function regenerate(delta) {
    if (PLAYER.health < PLAYER.maxHealth) {
        PLAYER.health = clamp(PLAYER.health + 0.002 * delta, 0, PLAYER.maxHealth);
    }
    if (PLAYER.spirit < PLAYER.maxSpirit) {
        PLAYER.spirit = clamp(PLAYER.spirit + 0.01 * delta, 0, PLAYER.maxSpirit);
    }
    if (PLAYER.stamina < PLAYER.maxStamina) {
        PLAYER.stamina = clamp(PLAYER.stamina + 0.03 * delta, 0, PLAYER.maxStamina);
    }
}

/*=========================================================
NOTIFICATIONS
=========================================================*/

function showNotification(text) {
    if (!notificationContainer) return;

    const n = document.createElement("div");
    n.className = "notification";
    n.textContent = text;
    notificationContainer.appendChild(n);

    setTimeout(() => n.remove(), 1800);
}

/*=========================================================
WIN / LOSE
=========================================================*/

function playerDie() {
    if (GAME.gameOver) return;

    GAME.gameOver = true;
    GAME.running = false;

    safePlay(gameOverSound);
    if (gameOverScreen) gameOverScreen.style.display = "flex";
}

function winGame() {
    if (GAME.victory) return;

    GAME.victory = true;
    GAME.running = false;

    safePlay(victorySound);
    if (victoryScreen) victoryScreen.style.display = "flex";
}

on(retryGameButton, "click", () => window.location.reload());
on(quitEventButton, "click", () => window.location.reload());
on(continueButton, "click", () => { showNotification("Day 6 coming soon!"); });

/*=========================================================
GAME LOOP
=========================================================*/

const ENGINE = { lastTime: 0, frame: 0, fpsTimer: 0, fps: 0 };

function gameLoop(time) {
    const delta = Math.min(50, time - ENGINE.lastTime || 16);
    ENGINE.lastTime = time;

    if (GAME.running && !GAME.paused) {
        applyMovement();
        updateDash(delta);
        updateSkill(delta);
        regenerate(delta);
        updateGhostAI(delta);
        updateBoss(delta);
        updateCamera();
        renderPlayer();
    }

    updatePlayerHUD();

    ENGINE.frame++;
    ENGINE.fpsTimer += delta;
    if (ENGINE.fpsTimer >= 1000) {
        ENGINE.fps = ENGINE.frame;
        ENGINE.frame = 0;
        ENGINE.fpsTimer = 0;
        if (fpsValue) fpsValue.textContent = ENGINE.fps;
    }

    if (playerXLabel) playerXLabel.textContent = Math.round(PLAYER.x);
    if (playerYLabel) playerYLabel.textContent = Math.round(PLAYER.y);

    requestAnimationFrame(gameLoop);
}

/*=========================================================
AMBIENT EFFECTS (capped for mobile performance)
=========================================================*/

function spawnAmbientBats() {
    const layer = $("#batLayer");
    if (!layer) return;

    const count = GAME.mobile ? 6 : 14;

    for (let i = 0; i < count; i++) {
        const bat = document.createElement("div");
        bat.className = "bat";
        bat.style.top = random(50, 500) + "px";
        bat.style.animationDuration = random(10, 18) + "s";
        bat.style.animationDelay = random(0, 8) + "s";
        layer.appendChild(bat);
    }
}

function scheduleLightning() {
    if (!lightningLayer) return;

    const delay = random(6000, 14000);

    setTimeout(() => {
        lightningLayer.style.transition = "opacity .1s";
        lightningLayer.style.opacity = "0.9";
        safePlay(lightningSound);

        setTimeout(() => { lightningLayer.style.opacity = "0"; }, 150);

        scheduleLightning();
    }, delay);
}

/*=========================================================
INIT
=========================================================*/

function initializeGame() {
    detectDevice();
    initGhosts();
    initLanterns();
    spawnAmbientBats();
    scheduleLightning();

    on(closeInventory, "click", () => { if (inventoryPanel) inventoryPanel.classList.remove("active"); });

    if (lanternCounter) lanternCounter.textContent = `0 / ${CONFIG.TOTAL_LANTERNS}`;

    startLoading();

    ENGINE.lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

window.addEventListener("load", initializeGame);
