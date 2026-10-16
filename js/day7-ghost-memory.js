
import { supabase } from "./supabase.js";

const FESTIVAL = "halloween_2026";
const PAIR_COUNT = 8;
const NEXT_PAGE = "day7-final-video.html";

const symbols = ["👻", "🎃", "🦇", "🕷️", "🕸️", "🧙", "💀", "🦉"];

const board = document.getElementById("board");
const matchesEl = document.getElementById("matches");
const movesEl = document.getElementById("moves");
const timerEl = document.getElementById("timer");
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
let saved = false;

let cards = [];
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let matchedPairs = 0;
let moves = 0;
let seconds = 0;
let timerId = null;
let mismatchTimeout = null;

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle("error", isError);
}

function formatTime(value) {
  const minutes = Math.floor(value / 60);
  const secs = value % 60;
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function updateStats() {
  matchesEl.textContent = `${matchedPairs} / ${PAIR_COUNT}`;
  movesEl.textContent = String(moves);
  timerEl.textContent = formatTime(seconds);
}

function shuffle(array) {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

function stopTimer() {
  if (timerId !== null) {
    clearInterval(timerId);
    timerId = null;
  }
}

function clearMismatchTimeout() {
  if (mismatchTimeout !== null) {
    clearTimeout(mismatchTimeout);
    mismatchTimeout = null;
  }
}

function createCards() {
  const deck = shuffle([...symbols, ...symbols]);
  board.replaceChildren();

  cards = deck.map((symbol, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "memory-card";
    button.dataset.symbol = symbol;
    button.dataset.index = String(index);
    button.setAttribute("aria-label", `Hidden card ${index + 1}`);
    button.setAttribute("aria-pressed", "false");

    const front = document.createElement("span");
    front.className = "front";
    front.textContent = "✦";
    front.setAttribute("aria-hidden", "true");

    const back = document.createElement("span");
    back.className = "back";
    back.textContent = symbol;
    back.setAttribute("aria-hidden", "true");

    button.append(front, back);
    button.addEventListener("click", () => flipCard(button));

    board.appendChild(button);
    return button;
  });
}

function resetGame() {
  stopTimer();
  clearMismatchTimeout();

  running = false;
  finished = false;
  saved = false;
  lockBoard = false;
  firstCard = null;
  secondCard = null;
  matchedPairs = 0;
  moves = 0;
  seconds = 0;

  createCards();
  updateStats();

  overlayTitle.textContent = "READY, SPIRIT HUNTER?";
  overlayText.textContent = "Match all eight pairs to unlock the final Halloween video.";
  startBtn.textContent = "START MEMORY GAME";
  startBtn.disabled = false;
  overlay.classList.remove("hidden");

  setStatus("Match the hidden pairs!");
}

function startGame() {
  if (!ready || running || finished) return;

  running = true;
  overlay.classList.add("hidden");
  setStatus("Game started. Find matching pairs!");

  timerId = setInterval(() => {
    seconds++;
    updateStats();
  }, 1000);
}

function flipCard(card) {
  if (!running || lockBoard) return;
  if (card === firstCard || card.classList.contains("matched")) return;
  if (card.classList.contains("revealed")) return;

  card.classList.add("revealed");
  card.setAttribute("aria-pressed", "true");

  if (!firstCard) {
    firstCard = card;
    return;
  }

  secondCard = card;
  moves++;
  updateStats();

  if (firstCard.dataset.symbol === secondCard.dataset.symbol) {
    firstCard.classList.add("matched");
    secondCard.classList.add("matched");
    firstCard.disabled = true;
    secondCard.disabled = true;

    matchedPairs++;
    firstCard = null;
    secondCard = null;
    updateStats();

    if (matchedPairs === PAIR_COUNT) {
      completeGame();
    }
  } else {
    lockBoard = true;

    mismatchTimeout = setTimeout(() => {
      firstCard?.classList.remove("revealed");
      secondCard?.classList.remove("revealed");
      firstCard?.setAttribute("aria-pressed", "false");
      secondCard?.setAttribute("aria-pressed", "false");

      firstCard = null;
      secondCard = null;
      lockBoard = false;
      mismatchTimeout = null;
    }, 750);
  }
}

async function completeGame() {
  running = false;
  finished = true;
  stopTimer();

  overlay.classList.remove("hidden");
  overlayTitle.textContent = "ALL SPIRITS REMEMBER!";
  overlayText.textContent =
    `All ${PAIR_COUNT} pairs matched in ${moves} moves and ${formatTime(seconds)}. Saving progress…`;
  startBtn.textContent = "SAVING PROGRESS…";
  startBtn.disabled = true;

  const { error } = await supabase
    .from("festival_progress")
    .update({ day7_ghost_memory_completed: true })
    .eq("user_id", userId)
    .eq("festival", FESTIVAL);

  if (error) {
    saved = false;
    overlayText.textContent =
      "You matched every pair, but progress could not be saved. Press Retry Save.";
    startBtn.textContent = "RETRY SAVE";
    startBtn.disabled = false;
    setStatus("Save failed. Check the Supabase column and permissions.", true);
    return;
  }

  saved = true;
  overlayText.textContent =
    `Every pair matched! Time: ${formatTime(seconds)}. The final video is unlocked.`;
  startBtn.textContent = "WATCH FINAL VIDEO";
  startBtn.disabled = false;
  setStatus("Ghost Memory Match completed and saved!");
}

async function retrySave() {
  if (!finished || matchedPairs !== PAIR_COUNT) return;

  startBtn.disabled = true;

  const { error } = await supabase
    .from("festival_progress")
    .update({ day7_ghost_memory_completed: true })
    .eq("user_id", userId)
    .eq("festival", FESTIVAL);

  startBtn.disabled = false;

  if (error) {
    setStatus("Progress could not be saved. Check Supabase and retry.", true);
    return;
  }

  saved = true;
  overlayText.textContent = "Progress saved. You can watch the final Halloween video.";
  startBtn.textContent = "WATCH FINAL VIDEO";
  setStatus("Progress saved successfully!");
}

startBtn.addEventListener("click", () => {
  if (saved) {
    window.location.href = NEXT_PAGE;
  } else if (finished) {
    retrySave();
  } else {
    startGame();
  }
});

restartBtn.addEventListener("click", resetGame);

async function initialize() {
  createCards();
  updateStats();

  try {
    const { data: auth, error: authError } = await supabase.auth.getUser();

    if (authError || !auth?.user) {
      setStatus("Please sign in to play Ghost Memory Match.", true);
      startBtn.disabled = true;
      return;
    }

    userId = auth.user.id;

    const { data: progress, error } = await supabase
      .from("festival_progress")
      .select(
        "day7_quiz_completed, day7_puzzle_completed, day7_pumpkin_catch_completed, day7_ghost_memory_completed"
      )
      .eq("user_id", userId)
      .eq("festival", FESTIVAL)
      .maybeSingle();

    if (error || !progress) {
      setStatus("Could not load festival progress. Check Supabase.", true);
      startBtn.disabled = true;
      return;
    }

    if (
      !progress.day7_quiz_completed ||
      !progress.day7_puzzle_completed ||
      !progress.day7_pumpkin_catch_completed
    ) {
      setStatus("Complete the quiz, image puzzle and Pumpkin Catch first.", true);
      startBtn.disabled = true;
      return;
    }

    ready = true;

    if (progress.day7_ghost_memory_completed) {
      setStatus("Ghost Memory Match is already completed. You can replay it.");
    } else {
      setStatus("Ready! Match all eight pairs.");
    }

    resetGame();
  } catch (error) {
    console.error("Ghost Memory initialization failed:", error);
    setStatus("Could not initialize the game. Check the browser console.", true);
    startBtn.disabled = true;
  }
}

initialize();
