"use strict";

/* =========================================================
   VIDLYRA HALLOWEEN FEST 2026
   DAY 6 — THE WITCH'S DOMAIN
   COMPLETE GAME ENGINE
   DAY 6 → DAY 7 VIDEO
========================================================= */


/* =========================================================
   DOM HELPERS
========================================================= */

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

function on(element, event, handler, options) {
    if (element) {
        element.addEventListener(event, handler, options);
    }
}

function playSound(audio) {
    if (!audio) return;

    try {
        audio.currentTime = 0;

        const promise = audio.play();

        if (promise && promise.catch) {
            promise.catch(() => {});
        }
    } catch (error) {}
}


/* =========================================================
   DOM REFERENCES
========================================================= */

const loadingScreen = $("#loadingScreen");
const loadingFill = $("#loadingFill");
const loadingPercent = $("#loadingPercent");
const loadingMessage = $("#loadingMessage");

const gameWorld = $("#gameWorld");
const playerContainer = $("#playerContainer");
const player = $("#player");

const slashEffect = $("#slashEffect");
const dashTrail = $("#dashTrail");

const healthFill = $("#healthFill");
const spiritFill = $("#spiritFill");

const healthText = $("#healthText");
const spiritText = $("#spiritText");

const crystalCounter = $("#crystalCounter");
const scoreCounter = $("#scoreCounter");

const missionPopup = $("#missionPopup");
const mission1 = $("#mission1");
const mission2 = $("#mission2");
const mission3 = $("#mission3");

const boss = $("#boss");
const bossHUD = $("#bossHUD");
const bossHealthFill = $("#bossHealthFill");

const interactionPrompt = $("#interactionPrompt");
const notificationContainer = $("#notificationContainer");

const pauseMenu = $("#pauseMenu");
const resumeButton = $("#resumeButton");
const pauseButton = $("#pauseButton");

const victoryScreen = $("#victoryScreen");
const continueButton = $("#continueButton");

const gameOverScreen = $("#gameOverScreen");
const retryButton = $("#retryButton");

const mobileControls = $("#mobileControls");
const joystickBase = $("#joystickBase");
const joystickStick = $("#joystickStick");

const attackButton = $("#attackButton");
const dashButton = $("#dashButton");
const skillButton = $("#skillButton");

const lightningLayer = $("#lightningLayer");


/* =========================================================
   AUDIO
========================================================= */

const bgMusic = $("#bgMusic");
const victorySound = $("#victorySound");
const gameOverSound = $("#gameOverSound");
const swordSlashSound = $("#swordSlash");
const heroDashSound = $("#heroDash");
const bossRoarSound = $("#bossRoar");
const crystalSound = $("#crystalSound");
const portalSound = $("#portalSound");


/* =========================================================
   CONFIG
========================================================= */

const CONFIG = {

    PLAYER_SPEED: 6,

    DASH_SPEED: 18,

    ATTACK_DAMAGE: 25,

    SKILL_DAMAGE: 60,

    MAX_HEALTH: 100,

    MAX_SPIRIT: 100,

    MAX_STAMINA: 100,

    TOTAL_CRYSTALS: 6,

    WORLD_WIDTH: 5000,

    WORLD_HEIGHT: 2200,

    CRYSTAL_PICKUP_RADIUS: 125,

    CRYSTAL_HINT_RADIUS: 220,

    ENEMY_DETECT_RANGE: 600,

    ENEMY_ATTACK_RANGE: 100,

    BOSS_ATTACK_RANGE: 150,

    BOSS_START_HEALTH: 1200,

    NEXT_LEVEL_URL: "day7-video.html"

};


/* =========================================================
   GAME STATE
========================================================= */

const GAME = {

    running: false,

    paused: false,

    loading: true,

    victory: false,

    gameOver: false,

    mobile: false,

    score: 0,

    crystals: 0,

    kills: 0

};


/* =========================================================
   PLAYER
========================================================= */

const PLAYER = {

    x: 500,

    y: 1600,

    health: CONFIG.MAX_HEALTH,

    maxHealth: CONFIG.MAX_HEALTH,

    spirit: CONFIG.MAX_SPIRIT,

    maxSpirit: CONFIG.MAX_SPIRIT,

    stamina: CONFIG.MAX_STAMINA,

    maxStamina: CONFIG.MAX_STAMINA,

    speed: CONFIG.PLAYER_SPEED,

    facing: 1,

    moving: false,

    attacking: false,

    invincible: false,

    state: "idle",

    vx: 0,

    vy: 0

};


/* =========================================================
   INPUT
========================================================= */

const INPUT = {

    left: false,

    right: false,

    up: false,

    down: false

};


/* =========================================================
   JOYSTICK
========================================================= */

const JOYSTICK = {

    active: false,

    dx: 0,

    dy: 0,

    radius: 55,

    startX: 0,

    startY: 0

};


/* =========================================================
   SETTINGS
========================================================= */

