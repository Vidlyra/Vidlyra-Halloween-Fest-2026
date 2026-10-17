import { supabase } from "./supabase.js";

"use strict";

/* -------------------- CONFIGURATION -------------------- */

const CONFIG = {
  festival: "halloween_2026",
  nextPage: "day6-video.html",
  worldWidth: 5000,
  worldHeight: 2200,
  playerSpeed: 300,
  dashSpeed: 850,
  playerMaxHealth: 100,
  playerMaxSpirit: 100,
  ghostMaxHealth: 40,
  bossMaxHealth: 600,
  lanternCount: 7,
  attackRange: 190,
  attackDamage: 20,
  bossDamage: 30,
  ghostContactDamage: 12
};

const $ = (id) => document.getElementById(id);

const state = {
  ready: false,
  running: false,
  paused: false,
  gameOver: false,
  winning: false,
  saving: false,
  saved: false,

  user: null,
  progress: null,

  x: 500,
  y: 1600,
  facingX: 1,
  facingY: 0,

  health: 100,
  spirit: 100,
  score: 0,
  lanterns: 0,
  ghostsKilled: 0,
  elapsed: 0,

  bossActive: false,
  bossHealth: CONFIG.bossMaxHealth,
  bossX: 4100,
  bossY: 1050,

  attackCooldown: 0,
  dashCooldown: 0,
  skillCooldown: 0,
  damageCooldown: 0,
  bossAttackCooldown: 0,

  keys: new Set(),
  joystickX: 0,
  joystickY: 0,
  lastFrame: 0,
  animationFrame: 0
};

const lanterns = [];
const ghosts = [];

const audio = {
  music: $("bgMusic"),
  wind: $("ambientWind"),
  rain: $("rainSound"),
  slash: $("swordSlash"),
  dash: $("heroDash"),
  light: $("lanternLight"),
  boss: $("bossRoar"),
  victory: $("victorySound"),
  gameOver: $("gameOverSound"),
  portal: $("portalSound"),
  click: $("buttonClick")
};

/* -------------------- UTILITIES -------------------- */

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function distance(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}

function notify(message, duration = 2400) {
  const box = $("notificationContainer");

  if (!box) {
    console.log("[VIDLYRA]", message);
    return;
  }

  const item = document.createElement("div");
  item.className = "gameNotification";
  item.textContent = message;

  Object.assign(item.style, {
    marginBottom: "8px",
    padding: "12px 18px",
    background: "rgba(8,8,8,.92)",
    border: "1px solid #ff8a00",
    borderRadius: "12px",
    color: "#fff",
    boxShadow: "0 0 18px rgba(255,138,0,.25)"
  });

  box.appendChild(item);

  setTimeout(() => item.remove(), duration);
}

function setText(id, value) {
  const el = $(id);
  if (el) el.textContent = String(value);
}

function setWidth(id, percentage) {
  const el = $(id);
  if (el) el.style.width = `${clamp(percentage, 0, 100)}%`;
}

function showScreen(id) {
  const el = $(id);
  if (el) {
    el.style.display = "flex";
    el.classList.add("active");
  }
}

function hideScreen(id) {
  const el = $(id);
  if (el) {
    el.style.display = "none";
    el.classList.remove("active");
  }
}

function playSound(name, volume = 0.8) {
  const sound = audio[name];

  if (!sound) return;

  try {
    sound.volume = clamp(volume, 0, 1);
    sound.currentTime = 0;

    const promise = sound.play();
    if (promise) promise.catch(() => {});
  } catch (error) {
    console.debug("Audio unavailable:", name);
  }
}

function stopSound(name) {
  const sound = audio[name];
  if (!sound) return;

  sound.pause();

  try {
    sound.currentTime = 0;
  } catch (_) {}
}

/* -------------------- SUPABASE ACCESS CONTROL -------------------- */

async function authenticateAndLoadProgress() {
  setLoading(10, "Connecting to VIDLYRA festival...");

  const {
    data: { session },
    error: sessionError
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw new Error("Unable to verify your login. Please try again.");
  }

  if (!session?.user) {
    throw new Error(
      "Please sign in before entering Day 5. Your festival progress must be verified."
    );
  }

  state.user = session.user;

  setLoading(30, "Verifying Day 4 completion...");

  const { data, error } = await supabase
    .from("festival_progress")
    .select("user_id, festival, day4, day5")
    .eq("user_id", state.user.id)
    .eq("festival", CONFIG.festival)
    .maybeSingle();

  if (error) {
    console.error("Progress lookup failed:", error);
    throw new Error(
      "Unable to verify festival progress. Check your Supabase configuration and permissions."
    );
  }

  if (!data) {
    throw new Error(
      "No Halloween Fest 2026 progress record was found for your account."
    );
  }

  if (data.day4 !== true) {
    throw new Error(
      "Day 5 is locked. Complete Day 4 before entering the Haunted Cemetery."
    );
  }

  state.progress = data;

  setLoading(55, "Loading the Haunted Cemetery...");

  return true;
}

