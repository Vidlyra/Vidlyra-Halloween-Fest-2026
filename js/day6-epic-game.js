/* =========================================================
   VIDLYRA HALLOWEEN FEST 2026
   DAY 6 — HAUNTED MANSION
   EPIC GAME ENGINE
========================================================= */

"use strict";


/* =========================================================
   DOM
========================================================= */

const player =
    document.getElementById("player");

const mansionSoldier =
    document.getElementById("mansionSoldier");

const boss =
    document.getElementById("boss");

const attackEffect =
    document.getElementById("attackEffect");

const dashEffect =
    document.getElementById("dashEffect");

const hurtEffect =
    document.getElementById("hurtEffect");

const crystals =
    [...document.querySelectorAll(".crystal")];

const healthFill =
    document.getElementById("healthFill");

const spiritFill =
    document.getElementById("spiritFill");

const healthText =
    document.getElementById("healthText");

const spiritText =
    document.getElementById("spiritText");

const crystalCounter =
    document.getElementById("crystalCounter");

const scoreCounter =
    document.getElementById("scoreCounter");

const speedSlider =
    document.getElementById("speedSlider");

const speedValue =
    document.getElementById("speedValue");

const missionCrystal =
    document.getElementById("missionCrystal");

const missionSoldier =
    document.getElementById("missionSoldier");

const missionBoss =
    document.getElementById("missionBoss");

const bossHUD =
    document.getElementById("bossHUD");

const bossHealthFill =
    document.getElementById("bossHealthFill");

const notification =
    document.getElementById("notification");

const pauseMenu =
    document.getElementById("pauseMenu");

const victoryScreen =
    document.getElementById("victoryScreen");

const gameOverScreen =
    document.getElementById("gameOverScreen");

const resumeButton =
    document.getElementById("resumeButton");

const continueButton =
    document.getElementById("continueButton");

const retryButton =
    document.getElementById("retryButton");


/* =========================================================
   AUDIO
========================================================= */

const bgMusic =
    document.getElementById("bgMusic");

const footstepSound =
    document.getElementById("footstepSound");

const collectSound =
    document.getElementById("collectSound");

const attackSound =
    document.getElementById("attackSound");

const dashSound =
    document.getElementById("dashSound");

const hurtSound =
    document.getElementById("hurtSound");

const soldierSound =
    document.getElementById("soldierSound");

const bossMusic =
    document.getElementById("bossMusic");

const bossRoar =
    document.getElementById("bossRoar");

const victorySound =
    document.getElementById("victorySound");

const gameOverSound =
    document.getElementById("gameOverSound");


/* =========================================================
   GAME STATE
========================================================= */

const state = {

    running: true,

    paused: false,

    gameOver: false,

    victory: false,

    lastTime: 0,

    speedMultiplier: 1,

    score: 0,

    crystals: 0,

    health: 100,

    maxHealth: 100,

    spirit: 100,

    maxSpirit: 100,

    player: {

        x: 50,

        y: 15,

        speed: 24,

        facing: 1,

        attacking: false,

        dashing: false,

        hurt: false

    },

    soldier: {

        active: true,

        x: 72,

        y: 20,

        health: 100,

        maxHealth: 100,

        speed: 8,

        attackCooldown: 0,

        attackDelay: 1.4,

        hitCooldown: 0

    },

    boss: {

        active: false,

        defeated: false,

        x: 50,

        y: 22,

        health: 300,

        maxHealth: 300,

        speed: 5,

        attackCooldown: 0,

        attackDelay: 2,

        hitCooldown: 0

    },

    keys: {

        up: false,

        down: false,

        left: false,

        right: false

    }

};


/* =========================================================
   INITIALIZATION
========================================================= */

function init() {

    updateHUD();

    updatePlayerVisual();

    updateSoldierVisual();

    updateBossVisual();

    setupKeyboard();

    setupSpeedControl();

    setupCrystals();

    setupMobileControls();

    setupButtons();

    setupVisibilityHandling();

    startAudio();

    showNotification(
        "ENTER THE HAUNTED MANSION"
    );

    requestAnimationFrame(gameLoop);
}


/* =========================================================
   AUDIO START
========================================================= */

function startAudio() {

    bgMusic.volume = 0.35;

    bgMusic.play()
        .catch(() => {
            document.addEventListener(
                "pointerdown",
                () => {

                    if (!state.paused) {
                        bgMusic.play()
                            .catch(() => {});
                    }

                },
                {
                    once: true
                }
            );
        });
}


