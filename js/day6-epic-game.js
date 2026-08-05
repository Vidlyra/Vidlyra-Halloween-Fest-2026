/* =========================================================
   VIDLYRA HALLOWEEN FEST 2026
   DAY 6 — THE HAUNTED MANSION
   EPIC GAME ENGINE
   Responsive keyboard + touch controls
========================================================= */

"use strict";


/* =========================================================
   CONFIG
========================================================= */

const CONFIG = {
    totalCrystals: 6,
    totalEnemies: 4,

    playerSpeed: 0.55,
    dashSpeed: 2.0,

    maxHealth: 100,
    maxSpirit: 100,

    enemyHealth: 3,
    bossHealth: 25,

    crystalScore: 500,
    enemyScore: 1000,
    bossScore: 5000,

    victoryPage: "day7-video.html",
    retryPage: "day6-epic-game.html"
};


/* =========================================================
   DOM HELPERS
========================================================= */

const $ = id => document.getElementById(id);

const loadingScreen = $("loadingScreen");
const loadingFill = $("loadingFill");
const loadingPercent = $("loadingPercent");
const loadingMessage = $("loadingMessage");

const gameWorld = $("gameWorld");
const playerContainer = $("playerContainer");
const player = $("player");

const crystalLayer = $("crystalLayer");
const enemyLayer = $("enemyLayer");

const boss = $("boss");
const bossHUD = $("bossHUD");
const bossHealthFill = $("bossHealthFill");

const day7Portal = $("day7Portal");

const healthFill = $("healthFill");
const spiritFill = $("spiritFill");

const healthText = $("healthText");
const spiritText = $("spiritText");

const crystalCounter = $("crystalCounter");
const scoreCounter = $("scoreCounter");

const mission1 = $("mission1");
const mission2 = $("mission2");
const mission3 = $("mission3");

const notificationContainer = $("notificationContainer");
const interactionPrompt = $("interactionPrompt");

const pauseButton = $("pauseButton");
const pauseMenu = $("pauseMenu");
const resumeButton = $("resumeButton");

const victoryScreen = $("victoryScreen");
const gameOverScreen = $("gameOverScreen");

const retryButton = $("retryButton");
const continueButton = $("continueButton");

const slashEffect = $("slashEffect");
const dashTrail = $("dashTrail");
const lightningLayer = $("lightningLayer");


/* =========================================================
   AUDIO
   All audio paths point to assets/images/day6
========================================================= */

const audio = {
    main:
        new Audio("../assets/images/day6/day6-main-theme.mp3"),

    victory:
        new Audio("../assets/images/day6/day6-victory-theme.mp3"),

    loss:
        new Audio("../assets/images/day6/loss.mp3"),

    boss:
        new Audio("../assets/images/day6/boss-battle-theme.mp3"),

    guardian:
        new Audio("../assets/images/day6/guardian-battle-theme.mp3"),

    slash:
        new Audio("../assets/images/day6/slash.mp3"),

    dash:
        new Audio("../assets/images/day6/dash.mp3"),

    slice:
        new Audio("../assets/images/day6/slice.mp3"),

    collect:
        new Audio("../../assets/collect.mp3"),

    crystal:
        new Audio("../../assets/crystal.mp3"),

    hurt:
        new Audio("../assets/images/day6/hurt.mp3"),

    footsteps:
        new Audio("../assets/images/day6/foot step.mp3"),

    portal:
        new Audio("../../assets/portal.mp3"),

    gate:
        new Audio("../../assets/gate-open.mp3"),

    magic:
        new Audio("../../assets/magic.mp3"),

    spell:
        new Audio("../../assets/spell-cast.mp3"),

    roar:
        new Audio("../../assets/boss-roar.mp3")
};


/* =========================================================
   AUDIO SETUP
========================================================= */

audio.main.loop = true;
audio.main.volume = 0.42;

audio.victory.volume = 0.7;
audio.loss.volume = 0.65;

audio.boss.loop = true;
audio.boss.volume = 0.48;