async function saveDay5Completion() {
  if (!state.user || !state.progress) {
    throw new Error("Your authenticated festival progress is unavailable.");
  }

  if (!state.bossActive || state.bossHealth > 0) {
    throw new Error("The Ghost King must be defeated before completing Day 5.");
  }

  if (state.lanterns !== CONFIG.lanternCount) {
    throw new Error("Restore all seven Spirit Lanterns first.");
  }

  if (ghosts.some(ghost => ghost.alive)) {
    throw new Error("Defeat every Cemetery Ghost before completing Day 5.");
  }

  if (state.saved) return true;
  if (state.saving) return false;

  state.saving = true;

  const continueButton = $("continueButton");

  if (continueButton) {
    continueButton.disabled = true;
    continueButton.textContent = "SAVING PROGRESS...";
  }

  try {
    const { data, error } = await supabase
      .from("festival_progress")
      .update({ day5: true })
      .eq("user_id", state.user.id)
      .eq("festival", CONFIG.festival)
      .eq("day4", true)
      .select("user_id, festival, day4, day5");

    if (error) throw error;

    if (!data || data.length !== 1 || data[0].day5 !== true) {
      throw new Error(
        "Supabase did not confirm the Day 5 completion update."
      );
    }

    state.progress = data[0];
    state.saved = true;

    if (continueButton) {
      continueButton.disabled = false;
      continueButton.textContent = "CONTINUE TO DAY 6";
    }

    notify("Day 5 completion saved successfully!");
    return true;

  } catch (error) {
    console.error("Day 5 progress save failed:", error);

    if (continueButton) {
      continueButton.disabled = false;
      continueButton.textContent = "RETRY SAVE";
    }

    notify("Progress could not be saved. Please retry.", 4000);
    return false;

  } finally {
    state.saving = false;
  }
}

function setLoading(percent, message) {
  setWidth("loadingFill", percent);
  setText("loadingPercent", `${Math.round(percent)}%`);
  setText("loadingMessage", message);
}

function showFatalError(message) {
  console.error(message);

  setText("loadingMessage", message);
  setText("loadingPercent", "ACCESS BLOCKED");

  const fill = $("loadingFill");

  if (fill) {
    fill.style.width = "100%";
    fill.style.background = "#b00020";
  }

  // Keep the loading/access screen visible.
  // Do not start the game without verified access.

  const screen = $("loadingScreen");
  if (screen) screen.style.display = "flex";

  let retryButton = $("accessRetryButton");

  if (!retryButton) {
    retryButton = document.createElement("button");
    retryButton.id = "accessRetryButton";
    retryButton.textContent = "RETRY ACCESS CHECK";

    Object.assign(retryButton.style, {
      padding: "14px 24px",
      border: "1px solid #ff8a00",
      borderRadius: "10px",
      background: "#161616",
      color: "#fff",
      cursor: "pointer",
      fontWeight: "700"
    });

    $("loadingScreen")
      ?.querySelector(".loadingContent")
      ?.appendChild(retryButton);
  }

  retryButton.onclick = async () => {
    retryButton.disabled = true;

    try {
      await bootGame();
    } catch (error) {
      showFatalError(error.message);
    } finally {
      retryButton.disabled = false;
    }
  };
}

/* -------------------- INITIALIZATION -------------------- */

async function bootGame() {
  state.ready = false;
  state.running = false;

  if ($("accessRetryButton")) {
    $("accessRetryButton").remove();
  }

  try {
    await authenticateAndLoadProgress();

    setLoading(70, "Preparing spirits and lanterns...");

    initializeLanterns();
    initializeGhosts();
    initializeDecorations();
    initializeControls();
    initializeSettings();
    initializeAudio();
    updateHUD();
    updateMiniMap();

    setLoading(90, "Preparing the Ghost King...");

    await new Promise(resolve => setTimeout(resolve, 300));

    setLoading(100, "The Haunted Cemetery awaits...");

    const loading = $("loadingScreen");

    if (loading) {
      loading.style.opacity = "0";

      await new Promise(resolve => setTimeout(resolve, 550));

      loading.style.display = "none";
    }

    state.ready = true;
    state.running = true;
    state.lastFrame = performance.now();

    showScreen("dialogueContainer");
    setText(
      "dialogueText",
      "Seven Spirit Lanterns are scattered across this cemetery. Restore them, defeat the restless ghosts, and face the Ghost King."
    );

    requestAnimationFrame(gameLoop);

  } catch (error) {
    showFatalError(error.message || "Unable to initialize Day 5.");
  }
}

