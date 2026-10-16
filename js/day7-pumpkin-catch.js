
import { supabase } from "./supabase.js";

const FESTIVAL = "halloween_2026";
const TARGET_SCORE = 15;
const GAME_SECONDS = 45;
const NEXT_PAGE = "day7-ghost-memory.html";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const livesEl = document.getElementById("lives");
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlayText = document.getElementById("overlayText");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const statusEl = document.getElementById("status");

let userId = null;
let ready = false;
let running = false;
let finished = false;
let score = 0;
let lives = 3;
let timeLeft = GAME_SECONDS;
let items = [];
let particles = [];
let playerX = 0;
let spawnClock = 0;
let lastFrame = 0;
let elapsed = 0;
let animationId = 0;
let saved = false;

const W = 800;
const H = 1000;

canvas.width = W;
canvas.height = H;
playerX = W / 2;

function status(message, error = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle("error", error);
}

function updateHud() {
  scoreEl.textContent = String(score);
  timeEl.textContent = String(Math.max(0, Math.ceil(timeLeft)));
  livesEl.textContent = "❤️".repeat(lives) + "🖤".repeat(3 - lives);
}

function resizeCanvas() {
  // CSS controls display size. The internal game coordinate system stays fixed.
  draw();
}

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function spawnItem() {
  const ghost = Math.random() < 0.27;

  items.push({
    x: random(45, W - 45),
    y: -50,
    radius: ghost ? 32 : 36,
    speed: random(240, 390),
    type: ghost ? "ghost" : "pumpkin",
    wobble: random(0, Math.PI * 2)
  });
}

function makeParticles(x, y, symbol) {
  particles.push({
    x, y,
    symbol,
    life: 0.65,
    vy: -80
  });
}

function drawBackground() {
  const gradient = ctx.createLinearGradient(0, 0, 0, H);
  gradient.addColorStop(0, "#17102b");
  gradient.addColorStop(0.55, "#0b1220");
  gradient.addColorStop(1, "#241006");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, H);

  // Moon
  ctx.beginPath();
  ctx.arc(W * 0.78, H * 0.13, 75, 0, Math.PI * 2);
  ctx.fillStyle = "#ff8a0030";
  ctx.fill();

  ctx.beginPath();
  ctx.arc(W * 0.78, H * 0.13, 48, 0, Math.PI * 2);
  ctx.fillStyle = "#ff9f36";
  ctx.fill();

  // Distant haunted forest
  ctx.fillStyle = "#080b16";

  for (let i = 0; i < 9; i++) {
    const x = i * 100 - 20;
    ctx.beginPath();
    ctx.moveTo(x, H * 0.48);
    ctx.lineTo(x + 45, H * 0.25 - (i % 3) * 20);
    ctx.lineTo(x + 90, H * 0.48);
    ctx.fill();
  }

  // Ground
  ctx.fillStyle = "#130d1b";
  ctx.fillRect(0, H - 100, W, 100);

  ctx.strokeStyle = "#ff8a0030";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, H - 100);
  ctx.lineTo(W, H - 100);
  ctx.stroke();
}