audio.guardian.loop = true;
audio.guardian.volume = 0.28;

Object.values(audio).forEach(sound => {
    sound.preload = "auto";
});


function playSound(sound, volume = null) {

    if (!sound) return;

    try {

        sound.currentTime = 0;

        if (volume !== null) {
            sound.volume = volume;
        }

        const promise = sound.play();

        if (promise && promise.catch) {
            promise.catch(() => {});
        }

    } catch (error) {
        /* Browser may block audio before user interaction. */
    }
}


function stopSound(sound) {

    if (!sound) return;

    try {
        sound.pause();
        sound.currentTime = 0;
    } catch (error) {}
}


/* =========================================================
   GAME STATE
========================================================= */

const state = {

    started: false,
    paused: false,
    gameOver: false,
    victory: false,

    health: CONFIG.maxHealth,
    spirit: CONFIG.maxSpirit,

    crystals: 0,
    enemiesDefeated: 0,

    score: 0,

    bossActive: false,
    bossHealth: CONFIG.bossHealth,

    attackCooldown: false,
    dashCooldown: false,
    hurtCooldown: false,

    lastTime: 0,

    keys: {
        up: false,
        down: false,
        left: false,
        right: false
    },

    joystick: {
        active: false,
        x: 0,
        y: 0
    },

    player: {
        x: 50,
        y: 72
    }
};


/* =========================================================
   LOADING
========================================================= */

const loadingMessages = [
    "Opening the mansion gates...",
    "Awakening the ancient spirits...",
    "Lighting the cursed halls...",
    "Summoning the guardians...",
    "Preparing the Haunted Mansion...",
    "The domain is waiting..."
];

let loadingProgress = 0;
let loadingMessageIndex = 0;

function runLoading() {

    const interval = setInterval(() => {

        loadingProgress += Math.random() * 8 + 3;

        if (loadingProgress >= 100) {

            loadingProgress = 100;

            clearInterval(interval);

            loadingFill.style.width = "100%";
            loadingPercent.textContent = "100%";

            loadingMessage.textContent =
                "ENTER THE HAUNTED MANSION";

            setTimeout(startGame, 700);

            return;
        }

        loadingFill.style.width =
            `${loadingProgress}%`;

        loadingPercent.textContent =
            `${Math.floor(loadingProgress)}%`;

        if (
            loadingProgress >
            (loadingMessageIndex + 1) * 16
        ) {

            loadingMessageIndex =
                Math.min(
                    loadingMessageIndex + 1,
                    loadingMessages.length - 1
                );

            loadingMessage.textContent =
                loadingMessages[loadingMessageIndex];
        }

    }, 120);
}


/* =========================================================
   START GAME
========================================================= */

function startGame() {

    if (state.started) return;

    state.started = true;

    loadingScreen.classList.add("hidden");

    setupWorld();

    updateHUD();

    requestAnimationFrame(gameLoop);

    /*
       Browsers normally require a user gesture before
       allowing audio. The game also retries when the
       first keyboard/touch/click interaction happens.
    */

    tryStartMusic();
}


function tryStartMusic() {

    if (state.paused || state.gameOver || state.victory) {
        return;
    }

    if (!audio.main.paused) return;

    playSound(audio.main, 0.42);
}


/* =========================================================
   WORLD SETUP
========================================================= */

function setupWorld() {

    createCrystals();
    createEnemies();

    if (boss) {
        boss.classList.remove("active");
    }

    if (bossHUD) {
        bossHUD.classList.remove("active");
    }

    if (day7Portal) {
        day7Portal.classList.remove("active");
    }

    updatePlayerPosition();
}


/* =========================================================
   CRYSTALS
========================================================= */

function createCrystals() {

    if (!crystalLayer) return;

    crystalLayer.innerHTML = "";

    const positions = [
        [13, 62],
        [28, 38],
        [43, 66],
        [61, 43],
        [76, 64],
        [88, 34]
    ];

    positions.forEach((position, index) => {

        const crystal = document.createElement("div");

        crystal.className = "crystal";

        crystal.dataset.index = index;

        crystal.style.left = `${position[0]}%`;
        crystal.style.top = `${position[1]}%`;

        crystal.addEventListener(
            "click",
            () => collectCrystal(crystal)
        );

        crystalLayer.appendChild(crystal);
    });
}