const SETTINGS = {

    screenShake: true

};


/* =========================================================
   UTILITY
========================================================= */

function clamp(value, min, max) {

    return Math.max(min, Math.min(max, value));

}


function random(min, max) {

    return Math.random() * (max - min) + min;

}


function distanceBetween(x1, y1, x2, y2) {

    return Math.hypot(x2 - x1, y2 - y1);

}


/* =========================================================
   DEVICE DETECTION
========================================================= */

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

window.addEventListener("resize", detectDevice);


/* =========================================================
   LOADING
========================================================= */

const loadingMessages = [

    "Entering the Witch's Domain...",

    "Awakening ancient crystals...",

    "Summoning the guardians...",

    "Opening the cursed sanctuary...",

    "The Ancient Guardian awaits...",

    "Preparing Day 6..."

];


function startLoading() {

    let progress = 0;

    const timer = setInterval(() => {

        progress += random(3, 9);

        if (progress >= 100) {

            progress = 100;

        }

        if (loadingFill) {

            loadingFill.style.width =
                progress + "%";

        }

        if (loadingPercent) {

            loadingPercent.textContent =
                Math.floor(progress) + "%";

        }

        if (loadingMessage) {

            const index =
                Math.min(
                    loadingMessages.length - 1,
                    Math.floor(
                        progress /
                        100 *
                        loadingMessages.length
                    )
                );

            loadingMessage.textContent =
                loadingMessages[index];

        }

        if (progress >= 100) {

            clearInterval(timer);

            setTimeout(finishLoading, 500);

        }

    }, 120);

}


function finishLoading() {

    GAME.loading = false;

    GAME.running = true;

    if (loadingScreen) {

        loadingScreen.style.opacity = "0";

        loadingScreen.style.pointerEvents =
            "none";

        setTimeout(() => {

            loadingScreen.style.display =
                "none";

        }, 700);

    }

    if (missionPopup) {

        missionPopup.style.opacity = "1";

        setTimeout(() => {

            missionPopup.style.opacity = "0";

        }, 4000);

    }

    if (bgMusic) {

        bgMusic.volume = 0.45;

        playSound(bgMusic);

    }

}


/* =========================================================
   KEYBOARD
========================================================= */

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
            attack();
            break;

        case "ShiftLeft":
        case "ShiftRight":
            dash();
            break;

        case "KeyE":
            spiritSkill();
            break;

        case "KeyF":
            interact();
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


/* =========================================================
   MOBILE JOYSTICK
========================================================= */

function joystickPosition(event) {

    const touch =
        event.touches[0];

    return {

        x: touch.clientX,

        y: touch.clientY

    };

}


on(joystickBase, "touchstart", (event) => {

    event.preventDefault();

    const point =
        joystickPosition(event);

    JOYSTICK.active = true;

    JOYSTICK.startX =
        point.x;

    JOYSTICK.startY =
        point.y;

}, { passive: false });


on(joystickBase, "touchmove", (event) => {

    event.preventDefault();

    if (!JOYSTICK.active) return;

    const point =
        joystickPosition(event);

    let dx =
        point.x -
        JOYSTICK.startX;

    let dy =
        point.y -
        JOYSTICK.startY;

    const length =
        Math.hypot(dx, dy);

    if (length > JOYSTICK.radius) {

        const angle =
            Math.atan2(dy, dx);

        dx =
            Math.cos(angle) *
            JOYSTICK.radius;

        dy =
            Math.sin(angle) *
            JOYSTICK.radius;

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

        joystickStick.style.transform =
            "translate(-50%,-50%)";

    }

}


on(joystickBase, "touchend", resetJoystick);

on(joystickBase, "touchcancel", resetJoystick);


/* =========================================================
   MOBILE BUTTONS
========================================================= */

on(attackButton, "touchstart", (event) => {

    event.preventDefault();

    attack();

}, { passive: false });


on(dashButton, "touchstart", (event) => {

    event.preventDefault();

    dash();

}, { passive: false });


on(skillButton, "touchstart", (event) => {

    event.preventDefault();

    spiritSkill();

}, { passive: false });


/* =========================================================
   PAUSE
========================================================= */

function togglePause() {

    if (GAME.gameOver ||
        GAME.victory) {

        return;

    }

    GAME.paused =
        !GAME.paused;

    if (pauseMenu) {

        pauseMenu.style.display =
            GAME.paused
                ? "flex"
                : "none";

    }

}


on(pauseButton, "click", togglePause);


on(resumeButton, "click", () => {

    GAME.paused = false;

    if (pauseMenu) {

        pauseMenu.style.display =
            "none";

    }

});


/* =========================================================
   CAMERA
========================================================= */

const CAMERA = {

    x: 0,

    y: 0,

    width: window.innerWidth,

    height: window.innerHeight,

    smooth: 0.1

};


window.addEventListener("resize", () => {

    CAMERA.width =
        window.innerWidth;

    CAMERA.height =
        window.innerHeight;

});


function updateCamera() {

    const targetX =
        PLAYER.x -
        CAMERA.width / 2;

    const targetY =
        PLAYER.y -
        CAMERA.height / 2;

    CAMERA.x +=
        (targetX - CAMERA.x) *
        CAMERA.smooth;

    CAMERA.y +=
        (targetY - CAMERA.y) *
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
            `translate(${-CAMERA.x}px,${-CAMERA.y}px)`;

    }

}


