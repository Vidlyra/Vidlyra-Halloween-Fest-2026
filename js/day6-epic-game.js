"use strict";

/* =========================================================
   VIDLYRA HALLOWEEN FEST 2026
   DAY 6 — THE HAUNTED MANSION
   SMOOTH GAME ENGINE
========================================================= */


/* =========================================================
   CONFIG
========================================================= */

const CONFIG = {

    totalCrystals: 6,
    totalEnemies: 4,

    /*
       KEEPING THE EXISTING SPEED FEEL.
       Do not change these unless you specifically
       want to change gameplay speed.
    */
    playerSpeed: 0.055,
    dashDistance: 9,

    maxHealth: 100,
    maxSpirit: 100,

    enemyHealth: 2,
    bossHealth: 25,

    crystalScore: 500,
    enemyScore: 1000,
    bossScore: 5000,

    victoryPage: "day7-video.html",
    retryPage: "day6-epic-game.html"
};


/* =========================================================
   DOM
========================================================= */

const $ = id =>
    document.getElementById(id);

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

const crystalLayer =
    $("crystalLayer");

const enemyLayer =
    $("enemyLayer");

const boss =
    $("boss");

const bossHUD =
    $("bossHUD");

const bossHealthFill =
    $("bossHealthFill");

const day7Portal =
    $("day7Portal");

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

const mission1 =
    $("mission1");

const mission2 =
    $("mission2");

const mission3 =
    $("mission3");

const notificationContainer =
    $("notificationContainer");

const interactionPrompt =
    $("interactionPrompt");

const pauseButton =
    $("pauseButton");

const pauseMenu =
    $("pauseMenu");

const resumeButton =
    $("resumeButton");

const victoryScreen =
    $("victoryScreen");

const gameOverScreen =
    $("gameOverScreen");

const retryButton =
    $("retryButton");

const continueButton =
    $("continueButton");

const finalScore =
    $("finalScore");

const slashEffect =
    $("slashEffect");

const dashTrail =
    $("dashTrail");

const lightningLayer =
    $("lightningLayer");

const joystick =
    $("joystick");

const joystickStick =
    $("joystickStick");

const attackButton =
    $("attackButton");

const dashButton =
    $("dashButton");

const skillButton =
    $("skillButton");


/* =========================================================
   AUDIO
========================================================= */

const audio = {

    main:
        $("audioMain"),

    guardian:
        $("audioGuardian"),

    boss:
        $("audioBoss"),

    victory:
        $("audioVictory"),

    loss:
        $("audioLoss"),

    slash:
        $("audioSlash"),

    dash:
        $("audioDash"),

    hurt:
        $("audioHurt"),

    footstep:
        $("audioFootstep"),

    collect:
        $("audioCollect"),

    crystal:
        $("audioCrystal"),

    magic:
        $("audioMagic"),

    spell:
        $("audioSpell"),

    portal:
        $("audioPortal"),

    gate:
        $("audioGate"),

    roar:
        $("audioRoar")
};


audio.main.volume = .42;
audio.guardian.volume = .25;
audio.boss.volume = .48;

audio.victory.volume = .65;
audio.loss.volume = .6;

audio.slash.volume = .6;
audio.dash.volume = .55;
audio.hurt.volume = .6;
audio.collect.volume = .65;
audio.crystal.volume = .45;
audio.magic.volume = .45;
audio.spell.volume = .55;
audio.portal.volume = .55;
audio.gate.volume = .5;
audio.roar.volume = .65;

audio.main.loop = true;
audio.guardian.loop = true;
audio.boss.loop = true;


/* =========================================================
   AUDIO FUNCTIONS
========================================================= */

function playAudio(sound, volume = null) {

    if (!sound) {
        return;
    }

    try {

        if (volume !== null) {
            sound.volume = volume;
        }

        sound.currentTime = 0;

        const promise =
            sound.play();

        if (promise) {
            promise.catch(() => {});
        }

    } catch (error) {}
}


function stopAudio(sound) {

    if (!sound) {
        return;
    }

    try {

        sound.pause();
        sound.currentTime = 0;

    } catch (error) {}
}