/* =========================================================
   KEYBOARD
========================================================= */

function setupKeyboard() {

    window.addEventListener(
        "keydown",
        event => {

            if (event.repeat) return;

            switch (event.key.toLowerCase()) {

                case "w":
                case "arrowup":
                    state.keys.up = true;
                    break;

                case "s":
                case "arrowdown":
                    state.keys.down = true;
                    break;

                case "a":
                case "arrowleft":
                    state.keys.left = true;
                    state.player.facing = -1;
                    break;

                case "d":
                case "arrowright":
                    state.keys.right = true;
                    state.player.facing = 1;
                    break;

                case " ":
                    event.preventDefault();
                    attack();
                    break;

                case "shift":
                    dash();
                    break;

                case "p":
                    togglePause();
                    break;

                case "e":
                    attack();
                    break;

            }

        }
    );


    window.addEventListener(
        "keyup",
        event => {

            switch (event.key.toLowerCase()) {

                case "w":
                case "arrowup":
                    state.keys.up = false;
                    break;

                case "s":
                case "arrowdown":
                    state.keys.down = false;
                    break;

                case "a":
                case "arrowleft":
                    state.keys.left = false;
                    break;

                case "d":
                case "arrowright":
                    state.keys.right = false;
                    break;

            }

        }
    );

    /* FIX: if the window/tab loses focus while a movement key is
       held (alt-tab, switching apps on mobile, etc.) the keyup
       event never fires and the player would walk forever in one
       direction. Clear all movement keys on blur. */
    window.addEventListener(
        "blur",
        () => {

            state.keys.up = false;
            state.keys.down = false;
            state.keys.left = false;
            state.keys.right = false;

        }
    );

}


/* =========================================================
   VISIBILITY HANDLING
========================================================= */

function setupVisibilityHandling() {

    /* FIX: prevents a huge delta-time spike (and the player/enemies
       "teleporting") the moment the tab regains visibility after
       being backgrounded for a while. */
    document.addEventListener(
        "visibilitychange",
        () => {

            if (!document.hidden) {
                state.lastTime = 0;
            }

        }
    );

}


/* =========================================================
   SPEED CONTROL
========================================================= */

function setupSpeedControl() {

    speedSlider.addEventListener(
        "input",
        () => {

            state.speedMultiplier =
                Number(speedSlider.value);

            speedValue.textContent =
                `${state.speedMultiplier.toFixed(1)}x`;

        }
    );

}


/* =========================================================
   CRYSTALS
========================================================= */

function setupCrystals() {

    crystals.forEach(
        crystal => {

            /* FIX: precompute each crystal's world-space position
               ONCE from its inline style, instead of calling
               getBoundingClientRect() on every crystal, every
               single movement frame (major jank source). Crystals
               live inside #crystalLayer, which — like #playerLayer —
               is inset:0 over #gameWorld, so the percentages line
               up directly with state.player.x / state.player.y. */
            crystal._px = parseFloat(crystal.style.left) || 0;
            crystal._py = parseFloat(crystal.style.bottom) || 0;

            crystal.addEventListener(
                "click",
                () => {

                    collectCrystal(crystal);

                }
            );

        }
    );

}


function collectCrystal(crystal) {

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

    state.score += 500;

    playSound(
        collectSound,
        0.65
    );

    updateHUD();

    showNotification(
        `ANCIENT CRYSTAL ${state.crystals}/6`
    );

    if (state.crystals >= 6) {

        missionCrystal.classList.add(
            "complete"
        );

        showNotification(
            "ALL 6 CRYSTALS COLLECTED"
        );

        if (!state.soldier.active) {

            activateBoss();

        }

    }

}


/* =========================================================
   PLAYER MOVEMENT
========================================================= */

