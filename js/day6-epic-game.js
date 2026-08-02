"use strict";

/* =========================================================
   VIDLYRA HALLOWEEN FEST 2026
   DAY 6 EPIC GAME
   FLOW:
   DAY 6 VIDEO
        ↓
   DAY 6 EPIC GAME
        ↓
   DAY 7 VIDEO
        ↓
   END CREDITS

   COMPLETE REPLACEMENT JS
========================================================= */


/* =========================================================
   CONFIG
========================================================= */

const CONFIG = {
    NEXT_LEVEL_URL: "day7-video.html",

    WORLD_WIDTH: 3600,
    WORLD_HEIGHT: 2000,

    PLAYER_SPEED: 5,
    DASH_SPEED: 14,

    MAX_HEALTH: 100,
    MAX_SPIRIT: 100,

    ATTACK_DAMAGE: 25,
    ATTACK_RANGE: 150,

    TOTAL_CRYSTALS: 6,

    BOSS_HEALTH: 1200
};


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


/* =========================================================
   DOM REFERENCES
========================================================= */

const loadingScreen = $("#loadingScreen");
const loadingFill = $("#loadingFill");
const loadingPercent = $("#loadingPercent");
const loadingMessage = $("#loadingMessage");

const gameWorld = $("#gameWorld");

const player = $("#player");
const playerContainer = $("#playerContainer");

const healthFill = $("#healthFill");
const spiritFill = $("#spiritFill");

const healthText = $("#healthText");
const spiritText = $("#spiritText");

const crystalCounter = $("#crystalCounter");
const scoreCounter = $("#scoreCounter");

const mission1 = $("#mission1");
const mission2 = $("#mission2");
const mission3 = $("#mission3");

const boss = $("#boss");
const bossHealthFill = $("#bossHealthFill");
const bossHUD = $("#bossHUD");

const victoryScreen = $("#victoryScreen");
const continueButton = $("#continueButton");

const gameOverScreen = $("#gameOverScreen");
const retryButton = $("#retryButton");

const notificationContainer = $("#notificationContainer");

const interactionPrompt = $("#interactionPrompt");

const pauseMenu = $("#pauseMenu");
const pauseButton = $("#pauseButton");
const resumeButton = $("#resumeButton");

const attackButton = $("#attackButton");
const dashButton = $("#dashButton");
const skillButton = $("#skillButton");

const mobileControls = $("#mobileControls");

const slashEffect = $("#slashEffect");

const bgMusic = $("#bgMusic");
const victorySound = $("#victorySound");
const gameOverSound = $("#gameOverSound");
const swordSound = $("#swordSlash");
const dashSound = $("#heroDash");
const bossSound = $("#bossRoar");
const crystalSound = $("#crystalSound");
const portalSound = $("#portalSound");

const day7Portal = $("#day7Portal");


/* =========================================================
   GAME STATE
========================================================= */

const GAME = {
    loading: true,
    running: false,
    paused: false,
    gameOver: false,
    victory: false,

    score: 0,
    crystals: 0,
    kills: 0
};


/* =========================================================
   PLAYER
========================================================= */

