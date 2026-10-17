import { supabase } from "./supabase.js";

"use strict";

/*=========================================================
VIDLYRA HALLOWEEN FEST 2026
DAY 5 - THE HAUNTED CEMETERY
SUPABASE-INTEGRATED BUILD
DAY 5 → DAY 6 VIDEO
=========================================================*/

/*=========================================================
DOM HELPERS
=========================================================*/

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function on(el, evt, fn, opts) {
    if (el) el.addEventListener(evt, fn, opts);
}

function safePlay(audioEl) {
    if (!audioEl) return;

    try {
        audioEl.currentTime = 0;
        const promise = audioEl.play();

        if (promise && promise.catch) {
            promise.catch(() => {});
        }
    } catch (e) {
        // Audio playback is optional.
    }
}

/*=========================================================
DOM REFERENCES
=========================================================*/

const loadingScreen = $("#loadingScreen");
const loadingFill = $("#loadingFill");
const loadingPercent = $("#loadingPercent");
const loadingMessage = $("#loadingMessage");

const gameWorld = $("#gameWorld");

const player = $("#player");
const slashEffect = $("#slashEffect");
const dashTrailEl = $("#dashTrail");

const healthFill = $("#healthFill");
const spiritFill = $("#spiritFill");
const healthText = $("#healthText");
const spiritText = $("#spiritText");
const lanternCounter = $("#lanternCounter");
const scoreCounter = $("#scoreCounter");

const missionPopup = $("#missionPopup");
const mission1 = $("#mission1");
const mission2 = $("#mission2");
const mission3 = $("#mission3");

const bossEl = $("#ghostKing");
const bossHUD = $("#bossHUD");
const bossHealthFill = $("#bossHealthFill");

const inventoryPanel = $("#inventoryPanel");
const closeInventory = $("#closeInventory");

const pauseMenu = $("#pauseMenu");
const resumeButton = $("#resumeButton");
const restartButton = $("#restartButton");
const openSettingsButton = $("#openSettingsButton");
const exitGameButton = $("#exitGameButton");
const settingsPanel = $("#settingsPanel");
const closeSettingsButton = $("#closeSettingsButton");
const musicSlider = $("#musicSlider");
const effectsSlider = $("#effectsSlider");
const screenShakeToggle = $("#screenShakeToggle");

const mobileControls = $("#mobileControls");
const joystickBase = $("#joystickBase");
const joystickStick = $("#joystickStick");
const attackButton = $("#attackButton");
const dashButton = $("#dashButton");
const skillButton = $("#skillButton");
const interactButton = $("#interactButton");
const pauseButton = $("#pauseButton");

const victoryScreen = $("#victoryScreen");
const continueButton = $("#continueButton");

const gameOverScreen = $("#gameOverScreen");
const retryGameButton = $("#retryGameButton");
const quitEventButton = $("#quitEventButton");

const notificationContainer = $("#notificationContainer");
const interactionPrompt = $("#interactionPrompt");

const fpsValue = $("#fpsValue");
const playerXLabel = $("#playerX");
const playerYLabel = $("#playerY");
const aliveGhostsLabel = $("#aliveGhosts");
const activeLanternsLabel = $("#activeLanterns");

const bossIntroScreen = $("#bossIntroScreen");
const bossWarning = $("#bossWarning");
const ghostKingSprite = $("#ghostKingSprite");

const day6Portal = $("#day6Portal");
const portalSound = $("#portalSound");
const lightningLayer = $("#lightningLayer");

const miniPlayerEl = $("#miniPlayer");
const miniBossEl = $("#miniBoss");
const miniMapFrame = $("#miniMapFrame");
const compassNeedle = $("#compassNeedle");

const bgMusic = $("#bgMusic");
const ambientWind = $("#ambientWind");
const ghostAttackSound = $("#ghostAttack");
const lanternSound = $("#lanternLight");
const swordSlashSound = $("#swordSlash");
const heroDashSound = $("#heroDash");
const bossRoarSound = $("#bossRoar");
const lightningSound = $("#lightningSound");
const victorySound = $("#victorySound");
const gameOverSound = $("#gameOverSound");

/*=========================================================
CONFIGURATION
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
    CAMERA_SMOOTH: 0.1,
    LANTERN_HINT_RADIUS: 220,
    LANTERN_PICKUP_RADIUS: 130,
    PORTAL_HINT_RADIUS: 220,
    PORTAL_ENTER_RADIUS: 90,
    NEXT_LEVEL_URL: "day6-video.html"
};

/*=========================================================
GLOBAL GAME STATE
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
    kills: 0,

    // Supabase state
    user: null,
    accessGranted: false,
    day5Saved: false,
    savingDay5: false,
    initializing: false
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
    left: false,
    right: false,
    up: false,
    down: false
};

const JOYSTICK = {
    active: false,
    startX: 0,
    startY: 0,
    dx: 0,
    dy: 0,
    radius: 55
};

const AUDIOSETTINGS = {
    effects: 0.9,
    screenShake: true
};

/*=========================================================
HELPERS
=========================================================*/

function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
}

