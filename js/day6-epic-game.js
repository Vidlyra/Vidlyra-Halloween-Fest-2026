/* =========================================================
   VIDLYRA HALLOWEEN FEST 2026
   DAY 6 — HAUNTED MANSION
   EPIC GAME JAVASCRIPT
========================================================= */

"use strict";


/* =========================================================
   CONFIGURATION
========================================================= */

const CONFIG = {

    totalCrystals: 6,

    totalEnemies: 4,

    playerSpeed: 3.6,

    dashSpeed: 10,

    dashDuration: 180,

    attackCooldown: 420,

    attackRange: 115,

    enemyDamage: 10,

    bossDamage: 15,

    playerMaxHealth: 100,

    playerMaxSpirit: 100,

    bossMaxHealth: 100,

    crystalScore: 250,

    enemyScore: 500,

    bossScore: 2500,

    victoryPage: "day7-video.html",

    retryPage: "day6-epic-game.html",

    loadingDuration: 2200

};


/* =========================================================
   GAME STATE
========================================================= */

const state = {

    running: false,

    paused: false,

    gameOver: false,

    victory: false,

    loading: true,

    crystals: 0,

    enemiesDefeated: 0,

    score: 0,

    health: CONFIG.playerMaxHealth,

    spirit: CONFIG.playerMaxSpirit,

    bossHealth: CONFIG.bossMaxHealth,

    bossActive: false,

    bossDefeated: false,

    attacking: false,

    dashing: false,

    lastAttack: 0,

    lastDash: 0,

    lastEnemyAttack: 0,

    keys: {},

    joystick: {

        active: false,

        x: 0,

        y: 0

    },

    player: {

        x: 0,

        y: 0,

        width: 70,

        height: 90,

        facing: 1

    },

    enemies: [],

    crystalsData: [],

    boss: {

        x: 0,

        y: 0

    }

};


/* =========================================================
   DOM REFERENCES
========================================================= */

const $ = id => document.getElementById(id);

const game =
    $("game");

const loadingScreen =
    $("loadingScreen");

const loadingFill =
    $("loadingFill");

const loadingPercent =
    $("loadingPercent");

const loadingMessage =
    $("loadingMessage");

const gameWorld =
    $("gameWorld");

const playerContainer =
    $("playerContainer");

const player =
    $("player");

const slashEffect =
    $("slashEffect");

const dashTrail =
    $("dashTrail");

const crystalLayer =
    $("crystalLayer");

const enemyLayer =
    $("enemyLayer");

const boss =
    $("boss");

const bossHUD =
    $("bossHUD");

const bossHealthInner =
    $("bossHealthInner");

const day7Portal =
    $("day7Portal");

const lightningLayer =
    $("lightningLayer");

const interactionPrompt =
    $("interactionPrompt");

const notificationContainer =
    $("notificationContainer");

const missionPopup =
    $("missionPopup");

const mobileControls =
    $("mobileControls");

const pauseMenu =
    $("pauseMenu");

const victoryScreen =
    $("victoryScreen");

const gameOverScreen =
    $("gameOverScreen");


/* =========================================================
   AUDIO
========================================================= */

const audio = {

    bg: new Audio(
        "assets/images/day6/day6-main-theme.mp3"
    ),

    victory: new Audio(
        "assets/images/day6/day6-victory-theme.mp3"
    ),

    loss: new Audio(
        "assets/images/day6/loss.mp3"
    ),

    slash: new Audio(
        "assets/images/day6/slash.mp3"
    ),

    dash: new Audio(
        "assets/images/day6/slice.mp3"
    ),

    boss: new Audio(
        "assets/images/day6/boss-battle-theme.mp3"
    ),

    crystal: new Audio(
        "assets/images/day6/slice.mp3"
    ),

    portal: new Audio(
        "assets/images/day6/sanctuary-theme.mp3"
    )

};

audio.bg.loop = true;

audio.boss.loop = true;

audio.bg.volume = 0.42;

audio.boss.volume = 0.5;

audio.victory.volume = 0.65;

audio.loss.volume = 0.6;

audio.slash.volume = 0.55;

audio.dash.volume = 0.5;

audio.crystal.volume = 0.5;

audio.portal.volume = 0.55;


/* =========================================================
   AUDIO HELPER
========================================================= */

function playSound(sound) {

    if (!sound) return;

    try {

        sound.currentTime = 0;

        const promise =
            sound.play();

        if (promise &&
            typeof promise.catch === "function") {

            promise.catch(() => {});

        }

    } catch (error) {}

}


function stopSound(sound) {

    if (!sound) return;

    try {

        sound.pause();

        sound.currentTime = 0;

    } catch (error) {}

}