function collectCrystal(crystal) {

    if (!crystal) return;

    if (
        crystal.classList.contains("collected")
    ) {
        return;
    }

    crystal.classList.add("collected");

    state.crystals++;

    state.score += CONFIG.crystalScore;

    state.spirit =
        Math.min(
            CONFIG.maxSpirit,
            state.spirit + 12
        );

    playSound(audio.collect, 0.6);
    playSound(audio.crystal, 0.4);

    showNotification(
        `ANCIENT CRYSTAL ${state.crystals}/${CONFIG.totalCrystals}`
    );

    updateHUD();

    if (state.crystals >= CONFIG.totalCrystals) {

        completeMission(mission1);

        showNotification(
            "ALL ANCIENT CRYSTALS COLLECTED"
        );

        playSound(audio.magic, 0.45);

        checkBossUnlock();
    }
}


/* =========================================================
   ENEMIES
========================================================= */

function createEnemies() {

    if (!enemyLayer) return;

    enemyLayer.innerHTML = "";

    const positions = [
        [22, 67],
        [36, 46],
        [67, 68],
        [81, 47]
    ];

    positions.forEach((position, index) => {

        const enemy = document.createElement("div");

        enemy.className = "enemy";

        enemy.dataset.index = index;
        enemy.dataset.health = CONFIG.enemyHealth;

        enemy.style.left = `${position[0]}%`;
        enemy.style.top = `${position[1]}%`;

        enemyLayer.appendChild(enemy);
    });
}


function damageNearbyEnemy() {

    const enemies =
        document.querySelectorAll(
            ".enemy:not(.defeated)"
        );

    let hit = false;

    enemies.forEach(enemy => {

        const rect =
            enemy.getBoundingClientRect();

        const playerRect =
            playerContainer.getBoundingClientRect();

        const distance =
            Math.hypot(
                rect.left - playerRect.left,
                rect.top - playerRect.top
            );

        if (distance < 145) {

            let hp =
                Number(enemy.dataset.health || 1);

            hp--;

            enemy.dataset.health = hp;

            hit = true;

            enemy.style.transform =
                "scale(1.15)";

            setTimeout(() => {

                if (!enemy.classList.contains("defeated")) {
                    enemy.style.transform = "";
                }

            }, 120);

            if (hp <= 0) {

                enemy.classList.add("defeated");

                state.enemiesDefeated++;

                state.score += CONFIG.enemyScore;

                playSound(audio.slice, 0.45);

                showNotification(
                    "ANCIENT GUARDIAN DEFEATED"
                );

                updateHUD();

                if (
                    state.enemiesDefeated >=
                    CONFIG.totalEnemies
                ) {

                    completeMission(mission2);

                    showNotification(
                        "THE GUARDIANS HAVE FALLEN"
                    );

                    checkBossUnlock();
                }
            }
        }
    });

    return hit;
}


/* =========================================================
   BOSS
========================================================= */

function checkBossUnlock() {

    if (
        state.crystals >= CONFIG.totalCrystals &&
        state.enemiesDefeated >= CONFIG.totalEnemies &&
        !state.bossActive
    ) {

        activateBoss();
    }
}


function activateBoss() {

    state.bossActive = true;
    state.bossHealth = CONFIG.bossHealth;

    if (boss) {
        boss.classList.add("active");
    }

    if (bossHUD) {
        bossHUD.classList.add("active");
    }

    if (bossHealthFill) {
        bossHealthFill.style.width = "100%";
    }

    stopSound(audio.main);
    stopSound(audio.guardian);

    playSound(audio.boss, 0.48);
    playSound(audio.roar, 0.7);

    showNotification(
        "THE HAUNTED MANSION GUARDIAN AWAKENS"
    );

    shakeScreen();

    setTimeout(() => {

        showNotification(
            "DEFEAT THE ANCIENT GUARDIAN"
        );

    }, 1200);
}