function random(min, max) {
    return Math.random() * (max - min) + min;
}

/*=========================================================
SUPABASE: VERIFY DAY 5 ACCESS
=========================================================*/

async function checkDay5Access() {
    try {
        const {
            data: authData,
            error: authError
        } = await supabase.auth.getUser();

        const user = authData?.user;

        if (authError || !user) {
            console.warn("Day 5 requires login.", authError);
            window.location.replace("login.html");
            return false;
        }

        GAME.user = user;

        const {
            data,
            error
        } = await supabase
            .from("festival_progress")
            .select("day4, day5")
            .eq("user_id", user.id)
            .eq("festival", "halloween_2026")
            .maybeSingle();

        if (error) {
            console.error("Festival progress load failed:", error);
            showNotification("UNABLE TO LOAD FESTIVAL PROGRESS");
            return false;
        }

        if (!data) {
            showNotification("FESTIVAL PROGRESS NOT FOUND");
            window.location.replace("map.html");
            return false;
        }

        if (data.day4 !== true) {
            alert("🔒 Complete Day 4 before entering Day 5.");
            window.location.replace("map.html");
            return false;
        }

        GAME.day5Saved = data.day5 === true;
        GAME.accessGranted = true;

        console.info(
            "Day 5 access granted. Previously completed:",
            GAME.day5Saved
        );

        return true;

    } catch (error) {
        console.error("Day 5 access check failed:", error);
        showNotification("CONNECTION ERROR CHECKING FESTIVAL ACCESS");
        return false;
    }
}

/*=========================================================
SUPABASE: SAVE DAY 5 COMPLETION
=========================================================*/

async function saveDay5Completion() {
    if (GAME.day5Saved) {
        return true;
    }

    if (GAME.savingDay5) {
        return false;
    }

    if (!GAME.user) {
        showNotification("LOGIN REQUIRED TO SAVE PROGRESS");
        return false;
    }

    GAME.savingDay5 = true;

    try {
        const {
            data,
            error
        } = await supabase
            .from("festival_progress")
            .update({
                day5: true
            })
            .eq("user_id", GAME.user.id)
            .eq("festival", "halloween_2026")
            .select("day5")
            .maybeSingle();

        if (error) {
            console.error("Supabase Day 5 save failed:", error);
            showNotification("SAVE FAILED — CHECK CONNECTION AND RETRY");
            return false;
        }

        // Do not report success if no database row was updated.
        if (!data || data.day5 !== true) {
            console.error("Day 5 progress row was not updated.");
            showNotification("SAVE FAILED — PROGRESS ROW NOT UPDATED");
            return false;
        }

        GAME.day5Saved = true;

        // Local storage is only a convenience backup.
        // Supabase remains the source of truth.
        try {
            localStorage.setItem("day5Complete", "true");
            localStorage.setItem("day5Score", String(GAME.score));
        } catch (storageError) {
            console.warn("Local backup unavailable:", storageError);
        }

        console.info("Supabase saved: day5 = true");
        return true;

    } catch (error) {
        console.error("Unexpected Day 5 save error:", error);
        showNotification("COULD NOT SAVE DAY 5 — RETRY");
        return false;

    } finally {
        GAME.savingDay5 = false;
    }
}

/*=========================================================
DEVICE DETECTION
=========================================================*/

function detectDevice() {
    const touchCapable =
        ("ontouchstart" in window) ||
        (navigator.maxTouchPoints > 0);

    const narrowViewport = window.innerWidth <= 992;

    GAME.mobile = touchCapable && narrowViewport;

    if (mobileControls) {
        mobileControls.style.display =
            GAME.mobile ? "flex" : "none";
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

        if (progress >= 100) {
            progress = 100;
        }

        if (loadingFill) {
            loadingFill.style.width = progress + "%";
        }

        if (loadingPercent) {
            loadingPercent.textContent =
                Math.floor(progress) + "%";
        }

        if (loadingMessage) {
            const idx = Math.min(
                loadingMessages.length - 1,
                Math.floor(
                    (progress / 100) * loadingMessages.length
                )
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

        setTimeout(() => {
            loadingScreen.style.display = "none";
        }, 500);
    }

    if (missionPopup) {
        missionPopup.style.opacity = "1";

        setTimeout(() => {
            missionPopup.style.opacity = "0";
        }, 3500);
    }

    if (bgMusic) {
        bgMusic.volume = 0.5;
        safePlay(bgMusic);
    }

    if (ambientWind) {
        ambientWind.volume = 0.3;
        safePlay(ambientWind);
    }
}

/*=========================================================
KEYBOARD INPUT
=========================================================*/

window.addEventListener("keydown", (e) => {
    if (e.repeat) return;

    switch (e.code) {
        case "ArrowLeft":
        case "KeyA":
            INPUT.left = true;
            break;

        case "ArrowRight":
        case "KeyD":
            INPUT.right = true;
            break;

        case "ArrowUp":
        case "KeyW":
            INPUT.up = true;
            break;

        case "ArrowDown":
        case "KeyS":
            INPUT.down = true;
            break;

        case "Space":
            e.preventDefault();
            startAttack();
            break;

        case "ShiftLeft":
        case "ShiftRight":
            startDash();
            break;

        case "KeyE":
            castSpiritSkill();
            break;

        case "KeyF":
            tryInteract();
            break;

        case "Escape":
            togglePause();
            break;
    }
});

window.addEventListener("keyup", (e) => {
    switch (e.code) {
        case "ArrowLeft":
        case "KeyA":
            INPUT.left = false;
            break;

        case "ArrowRight":
        case "KeyD":
            INPUT.right = false;
            break;

        case "ArrowUp":
        case "KeyW":
            INPUT.up = false;
            break;

        case "ArrowDown":
        case "KeyS":
            INPUT.down = false;
            break;
    }
});

/*=========================================================
MOBILE JOYSTICK
=========================================================*/

function joystickPointFromEvent(e) {
    const touch = e.touches ? e.touches[0] : e;

    return {
        x: touch.clientX,
        y: touch.clientY
    };
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
        joystickStick.style.transform =
            `translate(-50%,-50%) translate(${dx}px, ${dy}px)`;
    }
}, { passive: false });