/* -------------------- LANTERNS -------------------- */


/* =========================================================
   FIXED LANTERN COLLECTION — DAY 5
========================================================= */

function initLanterns() {
    LANTERNS.length = 0;

    const elements = Array.from(
        document.querySelectorAll("#lanternLayer .lantern")
    );

    elements.forEach((element, index) => {
        const angle =
            (index / Math.max(1, elements.length)) *
            Math.PI * 2;

        const radius = 1100;

        const x = clamp(
            2500 + Math.cos(angle) * radius,
            200,
            CONFIG.WORLD_WIDTH - 200
        );

        const y = clamp(
            1200 + Math.sin(angle) * radius * 0.55,
            200,
            CONFIG.WORLD_HEIGHT - 200
        );

        element.style.position = "absolute";
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;
        element.style.pointerEvents = "auto";
        element.style.cursor = "pointer";
        element.style.zIndex = "20";

        const data = {
            id: index + 1,
            element,
            x,
            y,
            lit: false,
            inRange: false
        };

        LANTERNS.push(data);

        // Mouse and touchscreen collection.
        element.addEventListener("click", () => {
            if (data.lit) return;
            lightLantern(data);
        });

        element.addEventListener("touchend", (event) => {
            event.preventDefault();
            if (data.lit) return;
            lightLantern(data);
        }, { passive: false });
    });

    updateLanternCounter();

    console.log(
        `[Day 5] ${LANTERNS.length} lanterns initialized`
    );
}


/* =========================================================
   PROXIMITY COLLECTION
   Walk near a lantern to collect it automatically.
========================================================= */

function updateLanternProximity() {
    let nearestLantern = null;
    let nearestDistance = Infinity;

    LANTERNS.forEach((lantern) => {
        if (lantern.lit) return;

        const distance = distanceBetween(
            PLAYER.x,
            PLAYER.y,
            lantern.x,
            lantern.y
        );

        lantern.inRange = distance <= 300;

        lantern.element.classList.toggle(
            "inRange",
            lantern.inRange
        );

        if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestLantern = lantern;
        }

        // Generous pickup range to account for sprite size.
        if (distance <= 220) {
            lightLantern(lantern);
        }
    });

    if (interactionPrompt) {
        if (nearestLantern && nearestDistance <= 300) {
            interactionPrompt.style.display = "flex";
            interactionPrompt.textContent =
                "WALK CLOSER OR PRESS F TO COLLECT";
        } else {
            interactionPrompt.style.display = "none";
        }
    }
}


/* =========================================================
   INTERACT KEY / MOBILE BUTTON
========================================================= */

function tryInteract() {
    if (!GAME.running || GAME.paused || GAME.gameOver) return;

    let nearestLantern = null;
    let nearestDistance = Infinity;

    LANTERNS.forEach((lantern) => {
        if (lantern.lit) return;

        const distance = distanceBetween(
            PLAYER.x,
            PLAYER.y,
            lantern.x,
            lantern.y
        );

        if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestLantern = lantern;
        }
    });

    if (nearestLantern && nearestDistance <= 400) {
        lightLantern(nearestLantern);
        return;
    }

    showNotification("MOVE CLOSER TO A SPIRIT LANTERN");
}

function collectLantern(lantern) {
  if (lantern.collected || state.gameOver || state.winning) return;

  lantern.collected = true;
  state.lanterns++;
  state.score += 500;
  state.spirit = Math.min(100, state.spirit + 10);

  lantern.element.style.display = "none";

  if (lantern.mini) {
    lantern.mini.style.opacity = "0";
  }

  playSound("light", 0.9);

  updateHUD();

  notify(`Spirit Lantern ${state.lanterns}/7 restored!`);

  setText(
    "objectiveTracker",
    state.lanterns === 7
      ? "Defeat the remaining Cemetery Ghosts"
      : "Restore the remaining Spirit Lanterns"
  );

  updateMission("mission1", state.lanterns === 7);

  if (state.lanterns === 7) {
    notify("All lanterns restored! The cemetery spirits are weakening.");
    checkBossUnlock();
  }
}

/* -------------------- GHOSTS -------------------- */