function damageBoss() {

    if (!state.bossActive) {
        return;
    }

    state.bossHealth -= 1;

    if (state.bossHealth < 0) {
        state.bossHealth = 0;
    }

    if (bossHealthFill) {

        bossHealthFill.style.width =
            `${(
                state.bossHealth /
                CONFIG.bossHealth
            ) * 100}%`;
    }

    playSound(audio.slash, 0.5);

    if (boss) {

        boss.style.transform =
            "translateX(-50%) scale(.98)";

        setTimeout(() => {

            if (boss) {
                boss.style.transform = "";
            }

        }, 100);
    }

    if (state.bossHealth <= 0) {

        defeatBoss();
    }
}


function defeatBoss() {

    state.bossActive = false;

    state.score += CONFIG.bossScore;

    completeMission(mission3);

    stopSound(audio.boss);

    playSound(audio.victory, 0.7);

    if (boss) {

        boss.style.opacity = "0";
        boss.style.transform =
            "translateX(-50%) scale(1.25)";

        setTimeout(() => {

            boss.classList.remove("active");

        }, 700);
    }

    showNotification(
        "THE ANCIENT GUARDIAN HAS FALLEN"
    );

    setTimeout(() => {

        openPortal();

    }, 1200);
}


/* =========================================================
   PORTAL
========================================================= */

function openPortal() {

    if (!day7Portal) return;

    day7Portal.classList.add("active");

    playSound(audio.portal, 0.65);
    playSound(audio.gate, 0.45);

    showNotification(
        "THE PATH TO DAY 7 IS OPEN"
    );

    setTimeout(() => {

        showNotification(
            "ENTER THE PORTAL"
        );

    }, 1300);
}


/* =========================================================
   PLAYER MOVEMENT
========================================================= */

function updatePlayerPosition() {

    if (!playerContainer) return;

    const rect =
        gameWorld.getBoundingClientRect();

    const playerWidth =
        playerContainer.offsetWidth;

    const playerHeight =
        playerContainer.offsetHeight;

    const minX =
        (playerWidth / rect.width) * 50;

    const maxX =
        100 -
        (playerWidth / rect.width) * 50;

    const minY = 28;
    const maxY = 82;

    state.player.x =
        Math.max(
            minX,
            Math.min(
                maxX,
                state.player.x
            )
        );

    state.player.y =
        Math.max(
            minY,
            Math.min(
                maxY,
                state.player.y
            )
        );

    playerContainer.style.left =
        `${state.player.x}%`;

    playerContainer.style.bottom =
        `${100 - state.player.y}%`;
}


function movePlayer(delta) {

    if (
        state.paused ||
        state.gameOver ||
        state.victory
    ) {
        return;
    }

    let x = 0;
    let y = 0;

    if (state.keys.left) x -= 1;
    if (state.keys.right) x += 1;
    if (state.keys.up) y -= 1;
    if (state.keys.down) y += 1;

    x += state.joystick.x;
    y += state.joystick.y;

    const length =
        Math.hypot(x, y);

    if (length > 1) {

        x /= length;
        y /= length;
    }

    if (
        Math.abs(x) > 0.01 ||
        Math.abs(y) > 0.01
    ) {

        state.player.x +=
            x * CONFIG.playerSpeed * delta;

        state.player.y +=
            y * CONFIG.playerSpeed * delta;

        updatePlayerPosition();

        if (
            !state.attackCooldown &&
            !state.dashCooldown
        ) {

            setPlayerAnimation("walk");

        }

    } else {

        if (
            !state.attackCooldown &&
            !state.dashCooldown &&
            !state.hurtCooldown
        ) {

            setPlayerAnimation("idle");
        }
    }
}


/* =========================================================
   PLAYER ANIMATION
========================================================= */

function setPlayerAnimation(animation) {

    if (!player) return;

    player.classList.remove(
        "idle",
        "walk",
        "attack",
        "dash",
        "hurt"
    );

    player.classList.add(animation);
}