/* =========================================================
   LOADING
========================================================= */

function startLoading() {

    let progress = 0;

    const messages = [

        "Entering the haunted mansion...",

        "The halls remember every visitor...",

        "Something is moving in the darkness...",

        "Ancient crystals detected...",

        "The Guardian is awakening..."

    ];

    const interval =
        CONFIG.loadingDuration / 100;

    const timer =
        setInterval(() => {

            progress++;

            if (loadingFill) {

                loadingFill.style.width =
                    `${progress}%`;

            }

            if (loadingPercent) {

                loadingPercent.textContent =
                    `${progress}%`;

            }

            if (loadingMessage) {

                const index =
                    Math.min(
                        messages.length - 1,
                        Math.floor(progress / 20)
                    );

                loadingMessage.textContent =
                    messages[index];

            }

            if (progress >= 100) {

                clearInterval(timer);

                finishLoading();

            }

        }, interval);

}


function finishLoading() {

    state.loading = false;

    if (loadingScreen) {

        loadingScreen.classList.remove("active");

        loadingScreen.style.opacity = "0";

        loadingScreen.style.visibility =
            "hidden";

        loadingScreen.style.pointerEvents =
            "none";

    }

    initializeGame();

}


/* =========================================================
   INITIALIZE
========================================================= */

function initializeGame() {

    resetState();

    setupWorld();

    setupControls();

    setupButtons();

    updateHUD();

    state.running = true;

    requestAnimationFrame(gameLoop);

    setTimeout(() => {

        attemptBackgroundMusic();

    }, 500);

}


/* =========================================================
   RESET STATE
========================================================= */

function resetState() {

    state.running = false;

    state.paused = false;

    state.gameOver = false;

    state.victory = false;

    state.crystals = 0;

    state.enemiesDefeated = 0;

    state.score = 0;

    state.health =
        CONFIG.playerMaxHealth;

    state.spirit =
        CONFIG.playerMaxSpirit;

    state.bossHealth =
        CONFIG.bossMaxHealth;

    state.bossActive = false;

    state.bossDefeated = false;

    state.attacking = false;

    state.dashing = false;

    state.lastAttack = 0;

    state.lastDash = 0;

    state.lastEnemyAttack = 0;

    state.keys = {};

    state.joystick = {

        active: false,

        x: 0,

        y: 0

    };

}


/* =========================================================
   WORLD SETUP
========================================================= */

function setupWorld() {

    createMissingLayers();

    createCrystals();

    createEnemies();

    setupPlayerPosition();

    setupBoss();

    setupPortal();

}


/* =========================================================
   CREATE MISSING LAYERS
========================================================= */

function createMissingLayers() {

    if (!crystalLayer) {

        const layer =
            document.createElement("div");

        layer.id =
            "crystalLayer";

        gameWorld.appendChild(layer);

    }

    if (!enemyLayer) {

        const layer =
            document.createElement("div");

        layer.id =
            "enemyLayer";

        gameWorld.appendChild(layer);

    }

}


/* =========================================================
   GET LAYER
========================================================= */

function getLayer(id) {

    return $(id);

}


/* =========================================================
   CRYSTALS
========================================================= */

function createCrystals() {

    const layer =
        getLayer("crystalLayer");

    if (!layer) return;

    layer.innerHTML = "";

    state.crystalsData = [];

    const positions = [

        { x: 14, y: 43 },

        { x: 28, y: 30 },

        { x: 47, y: 23 },

        { x: 71, y: 34 },

        { x: 86, y: 48 },

        { x: 52, y: 68 }

    ];

    positions.forEach(
        (position, index) => {

            const crystal =
                document.createElement("button");

            crystal.className =
                "crystal";

            crystal.type =
                "button";

            crystal.dataset.index =
                index;

            crystal.setAttribute(
                "aria-label",
                `Ancient Crystal ${index + 1}`
            );

            crystal.style.left =
                `${position.x}%`;

            crystal.style.top =
                `${position.y}%`;

            crystal.addEventListener(
                "click",
                () => {

                    collectCrystal(
                        index,
                        crystal
                    );

                }
            );

            layer.appendChild(crystal);

            state.crystalsData.push({

                element: crystal,

                collected: false,

                x: position.x,

                y: position.y

            });

        }
    );

}


/* =========================================================
   COLLECT CRYSTAL
========================================================= */

