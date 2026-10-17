/* =========================================================
   VIDLYRA HALLOWEEN FEST 2026
   DAY 6 — HAUNTED MANSION
   EPIC GAME ENGINE
========================================================= */

import { supabase } from "./supabase.js";

"use strict";

/* =========================================================
   DOM
========================================================= */

const player =
    document.getElementById("player");

const mansionSoldierEls =
    [...document.querySelectorAll(".mansion-soldier")];

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

const healthOrbs =
    [...document.querySelectorAll(".healthOrb")];

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
   SUPABASE FESTIVAL PROGRESSION
========================================================= */

const FESTIVAL_ID = "halloween_2026";

let festivalUser = null;
let day6Saved = false;
let day6SaveInProgress = false;
let festivalProgressRowExists = false;

async function checkFestivalAccess() {
    try {
        const {
            data: { user },
            error: authError
        } = await supabase.auth.getUser();

        if (authError || !user) {
            alert(
                "Please sign in to play VIDLYRA Halloween Fest 2026."
            );

            window.location.href = "login.html";
            return false;
        }

        festivalUser = user;

        const {
            data,
            error
        } = await supabase
            .from("festival_progress")
            .select("day4, day5, day6")
            .eq("user_id", user.id)
            .eq("festival", FESTIVAL_ID)
            .maybeSingle();

        if (error) {
            console.error(
                "Supabase festival progress lookup failed:",
                error
            );

            alert(
                "Unable to load festival progress. Please try again."
            );

            window.location.href = "map.html";
            return false;
        }

        if (!data) {
            alert(
                "Festival progress was not found for your account."
            );

            window.location.href = "map.html";
            return false;
        }

        festivalProgressRowExists = true;

        if (data.day5 !== true) {
            alert(
                "🔒 Complete Day 5 — The Haunted Cemetery — before entering Day 6."
            );

            window.location.href = "map.html";
            return false;
        }

        day6Saved = data.day6 === true;

        console.log(
            "Day 6 access granted. Existing completion:",
            day6Saved
        );

        return true;

    } catch (error) {
        console.error(
            "Unexpected festival access error:",
            error
        );

        alert(
            "Unable to verify festival access. Please try again."
        );

        window.location.href = "map.html";
        return false;
    }
}


async function saveDay6Completion() {
    if (!festivalUser || !festivalProgressRowExists) {
        showNotification(
            "SIGN IN REQUIRED TO SAVE PROGRESS"
        );

        return false;
    }

    if (day6SaveInProgress) {
        return false;
    }

    day6SaveInProgress = true;

    if (continueButton) {
        continueButton.disabled = true;
        continueButton.textContent = "SAVING PROGRESS...";
    }

    try {
        const {
            data,
            error
        } = await supabase
            .from("festival_progress")
            .update({
                day6: true
            })
            .eq("user_id", festivalUser.id)
            .eq("festival", FESTIVAL_ID)
            .select("day6")
            .maybeSingle();

        if (error) {
            throw error;
        }

        if (!data || data.day6 !== true) {
            throw new Error(
                "Supabase did not confirm day6=true. Check the row and RLS policies."
            );
        }

        day6Saved = true;

        console.log(
            "Supabase saved festival_progress.day6 = true"
        );

        showNotification(
            "DAY 6 COMPLETE — DAY 7 UNLOCKED"
        );

        if (continueButton) {
            continueButton.disabled = false;
            continueButton.textContent = "CONTINUE TO DAY 7";
        }

        return true;

    } catch (error) {
        console.error(
            "Failed to save Day 6 completion:",
            error
        );

        showNotification(
            "SAVE FAILED — CLICK CONTINUE TO RETRY"
        );

        if (continueButton) {
            continueButton.disabled = false;
            continueButton.textContent = "RETRY SAVE / CONTINUE";
        }

        return false;

    } finally {
        day6SaveInProgress = false;
    }
}


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

    soldiers: [

        {
            active: true,
            x: 72,
            y: 20,
            health: 100,
            maxHealth: 100,
            speed: 8,
            attackCooldown: 0,
            attackDelay: 1.4
        },

        {
            active: true,
            x: 22,
            y: 22,
            health: 100,
            maxHealth: 100,
            speed: 8.5,
            attackCooldown: 0,
            attackDelay: 1.4
        },

        {
            active: true,
            x: 58,
            y: 60,
            health: 100,
            maxHealth: 100,
            speed: 7.5,
            attackCooldown: 0,
            attackDelay: 1.4
        }

    ],

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
   HEALTH ORB CONFIG
