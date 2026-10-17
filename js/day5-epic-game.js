
import { supabase } from "./supabase.js";
"use strict";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

function on(element, event, handler, options) {
    if (element) element.addEventListener(event, handler, options);
}

function safePlay(audio) {
    if (!audio) return;
    try {
        audio.currentTime = 0;
        const promise = audio.play();
        if (promise && promise.catch) promise.catch(() => {});
    } catch (error) {}
}

const loadingScreen = $("#loadingScreen");
const loadingFill = $("#loadingFill");
const loadingPercent = $("#loadingPercent");
const loadingMessage = $("#loadingMessage");
const loadingText = $("#loadingText");
const gameWorld = $("#gameWorld");
const player = $("#player");
const playerContainer = $("#playerContainer");
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
const bossIntroScreen = $("#bossIntroScreen");
const bossWarning = $("#bossWarning");
const ghostKingSprite = $("#ghostKingSprite");
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

const CONFIG = {
    PLAYER_SPEED: 6,
    DASH_SPEED: 16,
    ATTACK_DAMAGE: 25,
    MAX_HEALTH: 100,
    MAX_SPIRIT: 100,
    MAX_STAMINA: 100,
    TOTAL_LANTERNS: 7,
    WORLD_WIDTH: 5000,
    WORLD_HEIGHT: 2200,
    CAMERA_SMOOTH: 0.10,
    LANTERN_HINT_RADIUS: 220,
    LANTERN_PICKUP_RADIUS: 130,
    PORTAL_HINT_RADIUS: 220,
    PORTAL_ENTER_RADIUS: 90,
    NEXT_LEVEL_URL: "day6-video.html"
};

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
    stamina: CONFIG.MAX_STAMINA,
    maxStamina: CONFIG.MAX_STAMINA,
    runSpeed: CONFIG.PLAYER_SPEED,
    dashSpeed: CONFIG.DASH_SPEED,
    facing: 1,
    moving: false,
    attacking: false,
    invincible: false,
    velocityX: 0,
    velocityY: 0,
    state: "idle"
};

const INPUT = {
    left: false,
    right: false,
    up: false,
    down: false,
    attack: false,
    dash: false,
    skill: false
};

const AUDIOSETTINGS = {
    effects: 0.9,
    screenShake: true
};

const PORTAL = {
    active: false,
    entered: false,
    x: 0,
    y: 0
};

const DASH = {
    active: false,
    duration: 200,
    cooldown: 700,
    speed: CONFIG.DASH_SPEED,
    timer: 0,
    cooldownTimer: 0,
    directionX: 0,
    directionY: 0
};

const ATTACK = {
    combo: 0,
    cooldown: false,
    duration: 250,
    damage: CONFIG.ATTACK_DAMAGE,
    range: 140,
    lastAttack: 0
};

const SKILL = {
    cooldown: 10000,
    timer: 0,
    spiritCost: 30,
    damage: 50
};

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

const JOYSTICK = {
    active: false,
    startX: 0,
    startY: 0,
    dx: 0,
    dy: 0,
    radius: 55
};

const CAMERA = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    smooth: CONFIG.CAMERA_SMOOTH,
    width: window.innerWidth,
    height: window.innerHeight
};

const GHOSTS = [];
const LANTERNS = [];

const ENGINE = {
    lastTime: 0,
    frame: 0,
    fpsTimer: 0,
    fps: 0
};

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function random(min, max) {
    return Math.random() * (max - min) + min;
}

function distanceBetween(x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1);
}

function detectDevice() {
    const touch =
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0;

    GAME.mobile =
        touch &&
        window.innerWidth <= 992;

    if (mobileControls) {
        mobileControls.style.display =
            GAME.mobile ? "flex" : "none";
    }
}

function fixGameOverlays() {
    const overlays = [
        victoryScreen,
        gameOverScreen,
        pauseMenu,
        settingsPanel
    ];

    overlays.forEach((overlay) => {
        if (!overlay) return;

        if (overlay.parentElement !== document.body) {
            document.body.appendChild(overlay);
        }

        overlay.style.position = "fixed";
        overlay.style.inset = "0";
        overlay.style.zIndex = "100000";
    });

    if (victoryScreen) {
        victoryScreen.style.display = "none";
        victoryScreen.style.pointerEvents = "none";
    }

    if (gameOverScreen) {
        gameOverScreen.style.display = "none";
        gameOverScreen.style.pointerEvents = "none";
    }

    if (pauseMenu) pauseMenu.style.display = "none";
    if (settingsPanel) settingsPanel.style.display = "none";
}

function setAudioVolume(audio, volume) {
    if (!audio) return;
    audio.volume = clamp(volume, 0, 1);
}

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

    const timer = setInterval(() => {
        progress += random(5, 11);
        progress = Math.min(100, progress);

        if (loadingFill) loadingFill.style.width = progress + "%";
        if (loadingPercent) loadingPercent.textContent = Math.floor(progress) + "%";
        if (loadingText) loadingText.textContent = Math.floor(progress) + "%";

        if (loadingMessage) {
            const index = Math.min(
                loadingMessages.length - 1,
                Math.floor(progress / 100 * loadingMessages.length)
            );

            loadingMessage.textContent = loadingMessages[index];
        }

        if (progress >= 100) {
            clearInterval(timer);
            setTimeout(finishLoading, 500);
        }
    }, 130);
}

function finishLoading() {
    GAME.loading = false;
    GAME.running = true;

    if (loadingScreen) {
        loadingScreen.style.opacity = "0";
        loadingScreen.style.pointerEvents = "none";

        setTimeout(() => {
            loadingScreen.style.display = "none";
        }, 600);
    }

    if (missionPopup) {
        missionPopup.style.opacity = "1";

        setTimeout(() => {
            missionPopup.style.opacity = "0";
        }, 3500);
    }

    setAudioVolume(bgMusic, 0.5);
    setAudioVolume(ambientWind, 0.3);
    safePlay(bgMusic);
    safePlay(ambientWind);
}