/* =========================================================
   ATTACK
========================================================= */

function attack() {

    if (
        state.paused ||
        state.gameOver ||
        state.victory ||
        state.attackCooldown
    ) {
        return;
    }

    state.attackCooldown = true;

    setPlayerAnimation("attack");

    if (slashEffect) {
        slashEffect.classList.remove("active");

        void slashEffect.offsetWidth;

        slashEffect.classList.add("active");
    }

    playSound(audio.slash, 0.6);

    const enemyHit =
        damageNearbyEnemy();

    if (
        state.bossActive &&
        boss
    ) {

        const bossRect =
            boss.getBoundingClientRect();

        const playerRect =
            playerContainer.getBoundingClientRect();

        const distance =
            Math.hypot(
                bossRect.left - playerRect.left,
                bossRect.top - playerRect.top
            );

        if (distance < 260) {

            damageBoss();
        }
    }

    setTimeout(() => {

        state.attackCooldown = false;

        if (!state.hurtCooldown) {
            setPlayerAnimation("idle");
        }

    }, 360);
}


/* =========================================================
   DASH
========================================================= */

function dash() {

    if (
        state.paused ||
        state.gameOver ||
        state.victory ||
        state.dashCooldown
    ) {
        return;
    }

    state.dashCooldown = true;

    setPlayerAnimation("dash");

    if (dashTrail) {

        dashTrail.classList.remove("active");

        void dashTrail.offsetWidth;

        dashTrail.classList.add("active");
    }

    playSound(audio.dash, 0.6);

    let direction = 1;

    if (state.keys.left) {
        direction = -1;
    }

    if (
        state.joystick.x < -0.15
    ) {
        direction = -1;
    }

    if (
        state.joystick.x > 0.15
    ) {
        direction = 1;
    }

    state.player.x +=
        direction *
        CONFIG.dashSpeed *
        4;

    updatePlayerPosition();

    setTimeout(() => {

        state.dashCooldown = false;

        if (!state.hurtCooldown) {
            setPlayerAnimation("idle");
        }

    }, 500);
}


/* =========================================================
   SKILL
========================================================= */

function skill() {

    if (
        state.paused ||
        state.gameOver ||
        state.victory
    ) {
        return;
    }

    if (state.spirit < 25) {

        showNotification(
            "NOT ENOUGH SPIRIT"
        );

        return;
    }

    state.spirit -= 25;

    playSound(audio.spell, 0.65);
    playSound(audio.magic, 0.5);

    showNotification(
        "SPIRIT BURST"
    );

    state.score += 250;

    damageNearbyEnemy();

    if (state.bossActive) {
        damageBoss();
        damageBoss();
    }

    updateHUD();
}


/* =========================================================
   PLAYER DAMAGE
========================================================= */

function damagePlayer(amount = 10) {

    if (
        state.hurtCooldown ||
        state.gameOver ||
        state.victory
    ) {
        return;
    }

    state.hurtCooldown = true;

    state.health -= amount;

    if (state.health < 0) {
        state.health = 0;
    }

    setPlayerAnimation("hurt");

    playSound(audio.hurt, 0.65);

    shakeScreen();

    updateHUD();

    setTimeout(() => {

        state.hurtCooldown = false;

        if (!state.gameOver) {
            setPlayerAnimation("idle");
        }

    }, 500);

    if (state.health <= 0) {

        loseGame();
    }
}


/* =========================================================
   ENEMY AI
========================================================= */

let enemyAttackTimer = 0;

function updateEnemies(delta) {

    if (
        state.paused ||
        state.gameOver ||
        state.victory
    ) {
        return;
    }

    enemyAttackTimer += delta;

    if (enemyAttackTimer < 1000) {
        return;
    }

    enemyAttackTimer = 0;

    const enemies =
        document.querySelectorAll(
            ".enemy:not(.defeated)"
        );

    const playerRect =
        playerContainer.getBoundingClientRect();

    enemies.forEach(enemy => {

        const enemyRect =
            enemy.getBoundingClientRect();

        const distance =
            Math.hypot(
                enemyRect.left - playerRect.left,
                enemyRect.top - playerRect.top
            );

        if (distance < 115) {

            damagePlayer(7);
        }
    });

    if (state.bossActive) {

        const bossRect =
            boss.getBoundingClientRect();

        const distance =
            Math.hypot(
                bossRect.left - playerRect.left,
                bossRect.top - playerRect.top
            );

        if (distance < 220) {

            damagePlayer(12);
        }
    }
}