function resetJoystick() {
    JOYSTICK.active = false;
    JOYSTICK.dx = 0;
    JOYSTICK.dy = 0;

    if (joystickStick) {
        joystickStick.style.transform = "translate(-50%,-50%)";
    }
}

on(joystickBase, "touchend", resetJoystick);
on(joystickBase, "touchcancel", resetJoystick);

on(attackButton, "touchstart", (e) => {
    e.preventDefault();
    startAttack();
});

on(dashButton, "touchstart", (e) => {
    e.preventDefault();
    startDash();
});

on(skillButton, "touchstart", (e) => {
    e.preventDefault();
    castSpiritSkill();
});

on(interactButton, "touchstart", (e) => {
    e.preventDefault();
    tryInteract();
});

on(pauseButton, "touchstart", (e) => {
    e.preventDefault();
    togglePause();
});

/*=========================================================
PAUSE / SETTINGS
=========================================================*/

function togglePause() {
    if (GAME.gameOver || GAME.victory) return;

    GAME.paused = !GAME.paused;

    if (pauseMenu) {
        pauseMenu.style.display =
            GAME.paused ? "flex" : "none";
    }
}

on(resumeButton, "click", () => {
    GAME.paused = false;

    if (pauseMenu) {
        pauseMenu.style.display = "none";
    }
});

on(restartButton, "click", () => {
    window.location.reload();
});

on(openSettingsButton, "click", () => {
    if (settingsPanel) {
        settingsPanel.style.display = "flex";
    }
});

on(closeSettingsButton, "click", () => {
    if (settingsPanel) {
        settingsPanel.style.display = "none";
    }
});

on(exitGameButton, "click", () => {
    window.location.reload();
});

on(musicSlider, "input", (e) => {
    if (bgMusic) {
        bgMusic.volume = e.target.value / 100;
    }
});

on(effectsSlider, "input", (e) => {
    AUDIOSETTINGS.effects = e.target.value / 100;
});

on(screenShakeToggle, "change", (e) => {
    AUDIOSETTINGS.screenShake = e.target.checked;
});

/*=========================================================
CAMERA
=========================================================*/

const CAMERA = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
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

    CAMERA.x = clamp(
        CAMERA.x,
        0,
        Math.max(0, CONFIG.WORLD_WIDTH - CAMERA.width)
    );

    CAMERA.y = clamp(
        CAMERA.y,
        0,
        Math.max(0, CONFIG.WORLD_HEIGHT - CAMERA.height)
    );

    if (gameWorld) {
        gameWorld.style.transform =
            `translate(${-CAMERA.x}px, ${-CAMERA.y}px)`;
    }
}
/*=========================================================
PLAYER MOVEMENT
=========================================================*/

function applyMovement() {
    if (!GAME.running || GAME.paused || GAME.gameOver || GAME.victory) {
        return;
    }

    let dx = 0;
    let dy = 0;

    if (INPUT.left) dx -= 1;
    if (INPUT.right) dx += 1;
    if (INPUT.up) dy -= 1;
    if (INPUT.down) dy += 1;

    if (JOYSTICK.active) {
        dx = JOYSTICK.dx / JOYSTICK.radius;
        dy = JOYSTICK.dy / JOYSTICK.radius;
    }

    const length = Math.hypot(dx, dy);

    if (length > 0) {
        dx /= length;
        dy /= length;

        PLAYER.moving = true;
        PLAYER.state = "walk";

        PLAYER.x += dx * PLAYER.runSpeed;
        PLAYER.y += dy * PLAYER.runSpeed;

        if (Math.abs(dx) > 0.1) {
            PLAYER.facing = dx > 0 ? 1 : -1;
        }
    } else {
        PLAYER.moving = false;
        PLAYER.state = "idle";
    }

    PLAYER.x = clamp(PLAYER.x, 0, CONFIG.WORLD_WIDTH);
    PLAYER.y = clamp(PLAYER.y, 0, CONFIG.WORLD_HEIGHT);
}

/*=========================================================
PLAYER RENDER
=========================================================*/