function updatePlayer(delta) {

    if (state.player.dashing) {
        return;
    }

    let dx = 0;
    let dy = 0;

    if (state.keys.left) {
        dx -= 1;
        state.player.facing = -1;
    }

    if (state.keys.right) {
        dx += 1;
        state.player.facing = 1;
    }

    if (state.keys.up) {
        dy += 1;
    }

    if (state.keys.down) {
        dy -= 1;
    }

    if (
        dx === 0 &&
        dy === 0
    ) {

        if (!state.player.attacking) {

            player.src =
                "assets/images/day6/player-idle.png";

        }

        return;
    }

    const length =
        Math.sqrt(
            dx * dx +
            dy * dy
        );

    dx /= length;
    dy /= length;

    const movement =
        state.player.speed *
        state.speedMultiplier *
        delta;

    state.player.x +=
        dx * movement;

    state.player.y +=
        dy * movement;

    state.player.x =
        clamp(
            state.player.x,
            5,
            95
        );

    state.player.y =
        clamp(
            state.player.y,
            5,
            65
        );

    if (!state.player.attacking) {

        player.src =
            "assets/images/day6/player-walk.png";

    }

    if (
        Math.random() < 0.03
    ) {

        playSound(
            footstepSound,
            0.18
        );

    }

    checkCrystalDistance();

}


/* =========================================================
   CRYSTAL DISTANCE
========================================================= */

function checkCrystalDistance() {

    crystals.forEach(
        crystal => {

            if (
                crystal.classList.contains(
                    "collected"
                )
            ) {
                return;
            }

            /* FIX: uses the precomputed _px/_py instead of
               getBoundingClientRect(), avoiding a forced
               synchronous layout reflow on every crystal every
               frame the player moves. */
            const distance =
                Math.hypot(
                    state.player.x -
                    crystal._px,

                    state.player.y -
                    crystal._py
                );

            if (distance < 6) {

                collectCrystal(
                    crystal
                );

            }

        }
    );

}


/* =========================================================
   PLAYER VISUAL
========================================================= */

function updatePlayerVisual() {

    player.style.left =
        `${state.player.x}%`;

    player.style.bottom =
        `${state.player.y}%`;

    player.style.transform =
        `translateX(-50%) scaleX(${state.player.facing})`;

}


/* =========================================================
   EFFECT POSITIONING
========================================================= */

function positionEffectOnPlayer(effect) {

    /* FIX: attack/dash/hurt effects used to sit at a fixed
       left:50%, bottom:15%, so they only ever flashed at the
       center of the screen instead of on the player. Now they're
       moved to the player's current position right before the
       animation plays. This only touches left/bottom (not
       transform), so it doesn't fight with the CSS keyframe
       animation that drives the transform/opacity. */

    effect.style.left =
        `${state.player.x}%`;

    effect.style.bottom =
        `${state.player.y + 6}%`;

}


/* =========================================================
   MANSION SOLDIER AI
========================================================= */

function updateSoldier(delta) {

    const soldier =
        state.soldier;

    if (!soldier.active) {
        return;
    }

    soldier.attackCooldown -= delta;

    soldier.hitCooldown -= delta;

    const dx =
        state.player.x -
        soldier.x;

    const dy =
        state.player.y -
        soldier.y;

    const distance =
        Math.hypot(dx, dy);


    /* Follow player */

    if (distance > 7) {

        const directionX =
            dx / Math.max(distance, 0.001);

        const directionY =
            dy / Math.max(distance, 0.001);

        const movement =
            soldier.speed *
            state.speedMultiplier *
            delta;

        soldier.x +=
            directionX * movement;

        soldier.y +=
            directionY * movement;

        soldier.x =
            clamp(
                soldier.x,
                5,
                95
            );

        soldier.y =
            clamp(
                soldier.y,
                8,
                70
            );

    }


    /* Attack player */

    if (
        distance <= 7 &&
        soldier.attackCooldown <= 0
    ) {

        damagePlayer(10);

        soldier.attackCooldown =
            soldier.attackDelay;

        playSound(
            soldierSound,
            0.5
        );

    }


    updateSoldierVisual();

}


/* =========================================================
   SOLDIER VISUAL
========================================================= */

function updateSoldierVisual() {

    if (!mansionSoldier) {
        return;
    }

    if (!state.soldier.active) {

        mansionSoldier.style.opacity =
            "0";

        return;

    }

    mansionSoldier.style.left =
        `${state.soldier.x}%`;

    mansionSoldier.style.bottom =
        `${state.soldier.y}%`;

    const facing =
        state.player.x <
        state.soldier.x
            ? -1
            : 1;

    mansionSoldier.style.transform =
        `translateX(-50%) scaleX(${facing})`;

}


/* =========================================================
   PLAYER ATTACK
========================================================= */