function startMusic() {

    if (
        state.paused ||
        state.gameOver ||
        state.victory
    ) {
        return;
    }

    if (
        state.bossActive
    ) {

        stopAudio(audio.main);
        stopAudio(audio.guardian);

        if (audio.boss.paused) {
            playAudio(audio.boss);
        }

        return;
    }

    if (
        state.enemiesDefeated > 0
    ) {

        stopAudio(audio.main);

        if (audio.guardian.paused) {
            playAudio(audio.guardian);
        }

        return;
    }

    if (audio.main.paused) {
        playAudio(audio.main);
    }
}


document.addEventListener(
    "pointerdown",
    startMusic,
    {
        once: false,
        passive: true
    }
);


/* =========================================================
   GAME STATE
========================================================= */

const state = {

    started: false,
    paused: false,
    gameOver: false,
    victory: false,

    health:
        CONFIG.maxHealth,

    spirit:
        CONFIG.maxSpirit,

    crystals: 0,

    enemiesDefeated: 0,

    score: 0,

    bossActive: false,

    bossHealth:
        CONFIG.bossHealth,

    attacking: false,

    dashing: false,

    hurt: false,

    player: {

        x: 50,
        y: 68

    },

    keys: {

        up: false,
        down: false,
        left: false,
        right: false,
        interact: false

    },

    joystick: {

        x: 0,
        y: 0,
        active: false

    },

    lastFrame: 0,

    spiritTimer: 0,

    enemyTimer: 0,

    lightningTimer: 0,

    footstepTimer: 0

};


/* =========================================================
   LOADING
========================================================= */

const loadingTexts = [

    "Opening the mansion gates...",

    "Awakening the ancient spirits...",

    "Lighting the cursed halls...",

    "Summoning the mansion soldiers...",

    "Preparing the Ancient Guardian...",

    "The Haunted Mansion is waiting..."

];

let loadingProgress = 0;
let loadingIndex = 0;

function loadingSequence() {

    const timer =
        setInterval(() => {

            loadingProgress +=
                Math.random() * 8 + 5;

            if (
                loadingProgress >= 100
            ) {

                loadingProgress = 100;

                clearInterval(timer);

                loadingFill.style.width =
                    "100%";

                loadingPercent.textContent =
                    "100%";

                loadingMessage.textContent =
                    "ENTER THE HAUNTED MANSION";

                setTimeout(
                    startGame,
                    400
                );

                return;
            }

            loadingFill.style.width =
                `${loadingProgress}%`;

            loadingPercent.textContent =
                `${Math.floor(loadingProgress)}%`;

            if (
                loadingProgress >
                (loadingIndex + 1) * 16
            ) {

                loadingIndex =
                    Math.min(
                        loadingIndex + 1,
                        loadingTexts.length - 1
                    );

                loadingMessage.textContent =
                    loadingTexts[loadingIndex];
            }

        }, 80);
}


/* =========================================================
   START
========================================================= */

function startGame() {

    if (state.started) {
        return;
    }

    state.started = true;

    loadingScreen.classList.add(
        "hidden"
    );

    createCrystals();

    createEnemies();

    updatePlayerPosition();

    updateHUD();

    requestAnimationFrame(
        gameLoop
    );

    startMusic();
}


/* =========================================================
   CREATE CRYSTALS
========================================================= */

function createCrystals() {

    if (!crystalLayer) {
        return;
    }

    crystalLayer.innerHTML = "";

    const positions = [

        [12, 66],

        [27, 45],

        [43, 70],

        [60, 48],

        [77, 67],

        [89, 40]

    ];

    positions.forEach(
        (position, index) => {

            const crystal =
                document.createElement(
                    "div"
                );

            crystal.className =
                "crystal";

            crystal.dataset.index =
                index;

            crystal.style.left =
                `${position[0]}%`;

            crystal.style.top =
                `${position[1]}%`;

            crystalLayer.appendChild(
                crystal
            );

        }
    );
}


/* =========================================================
   CREATE MANSION SOLDIERS
========================================================= */