function cameraShake(power = 8, duration = 200) {

    if (!SETTINGS.screenShake ||
        !gameWorld) {

        return;

    }

    const start =
        performance.now();

    function shake(time) {

        const elapsed =
            time - start;

        if (elapsed >= duration) {

            updateCamera();

            return;

        }

        const x =
            (Math.random() - 0.5) *
            power;

        const y =
            (Math.random() - 0.5) *
            power;

        gameWorld.style.transform =
            `translate(${-CAMERA.x + x}px,${-CAMERA.y + y}px)`;

        requestAnimationFrame(shake);

    }

    requestAnimationFrame(shake);

}


/* =========================================================
   PLAYER MOVEMENT
========================================================= */

function updateMovement() {

    PLAYER.vx = 0;
    PLAYER.vy = 0;

    if (INPUT.left)
        PLAYER.vx--;

    if (INPUT.right)
        PLAYER.vx++;

    if (INPUT.up)
        PLAYER.vy--;

    if (INPUT.down)
        PLAYER.vy++;

    if (JOYSTICK.active) {

        PLAYER.vx +=
            JOYSTICK.dx /
            JOYSTICK.radius;

        PLAYER.vy +=
            JOYSTICK.dy /
            JOYSTICK.radius;

    }

    const length =
        Math.hypot(
            PLAYER.vx,
            PLAYER.vy
        );

    PLAYER.moving =
        length > 0;

    if (!PLAYER.moving) {

        if (!PLAYER.attacking) {

            PLAYER.state =
                "idle";

        }

        return;

    }

    PLAYER.vx /= length;

    PLAYER.vy /= length;

    let speed =
        PLAYER.speed;

    if (DASH.active) {

        speed =
            CONFIG.DASH_SPEED;

    }

    PLAYER.x +=
        PLAYER.vx *
        speed;

    PLAYER.y +=
        PLAYER.vy *
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

    if (PLAYER.vx < -0.1)
        PLAYER.facing = -1;

    if (PLAYER.vx > 0.1)
        PLAYER.facing = 1;

    PLAYER.state =
        DASH.active
            ? "dash"
            : "walk";

}


function renderPlayer() {

    if (!playerContainer)
        return;

    playerContainer.style.left =
        PLAYER.x + "px";

    playerContainer.style.top =
        PLAYER.y + "px";

    playerContainer.style.transform =
        `translate(-50%,-100%) scaleX(${PLAYER.facing})`;

}


/* =========================================================
   PLAYER HUD
========================================================= */

function updateHUD() {

    const health =
        Math.round(
            PLAYER.health
        );

    const spirit =
        Math.round(
            PLAYER.spirit
        );

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

    if (crystalCounter) {

        crystalCounter.textContent =
            `${GAME.crystals} / ${CONFIG.TOTAL_CRYSTALS}`;

    }

    if (scoreCounter) {

        scoreCounter.textContent =
            String(GAME.score)
                .padStart(6, "0");

    }

}


/* =========================================================
   DASH
========================================================= */

const DASH = {

    active: false,

    timer: 0,

    cooldown: 0,

    duration: 220,

    cooldownDuration: 750

};


function dash() {

    if (!GAME.running ||
        GAME.paused ||
        GAME.victory ||
        GAME.gameOver) {

        return;

    }

    if (DASH.active ||
        DASH.cooldown > 0) {

        return;

    }

    if (PLAYER.stamina < 20) {

        showNotification(
            "Not enough stamina"
        );

        return;

    }

    DASH.active = true;

    DASH.timer =
        DASH.duration;

    DASH.cooldown =
        DASH.cooldownDuration;

    PLAYER.invincible = true;

    PLAYER.stamina -= 20;

    if (player) {

        player.classList.add(
            "dash"
        );

    }

    if (dashTrail) {

        dashTrail.classList.add(
            "play"
        );

        setTimeout(() => {

            dashTrail.classList.remove(
                "play"
            );

        }, 250);

    }

    playSound(heroDashSound);

}