========================================================= */

const HEALTH_ORB_HEAL_AMOUNT = 30;

const HEALTH_ORB_RESPAWN_SECONDS = 18;


/* =========================================================
   INITIALIZATION
========================================================= */

async function init() {

    const allowed = await checkFestivalAccess();

    if (!allowed) return;

    updateHUD();

    updatePlayerVisual();

    setupSoldiers();

    updateBossVisual();

    setupKeyboard();

    setupSpeedControl();

    setupCrystals();

    setupHealthOrbs();

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
   SOLDIERS SETUP
========================================================= */

function setupSoldiers() {

    state.soldiers.forEach(
        (soldier, index) => {

            soldier.el =
                mansionSoldierEls[index] ||
                null;

            updateSoldierVisual(soldier);

        }
    );

    updateMissionSoldierText();

}


/* =========================================================
   CRYSTALS
========================================================= */

function setupCrystals() {

    crystals.forEach(
        crystal => {

            /* Read each crystal's world-space position once. */
            crystal._px =
                parseFloat(crystal.style.left) || 0;

            crystal._py =
                parseFloat(crystal.style.bottom) || 0;

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

        if (allSoldiersDefeated()) {

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

    checkHealthOrbDistance();

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
   HEALTH ORBS (vitality pickups)
========================================================= */

function setupHealthOrbs() {

    healthOrbs.forEach(
        orb => {

            orb._px =
                parseFloat(orb.style.left) || 0;

            orb._py =
                parseFloat(orb.style.bottom) || 0;

            orb._respawnTimer = 0;

            orb.addEventListener(
                "click",
                () => {

                    collectHealthOrb(orb);

                }
            );

        }
    );

}


function checkHealthOrbDistance() {

    healthOrbs.forEach(
        orb => {

            if (orb._respawnTimer > 0) {
                return;
            }

            const distance =
                Math.hypot(
                    state.player.x -
                    orb._px,

                    state.player.y -
                    orb._py
                );

            if (
                distance < 6 &&
                state.health < state.maxHealth
            ) {

                collectHealthOrb(
                    orb
                );

            }

        }
    );

}


function collectHealthOrb(orb) {

    if (
        orb._respawnTimer > 0 ||
        state.health >= state.maxHealth
    ) {
        return;
    }

    state.health = Math.min(
        state.maxHealth,
        state.health + HEALTH_ORB_HEAL_AMOUNT
    );

    state.score += 100;

    orb.style.display = "none";

    orb._respawnTimer =
        HEALTH_ORB_RESPAWN_SECONDS;

    playSound(
        collectSound,
        0.5
    );

    updateHUD();

    showNotification(
        `+${HEALTH_ORB_HEAL_AMOUNT} HEALTH`
    );

}


/* =========================================================
   HEALTH ORB RESPAWN
========================================================= */

function updateHealthOrbs(delta) {

    healthOrbs.forEach(
        orb => {

            if (orb._respawnTimer <= 0) {
                return;
            }

            orb._respawnTimer -= delta;

            if (orb._respawnTimer <= 0) {

                orb._respawnTimer = 0;

                orb.style.display = "";

            }

        }
    );

}


/* =========================================================
   SPIRIT REGENERATION
========================================================= */

function regenerateSpirit(delta) {

    if (state.player.dashing) {
        return;
    }

    state.spirit = Math.min(
        state.maxSpirit,
        state.spirit + 3 * delta
    );

}


/* =========================================================
   PLAYER VISUAL
========================================================= */

function updatePlayerVisual() {

    if (!player) return;

    player.style.left =
        `${state.player.x}%`;

    player.style.bottom =
        `${state.player.y}%`;

    player.style.transform =
        state.player.facing < 0
            ? "scaleX(-1)"
            : "scaleX(1)";

}


/* =========================================================
   DISTANCE
========================================================= */

function distanceToSoldier(soldier) {

    return Math.hypot(
        state.player.x - soldier.x,
        state.player.y - soldier.y
    );

}


function distanceToBoss() {

    return Math.hypot(
        state.player.x - state.boss.x,
        state.player.y - state.boss.y
    );

}


/* =========================================================
   UTILITY
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