function renderPlayer() {
    if (!player) return;

    player.style.left = PLAYER.x + "px";
    player.style.top = PLAYER.y + "px";

    player.style.transform =
        `translate(-50%, -50%) scaleX(${PLAYER.facing})`;

    player.classList.toggle("moving", PLAYER.moving);
    player.classList.toggle("attacking", PLAYER.attacking);
    player.classList.toggle("invincible", PLAYER.invincible);
}

/*=========================================================
PLAYER HEALTH AND SPIRIT HUD
=========================================================*/

function updatePlayerHUD() {
    PLAYER.health = clamp(PLAYER.health, 0, PLAYER.maxHealth);
    PLAYER.spirit = clamp(PLAYER.spirit, 0, PLAYER.maxSpirit);

    if (healthFill) {
        healthFill.style.width =
            `${(PLAYER.health / PLAYER.maxHealth) * 100}%`;
    }

    if (spiritFill) {
        spiritFill.style.width =
            `${(PLAYER.spirit / PLAYER.maxSpirit) * 100}%`;
    }

    if (healthText) {
        healthText.textContent = Math.ceil(PLAYER.health);
    }

    if (spiritText) {
        spiritText.textContent = Math.ceil(PLAYER.spirit);
    }

    if (lanternCounter) {
        lanternCounter.textContent =
            `${GAME.lanterns}/${CONFIG.TOTAL_LANTERNS}`;
    }

    if (scoreCounter) {
        scoreCounter.textContent = GAME.score;
    }

    if (aliveGhostsLabel) {
        aliveGhostsLabel.textContent =
            GHOSTS.filter(g => g.alive).length;
    }

    if (activeLanternsLabel) {
        activeLanternsLabel.textContent = GAME.lanterns;
    }

    if (playerXLabel) {
        playerXLabel.textContent = Math.round(PLAYER.x);
    }

    if (playerYLabel) {
        playerYLabel.textContent = Math.round(PLAYER.y);
    }
}

/*=========================================================
NOTIFICATIONS
=========================================================*/

function showNotification(message) {
    if (!notificationContainer) {
        console.log("[VIDLYRA]", message);
        return;
    }

    const notification = document.createElement("div");

    notification.className = "gameNotification";
    notification.textContent = message;

    Object.assign(notification.style, {
        padding: "12px 18px",
        margin: "8px",
        color: "#fff",
        background: "rgba(5, 7, 13, 0.94)",
        border: "1px solid #ff8a00",
        borderRadius: "8px",
        fontFamily: "sans-serif",
        fontSize: "13px",
        letterSpacing: "1px",
        boxShadow: "0 0 18px rgba(255,138,0,.3)",
        pointerEvents: "none"
    });

    notificationContainer.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = "0";
        notification.style.transition = "opacity .3s";

        setTimeout(() => notification.remove(), 350);
    }, 2600);
}

/*=========================================================
PLAYER DAMAGE
=========================================================*/

function damagePlayer(amount) {
    if (
        PLAYER.invincible ||
        GAME.gameOver ||
        GAME.victory ||
        !GAME.running
    ) {
        return;
    }

    PLAYER.health = Math.max(0, PLAYER.health - amount);
    PLAYER.invincible = true;

    if (player) {
        player.classList.add("damageFlash");
    }

    setTimeout(() => {
        PLAYER.invincible = false;

        if (player) {
            player.classList.remove("damageFlash");
        }
    }, 800);

    updatePlayerHUD();

    if (PLAYER.health <= 0) {
        gameOver();
    }
}

/*=========================================================
PLAYER ATTACK
=========================================================*/

let attackCooldown = false;

function startAttack() {
    if (
        !GAME.running ||
        GAME.paused ||
        GAME.gameOver ||
        GAME.victory ||
        attackCooldown
    ) {
        return;
    }

    attackCooldown = true;
    PLAYER.attacking = true;
    PLAYER.state = "attack";

    safePlay(swordSlashSound);

    if (slashEffect) {
        slashEffect.style.display = "block";
        slashEffect.style.left = PLAYER.x + "px";
        slashEffect.style.top = PLAYER.y + "px";
        slashEffect.style.transform =
            `translate(-50%, -50%) scaleX(${PLAYER.facing})`;

        setTimeout(() => {
            slashEffect.style.display = "none";
        }, 180);
    }

    const attackRange = 125;

    GHOSTS.forEach(ghost => {
        if (!ghost.alive) return;

        const distance = Math.hypot(
            ghost.x - PLAYER.x,
            ghost.y - PLAYER.y
        );

        const inFront =
            (ghost.x - PLAYER.x) * PLAYER.facing > -25;

        if (distance <= attackRange && inFront) {
            damageGhost(ghost, CONFIG.ATTACK_DAMAGE);
        }
    });

    if (BOSS.alive) {
        const distance = Math.hypot(
            BOSS.x - PLAYER.x,
            BOSS.y - PLAYER.y
        );

        const inFront =
            (BOSS.x - PLAYER.x) * PLAYER.facing > -35;

        if (distance <= attackRange + 30 && inFront) {
            damageBoss(CONFIG.ATTACK_DAMAGE);
        }
    }

    setTimeout(() => {
        PLAYER.attacking = false;

        if (!PLAYER.moving) {
            PLAYER.state = "idle";
        }
    }, 220);

    setTimeout(() => {
        attackCooldown = false;
    }, 380);
}