function updateDash(delta) {

    if (DASH.cooldown > 0) {

        DASH.cooldown -= delta;

    }

    if (!DASH.active)
        return;

    DASH.timer -= delta;

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


/* =========================================================
   ATTACK
========================================================= */

const ATTACK = {

    cooldown: 0,

    duration: 250,

    range: 150,

    damage: CONFIG.ATTACK_DAMAGE

};


function attack() {

    if (!GAME.running ||
        GAME.paused ||
        GAME.victory ||
        GAME.gameOver) {

        return;

    }

    if (ATTACK.cooldown > 0)
        return;

    ATTACK.cooldown =
        280;

    PLAYER.attacking = true;

    PLAYER.state =
        "attack";

    playSound(
        swordSlashSound
    );

    if (slashEffect) {

        slashEffect.classList.remove(
            "play"
        );

        void slashEffect.offsetWidth;

        slashEffect.classList.add(
            "play"
        );

    }

    if (player) {

        player.classList.remove(
            "attack"
        );

        void player.offsetWidth;

        player.classList.add(
            "attack"
        );

        setTimeout(() => {

            player.classList.remove(
                "attack"
            );

        }, 300);

    }

    damageEnemies();

    damageBoss();

    setTimeout(() => {

        PLAYER.attacking = false;

    }, ATTACK.duration);

}


/* =========================================================
   ENEMY DATA
========================================================= */

const ENEMIES = [];


function initEnemies() {

    const elements =
        $$(".enemy");

    elements.forEach(
        (element, index) => {

            const angle =
                index /
                elements.length *
                Math.PI * 2;

            const radius =
                650 +
                random(
                    -100,
                    300
                );

            const x =
                clamp(
                    2500 +
                    Math.cos(angle) *
                    radius,
                    150,
                    CONFIG.WORLD_WIDTH -
                    150
                );

            const y =
                clamp(
                    1150 +
                    Math.sin(angle) *
                    radius *
                    0.65,
                    150,
                    CONFIG.WORLD_HEIGHT -
                    150
                );

            element.style.position =
                "absolute";

            element.style.left =
                x + "px";

            element.style.top =
                y + "px";

            element.style.display =
                "flex";

            ENEMIES.push({

                element,

                x,

                y,

                health: 100,

                maxHealth: 100,

                speed:
                    random(
                        1.3,
                        2
                    ),

                damage: 8,

                alive: true,

                attackTimer:
                    random(
                        500,
                        1200
                    ),

                floatOffset:
                    random(
                        0,
                        1000
                    )

            });

        }
    );

}


/* =========================================================
   ENEMY AI
========================================================= */

function updateEnemies(delta) {

    ENEMIES.forEach(
        (enemy) => {

            if (!enemy.alive)
                return;

            const dx =
                PLAYER.x -
                enemy.x;

            const dy =
                PLAYER.y -
                enemy.y;

            const distance =
                Math.hypot(
                    dx,
                    dy
                );

            if (
                distance <
                CONFIG.ENEMY_DETECT_RANGE
            ) {

                if (
                    distance >
                    CONFIG.ENEMY_ATTACK_RANGE
                ) {

                    enemy.x +=
                        dx /
                        distance *
                        enemy.speed;

                    enemy.y +=
                        dy /
                        distance *
                        enemy.speed;

                } else {

                    enemy.attackTimer -=
                        delta;

                    if (
                        enemy.attackTimer <= 0
                    ) {

                        enemy.attackTimer =
                            1400;

                        enemyAttack(
                            enemy
                        );

                    }

                }

            }

            enemy.x =
                clamp(
                    enemy.x,
                    50,
                    CONFIG.WORLD_WIDTH - 50
                );

            enemy.y =
                clamp(
                    enemy.y,
                    50,
                    CONFIG.WORLD_HEIGHT - 50
                );

            const float =
                Math.sin(
                    performance.now() *
                    0.002 +
                    enemy.floatOffset
                ) * 8;

            enemy.element.style.left =
                enemy.x + "px";

            enemy.element.style.top =
                enemy.y + float + "px";

            enemy.element.style.transform =
                PLAYER.x >
                enemy.x
                    ? "scaleX(1)"
                    : "scaleX(-1)";

        }
    );

}


function enemyAttack(enemy) {

    if (PLAYER.invincible)
        return;

    PLAYER.health =
        Math.max(
            0,
            PLAYER.health -
            enemy.damage
        );

    cameraShake(
        8,
        180
    );

    hurtPlayer();

    if (
        PLAYER.health <= 0
    ) {

        gameOver();

    }

}


/* =========================================================
   DAMAGE ENEMIES
========================================================= */

function damageEnemies() {

    ENEMIES.forEach(
        (enemy) => {

            if (!enemy.alive)
                return;

            const distance =
                distanceBetween(
                    PLAYER.x,
                    PLAYER.y,
                    enemy.x,
                    enemy.y
                );

            if (
                distance <=
                ATTACK.range + 55
            ) {

                enemy.health -=
                    ATTACK.damage;

                if (
                    enemy.health <= 0
                ) {

                    killEnemy(
                        enemy
                    );

                }

            }

        }
    );

}


function killEnemy(enemy) {

    if (!enemy.alive)
        return;

    enemy.alive = false;

    GAME.kills++;

    GAME.score += 300;

    enemy.element.style.transition =
        "opacity .5s ease, transform .5s ease";

    enemy.element.style.opacity =
        "0";

    enemy.element.style.transform =
        "scale(.3)";

    setTimeout(() => {

        enemy.element.style.display =
            "none";

    }, 500);

    showNotification(
        "+300 SCORE"
    );

    checkEnemiesDefeated();

}


function checkEnemiesDefeated() {

    const remaining =
        ENEMIES.filter(
            enemy =>
                enemy.alive
        ).length;

    if (
        remaining === 0
    ) {

        completeMission(
            mission2
        );

        showNotification(
            "ALL GUARDIANS DEFEATED!"
        );

        tryActivateBoss();

    }

}


/* =========================================================
   CRYSTALS
========================================================= */

const CRYSTALS = [];


function initCrystals() {

    const elements =
        $$(".crystal");

    elements.forEach(
        (element, index) => {

            const angle =
                index /
                elements.length *
                Math.PI * 2;

            const radius =
                1050;

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
                    0.55,
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

            CRYSTALS.push({

                element,

                x,

                y,

                collected: false

            });

            on(
                element,
                "click",
                () => collectCrystal(
                    CRYSTALS[index]
                )
            );

        }
    );

}


function collectCrystal(crystal) {

    if (!crystal ||
        crystal.collected) {

        return;

    }

    crystal.collected =
        true;

    GAME.crystals++;

    GAME.score += 150;

    crystal.element.classList.add(
        "collected"
    );

    playSound(
        crystalSound
    );

    showNotification(
        "ANCIENT CRYSTAL RESTORED!"
    );

    setTimeout(() => {

        crystal.element.style.display =
            "none";

    }, 500);

    if (
        GAME.crystals >=
        CONFIG.TOTAL_CRYSTALS
    ) {

        completeMission(
            mission1
        );

        showNotification(
            "ALL 6 CRYSTALS COLLECTED!"
        );

        tryActivateBoss();

    }

}


function updateCrystalProximity() {

    CRYSTALS.forEach(
        (crystal) => {

            if (
                crystal.collected
            )
                return;

            const distance =
                distanceBetween(
                    PLAYER.x,
                    PLAYER.y,
                    crystal.x,
                    crystal.y
                );

            if (
                distance <=
                CONFIG.CRYSTAL_PICKUP_RADIUS
            ) {

                collectCrystal(
                    crystal
                );

            }

            const nearby =
                distance <=
                CONFIG.CRYSTAL_HINT_RADIUS;

            crystal.element.classList.toggle(
                "inRange",
                nearby
            );

        }
    );

}


/* =========================================================
   BOSS
========================================================= */

const BOSS = {

    active: false,

    intro: false,

    defeated: false,

    x: 2500,

    y: 900,

    health:
        CONFIG.BOSS_START_HEALTH,

    maxHealth:
        CONFIG.BOSS_START_HEALTH,

    speed: 2.2,

    damage: 18,

    attackTimer: 1200,

    phase: 1

};


/* =========================================================
   BOSS ACTIVATION
========================================================= */

function tryActivateBoss() {

    if (BOSS.active ||
        BOSS.defeated) {

        return;

    }

    if (
        GAME.crystals <
        CONFIG.TOTAL_CRYSTALS
    ) {

        return;

    }

    if (
        ENEMIES.some(
            enemy =>
                enemy.alive
        )
    ) {

        return;

    }

    activateBoss();

}


function activateBoss() {

    BOSS.active = true;

    BOSS.intro = true;

    BOSS.x = 2500;

    BOSS.y = 850;

    BOSS.health =
        BOSS.maxHealth;

    if (boss) {

        boss.style.display =
            "flex";

        boss.style.left =
            BOSS.x + "px";

        boss.style.top =
            BOSS.y + "px";

        boss.style.opacity =
            "1";

    }

    if (bossHUD) {

        bossHUD.style.display =
            "block";

    }

    if (bossHealthFill) {

        bossHealthFill.style.width =
            "100%";

    }

    playSound(
        bossRoarSound
    );

    cameraShake(
        18,
        800
    );

    showNotification(
        "THE ANCIENT GUARDIAN AWAKENS!"
    );

    setTimeout(() => {

        BOSS.intro = false;

    }, 2200);

}


/* =========================================================
   BOSS AI
========================================================= */

function updateBoss(delta) {

    if (
        !BOSS.active ||
        BOSS.intro ||
        BOSS.defeated
    ) {

        return;

    }

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

    if (
        distance >
        CONFIG.BOSS_ATTACK_RANGE
    ) {

        BOSS.x +=
            dx /
            distance *
            BOSS.speed;

        BOSS.y +=
            dy /
            distance *
            BOSS.speed;

    } else {

        BOSS.attackTimer -=
            delta;

        if (
            BOSS.attackTimer <= 0
        ) {

            BOSS.attackTimer =
                BOSS.phase === 1
                    ? 1600
                    : BOSS.phase === 2
                        ? 1250
                        : 950;

            bossAttack();

        }

    }

    if (boss) {

        boss.style.left =
            BOSS.x + "px";

        boss.style.top =
            BOSS.y + "px";

        boss.style.transform =
            dx >= 0
                ? "scaleX(1)"
                : "scaleX(-1)";

    }

}


/* =========================================================
   BOSS ATTACK
========================================================= */

function bossAttack() {

    if (
        PLAYER.invincible
    ) {

        return;

    }

    PLAYER.health =
        Math.max(
            0,
            PLAYER.health -
            BOSS.damage
        );

    hurtPlayer();

    cameraShake(
        14,
        220
    );

    if (
        PLAYER.health <= 0
    ) {

        gameOver();

    }

}


/* =========================================================
   DAMAGE BOSS
========================================================= */

function damageBoss() {

    if (
        !BOSS.active ||
        BOSS.intro ||
        BOSS.defeated
    ) {

        return;

    }

    const distance =
        distanceBetween(
            PLAYER.x,
            PLAYER.y,
            BOSS.x,
            BOSS.y
        );

    if (
        distance >
        ATTACK.range + 70
    ) {

        return;

    }

    BOSS.health =
        Math.max(
            0,
            BOSS.health -
            ATTACK.damage
        );

    updateBossHUD();

    cameraShake(
        6,
        120
    );

    updateBossPhase();

    if (
        BOSS.health <= 0
    ) {

        defeatBoss();

    }

}


function updateBossPhase() {

    const percent =
        BOSS.health /
        BOSS.maxHealth;

    if (
        BOSS.phase === 1 &&
        percent <= 0.65
    ) {

        BOSS.phase = 2;

        BOSS.speed += 0.6;

        BOSS.damage += 5;

        showNotification(
            "THE GUARDIAN ENTERS PHASE 2!"
        );

        cameraShake(
            12,
            400
        );

    }

    if (
        BOSS.phase === 2 &&
        percent <= 0.30
    ) {

        BOSS.phase = 3;

        BOSS.speed += 0.7;

        BOSS.damage += 7;

        showNotification(
            "ANCIENT RAGE AWAKENED!"
        );

        cameraShake(
            18,
            500
        );

    }

}


function updateBossHUD() {

    if (bossHealthFill) {

        const percent =
            BOSS.health /
            BOSS.maxHealth *
            100;

        bossHealthFill.style.width =
            clamp(
                percent,
                0,
                100
            ) + "%";

    }

}


/* =========================================================
   BOSS DEFEATED
========================================================= */

function defeatBoss() {

    if (
        BOSS.defeated
    ) {

        return;

    }

    BOSS.defeated = true;

    BOSS.active = false;

    GAME.score += 5000;

    completeMission(
        mission3
    );

    updateHUD();

    showNotification(
        "THE ANCIENT GUARDIAN HAS FALLEN!"
    );

    playSound(
        victorySound
    );

    cameraShake(
        25,
        800
    );

    if (boss) {

        boss.style.transition =
            "opacity 1s ease, transform 1s ease";

        boss.style.opacity =
            "0";

        boss.style.transform =
            "scale(1.4) translateY(-80px)";

        setTimeout(() => {

            boss.style.display =
                "none";

        }, 1000);

    }

    if (bossHUD) {

        bossHUD.style.display =
            "none";

    }

    setTimeout(() => {

        activateDay7Portal();

    }, 1200);

}


/* =========================================================
   DAY 7 PORTAL
========================================================= */

const PORTAL = {

    active: false,

    entered: false,

    x: 2500,

    y: 850

};


const day7Portal =
    $("#day7Portal");


function activateDay7Portal() {

    PORTAL.active = true;

    PORTAL.entered = false;

    PORTAL.x = BOSS.x;

    PORTAL.y = BOSS.y;

    if (!day7Portal)
        return;

    day7Portal.style.display =
        "flex";

    day7Portal.style.position =
        "absolute";

    day7Portal.style.left =
        PORTAL.x + "px";

    day7Portal.style.top =
        PORTAL.y + "px";

    day7Portal.style.opacity =
        "0";

    day7Portal.style.transform =
        "translate(-50%,-50%) scale(.2)";

    day7Portal.style.transition =
        "opacity .8s ease, transform .8s ease";

    requestAnimationFrame(() => {

        day7Portal.style.opacity =
            "1";

        day7Portal.style.transform =
            "translate(-50%,-50%) scale(1)";

    });

    playSound(
        portalSound
    );

    showNotification(
        "THE PATH TO DAY 7 HAS OPENED!"
    );

    setTimeout(() => {

        winGame();

    }, 1600);

}


/* =========================================================
   PORTAL INTERACTION
========================================================= */

on(
    day7Portal,
    "click",
    (event) => {

        event.preventDefault();

        if (
            GAME.victory
        ) {

            goToDay7();

        }

    }
);


function updatePortal() {

    if (
        !PORTAL.active ||
        PORTAL.entered
    ) {

        return;

    }

    const distance =
        distanceBetween(
            PLAYER.x,
            PLAYER.y,
            PORTAL.x,
            PORTAL.y
        );

    if (
        distance <= 220
    ) {

        if (interactionPrompt) {

            interactionPrompt.style.display =
                "flex";

            interactionPrompt.textContent =
                "PRESS F TO ENTER DAY 7";

        }

    } else {

        if (interactionPrompt) {

            interactionPrompt.style.display =
                "none";

        }

    }

}


/* =========================================================
   INTERACTION
========================================================= */

function interact() {

    if (
        !GAME.running ||
        GAME.paused
    ) {

        return;

    }

    if (
        PORTAL.active &&
        !PORTAL.entered
    ) {

        const distance =
            distanceBetween(
                PLAYER.x,
                PLAYER.y,
                PORTAL.x,
                PORTAL.y
            );

        if (
            distance <= 220
        ) {

            goToDay7();

            return;

        }

    }

    const crystal =
        CRYSTALS.find(
            item =>
                !item.collected &&
                distanceBetween(
                    PLAYER.x,
                    PLAYER.y,
                    item.x,
                    item.y
                ) <=
                CONFIG.CRYSTAL_HINT_RADIUS
        );

    if (crystal) {

        collectCrystal(
            crystal
        );

    }

}


/* =========================================================
   DAY 7 REDIRECT
========================================================= */

function goToDay7() {

    if (
        PORTAL.entered
    ) {

        return;

    }

    PORTAL.entered = true;

    GAME.running = false;

    GAME.paused = false;

    localStorage.setItem(
        "day6Complete",
        "true"
    );

    localStorage.setItem(
        "day6Score",
        String(GAME.score)
    );

    if (bgMusic) {

        bgMusic.pause();

    }

    const transition =
        document.createElement(
            "div"
        );

    transition.id =
        "day7Transition";

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

    requestAnimationFrame(() => {

        transition.style.opacity =
            "1";

    });

    setTimeout(() => {

        window.location.href =
            CONFIG.NEXT_LEVEL_URL;

    }, 1100);

}


/* =========================================================
   SPIRIT SKILL
========================================================= */

const SKILL = {

    cooldown: 0,

    cooldownDuration: 8000,

    cost: 30,

    range: 300,

    damage: CONFIG.SKILL_DAMAGE

};


function spiritSkill() {

    if (
        !GAME.running ||
        GAME.paused
    ) {

        return;

    }

    if (
        SKILL.cooldown > 0
    ) {

        return;

    }

    if (
        PLAYER.spirit <
        SKILL.cost
    ) {

        showNotification(
            "NOT ENOUGH SPIRIT"
        );

        return;

    }

    PLAYER.spirit -=
        SKILL.cost;

    SKILL.cooldown =
        SKILL.cooldownDuration;

    ENEMIES.forEach(
        enemy => {

            if (!enemy.alive)
                return;

            const distance =
                distanceBetween(
                    PLAYER.x,
                    PLAYER.y,
                    enemy.x,
                    enemy.y
                );

            if (
                distance <=
                SKILL.range
            ) {

                enemy.health -=
                    SKILL.damage;

                if (
                    enemy.health <= 0
                ) {

                    killEnemy(
                        enemy
                    );

                }

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

        if (
            distance <=
            SKILL.range
        ) {

            BOSS.health =
                Math.max(
                    0,
                    BOSS.health -
                    SKILL.damage
                );

            updateBossHUD();

            updateBossPhase();

            if (
                BOSS.health <= 0
            ) {

                defeatBoss();

            }

        }

    }

    cameraShake(
        10,
        250
    );

    showNotification(
        "SPIRIT BURST!"
    );

}


/* =========================================================
   SKILL UPDATE
========================================================= */

function updateSkill(delta) {

    if (
        SKILL.cooldown > 0
    ) {

        SKILL.cooldown -=
            delta;

    }

}


/* =========================================================
   REGENERATION
========================================================= */

function regenerate(delta) {

    if (
        PLAYER.spirit <
        PLAYER.maxSpirit
    ) {

        PLAYER.spirit =
            clamp(
                PLAYER.spirit +
                0.012 *
                delta,
                0,
                PLAYER.maxSpirit
            );

    }

    if (
        PLAYER.stamina <
        PLAYER.maxStamina
    ) {

        PLAYER.stamina =
            clamp(
                PLAYER.stamina +
                0.035 *
                delta,
                0,
                PLAYER.maxStamina
            );

    }

}


/* =========================================================
   PLAYER HURT
========================================================= */

function hurtPlayer() {

    if (!player)
        return;

    player.classList.add(
        "hurt"
    );

    setTimeout(() => {

        player.classList.remove(
            "hurt"
        );

    }, 250);

}


/* =========================================================
   MISSION
========================================================= */

function completeMission(
    mission
) {

    if (!mission)
        return;

    mission.style.textDecoration =
        "line-through";

    mission.style.opacity =
        "0.55";

}


/* =========================================================
   VICTORY
========================================================= */

function winGame() {

    if (
        GAME.victory
    ) {

        return;

    }

    GAME.victory = true;

    GAME.running = false;

    GAME.paused = false;

    localStorage.setItem(
        "day6Complete",
        "true"
    );

    localStorage.setItem(
        "day6Score",
        String(GAME.score)
    );

    if (victoryScreen) {

        victoryScreen.style.display =
            "flex";

        victoryScreen.style.opacity =
            "0";

        requestAnimationFrame(() => {

            victoryScreen.style.transition =
                "opacity .7s ease";

            victoryScreen.style.opacity =
                "1";

        });

    }

    if (continueButton) {

        continueButton.disabled =
            false;

        continueButton.style.pointerEvents =
            "auto";

    }

}


on(
    continueButton,
    "click",
    () => {

        goToDay7();

    }
);


/* =========================================================
   GAME OVER
========================================================= */

function gameOver() {

    if (
        GAME.gameOver
    ) {

        return;

    }

    GAME.gameOver = true;

    GAME.running = false;

    playSound(
        gameOverSound
    );

    if (gameOverScreen) {

        gameOverScreen.style.display =
            "flex";

    }

}


on(
    retryButton,
    "click",
    () => {

        window.location.reload();

    }
);


/* =========================================================
   NOTIFICATIONS
========================================================= */

function showNotification(
    message
) {

    if (!notificationContainer)
        return;

    const notification =
        document.createElement(
            "div"
        );

    notification.className =
        "notification";

    notification.textContent =
        message;

    notificationContainer.appendChild(
        notification
    );

    setTimeout(() => {

        notification.remove();

    }, 2200);

}


/* =========================================================
   LIGHTNING
========================================================= */

function scheduleLightning() {

    if (!lightningLayer)
        return;

    const delay =
        random(
            7000,
            15000
        );

    setTimeout(() => {

        if (!GAME.gameOver) {

            lightningLayer.style.opacity =
                "0.9";

            setTimeout(() => {

                lightningLayer.style.opacity =
                    "0";

            }, 140);

        }

        scheduleLightning();

    }, delay);

}


/* =========================================================
   AMBIENT BAT INITIALIZATION
========================================================= */

function initBats() {

    const batLayer =
        $("#batLayer");

    if (!batLayer)
        return;

    const bats =
        $$(".bat");

    if (
        bats.length > 0
    ) {

        return;

    }

    const count =
        GAME.mobile
            ? 5
            : 10;

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
                9,
                18
            ) + "s";

        bat.style.animationDelay =
            random(
                0,
                10
            ) + "s";

        batLayer.appendChild(
            bat
        );

    }

}


/* =========================================================
   GAME LOOP
========================================================= */

const ENGINE = {

    lastTime: 0,

    fpsFrames: 0,

    fpsTimer: 0

};


function gameLoop(time) {

    if (!ENGINE.lastTime) {

        ENGINE.lastTime =
            time;

    }

    const delta =
        Math.min(
            50,
            time -
            ENGINE.lastTime
        );

    ENGINE.lastTime =
        time;

    if (
        GAME.running &&
        !GAME.paused
    ) {

        updateMovement();

        updateDash(
            delta
        );

        updateSkill(
            delta
        );

        regenerate(
            delta
        );

        updateEnemies(
            delta
        );

        updateBoss(
            delta
        );

        updateCrystalProximity();

        updatePortal();

        updateCamera();

        renderPlayer();

    }

    updateHUD();

    ENGINE.fpsFrames++;

    ENGINE.fpsTimer +=
        delta;

    if (
        ENGINE.fpsTimer >=
        1000
    ) {

        ENGINE.fpsFrames = 0;

        ENGINE.fpsTimer = 0;

    }

    requestAnimationFrame(
        gameLoop
    );

}


/* =========================================================
   INITIALIZE
========================================================= */

function initializeGame() {

    detectDevice();

    initEnemies();

    initCrystals();

    initBats();

    scheduleLightning();

    if (boss) {

        boss.style.display =
            "none";

    }

    if (bossHUD) {

        bossHUD.style.display =
            "none";

    }

    if (day7Portal) {

        day7Portal.style.display =
            "none";

    }

    if (pauseMenu) {

        pauseMenu.style.display =
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

    if (interactionPrompt) {

        interactionPrompt.style.display =
            "none";

    }

    CAMERA.width =
        window.innerWidth;

    CAMERA.height =
        window.innerHeight;

    ENGINE.lastTime =
        performance.now();

    requestAnimationFrame(
        gameLoop
    );

    startLoading();

}


window.addEventListener(
    "load",
    initializeGame
);