function attack() {

    if (
        state.paused ||
        state.gameOver ||
        state.victory ||
        state.player.attacking
    ) {
        return;
    }

    state.player.attacking = true;

    player.src =
        "assets/images/day6/player-attack.png";

    positionEffectOnPlayer(attackEffect);

    attackEffect.classList.remove(
        "active"
    );

    void attackEffect.offsetWidth;

    attackEffect.classList.add(
        "active"
    );

    playSound(
        attackSound,
        0.65
    );


    /* Hit soldier */

    if (
        state.soldier.active &&
        distanceToSoldier() <= 10
    ) {

        damageSoldier(35);

    }


    /* Hit boss */

    if (
        state.boss.active &&
        distanceToBoss() <= 12
    ) {

        damageBoss(35);

    }


    setTimeout(
        () => {

            state.player.attacking =
                false;

            if (
                !state.player.dashing
            ) {

                player.src =
                    "assets/images/day6/player-idle.png";

            }

        },
        280
    );

}


/* =========================================================
   SOLDIER DAMAGE
========================================================= */

function damageSoldier(amount) {

    if (
        !state.soldier.active
    ) {
        return;
    }

    state.soldier.health -=
        amount;

    state.score += 100;

    if (
        state.soldier.health <= 0
    ) {

        state.soldier.health = 0;

        state.soldier.active =
            false;

        mansionSoldier.style.opacity =
            "0";

        missionSoldier.classList.add(
            "complete"
        );

        state.score += 1000;

        showNotification(
            "MANSION SOLDIER DEFEATED"
        );

        updateHUD();

        if (
            state.crystals >= 6
        ) {

            activateBoss();

        }

    } else {

        updateHUD();

    }

}


/* =========================================================
   BOSS ACTIVATION
========================================================= */

function activateBoss() {

    if (
        state.boss.active ||
        state.boss.defeated
    ) {
        return;
    }

    state.boss.active = true;

    boss.classList.add(
        "active"
    );

    bossHUD.classList.add(
        "active"
    );

    playSound(
        bossRoar,
        0.75
    );

    bgMusic.pause();

    bossMusic.volume = 0.4;

    bossMusic.play()
        .catch(() => {});

    showNotification(
        "THE HAUNTED GUARDIAN AWAKENS"
    );

}


/* =========================================================
   BOSS AI
========================================================= */

function updateBoss(delta) {

    const enemy =
        state.boss;

    if (
        !enemy.active ||
        enemy.defeated
    ) {
        return;
    }

    enemy.attackCooldown -=
        delta;

    const dx =
        state.player.x -
        enemy.x;

    const dy =
        state.player.y -
        enemy.y;

    const distance =
        Math.hypot(dx, dy);


    if (distance > 9) {

        const length =
            Math.max(
                distance,
                .001
            );

        enemy.x +=
            (
                dx / length
            ) *
            enemy.speed *
            state.speedMultiplier *
            delta;

        enemy.y +=
            (
                dy / length
            ) *
            enemy.speed *
            state.speedMultiplier *
            delta;

        enemy.x =
            clamp(
                enemy.x,
                5,
                95
            );

        enemy.y =
            clamp(
                enemy.y,
                8,
                65
            );

    }


    if (
        distance <= 9 &&
        enemy.attackCooldown <= 0
    ) {

        damagePlayer(18);

        enemy.attackCooldown =
            enemy.attackDelay;

        playSound(
            bossRoar,
            .3
        );

    }


    updateBossVisual();

}


/* =========================================================
   BOSS VISUAL
========================================================= */

function updateBossVisual() {

    if (!boss) {
        return;
    }

    boss.style.left =
        `${state.boss.x}%`;

    boss.style.bottom =
        `${state.boss.y}%`;

    const facing =
        state.player.x < state.boss.x
            ? -1
            : 1;

    boss.style.transform =
        `translateX(-50%) scale(${facing},1)`;

}


/* =========================================================
   BOSS DAMAGE
========================================================= */

function damageBoss(amount) {

    if (
        !state.boss.active
    ) {
        return;
    }

    state.boss.health -=
        amount;

    state.score += 200;

    const percentage =
        Math.max(
            0,
            state.boss.health /
            state.boss.maxHealth *
            100
        );

    bossHealthFill.style.width =
        `${percentage}%`;


    if (
        state.boss.health <= 0
    ) {

        defeatBoss();

    }

}