function createEnemies() {

    if (!enemyLayer) {
        return;
    }

    enemyLayer.innerHTML = "";

    const positions = [

        [21, 65],

        [37, 48],

        [66, 68],

        [81, 48]

    ];

    positions.forEach(
        (position, index) => {

            const enemy =
                document.createElement(
                    "div"
                );

            enemy.className =
                "enemy";

            enemy.dataset.index =
                index;

            enemy.dataset.health =
                CONFIG.enemyHealth;

            enemy.style.left =
                `${position[0]}%`;

            enemy.style.top =
                `${position[1]}%`;

            enemyLayer.appendChild(
                enemy
            );

        }
    );
}


/* =========================================================
   PLAYER POSITION
========================================================= */

function updatePlayerPosition() {

    if (!playerContainer) {
        return;
    }

    state.player.x =
        Math.max(
            5,
            Math.min(
                95,
                state.player.x
            )
        );

    state.player.y =
        Math.max(
            28,
            Math.min(
                84,
                state.player.y
            )
        );

    playerContainer.style.left =
        `${state.player.x}%`;

    playerContainer.style.bottom =
        `${100 - state.player.y}%`;
}


/* =========================================================
   MOVEMENT
========================================================= */

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

    if (state.keys.left) {
        x -= 1;
    }

    if (state.keys.right) {
        x += 1;
    }

    if (state.keys.up) {
        y -= 1;
    }

    if (state.keys.down) {
        y += 1;
    }

    x += state.joystick.x;
    y += state.joystick.y;

    const length =
        Math.hypot(x, y);

    if (length > 1) {

        x /= length;
        y /= length;
    }

    const moving =
        Math.abs(x) > .01 ||
        Math.abs(y) > .01;

    if (moving) {

        state.player.x +=
            x *
            CONFIG.playerSpeed *
            delta;

        state.player.y +=
            y *
            CONFIG.playerSpeed *
            delta;

        updatePlayerPosition();

        if (
            !state.attacking &&
            !state.dashing &&
            !state.hurt
        ) {

            setPlayerAnimation(
                "walk"
            );

            state.footstepTimer +=
                delta;

            if (
                state.footstepTimer > 350
            ) {

                state.footstepTimer = 0;

                playAudio(
                    audio.footstep,
                    .12
                );
            }

        }

    } else if (
        !state.attacking &&
        !state.dashing &&
        !state.hurt
    ) {

        setPlayerAnimation(
            "idle"
        );

        state.footstepTimer = 0;
    }
}


/* =========================================================
   PLAYER ANIMATION
========================================================= */

function setPlayerAnimation(
    animation
) {

    if (!player) {
        return;
    }

    player.classList.remove(
        "idle",
        "walk",
        "attack",
        "dash",
        "hurt"
    );

    player.classList.add(
        animation
    );
}


/* =========================================================
   CRYSTAL COLLECTION
========================================================= */

function checkCrystalCollection() {

    if (
        state.paused ||
        state.gameOver ||
        state.victory
    ) {
        return;
    }

    const crystals =
        document.querySelectorAll(
            ".crystal:not(.collected)"
        );

    const playerRect =
        playerContainer.getBoundingClientRect();

    const playerX =
        playerRect.left +
        playerRect.width / 2;

    const playerY =
        playerRect.top +
        playerRect.height / 2;

    crystals.forEach(
        crystal => {

            const rect =
                crystal.getBoundingClientRect();

            const crystalX =
                rect.left +
                rect.width / 2;

            const crystalY =
                rect.top +
                rect.height / 2;

            const distance =
                Math.hypot(
                    crystalX - playerX,
                    crystalY - playerY
                );

            if (
                distance <= 75
            ) {

                collectCrystal(
                    crystal
                );
            }

        }
    );
}


