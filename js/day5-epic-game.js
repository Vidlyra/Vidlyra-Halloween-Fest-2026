"use strict";

/*=========================================================
VIDLYRA HALLOWEEN FEST 2026
DAY 5 - THE HAUNTED CEMETERY
FULL FIXED BUILD

DAY 5
  ↓
DEFEAT GHOST KING
  ↓
VICTORY SCREEN
  ↓
CONTINUE
  ↓
day6-video.html
=========================================================*/


/*=========================================================
DOM HELPERS
=========================================================*/

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function on(el, evt, fn, opts) {
    if (el) {
        el.addEventListener(evt, fn, opts);
    }
}

function safePlay(audioEl) {
    if (!audioEl) return;

    try {
        audioEl.currentTime = 0;

        const promise = audioEl.play();

        if (promise && promise.catch) {
            promise.catch(() => {});
        }
    } catch (e) {}
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

    CAMERA_SMOOTH: 0.1,

    LANTERN_HINT_RADIUS: 220,
    LANTERN_PICKUP_RADIUS: 130,

    PORTAL_HINT_RADIUS: 220,
    PORTAL_ENTER_RADIUS: 90,

    /*
     * IMPORTANT:
     * Day 5 finishes by opening Day 6 video.
     */
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
    kills: 0
};


/*=========================================================
PLAYER
=========================================================*/

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


/*=========================================================
INPUT
=========================================================*/

const INPUT = {
    left: false,
    right: false,
    up: false,
    down: false
};


/*=========================================================
JOYSTICK
=========================================================*/

const JOYSTICK = {
    active: false,

    startX: 0,
    startY: 0,

    dx: 0,
    dy: 0,

    radius: 55
};


/*=========================================================
AUDIO / SETTINGS
=========================================================*/

const AUDIOSETTINGS = {
    effects: 0.9,
    screenShake: true
};


/*=========================================================
DAY 6 PORTAL STATE
=========================================================*/

const PORTAL = {
    active: false,
    entered: false,

    x: 0,
    y: 0
};


/*=========================================================
HELPERS
=========================================================*/

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function random(min, max) {
    return Math.random() * (max - min) + min;
}


/*=========================================================
DEVICE DETECTION
=========================================================*/