function collectCrystal(index, element) {

    if (state.paused ||
        state.gameOver ||
        state.victory) return;

    const crystal =
        state.crystalsData[index];

    if (!crystal ||
        crystal.collected) return;

    crystal.collected = true;

    state.crystals++;

    state.score +=
        CONFIG.crystalScore;

    element.classList.add(
        "collected"
    );

    playSound(audio.crystal);

    showNotification(
        `Ancient Crystal ${state.crystals} / ${CONFIG.totalCrystals}`,
        "orange"
    );

    completeMission(
        1,
        state.crystals >=
        CONFIG.totalCrystals
    );

    updateHUD();

    if (
        state.crystals >=
        CONFIG.totalCrystals
    ) {

        showNotification(
            "All ancient crystals collected.",
            "orange"
        );

        if (
            state.enemiesDefeated >=
            CONFIG.totalEnemies
        ) {

            activateBoss();

        }

    }

}


/* =========================================================
   ENEMIES
========================================================= */

function createEnemies() {

    const layer =
        getLayer("enemyLayer");

    if (!layer) return;

    layer.innerHTML = "";

    state.enemies = [];

    const positions = [

        { x: 21, y: 63 },

        { x: 37, y: 55 },

        { x: 73, y: 61 },

        { x: 86, y: 66 }

    ];

    positions.forEach(
        (position, index) => {

            const enemy =
                document.createElement("div");

            enemy.className =
                "enemy";

            enemy.dataset.index =
                index;

            enemy.style.left =
                `${position.x}%`;

            enemy.style.bottom =
                `${100 - position.y}%`;

            layer.appendChild(enemy);

            state.enemies.push({

                element: enemy,

                x: position.x,

                y: position.y,

                alive: true,

                speed:
                    0.3 +
                    Math.random() * 0.35,

                attackTimer:
                    Math.random() * 1200

            });

        }
    );

}


/* =========================================================
   SETUP PLAYER
========================================================= */

function setupPlayerPosition() {

    state.player.x = 50;

    state.player.y = 73;

    state.player.facing = 1;

    updatePlayerPosition();

}


/* =========================================================
   PLAYER POSITION
========================================================= */

function updatePlayerPosition() {

    if (!playerContainer)
        return;

    playerContainer.style.left =
        `${state.player.x}%`;

    playerContainer.style.bottom =
        `${100 - state.player.y}%`;

    if (player) {

        player.style.transform =
            `scaleX(${state.player.facing})`;

    }

}


/* =========================================================
   KEYBOARD CONTROLS
========================================================= */

function setupControls() {

    window.addEventListener(
        "keydown",
        event => {

            state.keys[
                event.key.toLowerCase()
            ] = true;

            if (
                event.key === " "
            ) {

                event.preventDefault();

                performAttack();

            }

            if (
                event.key.toLowerCase() === "e"
            ) {

                interact();

            }

            if (
                event.key.toLowerCase() === "q"
            ) {

                performSkill();

            }

            if (
                event.key.toLowerCase() === "shift"
            ) {

                performDash();

            }

            if (
                event.key === "Escape"
            ) {

                togglePause();

            }

        }
    );


    window.addEventListener(
        "keyup",
        event => {

            state.keys[
                event.key.toLowerCase()
            ] = false;

        }
    );


    setupJoystick();

    setupMobileButtons();

}


/* =========================================================
   MOBILE BUTTONS
========================================================= */

function setupMobileButtons() {

    const attack =
        $("attackButton");

    const dash =
        $("dashButton");

    const skill =
        $("skillButton");


    if (attack) {

        attack.addEventListener(
            "pointerdown",
            event => {

                event.preventDefault();

                performAttack();

            }
        );

    }


    if (dash) {

        dash.addEventListener(
            "pointerdown",
            event => {

                event.preventDefault();

                performDash();

            }
        );

    }


    if (skill) {

        skill.addEventListener(
            "pointerdown",
            event => {

                event.preventDefault();

                performSkill();

            }
        );

    }

}


/* =========================================================
   JOYSTICK
========================================================= */