function collectCrystal(
    crystal
) {

    if (!crystal) {
        return;
    }

    if (
        crystal.classList.contains(
            "collected"
        )
    ) {
        return;
    }

    crystal.classList.add(
        "collected"
    );

    state.crystals++;

    state.score +=
        CONFIG.crystalScore;

    state.spirit =
        Math.min(
            CONFIG.maxSpirit,
            state.spirit + 12
        );

    playAudio(
        audio.collect,
        .65
    );

    playAudio(
        audio.crystal,
        .45
    );

    showNotification(
        `ANCIENT CRYSTAL ${state.crystals}/${CONFIG.totalCrystals}`
    );

    updateHUD();

    if (
        state.crystals >=
        CONFIG.totalCrystals
    ) {

        completeMission(
            mission1
        );

        showNotification(
            "ALL 6 ANCIENT CRYSTALS COLLECTED"
        );

        playAudio(
            audio.magic,
            .45
        );

        checkBossUnlock();
    }
}


/* =========================================================
   ATTACK
========================================================= */

function attack() {

    if (
        state.paused ||
        state.gameOver ||
        state.victory ||
        state.attacking ||
        state.dashing
    ) {
        return;
    }

    state.attacking = true;

    setPlayerAnimation(
        "attack"
    );

    if (slashEffect) {

        slashEffect.classList.remove(
            "active"
        );

        void slashEffect.offsetWidth;

        slashEffect.classList.add(
            "active"
        );
    }

    playAudio(
        audio.slash,
        .6
    );

    setTimeout(
        () => {

            damageNearbyEnemies();

            if (
                state.bossActive
            ) {

                damageBossIfClose();
            }

        },
        80
    );

    setTimeout(
        () => {

            state.attacking = false;

            if (!state.hurt) {

                setPlayerAnimation(
                    "idle"
                );
            }

        },
        220
    );
}


/* =========================================================
   ENEMY DAMAGE
========================================================= */

function damageNearbyEnemies() {

    const enemies =
        document.querySelectorAll(
            ".enemy:not(.defeated)"
        );

    const playerRect =
        playerContainer.getBoundingClientRect();

    const playerX =
        playerRect.left +
        playerRect.width / 2;

    const playerY =
        playerRect.top +
        playerRect.height / 2;

    enemies.forEach(
        enemy => {

            const rect =
                enemy.getBoundingClientRect();

            const enemyX =
                rect.left +
                rect.width / 2;

            const enemyY =
                rect.top +
                rect.height / 2;

            const distance =
                Math.hypot(
                    enemyX - playerX,
                    enemyY - playerY
                );

            if (
                distance <= 145
            ) {

                let health =
                    Number(
                        enemy.dataset.health
                    );

                health--;

                enemy.dataset.health =
                    health;

                enemy.animate(
                    [
                        {
                            transform:
                                "translate(-50%,-50%) scale(1)"
                        },
                        {
                            transform:
                                "translate(-50%,-50%) scale(1.12)"
                        },
                        {
                            transform:
                                "translate(-50%,-50%) scale(1)"
                        }
                    ],
                    {
                        duration: 140
                    }
                );

                if (
                    health <= 0
                ) {

                    enemy.classList.add(
                        "defeated"
                    );

                    state.enemiesDefeated++;

                    state.score +=
                        CONFIG.enemyScore;

                    playAudio(
                        audio.slash,
                        .35
                    );

                    showNotification(
                        "MANSION SOLDIER DEFEATED"
                    );

                    updateHUD();

                    if (
                        state.enemiesDefeated >=
                        CONFIG.totalEnemies
                    ) {

                        completeMission(
                            mission2
                        );

                        showNotification(
                            "THE MANSION SOLDIERS HAVE FALLEN"
                        );

                        checkBossUnlock();
                    }
                }
            }
        }
    );
}


/* =========================================================
   BOSS UNLOCK
========================================================= */

function checkBossUnlock() {

    if (
        state.crystals >=
            CONFIG.totalCrystals &&
        state.enemiesDefeated >=
            CONFIG.totalEnemies &&
        !state.bossActive
    ) {

        activateBoss();
    }
}


/* =========================================================
   BOSS
========================================================= */

function activateBoss() {

    state.bossActive = true;

    state.bossHealth =
        CONFIG.bossHealth;

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

    bossHealthFill.style.width =
        "100%";

    stopAudio(
        audio.main
    );

    stopAudio(
        audio.guardian
    );

    playAudio(
        audio.boss,
        .48
    );

    playAudio(
        audio.roar,
        .65
    );

    showNotification(
        "THE ANCIENT GUARDIAN AWAKENS"
    );

    shakeScreen(
        450
    );
}