const PLAYER = {
    x: 500,
    y: 1500,

    health: CONFIG.MAX_HEALTH,
    spirit: CONFIG.MAX_SPIRIT,

    facing: 1,

    moving: false,
    attacking: false,
    invincible: false,

    stamina: 100,

    velocityX: 0,
    velocityY: 0
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
   DASH
========================================================= */

const DASH = {
    active: false,
    timer: 0,
    duration: 220,

    cooldown: false,
    cooldownTimer: 0,

    cooldownDuration: 700
};


/* =========================================================
   ATTACK
========================================================= */

const ATTACK = {
    cooldown: false,
    cooldownDuration: 250
};


/* =========================================================
   SKILL
========================================================= */

const SKILL = {
    cooldown: false,
    cooldownDuration: 5000
};


/* =========================================================
   CAMERA
========================================================= */

const CAMERA = {
    x: 0,
    y: 0,

    width: window.innerWidth,
    height: window.innerHeight,

    smooth: 0.12
};


/* =========================================================
   CRYSTALS
========================================================= */

const CRYSTALS = [];


/* =========================================================
   ENEMIES
========================================================= */

const ENEMIES = [];


/* =========================================================
   BOSS
========================================================= */

const BOSS = {
    active: false,
    defeated: false,

    x: 2900,
    y: 850,

    health: CONFIG.BOSS_HEALTH,
    maxHealth: CONFIG.BOSS_HEALTH,

    speed: 2,

    attackTimer: 0,
    attackCooldown: 1600
};


/* =========================================================
   PORTAL
========================================================= */

const PORTAL = {
    active: false,
    x: 0,
    y: 0,

    entered: false
};


/* =========================================================
   AUDIO
========================================================= */

function safePlay(audio) {

    if (!audio) {
        return;
    }

    try {

        audio.currentTime = 0;

        const promise = audio.play();

        if (promise && promise.catch) {
            promise.catch(() => {});
        }

    } catch (error) {}

}


/* =========================================================
   CLAMP
========================================================= */

function clamp(value, min, max) {

    return Math.max(
        min,
        Math.min(max, value)
    );

}


/* =========================================================
   RANDOM
========================================================= */

function random(min, max) {

    return Math.random() * (max - min) + min;

}


/* =========================================================
   NOTIFICATION
========================================================= */

function showNotification(message) {

    if (!notificationContainer) {
        return;
    }

    const element = document.createElement("div");

    element.className = "notification";

    element.textContent = message;

    notificationContainer.appendChild(element);

    setTimeout(() => {

        element.remove();

    }, 2000);

}


/* =========================================================
   LOADING
========================================================= */

function startLoading() {

    let progress = 0;

    const messages = [
        "Entering the cursed ruins...",
        "Awakening ancient spirits...",
        "Gathering moon crystals...",
        "Opening the forbidden gate...",
        "Summoning the guardian...",
        "Preparing the final battle..."
    ];

    const timer = setInterval(() => {

        progress += random(5, 11);

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

            const index = Math.min(
                messages.length - 1,
                Math.floor(
                    (progress / 100) * messages.length
                )
            );

            loadingMessage.textContent =
                messages[index];
        }

        if (progress >= 100) {

            clearInterval(timer);

            setTimeout(() => {

                finishLoading();

            }, 500);

        }

    }, 130);

}


/* =========================================================
   FINISH LOADING
========================================================= */

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

    if (bgMusic) {

        bgMusic.volume = 0.45;

        safePlay(bgMusic);

    }

    showNotification(
        "THE RUINS AWAIT..."
    );

}


/* =========================================================
   KEYBOARD
========================================================= */

window.addEventListener(
    "keydown",
    (event) => {

        if (event.repeat) {
            return;
        }

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

            case "Escape":

                togglePause();

                break;

        }

    }
);


window.addEventListener(
    "keyup",
    (event) => {

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

    }
);


/* =========================================================
   MOVEMENT
========================================================= */

function updateMovement() {

    if (!GAME.running || GAME.paused) {
        return;
    }

    let x = 0;
    let y = 0;

    if (INPUT.left) {
        x--;
    }

    if (INPUT.right) {
        x++;
    }

    if (INPUT.up) {
        y--;
    }

    if (INPUT.down) {
        y++;
    }

    const length = Math.hypot(x, y);

    if (length === 0) {

        PLAYER.moving = false;

        return;
    }

    x /= length;
    y /= length;

    PLAYER.moving = true;

    const speed =
        DASH.active
            ? CONFIG.DASH_SPEED
            : CONFIG.PLAYER_SPEED;

    PLAYER.x += x * speed;
    PLAYER.y += y * speed;

    PLAYER.x = clamp(
        PLAYER.x,
        60,
        CONFIG.WORLD_WIDTH - 60
    );

    PLAYER.y = clamp(
        PLAYER.y,
        60,
        CONFIG.WORLD_HEIGHT - 60
    );

    if (x < -0.1) {
        PLAYER.facing = -1;
    }

    if (x > 0.1) {
        PLAYER.facing = 1;
    }

}


/* =========================================================
   PLAYER RENDER
========================================================= */

function renderPlayer() {

    if (!playerContainer) {
        return;
    }

    playerContainer.style.left =
        PLAYER.x + "px";

    playerContainer.style.top =
        PLAYER.y + "px";

    playerContainer.style.transform =
        `translate(-50%,-100%) scaleX(${PLAYER.facing})`;

}


/* =========================================================
   CAMERA
========================================================= */