function drawPlayer() {
  const y = H - 90;

  ctx.save();
  ctx.translate(playerX, y);

  ctx.shadowColor = "#ff8a00";
  ctx.shadowBlur = 25;
  ctx.fillStyle = "#ff8a00";
  ctx.beginPath();
  ctx.ellipse(0, 0, 65, 43, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.strokeStyle = "#a74a00";
  ctx.lineWidth = 5;

  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.ellipse(i * 20, 0, 13, 40, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.fillStyle = "#13200f";
  ctx.fillRect(-7, -52, 14, 15);

  ctx.fillStyle = "#271000";
  ctx.beginPath();
  ctx.moveTo(-22, -3);
  ctx.lineTo(-8, -19);
  ctx.lineTo(0, -3);
  ctx.lineTo(10, -19);
  ctx.lineTo(23, -3);
  ctx.lineTo(12, 13);
  ctx.lineTo(-12, 13);
  ctx.fill();

  ctx.restore();
}

function drawItems() {
  for (const item of items) {
    const wobble = Math.sin(item.wobble) * 5;

    ctx.save();
    ctx.translate(item.x + wobble, item.y);

    if (item.type === "pumpkin") {
      ctx.shadowColor = "#ff8a00";
      ctx.shadowBlur = 22;
      ctx.font = "64px serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("🎃", 0, 0);
    } else {
      ctx.shadowColor = "#b9c8ff";
      ctx.shadowBlur = 18;
      ctx.font = "60px serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("👻", 0, 0);
    }

    ctx.restore();
  }
}

function drawParticles(delta) {
  for (const particle of particles) {
    ctx.globalAlpha = Math.max(0, particle.life / 0.65);
    ctx.font = "36px serif";
    ctx.textAlign = "center";
    ctx.fillText(particle.symbol, particle.x, particle.y);
    particle.y += particle.vy * delta;
    particle.life -= delta;
  }

  ctx.globalAlpha = 1;
  particles = particles.filter(p => p.life > 0);
}

function draw() {
  drawBackground();
  drawItems();
  drawPlayer();
  drawParticles(0);
}

function resetGame() {
  cancelAnimationFrame(animationId);

  score = 0;
  lives = 3;
  timeLeft = GAME_SECONDS;
  items = [];
  particles = [];
  spawnClock = 0;
  elapsed = 0;
  lastFrame = 0;
  playerX = W / 2;
  running = false;
  finished = false;
  saved = false;

  updateHud();
  draw();

  overlayTitle.textContent = "READY TO CATCH?";
  overlayText.textContent =
    "Catch 15 pumpkins in 45 seconds. Three ghost hits and the game ends!";
  startBtn.textContent = "START GAME";
  startBtn.disabled = false;
  overlay.classList.remove("hidden");
}

function startGame() {
  if (!ready || running || finished) return;

  running = true;
  overlay.classList.add("hidden");
  status("Game started! Catch the pumpkins and avoid ghosts.");

  lastFrame = 0;
  animationId = requestAnimationFrame(loop);
}

function loop(timestamp) {
  if (!running) return;

  if (!lastFrame) lastFrame = timestamp;
  const delta = Math.min((timestamp - lastFrame) / 1000, 0.05);
  lastFrame = timestamp;

  elapsed += delta;
  timeLeft = Math.max(0, GAME_SECONDS - elapsed);
  spawnClock += delta;

  if (spawnClock >= 0.62) {
    spawnClock = 0;
    spawnItem();
  }

  for (const item of items) {
    item.y += item.speed * delta;
    item.wobble += delta * 3;
  }

  // Catch items when they reach the pumpkin basket.
  const basketY = H - 90;

  items = items.filter(item => {
    const nearBasket =
      item.y > basketY - 48 &&
      item.y < basketY + 45 &&
      Math.abs(item.x - playerX) < 82;

    if (nearBasket) {
      if (item.type === "pumpkin") {
        score++;
        makeParticles(item.x, item.y, "✨");
      } else {
        lives--;
        makeParticles(item.x, item.y, "💥");
      }
      return false;
    }

    return item.y < H + 70;
  });

  updateHud();
  draw();

  if (score >= TARGET_SCORE) {
    endGame(true);
    return;
  }

  if (lives <= 0 || timeLeft <= 0) {
    endGame(false);
    return;
  }

  animationId = requestAnimationFrame(loop);
}

async function endGame(won) {
  running = false;
  finished = true;
  cancelAnimationFrame(animationId);
  draw();

  overlay.classList.remove("hidden");

  if (!won) {
    overlayTitle.textContent = "THE GHOSTS WON!";
    overlayText.textContent =
      `You caught ${score} of ${TARGET_SCORE} pumpkins. Try again to unlock the next stage.`;
    startBtn.textContent = "TRY AGAIN";
    startBtn.disabled = false;
    status("Not quite! Reach 15 pumpkins to complete the game.");
    return;
  }

  overlayTitle.textContent = "PUMPKIN MASTER!";
  overlayText.textContent =
    `Amazing! You caught ${score} pumpkins with ${lives} lives remaining.`;
  startBtn.textContent = "SAVING PROGRESS…";
  startBtn.disabled = true;
  status("Saving your game progress…");

  const { error } = await supabase
    .from("festival_progress")
    .update({ day7_pumpkin_catch_completed: true })
    .eq("user_id", userId)
    .eq("festival", FESTIVAL);

  if (error) {
    saved = false;
    overlayText.textContent =
      "You won! But your progress could not be saved. Check Supabase and retry.";
    startBtn.textContent = "RETRY SAVE";
    startBtn.disabled = false;
    status("Progress save failed. Check the database column and permissions.", true);
    return;
  }

  saved = true;
  overlayText.textContent =
    `You caught ${score} pumpkins in ${Math.ceil(elapsed)} seconds. The next stage is unlocked!`;
  startBtn.textContent = "CONTINUE TO GHOST MEMORY";
  startBtn.disabled = false;
  status("Pumpkin Catch completed and saved!");
}

async function retrySave() {
  if (!finished || score < TARGET_SCORE) return;

  startBtn.disabled = true;
  status("Retrying progress save…");

  const { error } = await supabase
    .from("festival_progress")
    .update({ day7_pumpkin_catch_completed: true })
    .eq("user_id", userId)
    .eq("festival", FESTIVAL);

  startBtn.disabled = false;

  if (error) {
    status("Could not save. Check Supabase permissions and try again.", true);
    return;
  }

  saved = true;
  overlayText.textContent = "Progress saved. You can continue to the next stage.";
  startBtn.textContent = "CONTINUE TO GHOST MEMORY";
  status("Progress saved successfully.");
}

function movePlayer(event) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = W / rect.width;
  playerX = Math.max(
    70,
    Math.min(W - 70, (event.clientX - rect.left) * scaleX)
  );

  if (running) draw();
}

canvas.addEventListener("pointermove", movePlayer);

canvas.addEventListener("pointerdown", event => {
  canvas.setPointerCapture?.(event.pointerId);
  movePlayer(event);
});

startBtn.addEventListener("click", () => {
  if (saved) {
    window.location.href = NEXT_PAGE;
  } else if (finished && score >= TARGET_SCORE) {
    retrySave();
  } else if (finished) {
    resetGame();
    startGame();
  } else {
    startGame();
  }
});

restartBtn.addEventListener("click", resetGame);
window.addEventListener("resize", resizeCanvas);

async function initialize() {
  draw();
  updateHud();

  try {
    const { data: auth, error: authError } = await supabase.auth.getUser();

    if (authError || !auth?.user) {
      status("Please sign in to play Pumpkin Catch.", true);
      startBtn.disabled = true;
      return;
    }

    userId = auth.user.id;

    const { data: progress, error } = await supabase
      .from("festival_progress")
      .select(
        "day7_quiz_completed, day7_puzzle_completed, day7_pumpkin_catch_completed"
      )
      .eq("user_id", userId)
      .eq("festival", FESTIVAL)
      .maybeSingle();

    if (error || !progress) {
      status("Could not load your festival progress. Check Supabase.", true);
      startBtn.disabled = true;
      return;
    }

    if (!progress.day7_quiz_completed || !progress.day7_puzzle_completed) {
      status("Complete the Day 7 quiz and image puzzle first.", true);
      startBtn.disabled = true;
      return;
    }

    ready = true;

    if (progress.day7_pumpkin_catch_completed) {
      status("Pumpkin Catch is already completed. You can replay it.");
    } else {
      status("Ready! Catch 15 pumpkins to unlock Ghost Memory Match.");
    }

    resetGame();
  } catch (error) {
    console.error("Pumpkin Catch initialization failed:", error);
    status("Could not initialize the game. Check the browser console.", true);
    startBtn.disabled = true;
  }
}

initialize();