function damageBossIfClose() {

    if (
        !state.bossActive
    ) {
        return;
    }

    const bossRect =
        boss.getBoundingClientRect();

    const playerRect =
        playerContainer.getBoundingClientRect();

    const bossX =
        bossRect.left +
        bossRect.width / 2;

    const bossY =
        bossRect.top +
        bossRect.height / 2;

    const playerX =
        playerRect.left +
        playerRect.width / 2;

    const playerY =
        playerRect.top +
        playerRect.height / 2;

    const distance =
        Math.hypot(
            bossX - playerX,
            bossY - playerY
        );

    if (
        distance <= 240
    ) {

        damageBoss();
    }
}


function damageBoss() {

    state.bossHealth--;

    if (
        state.bossHealth < 0
    ) {
        state.bossHealth = 0;
    }

    const percent =
        (
            state.bossHealth /
            CONFIG.bossHealth
        ) * 100;

    bossHealthFill.style.width =
        `${percent}%`;

    if (boss) {

        boss.animate(
            [
                {
                    transform:
                        "translate(-50%,-50%) scale(1)"
                },
                {
                    transform:
                        "translate(-48%,-50%) scale(.97)"
                },
                {
                    transform:
                        "translate(-52%,-50%) scale(.97)"
                },
                {
                    transform:
                        "translate(-50%,-50%) scale(1)"
                }
            ],
            {
                duration: 160
            }
        );
    }

    if (
        state.bossHealth <= 0
    ) {

        defeatBoss();
    }
}


function defeatBoss() {

    state.bossActive = false;

    state.score +=
        CONFIG.bossScore;

    completeMission(
        mission3
    );

    stopAudio(
        audio.boss
    );

    playAudio(
        audio.victory,
        .65
    );

    showNotification(
        "THE ANCIENT GUARDIAN HAS FALLEN"
    );

    if (boss) {

        boss.animate(
            [
                {
                    opacity: 1,
                    transform:
                        "translate(-50%,-50%) scale(1)"
                },
                {
                    opacity: .7,
                    transform:
                        "translate(-50%,-50%) scale(1.15)"
                },
                {
                    opacity: 0,
                    transform:
                        "translate(-50%,-50%) scale(1.35)"
                }
            ],
            {
                duration: 900,
                fill: "forwards"
            }
        );

        setTimeout(
            () => {

                boss.classList.remove(
                    "active"
                );

            },
            900
        );
    }

    if (bossHUD) {

        bossHUD.classList.remove(
            "active"
        );
    }

    setTimeout(
        openPortal,
        1000
    );
}


/* =========================================================
   PORTAL
========================================================= */

function openPortal() {

    if (!day7Portal) {
        return;
    }

    day7Portal.classList.add(
        "active"
    );

    playAudio(
        audio.portal,
        .55
    );

    playAudio(
        audio.gate,
        .45
    );

    showNotification(
        "THE PATH TO DAY 7 IS OPEN"
    );
}


function checkPortal() {

    if (
        !day7Portal ||
        !day7Portal.classList.contains(
            "active"
        )
    ) {
        return;
    }

    const portalRect =
        day7Portal.getBoundingClientRect();

    const playerRect =
        playerContainer.getBoundingClientRect();

    const portalX =
        portalRect.left +
        portalRect.width / 2;

    const portalY =
        portalRect.top +
        portalRect.height / 2;

    const playerX =
        playerRect.left +
        playerRect.width / 2;

    const playerY =
        playerRect.top +
        playerRect.height / 2;

    const distance =
        Math.hypot(
            portalX - playerX,
            portalY - playerY
        );

    if (
        distance <= 130
    ) {

        interactionPrompt.classList.add(
            "active"
        );

        if (
            state.keys.interact
        ) {

            state.keys.interact = false;

            winGame();
        }

    } else {

        interactionPrompt.classList.remove(
            "active"
        );
    }
}


/* =========================================================
   PLAYER DAMAGE
========================================================= */