/*=========================================================
PLAYER DASH
=========================================================*/

let dashCooldown = false;
let dashTimer = 0;

function startDash() {
    if (
        !GAME.running ||
        GAME.paused ||
        GAME.gameOver ||
        GAME.victory ||
        dashCooldown ||
        PLAYER.spirit < 10
    ) {
        return;
    }

    PLAYER.spirit -= 10;
    dashTimer = 180;
    dashCooldown = true;

    safePlay(heroDashSound);

    if (dashTrailEl) {
        dashTrailEl.style.display = "block";
        dashTrailEl.style.left = PLAYER.x + "px";
        dashTrailEl.style.top = PLAYER.y + "px";

        setTimeout(() => {
            dashTrailEl.style.display = "none";
        }, 250);
    }

    const dashDirection =
        INPUT.left ? -1 :
        INPUT.right ? 1 :
        PLAYER.facing;

    PLAYER.x += dashDirection * CONFIG.DASH_SPEED * 4;

    PLAYER.x = clamp(PLAYER.x, 0, CONFIG.WORLD_WIDTH);

    setTimeout(() => {
        dashCooldown = false;
    }, 900);

    updatePlayerHUD();
}

function updateDash(delta) {
    if (dashTimer > 0) {
        dashTimer -= delta;
    }
}

/*=========================================================
SPIRIT SKILL
=========================================================*/

let skillCooldown = false;

function castSpiritSkill() {
    if (
        !GAME.running ||
        GAME.paused ||
        GAME.gameOver ||
        GAME.victory ||
        skillCooldown ||
        PLAYER.spirit < 30
    ) {
        showNotification("NOT ENOUGH SPIRIT ENERGY");
        return;
    }

    PLAYER.spirit -= 30;
    skillCooldown = true;

    showNotification("SPIRIT BURST!");

    const radius = 260;

    GHOSTS.forEach(ghost => {
        if (!ghost.alive) return;

        const distance = Math.hypot(
            ghost.x - PLAYER.x,
            ghost.y - PLAYER.y
        );

        if (distance <= radius) {
            damageGhost(ghost, 50);
        }
    });

    const bossDistance = Math.hypot(
        BOSS.x - PLAYER.x,
        BOSS.y - PLAYER.y
    );

    if (BOSS.alive && bossDistance <= radius) {
        damageBoss(45);
    }

    setTimeout(() => {
        skillCooldown = false;
    }, 1600);

    updatePlayerHUD();
}

/*=========================================================
SPIRIT REGENERATION
=========================================================*/

function regenerate(delta) {
    if (PLAYER.spirit < PLAYER.maxSpirit) {
        PLAYER.spirit = Math.min(
            PLAYER.maxSpirit,
            PLAYER.spirit + delta * 0.004
        );
    }

    updatePlayerHUD();
}

/*=========================================================
GHOST ENTITIES
=========================================================*/

const GHOSTS = [];

function initGhosts() {
    GHOSTS.length = 0;

    for (let i = 0; i < 10; i++) {
        const ghost = {
            id: i + 1,
            x: random(250, CONFIG.WORLD_WIDTH - 250),
            y: random(250, CONFIG.WORLD_HEIGHT - 250),
            health: 100,
            maxHealth: 100,
            speed: random(0.7, 1.5),
            damage: 8,
            alive: true,
            attackCooldown: false,
            element: null
        };

        const el = document.createElement("div");

        el.className = "ghostEnemy";
        el.dataset.ghostId = ghost.id;

        Object.assign(el.style, {
            position: "absolute",
            left: ghost.x + "px",
            top: ghost.y + "px",
            width: "42px",
            height: "52px",
            transform: "translate(-50%, -50%)",
            borderRadius: "50% 50% 35% 35%",
            background:
                "radial-gradient(circle at 50% 30%, #c9f5ff, #5978b8 65%, #18233d)",
            boxShadow: "0 0 18px rgba(110,190,255,.65)",
            zIndex: "10"
        });

        if (gameWorld) {
            gameWorld.appendChild(el);
        }

        ghost.element = el;

        GHOSTS.push(ghost);
    }

    updatePlayerHUD();
}

/*=========================================================
GHOST HEALTH BAR
=========================================================*/

function updateGhostHealthBar(ghost) {
    if (!ghost || !ghost.element) return;

    let bar = ghost.element.querySelector(".enemyHealthFill");

    if (!bar) {
        const outer = document.createElement("div");

        Object.assign(outer.style, {
            position: "absolute",
            width: "48px",
            height: "5px",
            left: "50%",
            top: "-12px",
            transform: "translateX(-50%)",
            background: "#2a1720",
            border: "1px solid #111",
            borderRadius: "5px",
            overflow: "hidden"
        });

        bar = document.createElement("div");
        bar.className = "enemyHealthFill";

        Object.assign(bar.style, {
            width: "100%",
            height: "100%",
            background: "#ff3b3b",
            transition: "width .15s"
        });

        outer.appendChild(bar);
        ghost.element.appendChild(outer);
    }

    const percent = clamp(
        (ghost.health / ghost.maxHealth) * 100,
        0,
        100
    );

    bar.style.width = percent + "%";
}

