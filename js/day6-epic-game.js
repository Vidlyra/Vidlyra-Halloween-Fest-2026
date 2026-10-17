const healthOrbs =
    [...document.querySelectorAll(".healthOrb")];

const healthFill = document.getElementById("healthFill");
const spiritFill = document.getElementById("spiritFill");
const healthText = document.getElementById("healthText");
const spiritText = document.getElementById("spiritText");
const crystalCounter = document.getElementById("crystalCounter");
const scoreCounter = document.getElementById("scoreCounter");
const speedSlider = document.getElementById("speedSlider");
const speedValue = document.getElementById("speedValue");
const missionCrystal = document.getElementById("missionCrystal");
const missionSoldier = document.getElementById("missionSoldier");
const missionBoss = document.getElementById("missionBoss");
const bossHUD = document.getElementById("bossHUD");
const bossHealthFill = document.getElementById("bossHealthFill");
const notification = document.getElementById("notification");
const pauseMenu = document.getElementById("pauseMenu");
const victoryScreen = document.getElementById("victoryScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const resumeButton = document.getElementById("resumeButton");
const continueButton = document.getElementById("continueButton");
const retryButton = document.getElementById("retryButton");

/* AUDIO */
const bgMusic = document.getElementById("bgMusic");
const footstepSound = document.getElementById("footstepSound");
const collectSound = document.getElementById("collectSound");
const attackSound = document.getElementById("attackSound");
const dashSound = document.getElementById("dashSound");
const hurtSound = document.getElementById("hurtSound");
const soldierSound = document.getElementById("soldierSound");
const bossMusic = document.getElementById("bossMusic");
const bossRoar = document.getElementById("bossRoar");
const victorySound = document.getElementById("victorySound");
const gameOverSound = document.getElementById("gameOverSound");

/* GAME STATE */
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

const HEALTH_ORB_HEAL_AMOUNT = 30;
const HEALTH_ORB_RESPAWN_SECONDS = 18;

/* DAY 5 -> DAY 6 PROGRESSION GATE */
function showDay6AccessBlock() {
    const panel = document.createElement("div");
    panel.id = "day6AccessBlock";
    panel.style.cssText =
        "position:fixed;inset:0;z-index:999999;background:#050309;color:#fff;" +
        "display:flex;flex-direction:column;align-items:center;justify-content:center;" +
        "padding:28px;text-align:center;font-family:Georgia,serif;gap:16px";

    const title = document.createElement("h1");
    title.textContent = "DAY 6 LOCKED";
    title.style.color = "#ff8a00";

    const message = document.createElement("p");
    message.textContent =
        "Complete Day 5 — The Haunted Cemetery — before entering the Haunted Mansion.";
    message.style.maxWidth = "560px";
    message.style.lineHeight = "1.6";

    const back = document.createElement("button");
    back.type = "button";
    back.textContent = "RETURN TO FESTIVAL";
    back.style.cssText =
        "padding:12px 22px;border:0;border-radius:8px;background:#ff8a00;" +
        "color:#050309;font-weight:bold;cursor:pointer";
    back.addEventListener("click", () => {
        window.location.href = "index.html";
    });

    panel.append(title, message, back);
    document.body.appendChild(panel);
}

/* INITIALIZATION */
function init() {
    let day5Unlocked = false;

    try {
        day5Unlocked = localStorage.getItem("day5Complete") === "true";
    } catch (error) {
        console.error("Unable to verify Day 5 progress:", error);
    }

    if (!day5Unlocked) {
        showDay6AccessBlock();
        return;
    }

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

    showNotification("ENTER THE HAUNTED MANSION");
    requestAnimationFrame(gameLoop);
}

/* AUDIO START */
function startAudio() {
    if (!bgMusic) return;

    bgMusic.volume = 0.35;

    bgMusic.play().catch(() => {
        document.addEventListener("pointerdown", () => {
            if (!state.paused) {
                bgMusic.play().catch(() => {});
            }
        }, { once: true });
    });
}

/* KEYBOARD */
function setupKeyboard() {
    window.addEventListener("keydown", event => {
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
    });

    window.addEventListener("keyup", event => {
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
    });

    window.addEventListener("blur", () => {
        state.keys.up = false;
        state.keys.down = false;
        state.keys.left = false;
        state.keys.right = false;
    });
}

/* VISIBILITY HANDLING */
function setupVisibilityHandling() {
    document.addEventListener("visibilitychange", () => {
        if (!document.hidden) state.lastTime = 0;
    });
}

/* SPEED CONTROL */
function setupSpeedControl() {
    if (!speedSlider || !speedValue) return;

    speedSlider.addEventListener("input", () => {
        state.speedMultiplier = Number(speedSlider.value);
        speedValue.textContent = `${state.speedMultiplier.toFixed(1)}x`;
    });
}

/* SOLDIERS SETUP */
function setupSoldiers() {
    state.soldiers.forEach((soldier, index) => {
        soldier.el = mansionSoldierEls[index] || null;
        updateSoldierVisual(soldier);
    });

    updateMissionSoldierText();
}

/* CRYSTALS */
function setupCrystals() {
    crystals.forEach(crystal => {
        crystal._px = parseFloat(crystal.style.left) || 0;
        crystal._py = parseFloat(crystal.style.bottom) || 0;

        crystal.addEventListener("click", () => {
            collectCrystal(crystal);
        });
    });
}

function collectCrystal(crystal) {
    if (crystal.classList.contains("collected")) return;

    crystal.classList.add("collected");
    state.crystals++;
    state.score += 500;

    playSound(collectSound, 0.65);
    updateHUD();
    showNotification(`ANCIENT CRYSTAL ${state.crystals}/6`);

    if (state.crystals >= 6) {
        missionCrystal.classList.add("complete");
        showNotification("ALL 6 CRYSTALS COLLECTED");

        if (allSoldiersDefeated()) activateBoss();
    }
}
/* HEALTH ORBS */
function setupHealthOrbs() {
    healthOrbs.forEach((orb, index) => {
        orb._collected = false;
        orb._respawn = 0;
        orb._orbIndex = index;

        orb.addEventListener("click", () => {
            collectHealthOrb(orb);
        });
    });
}

function collectHealthOrb(orb) {
    if (!orb || orb._collected || state.gameOver || state.victory) return;

    if (state.health >= state.maxHealth) {
        showNotification("HEALTH ALREADY FULL");
        return;
    }

    orb._collected = true;
    orb._respawn = HEALTH_ORB_RESPAWN_SECONDS;
    orb.style.display = "none";

    state.health = Math.min(
        state.maxHealth,
        state.health + HEALTH_ORB_HEAL_AMOUNT
    );

    state.score += 100;
    playSound(collectSound, 0.5);
    updateHUD();
    showNotification("+30 HEALTH");
}

/* PLAYER VISUAL */
function updatePlayerVisual() {
    const player = document.getElementById("player");
    if (!player) return;

    player.style.left = `${state.player.x}%`;
    player.style.bottom = `${state.player.y}%`;

    if (state.player.facing < 0) {
        player.style.transform = "scaleX(-1)";
    } else {
        player.style.transform = "scaleX(1)";
    }

    player.classList.toggle("attacking", state.player.attacking);
    player.classList.toggle("dashing", state.player.dashing);
    player.classList.toggle("hurt", state.player.hurt);
}

/* MOVEMENT */
function updatePlayer(delta) {
    if (state.gameOver || state.victory) return;

    let dx = 0;
    let dy = 0;

    if (state.keys.left) dx -= 1;
    if (state.keys.right) dx += 1;
    if (state.keys.up) dy += 1;
    if (state.keys.down) dy -= 1;

    const magnitude = Math.hypot(dx, dy);

    if (magnitude > 0) {
        dx /= magnitude;
        dy /= magnitude;

        const speed = state.player.speed * state.speedMultiplier;
        state.player.x += dx * speed * delta;
        state.player.y += dy * speed * delta;

        if (dx !== 0) state.player.facing = dx > 0 ? 1 : -1;
    }

    state.player.x = clamp(state.player.x, 3, 97);
    state.player.y = clamp(state.player.y, 3, 78);

    updatePlayerVisual();
}

/* ATTACK */
function attack() {
    if (state.paused || state.gameOver || state.victory) return;
    if (state.player.attacking) return;

    state.player.attacking = true;
    playSound(attackSound, 0.6);

    const attackRange = 17;

    state.soldiers.forEach(soldier => {
        if (!soldier.active) return;

        if (distance(
            state.player.x,
            state.player.y,
            soldier.x,
            soldier.y
        ) <= attackRange) {
            damageSoldier(soldier, 35);
        }
    });

    if (state.boss.active && !state.boss.defeated) {
        if (distance(
            state.player.x,
            state.player.y,
            state.boss.x,
            state.boss.y
        ) <= 21) {
            damageBoss(25);
        }
    }

    updatePlayerVisual();

    setTimeout(() => {
        state.player.attacking = false;
        updatePlayerVisual();
    }, 250);
}

/* DASH */
function dash() {
    if (state.paused || state.gameOver || state.victory) return;
    if (state.player.dashing || state.spirit < 15) return;

    state.player.dashing = true;
    state.spirit = Math.max(0, state.spirit - 15);

    let dx = 0;
    let dy = 0;

    if (state.keys.left) dx -= 1;
    if (state.keys.right) dx += 1;
    if (state.keys.up) dy += 1;
    if (state.keys.down) dy -= 1;

    if (dx === 0 && dy === 0) {
        dx = state.player.facing;
    }

    const magnitude = Math.hypot(dx, dy) || 1;
    dx /= magnitude;
    dy /= magnitude;

    state.player.x = clamp(state.player.x + dx * 13, 3, 97);
    state.player.y = clamp(state.player.y + dy * 13, 3, 78);

    playSound(dashSound, 0.6);
    updatePlayerVisual();
    updateHUD();

    setTimeout(() => {
        state.player.dashing = false;
        updatePlayerVisual();
    }, 350);
}

/* SOLDIER AI */
function updateSoldiers(delta) {
    if (state.gameOver || state.victory) return;

    state.soldiers.forEach(soldier => {
        if (!soldier.active) return;

        soldier.attackCooldown = Math.max(
            0,
            soldier.attackCooldown - delta
        );

        const dist = distance(
            soldier.x,
            soldier.y,
            state.player.x,
            state.player.y
        );

        if (dist > 7) {
            const dx = state.player.x - soldier.x;
            const dy = state.player.y - soldier.y;
            const magnitude = Math.hypot(dx, dy) || 1;

            soldier.x += (dx / magnitude) * soldier.speed * delta;
            soldier.y += (dy / magnitude) * soldier.speed * delta;
        } else if (soldier.attackCooldown <= 0) {
            soldier.attackCooldown = soldier.attackDelay;
            damagePlayer(8);
        }

        soldier.x = clamp(soldier.x, 3, 97);
        soldier.y = clamp(soldier.y, 3, 78);

        updateSoldierVisual(soldier);
    });
}

/* SOLDIER DAMAGE */
function damageSoldier(soldier, damage) {
    if (!soldier || !soldier.active) return;

    soldier.health = Math.max(0, soldier.health - damage);
    state.score += 50;

    if (soldier.health <= 0) {
        soldier.active = false;
        soldier.el?.classList.add("defeated");
        if (soldier.el) soldier.el.style.display = "none";

        state.score += 300;
        showNotification("HAUNTED SOLDIER DEFEATED");
        updateMissionSoldierText();

        if (allSoldiersDefeated()) {
            missionSoldier?.classList.add("complete");
            showNotification("ALL SOLDIERS DEFEATED");

            if (state.crystals >= 6) activateBoss();
        }
    } else {
        showNotification(`SOLDIER HIT — ${soldier.health} HP`);
    }

    updateHUD();
}

/* SOLDIER DISPLAY */
function updateSoldierVisual(soldier) {
    if (!soldier.el) return;

    soldier.el.style.left = `${soldier.x}%`;
    soldier.el.style.bottom = `${soldier.y}%`;

    let bar = soldier.el.querySelector(".enemyHealthFill");

    if (!bar) {
        bar = document.createElement("div");
        bar.className = "enemyHealthFill";
        bar.style.cssText =
            "position:absolute;left:0;top:-8px;height:4px;" +
            "background:#ff3030;width:100%;transition:width .15s";
        soldier.el.appendChild(bar);
    }

    bar.style.width =
        `${Math.max(0, soldier.health / soldier.maxHealth * 100)}%`;

    soldier.el.style.display = soldier.active ? "" : "none";
}

function updateMissionSoldierText() {
    if (!missionSoldier) return;

    const defeated = state.soldiers.filter(soldier => !soldier.active).length;
    missionSoldier.textContent =
        `Defeat Haunted Soldiers (${defeated}/${state.soldiers.length})`;
}

/* BOSS ACTIVATION */
function activateBoss() {
    if (state.boss.active || state.boss.defeated) return;

    state.boss.active = true;

    if (bossHUD) bossHUD.classList.remove("hidden");

    updateBossVisual();
    playBossMusic();
    playSound(bossRoar, 0.8);
    showNotification("THE HAUNTED MANSION BOSS HAS AWAKENED!");
}

/* BOSS VISUAL */
function updateBossVisual() {
    const boss = document.getElementById("boss");
    if (!boss) return;

    boss.style.left = `${state.boss.x}%`;
    boss.style.bottom = `${state.boss.y}%`;
    boss.style.display =
        state.boss.active && !state.boss.defeated ? "" : "none";

    if (bossHealthFill) {
        bossHealthFill.style.width =
            `${Math.max(0, state.boss.health / state.boss.maxHealth * 100)}%`;
    }
}

/* BOSS AI */
function updateBoss(delta) {
    if (!state.boss.active || state.boss.defeated) return;

    state.boss.attackCooldown = Math.max(
        0,
        state.boss.attackCooldown - delta
    );

    state.boss.hitCooldown = Math.max(
        0,
        state.boss.hitCooldown - delta
    );

    const dist = distance(
        state.boss.x,
        state.boss.y,
        state.player.x,
        state.player.y
    );

    if (dist > 10) {
        const dx = state.player.x - state.boss.x;
        const dy = state.player.y - state.boss.y;
        const magnitude = Math.hypot(dx, dy) || 1;

        state.boss.x += (dx / magnitude) * state.boss.speed * delta;
        state.boss.y += (dy / magnitude) * state.boss.speed * delta;
    } else if (state.boss.attackCooldown <= 0) {
        state.boss.attackCooldown = state.boss.attackDelay;
        damagePlayer(18);
        showNotification("BOSS ATTACK!");
    }

    state.boss.x = clamp(state.boss.x, 5, 95);
    state.boss.y = clamp(state.boss.y, 5, 75);

    updateBossVisual();
}

/* BOSS DAMAGE */
function damageBoss(damage) {
    if (!state.boss.active || state.boss.defeated) return;
    if (state.boss.hitCooldown > 0) return;

    state.boss.hitCooldown = 0.35;
    state.boss.health = Math.max(0, state.boss.health - damage);
    state.score += 100;

    updateBossVisual();
    updateHUD();

    if (state.boss.health <= 0) {
        defeatBoss();
    }
}

/* BOSS DEFEAT */
function defeatBoss() {
    if (state.boss.defeated) return;

    state.boss.defeated = true;
    state.boss.active = false;

    if (bossHUD) bossHUD.classList.add("hidden");

    stopBossMusic();
    showNotification("THE HAUNTED MANSION BOSS IS DEFEATED!");

    setTimeout(() => {
        showVictory();
    }, 1200);
}

/* PLAYER DAMAGE */
function damagePlayer(damage) {
    if (state.gameOver || state.victory || state.player.dashing) return;

    state.health = Math.max(0, state.health - damage);
    state.player.hurt = true;

    playSound(hurtSound, 0.65);
    updateHUD();
    updatePlayerVisual();

    setTimeout(() => {
        state.player.hurt = false;
        updatePlayerVisual();
    }, 250);

    if (state.health <= 0) {
        endGame();
    }
}

/* UTILITIES */
function distance(x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1);
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function allSoldiersDefeated() {
    return state.soldiers.every(soldier => !soldier.active);
}

function playSound(sound, volume = 0.5) {
    if (!sound) return;

    try {
        sound.volume = volume;
        sound.currentTime = 0;
        sound.play().catch(() => {});
    } catch (error) {
        console.warn("Sound playback unavailable:", error);
    }
}

function playBossMusic() {
    if (bgMusic) bgMusic.pause();

    if (bossMusic) {
        bossMusic.volume = 0.45;
        bossMusic.currentTime = 0;
        bossMusic.play().catch(() => {});
    }
}

function stopBossMusic() {
    if (bossMusic) bossMusic.pause();

    if (bgMusic && !state.gameOver && !state.victory) {
        bgMusic.play().catch(() => {});
    }
}

/* NOTIFICATION */
let notificationTimeout;

function showNotification(message) {
    if (!notification) {
        console.log("[DAY 6]", message);
        return;
    }

    notification.textContent = message;
    notification.classList.remove("hidden");
    notification.classList.add("show");

    clearTimeout(notificationTimeout);

    notificationTimeout = setTimeout(() => {
        notification.classList.remove("show");
        notification.classList.add("hidden");
    }, 2400);
}

/* HUD */
function updateHUD() {
    if (healthFill) {
        healthFill.style.width =
            `${state.health / state.maxHealth * 100}%`;
    }

    if (spiritFill) {
        spiritFill.style.width =
            `${state.spirit / state.maxSpirit * 100}%`;
    }

    if (healthText) healthText.textContent = `${state.health}`;
    if (spiritText) spiritText.textContent = `${state.spirit}`;
    if (crystalCounter) crystalCounter.textContent = `${state.crystals}/6`;
    if (scoreCounter) scoreCounter.textContent = `${state.score}`;

    if (missionCrystal && state.crystals >= 6) {
        missionCrystal.classList.add("complete");
    }

    if (missionBoss && state.boss.defeated) {
        missionBoss.classList.add("complete");
    }
}
/* ==========================================
   DAY 6 — GAME LOOP
========================================== */

function gameLoop(timestamp) {
    if (!state.running) return;

    if (!state.lastTime) state.lastTime = timestamp;

    const delta = Math.min((timestamp - state.lastTime) / 1000, 0.05);
    state.lastTime = timestamp;

    if (!state.paused && !state.gameOver && !state.victory) {
        updatePlayer(delta);
        updateSoldiers(delta);
        updateBoss(delta);
        updateHealthOrbRespawns(delta);
        regenerateSpirit(delta);
        updateMiniMap();
        updateHUD();
    }

    requestAnimationFrame(gameLoop);
}

/* ==========================================
   SPIRIT REGENERATION
========================================== */

function regenerateSpirit(delta) {
    if (state.player.dashing) return;

    state.spirit = Math.min(
        state.maxSpirit,
        state.spirit + 3 * delta
    );
}

/* ==========================================
   HEALTH ORB RESPAWN
========================================== */

function updateHealthOrbRespawns(delta) {
    healthOrbs.forEach(orb => {
        if (!orb._collected) return;

        orb._respawn -= delta;

        if (orb._respawn <= 0) {
            orb._collected = false;
            orb.style.display = "";
            orb.classList.remove("collected");
        }
    });
}

/* ==========================================
   MINI-MAP
========================================== */

function updateMiniMap() {
    const map = document.getElementById("miniMap");
    if (!map) return;

    let playerMarker = map.querySelector(".mini-player");

    if (!playerMarker) {
        playerMarker = document.createElement("div");
        playerMarker.className = "mini-player";
        playerMarker.title = "Player";
        playerMarker.style.cssText =
            "position:absolute;width:9px;height:9px;border-radius:50%;" +
            "background:#ff8a00;box-shadow:0 0 8px #ff8a00;" +
            "transform:translate(-50%,50%);z-index:10";
        map.appendChild(playerMarker);
    }

    playerMarker.style.left = `${state.player.x}%`;
    playerMarker.style.bottom = `${state.player.y}%`;

    state.soldiers.forEach((soldier, index) => {
        let marker = map.querySelector(`.mini-soldier-${index}`);

        if (!marker) {
            marker = document.createElement("div");
            marker.className = `mini-soldier-${index}`;
            marker.title = `Haunted Soldier ${index + 1}`;
            marker.style.cssText =
                "position:absolute;width:6px;height:6px;border-radius:50%;" +
                "background:#ff3030;transform:translate(-50%,50%);z-index:5";
            map.appendChild(marker);
        }

        marker.style.display = soldier.active ? "" : "none";
        marker.style.left = `${soldier.x}%`;
        marker.style.bottom = `${soldier.y}%`;
    });

    let bossMarker = map.querySelector(".mini-boss");

    if (!bossMarker) {
        bossMarker = document.createElement("div");
        bossMarker.className = "mini-boss";
        bossMarker.title = "Boss";
        bossMarker.style.cssText =
            "position:absolute;width:9px;height:9px;border-radius:2px;" +
            "background:#c000ff;box-shadow:0 0 7px #c000ff;" +
            "transform:translate(-50%,50%);z-index:6";
        map.appendChild(bossMarker);
    }

    bossMarker.style.display =
        state.boss.active && !state.boss.defeated ? "" : "none";
    bossMarker.style.left = `${state.boss.x}%`;
    bossMarker.style.bottom = `${state.boss.y}%`;
}

/* ==========================================
   PAUSE / RESUME
========================================== */

function togglePause(forceState) {
    if (state.gameOver || state.victory) return;

    state.paused = typeof forceState === "boolean"
        ? forceState
        : !state.paused;

    if (pauseMenu) {
        pauseMenu.classList.toggle("hidden", !state.paused);
    }

    if (state.paused) {
        if (bgMusic) bgMusic.pause();
        if (bossMusic) bossMusic.pause();
    } else {
        state.lastTime = 0;

        if (state.boss.active) {
            if (bossMusic) bossMusic.play().catch(() => {});
        } else if (bgMusic) {
            bgMusic.play().catch(() => {});
        }
    }
}

/* ==========================================
   BUTTONS
========================================== */

function setupButtons() {
    if (resumeButton) {
        resumeButton.addEventListener("click", () => {
            togglePause(false);
        });
    }

    const pauseButton = document.getElementById("pauseButton");

    if (pauseButton) {
        pauseButton.addEventListener("click", () => {
            togglePause();
        });
    }

    if (continueButton) {
        continueButton.addEventListener("click", () => {
            let completed = false;

            try {
                completed = localStorage.getItem("day6Complete") === "true";
            } catch (error) {
                console.error("Unable to read game progress:", error);
            }

            if (!state.victory || !completed) {
                showNotification("DEFEAT THE BOSS TO UNLOCK DAY 7");
                return;
            }

            window.location.href = "day7-video.html";
        });
    }

    if (retryButton) {
        retryButton.addEventListener("click", () => {
            window.location.href = "day6-epic-game.html";
        });
    }

    const attackButton = document.getElementById("attackButton");

    if (attackButton) {
        attackButton.addEventListener("pointerdown", event => {
            event.preventDefault();
            attack();
        });
    }

    const dashButton = document.getElementById("dashButton");

    if (dashButton) {
        dashButton.addEventListener("pointerdown", event => {
            event.preventDefault();
            dash();
        });
    }
}

/* ==========================================
   MOBILE MOVEMENT CONTROLS
========================================== */

function setupMobileControls() {
    const controls = {
        up: document.getElementById("moveUp"),
        down: document.getElementById("moveDown"),
        left: document.getElementById("moveLeft"),
        right: document.getElementById("moveRight")
    };

    Object.entries(controls).forEach(([direction, button]) => {
        if (!button) return;

        const start = event => {
            event.preventDefault();
            state.keys[direction] = true;

            if (button.setPointerCapture && event.pointerId !== undefined) {
                try {
                    button.setPointerCapture(event.pointerId);
                } catch (_) {}
            }
        };

        const stop = event => {
            if (event) event.preventDefault();
            state.keys[direction] = false;
        };

        button.addEventListener("pointerdown", start);
        button.addEventListener("pointerup", stop);
        button.addEventListener("pointercancel", stop);
        button.addEventListener("lostpointercapture", stop);
        button.addEventListener("contextmenu", event => event.preventDefault());
    });
}

/* ==========================================
   GAME OVER
========================================== */

function endGame() {
    if (state.gameOver || state.victory) return;

    state.gameOver = true;
    state.running = true;
    state.paused = false;

    if (gameOverScreen) {
        gameOverScreen.classList.remove("hidden");
    }

    if (pauseMenu) pauseMenu.classList.add("hidden");

    if (bgMusic) bgMusic.pause();
    if (bossMusic) bossMusic.pause();

    playSound(gameOverSound, 0.8);
    showNotification("YOU HAVE FALLEN IN THE HAUNTED MANSION");
}

/* ==========================================
   VICTORY / SAVE PROGRESS
========================================== */

function showVictory() {
    if (state.victory) return;

    state.victory = true;
    state.paused = false;

    if (victoryScreen) {
        victoryScreen.classList.remove("hidden");
    }

    if (gameOverScreen) {
        gameOverScreen.classList.add("hidden");
    }

    if (pauseMenu) {
        pauseMenu.classList.add("hidden");
    }

    if (bgMusic) bgMusic.pause();
    if (bossMusic) bossMusic.pause();

    playSound(victorySound, 0.85);

    try {
        localStorage.setItem("day6Complete", "true");
        localStorage.setItem("day6Score", String(state.score));
        localStorage.setItem("day6CompletedAt", new Date().toISOString());
    } catch (error) {
        console.error("Could not save Day 6 progress:", error);
        showNotification("WARNING: PROGRESS COULD NOT BE SAVED");
        return;
    }

    if (missionBoss) {
        missionBoss.classList.add("complete");
    }

    const finalScore = document.getElementById("finalScore");
    if (finalScore) {
        finalScore.textContent = String(state.score);
    }

    const finalCrystals = document.getElementById("finalCrystals");
    if (finalCrystals) {
        finalCrystals.textContent = `${state.crystals}/6`;
    }

    showNotification("DAY 6 COMPLETE — DAY 7 UNLOCKED");
}

/* ==========================================
   OPTIONAL RESTART SUPPORT
========================================== */

function resetDay6Progress() {
    try {
        localStorage.removeItem("day6Complete");
        localStorage.removeItem("day6Score");
        localStorage.removeItem("day6CompletedAt");
    } catch (error) {
        console.error("Could not reset Day 6 progress:", error);
    }
}

/* ==========================================
   START GAME
========================================== */

document.addEventListener("DOMContentLoaded", () => {
    init();
});