function detectDevice() {

    const touchCapable =
        ("ontouchstart" in window) ||
        (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);

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
LOADING
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
            loadingFill.style.width =
                progress + "%";
        }

        if (loadingPercent) {
            loadingPercent.textContent =
                Math.floor(progress) + "%";
        }

        if (loadingMessage) {

            const index = Math.min(
                loadingMessages.length - 1,
                Math.floor(
                    (progress / 100) *
                    loadingMessages.length
                )
            );

            loadingMessage.textContent =
                loadingMessages[index];
        }

        if (progress >= 100) {

            clearInterval(interval);

            setTimeout(
                finishLoading,
                400
            );
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


/*=========================================================
MOBILE JOYSTICK
=========================================================*/

function joystickPointFromEvent(event) {

    const touch =
        event.touches ?
        event.touches[0] :
        event;

    return {
        x: touch.clientX,
        y: touch.clientY
    };
}


on(
    joystickBase,
    "touchstart",
    (event) => {

        event.preventDefault();

        const point =
            joystickPointFromEvent(event);

        JOYSTICK.active = true;

        JOYSTICK.startX = point.x;
        JOYSTICK.startY = point.y;

    },
    { passive: false }
);


on(
    joystickBase,
    "touchmove",
    (event) => {

        event.preventDefault();

        if (!JOYSTICK.active) return;

        const point =
            joystickPointFromEvent(event);

        let dx =
            point.x -
            JOYSTICK.startX;

        let dy =
            point.y -
            JOYSTICK.startY;

        const distance =
            Math.hypot(dx, dy);

        if (distance > JOYSTICK.radius) {

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
                `translate(-50%,-50%) translate(${dx}px, ${dy}px)`;
        }

    },
    { passive: false }
);


function resetJoystick() {

    JOYSTICK.active = false;

    JOYSTICK.dx = 0;
    JOYSTICK.dy = 0;

    if (joystickStick) {

        joystickStick.style.transform =
            "translate(-50%,-50%)";
    }
}


on(
    joystickBase,
    "touchend",
    resetJoystick
);

on(
    joystickBase,
    "touchcancel",
    resetJoystick
);


on(
    attackButton,
    "touchstart",
    (event) => {

        event.preventDefault();

        startAttack();

    }
);


on(
    dashButton,
    "touchstart",
    (event) => {

        event.preventDefault();

        startDash();

    }
);


on(
    skillButton,
    "touchstart",
    (event) => {

        event.preventDefault();

        castSpiritSkill();

    }
);


on(
    interactButton,
    "touchstart",
    (event) => {

        event.preventDefault();

        tryInteract();

    }
);


on(
    pauseButton,
    "touchstart",
    (event) => {

        event.preventDefault();

        togglePause();

    }
);


/*=========================================================
PAUSE
=========================================================*/

function togglePause() {

    if (
        GAME.gameOver ||
        GAME.victory
    ) {
        return;
    }

    GAME.paused =
        !GAME.paused;

    if (pauseMenu) {

        pauseMenu.style.display =
            GAME.paused ?
            "flex" :
            "none";
    }
}


on(
    resumeButton,
    "click",
    () => {

        GAME.paused = false;

        if (pauseMenu) {
            pauseMenu.style.display =
                "none";
        }
    }
);


on(
    restartButton,
    "click",
    () => {

        window.location.reload();

    }
);


on(
    openSettingsButton,
    "click",
    () => {

        if (settingsPanel) {
            settingsPanel.style.display =
                "flex";
        }
    }
);


on(
    closeSettingsButton,
    "click",
    () => {

        if (settingsPanel) {
            settingsPanel.style.display =
                "none";
        }
    }
);


on(
    exitGameButton,
    "click",
    () => {

        window.location.reload();

    }
);


on(
    musicSlider,
    "input",
    (event) => {

        if (bgMusic) {

            bgMusic.volume =
                event.target.value / 100;
        }
    }
);


on(
    effectsSlider,
    "input",
    (event) => {

        AUDIOSETTINGS.effects =
            event.target.value / 100;
    }
);


on(
    screenShakeToggle,
    "change",
    (event) => {

        AUDIOSETTINGS.screenShake =
            event.target.checked;
    }
);


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


window.addEventListener(
    "resize",
    () => {

        CAMERA.width =
            window.innerWidth;

        CAMERA.height =
            window.innerHeight;

    }
);


function updateCamera() {

    CAMERA.targetX =
        PLAYER.x -
        CAMERA.width / 2;

    CAMERA.targetY =
        PLAYER.y -
        CAMERA.height / 2;


    CAMERA.x +=
        (CAMERA.targetX - CAMERA.x) *
        CAMERA.smooth;

    CAMERA.y +=
        (CAMERA.targetY - CAMERA.y) *
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
            `translate(${-CAMERA.x}px, ${-CAMERA.y}px)`;
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
                `translate(${-CAMERA.x}px, ${-CAMERA.y}px)`;

            return;
        }


        const offsetX =
            (Math.random() - 0.5) *
            power;

        const offsetY =
            (Math.random() - 0.5) *
            power;


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


    if (INPUT.left) {
        PLAYER.velocityX--;
    }

    if (INPUT.right) {
        PLAYER.velocityX++;
    }

    if (INPUT.up) {
        PLAYER.velocityY--;
    }

    if (INPUT.down) {
        PLAYER.velocityY++;
    }


    if (JOYSTICK.active) {

        PLAYER.velocityX +=
            JOYSTICK.dx /
            JOYSTICK.radius;

        PLAYER.velocityY +=
            JOYSTICK.dy /
            JOYSTICK.radius;
    }


    PLAYER.moving =
        PLAYER.velocityX !== 0 ||
        PLAYER.velocityY !== 0;


    if (!PLAYER.moving) {

        if (!PLAYER.attacking) {
            PLAYER.state = "idle";
        }

        return;
    }


    const length =
        Math.hypot(
            PLAYER.velocityX,
            PLAYER.velocityY
        );


    PLAYER.velocityX /=
        length;

    PLAYER.velocityY /=
        length;


    const speed =
        DASH.active ?
        DASH.speed :
        PLAYER.runSpeed;


    PLAYER.x +=
        PLAYER.velocityX *
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


    PLAYER.state =
        DASH.active ?
        "dash" :
        "walk";
}


function renderPlayer() {

    const container =
        document.getElementById(
            "playerContainer"
        );

    if (!container) return;


    container.style.left =
        PLAYER.x + "px";

    container.style.top =
        PLAYER.y + "px";


    container.style.transform =
        `translate(-50%,-100%) scaleX(${PLAYER.facing})`;
}