/*=========================================================
DAMAGE GHOST
=========================================================*/

function damageGhost(ghost, damage) {
    if (!ghost || !ghost.alive) return;

    ghost.health = Math.max(0, ghost.health - damage);

    updateGhostHealthBar(ghost);

    if (ghost.element) {
        ghost.element.style.filter =
            "brightness(2) saturate(0.3)";

        setTimeout(() => {
            if (ghost.element) {
                ghost.element.style.filter = "";
            }
        }, 120);
    }

    if (ghost.health <= 0) {
        ghost.alive = false;

        if (ghost.element) {
            ghost.element.style.opacity = "0";
            ghost.element.style.pointerEvents = "none";

            setTimeout(() => {
                ghost.element?.remove();
            }, 250);
        }

        GAME.kills++;
        GAME.score += 100;

        showNotification("GHOST BANISHED +100");

        updatePlayerHUD();
    }
}

/*=========================================================
GHOST AI
=========================================================*/

function updateGhostAI(delta) {
    if (!GAME.running || GAME.paused) return;

    GHOSTS.forEach(ghost => {
        if (!ghost.alive || !ghost.element) return;

        const dx = PLAYER.x - ghost.x;
        const dy = PLAYER.y - ghost.y;
        const distance = Math.hypot(dx, dy);

        if (distance < 520 && distance > 65) {
            ghost.x += (dx / distance) * ghost.speed * (delta / 16);
            ghost.y += (dy / distance) * ghost.speed * (delta / 16);
        }

        ghost.element.style.left = ghost.x + "px";
        ghost.element.style.top = ghost.y + "px";

        if (distance <= 75 && !ghost.attackCooldown) {
            ghost.attackCooldown = true;

            damagePlayer(ghost.damage);
            safePlay(ghostAttackSound);

            setTimeout(() => {
                ghost.attackCooldown = false;
            }, 1300);
        }
    });
}

/*=========================================================
LANTERNS
=========================================================*/

const LANTERNS = [];

function initLanterns() {
    LANTERNS.length = 0;

    const positions = [
        [700, 1450],
        [1250, 1150],
        [1850, 1600],
        [2450, 950],
        [3100, 1450],
        [3800, 850],
        [4400, 1600]
    ];

    positions.forEach((position, index) => {
        const lantern = {
            id: index + 1,
            x: position[0],
            y: position[1],
            active: true,
            element: null
        };

        const el = document.createElement("div");

        el.className = "collectibleLantern";
        el.dataset.lanternId = lantern.id;

        Object.assign(el.style, {
            position: "absolute",
            left: lantern.x + "px",
            top: lantern.y + "px",
            width: "24px",
            height: "34px",
            transform: "translate(-50%, -50%)",
            background:
                "radial-gradient(circle, #fff1a6, #ff8a00 55%, #5c2300)",
            borderRadius: "8px",
            boxShadow: "0 0 22px #ff8a00",
            zIndex: "5"
        });

        if (gameWorld) {
            gameWorld.appendChild(el);
        }

        lantern.element = el;

        LANTERNS.push(lantern);
    });
}

/*=========================================================
LANTERN INTERACTION
=========================================================*/

function updateLanternProximity() {
    let nearby = null;

    LANTERNS.forEach(lantern => {
        if (!lantern.active) return;

        const distance = Math.hypot(
            lantern.x - PLAYER.x,
            lantern.y - PLAYER.y
        );

        if (distance <= CONFIG.LANTERN_PICKUP_RADIUS) {
            nearby = lantern;
        }
    });

    if (interactionPrompt) {
        interactionPrompt.style.display = nearby ? "block" : "none";

        if (nearby) {
            interactionPrompt.textContent =
                "Press F / INTERACT to light lantern";
        }
    }

    GAME.nearbyLantern = nearby;
}

function tryInteract() {
    if (!GAME.running || GAME.paused) return;

    const lantern = GAME.nearbyLantern;

    if (!lantern || !lantern.active) {
        showNotification("NOTHING TO INTERACT WITH");
        return;
    }

    lantern.active = false;

    if (lantern.element) {
        lantern.element.style.filter = "brightness(2)";
        lantern.element.style.boxShadow =
            "0 0 35px #ffb52e";

        lantern.element.style.opacity = "0.3";
    }

    GAME.lanterns++;
    GAME.score += 150;

    PLAYER.spirit = Math.min(
        PLAYER.maxSpirit,
        PLAYER.spirit + 15
    );

    safePlay(lanternSound);

    showNotification(
        `LANTERN ${GAME.lanterns}/${CONFIG.TOTAL_LANTERNS} ACTIVATED`
    );

    updatePlayerHUD();

    if (GAME.lanterns >= CONFIG.TOTAL_LANTERNS) {
        showNotification("ALL LANTERNS ACTIVATED!");
    }
}