function initializeGhosts() {
  ghosts.length = 0;

  const positions = [
    [1100, 1200],
    [1550, 1750],
    [1850, 600],
    [2350, 1100],
    [2800, 1750],
    [3150, 1050],
    [3550, 500],
    [3900, 1700],
    [4200, 600],
    [4550, 1050]
  ];

  positions.forEach(([x, y], index) => {
    const element = $(`ghost${index + 1}`);

    if (!element) return;

    const ghost = {
      id: index + 1,
      x,
      y,
      health: CONFIG.ghostMaxHealth,
      maxHealth: CONFIG.ghostMaxHealth,
      alive: true,
      speed: 65 + Math.random() * 25,
      attackCooldown: Math.random(),
      element,
      healthFill: element.querySelector(".enemyHealthFill")
    };

    Object.assign(element.style, {
      left: `${x}px`,
      top: `${y}px`,
      display: "flex"
    });

    ghosts.push(ghost);
  });

  setText("aliveGhosts", ghosts.length);
}

function updateGhosts(dt) {
  for (const ghost of ghosts) {
    if (!ghost.alive) continue;

    const d = distance(state.x, state.y, ghost.x, ghost.y);

    if (d < 650 && d > 65) {
      const dx = (state.x - ghost.x) / d;
      const dy = (state.y - ghost.y) / d;

      ghost.x += dx * ghost.speed * dt;
      ghost.y += dy * ghost.speed * dt;
    }

    ghost.x = clamp(ghost.x, 80, CONFIG.worldWidth - 100);
    ghost.y = clamp(ghost.y, 100, CONFIG.worldHeight - 100);

    ghost.element.style.left = `${ghost.x}px`;
    ghost.element.style.top = `${ghost.y}px`;

    ghost.attackCooldown -= dt;

    if (d < 105 && ghost.attackCooldown <= 0) {
      damagePlayer(CONFIG.ghostContactDamage);
      ghost.attackCooldown = 1.1;
    }

    if (ghost.healthFill) {
      setWidth(
        ghost.healthFill.id,
        (ghost.health / ghost.maxHealth) * 100
      );
    }
  }
}

function damageGhost(ghost, amount) {
  if (!ghost.alive) return;

  ghost.health = Math.max(0, ghost.health - amount);

  if (ghost.healthFill) {
    ghost.healthFill.style.width =
      `${(ghost.health / ghost.maxHealth) * 100}%`;
  }

  if (ghost.health <= 0) {
    ghost.alive = false;
    ghost.element.style.display = "none";

    state.ghostsKilled++;
    state.score += 250;

    setText("ghostKillCount", state.ghostsKilled);
    setText("aliveGhosts", ghosts.filter(g => g.alive).length);

    notify(`Cemetery Ghost ${ghost.id} defeated!`);

    updateMission(
      "mission2",
      ghosts.every(g => !g.alive)
    );

    checkBossUnlock();
  }
}

/* -------------------- GHOST KING -------------------- */

function checkBossUnlock() {
  const allLanterns = lanterns.length === 7 &&
    lanterns.every(lantern => lantern.collected);

  const allGhostsDefeated =
    ghosts.length > 0 && ghosts.every(ghost => !ghost.alive);

  if (!allLanterns || !allGhostsDefeated || state.bossActive) {
    return;
  }

  state.bossActive = true;

  const boss = $("ghostKing");

  if (boss) {
    boss.style.display = "flex";
    boss.style.left = `${state.bossX}px`;
    boss.style.top = `${state.bossY}px`;
  }

  const bossHud = $("bossHUD");
  if (bossHud) bossHud.style.display = "block";

  const gameState = $("gameState");
  if (gameState) gameState.dataset.boss = "active";

  showScreen("bossIntroScreen");

  playSound("boss", 1);

  notify("THE GHOST KING HAS AWAKENED!", 4000);

  setTimeout(() => {
    hideScreen("bossIntroScreen");
    showScreen("bossWarning");

    setTimeout(() => hideScreen("bossWarning"), 2200);
  }, 2400);

  updateMission("mission3", false);
}

function updateBoss(dt) {
  if (!state.bossActive || state.bossHealth <= 0) return;

  const boss = $("ghostKing");
  if (!boss) return;

  const d = distance(
    state.x,
    state.y,
    state.bossX,
    state.bossY
  );

  if (d > 130 && d < 850) {
    const dx = (state.x - state.bossX) / d;
    const dy = (state.y - state.bossY) / d;

    state.bossX += dx * 55 * dt;
    state.bossY += dy * 55 * dt;
  }

  boss.style.left = `${state.bossX}px`;
  boss.style.top = `${state.bossY}px`;

  state.bossAttackCooldown -= dt;

  if (d < 175 && state.bossAttackCooldown <= 0) {
    damagePlayer(CONFIG.bossDamage);
    state.bossAttackCooldown = 1.5;
  }

  setWidth(
    "bossHealthFill",
    (state.bossHealth / CONFIG.bossMaxHealth) * 100
  );
}

function damageBoss(amount) {
  if (!state.bossActive || state.bossHealth <= 0) return;

  state.bossHealth = Math.max(0, state.bossHealth - amount);

  setWidth(
    "bossHealthFill",
    (state.bossHealth / CONFIG.bossMaxHealth) * 100
  );

  if (state.bossHealth === 0) {
    defeatBoss();
  }
}