function updatePlayerHUD() {

    const hp =
        Math.round(PLAYER.health);

    const sp =
        Math.round(PLAYER.spirit);


    if (healthFill) {
        healthFill.style.width =
            hp + "%";
    }

    if (spiritFill) {
        spiritFill.style.width =
            sp + "%";
    }


    if (healthText) {
        healthText.textContent =
            hp +
            " / " +
            PLAYER.maxHealth;
    }


    if (spiritText) {
        spiritText.textContent =
            sp +
            " / " +
            PLAYER.maxSpirit;
    }
}


/*=========================================================
VISUAL EFFECTS
=========================================================*/

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

    if (
        !GAME.running ||
        GAME.paused
    ) {
        return;
    }


    if (
        DASH.active ||
        DASH.cooldownTimer > 0
    ) {
        return;
    }


    if (PLAYER.stamina < 20) {
        return;
    }


    DASH.active = true;

    DASH.timer =
        DASH.duration;

    DASH.cooldownTimer =
        DASH.cooldown;


    PLAYER.invincible = true;

    PLAYER.stamina -= 20;


    safePlay(heroDashSound);

    triggerDashTrail();


    if (player) {
        player.classList.add("dash");
    }
}


function updateDash(delta) {

    if (DASH.cooldownTimer > 0) {

        DASH.cooldownTimer -=
            delta;

        if (DASH.cooldownTimer < 0) {
            DASH.cooldownTimer = 0;
        }
    }


    if (!DASH.active) return;


    DASH.timer -= delta;


    if (DASH.timer <= 0) {

        DASH.active = false;

        PLAYER.invincible = false;


        if (player) {
            player.classList.remove("dash");
        }
    }
}


/*=========================================================
ATTACK
=========================================================*/

const ATTACK = {

    combo: 0,

    cooldown: false,

    duration: 250,

    damage: CONFIG.ATTACK_DAMAGE,

    range: 140
};


function startAttack() {

    if (
        !GAME.running ||
        GAME.paused
    ) {
        return;
    }


    if (ATTACK.cooldown) {
        return;
    }


    ATTACK.cooldown = true;

    PLAYER.attacking = true;

    PLAYER.state = "attack";


    ATTACK.combo =
        (ATTACK.combo % 3) + 1;


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

        y: PLAYER.y,

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


/*=========================================================
GHOSTS
=========================================================*/

const GHOSTS = [];


function initGhosts() {

    const elements =
        $$(".ghost");


    elements.forEach(
        (element, index) => {

            const angle =
                (index / elements.length) *
                Math.PI *
                2;


            const radius =
                700 +
                random(-150, 250);


            const spawnX =
                clamp(
                    2500 +
                    Math.cos(angle) *
                    radius,

                    200,

                    CONFIG.WORLD_WIDTH -
                    200
                );


            const spawnY =
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
                spawnX + "px";

            element.style.top =
                spawnY + "px";

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
                    random(1.4, 2.2),

                x: spawnX,

                y: spawnY,

                state: "wander",

                velocityX: 0,

                velocityY: 0,

                attackTimer: 0,

                floatOffset:
                    random(0, 1000),

                lastHit: 0
            });
        }
    );


    if (aliveGhostsLabel) {

        aliveGhostsLabel.textContent =
            GHOSTS.length;
    }
}


const GHOST_AI = {

    detectRange: 420,

    attackRange: 90,

    attackCooldown: 1400
};