function damagePlayer(
    amount
) {

    if (
        state.hurt ||
        state.gameOver ||
        state.victory
    ) {
        return;
    }

    state.hurt = true;

    state.health -= amount;

    state.health =
        Math.max(
            0,
            state.health
        );

    setPlayerAnimation(
        "hurt"
    );

    playAudio(
        audio.hurt,
        .6
    );

    shakeScreen(
        220
    );

    updateHUD();

    setTimeout(
        () => {

            state.hurt = false;

            if (
                !state.gameOver
            ) {

                setPlayerAnimation(
                    "idle"
                );
            }

        },
        400
    );

    if (
        state.health <= 0
    ) {

        loseGame();
    }
}


/* =========================================================
   ENEMY AI
========================================================= */

function updateEnemies(
    delta
) {

    if (
        state.paused ||
        state.gameOver ||
        state.victory
    ) {
        return;
    }

    state.enemyTimer += delta;

    if (
        state.enemyTimer < 900
    ) {
        return;
    }

    state.enemyTimer = 0;

    const enemies =
        document.querySelectorAll(
            ".enemy:not(.defeated)"
        );

    const playerRect =
        playerContainer.getBoundingClientRect();

    const playerX =
        playerRect.left +
        playerRect.width / 2;

    const playerY =
        playerRect.top +
        playerRect.height / 2;

    enemies.forEach(
        enemy => {

            const rect =
                enemy.getBoundingClientRect();

            const enemyX =
                rect.left +
                rect.width / 2;

            const enemyY =
                rect.top +
                rect.height / 2;

            const distance =
                Math.hypot(
                    enemyX - playerX,
                    enemyY - playerY
                );

            if (
                distance < 115
            ) {

                damagePlayer(
                    7
                );
            }
        }
    );


    if (
        state.bossActive
    ) {

        const bossRect =
            boss.getBoundingClientRect();

        const bossX =
            bossRect.left +
            bossRect.width / 2;

        const bossY =
            bossRect.top +
            bossRect.height / 2;

        const distance =
            Math.hypot(
                bossX - playerX,
                bossY - playerY
            );

        if (
            distance < 190
        ) {

            damagePlayer(
                10
            );
        }
    }
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

    if (
        state.spirit < 25
    ) {

        showNotification(
            "NOT ENOUGH SPIRIT"
        );

        return;
    }

    state.spirit -= 25;

    playAudio(
        audio.spell,
        .55
    );

    playAudio(
        audio.magic,
        .45
    );

    showNotification(
        "SPIRIT BURST"
    );

    damageNearbyEnemies();

    if (
        state.bossActive
    ) {

        damageBoss();
        damageBoss();
    }

    updateHUD();
}


/* =========================================================
   DASH
========================================================= */

function dash() {

    if (
        state.paused ||
        state.gameOver ||
        state.victory ||
        state.dashing
    ) {
        return;
    }

    state.dashing = true;

    setPlayerAnimation(
        "dash"
    );

    if (dashTrail) {

        dashTrail.classList.remove(
            "active"
        );

        void dashTrail.offsetWidth;

        dashTrail.classList.add(
            "active"
        );
    }

    playAudio(
        audio.dash,
        .55
    );

    let direction = 1;

    if (
        state.keys.left ||
        state.joystick.x < -.15
    ) {

        direction = -1;
    }

    if (
        state.keys.right ||
        state.joystick.x > .15
    ) {

        direction = 1;
    }

    state.player.x +=
        direction *
        CONFIG.dashDistance;

    updatePlayerPosition();

    setTimeout(
        () => {

            state.dashing = false;

            if (
                !state.hurt
            ) {

                setPlayerAnimation(
                    "idle"
                );
            }

        },
        300
    );
}


/* =========================================================
   HUD
========================================================= */

function updateHUD() {

    const healthPercent =
        (
            state.health /
            CONFIG.maxHealth
        ) * 100;

    const spiritPercent =
        (
            state.spirit /
            CONFIG.maxSpirit
        ) * 100;

    healthFill.style.width =
        `${healthPercent}%`;

    spiritFill.style.width =
        `${spiritPercent}%`;

    healthText.textContent =
        `${Math.ceil(state.health)} / ${CONFIG.maxHealth}`;

    spiritText.textContent =
        `${Math.ceil(state.spirit)} / ${CONFIG.maxSpirit}`;

    crystalCounter.textContent =
        `${state.crystals} / ${CONFIG.totalCrystals}`;

    scoreCounter.textContent =
        String(state.score)
            .padStart(6, "0");
}