/* =========================================================
   PORTAL INTERACTION
========================================================= */

function checkPortal() {

    if (
        !state.bossActive &&
        state.enemiesDefeated >= CONFIG.totalEnemies &&
        state.crystals >= CONFIG.totalCrystals &&
        day7Portal &&
        day7Portal.classList.contains("active")
    ) {

        const portalRect =
            day7Portal.getBoundingClientRect();

        const playerRect =
            playerContainer.getBoundingClientRect();

        const distance =
            Math.hypot(
                portalRect.left - playerRect.left,
                portalRect.top - playerRect.top
            );

        if (distance < 180) {

            interactionPrompt.classList.add("active");

            if (
                state.keys.interact
            ) {

                state.keys.interact = false;

                winGame();
            }

        } else {

            interactionPrompt.classList.remove("active");
        }
    } else {

        interactionPrompt.classList.remove("active");
    }
}


/* =========================================================
   HUD
========================================================= */

function updateHUD() {

    const healthPercent =
        (state.health / CONFIG.maxHealth) * 100;

    const spiritPercent =
        (state.spirit / CONFIG.maxSpirit) * 100;

    if (healthFill) {

        healthFill.style.width =
            `${healthPercent}%`;
    }

    if (spiritFill) {

        spiritFill.style.width =
            `${spiritPercent}%`;
    }

    if (healthText) {

        healthText.textContent =
            `${Math.ceil(state.health)} / ${CONFIG.maxHealth}`;
    }

    if (spiritText) {

        spiritText.textContent =
            `${Math.ceil(state.spirit)} / ${CONFIG.maxSpirit}`;
    }

    if (crystalCounter) {

        crystalCounter.textContent =
            `${state.crystals} / ${CONFIG.totalCrystals}`;
    }

    if (scoreCounter) {

        scoreCounter.textContent =
            String(state.score).padStart(6, "0");
    }
}


/* =========================================================
   MISSIONS
========================================================= */

function completeMission(element) {

    if (!element) return;

    element.classList.add("complete");

    const icon =
        element.querySelector(".missionIcon");

    if (icon) {
        icon.textContent = "✓";
    }
}


/* =========================================================
   NOTIFICATIONS
========================================================= */

function showNotification(message) {

    if (!notificationContainer) return;

    const notification =
        document.createElement("div");

    notification.className =
        "notification";

    notification.textContent =
        message;

    notificationContainer.appendChild(
        notification
    );

    setTimeout(() => {

        notification.remove();

    }, 3000);
}


/* =========================================================
   PAUSE
========================================================= */

function togglePause() {

    if (
        state.gameOver ||
        state.victory
    ) {
        return;
    }

    state.paused =
        !state.paused;

    if (state.paused) {

        pauseMenu.classList.add("active");

        stopSound(audio.main);
        stopSound(audio.boss);
        stopSound(audio.guardian);

    } else {

        pauseMenu.classList.remove("active");

        tryStartMusic();

        if (state.bossActive) {

            playSound(
                audio.boss,
                0.48
            );

        }
    }
}


if (pauseButton) {

    pauseButton.addEventListener(
        "click",
        togglePause
    );
}


if (resumeButton) {

    resumeButton.addEventListener(
        "click",
        togglePause
    );
}


/* =========================================================
   VICTORY
========================================================= */