function updateGhostAI(delta) {

    GHOSTS.forEach(
        (ghost) => {

            if (!ghost.alive) {
                return;
            }


            const dx =
                PLAYER.x -
                ghost.x;

            const dy =
                PLAYER.y -
                ghost.y;


            const distance =
                Math.hypot(dx, dy);


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


                if (distance > 0) {

                    ghost.velocityX =
                        (dx / distance) *
                        ghost.speed;

                    ghost.velocityY =
                        (dy / distance) *
                        ghost.speed;
                }

            } else {

                ghost.state =
                    "wander";


                if (Math.random() < 0.01) {

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
                (ghost.y + floatY) +
                "px";


            ghost.element.style.transform =
                PLAYER.x > ghost.x ?
                "scaleX(1)" :
                "scaleX(-1)";


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

            if (!ghost.alive) {
                return;
            }


            const enemyBox = {

                x: ghost.x - 45,

                y: ghost.y - 60,

                width: 90,

                height: 120
            };


            if (
                !rectCollision(
                    sword,
                    enemyBox
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

                killGhost(ghost);
            }
        }
    );
}


function updateGhostHealthBar(ghost) {

    const fill =
        ghost.element.querySelector(
            ".enemyHealthFill"
        );


    if (fill) {

        fill.style.width =
            Math.max(
                0,
                (ghost.health /
                ghost.maxHealth) *
                100
            ) + "%";
    }
}


function killGhost(ghost) {

    if (!ghost.alive) {
        return;
    }


    ghost.alive = false;

    GAME.kills++;

    GAME.score += 250;


    if (scoreCounter) {

        scoreCounter.textContent =
            GAME.score
                .toString()
                .padStart(6, "0");
    }


    if (aliveGhostsLabel) {

        aliveGhostsLabel.textContent =
            GHOSTS.filter(
                g => g.alive
            ).length;
    }


    ghost.element.style.transition =
        "opacity .5s, transform .5s";

    ghost.element.style.opacity =
        "0";


    setTimeout(() => {

        ghost.element.style.display =
            "none";

    }, 500);


    showNotification(
        "+250 SCORE"
    );


    checkGhostsCleared();
}


function ghostAttacksPlayer(ghost) {

    if (PLAYER.invincible) {
        return;
    }


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


    if (PLAYER.health <= 0) {

        playerDie();
    }
}


function checkGhostsCleared() {

    if (
        GHOSTS.every(
            ghost => !ghost.alive
        )
    ) {

        if (mission2) {

            mission2.style.textDecoration =
                "line-through";
        }


        showNotification(
            "All ghosts defeated!"
        );


        maybeSpawnBoss();
    }
}


/*=========================================================
LANTERNS
=========================================================*/

const LANTERNS = [];


function initLanterns() {

    const elements =
        $$(".lantern");


    elements.forEach(
        (element, index) => {

            const angle =
                (index / elements.length) *
                Math.PI *
                2;


            const radius = 1100;


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


            element.style.left =
                x + "px";

            element.style.top =
                y + "px";


            const data = {

                element: element,

                x: x,

                y: y,

                lit: false,

                inRange: false
            };


            LANTERNS.push(data);


            on(
                element,
                "click",
                () => {
                    lightLantern(data);
                }
            );


            on(
                element,
                "touchstart",
                (event) => {

                    event.preventDefault();

                    lightLantern(data);

                },
                { passive: false }
            );
        }
    );
}


function spawnLanternSparkles(data) {

    const layer =
        $("#lanternLayer");


    if (!layer) {
        return;
    }


    const count = 10;


    for (
        let i = 0;
        i < count;
        i++
    ) {

        const spark =
            document.createElement(
                "div"
            );


        spark.className =
            "lanternSparkle";


        const angle =
            random(
                0,
                Math.PI * 2
            );


        const distance =
            random(
                30,
                70
            );


        spark.style.setProperty(
            "--sx",
            Math.cos(angle) *
            distance +
            "px"
        );


        spark.style.setProperty(
            "--sy",
            Math.sin(angle) *
            distance -
            40 +
            "px"
        );


        spark.style.left =
            data.x +
            35 +
            "px";


        spark.style.top =
            data.y +
            20 +
            "px";


        layer.appendChild(
            spark
        );


        setTimeout(() => {

            spark.remove();

        }, 650);
    }
}


function lightLantern(data) {

    if (data.lit) {
        return;
    }


    data.lit = true;
    data.inRange = false;


    data.element.classList.remove(
        "inRange"
    );


    data.element.classList.add(
        "collected"
    );


    spawnLanternSparkles(
        data
    );


    GAME.lanterns++;


    if (lanternCounter) {

        lanternCounter.textContent =
            `${GAME.lanterns} / ${CONFIG.TOTAL_LANTERNS}`;
    }


    if (activeLanternsLabel) {

        activeLanternsLabel.textContent =
            GAME.lanterns;
    }


    safePlay(
        lanternSound
    );


    showNotification(
        "Spirit Lantern Restored!"
    );


    GAME.score += 100;


    if (scoreCounter) {

        scoreCounter.textContent =
            GAME.score
                .toString()
                .padStart(6, "0");
    }


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
            "All Lanterns Restored!"
        );


        maybeSpawnBoss();
    }
}