/* =========================================================
   DEFEAT BOSS
========================================================= */

function defeatBoss() {

    state.boss.health = 0;

    state.boss.active = false;

    state.boss.defeated = true;

    boss.classList.remove(
        "active"
    );

    bossHUD.classList.remove(
        "active"
    );

    missionBoss.classList.add(
        "complete"
    );

    state.score += 5000;

    bossMusic.pause();

    bossMusic.currentTime = 0;

    playSound(
        victorySound,
        0.7
    );

    updateHUD();

    showNotification(
        "HAUNTED MANSION CLEARED"
    );

    setTimeout(
        showVictory,
        1200
    );

}


/* =========================================================
   DISTANCE
========================================================= */

function distanceToSoldier() {

    return Math.hypot(
        state.player.x -
        state.soldier.x,

        state.player.y -
        state.soldier.y
    );

}


function distanceToBoss() {

    return Math.hypot(
        state.player.x -
        state.boss.x,

        state.player.y -
        state.boss.y
    );

}


/* =========================================================
   PLAYER DAMAGE
========================================================= */

function damagePlayer(amount) {

    if (
        state.gameOver ||
        state.victory
    ) {
        return;
    }

    state.health -=
        amount;

    state.health =
        Math.max(
            0,
            state.health
        );

    player.classList.add(
        "hurt"
    );

    positionEffectOnPlayer(hurtEffect);

    hurtEffect.classList.remove(
        "active"
    );

    void hurtEffect.offsetWidth;

    hurtEffect.classList.add(
        "active"
    );

    if (!state.player.attacking) {

        player.src =
            "assets/images/day6/player-hurt.png";

    }

    playSound(
        hurtSound,
        0.55
    );

    updateHUD();

    setTimeout(
        () => {

            player.classList.remove(
                "hurt"
            );

            if (
                !state.gameOver &&
                !state.player.attacking
            ) {

                player.src =
                    "assets/images/day6/player-idle.png";

            }

        },
        350
    );


    if (
        state.health <= 0
    ) {

        showGameOver();

    }

}


/* =========================================================
   DASH
========================================================= */

function dash() {

    if (
        state.paused ||
        state.gameOver ||
        state.victory ||
        state.player.dashing ||
        state.spirit < 20
    ) {
        return;
    }

    state.player.dashing =
        true;

    state.spirit -= 20;

    const direction =
        state.player.facing;

    state.player.x +=
        15 * direction;

    state.player.x =
        clamp(
            state.player.x,
            5,
            95
        );

    player.src =
        "assets/images/day6/player-dash.png";

    positionEffectOnPlayer(dashEffect);

    dashEffect.classList.remove(
        "active"
    );

    void dashEffect.offsetWidth;

    dashEffect.classList.add(
        "active"
    );

    playSound(
        dashSound,
        0.65
    );

    updateHUD();

    updatePlayerVisual();

    setTimeout(
        () => {

            state.player.dashing =
                false;

            if (!state.player.attacking) {

                player.src =
                    "assets/images/day6/player-idle.png";

            }

        },
        350
    );

}


/* =========================================================
   SPIRIT REGENERATION
========================================================= */

function regenerateSpirit(delta) {

    if (
        state.player.dashing
    ) {
        return;
    }

    state.spirit +=
        8 * delta;

    state.spirit =
        Math.min(
            state.maxSpirit,
            state.spirit
        );

}


/* =========================================================
   HUD
========================================================= */

function updateHUD() {

    const healthPercent =
        state.health /
        state.maxHealth *
        100;

    const spiritPercent =
        state.spirit /
        state.maxSpirit *
        100;

    healthFill.style.width =
        `${healthPercent}%`;

    spiritFill.style.width =
        `${spiritPercent}%`;

    healthText.textContent =
        `${Math.ceil(state.health)} / ${state.maxHealth}`;

    spiritText.textContent =
        `${Math.ceil(state.spirit)} / ${state.maxSpirit}`;

    crystalCounter.textContent =
        `${state.crystals} / 6`;

    scoreCounter.textContent =
        String(state.score)
            .padStart(6, "0");

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

    pauseMenu.classList.toggle(
        "hidden",
        !state.paused
    );

    if (state.paused) {

        bgMusic.pause();
        bossMusic.pause();

    } else {

        state.lastTime = 0;

        if (
            state.boss.active
        ) {

            bossMusic.play()
                .catch(() => {});

        } else {

            bgMusic.play()
                .catch(() => {});

        }

    }

}