function winGame() {

    if (
        state.victory ||
        state.gameOver
    ) {
        return;
    }

    state.victory = true;

    stopSound(audio.main);
    stopSound(audio.boss);
    stopSound(audio.guardian);

    playSound(audio.victory, 0.7);

    if (victoryScreen) {

        victoryScreen.classList.add(
            "active"
        );
    }

    const finalScore =
        victoryScreen.querySelector(
            ".finalScore"
        );

    if (finalScore) {

        finalScore.textContent =
            `FINAL SCORE ${String(state.score).padStart(6, "0")}`;
    }
}


if (continueButton) {

    continueButton.addEventListener(
        "click",
        () => {

            window.location.href =
                CONFIG.victoryPage;
        }
    );
}


/* =========================================================
   GAME OVER
========================================================= */

function loseGame() {

    if (
        state.gameOver ||
        state.victory
    ) {
        return;
    }

    state.gameOver = true;

    stopSound(audio.main);
    stopSound(audio.boss);
    stopSound(audio.guardian);

    playSound(audio.loss, 0.65);

    if (gameOverScreen) {

        gameOverScreen.classList.add(
            "active"
        );
    }
}


if (retryButton) {

    retryButton.addEventListener(
        "click",
        () => {

            window.location.href =
                CONFIG.retryPage;
        }
    );
}


/* =========================================================
   KEYBOARD CONTROLS
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        tryStartMusic();

        const key =
            event.key.toLowerCase();

        if (
            [
                "arrowup",
                "arrowdown",
                "arrowleft",
                "arrowright",
                " "
            ].includes(key)
        ) {

            event.preventDefault();
        }

        if (key === "w" || key === "arrowup") {
            state.keys.up = true;
        }

        if (key === "s" || key === "arrowdown") {
            state.keys.down = true;
        }

        if (key === "a" || key === "arrowleft") {
            state.keys.left = true;
        }

        if (key === "d" || key === "arrowright") {
            state.keys.right = true;
        }

        if (key === "e") {

            state.keys.interact = true;
        }

        if (key === " " || key === "j") {

            attack();
        }

        if (key === "shift") {

            dash();
        }

        if (key === "k" || key === "q") {

            skill();
        }

        if (key === "escape") {

            togglePause();
        }
    }
);


document.addEventListener(
    "keyup",
    event => {

        const key =
            event.key.toLowerCase();

        if (key === "w" || key === "arrowup") {
            state.keys.up = false;
        }

        if (key === "s" || key === "arrowdown") {
            state.keys.down = false;
        }

        if (key === "a" || key === "arrowleft") {
            state.keys.left = false;
        }

        if (key === "d" || key === "arrowright") {
            state.keys.right = false;
        }
    }
);


/* =========================================================
   MOBILE JOYSTICK
========================================================= */

const joystick =
    document.querySelector(".joystick");

const joystickStick =
    document.querySelector(".joystickStick");


if (joystick && joystickStick) {

    let joystickPointer = null;

    function updateJoystick(clientX, clientY) {

        const rect =
            joystick.getBoundingClientRect();

        const centerX =
            rect.left + rect.width / 2;

        const centerY =
            rect.top + rect.height / 2;

        let dx =
            clientX - centerX;

        let dy =
            clientY - centerY;

        const maxDistance =
            rect.width * .32;

        const distance =
            Math.hypot(dx, dy);

        if (distance > maxDistance) {

            dx =
                (dx / distance) *
                maxDistance;

            dy =
                (dy / distance) *
                maxDistance;
        }

        state.joystick.x =
            dx / maxDistance;

        state.joystick.y =
            dy / maxDistance;

        joystickStick.style.transform =
            `translate(${dx}px, ${dy}px)`;
    }


    function resetJoystick() {

        state.joystick.active = false;

        state.joystick.x = 0;
        state.joystick.y = 0;

        joystickStick.style.transform =
            "translate(0,0)";
    }


    joystick.addEventListener(
        "pointerdown",
        event => {

            event.preventDefault();

            tryStartMusic();

            joystickPointer =
                event.pointerId;

            state.joystick.active = true;

            joystick.setPointerCapture(
                event.pointerId
            );

            updateJoystick(
                event.clientX,
                event.clientY
            );
        }
    );


    joystick.addEventListener(
        "pointermove",
        event => {

            if (
                !state.joystick.active ||
                event.pointerId !== joystickPointer
            ) {
                return;
            }

            updateJoystick(
                event.clientX,
                event.clientY
            );
        }
    );


    joystick.addEventListener(
        "pointerup",
        resetJoystick
    );


    joystick.addEventListener(
        "pointercancel",
        resetJoystick
    );
}