function updateLanternProximity() {

    LANTERNS.forEach(
        (data) => {

            if (data.lit) {
                return;
            }


            const distance =
                Math.hypot(
                    PLAYER.x -
                    data.x,

                    PLAYER.y -
                    data.y
                );


            const inRange =
                distance <=
                CONFIG.LANTERN_HINT_RADIUS;


            if (
                inRange !==
                data.inRange
            ) {

                data.inRange =
                    inRange;


                data.element.classList.toggle(
                    "inRange",
                    inRange
                );
            }


            if (
                distance <=
                CONFIG.LANTERN_PICKUP_RADIUS
            ) {

                lightLantern(data);
            }
        }
    );


    if (interactionPrompt) {

        const nearAny =
            LANTERNS.some(
                l =>
                    !l.lit &&
                    l.inRange
            );


        if (nearAny) {

            interactionPrompt.style.display =
                "flex";

            interactionPrompt.textContent =
                "PRESS F TO LIGHT LANTERN";

        } else if (
            !PORTAL.active ||
            !day6Portal ||
            !day6Portal.classList.contains(
                "inRange"
            )
        ) {

            interactionPrompt.style.display =
                "none";
        }
    }
}


/*=========================================================
INTERACTION
=========================================================*/

function tryInteract() {

    if (
        !GAME.running ||
        GAME.paused
    ) {
        return;
    }


    const nearLantern =
        LANTERNS.find(
            lantern =>
                !lantern.lit &&
                Math.hypot(
                    PLAYER.x -
                    lantern.x,

                    PLAYER.y -
                    lantern.y
                ) <
                CONFIG.LANTERN_HINT_RADIUS
        );


    if (nearLantern) {

        lightLantern(
            nearLantern
        );

        return;
    }


    if (
        PORTAL.active &&
        !PORTAL.entered
    ) {

        const distance =
            Math.hypot(
                PLAYER.x -
                PORTAL.x,

                PLAYER.y -
                PORTAL.y
            );


        if (
            distance <=
            CONFIG.PORTAL_HINT_RADIUS
        ) {

            goToDay6();
        }
    }
}


/*=========================================================
GHOST KING BOSS
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

    if (BOSS.active) {
        return;
    }


    if (
        GAME.lanterns <
        CONFIG.TOTAL_LANTERNS
    ) {
        return;
    }


    if (
        GHOSTS.some(
            ghost => ghost.alive
        )
    ) {
        return;
    }


    activateGhostKing();
}


function activateGhostKing() {

    BOSS.active = true;
    BOSS.intro = true;


    if (bossEl) {

        bossEl.style.display =
            "flex";

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


    cameraShake(
        20,
        900
    );


    safePlay(
        bossRoarSound
    );


    setTimeout(() => {

        BOSS.intro = false;

    }, 2800);
}


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
        Math.hypot(dx, dy);


    if (
        distance > 180
    ) {

        if (distance > 0) {

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
        }

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
            dx > 0 ?
            "scaleX(1)" :
            "scaleX(-1)";
    }
}


function bossHitPlayer() {

    if (PLAYER.invincible) {
        return;
    }


    PLAYER.health =
        Math.max(
            0,
            PLAYER.health -
            BOSS.damage
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


    if (PLAYER.health <= 0) {

        playerDie();
    }
}


function damageBossIfInRange() {

    if (
        !BOSS.active ||
        BOSS.intro ||
        BOSS.defeated
    ) {
        return;
    }


    const distance =
        Math.hypot(
            PLAYER.x -
            BOSS.x,

            PLAYER.y -
            BOSS.y
        );


    if (
        distance >
        ATTACK.range + 60
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


        if (bossHealthFill) {

            bossHealthFill.style.background =
                "linear-gradient(90deg,#c40000,#ff6a00)";
        }


        showNotification(
            "The Ghost King grows stronger!"
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


        if (bossHealthFill) {

            bossHealthFill.style.background =
                "linear-gradient(90deg,#8b00ff,#ff2f6c)";
        }


        cameraShake(
            16,
            400
        );


        showNotification(
            "RAGE MODE!"
        );
    }


    if (
        BOSS.health <= 0
    ) {

        bossDefeated();
    }
}


/*=========================================================
BOSS DEFEATED
=========================================================*/