/*=========================================================
GHOST KING BOSS
=========================================================*/

const BOSS = {
    x: 4300,
    y: 500,
    health: 1000,
    maxHealth: 1000,
    damage: 20,
    speed: 1.1,
    alive: true,
    activated: false,
    attackCooldown: false
};

function updateBoss(delta) {
    if (!BOSS.alive || !BOSS.activated) return;

    const dx = PLAYER.x - BOSS.x;
    const dy = PLAYER.y - BOSS.y;
    const distance = Math.hypot(dx, dy);

    if (distance > 130) {
        BOSS.x += (dx / distance) * BOSS.speed * (delta / 16);
        BOSS.y += (dy / distance) * BOSS.speed * (delta / 16);
    }

    if (bossEl) {
        bossEl.style.left = BOSS.x + "px";
        bossEl.style.top = BOSS.y + "px";
    }

    if (distance <= 140 && !BOSS.attackCooldown) {
        BOSS.attackCooldown = true;

        damagePlayer(BOSS.damage);
        safePlay(bossRoarSound);

        setTimeout(() => {
            BOSS.attackCooldown = false;
        }, 1500);
    }

    if (bossHealthFill) {
        bossHealthFill.style.width =
            `${(BOSS.health / BOSS.maxHealth) * 100}%`;
    }
}

function damageBoss(damage) {
    if (!BOSS.alive) return;

    BOSS.health = Math.max(0, BOSS.health - damage);

    if (bossHealthFill) {
        bossHealthFill.style.width =
            `${(BOSS.health / BOSS.maxHealth) * 100}%`;
    }

    if (BOSS.health <= 0) {
        defeatBoss();
    }
}