/* =========================================================
   MOBILE BUTTONS
========================================================= */

const attackButton =
    document.querySelector(".attackButton");

const dashButton =
    document.querySelector(".dashButton");

const skillButton =
    document.querySelector(".skillButton");


function bindMobileButton(
    element,
    callback
) {

    if (!element) return;

    element.addEventListener(
        "pointerdown",
        event => {

            event.preventDefault();

            tryStartMusic();

            callback();
        }
    );
}


bindMobileButton(
    attackButton,
    attack
);

bindMobileButton(
    dashButton,
    dash
);

bindMobileButton(
    skillButton,
    skill
);


/* =========================================================
   WORLD CLICK
========================================================= */

document.addEventListener(
    "pointerdown",
    () => {

        tryStartMusic();

    },
    {
        passive: true
    }
);


/* =========================================================
   LIGHTNING
========================================================= */

let lightningTimer = 0;

function randomLightning(delta) {

    lightningTimer += delta;

    if (lightningTimer < 5000) {
        return;
    }

    lightningTimer = 0;

    if (!lightningLayer) return;

    lightningLayer.classList.remove("flash");

    void lightningLayer.offsetWidth;

    lightningLayer.classList.add("flash");

    setTimeout(() => {

        if (
            Math.random() > .4
        ) {

            playSound(
                audio.magic,
                .15
            );
        }

    }, 180);
}


/* =========================================================
   SCREEN SHAKE
========================================================= */

let shakeTimer = 0;

function shakeScreen(duration = 250) {

    if (!gameWorld) return;

    gameWorld.animate(
        [
            {
                transform: "translate(0,0)"
            },
            {
                transform: "translate(-3px,2px)"
            },
            {
                transform: "translate(3px,-2px)"
            },
            {
                transform: "translate(-2px,-1px)"
            },
            {
                transform: "translate(2px,1px)"
            },
            {
                transform: "translate(0,0)"
            }
        ],
        {
            duration,
            easing: "ease-out"
        }
    );
}


/* =========================================================
   SPIRIT REGENERATION
========================================================= */

let spiritTimer = 0;

function regenerateSpirit(delta) {

    if (
        state.paused ||
        state.gameOver ||
        state.victory
    ) {
        return;
    }

    spiritTimer += delta;

    if (spiritTimer >= 1000) {

        spiritTimer = 0;

        state.spirit =
            Math.min(
                CONFIG.maxSpirit,
                state.spirit + 2
            );

        updateHUD();
    }
}


/* =========================================================
   GAME LOOP
========================================================= */

function gameLoop(timestamp) {

    if (!state.started) {
        return;
    }

    const delta =
        state.lastTime
            ? Math.min(
                timestamp -
                state.lastTime,
                40
            )
            : 16;

    state.lastTime = timestamp;

    if (
        !state.paused &&
        !state.gameOver &&
        !state.victory
    ) {

        movePlayer(delta);

        updateEnemies(delta);

        checkPortal();

        regenerateSpirit(delta);

        randomLightning(delta);
    }

    requestAnimationFrame(gameLoop);
}


/* =========================================================
   RESPONSIVE RESIZE
========================================================= */

window.addEventListener(
    "resize",
    () => {

        updatePlayerPosition();

    }
);


/* =========================================================
   PAGE VISIBILITY
========================================================= */

document.addEventListener(
    "visibilitychange",
    () => {

        if (
            document.hidden &&
            state.started &&
            !state.gameOver &&
            !state.victory &&
            !state.paused
        ) {

            togglePause();
        }
    }
);


/* =========================================================
   INITIALIZE
========================================================= */

runLoading();