function bossDefeated() {

    if (BOSS.defeated) {
        return;
    }


    BOSS.defeated = true;

    BOSS.active = false;


    if (mission3) {

        mission3.style.textDecoration =
            "line-through";
    }


    GAME.score += 5000;


    if (scoreCounter) {

        scoreCounter.textContent =
            GAME.score
                .toString()
                .padStart(6, "0");
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


    /*
     * Open the Day 6 portal.
     */
    setTimeout(() => {

        activatePortal(
            BOSS.x,
            BOSS.y
        );

    }, 1000);


    /*
     * Show victory screen.
     */
    setTimeout(() => {

        winGame();

    }, 2200);
}


/*=========================================================
DAY 6 PORTAL
=========================================================*/

function activatePortal(x, y) {

    if (PORTAL.active) {
        return;
    }


    PORTAL.active = true;

    PORTAL.entered = false;

    PORTAL.x = x;

    PORTAL.y = y;


    if (!day6Portal) {

        /*
         * Even if the visual portal element
         * doesn't exist, the game can still
         * finish and continue to Day 6.
         */

        showNotification(
            "DAY 6 PORTAL READY!"
        );

        return;
    }


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
        "translate(-50%, -60%) scale(.2)";


    day6Portal.style.transition =
        "opacity .8s ease, transform .8s ease";


    requestAnimationFrame(() => {

        day6Portal.style.opacity =
            "1";

        day6Portal.style.transform =
            "translate(-50%, -60%) scale(1)";
    });


    safePlay(
        portalSound
    );


    showNotification(
        "PORTAL TO DAY 6 HAS OPENED!"
    );


    setTimeout(() => {

        showNotification(
            "Press CONTINUE to enter Day 6!"
        );

    }, 1200);
}


/*=========================================================
DAY 6 REDIRECT
=========================================================*/

function goToDay6() {

    /*
     * Prevent multiple redirects.
     */
    if (PORTAL.entered) {
        return;
    }


    PORTAL.entered = true;


    GAME.running = false;

    GAME.paused = false;


    /*
     * Save Day 5 completion.
     */
    try {

        localStorage.setItem(
            "day5Complete",
            "true"
        );


        localStorage.setItem(
            "day5Score",
            String(GAME.score)
        );

    } catch (error) {

        console.warn(
            "Could not save Day 5 progress.",
            error
        );
    }


    safePlay(
        portalSound
    );


    /*
     * Hide victory screen.
     */
    if (victoryScreen) {

        victoryScreen.style.display =
            "none";
    }


    /*
     * Hide portal.
     */
    if (day6Portal) {

        day6Portal.style.pointerEvents =
            "none";


        day6Portal.style.transition =
            "opacity .5s ease, transform .5s ease";


        day6Portal.style.opacity =
            "0";


        day6Portal.style.transform =
            "translate(-50%, -60%) scale(1.8)";
    }


    /*
     * Full-screen cinematic transition.
     */
    const transition =
        document.createElement(
            "div"
        );


    transition.id =
        "day6Transition";


    transition.style.position =
        "fixed";


    transition.style.inset =
        "0";


    transition.style.width =
        "100%";


    transition.style.height =
        "100%";


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


    /*
     * IMPORTANT:
     * This is the Day 6 video page.
     */
    setTimeout(() => {

        window.location.href =
            CONFIG.NEXT_LEVEL_URL;

    }, 1100);
}


/*=========================================================
PORTAL CLICK
=========================================================*/

on(
    day6Portal,
    "click",
    (event) => {

        event.preventDefault();


        if (GAME.victory) {

            goToDay6();

        } else {

            showNotification(
                "Defeat the Ghost King first!"
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
                "Defeat the Ghost King first!"
            );
        }

    },
    { passive: false }
);


/*=========================================================
PORTAL PROXIMITY
=========================================================*/

function updatePortalProximity() {

    if (
        !PORTAL.active ||
        PORTAL.entered
    ) {
        return;
    }


    const distance =
        Math.hypot(
            PLAYER.x -
            PORTAL.x,

            PLAYER.y -
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


    if (interactionPrompt) {

        if (
            inRange &&
            GAME.victory
        ) {

            interactionPrompt.style.display =
                "flex";

            interactionPrompt.textContent =
                "PRESS F TO ENTER PORTAL";

        } else if (
            !LANTERNS.some(
                lantern =>
                    !lantern.lit &&
                    lantern.inRange
            )
        ) {

            interactionPrompt.style.display =
                "none";
        }
    }
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

    if (SKILL.timer > 0) {

        SKILL.timer -= delta;

        if (SKILL.timer < 0) {
            SKILL.timer = 0;
        }
    }
}


function castSpiritSkill() {

    if (
        !GAME.running ||
        GAME.paused
    ) {
        return;
    }


    if (SKILL.timer > 0) {
        return;
    }


    if (
        PLAYER.spirit <
        SKILL.spiritCost
    ) {

        showNotification(
            "Not enough Spirit"
        );

        return;
    }


    PLAYER.spirit -=
        SKILL.spiritCost;


    SKILL.timer =
        SKILL.cooldown;


    /*
     * Damage nearby ghosts.
     */
    GHOSTS.forEach(
        (ghost) => {

            if (!ghost.alive) {
                return;
            }


            const distance =
                Math.hypot(
                    ghost.x -
                    PLAYER.x,

                    ghost.y -
                    PLAYER.y
                );


            if (distance > 260) {
                return;
            }


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


    /*
     * Damage boss if nearby.
     */
    if (
        BOSS.active &&
        !BOSS.intro &&
        !BOSS.defeated
    ) {

        const bossDistance =
            Math.hypot(
                BOSS.x -
                PLAYER.x,

                BOSS.y -
                PLAYER.y
            );


        if (bossDistance < 260) {

            BOSS.health =
                Math.max(
                    0,
                    BOSS.health -
                    SKILL.damage
                );


            if (bossHealthFill) {

                bossHealthFill.style.width =
                    (
                        BOSS.health /
                        BOSS.maxHealth *
                        100
                    ) + "%";
            }


            if (
                BOSS.health <= 0
            ) {

                bossDefeated();
            }
        }
    }


    cameraShake(
        10,
        200
    );


    showNotification(
        "Spirit Burst!"
    );
}


/*=========================================================
REGENERATION
=========================================================*/

function regenerate(delta) {

    if (
        PLAYER.health <
        PLAYER.maxHealth
    ) {

        PLAYER.health =
            clamp(
                PLAYER.health +
                0.002 * delta,

                0,

                PLAYER.maxHealth
            );
    }


    if (
        PLAYER.spirit <
        PLAYER.maxSpirit
    ) {

        PLAYER.spirit =
            clamp(
                PLAYER.spirit +
                0.01 * delta,

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
                0.03 * delta,

                0,

                PLAYER.maxStamina
            );
    }
}


/*=========================================================
MINIMAP
=========================================================*/

function worldToMiniMap(x, y) {

    const frameSize = 200;


    return {

        left:
            (x /
            CONFIG.WORLD_WIDTH) *
            frameSize,

        top:
            (y /
            CONFIG.WORLD_HEIGHT) *
            frameSize
    };
}


function updateMiniMap() {

    if (!miniMapFrame) {
        return;
    }


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


            if (!dot) {
                return;
            }


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
                lantern.lit ?
                "0" :
                (
                    lantern.inRange ?
                    "1" :
                    "0.75"
                );


            dot.style.transform =
                (
                    lantern.inRange &&
                    !lantern.lit
                ) ?
                "scale(1.6)" :
                "scale(1)";
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

    let closest = null;

    let closestDistance =
        Infinity;


    LANTERNS.forEach(
        (lantern) => {

            if (lantern.lit) {
                return;
            }


            const distance =
                Math.hypot(
                    PLAYER.x -
                    lantern.x,

                    PLAYER.y -
                    lantern.y
                );


            if (
                distance <
                closestDistance
            ) {

                closestDistance =
                    distance;

                closest =
                    lantern;
            }
        }
    );


    return closest;
}


function updateCompass() {

    if (!compassNeedle) {
        return;
    }


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


    const angleDegrees =
        (
            Math.atan2(
                dy,
                dx
            ) *
            180 /
            Math.PI
        ) + 90;


    compassNeedle.style.transform =
        `rotate(${angleDegrees}deg)`;
}


/*=========================================================
NOTIFICATIONS
=========================================================*/

function showNotification(text) {

    if (!notificationContainer) {
        return;
    }


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


/*=========================================================
PLAYER DEATH
=========================================================*/

function playerDie() {

    if (GAME.gameOver) {
        return;
    }


    GAME.gameOver = true;

    GAME.running = false;


    safePlay(
        gameOverSound
    );


    if (gameOverScreen) {

        gameOverScreen.style.display =
            "flex";
    }
}


/*=========================================================
VICTORY
=========================================================*/

function winGame() {

    if (GAME.victory) {
        return;
    }


    GAME.victory = true;

    GAME.running = false;

    GAME.paused = false;


    /*
     * Save Day 5 completion.
     */
    try {

        localStorage.setItem(
            "day5Complete",
            "true"
        );


        localStorage.setItem(
            "day5Score",
            String(GAME.score)
        );

    } catch (error) {

        console.warn(
            "Could not save completion.",
            error
        );
    }


    safePlay(
        victorySound
    );


    /*
     * Show victory screen.
     */
    if (victoryScreen) {

        victoryScreen.style.display =
            "flex";


        victoryScreen.style.opacity =
            "0";


        victoryScreen.style.transition =
            "opacity .6s ease";


        requestAnimationFrame(() => {

            victoryScreen.style.opacity =
                "1";
        });
    }


    /*
     * Enable CONTINUE.
     */
    if (continueButton) {

        continueButton.style.display =
            "flex";

        continueButton.style.pointerEvents =
            "auto";

        continueButton.disabled =
            false;
    }
}


/*=========================================================
CONTINUE → DAY 6 VIDEO
=========================================================*/

on(
    continueButton,
    "click",
    (event) => {

        event.preventDefault();

        goToDay6();
    }
);


/*
 * Mobile support for CONTINUE.
 */
on(
    continueButton,
    "touchstart",
    (event) => {

        event.preventDefault();

        goToDay6();

    },
    { passive: false }
);


/*=========================================================
RETRY / QUIT
=========================================================*/

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


/*=========================================================
GAME ENGINE
=========================================================*/

const ENGINE = {

    lastTime: 0,

    frame: 0,

    fpsTimer: 0,

    fps: 0
};


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

        regenerate(delta);

        updateGhostAI(delta);

        updateBoss(delta);

        updateLanternProximity();

        updatePortalProximity();

        updateCamera();

        renderPlayer();

        updateMiniMap();

        updateCompass();
    }


    updatePlayerHUD();


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


    requestAnimationFrame(
        gameLoop
    );
}


/*=========================================================
AMBIENT BATS
=========================================================*/

function spawnAmbientBats() {

    const layer =
        $("#batLayer");


    if (!layer) {
        return;
    }


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


/*=========================================================
LIGHTNING
=========================================================*/

function scheduleLightning() {

    if (!lightningLayer) {
        return;
    }


    const delay =
        random(
            6000,
            14000
        );


    setTimeout(() => {

        if (!GAME.gameOver) {

            lightningLayer.style.transition =
                "opacity .1s";

            lightningLayer.style.opacity =
                "0.9";


            safePlay(
                lightningSound
            );


            setTimeout(() => {

                if (lightningLayer) {

                    lightningLayer.style.opacity =
                        "0";
                }

            }, 150);
        }


        scheduleLightning();

    }, delay);
}


/*=========================================================
INITIALIZE GAME
=========================================================*/

function initializeGame() {

    /*
     * Device.
     */
    detectDevice();


    /*
     * Initialize enemies.
     */
    initGhosts();


    /*
     * Initialize lanterns.
     */
    initLanterns();


    /*
     * Ambient effects.
     */
    spawnAmbientBats();

    scheduleLightning();


    /*
     * Inventory close.
     */
    on(
        closeInventory,
        "click",
        () => {

            if (inventoryPanel) {

                inventoryPanel.classList.remove(
                    "active"
                );
            }
        }
    );


    /*
     * Initial counters.
     */
    if (lanternCounter) {

        lanternCounter.textContent =
            `0 / ${CONFIG.TOTAL_LANTERNS}`;
    }


    if (scoreCounter) {

        scoreCounter.textContent =
            "000000";
    }


    if (aliveGhostsLabel) {

        aliveGhostsLabel.textContent =
            GHOSTS.length;
    }


    if (activeLanternsLabel) {

        activeLanternsLabel.textContent =
            "0";
    }


    /*
     * Hide interaction prompt.
     */
    if (interactionPrompt) {

        interactionPrompt.style.display =
            "none";
    }


    /*
     * Hide victory screen at start.
     */
    if (victoryScreen) {

        victoryScreen.style.display =
            "none";
    }


    /*
     * Hide game-over screen at start.
     */
    if (gameOverScreen) {

        gameOverScreen.style.display =
            "none";
    }


    /*
     * Hide boss initially.
     */
    if (bossEl) {

        bossEl.style.display =
            "none";
    }


    if (bossHUD) {

        bossHUD.style.display =
            "none";
    }


    /*
     * Hide Day 6 portal initially.
     */
    if (day6Portal) {

        day6Portal.style.display =
            "none";
    }


    /*
     * Start loading.
     */
    startLoading();


    /*
     * Start engine.
     */
    ENGINE.lastTime =
        performance.now();


    requestAnimationFrame(
        gameLoop
    );
}


/*=========================================================
START
=========================================================*/

window.addEventListener(
    "load",
    initializeGame
);