/* =========================================================
   MISSION
========================================================= */

function completeMission(
    element
) {

    if (!element) {
        return;
    }

    element.classList.add(
        "complete"
    );

    const span =
        element.querySelector(
            "span"
        );

    if (span) {
        span.textContent = "✓";
    }
}


/* =========================================================
   NOTIFICATIONS
========================================================= */

function showNotification(
    message
) {

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
        message;

    notificationContainer.appendChild(
        notification
    );

    setTimeout(
        () => {

            notification.remove();

        },
        2800
    );
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

    if (
        state.paused
    ) {

        pauseMenu.classList.add(
            "active"
        );

        stopAudio(
            audio.main
        );

        stopAudio(
            audio.guardian
        );

        stopAudio(
            audio.boss
        );

    } else {

        pauseMenu.classList.remove(
            "active"
        );

        startMusic();
    }
}


pauseButton.addEventListener(
    "click",
    togglePause
);


resumeButton.addEventListener(
    "click",
    togglePause
);


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

    stopAudio(
        audio.main
    );

    stopAudio(
        audio.guardian
    );

    stopAudio(
        audio.boss
    );

    playAudio(
        audio.victory,
        .65
    );

    finalScore.textContent =
        `FINAL SCORE ${String(state.score).padStart(6,"0")}`;

    victoryScreen.classList.add(
        "active"
    );
}


continueButton.addEventListener(
    "click",
    () => {

        window.location.href =
            CONFIG.victoryPage;

    }
);


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

    stopAudio(
        audio.main
    );

    stopAudio(
        audio.guardian
    );

    stopAudio(
        audio.boss
    );

    playAudio(
        audio.loss,
        .6
    );

    gameOverScreen.classList.add(
        "active"
    );
}


retryButton.addEventListener(
    "click",
    () => {

        window.location.href =
            CONFIG.retryPage;

    }
);


/* =========================================================
   KEYBOARD
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        startMusic();

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

        if (
            key === "w" ||
            key === "arrowup"
        ) {

            state.keys.up = true;
        }

        if (
            key === "s" ||
            key === "arrowdown"
        ) {

            state.keys.down = true;
        }

        if (
            key === "a" ||
            key === "arrowleft"
        ) {

            state.keys.left = true;
        }

        if (
            key === "d" ||
            key === "arrowright"
        ) {

            state.keys.right = true;
        }

        if (
            key === "e"
        ) {

            state.keys.interact = true;
        }

        if (
            key === " " ||
            key === "j"
        ) {

            attack();
        }

        if (
            key === "shift"
        ) {

            dash();
        }

        if (
            key === "q" ||
            key === "k"
        ) {

            skill();
        }

        if (
            key === "escape"
        ) {

            togglePause();
        }

    }
);


document.addEventListener(
    "keyup",
    event => {

        const key =
            event.key.toLowerCase();

        if (
            key === "w" ||
            key === "arrowup"
        ) {

            state.keys.up = false;
        }

        if (
            key === "s" ||
            key === "arrowdown"
        ) {

            state.keys.down = false;
        }

        if (
            key === "a" ||
            key === "arrowleft"
        ) {

            state.keys.left = false;
        }

        if (
            key === "d" ||
            key === "arrowright"
        ) {

            state.keys.right = false;
        }

    }
);


/* =========================================================
   JOYSTICK
========================================================= */