window.addEventListener("keydown", (event) => {
    if (event.repeat) return;

    switch (event.code) {
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
            event.preventDefault();
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

window.addEventListener("keyup", (event) => {
    switch (event.code) {
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

function joystickPoint(event) {
    const touch = event.touches ? event.touches[0] : event;

    return {
        x: touch.clientX,
        y: touch.clientY
    };
}

on(joystickBase, "touchstart", (event) => {
    event.preventDefault();

    const point = joystickPoint(event);

    JOYSTICK.active = true;
    JOYSTICK.startX = point.x;
    JOYSTICK.startY = point.y;
}, { passive: false });

on(joystickBase, "touchmove", (event) => {
    event.preventDefault();

    if (!JOYSTICK.active) return;

    const point = joystickPoint(event);

    let dx = point.x - JOYSTICK.startX;
    let dy = point.y - JOYSTICK.startY;

    const length = Math.hypot(dx, dy);

    if (length > JOYSTICK.radius) {
        const angle = Math.atan2(dy, dx);
        dx = Math.cos(angle) * JOYSTICK.radius;
        dy = Math.sin(angle) * JOYSTICK.radius;
    }

    JOYSTICK.dx = dx;
    JOYSTICK.dy = dy;

    if (joystickStick) {
        joystickStick.style.transform =
            `translate(-50%,-50%) translate(${dx}px,${dy}px)`;
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

on(attackButton, "touchstart", (event) => {
    event.preventDefault();
    startAttack();
}, { passive: false });

on(dashButton, "touchstart", (event) => {
    event.preventDefault();
    startDash();
}, { passive: false });

on(skillButton, "touchstart", (event) => {
    event.preventDefault();
    castSpiritSkill();
}, { passive: false });

on(interactButton, "touchstart", (event) => {
    event.preventDefault();
    tryInteract();
}, { passive: false });

on(pauseButton, "touchstart", (event) => {
    event.preventDefault();
    togglePause();
}, { passive: false });

function togglePause() {
    if (GAME.gameOver || GAME.victory) return;

    GAME.paused = !GAME.paused;

    if (pauseMenu) {
        pauseMenu.style.display = GAME.paused ? "flex" : "none";
    }
}

on(resumeButton, "click", () => {
    GAME.paused = false;

    if (pauseMenu) pauseMenu.style.display = "none";
});

on(restartButton, "click", () => {
    window.location.reload();
});

on(exitGameButton, "click", () => {
    window.location.href = "index.html";
});

on(openSettingsButton, "click", () => {
    if (settingsPanel) settingsPanel.style.display = "flex";
});

on(closeSettingsButton, "click", () => {
    if (settingsPanel) settingsPanel.style.display = "none";
});

on(musicSlider, "input", (event) => {
    setAudioVolume(bgMusic, event.target.value / 100);
});

on(effectsSlider, "input", (event) => {
    AUDIOSETTINGS.effects = event.target.value / 100;
});

on(screenShakeToggle, "change", (event) => {
    AUDIOSETTINGS.screenShake = event.target.checked;
});

on(closeInventory, "click", () => {
    if (inventoryPanel) inventoryPanel.classList.remove("active");
});

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

    if (PLAYER.velocityX !== 0 || PLAYER.velocityY !== 0) {
        const length = Math.hypot(PLAYER.velocityX, PLAYER.velocityY);

        PLAYER.velocityX /= length;
        PLAYER.velocityY /= length;

        const speed = DASH.active ? DASH.speed : PLAYER.runSpeed;

        PLAYER.x += PLAYER.velocityX * speed;
        PLAYER.y += PLAYER.velocityY * speed;

        PLAYER.x = clamp(PLAYER.x, 60, CONFIG.WORLD_WIDTH - 60);
        PLAYER.y = clamp(PLAYER.y, 60, CONFIG.WORLD_HEIGHT - 60);

        if (PLAYER.velocityX < -0.1) PLAYER.facing = -1;
        if (PLAYER.velocityX > 0.1) PLAYER.facing = 1;

        PLAYER.moving = true;
        PLAYER.state = DASH.active ? "dash" : "walk";
    } else {
        PLAYER.moving = false;
        if (!PLAYER.attacking) PLAYER.state = "idle";
    }
}

function renderPlayer() {
    const element = playerContainer || player;
    if (!element) return;

    element.style.left = PLAYER.x + "px";
    element.style.top = PLAYER.y + "px";
    element.style.transform = `translate(-50%,-100%) scaleX(${PLAYER.facing})`;
}

function updatePlayerHUD() {
    const health = Math.round(PLAYER.health);
    const spirit = Math.round(PLAYER.spirit);

    if (healthFill) healthFill.style.width = health + "%";
    if (spiritFill) spiritFill.style.width = spirit + "%";

    if (healthText) healthText.textContent = `${health} / ${PLAYER.maxHealth}`;
    if (spiritText) spiritText.textContent = `${spirit} / ${PLAYER.maxSpirit}`;
}

function regeneratePlayer(delta) {
    PLAYER.health = clamp(PLAYER.health + 0.002 * delta, 0, PLAYER.maxHealth);
    PLAYER.spirit = clamp(PLAYER.spirit + 0.01 * delta, 0, PLAYER.maxSpirit);
    PLAYER.stamina = clamp(PLAYER.stamina + 0.03 * delta, 0, PLAYER.maxStamina);
}

function updateCamera() {
    CAMERA.targetX = PLAYER.x - CAMERA.width / 2;
    CAMERA.targetY = PLAYER.y - CAMERA.height / 2;

    CAMERA.x += (CAMERA.targetX - CAMERA.x) * CAMERA.smooth;
    CAMERA.y += (CAMERA.targetY - CAMERA.y) * CAMERA.smooth;

    CAMERA.x = clamp(CAMERA.x, 0, Math.max(0, CONFIG.WORLD_WIDTH - CAMERA.width));
    CAMERA.y = clamp(CAMERA.y, 0, Math.max(0, CONFIG.WORLD_HEIGHT - CAMERA.height));

    if (gameWorld) {
        gameWorld.style.transform =
            `translate(${-CAMERA.x}px,${-CAMERA.y}px)`;
    }
}

function cameraShake(power = 10, duration = 300) {
    if (!AUDIOSETTINGS.screenShake || !gameWorld) return;

    const start = performance.now();

    function shake(time) {
        const elapsed = time - start;

        if (elapsed >= duration) {
            gameWorld.style.transform =
                `translate(${-CAMERA.x}px,${-CAMERA.y}px)`;
            return;
        }

        const offsetX = (Math.random() - 0.5) * power;
        const offsetY = (Math.random() - 0.5) * power;

        gameWorld.style.transform =
            `translate(${-CAMERA.x + offsetX}px,${-CAMERA.y + offsetY}px)`;

        requestAnimationFrame(shake);
    }

    requestAnimationFrame(shake);
}

window.addEventListener("resize", () => {
    CAMERA.width = window.innerWidth;
    CAMERA.height = window.innerHeight;
    detectDevice();
});

function triggerSlashEffect() {
    if (!slashEffect) return;

    slashEffect.classList.remove("play");
    void slashEffect.offsetWidth;
    slashEffect.classList.add("play");
}

function triggerDashTrail() {
    if (!dashTrailEl) return;

    dashTrailEl.classList.remove("play");
    void dashTrailEl.offsetWidth;
    dashTrailEl.classList.add("play");
}

            speed;
        PLAYER.y +=
            PLAYER.velocityY *
            speed;
        PLAYER.x =
            clamp(
                PLAYER.x,
                60,
                CONFIG.WORLD_WIDTH - 60
            );
        PLAYER.y =
            clamp(
                PLAYER.y,
                60,
                CONFIG.WORLD_HEIGHT - 60
            );
        if (PLAYER.velocityX < -0.1) {
            PLAYER.facing = -1;
        }
        if (PLAYER.velocityX > 0.1) {
            PLAYER.facing = 1;
        }
        PLAYER.moving = true;
        PLAYER.state =
            DASH.active ?
            "dash" :
            "walk";
    } else {
        PLAYER.moving = false;
        if (!PLAYER.attacking) {
            PLAYER.state = "idle";
        }
    }
}
function renderPlayer() {
    const element =
        playerContainer ||
        player;
    if (!element) return;
    element.style.left =
        PLAYER.x + "px";
    element.style.top =
        PLAYER.y + "px";
    element.style.transform =
        `translate(-50%,-100%)
         scaleX(${PLAYER.facing})`;
}
function updatePlayerHUD() {
    const health =
        Math.round(PLAYER.health);
    const spirit =
        Math.round(PLAYER.spirit);
    if (healthFill) {
        healthFill.style.width =
            health + "%";
    }
    if (spiritFill) {
        spiritFill.style.width =
            spirit + "%";
    }
    if (healthText) {
        healthText.textContent =
            `${health} / ${PLAYER.maxHealth}`;
    }
    if (spiritText) {
        spiritText.textContent =
            `${spirit} / ${PLAYER.maxSpirit}`;
    }
}
function regeneratePlayer(delta) {
    PLAYER.health =
        clamp(
            PLAYER.health +
            0.002 * delta,
            0,
            PLAYER.maxHealth
        );
    PLAYER.spirit =
        clamp(
            PLAYER.spirit +
            0.01 * delta,
            0,
            PLAYER.maxSpirit
        );
    PLAYER.stamina =
        clamp(
            PLAYER.stamina +
            0.03 * delta,
            0,
            PLAYER.maxStamina
        );
}
function updateCamera() {
    CAMERA.targetX =
        PLAYER.x -
        CAMERA.width / 2;
    CAMERA.targetY =
        PLAYER.y -
        CAMERA.height / 2;
    CAMERA.x +=
        (
            CAMERA.targetX -
            CAMERA.x
        ) *
        CAMERA.smooth;
    CAMERA.y +=
        (
            CAMERA.targetY -
            CAMERA.y
        ) *
        CAMERA.smooth;
    CAMERA.x =
        clamp(
            CAMERA.x,
            0,
            Math.max(
                0,
                CONFIG.WORLD_WIDTH -
                CAMERA.width
            )
        );
    CAMERA.y =
        clamp(
            CAMERA.y,
            0,
            Math.max(
                0,
                CONFIG.WORLD_HEIGHT -
                CAMERA.height
            )
        );
    if (gameWorld) {
        gameWorld.style.transform =
            `translate(
                ${-CAMERA.x}px,
                ${-CAMERA.y}px
            )`;
    }
}
function cameraShake(
    power = 10,
    duration = 300
) {
    if (
        !AUDIOSETTINGS.screenShake ||
        !gameWorld
    ) {
        return;
    }
    const start =
        performance.now();
    function shake(time) {
        const elapsed =
            time - start;
        if (elapsed >= duration) {
            gameWorld.style.transform =
                `translate(
                    ${-CAMERA.x}px,
                    ${-CAMERA.y}px
                )`;
            return;
        }
        const offsetX =
            (Math.random() - 0.5) *
            power;
        const offsetY =
            (Math.random() - 0.5) *
            power;
        gameWorld.style.transform =
            `translate(
                ${-CAMERA.x + offsetX}px,
                ${-CAMERA.y + offsetY}px
            )`;
        requestAnimationFrame(shake);
    }
    requestAnimationFrame(shake);
}
window.addEventListener(
    "resize",
    () => {
        CAMERA.width =
            window.innerWidth;
        CAMERA.height =
            window.innerHeight;
        detectDevice();
    }
);
function triggerSlashEffect() {
    if (!slashEffect) return;
    slashEffect.classList.remove(
        "play"
    );
    void slashEffect.offsetWidth;
    slashEffect.classList.add(
        "play"
    );
}
function triggerDashTrail() {
    if (!dashTrailEl) return;
    dashTrailEl.classList.remove(
        "play"
    );
    void dashTrailEl.offsetWidth;
    dashTrailEl.classList.add(
        "play"
    );
}
function startAttack() {
    if (!GAME.running) return;
    if (GAME.paused) return;
    if (GAME.gameOver) return;
    if (GAME.victory) return;
    if (ATTACK.cooldown) return;
    ATTACK.cooldown = true;
    PLAYER.attacking = true;
    PLAYER.state = "attack";
    ATTACK.combo =
        (ATTACK.combo % 3) + 1;
    ATTACK.lastAttack =
        performance.now();
    safePlay(swordSlashSound);
    triggerSlashEffect();
    if (player) {
        player.classList.remove(
            "attack1",
            "attack2",
            "attack3"
        );
        void player.offsetWidth;
        player.classList.add(
            "attack" +
            ATTACK.combo
        );
    }
    damageGhosts();
    damageBossIfInRange();
    setTimeout(() => {
        PLAYER.attacking = false;
    }, ATTACK.duration);
    setTimeout(() => {
        ATTACK.cooldown = false;
    }, 200);
}
function getSwordHitbox() {
    const box = {
        x: PLAYER.x,
        y: PLAYER.y - 80,
        width: ATTACK.range,
        height: 160
    };
    if (PLAYER.facing > 0) {
        box.x += 40;
    } else {
        box.x -=
            ATTACK.range + 40;
    }
    return box;
}
function rectCollision(a, b) {
    return (
        a.x <
        b.x + b.width &&
        a.x + a.width >
        b.x &&
        a.y <
        b.y + b.height &&
        a.y + a.height >
        b.y
    );
}
function initGhosts() {
    const elements =
        Array.from(
            document.querySelectorAll(
                ".ghost"
            )
        );
    elements.forEach(
        (element, index) => {
            const angle =
                (
                    index /
                    Math.max(
                        1,
                        elements.length
                    )
                ) *
                Math.PI *
                2;
            const radius =
                650 +
                random(
                    -150,
                    250
                );
            const x =
                clamp(
                    2500 +
                    Math.cos(angle) *
                    radius,
                    200,
                    CONFIG.WORLD_WIDTH -
                    200
                );
            const y =
                clamp(
                    1200 +
                    Math.sin(angle) *
                    radius *
                    0.6,
                    200,
                    CONFIG.WORLD_HEIGHT -
                    200
                );
            element.style.position =
                "absolute";
            element.style.left =
                x + "px";
            element.style.top =
                y + "px";
            element.style.display =
                "flex";
            GHOSTS.push({
                id: index,
                element: element,
                alive: true,
                health: 100,
                maxHealth: 100,
                damage: 8,
                speed:
                    random(
                        1.4,
                        2.2
                    ),
                x: x,
                y: y,
                state: "wander",
                velocityX: 0,
                velocityY: 0,
                attackTimer: 0,
                floatOffset:
                    random(
                        0,
                        1000
                    ),
                lastHit: 0
            });
        }
    );
    updateGhostCounter();
}
function updateGhostCounter() {
    if (!aliveGhostsLabel) return;
    aliveGhostsLabel.textContent =
        GHOSTS.filter(
            ghost => ghost.alive
        ).length;
}
const GHOST_AI = {
    detectRange: 420,
    attackRange: 90,
    attackCooldown: 1400
};
function updateGhostAI(delta) {
    GHOSTS.forEach(
        (ghost) => {
            if (!ghost.alive) return;
            const dx =
                PLAYER.x -
                ghost.x;
            const dy =
                PLAYER.y -
                ghost.y;
            const distance =
                Math.hypot(
                    dx,
                    dy
                );
            if (
                distance <
                GHOST_AI.attackRange
            ) {
                ghost.state =
                    "attack";
                ghost.velocityX = 0;
                ghost.velocityY = 0;
            } else if (
                distance <
                GHOST_AI.detectRange
            ) {
                ghost.state =
                    "chase";
                ghost.velocityX =
                    (dx / distance) *
                    ghost.speed;
                ghost.velocityY =
                    (dy / distance) *
                    ghost.speed;
            } else {
                ghost.state =
                    "wander";
                if (
                    Math.random() <
                    0.01
                ) {
                    const angle =
                        Math.random() *
                        Math.PI *
                        2;
                    ghost.velocityX =
                        Math.cos(angle) *
                        0.6;
                    ghost.velocityY =
                        Math.sin(angle) *
                        0.6;
                }
            }
            ghost.x =
                clamp(
                    ghost.x +
                    ghost.velocityX,
                    60,
                    CONFIG.WORLD_WIDTH -
                    60
                );
            ghost.y =
                clamp(
                    ghost.y +
                    ghost.velocityY,
                    60,
                    CONFIG.WORLD_HEIGHT -
                    60
                );
            const floatY =
                Math.sin(
                    performance.now() *
                    0.002 +
                    ghost.floatOffset
                ) * 8;
            ghost.element.style.left =
                ghost.x + "px";
            ghost.element.style.top =
                (
                    ghost.y +
                    floatY
                ) + "px";
            ghost.element.style.transform =
                PLAYER.x >
                ghost.x
                ? "scaleX(1)"
                : "scaleX(-1)";
            if (
                ghost.state ===
                "attack"
            ) {
                ghost.attackTimer -=
                    delta;
                if (
                    ghost.attackTimer <= 0
                ) {
                    ghost.attackTimer =
                        GHOST_AI.attackCooldown;
                    ghostAttacksPlayer(
                        ghost
                    );
                }
            }
        }
    );
}
function damageGhosts() {
    const sword =
        getSwordHitbox();
    GHOSTS.forEach(
        (ghost) => {
            if (!ghost.alive) return;
            const enemy = {
                x:
                    ghost.x - 45,
                y:
                    ghost.y - 60,
                width: 90,
                height: 120
            };
            if (
                !rectCollision(
                    sword,
                    enemy
                )
            ) {
                return;
            }
            if (
                performance.now() -
                ghost.lastHit <
                250
            ) {
                return;
            }
            ghost.lastHit =
                performance.now();
            ghost.health -=
                ATTACK.damage;
            updateGhostHealthBar(
                ghost
            );
            cameraShake(
                5,
                120
            );
            if (
                ghost.health <= 0
            ) {
                killGhost(
                    ghost
                );
            }
        }
    );
}
function updateGhostHealthBar(
    ghost
) {
    const fill =
        ghost.element.querySelector(
            ".enemyHealthFill"
        );
    if (!fill) return;
    fill.style.width =
        Math.max(
            0,
            (
                ghost.health /
                ghost.maxHealth
            ) * 100
        ) + "%";
}
function killGhost(ghost) {
    if (!ghost.alive) return;
    ghost.alive = false;
    GAME.kills++;
    GAME.score += 250;
    if (scoreCounter) {
        scoreCounter.textContent =
            GAME.score
                .toString()
                .padStart(
                    6,
                    "0"
                );
    }
    ghost.element.style.transition =
        "opacity .5s, transform .5s";
    ghost.element.style.opacity =
        "0";
    setTimeout(() => {
        ghost.element.style.display =
            "none";
    }, 500);
    updateGhostCounter();
    showNotification(
        "+250 SCORE"
    );
    checkGhostsCleared();
}
function ghostAttacksPlayer(ghost) {
    if (PLAYER.invincible) return;
    PLAYER.health =
        Math.max(
            0,
            PLAYER.health -
            ghost.damage
        );
    safePlay(
        ghostAttackSound
    );
    cameraShake(
        8,
        180
    );
    if (player) {
        player.classList.add(
            "hurt"
        );
        setTimeout(() => {
            player.classList.remove(
                "hurt"
            );
        }, 250);
    }
    if (
        PLAYER.health <= 0
    ) {
        playerDie();
    }
}
function checkGhostsCleared() {
    const cleared =
        GHOSTS.every(
            ghost =>
                !ghost.alive
        );
    if (!cleared) return;
    if (mission2) {
        mission2.style.textDecoration =
            "line-through";
    }
    showNotification(
        "ALL GHOSTS DEFEATED!"
    );
    maybeSpawnBoss();
}
function initLanterns() {
    LANTERNS.length = 0;
    const elements = Array.from(
        document.querySelectorAll("#lanternLayer .lantern")
    ).slice(0, CONFIG.TOTAL_LANTERNS);
    elements.forEach((element, index) => {
        const angle = (index / Math.max(1, elements.length)) * Math.PI * 2;
        const radius = 1100;
        const x = clamp(2500 + Math.cos(angle) * radius, 200, CONFIG.WORLD_WIDTH - 200);
        const y = clamp(1200 + Math.sin(angle) * radius * 0.55, 200, CONFIG.WORLD_HEIGHT - 200);
        element.style.position = "absolute";
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;
        element.style.pointerEvents = "auto";
        element.style.cursor = "pointer";
        element.style.display = "flex";
        element.style.zIndex = "20";
        const data = { id: index + 1, element, x, y, lit: false, inRange: false };
        LANTERNS.push(data);
        on(element, "click", (event) => {
            event.preventDefault();
            if (!data.lit) lightLantern(data);
        });
        on(element, "touchend", (event) => {
            event.preventDefault();
            if (!data.lit) lightLantern(data);
        }, { passive: false });
    });
    if (elements.length !== CONFIG.TOTAL_LANTERNS) {
        console.warn(`[Day 5] Expected ${CONFIG.TOTAL_LANTERNS} lanterns, found ${elements.length}. Check #lanternLayer and #lantern1…#lantern7.`);
    }
    updateLanternCounter();
}
function updateLanternCounter() {
    if (lanternCounter) {
        lanternCounter.textContent =
            `${GAME.lanterns} / ${CONFIG.TOTAL_LANTERNS}`;
    }
    if (activeLanternsLabel) {
        activeLanternsLabel.textContent =
            GAME.lanterns;
    }
}
function lightLantern(data) {
    if (data.lit) return;
    data.lit = true;
    data.inRange = false;
    data.element.classList.remove(

        "inRange"
    );
    data.element.classList.add(
        "collected"
    );
    GAME.lanterns++;
    GAME.score += 100;
    updateLanternCounter();
    if (scoreCounter) {
        scoreCounter.textContent =
            GAME.score
                .toString()
                .padStart(
                    6,
                    "0"
                );
    }
    safePlay(
        lanternSound
    );
    showNotification(
        "SPIRIT LANTERN RESTORED!"
    );
    setTimeout(() => {
        data.element.style.display =
            "none";
    }, 550);
    if (
        GAME.lanterns >=
        CONFIG.TOTAL_LANTERNS
    ) {
        if (mission1) {
            mission1.style.textDecoration =
                "line-through";
        }
        showNotification(
            "ALL LANTERNS RESTORED!"
        );
        maybeSpawnBoss();
    }
}
function updateLanternProximity() {
    let nearest = null;
    let nearestDistance = Infinity;
    LANTERNS.forEach((lantern) => {
        if (lantern.lit) return;
        const distance = distanceBetween(PLAYER.x, PLAYER.y, lantern.x, lantern.y);
        const inRange = distance <= 320;
        lantern.inRange = inRange;
        lantern.element.classList.toggle("inRange", inRange);
        if (distance < nearestDistance) {
            nearestDistance = distance;
            nearest = lantern;
        }
        if (distance <= 240) lightLantern(lantern);
    });
    if (interactionPrompt) {
        if (nearest && nearestDistance <= 320) {
            interactionPrompt.style.display = "flex";
            interactionPrompt.textContent = "WALK CLOSER OR PRESS F TO COLLECT LANTERN";
        } else if (!GAME.victory) {
            interactionPrompt.style.display = "none";
        }
    }
}
function tryInteract() {
    if (!GAME.running || GAME.paused || GAME.gameOver) return;
    let nearestLantern = null;
    let nearestDistance = Infinity;
    LANTERNS.forEach((item) => {
        if (item.lit) return;
        const distance = distanceBetween(PLAYER.x, PLAYER.y, item.x, item.y);
        if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestLantern = item;
        }
    });
    if (nearestLantern && nearestDistance <= 420) {
        lightLantern(nearestLantern);
        return;
    }
    if (PORTAL.active && !PORTAL.entered) {
        const distance = distanceBetween(PLAYER.x, PLAYER.y, PORTAL.x, PORTAL.y);
        if (distance <= CONFIG.PORTAL_ENTER_RADIUS) {
            goToDay6();
            return;
        }
    }
    showNotification("MOVE CLOSER TO A LANTERN OR PORTAL");
}
function maybeSpawnBoss() {
    if (BOSS.active) return;
    if (BOSS.defeated) return;
    if (
        GAME.lanterns <
        CONFIG.TOTAL_LANTERNS
    ) {
        return;
    }
    if (
        GHOSTS.some(
            ghost =>
                ghost.alive
        )
    ) {
        return;
    }
    activateGhostKing();
}
function activateGhostKing() {
    BOSS.active = true;
    BOSS.intro = true;
    BOSS.defeated = false;
    BOSS.health =
        BOSS.maxHealth;
    BOSS.phase = 1;
    BOSS.x = 2500;
    BOSS.y = 900;
    if (bossEl) {
        bossEl.style.display =
            "flex";
        bossEl.style.opacity =
            "1";
        bossEl.style.left =
            BOSS.x + "px";
        bossEl.style.top =
            BOSS.y + "px";
    }
    if (bossHUD) {
        bossHUD.style.display =
            "block";
    }
    if (bossHealthFill) {
        bossHealthFill.style.width =
            "100%";
    }
    if (bossWarning) {
        bossWarning.style.display =
            "flex";
        setTimeout(() => {
            bossWarning.style.display =
                "none";
        }, 2200);
    }
    if (bossIntroScreen) {
        bossIntroScreen.style.display =
            "flex";
        setTimeout(() => {
            bossIntroScreen.style.display =
                "none";
        }, 2600);
    }
    safePlay(
        bossRoarSound
    );
    cameraShake(
        20,
        900
    );
    showNotification(
        "THE GHOST KING AWAKENS!"
    );
    setTimeout(() => {
        BOSS.intro = false;
    }, 2800);
}
function updateBoss(delta) {
    if (!BOSS.active) return;
    if (BOSS.intro) return;
    if (BOSS.defeated) return;
    const dx =
        PLAYER.x -
        BOSS.x;
    const dy =
        PLAYER.y -
        BOSS.y;
    const distance =
        Math.hypot(
            dx,
            dy
        );
    if (distance > 180) {
        const angle =
            Math.atan2(
                dy,
                dx
            );
        BOSS.x +=
            Math.cos(angle) *
            BOSS.speed;
        BOSS.y +=
            Math.sin(angle) *
            BOSS.speed;
    } else {
        BOSS.attackTimer -=
            delta;
        if (
            BOSS.attackTimer <= 0
        ) {
            BOSS.attackTimer =
                BOSS.attackCooldown;
            bossHitPlayer();
        }
    }
    if (bossEl) {
        bossEl.style.left =
            BOSS.x + "px";
        bossEl.style.top =
            BOSS.y + "px";
        bossEl.style.transform =
            dx > 0
            ? "scaleX(1)"
            : "scaleX(-1)";
    }
}
function bossHitPlayer() {
    if (PLAYER.invincible) return;
    PLAYER.health =
        Math.max(
            0,
            PLAYER.health -
            BOSS.damage
        );
    safePlay(
        bossRoarSound
    );
    cameraShake(
        14,
        220
    );
    if (player) {
        player.classList.add(
            "hurt"
        );
        setTimeout(() => {
            player.classList.remove(
                "hurt"
            );
        }, 250);
    }
    if (
        PLAYER.health <= 0
    ) {
        playerDie();
    }
}
function damageBossIfInRange() {
    if (!BOSS.active) return;
    if (BOSS.intro) return;
    if (BOSS.defeated) return;
    const distance =
        distanceBetween(
            PLAYER.x,
            PLAYER.y,
            BOSS.x,
            BOSS.y
        );
    if (
        distance >
        ATTACK.range + 80
    ) {
        return;
    }
    BOSS.health =
        Math.max(
            0,
            BOSS.health -
            ATTACK.damage
        );
    if (bossHealthFill) {
        bossHealthFill.style.width =
            (
                BOSS.health /
                BOSS.maxHealth *
                100
            ) + "%";
    }
    cameraShake(
        6,
        120
    );
    if (ghostKingSprite) {
        ghostKingSprite.classList.remove(
            "hit"
        );
        void ghostKingSprite.offsetWidth;
        ghostKingSprite.classList.add(
            "hit"
        );
    }
    if (
        BOSS.phase === 1 &&
        BOSS.health < 650
    ) {
        BOSS.phase = 2;
        BOSS.speed += 0.6;
        BOSS.damage += 4;
        BOSS.attackCooldown =
            1500;
        showNotification(
            "THE GHOST KING GROWS STRONGER!"
        );
    }
    if (
        BOSS.phase === 2 &&
        BOSS.health < 300
    ) {
        BOSS.phase = 3;
        BOSS.speed += 0.6;
        BOSS.damage += 6;
        BOSS.attackCooldown =
            1100;
        cameraShake(
            16,
            400
        );
        showNotification(
            "GHOST KING — RAGE MODE!"
        );
    }
    if (
        BOSS.health <= 0
    ) {
        bossDefeated();
    }
}
function bossDefeated() {
    if (BOSS.defeated) return;
    BOSS.defeated = true;
    BOSS.active = false;
    BOSS.intro = false;
    GAME.score += 5000;
    if (mission3) {
        mission3.style.textDecoration =
            "line-through";
    }
    if (scoreCounter) {
        scoreCounter.textContent =
            GAME.score
                .toString()
                .padStart(
                    6,
                    "0"
                );
    }
    cameraShake(
        24,
        700
    );
    safePlay(
        bossRoarSound
    );
    if (bossEl) {
        bossEl.style.transition =
            "opacity .8s ease, transform .8s ease";
        bossEl.style.opacity =
            "0";
        bossEl.style.transform =
            "translateY(-50px) scale(1.2)";
        setTimeout(() => {
            bossEl.style.display =
                "none";
        }, 800);
    }
    if (bossHUD) {
        bossHUD.style.display =
            "none";
    }
    showNotification(
        "THE GHOST KING HAS FALLEN!"
    );
    setTimeout(() => {
        activatePortal(
            BOSS.x,
            BOSS.y
        );
    }, 1000);
    setTimeout(() => {
        winGame();
    }, 2200);
}
function activatePortal(x, y) {
    if (PORTAL.active) return;
    PORTAL.active = true;
    PORTAL.entered = false;
    PORTAL.x = x;
    PORTAL.y = y;
    if (!day6Portal) return;
    day6Portal.style.display =
        "flex";
    day6Portal.style.position =
        "absolute";
    day6Portal.style.left =
        x + "px";
    day6Portal.style.top =
        y + "px";
    day6Portal.style.opacity =
        "0";
    day6Portal.style.pointerEvents =
        "auto";
    day6Portal.style.transform =
        "translate(-50%,-60%) scale(.2)";
    day6Portal.style.transition =
        "opacity .8s ease, transform .8s ease";
    requestAnimationFrame(() => {
        day6Portal.style.opacity =
            "1";
        day6Portal.style.transform =
            "translate(-50%,-60%) scale(1)";
    });
    safePlay(
        portalSound
    );
    showNotification(
        "PORTAL TO DAY 6 HAS OPENED!"
    );
    setTimeout(() => {
        showNotification(
            "PRESS F OR CONTINUE"
        );
    }, 1200);
}
function updatePortalProximity() {
    if (!PORTAL.active) return;
    if (PORTAL.entered) return;
    const distance =
        distanceBetween(
            PLAYER.x,
            PLAYER.y,
            PORTAL.x,
            PORTAL.y
        );
    const inRange =
        distance <=
        CONFIG.PORTAL_HINT_RADIUS;
    if (day6Portal) {
        day6Portal.classList.toggle(
            "inRange",
            inRange
        );
    }
    if (
        interactionPrompt &&
        inRange &&
        GAME.victory
    ) {
        interactionPrompt.style.display =
            "flex";
        interactionPrompt.textContent =
            "PRESS F TO ENTER DAY 6";
    }
}
function goToDay6() {
    if (!DAY5_ACCESS.completed) {
        showNotification("SAVE DAY 5 PROGRESS BEFORE CONTINUING");
        return;
    }
    if (PORTAL.entered) return;
    PORTAL.entered = true;
    GAME.running = false;
    GAME.paused = false;
    safePlay(
        portalSound
    );
    if (victoryScreen) {
        victoryScreen.style.display =
            "none";
        victoryScreen.style.pointerEvents =
            "none";
    }
    if (day6Portal) {
        day6Portal.style.pointerEvents =
            "none";
        day6Portal.style.opacity =
            "0";
    }
    let transition =
        document.getElementById(
            "day6Transition"
        );
    if (!transition) {
        transition =
            document.createElement(
                "div"
            );
        transition.id =
            "day6Transition";
        transition.style.position =
            "fixed";
        transition.style.inset =
            "0";
        transition.style.background =
            "#000";
        transition.style.zIndex =
            "999999";
        transition.style.opacity =
            "0";
        transition.style.transition =
            "opacity 1s ease";
        transition.style.pointerEvents =
            "all";
        document.body.appendChild(
            transition
        );
    }
    requestAnimationFrame(() => {
        transition.style.opacity =
            "1";
    });
    setTimeout(() => {
        window.location.href =
            CONFIG.NEXT_LEVEL_URL;
    }, 1100);
}
on(
    day6Portal,
    "click",
    (event) => {
        event.preventDefault();
        if (GAME.victory) {
            goToDay6();
        } else {
            showNotification(
                "DEFEAT THE GHOST KING FIRST!"
            );
        }
    }
);
on(
    day6Portal,
    "touchstart",
    (event) => {
        event.preventDefault();
        if (GAME.victory) {
            goToDay6();
        } else {
            showNotification(
                "DEFEAT THE GHOST KING FIRST!"
            );
        }
    },
    { passive: false }
);
on(
    continueButton,
    "click",
    async (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!DAY5_ACCESS.completed) {
            const saved = await saveDay5Completion();
            if (saved) await winGame(true);
            return;
        }
        goToDay6();
    }
);
on(
    continueButton,
    "touchstart",
    async (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!DAY5_ACCESS.completed) {
            const saved = await saveDay5Completion();
            if (saved) await winGame(true);
            return;
        }
        goToDay6();
    },
    { passive: false }
);
function updateSkill(delta) {
    if (SKILL.timer > 0) {
        SKILL.timer -= delta;
    }
}
function castSpiritSkill() {
    if (!GAME.running) return;
    if (GAME.paused) return;
    if (SKILL.timer > 0) return;
    if (
        PLAYER.spirit <
        SKILL.spiritCost
    ) {
        showNotification(
            "NOT ENOUGH SPIRIT"
        );
        return;
    }
    PLAYER.spirit -=
        SKILL.spiritCost;
    SKILL.timer =
        SKILL.cooldown;
    if (player) {
        player.classList.add(
            "skillCast"
        );
        setTimeout(() => {
            player.classList.remove(
                "skillCast"
            );
        }, 700);
    }
    GHOSTS.forEach(
        (ghost) => {
            if (!ghost.alive) return;
            const distance =
                distanceBetween(
                    PLAYER.x,
                    PLAYER.y,
                    ghost.x,
                    ghost.y
                );
            if (distance > 260) return;
            ghost.health -=
                SKILL.damage;
            updateGhostHealthBar(
                ghost
            );
            if (
                ghost.health <= 0
            ) {
                killGhost(
                    ghost
                );
            }
        }
    );
    if (
        BOSS.active &&
        !BOSS.defeated
    ) {
        const distance =
            distanceBetween(
                PLAYER.x,
                PLAYER.y,
                BOSS.x,
                BOSS.y
            );
        if (distance < 260) {
            damageBossIfInRange();
        }
    }
    cameraShake(
        10,
        200
    );
    showNotification(
        "SPIRIT BURST!"
    );
}
function startDash() {
    if (!GAME.running) return;
    if (GAME.paused) return;
    if (DASH.active) return;
    if (
        DASH.cooldownTimer > 0
    ) {
        return;

    }
    if (
        PLAYER.stamina < 20
    ) {
        return;
    }
    let dx =
        PLAYER.velocityX;
    let dy =
        PLAYER.velocityY;
    if (
        dx === 0 &&
        dy === 0
    ) {
        dx =
            PLAYER.facing;
        dy = 0;
    }
    const length =
        Math.hypot(
            dx,
            dy
        );
    if (length === 0) return;
    DASH.directionX =
        dx / length;
    DASH.directionY =
        dy / length;
    DASH.active = true;
    DASH.timer =
        DASH.duration;
    DASH.cooldownTimer =
        DASH.cooldown;
    PLAYER.invincible = true;
    PLAYER.stamina -= 20;
    safePlay(
        heroDashSound
    );
    triggerDashTrail();
    if (player) {
        player.classList.add(
            "dash"
        );
    }
}
function updateDash(delta) {
    if (
        DASH.cooldownTimer > 0
    ) {
        DASH.cooldownTimer -=
            delta;
    }
    if (!DASH.active) return;
    DASH.timer -=
        delta;
    PLAYER.x +=
        DASH.directionX *
        DASH.speed;
    PLAYER.y +=
        DASH.directionY *
        DASH.speed;
    PLAYER.x =
        clamp(
            PLAYER.x,
            60,
            CONFIG.WORLD_WIDTH -
            60
        );
    PLAYER.y =
        clamp(
            PLAYER.y,
            60,
            CONFIG.WORLD_HEIGHT -
            60
        );
    if (DASH.timer <= 0) {
        DASH.active = false;
        PLAYER.invincible = false;
        if (player) {
            player.classList.remove(
                "dash"
            );
        }
    }
}
function showNotification(text) {
    if (!notificationContainer) return;
    const notification =
        document.createElement(
            "div"
        );
    notification.className =
        "notification";
    notification.textContent =
        text;
    notificationContainer.appendChild(
        notification
    );
    setTimeout(() => {
        notification.remove();
    }, 1800);
}
async function winGame(saveAlreadyConfirmed = false) {
    if (GAME.victory && DAY5_ACCESS.completed) return;
    GAME.running = false;
    GAME.paused = false;
    const saved = saveAlreadyConfirmed || await saveDay5Completion();
    if (!saved) {
        if (victoryScreen) {
            if (victoryScreen.parentElement !== document.body) document.body.appendChild(victoryScreen);
            victoryScreen.style.position = "fixed";
            victoryScreen.style.inset = "0";
            victoryScreen.style.zIndex = "100000";
            victoryScreen.style.display = "flex";
            victoryScreen.style.pointerEvents = "auto";
        }
        if (continueButton) {
            continueButton.disabled = false;
            continueButton.style.display = "flex";
            continueButton.textContent = "RETRY SAVE";
        }
        return;
    }
    GAME.victory = true;
    GAME.running = false;
    GAME.paused = false;
    safePlay(
        victorySound
    );
    if (victoryScreen) {
        if (
            victoryScreen.parentElement !==
            document.body
        ) {
            document.body.appendChild(
                victoryScreen
            );
        }
        victoryScreen.style.position =
            "fixed";
        victoryScreen.style.inset =
            "0";
        victoryScreen.style.zIndex =
            "100000";
        victoryScreen.style.display =
            "flex";
        victoryScreen.style.pointerEvents =
            "auto";
        victoryScreen.style.opacity =
            "0";
        victoryScreen.style.transition =
            "opacity .6s ease";
        requestAnimationFrame(() => {
            victoryScreen.style.opacity =
                "1";
        });
    }
    if (continueButton) {
        continueButton.style.display =
            "flex";
        continueButton.style.pointerEvents =
            "auto";
        continueButton.disabled =
            false;
    }
    showNotification(
        "DAY 5 COMPLETE!"
    );
}
function playerDie() {
    if (GAME.gameOver) return;
    GAME.gameOver = true;
    GAME.running = false;
    safePlay(
        gameOverSound
    );
    if (gameOverScreen) {
        if (
            gameOverScreen.parentElement !==
            document.body
        ) {
            document.body.appendChild(
                gameOverScreen
            );
        }
        gameOverScreen.style.position =
            "fixed";
        gameOverScreen.style.inset =
            "0";
        gameOverScreen.style.zIndex =
            "100000";
        gameOverScreen.style.display =
            "flex";
        gameOverScreen.style.pointerEvents =
            "auto";
    }
}
on(
    retryGameButton,
    "click",
    () => {
        window.location.reload();
    }
);
on(
    quitEventButton,
    "click",
    () => {
        window.location.href =
            "index.html";
    }
);
function worldToMiniMap(x, y) {
    const width =
        miniMapFrame ?
        miniMapFrame.clientWidth ||
        200 :
        200;
    const height =
        miniMapFrame ?
        miniMapFrame.clientHeight ||
        200 :
        200;
    return {
        left:
            (
                x /
                CONFIG.WORLD_WIDTH
            ) *
            width,
        top:
            (
                y /
                CONFIG.WORLD_HEIGHT
            ) *
            height
    };
}
function updateMiniMap() {
    if (!miniMapFrame) return;
    if (miniPlayerEl) {
        const position =
            worldToMiniMap(
                PLAYER.x,
                PLAYER.y
            );
        miniPlayerEl.style.left =
            position.left + "px";
        miniPlayerEl.style.top =
            position.top + "px";
    }
    LANTERNS.forEach(
        (lantern, index) => {
            const dot =
                document.getElementById(
                    "miniLantern" +
                    (index + 1)
                );
            if (!dot) return;
            const position =
                worldToMiniMap(
                    lantern.x,
                    lantern.y
                );
            dot.style.position =
                "absolute";
            dot.style.left =
                position.left + "px";
            dot.style.top =
                position.top + "px";
            dot.style.opacity =
                lantern.lit
                ? "0"
                : "0.8";
        }
    );
    if (miniBossEl) {
        if (
            BOSS.active &&
            !BOSS.defeated
        ) {
            const position =
                worldToMiniMap(
                    BOSS.x,
                    BOSS.y
                );
            miniBossEl.style.display =
                "block";
            miniBossEl.style.left =
                position.left + "px";
            miniBossEl.style.top =
                position.top + "px";
        } else {
            miniBossEl.style.display =
                "none";
        }
    }
}
function nearestUnlitLantern() {
    let nearest = null;
    let nearestDistance =
        Infinity;
    LANTERNS.forEach(
        (lantern) => {
            if (lantern.lit) return;
            const distance =
                distanceBetween(
                    PLAYER.x,
                    PLAYER.y,
                    lantern.x,
                    lantern.y
                );
            if (
                distance <
                nearestDistance
            ) {
                nearestDistance =
                    distance;
                nearest =
                    lantern;
            }
        }
    );
    return nearest;
}
function updateCompass() {
    if (!compassNeedle) return;
    let target =
        nearestUnlitLantern();
    if (
        !target &&
        BOSS.active &&
        !BOSS.defeated
    ) {
        target = BOSS;
    }
    if (!target) {
        compassNeedle.style.transform =
            "rotate(0deg)";
        return;
    }
    const dx =
        target.x -
        PLAYER.x;
    const dy =
        target.y -
        PLAYER.y;
    const angle =
        Math.atan2(
            dy,
            dx
        ) *
        180 /
        Math.PI +
        90;
    compassNeedle.style.transform =
        `rotate(${angle}deg)`;
}
function spawnAmbientBats() {
    const layer =
        $("#batLayer");
    if (!layer) return;
    const count =
        GAME.mobile ?
        6 :
        14;
    for (
        let i = 0;
        i < count;
        i++
    ) {
        const bat =
            document.createElement(
                "div"
            );
        bat.className =
            "bat";
        bat.style.top =
            random(
                50,
                500
            ) + "px";
        bat.style.animationDuration =
            random(
                10,
                18
            ) + "s";
        bat.style.animationDelay =
            random(
                0,
                8
            ) + "s";
        layer.appendChild(
            bat
        );
    }
}
function scheduleLightning() {
    if (!lightningLayer) return;
    const delay =
        random(
            6000,
            14000
        );
    setTimeout(() => {
        lightningLayer.style.transition =
            "opacity .1s";
        lightningLayer.style.opacity =
            "0.9";
        safePlay(
            lightningSound
        );
        setTimeout(() => {
            lightningLayer.style.opacity =
                "0";
        }, 150);
        scheduleLightning();
    }, delay);
}
function updateFPS(delta) {
    ENGINE.frame++;
    ENGINE.fpsTimer +=
        delta;
    if (
        ENGINE.fpsTimer >=
        1000
    ) {
        ENGINE.fps =
            ENGINE.frame;
        ENGINE.frame = 0;
        ENGINE.fpsTimer = 0;
        if (fpsValue) {
            fpsValue.textContent =
                ENGINE.fps;
        }
    }
}
function gameLoop(time) {
    const delta =
        Math.min(
            50,
            time -
            ENGINE.lastTime ||
            16
        );
    ENGINE.lastTime =
        time;
    if (
        GAME.running &&
        !GAME.paused
    ) {
        applyMovement();
        updateDash(delta);
        updateSkill(delta);
        regeneratePlayer(delta);
        updateGhostAI(delta);
        updateBoss(delta);
        updateLanternProximity();
        updatePortalProximity();
        updateCamera();
        renderPlayer();
        updatePlayerHUD();
        updateMiniMap();
        updateCompass();
    } else {
        updatePlayerHUD();
    }
    if (playerXLabel) {
        playerXLabel.textContent =
            Math.round(
                PLAYER.x
            );
    }
    if (playerYLabel) {
        playerYLabel.textContent =
            Math.round(
                PLAYER.y
            );
    }
    updateFPS(delta);
    requestAnimationFrame(
        gameLoop
    );
}
const DAY5_ACCESS = {
    user: null,
    progress: null,
    checked: false,
    completed: false,
    saving: false
};
function showAccessBlock(message) {
    const existing = document.getElementById("day5AccessBlock");
    if (existing) existing.remove();
    const panel = document.createElement("div");
    panel.id = "day5AccessBlock";
    panel.style.cssText = "position:fixed;inset:0;z-index:200000;background:#05070d;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:28px;text-align:center;font-family:system-ui,sans-serif;gap:14px";
    const heading = document.createElement("h1");
    heading.textContent = "DAY 5 LOCKED";
    heading.style.cssText = "color:#ff8a00;margin:0";
    const detail = document.createElement("p");
    detail.textContent = message;
    detail.style.cssText = "max-width:600px;line-height:1.6";
    const retry = document.createElement("button");
    retry.textContent = "RETRY CHECK";
    retry.style.cssText = "padding:12px 22px;border:0;border-radius:8px;background:#ff8a00;color:#05070d;font-weight:800;cursor:pointer";
    retry.addEventListener("click", () => window.location.reload());
    panel.append(heading, detail, retry);
    document.body.appendChild(panel);
}
async function verifyDay5Access() {
    try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        const user = sessionData?.session?.user;
        if (!user) {
            showAccessBlock("Please sign in first. Day 5 requires an authenticated festival account and Day 4 completion.");
            return false;
        }
        const { data: progress, error } = await supabase
            .from("festival_progress")
            .select("user_id, festival, day4, day5")
            .eq("user_id", user.id)
            .eq("festival", "halloween_2026")
            .maybeSingle();
        if (error) throw error;
        if (!progress || progress.day4 !== true) {
            showAccessBlock("Complete Day 4 first. Day 5 access is checked against your own festival_progress row.");
            return false;
        }
        DAY5_ACCESS.user = user;
        DAY5_ACCESS.progress = progress;
        DAY5_ACCESS.checked = true;
        DAY5_ACCESS.completed = progress.day5 === true;
        return true;
    } catch (error) {
        console.error("Day 5 Supabase access check failed:", error);
        showAccessBlock("Could not verify your festival progress. Check your connection and Supabase RLS policies, then retry.");
        return false;
    }
}
async function saveDay5Completion() {
    if (DAY5_ACCESS.saving) return false;
    if (!DAY5_ACCESS.checked || !DAY5_ACCESS.user) {
        showNotification("SIGN IN AND VERIFY ACCESS BEFORE SAVING");
        return false;
    }
    if (GAME.lanterns < CONFIG.TOTAL_LANTERNS) {
        showNotification("RESTORE ALL 7 LANTERNS FIRST");
        return false;
    }
    if (GHOSTS.some((ghost) => ghost.alive)) {
        showNotification("DEFEAT ALL CEMETERY GHOSTS FIRST");
        return false;
    }
    if (!BOSS.defeated) {
        showNotification("DEFEAT THE GHOST KING FIRST");
        return false;
    }
    DAY5_ACCESS.saving = true;
    if (continueButton) {
        continueButton.disabled = true;
        continueButton.textContent = "SAVING PROGRESS…";
    }
    try {
        const { data, error } = await supabase
            .from("festival_progress")
            .update({ day5: true })
            .eq("user_id", DAY5_ACCESS.user.id)
            .eq("festival", "halloween_2026")
            .eq("day4", true)
            .select("user_id, festival, day4, day5");
        if (error) throw error;
        if (!Array.isArray(data) || data.length !== 1 || data[0].day5 !== true) {
            throw new Error("Supabase did not confirm the Day 5 update. Check UPDATE and SELECT RLS policies.");
        }
        DAY5_ACCESS.progress = data[0];
        DAY5_ACCESS.completed = true;
        try {
            localStorage.setItem("day5Complete", "true");
            localStorage.setItem("day5Score", String(GAME.score));
        } catch (_) {}
        if (continueButton) {
            continueButton.disabled = false;
            continueButton.textContent = "CONTINUE TO DAY 6";
        }
        return true;
    } catch (error) {
        console.error("Day 5 completion save failed:", error);
        showNotification("SAVE FAILED — PRESS RETRY SAVE");
        if (continueButton) {
            continueButton.disabled = false;
            continueButton.textContent = "RETRY SAVE";
            continueButton.style.display = "flex";
        }
        return false;
    } finally {
        DAY5_ACCESS.saving = false;
    }
}
async function initializeGame() {
    const accessGranted = await verifyDay5Access();
    if (!accessGranted) return;
    fixGameOverlays();
    detectDevice();
    initGhosts();
    initLanterns();
    spawnAmbientBats();
    scheduleLightning();
    if (lanternCounter) {
        lanternCounter.textContent =
            `0 / ${CONFIG.TOTAL_LANTERNS}`;
    }
    if (scoreCounter) {
        scoreCounter.textContent =
            "000000";
    }
    if (interactionPrompt) {
        interactionPrompt.style.display =
            "none";
    }
    if (victoryScreen) {
        victoryScreen.style.display =
            "none";
    }
    if (gameOverScreen) {
        gameOverScreen.style.display =
            "none";
    }
    if (bossHUD) {
        bossHUD.style.display =
            "none";
    }
    if (bossEl) {
        bossEl.style.display =
            "none";
    }
    ENGINE.lastTime =
        performance.now();
    startLoading();
    requestAnimationFrame(
        gameLoop
    );
}
if (
    document.readyState ===
    "loading"
) {
    window.addEventListener(
        "DOMContentLoaded",
        initializeGame,
        {
            once: true
        }
    );
} else {
    initializeGame();
}
