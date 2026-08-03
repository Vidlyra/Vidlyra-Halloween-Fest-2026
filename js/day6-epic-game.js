"use strict";

/* =========================================================
   VIDLYRA HALLOWEEN FEST 2026
   DAY 6 — THE WITCH'S DOMAIN
   EPIC GAME ENGINE
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       HELPERS
    ===================================================== */

    const $ = (selector) => document.querySelector(selector);
    const $$ = (selector) => document.querySelectorAll(selector);

    const clamp = (value, min, max) =>
        Math.max(min, Math.min(max, value));

    const distance = (x1, y1, x2, y2) =>
        Math.hypot(x2 - x1, y2 - y1);

    const random = (min, max) =>
        Math.random() * (max - min) + min;

    function playSound(element, volume = 1) {
        if (!element) return;

        try {
            element.volume = volume;
            element.currentTime = 0;

            const promise = element.play();

            if (promise && promise.catch) {
                promise.catch(() => {});
            }
        } catch (error) {
            /* Audio is optional. */
        }
    }


    /* =====================================================
       DOM
       ===================================================== */

    const loadingScreen = $("#loadingScreen");
    const loadingFill = $("#loadingFill");
    const loadingPercent = $("#loadingPercent");
    const loadingMessage = $("#loadingMessage");

    const gameWorld = $("#gameWorld");
    const playerContainer = $("#playerContainer");
    const player = $("#player");

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

    const day7Portal = $("#day7Portal");

    const interactionPrompt = $("#interactionPrompt");
    const notificationContainer = $("#notificationContainer");

    const victoryScreen = $("#victoryScreen");
    const continueButton = $("#continueButton");

    const gameOverScreen = $("#gameOverScreen");
    const retryButton = $("#retryButton");

    const pauseMenu = $("#pauseMenu");
    const pauseButton = $("#pauseButton");
    const resumeButton = $("#resumeButton");

    const mobileControls = $("#mobileControls");
    const joystickBase = $("#joystickBase");
    const joystickStick = $("#joystickStick");

    const attackButton = $("#attackButton");
    const dashButton = $("#dashButton");
    const skillButton = $("#skillButton");

    const slashEffect = $("#slashEffect");
    const dashTrail = $("#dashTrail");

    const bgMusic = $("#bgMusic");
    const victorySound = $("#victorySound");
    const gameOverSound = $("#gameOverSound");
    const swordSlash = $("#swordSlash");
    const heroDash = $("#heroDash");
    const bossRoar = $("#bossRoar");
    const crystalSound = $("#crystalSound");
    const portalSound = $("#portalSound");


    /* =====================================================
       CONFIG
       ===================================================== */

    const CONFIG = {

        WORLD_WIDTH: 5000,
        WORLD_HEIGHT: 2600,

        PLAYER_SPEED: 6,

        DASH_SPEED: 18,
        DASH_DURATION: 220,
        DASH_COOLDOWN: 800,

        MAX_HEALTH: 100,
        MAX_SPIRIT: 100,

        ATTACK_DAMAGE: 28,
        ATTACK_RANGE: 155,
        ATTACK_COOLDOWN: 300,

        SKILL_DAMAGE: 70,
        SKILL_RANGE: 300,
        SKILL_COST: 30,
        SKILL_COOLDOWN: 8000,

        TOTAL_CRYSTALS: 6,

        ENEMY_COUNT: 4,

        ENEMY_HEALTH: 100,
        ENEMY_DAMAGE: 8,
        ENEMY_SPEED: 1.6,

        BOSS_HEALTH: 1200,
        BOSS_DAMAGE: 18,
        BOSS_SPEED: 2.0,

        BOSS_ATTACK_RANGE: 130,
        BOSS_ATTACK_COOLDOWN: 1300,

        PORTAL_RADIUS: 150,

        NEXT_LEVEL_URL: "day7-video.html"

    };


    /* =====================================================
       GAME STATE
       ===================================================== */

    const GAME = {

        started: false,

        running: false,

        paused: false,

        victory: false,

        gameOver: false,

        transitioning: false,

        score: 0,

        crystals: 0,

        kills: 0,

        mobile: false

    };


    /* =====================================================
       PLAYER
       ===================================================== */

    const PLAYER = {

        x: 600,

        y: 1800,

        health: CONFIG.MAX_HEALTH,

        spirit: CONFIG.MAX_SPIRIT,

        stamina: 100,

        facing: 1,

        attacking: false,

        invincible: false,

        moving: false,

        velocityX: 0,

        velocityY: 0

    };


    /* =====================================================
       INPUT
       ===================================================== */

    const INPUT = {

        left: false,

        right: false,

        up: false,

        down: false

    };


    /* =====================================================
       DASH
       ===================================================== */

    const DASH = {

        active: false,

        timer: 0,

        cooldown: 0

    };


    /* =====================================================
       ATTACK
       ===================================================== */

    const ATTACK = {

        cooldown: 0,

        combo: 0

    };


    /* =====================================================
       SKILL
       ===================================================== */

    const SKILL = {

        cooldown: 0

    };


    /* =====================================================
       JOYSTICK
       ===================================================== */

    const JOYSTICK = {

        active: false,

        dx: 0,

        dy: 0,

        startX: 0,

        startY: 0,

        radius: 55

    };


    /* =====================================================
       BOSS
       ===================================================== */

    const BOSS = {

        active: false,

        defeated: false,

        x: 3600,

        y: 900,

        health: CONFIG.BOSS_HEALTH,

        maxHealth: CONFIG.BOSS_HEALTH,

        attackTimer: 0

    };


    /* =====================================================
       CAMERA
       ===================================================== */

    const CAMERA = {

        x: 0,

        y: 0,

        width: window.innerWidth,

        height: window.innerHeight

    };


    /* =====================================================
       CRYSTALS
       ===================================================== */

    const CRYSTALS = [];


    /* =====================================================
       ENEMIES
       ===================================================== */

    const ENEMIES = [];


    /* =====================================================
       PORTAL
       ===================================================== */

    const PORTAL = {

        active: false,

        x: 0,

        y: 0

    };


    /* =====================================================
       DEVICE
       ===================================================== */

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


    /* =====================================================
       KEYBOARD
       ===================================================== */

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


    /* =====================================================
       MOBILE JOYSTICK
       ===================================================== */

    function joystickPosition(event) {

        const touch = event.touches[0];

        return {

            x: touch.clientX,

            y: touch.clientY

        };

    }


    if (joystickBase) {

        joystickBase.addEventListener(
            "touchstart",
            (event) => {

                event.preventDefault();

                const p =
                    joystickPosition(event);

                JOYSTICK.active = true;

                JOYSTICK.startX = p.x;

                JOYSTICK.startY = p.y;

            },
            { passive: false }
        );


        joystickBase.addEventListener(
            "touchmove",
            (event) => {

                event.preventDefault();

                if (!JOYSTICK.active) return;

                const p =
                    joystickPosition(event);

                let dx =
                    p.x - JOYSTICK.startX;

                let dy =
                    p.y - JOYSTICK.startY;

                const d =
                    Math.hypot(dx, dy);

                if (d > JOYSTICK.radius) {

                    dx =
                        dx / d *
                        JOYSTICK.radius;

                    dy =
                        dy / d *
                        JOYSTICK.radius;

                }

                JOYSTICK.dx = dx;

                JOYSTICK.dy = dy;

                if (joystickStick) {

                    joystickStick.style.transform =
                        `translate(-50%,-50%) translate(${dx}px,${dy}px)`;

                }

            },
            { passive: false }
        );


        const resetJoystick = () => {

            JOYSTICK.active = false;

            JOYSTICK.dx = 0;

            JOYSTICK.dy = 0;

            if (joystickStick) {

                joystickStick.style.transform =
                    "translate(-50%,-50%)";

            }

        };


        joystickBase.addEventListener(
            "touchend",
            resetJoystick
        );

        joystickBase.addEventListener(
            "touchcancel",
            resetJoystick
        );

    }


    /* =====================================================
       MOBILE BUTTONS
       ===================================================== */

    function mobileAction(element, action) {

        if (!element) return;

        element.addEventListener(
            "touchstart",
            (event) => {

                event.preventDefault();

                action();

            },
            { passive: false }
        );

        element.addEventListener(
            "click",
            action
        );

    }


    mobileAction(attackButton, attack);

    mobileAction(dashButton, dash);

    mobileAction(skillButton, spiritSkill);


    /* =====================================================
       LOADING
       ===================================================== */

    function startLoading() {

        let progress = 0;

        const messages = [

            "Entering the Witch's Domain...",

            "Awakening ancient crystals...",

            "Summoning the guardians...",

            "Preparing the cursed sanctuary...",

            "The Ancient Guardian is waiting..."

        ];


        const timer =
            setInterval(() => {

                progress +=
                    random(5, 11);

                if (progress >= 100) {

                    progress = 100;

                }

                if (loadingFill) {

                    loadingFill.style.width =
                        `${progress}%`;

                }

                if (loadingPercent) {

                    loadingPercent.textContent =
                        `${Math.floor(progress)}%`;

                }

                if (loadingMessage) {

                    const index =
                        Math.min(
                            messages.length - 1,
                            Math.floor(
                                progress /
                                100 *
                                messages.length
                            )
                        );

                    loadingMessage.textContent =
                        messages[index];

                }

                if (progress >= 100) {

                    clearInterval(timer);

                    setTimeout(
                        finishLoading,
                        500
                    );

                }

            }, 120);

    }


    function finishLoading() {

        GAME.started = true;

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


        playSound(bgMusic, 0.35);

    }


    /* =====================================================
       CRYSTAL INITIALIZATION
       ===================================================== */

    function initializeCrystals() {

        const elements =
            $$(".crystal");

        elements.forEach(
            (element, index) => {

                const angle =
                    index /
                    elements.length *
                    Math.PI *
                    2;

                const radius = 950;

                const x =
                    2600 +
                    Math.cos(angle) *
                    radius;

                const y =
                    1300 +
                    Math.sin(angle) *
                    radius *
                    0.55;

                const crystal = {

                    element,

                    x: clamp(
                        x,
                        150,
                        CONFIG.WORLD_WIDTH - 150
                    ),

                    y: clamp(
                        y,
                        150,
                        CONFIG.WORLD_HEIGHT - 150
                    ),

                    collected: false,

                    glow: random(
                        0,
                        Math.PI * 2
                    )

                };


                element.style.position =
                    "absolute";

                element.style.left =
                    `${crystal.x}px`;

                element.style.top =
                    `${crystal.y}px`;

                element.style.display =
                    "block";

                element.dataset.index =
                    index + 1;


                element.addEventListener(
                    "click",
                    () => collectCrystal(crystal)
                );


                element.addEventListener(
                    "touchstart",
                    (event) => {

                        event.preventDefault();

                        collectCrystal(crystal);

                    },
                    { passive: false }
                );


                CRYSTALS.push(crystal);

            }
        );

    }


    /* =====================================================
       COLLECT CRYSTAL
       ===================================================== */

    function collectCrystal(crystal) {

        if (
            crystal.collected ||
            GAME.gameOver ||
            GAME.victory
        ) return;

        crystal.collected = true;

        GAME.crystals++;

        GAME.score += 200;

        crystal.element.classList.add(
            "collected"
        );

        crystal.element.style.pointerEvents =
            "none";

        playSound(
            crystalSound,
            0.7
        );

        updateHUD();

        notification(
            `ANCIENT CRYSTAL ${GAME.crystals}/${CONFIG.TOTAL_CRYSTALS}`
        );


        if (mission1) {

            mission1.textContent =
                `◆ Collect all 6 Ancient Crystals — ${GAME.crystals}/6`;

        }


        if (
            GAME.crystals >=
            CONFIG.TOTAL_CRYSTALS
        ) {

            if (mission1) {

                mission1.style.textDecoration =
                    "line-through";

            }

            notification(
                "ALL ANCIENT CRYSTALS RESTORED!"
            );

            checkBossSpawn();

        }

    }


    /* =====================================================
       CRYSTAL PROXIMITY
       ===================================================== */

    function updateCrystalProximity() {

        CRYSTALS.forEach(
            (crystal) => {

                if (crystal.collected)
                    return;

                const d =
                    distance(
                        PLAYER.x,
                        PLAYER.y,
                        crystal.x,
                        crystal.y
                    );

                if (d < 180) {

                    crystal.element.classList.add(
                        "inRange"
                    );

                } else {

                    crystal.element.classList.remove(
                        "inRange"
                    );

                }

                if (d < 95) {

                    collectCrystal(
                        crystal
                    );

                }

            }
        );

    }


    /* =====================================================
       ENEMY INITIALIZATION
       ===================================================== */

    function initializeEnemies() {

        const elements =
            $$(".enemy");

        elements.forEach(
            (element, index) => {

                const angle =
                    index /
                    elements.length *
                    Math.PI *
                    2;

                const radius =
                    700 +
                    index * 100;

                const x =
                    2600 +
                    Math.cos(angle) *
                    radius;

                const y =
                    1250 +
                    Math.sin(angle) *
                    radius *
                    0.65;


                const enemy = {

                    element,

                    x: clamp(
                        x,
                        200,
                        CONFIG.WORLD_WIDTH - 200
                    ),

                    y: clamp(
                        y,
                        200,
                        CONFIG.WORLD_HEIGHT - 200
                    ),

                    health:
                        CONFIG.ENEMY_HEALTH,

                    maxHealth:
                        CONFIG.ENEMY_HEALTH,

                    alive: true,

                    speed:
                        random(
                            1.2,
                            CONFIG.ENEMY_SPEED
                        ),

                    attackTimer:
                        random(
                            300,
                            1000
                        ),

                    lastHit: 0

                };


                element.style.position =
                    "absolute";

                element.style.left =
                    `${enemy.x}px`;

                element.style.top =
                    `${enemy.y}px`;

                element.style.display =
                    "block";


                ENEMIES.push(enemy);

            }
        );

    }


    /* =====================================================
       ENEMY AI
       ===================================================== */

    function updateEnemies(delta) {

        ENEMIES.forEach(
            (enemy) => {

                if (!enemy.alive)
                    return;

                const dx =
                    PLAYER.x - enemy.x;

                const dy =
                    PLAYER.y - enemy.y;

                const d =
                    Math.hypot(dx, dy);


                if (d < 600 && d > 100) {

                    enemy.x +=
                        dx / d *
                        enemy.speed;

                    enemy.y +=
                        dy / d *
                        enemy.speed;

                }


                if (d <= 105) {

                    enemy.attackTimer -=
                        delta;

                    if (
                        enemy.attackTimer <= 0
                    ) {

                        enemy.attackTimer =
                            1400;

                        damagePlayer(
                            CONFIG.ENEMY_DAMAGE
                        );

                    }

                }


                enemy.x =
                    clamp(
                        enemy.x,
                        70,
                        CONFIG.WORLD_WIDTH - 70
                    );

                enemy.y =
                    clamp(
                        enemy.y,
                        70,
                        CONFIG.WORLD_HEIGHT - 70
                    );


                enemy.element.style.left =
                    `${enemy.x}px`;

                enemy.element.style.top =
                    `${enemy.y}px`;

                enemy.element.style.transform =
                    PLAYER.x >
                    enemy.x
                        ? "scaleX(1)"
                        : "scaleX(-1)";

            }
        );

    }


    /* =====================================================
       DAMAGE ENEMY
       ===================================================== */

    function damageEnemies() {

        ENEMIES.forEach(
            (enemy) => {

                if (!enemy.alive)
                    return;

                const d =
                    distance(
                        PLAYER.x,
                        PLAYER.y,
                        enemy.x,
                        enemy.y
                    );

                const facingCorrect =
                    PLAYER.facing > 0
                        ? enemy.x >= PLAYER.x - 20
                        : enemy.x <= PLAYER.x + 20;


                if (
                    d <=
                    CONFIG.ATTACK_RANGE &&
                    facingCorrect
                ) {

                    const now =
                        performance.now();

                    if (
                        now -
                        enemy.lastHit <
                        250
                    ) return;

                    enemy.lastHit =
                        now;

                    enemy.health -=
                        CONFIG.ATTACK_DAMAGE;


                    if (
                        enemy.health <= 0
                    ) {

                        killEnemy(enemy);

                    }

                }

            }
        );

    }


    /* =====================================================
       KILL ENEMY
       ===================================================== */

    function killEnemy(enemy) {

        if (!enemy.alive)
            return;

        enemy.alive = false;

        GAME.kills++;

        GAME.score += 350;

        enemy.element.style.transition =
            "opacity .5s ease, transform .5s ease";

        enemy.element.style.opacity =
            "0";

        enemy.element.style.transform =
            "scale(.2)";

        setTimeout(() => {

            enemy.element.style.display =
                "none";

        }, 550);


        updateHUD();

        notification(
            "+350 — GUARDIAN DEFEATED"
        );


        const alive =
            ENEMIES.filter(
                e => e.alive
            ).length;


        if (alive === 0) {

            if (mission2) {

                mission2.style.textDecoration =
                    "line-through";

            }

            notification(
                "ALL ANCIENT GUARDIANS DEFEATED!"
            );

            checkBossSpawn();

        }

    }


    /* =====================================================
       BOSS SPAWN
       ===================================================== */

    function checkBossSpawn() {

        if (BOSS.active ||
            BOSS.defeated)
            return;

        const crystalsReady =
            GAME.crystals >=
            CONFIG.TOTAL_CRYSTALS;

        const enemiesReady =
            ENEMIES.every(
                enemy => !enemy.alive
            );


        if (
            crystalsReady &&
            enemiesReady
        ) {

            spawnBoss();

        }

    }


    function spawnBoss() {

        BOSS.active = true;

        BOSS.defeated = false;

        BOSS.health =
            CONFIG.BOSS_HEALTH;

        BOSS.x = 3600;

        BOSS.y = 900;

        if (boss) {

            boss.style.display =
                "flex";

            boss.style.left =
                `${BOSS.x}px`;

            boss.style.top =
                `${BOSS.y}px`;

            boss.style.opacity =
                "0";

            boss.style.transform =
                "scale(.3)";

            boss.style.transition =
                "opacity 1s ease, transform 1s ease";


            requestAnimationFrame(() => {

                boss.style.opacity =
                    "1";

                boss.style.transform =
                    "scale(1)";

            });

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
            bossRoar,
            0.8
        );


        notification(
            "THE ANCIENT GUARDIAN HAS AWAKENED!"
        );

    }


    /* =====================================================
       BOSS UPDATE
       ===================================================== */

    function updateBoss(delta) {

        if (
            !BOSS.active ||
            BOSS.defeated
        ) return;


        const dx =
            PLAYER.x - BOSS.x;

        const dy =
            PLAYER.y - BOSS.y;

        const d =
            Math.hypot(dx, dy);


        if (
            d > CONFIG.BOSS_ATTACK_RANGE
        ) {

            BOSS.x +=
                dx / d *
                CONFIG.BOSS_SPEED;

            BOSS.y +=
                dy / d *
                CONFIG.BOSS_SPEED;

        } else {

            BOSS.attackTimer -=
                delta;

            if (
                BOSS.attackTimer <= 0
            ) {

                BOSS.attackTimer =
                    CONFIG.BOSS_ATTACK_COOLDOWN;

                damagePlayer(
                    CONFIG.BOSS_DAMAGE
                );

            }

        }


        BOSS.x =
            clamp(
                BOSS.x,
                100,
                CONFIG.WORLD_WIDTH - 100
            );

        BOSS.y =
            clamp(
                BOSS.y,
                100,
                CONFIG.WORLD_HEIGHT - 100
            );


        if (boss) {

            boss.style.left =
                `${BOSS.x}px`;

            boss.style.top =
                `${BOSS.y}px`;

            boss.style.transform =
                PLAYER.x >
                BOSS.x
                    ? "scaleX(1)"
                    : "scaleX(-1)";

        }

    }


    /* =====================================================
       DAMAGE BOSS
       ===================================================== */

    function damageBoss() {

        if (
            !BOSS.active ||
            BOSS.defeated
        ) return;


        const d =
            distance(
                PLAYER.x,
                PLAYER.y,
                BOSS.x,
                BOSS.y
            );


        if (
            d >
            CONFIG.ATTACK_RANGE + 60
        ) return;


        BOSS.health =
            Math.max(
                0,
                BOSS.health -
                CONFIG.ATTACK_DAMAGE
            );


        updateBossHUD();


        if (boss) {

            boss.classList.remove(
                "hit"
            );

            void boss.offsetWidth;

            boss.classList.add(
                "hit"
            );

        }


        if (
            BOSS.health <= 0
        ) {

            defeatBoss();

        }

    }


    function updateBossHUD() {

        if (bossHealthFill) {

            bossHealthFill.style.width =
                `${Math.max(
                    0,
                    BOSS.health /
                    BOSS.maxHealth *
                    100
                )}%`;

        }

    }


    /* =====================================================
       BOSS DEFEATED
       ===================================================== */

    function defeatBoss() {

        if (BOSS.defeated)
            return;

        BOSS.defeated = true;

        BOSS.active = false;

        GAME.score += 5000;

        if (mission3) {

            mission3.style.textDecoration =
                "line-through";

        }


        if (boss) {

            boss.style.transition =
                "opacity .9s ease, transform .9s ease";

            boss.style.opacity =
                "0";

            boss.style.transform =
                "scale(1.5) translateY(-100px)";

            setTimeout(() => {

                boss.style.display =
                    "none";

            }, 900);

        }


        if (bossHUD) {

            bossHUD.style.display =
                "none";

        }


        updateHUD();


        notification(
            "THE ANCIENT GUARDIAN HAS FALLEN!"
        );


        setTimeout(
            activatePortal,
            1200
        );

    }


    /* =====================================================
       PORTAL
       ===================================================== */

    function activatePortal() {

        if (PORTAL.active)
            return;

        PORTAL.active = true;

        PORTAL.x =
            BOSS.x;

        PORTAL.y =
            BOSS.y;


        if (day7Portal) {

            day7Portal.style.display =
                "flex";

            day7Portal.style.position =
                "absolute";

            day7Portal.style.left =
                `${PORTAL.x}px`;

            day7Portal.style.top =
                `${PORTAL.y}px`;

            day7Portal.style.opacity =
                "0";

            day7Portal.style.transform =
                "translate(-50%,-60%) scale(.2)";

            day7Portal.style.transition =
                "opacity .8s ease, transform .8s ease";


            requestAnimationFrame(() => {

                day7Portal.style.opacity =
                    "1";

                day7Portal.style.transform =
                    "translate(-50%,-60%) scale(1)";

            });

        }


        playSound(
            portalSound,
            0.8
        );


        notification(
            "THE PATH TO DAY 7 HAS OPENED!"
        );


        setTimeout(() => {

            winGame();

        }, 1800);

    }


    /* =====================================================
       INTERACTION
       ===================================================== */

    function interact() {

        if (
            !GAME.running ||
            GAME.paused ||
            GAME.gameOver
        ) return;


        if (
            PORTAL.active &&
            !GAME.transitioning
        ) {

            const d =
                distance(
                    PLAYER.x,
                    PLAYER.y,
                    PORTAL.x,
                    PORTAL.y
                );


            if (
                d <=
                CONFIG.PORTAL_RADIUS
            ) {

                goToDay7();

                return;

            }

        }


        const nearbyCrystal =
            CRYSTALS.find(
                crystal =>
                    !crystal.collected &&
                    distance(
                        PLAYER.x,
                        PLAYER.y,
                        crystal.x,
                        crystal.y
                    ) < 180
            );


        if (nearbyCrystal) {

            collectCrystal(
                nearbyCrystal
            );

        }

    }


    /* =====================================================
       PORTAL PROXIMITY
       ===================================================== */

    function updatePortal() {

        if (
            !PORTAL.active ||
            !day7Portal
        ) return;


        const d =
            distance(
                PLAYER.x,
                PLAYER.y,
                PORTAL.x,
                PORTAL.y
            );


        const near =
            d <=
            CONFIG.PORTAL_RADIUS;


        day7Portal.classList.toggle(
            "inRange",
            near
        );


        if (interactionPrompt) {

            if (near) {

                interactionPrompt.style.display =
                    "flex";

                interactionPrompt.textContent =
                    "PRESS F / E TO ENTER DAY 7";

            } else {

                interactionPrompt.style.display =
                    "none";

            }

        }

    }


    /* =====================================================
       ATTACK
       ===================================================== */

    function attack() {

        if (
            !GAME.running ||
            GAME.paused ||
            GAME.gameOver ||
            GAME.victory
        ) return;


        if (
            ATTACK.cooldown >
            0
        ) return;


        ATTACK.cooldown =
            CONFIG.ATTACK_COOLDOWN;


        PLAYER.attacking =
            true;


        ATTACK.combo =
            (ATTACK.combo % 3) + 1;


        if (player) {

            player.classList.remove(
                "attack1",
                "attack2",
                "attack3"
            );

            void player.offsetWidth;

            player.classList.add(
                `attack${ATTACK.combo}`
            );

        }


        if (slashEffect) {

            slashEffect.classList.remove(
                "play"
            );

            void slashEffect.offsetWidth;

            slashEffect.classList.add(
                "play"
            );

        }


        playSound(
            swordSlash,
            0.7
        );


        damageEnemies();

        damageBoss();


        setTimeout(() => {

            PLAYER.attacking =
                false;

        }, 250);

    }


    /* =====================================================
       DASH
       ===================================================== */

    function dash() {

        if (
            !GAME.running ||
            GAME.paused ||
            GAME.gameOver
        ) return;


        if (
            DASH.active ||
            DASH.cooldown > 0
        ) return;


        DASH.active =
            true;

        DASH.timer =
            CONFIG.DASH_DURATION;

        DASH.cooldown =
            CONFIG.DASH_COOLDOWN;


        PLAYER.invincible =
            true;


        if (player) {

            player.classList.add(
                "dash"
            );

        }


        if (dashTrail) {

            dashTrail.classList.remove(
                "play"
            );

            void dashTrail.offsetWidth;

            dashTrail.classList.add(
                "play"
            );

        }


        playSound(
            heroDash,
            0.7
        );

    }


    function updateDash(delta) {

        if (
            DASH.cooldown >
            0
        ) {

            DASH.cooldown -=
                delta;

        }


        if (!DASH.active)
            return;


        DASH.timer -=
            delta;


        if (
            DASH.timer <= 0
        ) {

            DASH.active =
                false;

            PLAYER.invincible =
                false;


            if (player) {

                player.classList.remove(
                    "dash"
                );

            }

        }

    }


    /* =====================================================
       SPIRIT SKILL
       ===================================================== */

    function spiritSkill() {

        if (
            !GAME.running ||
            GAME.paused ||
            GAME.gameOver
        ) return;


        if (
            SKILL.cooldown >
            0
        ) {

            notification(
                "SPIRIT SKILL RECHARGING..."
            );

            return;

        }


        if (
            PLAYER.spirit <
            CONFIG.SKILL_COST
        ) {

            notification(
                "NOT ENOUGH SPIRIT"
            );

            return;

        }


        PLAYER.spirit -=
            CONFIG.SKILL_COST;


        SKILL.cooldown =
            CONFIG.SKILL_COOLDOWN;


        ENEMIES.forEach(
            (enemy) => {

                if (!enemy.alive)
                    return;


                const d =
                    distance(
                        PLAYER.x,
                        PLAYER.y,
                        enemy.x,
                        enemy.y
                    );


                if (
                    d <=
                    CONFIG.SKILL_RANGE
                ) {

                    enemy.health -=
                        CONFIG.SKILL_DAMAGE;


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
            distance(
                PLAYER.x,
                PLAYER.y,
                BOSS.x,
                BOSS.y
            ) <=
            CONFIG.SKILL_RANGE
        ) {

            BOSS.health =
                Math.max(
                    0,
                    BOSS.health -
                    CONFIG.SKILL_DAMAGE
                );


            updateBossHUD();


            if (
                BOSS.health <= 0
            ) {

                defeatBoss();

            }

        }


        notification(
            "✦ SPIRIT BURST!"
        );

        updateHUD();

    }


    function updateSkill(delta) {

        if (
            SKILL.cooldown >
            0
        ) {

            SKILL.cooldown -=
                delta;

        }

    }


    /* =====================================================
       PLAYER MOVEMENT
       ===================================================== */

    function movePlayer() {

        let vx = 0;

        let vy = 0;


        if (INPUT.left)
            vx--;

        if (INPUT.right)
            vx++;

        if (INPUT.up)
            vy--;

        if (INPUT.down)
            vy++;


        if (JOYSTICK.active) {

            vx +=
                JOYSTICK.dx /
                JOYSTICK.radius;

            vy +=
                JOYSTICK.dy /
                JOYSTICK.radius;

        }


        const length =
            Math.hypot(
                vx,
                vy
            );


        PLAYER.moving =
            length > 0.05;


        if (
            PLAYER.moving
        ) {

            vx /= length;

            vy /= length;


            const speed =
                DASH.active
                    ? CONFIG.DASH_SPEED
                    : CONFIG.PLAYER_SPEED;


            PLAYER.x +=
                vx * speed;

            PLAYER.y +=
                vy * speed;


            if (
                vx < -0.1
            ) {

                PLAYER.facing =
                    -1;

            }


            if (
                vx > 0.1
            ) {

                PLAYER.facing =
                    1;

            }

        }


        PLAYER.x =
            clamp(
                PLAYER.x,
                70,
                CONFIG.WORLD_WIDTH - 70
            );

        PLAYER.y =
            clamp(
                PLAYER.y,
                70,
                CONFIG.WORLD_HEIGHT - 70
            );

    }


    /* =====================================================
       RENDER PLAYER
       ===================================================== */

    function renderPlayer() {

        if (!playerContainer)
            return;


        playerContainer.style.left =
            `${PLAYER.x}px`;

        playerContainer.style.top =
            `${PLAYER.y}px`;

        playerContainer.style.transform =
            `translate(-50%,-100%) scaleX(${PLAYER.facing})`;

    }


    /* =====================================================
       PLAYER DAMAGE
       ===================================================== */

    function damagePlayer(amount) {

        if (
            PLAYER.invincible ||
            GAME.gameOver ||
            GAME.victory
        ) return;


        PLAYER.health =
            Math.max(
                0,
                PLAYER.health -
                amount
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


        updateHUD();


        if (
            PLAYER.health <= 0
        ) {

            gameOver();

        }

    }


    /* =====================================================
       HUD
       ===================================================== */

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
                `${health}%`;

        }


        if (spiritFill) {

            spiritFill.style.width =
                `${spirit}%`;

        }


        if (healthText) {

            healthText.textContent =
                `${health} / ${CONFIG.MAX_HEALTH}`;

        }


        if (spiritText) {

            spiritText.textContent =
                `${spirit} / ${CONFIG.MAX_SPIRIT}`;

        }


        if (crystalCounter) {

            crystalCounter.textContent =
                `${GAME.crystals} / ${CONFIG.TOTAL_CRYSTALS}`;

        }


        if (scoreCounter) {

            scoreCounter.textContent =
                String(
                    GAME.score
                ).padStart(
                    6,
                    "0"
                );

        }

    }


    /* =====================================================
       REGENERATION
       ===================================================== */

    function regenerate(delta) {

        if (
            PLAYER.spirit <
            CONFIG.MAX_SPIRIT
        ) {

            PLAYER.spirit =
                Math.min(
                    CONFIG.MAX_SPIRIT,
                    PLAYER.spirit +
                    delta *
                    0.008
                );

        }


        if (
            PLAYER.health <
            CONFIG.MAX_HEALTH
        ) {

            PLAYER.health =
                Math.min(
                    CONFIG.MAX_HEALTH,
                    PLAYER.health +
                    delta *
                    0.0015
                );

        }

    }


    /* =====================================================
       CAMERA
       ===================================================== */

    function updateCamera() {

        CAMERA.width =
            window.innerWidth;

        CAMERA.height =
            window.innerHeight;


        let targetX =
            PLAYER.x -
            CAMERA.width /
            2;


        let targetY =
            PLAYER.y -
            CAMERA.height /
            2;


        const maxX =
            Math.max(
                0,
                CONFIG.WORLD_WIDTH -
                CAMERA.width
            );


        const maxY =
            Math.max(
                0,
                CONFIG.WORLD_HEIGHT -
                CAMERA.height
            );


        targetX =
            clamp(
                targetX,
                0,
                maxX
            );


        targetY =
            clamp(
                targetY,
                0,
                maxY
            );


        CAMERA.x +=
            (targetX -
            CAMERA.x) *
            0.10;


        CAMERA.y +=
            (targetY -
            CAMERA.y) *
            0.10;


        if (gameWorld) {

            gameWorld.style.transform =
                `translate(${-CAMERA.x}px,${-CAMERA.y}px)`;

        }

    }


    /* =====================================================
       NOTIFICATION
       ===================================================== */

    function notification(message) {

        if (!notificationContainer)
            return;


        const element =
            document.createElement(
                "div"
            );


        element.className =
            "notification";


        element.textContent =
            message;


        notificationContainer.appendChild(
            element
        );


        setTimeout(() => {

            element.remove();

        }, 2200);

    }


    /* =====================================================
       PAUSE
       ===================================================== */

    function togglePause() {

        if (
            GAME.gameOver ||
            GAME.victory
        ) return;


        GAME.paused =
            !GAME.paused;


        if (pauseMenu) {

            pauseMenu.style.display =
                GAME.paused
                    ? "flex"
                    : "none";

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
            () => {

                GAME.paused =
                    false;

                if (pauseMenu) {

                    pauseMenu.style.display =
                        "none";

                }

            }
        );

    }


    /* =====================================================
       VICTORY
       ===================================================== */

    function winGame() {

        if (
            GAME.victory ||
            GAME.gameOver
        ) return;


        GAME.victory =
            true;

        GAME.running =
            false;

        GAME.paused =
            false;


        localStorage.setItem(
            "day6Complete",
            "true"
        );

        localStorage.setItem(
            "day6Score",
            String(GAME.score)
        );


        playSound(
            victorySound,
            0.7
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

    }


    /* =====================================================
       DAY 7 REDIRECT
       ===================================================== */

    function goToDay7() {

        if (
            GAME.transitioning
        ) return;


        GAME.transitioning =
            true;

        GAME.running =
            false;

        GAME.paused =
            false;


        localStorage.setItem(
            "day6Complete",
            "true"
        );

        localStorage.setItem(
            "day6Score",
            String(GAME.score)
        );


        playSound(
            portalSound,
            0.8
        );


        const transition =
            document.createElement(
                "div"
            );


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


    /* =====================================================
       CONTINUE BUTTON
       ===================================================== */

    if (continueButton) {

        continueButton.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

                goToDay7();

            }
        );

    }


    /* =====================================================
       PORTAL CLICK
       ===================================================== */

    if (day7Portal) {

        day7Portal.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

                if (
                    PORTAL.active
                ) {

                    goToDay7();

                }

            }
        );


        day7Portal.addEventListener(
            "touchstart",
            (event) => {

                event.preventDefault();

                if (
                    PORTAL.active
                ) {

                    goToDay7();

                }

            },
            { passive: false }
        );

    }


    /* =====================================================
       GAME OVER
       ===================================================== */

    function gameOver() {

        if (
            GAME.gameOver
        ) return;


        GAME.gameOver =
            true;

        GAME.running =
            false;


        playSound(
            gameOverSound,
            0.7
        );


        if (gameOverScreen) {

            gameOverScreen.style.display =
                "flex";

        }

    }


    if (retryButton) {

        retryButton.addEventListener(
            "click",
            () => {

                window.location.reload();

            }
        );

    }


    /* =====================================================
       WORLD INITIALIZATION
       ===================================================== */

    function initializeWorld() {

        detectDevice();

        initializeCrystals();

        initializeEnemies();

        updateHUD();

        if (day7Portal) {

            day7Portal.style.display =
                "none";

        }

        if (bossHUD) {

            bossHUD.style.display =
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

        if (pauseMenu) {

            pauseMenu.style.display =
                "none";

        }


        window.addEventListener(
            "resize",
            detectDevice
        );


        startLoading();

    }


    /* =====================================================
       GAME LOOP
       ===================================================== */

    let lastTime =
        performance.now();


    function gameLoop(currentTime) {

        const delta =
            Math.min(
                50,
                currentTime -
                lastTime
            );


        lastTime =
            currentTime;


        if (
            GAME.running &&
            !GAME.paused
        ) {

            movePlayer();

            updateDash(delta);

            updateSkill(delta);

            updateEnemies(delta);

            updateBoss(delta);

            updateCrystalProximity();

            updatePortal();

            regenerate(delta);

            updateCamera();

            renderPlayer();

            updateHUD();

        }


        requestAnimationFrame(
            gameLoop
        );

    }


    /* =====================================================
       START
       ===================================================== */

    initializeWorld();

    requestAnimationFrame(
        gameLoop
    );

});