async function defeatBoss() {
  if (state.winning || state.gameOver) return;

  state.winning = true;
  state.running = false;

  const boss = $("ghostKing");
  if (boss) boss.style.display = "none";

  stopSound("music");
  playSound("victory", 1);

  state.score += 5000;

  setText("objectiveTracker", "The cemetery has been purified");
  updateMission("mission3", true);
  updateHUD();

  showScreen("victoryScreen");

  const button = $("continueButton");

  if (button) {
    button.disabled = true;
    button.textContent = "SAVING PROGRESS...";
  }

  const saved = await saveDay5Completion();

  if (!saved) {
    notify("Victory achieved, but saving failed. Retry when ready.", 4500);
  }
}

/* -------------------- PLAYER COMBAT -------------------- */

function attack() {
  if (!state.running || state.paused || state.gameOver ||
      state.winning || state.attackCooldown > 0) return;

  state.attackCooldown = 0.42;

  const sword = $("playerSword");
  const slash = $("slashEffect");

  if (sword) {
    sword.style.transform = "rotate(-70deg)";

    setTimeout(() => {
      sword.style.transform = "";
    }, 160);
  }

  if (slash) {
    slash.style.opacity = "1";
    slash.style.transform = "translate(-50%,-50%) scale(1.25)";

    setTimeout(() => {
      slash.style.opacity = "0";
      slash.style.transform = "translate(-50%,-50%) scale(1)";
    }, 180);
  }

  playSound("slash", 0.8);

  for (const ghost of ghosts) {
    if (!ghost.alive) continue;

    if (distance(state.x, state.y, ghost.x, ghost.y) <
        CONFIG.attackRange) {
      damageGhost(ghost, CONFIG.attackDamage);
    }
  }

  if (
    state.bossActive &&
    state.bossHealth > 0 &&
    distance(state.x, state.y, state.bossX, state.bossY) < 280
  ) {
    damageBoss(CONFIG.attackDamage);
  }
}

function dash() {
  if (!state.running || state.paused ||
      state.dashCooldown > 0 || state.gameOver || state.winning) {
    return;
  }

  state.dashCooldown = 1.1;

  let dx = state.facingX;
  let dy = state.facingY;

  if (Math.hypot(dx, dy) < 0.1) dx = 1;

  state.x += dx * 210;
  state.y += dy * 210;

  clampPlayer();

  const trail = $("dashTrail");

  if (trail) {
    trail.style.opacity = "1";
    setTimeout(() => trail.style.opacity = "0", 250);
  }

  playSound("dash", 0.75);
  renderPlayer();
}

function spiritSkill() {
  if (!state.running || state.paused ||
      state.skillCooldown > 0 || state.spirit < 25 ||
      state.gameOver || state.winning) {
    notify("Spirit energy is insufficient or the skill is cooling down.");
    return;
  }

  state.spirit -= 25;
  state.skillCooldown = 4;

  const radius = 380;

  for (const ghost of ghosts) {
    if (
      ghost.alive &&
      distance(state.x, state.y, ghost.x, ghost.y) <= radius
    ) {
      damageGhost(ghost, 35);
    }
  }

  if (
    state.bossActive &&
    state.bossHealth > 0 &&
    distance(state.x, state.y, state.bossX, state.bossY) <= radius
  ) {
    damageBoss(55);
  }

  const flash = $("screenFlash");

  if (flash) {
    flash.style.opacity = "0.8";
    setTimeout(() => flash.style.opacity = "0", 220);
  }

  state.score += 50;
  updateHUD();

  notify("SPIRIT BURST!");
}

function damagePlayer(amount) {
  if (state.damageCooldown > 0 || state.gameOver || state.winning) {
    return;
  }

  state.damageCooldown = 0.7;
  state.health = Math.max(0, state.health - amount);

  const overlay = $("damageOverlay");

  if (overlay) {
    overlay.style.opacity = "0.8";
    setTimeout(() => overlay.style.opacity = "0", 180);
  }

  updateHUD();

  if (state.health <= 0) {
    endGame();
  }
}

function endGame() {
  if (state.gameOver || state.winning) return;

  state.gameOver = true;
  state.running = false;

  stopSound("music");
  playSound("gameOver", 1);

  showScreen("gameOverScreen");
}

/* -------------------- PLAYER MOVEMENT -------------------- */

function clampPlayer() {
  state.x = clamp(state.x, 50, CONFIG.worldWidth - 100);
  state.y = clamp(state.y, 50, CONFIG.worldHeight - 100);
}