/* =========================================================
   BUTTONS
========================================================= */

function setupButtons() {

    resumeButton.addEventListener(
        "click",
        togglePause
    );

    continueButton.addEventListener(
        "click",
        () => {

            window.location.href =
                "day7-video.html";

        }
    );

    retryButton.addEventListener(
        "click",
        () => {

            window.location.href =
                "day6-epic-game.html";

        }
    );

}


/* =========================================================
   MOBILE CONTROLS
========================================================= */

function setupMobileControls() {

    const buttons =
        document.querySelectorAll(
            ".moveButton"
        );

    buttons.forEach(
        button => {

            const direction =
                button.dataset.key;

            button.addEventListener(
                "pointerdown",
                event => {

                    event.preventDefault();

                    state.keys[
                        direction
                    ] = true;

                    if (
                        direction === "left"
                    ) {
                        state.player.facing =
                            -1;
                    }

                    if (
                        direction === "right"
                    ) {
                        state.player.facing =
                            1;
                    }

                }
            );

            button.addEventListener(
                "pointerup",
                () => {

                    state.keys[
                        direction
                    ] = false;

                }
            );

            button.addEventListener(
                "pointercancel",
                () => {

                    state.keys[
                        direction
                    ] = false;

                }
            );

            button.addEventListener(
                "pointerleave",
                () => {

                    state.keys[
                        direction
                    ] = false;

                }
            );

        }
    );


    document
        .getElementById("mobileAttack")
        .addEventListener(
            "pointerdown",
            event => {

                event.preventDefault();
                attack();

            }
        );


    document
        .getElementById("mobileDash")
        .addEventListener(
            "pointerdown",
            event => {

                event.preventDefault();
                dash();

            }
        );

}


/* =========================================================
   VICTORY
========================================================= */

function showVictory() {

    state.victory = true;

    victoryScreen.classList.remove(
        "hidden"
    );

}


/* =========================================================
   GAME OVER
========================================================= */

function showGameOver() {

    state.gameOver = true;

    bgMusic.pause();

    bossMusic.pause();

    playSound(
        gameOverSound,
        0.7
    );

    gameOverScreen.classList.remove(
        "hidden"
    );

}


/* =========================================================
   NOTIFICATION
========================================================= */

let notificationTimer = null;

function showNotification(message) {

    notification.textContent =
        message;

    notification.classList.add(
        "show"
    );

    clearTimeout(
        notificationTimer
    );

    notificationTimer =
        setTimeout(
            () => {

                notification.classList.remove(
                    "show"
                );

            },
            1800
        );

}


/* =========================================================
   AUDIO HELPER
========================================================= */

function playSound(
    audio,
    volume = 0.5
) {

    if (!audio) {
        return;
    }

    try {

        audio.pause();

        audio.currentTime = 0;

        audio.volume =
            volume;

        audio.play()
            .catch(() => {});

    } catch (error) {

        console.warn(
            "Audio error:",
            error
        );

    }

}


/* =========================================================
   CLAMP
========================================================= */

function clamp(
    value,
    min,
    max
) {

    return Math.min(
        Math.max(
            value,
            min
        ),
        max
    );

}


/* =========================================================
   GAME LOOP
========================================================= */

function gameLoop(timestamp) {

    if (!state.lastTime) {

        state.lastTime =
            timestamp;

        requestAnimationFrame(gameLoop);

        return;

    }

    let delta =
        (
            timestamp -
            state.lastTime
        ) / 1000;

    state.lastTime =
        timestamp;

    /* FIX: cap delta a bit tighter and guard against a negative/zero
       value (can happen right after a visibility-change reset) so
       enemies/effects never jump. */
    delta =
        clamp(
            delta,
            0,
            0.05
        );


    if (
        !state.paused &&
        !state.gameOver &&
        !state.victory
    ) {

        updatePlayer(delta);

        updateSoldier(delta);

        updateBoss(delta);

        regenerateSpirit(
            delta
        );

        updatePlayerVisual();

        updateHUD();

    }


    requestAnimationFrame(
        gameLoop
    );

}


/* =========================================================
   START
========================================================= */

init();