function setupJoystick() {

    const joystick =
        document.querySelector(
            ".joystick"
        );

    const stick =
        document.querySelector(
            ".joystickStick"
        );

    if (!joystick ||
        !stick) return;


    const maxDistance = 28;


    function moveJoystick(event) {

        const rect =
            joystick.getBoundingClientRect();

        const centerX =
            rect.left +
            rect.width / 2;

        const centerY =
            rect.top +
            rect.height / 2;

        let dx =
            event.clientX -
            centerX;

        let dy =
            event.clientY -
            centerY;

        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );

        if (
            distance >
            maxDistance
        ) {

            dx =
                dx / distance *
                maxDistance;

            dy =
                dy / distance *
                maxDistance;

        }

        state.joystick.x =
            dx / maxDistance;

        state.joystick.y =
            dy / maxDistance;

        stick.style.transform =
            `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;

    }


    joystick.addEventListener(
        "pointerdown",
        event => {

            state.joystick.active =
                true;

            joystick.setPointerCapture(
                event.pointerId
            );

            moveJoystick(event);

        }
    );


    joystick.addEventListener(
        "pointermove",
        event => {

            if (
                !state.joystick.active
            ) return;

            moveJoystick(event);

        }
    );


    function releaseJoystick() {

        state.joystick.active =
            false;

        state.joystick.x = 0;

        state.joystick.y = 0;

        stick.style.transform =
            "translate(-50%, -50%)";

    }


    joystick.addEventListener(
        "pointerup",
        releaseJoystick
    );

    joystick.addEventListener(
        "pointercancel",
        releaseJoystick
    );

}


/* =========================================================
   BUTTON SETUP
========================================================= */

function setupButtons() {

    const pause =
        $("pauseButton");

    const resume =
        $("resumeButton");

    const retry =
        $("retryButton");

    const continueButton =
        $("continueButton");


    if (pause) {

        pause.addEventListener(
            "click",
            togglePause
        );

    }


    if (resume) {

        resume.addEventListener(
            "click",
            togglePause
        );

    }


    if (retry) {

        retry.addEventListener(
            "click",
            () => {

                window.location.href =
                    CONFIG.retryPage;

            }
        );

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


    if (day7Portal) {

        day7Portal.addEventListener(
            "click",
            () => {

                if (
                    state.bossDefeated
                ) {

                    window.location.href =
                        CONFIG.victoryPage;

                }

            }
        );

    }

}


/* =========================================================
   PLAYER MOVEMENT
========================================================= */

function updatePlayerMovement() {

    if (
        state.paused ||
        state.gameOver ||
        state.victory
    ) return;


    let dx = 0;

    let dy = 0;


    if (
        state.keys["w"] ||
        state.keys["arrowup"]
    ) {

        dy -= 1;

    }

    if (
        state.keys["s"] ||
        state.keys["arrowdown"]
    ) {

        dy += 1;

    }

    if (
        state.keys["a"] ||
        state.keys["arrowleft"]
    ) {

        dx -= 1;

    }

    if (
        state.keys["d"] ||
        state.keys["arrowright"]
    ) {

        dx += 1;

    }


    if (
        state.joystick.active
    ) {

        dx =
            state.joystick.x;

        dy =
            state.joystick.y;

    }


    if (
        dx === 0 &&
        dy === 0
    ) return;


    const magnitude =
        Math.sqrt(
            dx * dx +
            dy * dy
        );


    if (
        magnitude > 1
    ) {

        dx /= magnitude;

        dy /= magnitude;

    }


    let speed =
        CONFIG.playerSpeed;


    if (
        state.dashing
    ) {

        speed =
            CONFIG.dashSpeed;

    }


    state.player.x +=
        dx * speed * 0.08;

    state.player.y +=
        dy * speed * 0.08;


    state.player.x =
        clamp(
            state.player.x,
            7,
            93
        );

    state.player.y =
        clamp(
            state.player.y,
            20,
            78
        );


    if (dx !== 0) {

        state.player.facing =
            dx > 0 ? 1 : -1;

    }


    updatePlayerPosition();

}


/* =========================================================
   ATTACK
========================================================= */

function performAttack() {

    if (
        state.paused ||
        state.gameOver ||
        state.victory
    ) return;


    const now =
        performance.now();


    if (
        now -
        state.lastAttack <
        CONFIG.attackCooldown
    ) return;


    state.lastAttack =
        now;

    state.attacking =
        true;


    if (player) {

        player.classList.add(
            "attacking"
        );

    }


    if (slashEffect) {

        slashEffect.classList.remove(
            "active"
        );

        void slashEffect.offsetWidth;

        slashEffect.classList.add(
            "active"
        );

    }


    playSound(audio.slash);


    checkAttackHits();


    setTimeout(
        () => {

            state.attacking =
                false;

            if (player) {

                player.classList.remove(
                    "attacking"
                );

            }

        },
        180
    );

}


/* =========================================================
   ATTACK HIT DETECTION
========================================================= */

function checkAttackHits() {

    state.enemies.forEach(
        enemy => {

            if (!enemy.alive)
                return;


            const distance =
                distanceBetween(
                    state.player.x,
                    state.player.y,
                    enemy.x,
                    enemy.y
                );


            if (
                distance <
                CONFIG.attackRange /
                7
            ) {

                defeatEnemy(
                    enemy
                );

            }

        }
    );


    if (
        state.bossActive &&
        !state.bossDefeated
    ) {

        const bossDistance =
            distanceBetween(
                state.player.x,
                state.player.y,
                state.boss.x,
                state.boss.y
            );


        if (
            bossDistance <
            18
        ) {

            damageBoss(20);

        }

    }

}


/* =========================================================
   DEFEAT ENEMY
========================================================= */

function defeatEnemy(enemy) {

    if (!enemy.alive)
        return;


    enemy.alive =
        false;

    state.enemiesDefeated++;

    state.score +=
        CONFIG.enemyScore;


    if (enemy.element) {

        enemy.element.classList.add(
            "defeated"
        );

    }


    showNotification(
        "Ancient Guardian defeated.",
        "orange"
    );


    completeMission(
        2,
        state.enemiesDefeated >=
        CONFIG.totalEnemies
    );


    updateHUD();


    if (
        state.enemiesDefeated >=
        CONFIG.totalEnemies &&
        state.crystals >=
        CONFIG.totalCrystals
    ) {

        activateBoss();

    }

}


/* =========================================================
   BOSS SETUP
========================================================= */

function setupBoss() {

    state.boss = {

        x: 50,

        y: 28

    };

    state.bossHealth =
        CONFIG.bossMaxHealth;

    state.bossActive =
        false;

    state.bossDefeated =
        false;

    if (boss) {

        boss.classList.remove(
            "active"
        );

    }

    if (bossHUD) {

        bossHUD.classList.remove(
            "active"
        );

    }

}


/* =========================================================
   ACTIVATE BOSS
========================================================= */

function activateBoss() {

    if (
        state.bossActive ||
        state.bossDefeated
    ) return;


    state.bossActive =
        true;

    state.bossHealth =
        CONFIG.bossMaxHealth;


    if (boss) {

        boss.classList.add(
            "active"
        );

    }


    if (bossHUD) {

        bossHUD.classList.add(
            "active"
        );

    }


    if (bossHealthInner) {

        bossHealthInner.style.width =
            "100%";

    }


    stopSound(audio.bg);

    playSound(audio.boss);

    playSound(audio.portal);


    showNotification(
        "THE HAUNTED MANSION GUARDIAN HAS AWAKENED.",
        "boss"
    );


    setTimeout(
        () => {

            showNotification(
                "Defeat the Guardian to open the path to Day 7.",
                "orange"
            );

        },
        1300
    );

}


/* =========================================================
   BOSS DAMAGE
========================================================= */

function damageBoss(amount) {

    if (
        !state.bossActive ||
        state.bossDefeated
    ) return;


    state.bossHealth -=
        amount;


    state.bossHealth =
        Math.max(
            0,
            state.bossHealth
        );


    if (bossHealthInner) {

        bossHealthInner.style.width =
            `${state.bossHealth}%`;

    }


    triggerShake();


    if (
        state.bossHealth <= 0
    ) {

        defeatBoss();

    }

}


/* =========================================================
   DEFEAT BOSS
========================================================= */

function defeatBoss() {

    if (
        state.bossDefeated
    ) return;


    state.bossDefeated =
        true;

    state.bossActive =
        false;

    state.score +=
        CONFIG.bossScore;


    if (boss) {

        boss.classList.remove(
            "active"
        );

        boss.style.opacity =
            "0";

    }


    if (bossHUD) {

        bossHUD.classList.remove(
            "active"
        );

    }


    stopSound(audio.boss);

    playSound(audio.victory);

    completeMission(
        3,
        true
    );

    updateHUD();


    activatePortal();


    showNotification(
        "THE HAUNTED MANSION HAS FALLEN SILENT.",
        "victory"
    );


    setTimeout(
        () => {

            showVictory();

        },
        1600
    );

}


/* =========================================================
   PORTAL
========================================================= */

function setupPortal() {

    if (!day7Portal)
        return;

    day7Portal.classList.remove(
        "active"
    );

    day7Portal.innerHTML = `
        <div class="portalOuter"></div>
        <div class="portalInner"></div>
        <div class="portalLabel">
            PATH TO DAY 7
        </div>
    `;

}


function activatePortal() {

    if (!day7Portal)
        return;

    day7Portal.classList.add(
        "active"
    );

}


/* =========================================================
   SKILL
========================================================= */

function performSkill() {

    if (
        state.paused ||
        state.gameOver ||
        state.victory
    ) return;


    if (
        state.spirit < 25
    ) {

        showNotification(
            "Not enough Spirit.",
            "warning"
        );

        return;

    }


    state.spirit -= 25;


    showNotification(
        "Spirit Burst activated.",
        "magic"
    );


    triggerShake();


    state.enemies.forEach(
        enemy => {

            if (!enemy.alive)
                return;


            const distance =
                distanceBetween(
                    state.player.x,
                    state.player.y,
                    enemy.x,
                    enemy.y
                );


            if (
                distance < 22
            ) {

                defeatEnemy(
                    enemy
                );

            }

        }
    );


    if (
        state.bossActive &&
        !state.bossDefeated
    ) {

        const distance =
            distanceBetween(
                state.player.x,
                state.player.y,
                state.boss.x,
                state.boss.y
            );


        if (
            distance < 25
        ) {

            damageBoss(35);

        }

    }


    updateHUD();

}


/* =========================================================
   DASH
========================================================= */

function performDash() {

    if (
        state.paused ||
        state.gameOver ||
        state.victory ||
        state.dashing
    ) return;


    const now =
        performance.now();


    if (
        now -
        state.lastDash <
        900
    ) return;


    if (
        state.spirit < 15
    ) {

        showNotification(
            "Not enough Spirit to dash.",
            "warning"
        );

        return;

    }


    state.lastDash =
        now;

    state.spirit -= 15;

    state.dashing =
        true;


    if (player) {

        player.classList.add(
            "dashing"
        );

    }


    if (dashTrail) {

        dashTrail.classList.remove(
            "active"
        );

        void dashTrail.offsetWidth;

        dashTrail.classList.add(
            "active"
        );

    }


    playSound(audio.dash);


    setTimeout(
        () => {

            state.dashing =
                false;

            if (player) {

                player.classList.remove(
                    "dashing"
                );

            }

        },
        CONFIG.dashDuration
    );


    updateHUD();

}


/* =========================================================
   ENEMY AI
========================================================= */

function updateEnemies() {

    if (
        state.paused ||
        state.gameOver ||
        state.victory
    ) return;


    const now =
        performance.now();


    state.enemies.forEach(
        enemy => {

            if (!enemy.alive)
                return;


            const dx =
                state.player.x -
                enemy.x;

            const dy =
                state.player.y -
                enemy.y;


            const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );


            if (
                distance > 8 &&
                distance < 38
            ) {

                enemy.x +=
                    Math.sign(dx) *
                    enemy.speed *
                    0.08;

                enemy.y +=
                    Math.sign(dy) *
                    enemy.speed *
                    0.05;


                enemy.x =
                    clamp(
                        enemy.x,
                        5,
                        95
                    );

                enemy.y =
                    clamp(
                        enemy.y,
                        20,
                        80
                    );


                if (enemy.element) {

                    enemy.element.style.left =
                        `${enemy.x}%`;

                    enemy.element.style.bottom =
                        `${100 - enemy.y}%`;

                }

            }


            if (
                distance <= 7 &&
                now -
                state.lastEnemyAttack >
                750
            ) {

                state.lastEnemyAttack =
                    now;

                damagePlayer(
                    CONFIG.enemyDamage
                );

            }

        }
    );

}


/* =========================================================
   BOSS AI
========================================================= */

function updateBoss() {

    if (
        !state.bossActive ||
        state.bossDefeated ||
        state.paused
    ) return;


    const dx =
        state.player.x -
        state.boss.x;

    const dy =
        state.player.y -
        state.boss.y;

    const distance =
        Math.sqrt(
            dx * dx +
            dy * dy
        );


    if (
        distance > 10
    ) {

        state.boss.x +=
            Math.sign(dx) *
            0.04;

        state.boss.y +=
            Math.sign(dy) *
            0.025;

    }


    if (boss) {

        boss.style.left =
            `${state.boss.x}%`;

        boss.style.top =
            `${state.boss.y}%`;

    }


    if (
        distance < 13
    ) {

        const now =
            performance.now();

        if (
            now -
            state.lastEnemyAttack >
            900
        ) {

            state.lastEnemyAttack =
                now;

            damagePlayer(
                CONFIG.bossDamage
            );

        }

    }

}


/* =========================================================
   PLAYER DAMAGE
========================================================= */

function damagePlayer(amount) {

    if (
        state.gameOver ||
        state.victory
    ) return;


    state.health -=
        amount;


    state.health =
        Math.max(
            0,
            state.health
        );


    triggerShake();

    updateHUD();


    if (
        state.health <= 0
    ) {

        showGameOver();

    }

}


/* =========================================================
   SPIRIT REGENERATION
========================================================= */

function regenerateSpirit() {

    if (
        state.paused ||
        state.gameOver ||
        state.victory
    ) return;


    state.spirit +=
        0.04;


    state.spirit =
        Math.min(
            CONFIG.playerMaxSpirit,
            state.spirit
        );

}


/* =========================================================
   INTERACTION
========================================================= */

function interact() {

    if (
        state.paused ||
        state.gameOver ||
        state.victory
    ) return;


    if (
        state.bossDefeated
    ) {

        const distance =
            distanceBetween(
                state.player.x,
                state.player.y,
                state.boss.x,
                state.boss.y
            );


        if (
            distance < 30
        ) {

            window.location.href =
                CONFIG.victoryPage;

            return;

        }

    }


    let nearestCrystal =
        null;

    let nearestDistance =
        Infinity;


    state.crystalsData.forEach(
        crystal => {

            if (crystal.collected)
                return;


            const distance =
                distanceBetween(
                    state.player.x,
                    state.player.y,
                    crystal.x,
                    crystal.y
                );


            if (
                distance <
                nearestDistance
            ) {

                nearestDistance =
                    distance;

                nearestCrystal =
                    crystal;

            }

        }
    );


    if (
        nearestCrystal &&
        nearestDistance < 10
    ) {

        const index =
            state.crystalsData.indexOf(
                nearestCrystal
            );

        collectCrystal(
            index,
            nearestCrystal.element
        );

    }

}


/* =========================================================
   INTERACTION PROMPT
========================================================= */

function updateInteractionPrompt() {

    if (!interactionPrompt)
        return;


    if (
        state.paused ||
        state.gameOver ||
        state.victory
    ) {

        interactionPrompt.classList.remove(
            "active"
        );

        return;

    }


    if (
        state.bossDefeated
    ) {

        const distance =
            distanceBetween(
                state.player.x,
                state.player.y,
                state.boss.x,
                state.boss.y
            );


        if (
            distance < 30
        ) {

            interactionPrompt.textContent =
                "PRESS E — ENTER DAY 7";

            interactionPrompt.classList.add(
                "active"
            );

            return;

        }

    }


    interactionPrompt.classList.remove(
        "active"
    );

}


/* =========================================================
   HUD
========================================================= */

function updateHUD() {

    const healthFill =
        $("healthFill");

    const spiritFill =
        $("spiritFill");

    const healthText =
        $("healthText");

    const spiritText =
        $("spiritText");

    const crystalCounter =
        $("crystalCounter");

    const scoreCounter =
        $("scoreCounter");


    if (healthFill) {

        healthFill.style.width =
            `${state.health}%`;

    }


    if (spiritFill) {

        spiritFill.style.width =
            `${state.spirit}%`;

    }


    if (healthText) {

        healthText.textContent =
            `${Math.ceil(state.health)} / ${CONFIG.playerMaxHealth}`;

    }


    if (spiritText) {

        spiritText.textContent =
            `${Math.ceil(state.spirit)} / ${CONFIG.playerMaxSpirit}`;

    }


    if (crystalCounter) {

        crystalCounter.textContent =
            `${state.crystals} / ${CONFIG.totalCrystals}`;

    }


    if (scoreCounter) {

        scoreCounter.textContent =
            String(state.score)
                .padStart(6, "0");

    }

}


/* =========================================================
   MISSIONS
========================================================= */

function completeMission(
    missionNumber,
    complete
) {

    const mission =
        $(`mission${missionNumber}`);

    if (!mission)
        return;


    if (complete) {

        mission.classList.add(
            "complete"
        );

        const icon =
            mission.querySelector(
                ".missionIcon"
            );

        if (icon) {

            icon.textContent =
                "✓";

        }

    }

}


/* =========================================================
   PAUSE
========================================================= */

function togglePause() {

    if (
        state.gameOver ||
        state.victory ||
        state.loading
    ) return;


    state.paused =
        !state.paused;


    if (pauseMenu) {

        pauseMenu.classList.toggle(
            "active",
            state.paused
        );

    }


    if (state.paused) {

        stopSound(
            state.bossActive
                ? audio.boss
                : audio.bg
        );

    } else {

        attemptBackgroundMusic();

    }

}


/* =========================================================
   VICTORY
========================================================= */

function showVictory() {

    if (state.victory)
        return;


    state.victory =
        true;

    state.running =
        false;


    if (victoryScreen) {

        victoryScreen.classList.add(
            "active"
        );

    }

}


/* =========================================================
   GAME OVER
========================================================= */

function showGameOver() {

    if (state.gameOver)
        return;


    state.gameOver =
        true;

    state.running =
        false;


    stopSound(audio.bg);

    stopSound(audio.boss);

    playSound(audio.loss);


    if (gameOverScreen) {

        gameOverScreen.classList.add(
            "active"
        );

    }

}


/* =========================================================
   NOTIFICATION
========================================================= */

function showNotification(
    message,
    type = "orange"
) {

    if (!notificationContainer)
        return;


    const notification =
        document.createElement("div");

    notification.className =
        "notification";

    notification.textContent =
        message;


    if (type === "boss") {

        notification.style.borderLeftColor =
            "#c878ff";

    }

    if (type === "magic") {

        notification.style.borderLeftColor =
            "#b56cff";

    }

    if (type === "warning") {

        notification.style.borderLeftColor =
            "#ff4a35";

    }

    if (type === "victory") {

        notification.style.borderLeftColor =
            "#ffb347";

    }


    notificationContainer.appendChild(
        notification
    );


    setTimeout(
        () => {

            notification.style.opacity =
                "0";

            notification.style.transform =
                "translateX(20px)";

            setTimeout(
                () => {

                    notification.remove();

                },
                300
            );

        },
        2600
    );

}


/* =========================================================
   LIGHTNING
========================================================= */

function randomLightning() {

    if (
        state.paused ||
        state.loading
    ) return;


    if (
        Math.random() > 0.72
    ) {

        triggerLightning();

    }

}


function triggerLightning() {

    if (!lightningLayer)
        return;


    lightningLayer.classList.remove(
        "flash"
    );

    void lightningLayer.offsetWidth;

    lightningLayer.classList.add(
        "flash"
    );

    triggerShake();

}


/* =========================================================
   SCREEN SHAKE
========================================================= */

function triggerShake() {

    if (!game)
        return;


    game.classList.remove(
        "shake"
    );

    void game.offsetWidth;

    game.classList.add(
        "shake"
    );


    setTimeout(
        () => {

            game.classList.remove(
                "shake"
            );

        },
        260
    );

}


/* =========================================================
   BACKGROUND MUSIC
========================================================= */

function attemptBackgroundMusic() {

    if (
        state.paused ||
        state.gameOver ||
        state.victory ||
        state.bossActive
    ) return;


    try {

        const promise =
            audio.bg.play();

        if (
            promise &&
            typeof promise.catch ===
            "function"
        ) {

            promise.catch(() => {

                showNotification(
                    "Tap the game once to enable music.",
                    "warning"
                );

            });

        }

    } catch (error) {}

}


document.addEventListener(
    "pointerdown",
    () => {

        if (
            !state.loading &&
            !state.gameOver &&
            !state.victory
        ) {

            if (state.bossActive) {

                try {

                    audio.boss.play()
                        .catch(() => {});

                } catch (error) {}

            } else {

                attemptBackgroundMusic();

            }

        }

    },
    {
        once: false
    }
);


/* =========================================================
   GAME LOOP
========================================================= */

let lastFrame =
    performance.now();


function gameLoop(timestamp) {

    const delta =
        timestamp -
        lastFrame;

    lastFrame =
        timestamp;


    if (
        state.running &&
        !state.paused &&
        !state.gameOver &&
        !state.victory
    ) {

        updatePlayerMovement();

        updateEnemies();

        updateBoss();

        regenerateSpirit();

        updateInteractionPrompt();

    }


    requestAnimationFrame(
        gameLoop
    );

}


/* =========================================================
   RANDOM EVENTS
========================================================= */

setInterval(
    () => {

        if (
            state.running &&
            !state.paused &&
            !state.gameOver &&
            !state.victory
        ) {

            randomLightning();

        }

    },
    4200
);


/* =========================================================
   HELPERS
========================================================= */

function clamp(
    value,
    min,
    max
) {

    return Math.min(
        max,
        Math.max(
            min,
            value
        )
    );

}


function distanceBetween(
    x1,
    y1,
    x2,
    y2
) {

    const dx =
        x1 - x2;

    const dy =
        y1 - y2;

    return Math.sqrt(
        dx * dx +
        dy * dy
    );

}


/* =========================================================
   VISIBILITY / FOCUS
========================================================= */

document.addEventListener(
    "visibilitychange",
    () => {

        if (
            document.hidden &&
            state.running &&
            !state.paused
        ) {

            togglePause();

        }

    }
);


/* =========================================================
   PREVENT UNWANTED BROWSER ACTIONS
========================================================= */

window.addEventListener(
    "keydown",
    event => {

        const blocked =
            [
                " ",
                "ArrowUp",
                "ArrowDown",
                "ArrowLeft",
                "ArrowRight"
            ];

        if (
            blocked.includes(
                event.key
            )
        ) {

            event.preventDefault();

        }

    },
    {
        passive: false
    }
);


/* =========================================================
   START
========================================================= */

if (loadingScreen) {

    loadingScreen.classList.add(
        "active"
    );

}

startLoading();