function updatePlayer(dt) {
  let dx = 0;
  let dy = 0;

  if (state.keys.has("w") || state.keys.has("arrowup")) dy--;
  if (state.keys.has("s") || state.keys.has("arrowdown")) dy++;
  if (state.keys.has("a") || state.keys.has("arrowleft")) dx--;
  if (state.keys.has("d") || state.keys.has("arrowright")) dx++;

  dx += state.joystickX;
  dy += state.joystickY;

  const length = Math.hypot(dx, dy);

  if (length > 0) {
    dx /= Math.max(1, length);
    dy /= Math.max(1, length);

    state.facingX = dx;
    state.facingY = dy;

    state.x += dx * CONFIG.playerSpeed * dt;
    state.y += dy * CONFIG.playerSpeed * dt;

    clampPlayer();
  }

  state.attackCooldown = Math.max(0, state.attackCooldown - dt);
  state.dashCooldown = Math.max(0, state.dashCooldown - dt);
  state.skillCooldown = Math.max(0, state.skillCooldown - dt);
  state.damageCooldown = Math.max(0, state.damageCooldown - dt);

  state.spirit = Math.min(100, state.spirit + 2 * dt);

  renderPlayer();
}

function renderPlayer() {
  const player = $("playerContainer");
  if (!player) return;

  player.style.left = `${state.x}px`;
  player.style.top = `${state.y}px`;

  const sprite = $("playerSprite");

  if (sprite) {
    sprite.style.transform =
      state.facingX < -0.1 ? "scaleX(-1)" : "scaleX(1)";
  }

  const world = $("gameWorld");

  if (world) {
    const viewWidth = window.innerWidth;
    const viewHeight = window.innerHeight;

    const cameraX = clamp(
      state.x - viewWidth / 2,
      0,
      CONFIG.worldWidth - viewWidth
    );

    const cameraY = clamp(
      state.y - viewHeight / 2,
      0,
      CONFIG.worldHeight - viewHeight
    );

    world.style.transform =
      `translate(${-cameraX}px, ${-cameraY}px)`;
  }
}

/* -------------------- HUD AND MINI-MAP -------------------- */