function activateBoss() {
    if (BOSS.activated || !BOSS.alive) return;

    BOSS.
/*=========================================================
MINI-MAP
=========================================================*/

function updateMiniMap() {
    if (!miniMap || !gameWorld) return;

    const worldWidth = CONFIG.WORLD_WIDTH;
    const worldHeight = CONFIG.WORLD_HEIGHT;

    const mapWidth = miniMap.clientWidth || 180;
    const mapHeight = miniMap.clientHeight || 120;

    const scaleX = mapWidth / worldWidth;
    const scaleY = mapHeight / worldHeight;

    if (miniMapPlayer) {
        miniMapPlayer.style.left = `${PLAYER.x * scaleX}px`;
        miniMapPlayer.style.top = `${PLAYER.y * scaleY}px`;
    }

    GHOSTS.forEach(ghost => {
        if (!ghost.alive) return;

        let dot = miniMap.querySelector(
            `[data-map-ghost="${ghost.id}"]`
        );

        if (!dot) {
            dot = document.createElement("div");
            dot.dataset.mapGhost = ghost.id;
            dot.className = "miniMapGhost";

            Object.assign(dot.style, {
                position: "absolute",
                width: "5px",
                height: "5px",
                borderRadius: "50%",
                background: "#8ad8ff",
                boxShadow: "0 0 5px #8ad8ff"
            });

            miniMap.appendChild(dot);
        }

        dot.style.left = `${ghost.x * scaleX}px`;
        dot.style.top = `${ghost.y * scaleY}px`;
    });

    LANTERNS.forEach(lantern => {
        if (!lantern.active) return;

        let dot = miniMap.querySelector(
            `[data-map-lantern="${lantern.id}"]`
        );

        if (!dot) {
            dot = document.createElement("div");
            dot.dataset.mapLantern = lantern.id;

            Object.assign(dot.style, {
                position: "absolute",
                width: "5px",
                height: "5px",
                borderRadius: "50%",
                background: "#ff8a00",
                boxShadow: "0 0 6px #ff8a00"
            });

            miniMap.appendChild(dot);
        }

        dot.style.left = `${lantern.x * scaleX}px`;
        dot.style.top = `${lantern.y * scaleY}px`;
    });
}

/*=========================================================
GAME OVER
=========================================================*/

function gameOver() {
    if (GAME.gameOver || GAME.victory) return;

    GAME.gameOver = true;
    GAME.running = false;

    if (gameOverScreen) {
        gameOverScreen.style.display = "flex";
    }

    if (finalScore) {
        finalScore.textContent = String(GAME.score);
    }

    safePlay(gameOverSound);
}

function restartGame() {
    window.location.reload();
}

/*=========================================================
DAY 5 COMPLETION
Only call after the actual boss victory.
=========================================================*/

async function saveDay5Completion() {
    if (GAME.day5Saved) return true;

    if (!supabase) {
        showNotification("Unable to save progress: database unavailable.");
        return false;
    }

    try {
        const {
            data: { user },
            error: userError
        } = await supabase.auth.getUser();

        if (userError || !user) {
            showNotification("Sign in to save your festival progress.");
            return false;
        }

        const { data: progress, error: fetchError } = await supabase
            .from("festival_progress")
            .select("day4, day5")
            .eq("user_id", user.id)
            .eq("festival", "halloween_2026")
            .maybeSingle();

        if (fetchError) throw fetchError;

        if (!progress || progress.day4 !== true) {
            showNotification("Complete Day 4 before unlocking Day 5.");
            return false;
        }

        const { error: saveError } = await supabase
            .from("festival_progress")
            .update({ day5: true })
            .eq("user_id", user.id)
            .eq("festival", "halloween_2026");

        if (saveError) throw saveError;

        GAME.day5Saved = true;
        return true;
    } catch (error) {
        console.error("Day 5 progress save failed:", error);
        showNotification("Progress save failed. Please try again.");
        return false;
    }
}

/*=========================================================
VICTORY
=========================================================*/

async function winGame() {
    if (GAME.victory || GAME.gameOver) return;

    // Prevent victory unless the boss has actually been defeated.
    if (BOSS.alive || BOSS.health > 0) {
        showNotification("Defeat the Ghost King first!");
        return;
    }

    GAME.victory = true;
    GAME.running = false;

    safePlay(victorySound);

    if (victoryScreen) {
        victoryScreen.style.display = "flex";
    }

    if (finalScore) {
        finalScore.textContent = String(GAME.score);
    }

    if (victoryMessage) {
        victoryMessage.textContent =
            "The Ghost King has fallen. Your Day 5 journey is complete!";
    }

    const saved = await saveDay5Completion();

    if (day6Button) {
        day6Button.disabled = !saved;
        day6Button.style.opacity = saved ? "1" : "0.5";
        day6Button.style.pointerEvents = saved ? "auto" : "none";
    }

    if (saved) {
        showNotification("DAY 5 COMPLETE — DAY 6 UNLOCKED!");
    } else {
        showNotification(
            "Victory achieved, but progress was not saved. Check your connection and try again."
        );
    }
}

/*=========================================================
DAY 6 NAVIGATION
=========================================================*/

async function goToDay6() {
    if (!GAME.victory || BOSS.alive || BOSS.health > 0) {
        showNotification("Complete the boss fight to unlock Day 6.");
        return;
    }

    const saved = await saveDay5Completion();

    if (!saved) {
        showNotification("Day 6 is locked until progress is saved.");
        return;
    }

    window.location.assign(CONFIG.NEXT_LEVEL_URL);
}

/*=========================================================
INTERACTION LISTENERS
=========================================================*/

if (attackButton) {
    attackButton.addEventListener("click", startAttack);
}

if (dashButton) {
    dashButton.addEventListener("click", startDash);
}

if (skillButton) {
    skillButton.addEventListener("click", castSpiritSkill);
}

if (interactButton) {
    interactButton.addEventListener("click", tryInteract);
}

if (day6Button) {
    day6Button.addEventListener("click", goToDay6);
}

if (restartButton) {
    restartButton.addEventListener("click", restartGame);
}

/*=========================================================
MAIN GAME LOOP
=========================================================*/

let previousFrameTime = 0;

function gameLoop(timestamp = 0) {
    requestAnimationFrame(gameLoop);

    const delta = Math.min(
        timestamp - (previousFrameTime || timestamp),
        50
    );

    previousFrameTime = timestamp;

    if (!GAME.running || GAME.paused || GAME.gameOver || GAME.victory) {
        return;
    }

    applyMovement();
    updateDash(delta);
    regenerate(delta);

    updateGhostAI(delta);
    updateBoss(delta);

    updateLanternProximity();
    updatePortalProximity();

    renderPlayer();
    updatePlayerHUD();
    updateMiniMap();

    if (
        GAME.lanterns >= CONFIG.TOTAL_LANTERNS &&
        !BOSS.activated &&
        Math.hypot(PLAYER.x - BOSS.x, PLAYER.y - BOSS.y) < 650
    ) {
        activateBoss();
    }
}

/*=========================================================
INITIALIZATION
=========================================================*/

async function initializeGame() {
    if (GAME.initialized) return;

    GAME.initialized = true;
    GAME.running = false;

    try {
        const allowed = await checkDay5Access();

        if (!allowed) {
            showNotification(
                "Day 5 is locked. Complete Day 4 first."
            );

            if (lockedScreen) {
                lockedScreen.style.display = "flex";
            }

            return;
        }

        if (loadingScreen) {
            loadingScreen.style.display = "none";
        }

        if (gameWorld) {
            gameWorld.style.width = `${CONFIG.WORLD_WIDTH}px`;
            gameWorld.style.height = `${CONFIG.WORLD_HEIGHT}px`;
        }

        initGhosts();
        initLanterns();

        PLAYER.x = Math.max(100, PLAYER.x);
        PLAYER.y = Math.max(100, PLAYER.y);

        updatePlayerHUD();
        renderPlayer();

        GAME.running = true;

        showNotification("DAY 5 — THE HAUNTED FOREST");

        requestAnimationFrame(gameLoop);
    } catch (error) {
        console.error("Game initialization failed:", error);

        showNotification(
            "Unable to start the game. Please refresh and try again."
        );
    }
}

/*=========================================================
START GAME
=========================================================*/

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        initializeGame,
        { once: true }
    );
} else {
    initializeGame();
}

/*=========================================================
END OF PART 3
=========================================================*/