function updateCamera() {

    CAMERA.width = window.innerWidth;
    CAMERA.height = window.innerHeight;

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

    CAMERA.x = clamp(
        CAMERA.x,
        0,
        Math.max(
            0,
            CONFIG.WORLD_WIDTH -
            CAMERA.width
        )
    );

    CAMERA.y = clamp(
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


/* =========================================================
   HUD
========================================================= */

function updateHUD() {

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
            health + " / " +
            CONFIG.MAX_HEALTH;

    }

    if (spiritText) {

        spiritText.textContent =
            spirit + " / " +
            CONFIG.MAX_SPIRIT;

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
   CRYSTALS
========================================================= */

function initializeCrystals() {

    const elements =
        $$(".crystal");

    elements.forEach(
        (element, index) => {

            const angle =
                (index / elements.length) *
                Math.PI * 2;

            const radius = 850;

            const x =
                1800 +
                Math.cos(angle) *
                radius;

            const y =
                1000 +
                Math.sin(angle) *
                radius *
                0.55;

            element.style.position =
                "absolute";

            element.style.left =
                x + "px";

            element.style.top =
                y + "px";

            CRYSTALS.push({

                element: element,

                x: x,
                y: y,

                collected: false

            });

        }
    );

}


function updateCrystals() {

    CRYSTALS.forEach(
        (crystal) => {

            if (crystal.collected) {
                return;
            }

            const distance =
                Math.hypot(
                    PLAYER.x - crystal.x,
                    PLAYER.y - crystal.y
                );

            if (distance <= 90) {

                collectCrystal(crystal);

            }

        }
    );

}


function collectCrystal(crystal) {

    if (crystal.collected) {
        return;
    }

    crystal.collected = true;

    GAME.crystals++;

    GAME.score += 500;

    if (crystal.element) {

        crystal.element.style.transition =
            "opacity .5s, transform .5s";

        crystal.element.style.opacity =
            "0";

        crystal.element.style.transform =
            "scale(2)";

        setTimeout(() => {

            crystal.element.style.display =
                "none";

        }, 500);

    }

    safePlay(crystalSound);

    showNotification(
        "ANCIENT CRYSTAL COLLECTED!"
    );

    if (GAME.crystals ===
        CONFIG.TOTAL_CRYSTALS) {

        if (mission1) {

            mission1.style.textDecoration =
                "line-through";

        }

        showNotification(
            "ALL CRYSTALS COLLECTED!"
        );

        spawnEnemies();

    }

}


/* =========================================================
   ENEMIES
========================================================= */

function spawnEnemies() {

    if (ENEMIES.length > 0) {
        return;
    }

    const elements =
        $$(".enemy");

    elements.forEach(
        (element, index) => {

            const angle =
                (index / elements.length) *
                Math.PI * 2;

            const radius = 500;

            const x =
                1800 +
                Math.cos(angle) *
                radius;

            const y =
                1000 +
                Math.sin(angle) *
                radius;

            element.style.position =
                "absolute";

            element.style.left =
                x + "px";

            element.style.top =
                y + "px";

            element.style.display =
                "flex";

            ENEMIES.push({

                element: element,

                x: x,
                y: y,

                health: 100,
                maxHealth: 100,

                speed: 1.5,

                alive: true,

                attackTimer: 0

            });

        }
    );

    if (ENEMIES.length === 0) {

        activateBoss();

    } else {

        showNotification(
            "THE GUARDIANS HAVE AWAKENED!"
        );

    }

}


/* =========================================================
   ENEMY AI
========================================================= */

function updateEnemies(delta) {

    ENEMIES.forEach(
        (enemy) => {

            if (!enemy.alive) {
                return;
            }

            const dx =
                PLAYER.x - enemy.x;

            const dy =
                PLAYER.y - enemy.y;

            const distance =
                Math.hypot(dx, dy);

            if (distance < 500 &&
                distance > 100) {

                enemy.x +=
                    (dx / distance) *
                    enemy.speed;

                enemy.y +=
                    (dy / distance) *
                    enemy.speed;

            }

            if (distance <= 100) {

                enemy.attackTimer -=
                    delta;

                if (enemy.attackTimer <= 0) {

                    enemy.attackTimer =
                        1300;

                    enemyAttack(enemy);

                }

            }

            if (enemy.element) {

                enemy.element.style.left =
                    enemy.x + "px";

                enemy.element.style.top =
                    enemy.y + "px";

            }

        }
    );

}


/* =========================================================
   ENEMY ATTACK
========================================================= */

function enemyAttack(enemy) {

    if (PLAYER.invincible) {
        return;
    }

    PLAYER.health =
        Math.max(
            0,
            PLAYER.health - 10
        );

    if (PLAYER.health <= 0) {

        loseGame();

    }

}


/* =========================================================
   ATTACK
========================================================= */

function attack() {

    if (!GAME.running ||
        GAME.paused ||
        GAME.gameOver ||
        GAME.victory) {

        return;
    }

    if (ATTACK.cooldown) {
        return;
    }

    ATTACK.cooldown = true;

    PLAYER.attacking = true;

    safePlay(swordSound);

    if (slashEffect) {

        slashEffect.classList.remove(
            "play"
        );

        void slashEffect.offsetWidth;

        slashEffect.classList.add(
            "play"
        );

    }

    ENEMIES.forEach(
        (enemy) => {

            if (!enemy.alive) {
                return;
            }

            const distance =
                Math.hypot(
                    PLAYER.x - enemy.x,
                    PLAYER.y - enemy.y
                );

            const correctSide =
                PLAYER.facing === 1
                    ? enemy.x >= PLAYER.x
                    : enemy.x <= PLAYER.x;

            if (
                distance <=
                    CONFIG.ATTACK_RANGE &&
                correctSide
            ) {

                damageEnemy(enemy);

            }

        }
    );

    damageBoss();

    setTimeout(() => {

        PLAYER.attacking = false;

    }, 250);

    setTimeout(() => {

        ATTACK.cooldown = false;

    }, ATTACK.cooldownDuration);

}


/* =========================================================
   DAMAGE ENEMY
========================================================= */

function damageEnemy(enemy) {

    enemy.health -=
        CONFIG.ATTACK_DAMAGE;

    if (enemy.health <= 0) {

        enemy.alive = false;

        GAME.kills++;

        GAME.score += 300;

        if (enemy.element) {

            enemy.element.style.transition =
                "opacity .4s, transform .4s";

            enemy.element.style.opacity =
                "0";

            enemy.element.style.transform =
                "scale(0.2)";

            setTimeout(() => {

                enemy.element.style.display =
                    "none";

            }, 450);

        }

        checkEnemiesDefeated();

    }

}


/* =========================================================
   CHECK ENEMIES
========================================================= */

function checkEnemiesDefeated() {

    const remaining =
        ENEMIES.filter(
            enemy => enemy.alive
        ).length;

    if (remaining === 0) {

        if (mission2) {

            mission2.style.textDecoration =
                "line-through";

        }

        showNotification(
            "ALL GUARDIANS DEFEATED!"
        );

        setTimeout(
            activateBoss,
            1000
        );

    }

}


/* =========================================================
   BOSS
========================================================= */

function activateBoss() {

    if (BOSS.active ||
        BOSS.defeated) {

        return;
    }

    BOSS.active = true;

    BOSS.health =
        BOSS.maxHealth;

    if (boss) {

        boss.style.display =
            "flex";

        boss.style.position =
            "absolute";

        boss.style.left =
            BOSS.x + "px";

        boss.style.top =
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

    safePlay(bossSound);

    showNotification(
        "THE ANCIENT GUARDIAN AWAKENS!"
    );

}


/* =========================================================
   BOSS UPDATE
========================================================= */

function updateBoss(delta) {

    if (!BOSS.active ||
        BOSS.defeated) {

        return;
    }

    const dx =
        PLAYER.x - BOSS.x;

    const dy =
        PLAYER.y - BOSS.y;

    const distance =
        Math.hypot(dx, dy);

    if (distance > 180) {

        BOSS.x +=
            (dx / distance) *
            BOSS.speed;

        BOSS.y +=
            (dy / distance) *
            BOSS.speed;

    } else {

        BOSS.attackTimer -=
            delta;

        if (BOSS.attackTimer <= 0) {

            BOSS.attackTimer =
                BOSS.attackCooldown;

            bossAttack();

        }

    }

    if (boss) {

        boss.style.left =
            BOSS.x + "px";

        boss.style.top =
            BOSS.y + "px";

    }

}


/* =========================================================
   BOSS ATTACK
========================================================= */

function bossAttack() {

    if (PLAYER.invincible) {
        return;
    }

    PLAYER.health =
        Math.max(
            0,
            PLAYER.health - 20
        );

    if (PLAYER.health <= 0) {

        loseGame();

    }

}


/* =========================================================
   DAMAGE BOSS
========================================================= */

function damageBoss() {

    if (!BOSS.active ||
        BOSS.defeated) {

        return;
    }

    const distance =
        Math.hypot(
            PLAYER.x - BOSS.x,
            PLAYER.y - BOSS.y
        );

    if (distance >
        CONFIG.ATTACK_RANGE + 50) {

        return;
    }

    BOSS.health -=
        CONFIG.ATTACK_DAMAGE;

    BOSS.health =
        Math.max(
            0,
            BOSS.health
        );

    if (bossHealthFill) {

        bossHealthFill.style.width =
            (
                BOSS.health /
                BOSS.maxHealth *
                100
            ) + "%";

    }

    if (BOSS.health <= 0) {

        defeatBoss();

    }

}


/* =========================================================
   DEFEAT BOSS
========================================================= */

function defeatBoss() {

    if (BOSS.defeated) {
        return;
    }

    BOSS.defeated = true;
    BOSS.active = false;

    GAME.score += 5000;

    if (mission3) {

        mission3.style.textDecoration =
            "line-through";

    }

    if (boss) {

        boss.style.transition =
            "opacity .8s, transform .8s";

        boss.style.opacity =
            "0";

        boss.style.transform =
            "scale(1.5)";

        setTimeout(() => {

            boss.style.display =
                "none";

        }, 900);

    }

    if (bossHUD) {

        bossHUD.style.display =
            "none";

    }

    safePlay(bossSound);

    showNotification(
        "THE ANCIENT GUARDIAN HAS FALLEN!"
    );

    setTimeout(() => {

        activateDay7Portal();

    }, 1200);

}


/* =========================================================
   DAY 7 PORTAL
========================================================= */

function activateDay7Portal() {

    PORTAL.active = true;

    PORTAL.x = BOSS.x;
    PORTAL.y = BOSS.y;

    if (day7Portal) {

        day7Portal.style.display =
            "flex";

        day7Portal.style.position =
            "absolute";

        day7Portal.style.left =
            PORTAL.x + "px";

        day7Portal.style.top =
            PORTAL.y + "px";

        day7Portal.style.opacity =
            "1";

        day7Portal.style.pointerEvents =
            "auto";

        day7Portal.style.transform =
            "translate(-50%,-50%) scale(1)";

    }

    safePlay(portalSound);

    showNotification(
        "THE PATH TO DAY 7 IS OPEN!"
    );

    setTimeout(() => {

        winGame();

    }, 1500);

}


/* =========================================================
   WIN GAME
========================================================= */

function winGame() {

    if (GAME.victory) {
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

    safePlay(victorySound);

    if (victoryScreen) {

        victoryScreen.style.display =
            "flex";

        victoryScreen.style.opacity =
            "0";

        requestAnimationFrame(() => {

            victoryScreen.style.transition =
                "opacity .6s ease";

            victoryScreen.style.opacity =
                "1";

        });

    }

    if (continueButton) {

        continueButton.style.display =
            "flex";

        continueButton.disabled =
            false;

        continueButton.style.pointerEvents =
            "auto";

    }

}


/* =========================================================
   DAY 7 REDIRECT
========================================================= */

function goToDay7() {

    if (PORTAL.entered) {
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

    safePlay(portalSound);

    /*
       IMPORTANT:
       Redirect happens even if the portal animation
       or victory overlay is missing.
    */

    const transition =
        document.createElement("div");

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

        /*
           FINAL REDIRECT
        */

        window.location.href =
            CONFIG.NEXT_LEVEL_URL;

    }, 1100);

}


/* =========================================================
   CONTINUE BUTTON
========================================================= */

on(
    continueButton,
    "click",
    (event) => {

        event.preventDefault();

        goToDay7();

    }
);


/* =========================================================
   PORTAL CLICK
========================================================= */

on(
    day7Portal,
    "click",
    (event) => {

        event.preventDefault();

        if (PORTAL.active) {

            goToDay7();

        }

    }
);


/* =========================================================
   MOBILE CONTROLS
========================================================= */

on(
    attackButton,
    "touchstart",
    (event) => {

        event.preventDefault();

        attack();

    },
    { passive: false }
);


on(
    dashButton,
    "touchstart",
    (event) => {

        event.preventDefault();

        dash();

    },
    { passive: false }
);


on(
    skillButton,
    "touchstart",
    (event) => {

        event.preventDefault();

        spiritSkill();

    },
    { passive: false }
);


on(
    pauseButton,
    "click",
    () => {

        togglePause();

    }
);


/* =========================================================
   DASH
========================================================= */

function dash() {

    if (!GAME.running ||
        GAME.paused ||
        DASH.cooldown) {

        return;
    }

    DASH.active = true;

    DASH.timer =
        DASH.duration;

    DASH.cooldown =
        true;

    DASH.cooldownTimer =
        DASH.cooldownDuration;

    PLAYER.invincible = true;

    safePlay(dashSound);

    setTimeout(() => {

        DASH.active = false;

        PLAYER.invincible = false;

    }, DASH.duration);

}


/* =========================================================
   SPIRIT SKILL
========================================================= */

function spiritSkill() {

    if (!GAME.running ||
        GAME.paused ||
        SKILL.cooldown) {

        return;
    }

    if (PLAYER.spirit < 30) {

        showNotification(
            "NOT ENOUGH SPIRIT"
        );

        return;

    }

    PLAYER.spirit -= 30;

    SKILL.cooldown = true;

    ENEMIES.forEach(
        (enemy) => {

            if (!enemy.alive) {
                return;
            }

            const distance =
                Math.hypot(
                    PLAYER.x - enemy.x,
                    PLAYER.y - enemy.y
                );

            if (distance <= 300) {

                enemy.health -= 75;

                if (enemy.health <= 0) {

                    damageEnemy(enemy);

                }

            }

        }
    );

    if (BOSS.active) {

        const distance =
            Math.hypot(
                PLAYER.x - BOSS.x,
                PLAYER.y - BOSS.y
            );

        if (distance <= 300) {

            BOSS.health -= 100;

            if (BOSS.health <= 0) {

                defeatBoss();

            }

            if (bossHealthFill) {

                bossHealthFill.style.width =
                    (
                        BOSS.health /
                        BOSS.maxHealth *
                        100
                    ) + "%";

            }

        }

    }

    showNotification(
        "ANCIENT SPIRIT BURST!"
    );

    setTimeout(() => {

        SKILL.cooldown = false;

    }, SKILL.cooldownDuration);

}


/* =========================================================
   REGENERATION
========================================================= */

function regenerate(delta) {

    if (PLAYER.health <
        CONFIG.MAX_HEALTH) {

        PLAYER.health +=
            0.003 * delta;

        PLAYER.health =
            Math.min(
                CONFIG.MAX_HEALTH,
                PLAYER.health
            );

    }

    if (PLAYER.spirit <
        CONFIG.MAX_SPIRIT) {

        PLAYER.spirit +=
            0.01 * delta;

        PLAYER.spirit =
            Math.min(
                CONFIG.MAX_SPIRIT,
                PLAYER.spirit
            );

    }

}


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


/* =========================================================
   GAME OVER
========================================================= */

function loseGame() {

    if (GAME.gameOver) {
        return;
    }

    GAME.gameOver = true;

    GAME.running = false;

    safePlay(gameOverSound);

    if (gameOverScreen) {

        gameOverScreen.style.display =
            "flex";

    }

}


/* =========================================================
   RETRY
========================================================= */

on(
    retryButton,
    "click",
    () => {

        window.location.reload();

    }
);


/* =========================================================
   MOBILE DETECTION
========================================================= */

function detectMobile() {

    const mobile =
        window.innerWidth <= 992;

    if (mobileControls) {

        mobileControls.style.display =
            mobile
                ? "flex"
                : "none";

    }

}


window.addEventListener(
    "resize",
    detectMobile
);


/* =========================================================
   GAME LOOP
========================================================= */

let lastTime =
    performance.now();


function gameLoop(currentTime) {

    const delta =
        Math.min(
            50,
            currentTime - lastTime
        );

    lastTime =
        currentTime;

    if (GAME.running &&
        !GAME.paused) {

        updateMovement();

        updateCrystals();

        updateEnemies(delta);

        updateBoss(delta);

        regenerate(delta);

        updateCamera();

        renderPlayer();

    }

    updateHUD();

    requestAnimationFrame(
        gameLoop
    );

}


/* =========================================================
   INITIALIZATION
========================================================= */

function initializeGame() {

    detectMobile();

    initializeCrystals();

    startLoading();

    requestAnimationFrame(
        gameLoop
    );

}


/* =========================================================
   SAFETY REDIRECT
   If continue button exists but its HTML/CSS accidentally
   prevents the click handler, this still gives the user
   a working path by making the button keyboard-accessible.
========================================================= */

document.addEventListener(
    "keydown",
    (event) => {

        if (
            GAME.victory &&
            (
                event.code === "Enter" ||
                event.code === "NumpadEnter"
            )
        ) {

            goToDay7();

        }

    }
);


/* =========================================================
   START
========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeGame
    );

} else {

    initializeGame();

}