function updateHUD() {
  setWidth("healthFill", state.health);
  setWidth("spiritFill", state.spirit);

  setText("healthText", `${Math.ceil(state.health)} / 100`);
  setText("spiritText", `${Math.floor(state.spirit)} / 100`);
  setText("lanternCounter", `${state.lanterns} / 7`);
  setText("scoreCounter", String(state.score).padStart(6, "0"));

  setText("statSpirit", Math.floor(state.spirit));
  setText("ghostKillCount", state.ghostsKilled);
  setText("aliveGhosts", ghosts.filter(g => g.alive).length);
  setText("activeLanterns", state.lanterns);

  const gameState = $("gameState");

  if (gameState) {
    gameState.dataset.health = String(Math.ceil(state.health));
    gameState.dataset.spirit = String(Math.floor(state.spirit));
    gameState.dataset.score = String(state.score);
    gameState.dataset.lanterns = String(state.lanterns);
    gameState.dataset.ghosts = String(
      ghosts.filter(g => g.alive).length
    );
  }

  const minutes = Math.floor(state.elapsed / 60);
  const seconds = Math.floor(state.elapsed % 60);

  setText(
    "gameTimer",
    `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
  );

  setText("playerX", Math.round(state.x));
  setText("playerY", Math.round(state.y));
}

function updateMiniMap() {
  const player = $("miniPlayer");
  const map = $("miniMapFrame");

  if (!player || !map) return;

  const width = map.clientWidth;
  const height = map.clientHeight;

  const mapX = (state.x / CONFIG.worldWidth) * width;
  const mapY = (state.y / CONFIG.worldHeight) * height;

  player.style.left = `${mapX}px`;
  player.style.top = `${mapY}px`;

  for (const lantern of lanterns) {
    if (!lantern.mini) continue;

    lantern.mini.style.left =
      `${(lantern.x / CONFIG.worldWidth) * width}px`;

    lantern.mini.style.top =
      `${(lantern.y / CONFIG.worldHeight) * height}px`;

    lantern.mini.style.opacity = lantern.collected ? "0" : "1";
  }

  const miniBoss = $("miniBoss");

  if (miniBoss) {
    miniBoss.style.left =
      `${(state.bossX / CONFIG.worldWidth) * width}px`;

    miniBoss.style.top =
      `${(state.bossY / CONFIG.worldHeight) * height}px`;

    miniBoss.style.display =
      state.bossActive && state.bossHealth > 0 ? "block" : "none";
  }

  const compass = $("compassNeedle");

  if (compass) {
    const targetX = state.bossX - state.x;
    const targetY = state.bossY - state.y;

    compass.style.transform =
      `rotate(${Math.atan2(targetX, -targetY)}rad)`;
  }
}

function updateMission(id, completed) {
  const element = $(id);
  if (!element) return;

  element.classList.toggle("completed", completed);
  element.classList.toggle("active", !completed);

  if (completed && !element.textContent.startsWith("✓")) {
    element.textContent = `✓ ${element.textContent}`;
  }
}

/* -------------------- GAME LOOP -------------------- */

function gameLoop(timestamp) {
  if (!state.ready) return;

  const dt = Math.min(
    Math.max((timestamp - state.lastFrame) / 1000, 0),
    0.05
  );

  state.lastFrame = timestamp;

  if (state.running && !state.paused &&
      !state.gameOver && !state.winning) {
    state.elapsed += dt;

    updatePlayer(dt);
    updateGhosts(dt);
    updateBoss(dt);
    updateHUD();
    updateMiniMap();

    state.animationFrame++;

    if (state.animationFrame % 120 === 0) {
      setText("fpsCounter", "FPS: " + Math.round(1 / Math.max(dt, 0.001)));
      setText("fpsValue", Math.round(1 / Math.max(dt, 0.001)));
    }
  }

  requestAnimationFrame(gameLoop);
}

/* -------------------- INTERACTION -------------------- */

function interact() {
  if (!state.running || state.paused) return;

  const nearby = lanterns.find(
    lantern => !lantern.collected &&
      distance(state.x, state.y, lantern.x, lantern.y) < 190
  );

  if (nearby) {
    collectLantern(nearby);
    return;
  }

  if (state.bossActive &&
      distance(state.x, state.y, state.bossX, state.bossY) < 230) {
    attack();
    return;
  }

  notify("Explore the cemetery and find the nearest Spirit Lantern.");
}

function togglePause() {
  if (!state.ready || state.gameOver || state.winning) return;

  state.paused = !state.paused;
  state.running = !state.paused;

  if (state.paused) {
    showScreen("pauseMenu");
    if (audio.music) audio.music.pause();
  } else {
    hideScreen("pauseMenu");
    if (audio.music) audio.music.play().catch(() => {});
    state.lastFrame = performance.now();
  }
}

function restartGame() {
  // Reloading resets the encounter, but never clears saved progress.
  window.location.reload();
}

/* -------------------- CONTROLS -------------------- */

function initializeControls() {
  document.addEventListener("keydown", event => {
    const key = event.key.toLowerCase();

    if ([
      "arrowup", "arrowdown", "arrowleft", "arrowright", " "
    ].includes(key)) {
      event.preventDefault();
    }

    state.keys.add(key);

    if (event.repeat) return;

    if (key === " " || key === "j") attack();
    if (key === "shift" || key === "k") dash();
    if (key === "e" || key === "l") spiritSkill();
    if (key === "f") interact();
    if (key === "escape" || key === "p") togglePause();
    if (key === "i") {
      $("inventoryPanel")?.classList.toggle("active");
    }
    if (key === "q") {
      $("questPanel")?.classList.toggle("active");
    }
  });

  document.addEventListener("keyup", event => {
    state.keys.delete(event.key.toLowerCase());
  });

  $("attackButton")?.addEventListener("click", attack);
  $("dashButton")?.addEventListener("click", dash);
  $("skillButton")?.addEventListener("click", spiritSkill);
  $("interactButton")?.addEventListener("click", interact);
  $("pauseButton")?.addEventListener("click", togglePause);

  $("resumeButton")?.addEventListener("click", togglePause);
  $("restartButton")?.addEventListener("click", restartGame);

  $("closeInventory")?.addEventListener("click", () => {
    $("inventoryPanel")?.classList.remove("active");
  });

  $("nextDialogue")?.addEventListener("click", () => {
    hideScreen("dialogueContainer");
  });

  $("continueButton")?.addEventListener("click", async () => {
    if (!state.saved) {
      const saved = await saveDay5Completion();
      if (!saved) return;
    }

    if (state.saved) {
      window.location.assign(CONFIG.nextPage);
    }
  });

  $("retryGameButton")?.addEventListener("click", restartGame);

  $("quitEventButton")?.addEventListener("click", () => {
    window.location.assign("index.html");
  });

  $("exitGameButton")?.addEventListener("click", () => {
    window.location.assign("index.html");
  });

  $("openSettingsButton")?.addEventListener("click", () => {
    hideScreen("pauseMenu");
    showScreen("settingsPanel");
  });

  $("closeSettingsButton")?.addEventListener("click", () => {
    hideScreen("settingsPanel");
    showScreen("pauseMenu");
  });

  $("muteButton")?.addEventListener("click", () => {
    const muted = !audio.music?.muted;

    Object.values(audio).forEach(sound => {
      if (sound instanceof HTMLAudioElement) sound.muted = muted;
    });

    setText("muteButton", muted ? "🔇" : "🔊");
  });

  initializeJoystick();
}

function initializeJoystick() {
  const base = $("joystickBase");
  const stick = $("joystickStick");

  if (!base || !stick) return;

  let activePointer = null;

  function moveJoystick(event) {
    const rect = base.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let dx = event.clientX - centerX;
    let dy = event.clientY - centerY;

    const max = rect.width * 0.34;
    const length = Math.hypot(dx, dy);

    if (length > max) {
      dx = dx / length * max;
      dy = dy / length * max;
    }

    state.joystickX = dx / max;
    state.joystickY = dy / max;

    stick.style.transform =
      `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
  }

  base.addEventListener("pointerdown", event => {
    activePointer = event.pointerId;
    base.setPointerCapture(event.pointerId);
    moveJoystick(event);
  });

  base.addEventListener("pointermove", event => {
    if (event.pointerId === activePointer) moveJoystick(event);
  });

  function releaseJoystick(event) {
    if (event.pointerId !== activePointer) return;

    activePointer = null;
    state.joystickX = 0;
    state.joystickY = 0;

    stick.style.transform = "translate(-50%,-50%)";
  }

  base.addEventListener("pointerup", releaseJoystick);
  base.addEventListener("pointercancel", releaseJoystick);

  if (window.matchMedia("(pointer: coarse)").matches) {
    const controls = $("mobileControls");
    if (controls) controls.style.display = "flex";
  }
}