if (
    joystick &&
    joystickStick
) {

    let pointerId = null;

    function updateJoystick(
        clientX,
        clientY
    ) {

        const rect =
            joystick.getBoundingClientRect();

        const centerX =
            rect.left +
            rect.width / 2;

        const centerY =
            rect.top +
            rect.height / 2;

        let dx =
            clientX - centerX;

        let dy =
            clientY - centerY;

        const max =
            rect.width * .32;

        const distance =
            Math.hypot(
                dx,
                dy
            );

        if (
            distance > max
        ) {

            dx =
                dx / distance * max;

            dy =
                dy / distance * max;
        }

        state.joystick.x =
            dx / max;

        state.joystick.y =
            dy / max;

        joystickStick.style.transform =
            `translate(${dx}px,${dy}px)`;
    }


    function resetJoystick() {

        state.joystick.active =
            false;

        pointerId = null;

        state.joystick.x = 0;
        state.joystick.y = 0;

        joystickStick.style.transform =
            "translate(0,0)";
    }


    joystick.addEventListener(
        "pointerdown",
        event => {

            event.preventDefault();

            startMusic();

            pointerId =
                event.pointerId;

            state.joystick.active =
                true;

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
                event.pointerId !== pointerId
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
   MOBILE ACTION BUTTONS
========================================================= */

function bindButton(
    button,
    callback
) {

    if (!button) {
        return;
    }

    button.addEventListener(
        "pointerdown",
        event => {

            event.preventDefault();

            startMusic();

            callback();

        }
    );
}


bindButton(
    attackButton,
    attack
);

bindButton(
    dashButton,
    dash
);

bindButton(
    skillButton,
    skill
);


/* =========================================================
   LIGHTNING
========================================================= */

function updateLightning(
    delta
) {

    state.lightningTimer +=
        delta;

    if (
        state.lightningTimer <
        5200
    ) {
        return;
    }

    state.lightningTimer = 0;

    lightningLayer.classList.remove(
        "flash"
    );

    void lightningLayer.offsetWidth;

    lightningLayer.classList.add(
        "flash"
    );
}


/* =========================================================
   SPIRIT REGENERATION
========================================================= */

function regenerateSpirit(
    delta
) {

    if (
        state.paused ||
        state.gameOver ||
        state.victory
    ) {
        return;
    }

    state.spiritTimer +=
        delta;

    if (
        state.spiritTimer >= 1000
    ) {

        state.spiritTimer = 0;

        state.spirit =
            Math.min(
                CONFIG.maxSpirit,
                state.spirit + 2
            );

        updateHUD();
    }
}


/* =========================================================
   SCREEN SHAKE
========================================================= */

function shakeScreen(
    duration = 220
) {

    if (!gameWorld) {
        return;
    }

    gameWorld.animate(
        [
            {
                transform:
                    "translate3d(0,0,0)"
            },

            {
                transform:
                    "translate3d(-3px,2px,0)"
            },

            {
                transform:
                    "translate3d(3px,-2px,0)"
            },

            {
                transform:
                    "translate3d(-2px,-1px,0)"
            },

            {
                transform:
                    "translate3d(2px,1px,0)"
            },

            {
                transform:
                    "translate3d(0,0,0)"
            }
        ],
        {
            duration,
            easing: "ease-out"
        }
    );
}


/* =========================================================
   GAME LOOP
========================================================= */

function gameLoop(
    timestamp
) {

    if (
        !state.started
    ) {
        return;
    }

    const delta =
        state.lastFrame
            ? Math.min(
                timestamp -
                state.lastFrame,
                40
            )
            : 16;

    state.lastFrame =
        timestamp;

    if (
        !state.paused &&
        !state.gameOver &&
        !state.victory
    ) {

        movePlayer(
            delta
        );

        checkCrystalCollection();

        updateEnemies(
            delta
        );

        checkPortal();

        regenerateSpirit(
            delta
        );

        updateLightning(
            delta
        );
    }

    requestAnimationFrame(
        gameLoop
    );
}


/* =========================================================
   VISIBILITY
========================================================= */

document.addEventListener(
    "visibilitychange",
    () => {

        if (
            document.hidden &&
            state.started &&
            !state.paused &&
            !state.gameOver &&
            !state.victory
        ) {

            togglePause();
        }
    }
);


/* =========================================================
   RESIZE
========================================================= */

window.addEventListener(
    "resize",
    updatePlayerPosition
);


/* =========================================================
   INITIALIZE
========================================================= */

loadingSequence();