/* -------------------- SETTINGS AND AUDIO -------------------- */

function initializeSettings() {
  $("musicSlider")?.addEventListener("input", event => {
    const volume = Number(event.target.value) / 100;
    if (audio.music) audio.music.volume = volume;
    if (audio.wind) audio.wind.volume = volume * 0.45;
    if (audio.rain) audio.rain.volume = volume * 0.35;
  });

  $("effectsSlider")?.addEventListener("input", event => {
    const volume = Number(event.target.value) / 100;

    [
      audio.slash,
      audio.dash,
      audio.light,
      audio.boss,
      audio.victory,
      audio.gameOver
    ].forEach(sound => {
      if (sound) sound.volume = volume;
    });
  });

  $("brightnessSlider")?.addEventListener("input", event => {
    const brightness = Number(event.target.value) / 100;

    const world = $("gameWorld");

    if (world) world.style.filter = `brightness(${brightness})`;
  });

  $("screenShakeToggle")?.addEventListener("change", event => {
    document.body.dataset.screenShake =
      event.target.checked ? "enabled" : "disabled";
  });
}

function initializeAudio() {
  // Browsers require a user gesture before audio can play.
  const startAudio = () => {
    if (!state.ready || state.paused) return;

    if (audio.music) audio.music.play().catch(() => {});
    if (audio.wind) audio.wind.play().catch(() => {});
    if (audio.rain) audio.rain.play().catch(() => {});

    document.removeEventListener("pointerdown", startAudio);
    document.removeEventListener("keydown", startAudio);
  };

  document.addEventListener("pointerdown", startAudio);
  document.addEventListener("keydown", startAudio);
}

/* -------------------- DECORATIONS -------------------- */

function initializeDecorations() {
  const batLayer = $("batLayer");

  if (batLayer && !batLayer.dataset.initialized) {
    batLayer.dataset.initialized = "true";

    for (let i = 0; i < 12; i++) {
      const bat = document.createElement("div");

      bat.className = "bat";
      bat.style.top = `${100 + Math.random() * 1500}px`;
      bat.style.animationDuration = `${18 + Math.random() * 30}s`;
      bat.style.animationDelay = `${-Math.random() * 25}s`;

      batLayer.appendChild(bat);
    }
  }

  const treePositions = [
    ["deadTree1", 300, 1450],
    ["deadTree2", 2300, 1000],
    ["deadTree3", 4000, 1450]
  ];

  for (const [id, x, y] of treePositions) {
    const element = $(id);

    if (element) {
      element.style.left = `${x}px`;
      element.style.top = `${y}px`;
    }
  }

  const gravePositions = [
    ["grave1", 600, 1250],
    ["grave2", 1250, 1000],
    ["grave3", 1900, 1600],
    ["grave4", 2500, 1200],
    ["grave5", 3300, 900],
    ["grave6", 4200, 1600]
  ];

  for (const [id, x, y] of gravePositions) {
    const element = $(id);

    if (element) {
      element.style.left = `${x}px`;
      element.style.top = `${y}px`;
    }
  }
}

/* -------------------- START -------------------- */

bootGame().catch(error => {
  showFatalError(error.message || "An unexpected error occurred.");
});
