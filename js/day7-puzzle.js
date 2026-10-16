
import { supabase } from "./supabase.js";

const FESTIVAL = "halloween_2026";
const GRID_SIZE = 3;
const TOTAL_TILES = GRID_SIZE * GRID_SIZE;

// Change these paths if your image filenames are different.
const PUZZLE_IMAGES = {
  mansion: {
    title: "Haunted Mansion",
    path: "assets/images/halloween-puzzle.png"
  },
  pumpkin: {
    title: "Enchanted Pumpkin",
    path: "assets/images/pumpkin-puzzle.png"
  },
  graveyard: {
    title: "Haunted Graveyard",
    path: "assets/images/graveyard-puzzle.png"
  }
};

const els = {
  picker: document.getElementById("imagePicker"),
  game: document.getElementById("game"),
  board: document.getElementById("puzzleBoard"),
  title: document.getElementById("selectedTitle"),
  moves: document.getElementById("moves"),
  timer: document.getElementById("timer"),
  pieces: document.getElementById("pieces"),
  status: document.getElementById("status"),
  changeImage: document.getElementById("changeImage"),
  restart: document.getElementById("restart"),
  winMessage: document.getElementById("winMessage"),
  finalStats: document.getElementById("finalStats"),
  continueBtn: document.getElementById("continueBtn")
};

let userId = null;
let selectedImageKey = null;
let order = [];
let selectedTile = null;
let moves = 0;
let seconds = 0;
let timerId = null;
let puzzleWon = false;
let puzzleSaved = false;

function setStatus(message, isError = false) {
  els.status.textContent = message;
  els.status.classList.toggle("error", isError);
}

function stopTimer() {
  if (timerId !== null) {
    clearInterval(timerId);
    timerId = null;
  }
}

function startTimer() {
  stopTimer();

  timerId = setInterval(() => {
    seconds++;
    updateStats();
  }, 1000);
}

function formatTime(value) {
  const minutes = Math.floor(value / 60);
  const remainingSeconds = value % 60;

  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

function updateStats() {
  els.moves.textContent = String(moves);
  els.timer.textContent = formatTime(seconds);

  const correctCount = order.filter((tile, index) => tile === index).length;
  els.pieces.textContent = `${correctCount} / ${TOTAL_TILES}`;
}

function shuffleTiles() {
  const tiles = Array.from({ length: TOTAL_TILES }, (_, index) => index);

  // Fisher-Yates shuffle.
  for (let i = tiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
  }

  // Prevent an already-solved starting board.
  if (tiles.every((tile, index) => tile === index)) {
    [tiles[0], tiles[1]] = [tiles[1], tiles[0]];
  }

  return tiles;
}

function createTile(position, imagePath) {
  const tile = document.createElement("button");
  const correctPosition = order[position];

  tile.type = "button";
  tile.className = "puzzle-tile";
  tile.setAttribute("aria-label", `Puzzle piece ${position + 1}`);
  tile.dataset.position = String(position);
  tile.dataset.correct = String(correctPosition);

  const row = Math.floor(correctPosition / GRID_SIZE);
  const column = correctPosition % GRID_SIZE;

  tile.style.backgroundImage = `url("${imagePath}")`;
  tile.style.backgroundSize = `${GRID_SIZE * 100}% ${GRID_SIZE * 100}%`;
  tile.style.backgroundPosition =
    `${column * 50}% ${row * 50}%`;

  if (correctPosition === position) {
    tile.classList.add("correct");
  }

  tile.addEventListener("click", () => handleTileClick(position));

  return tile;
}

function renderBoard() {
  els.board.replaceChildren();
  selectedTile = null;

  const imagePath = PUZZLE_IMAGES[selectedImageKey].path;

  order.forEach((_, position) => {
    els.board.appendChild(createTile(position, imagePath));
  });

  updateStats();
}

function handleTileClick(position) {
  if (puzzleWon) return;

  const tiles = [...els.board.children];

  if (selectedTile === null) {
    selectedTile = position;
    tiles[position].classList.add("selected");
    tiles[position].setAttribute("aria-pressed", "true");
    return;
  }

  if (selectedTile === position) {
    tiles[position].classList.remove("selected");
    tiles[position].setAttribute("aria-pressed", "false");
    selectedTile = null;
    return;
  }

  const first = selectedTile;
  const second = position;

  [order[first], order[second]] = [order[second], order[first]];
  moves++;

  renderBoard();

  if (order.every((tile, index) => tile === index)) {
    completePuzzle();
  }
}

async function selectImage(imageKey) {
  if (!PUZZLE_IMAGES[imageKey]) return;

  const image = PUZZLE_IMAGES[imageKey];

  setStatus("Loading puzzle image…");

  // Verify the image exists before starting the puzzle.
  const loaded = await new Promise((resolve) => {
    const testImage = new Image();
    testImage.onload = () => resolve(true);
    testImage.onerror = () => resolve(false);
    testImage.src = image.path;
  });

  if (!loaded) {
    setStatus(
      `Image not found: ${image.path}. Check the filename in your images folder.`,
      true
    );
    return;
  }

  selectedImageKey = imageKey;
  els.title.textContent = image.title;
  els.picker.classList.add("hidden");
  els.game.classList.remove("hidden");
  els.winMessage.classList.add("hidden");

  resetPuzzle();
}

function resetPuzzle() {
  stopTimer();

  moves = 0;
  seconds = 0;
  puzzleWon = false;
  selectedTile = null;

  order = shuffleTiles();

  renderBoard();
  els.winMessage.classList.add("hidden");

  setStatus("Puzzle ready. Arrange all nine pieces to reveal the image.");
  startTimer();
}

async function completePuzzle() {
  puzzleWon = true;
  stopTimer();
  renderBoard();

  els.winMessage.classList.remove("hidden");
  els.finalStats.textContent =
    `Completed in ${moves} moves and ${formatTime(seconds)}.`;

  setStatus("Puzzle solved! Saving your progress…");

  const { error } = await supabase
    .from("festival_progress")
    .update({ day7_puzzle_completed: true })
    .eq("user_id", userId)
    .eq("festival", FESTIVAL);

  if (error) {
    puzzleSaved = false;
    setStatus(
      "Puzzle solved, but progress could not be saved. Check your Supabase column and permissions, then try again.",
      true
    );

    els.continueBtn.textContent = "RETRY SAVE";
    els.continueBtn.disabled = false;
    return;
  }

  puzzleSaved = true;
  setStatus("Puzzle completed and progress saved!");
  els.continueBtn.textContent = "CONTINUE TO PUMPKIN CATCH";
}

async function handleContinue() {
  if (puzzleSaved) {
    window.location.href = "day7-pumpkin-catch.html";
    return;
  }

  if (!puzzleWon || !userId) return;

  els.continueBtn.disabled = true;
  setStatus("Retrying progress save…");

  const { error } = await supabase
    .from("festival_progress")
    .update({ day7_puzzle_completed: true })
    .eq("user_id", userId)
    .eq("festival", FESTIVAL);

  els.continueBtn.disabled = false;

  if (error) {
    setStatus("Save failed. Please check your connection and Supabase permissions.", true);
    return;
  }

  puzzleSaved = true;
  setStatus("Progress saved!");
  els.continueBtn.textContent = "CONTINUE TO PUMPKIN CATCH";
}

async function initialize() {
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData?.user) {
      setStatus("Please sign in to play the Day 7 puzzle.", true);
      return;
    }

    userId = authData.user.id;

    const { data: progress, error: progressError } = await supabase
      .from("festival_progress")
      .select("day7_quiz_completed, day7_puzzle_completed")
      .eq("user_id", userId)
      .eq("festival", FESTIVAL)
      .maybeSingle();

    if (progressError) {
      setStatus("Could not load your festival progress. Check Supabase permissions.", true);
      return;
    }

    if (!progress) {
      setStatus("Your festival progress record was not found. Create your festival progress row first.", true);
      return;
    }

    if (!progress.day7_quiz_completed) {
      setStatus("Complete the Day 7 quiz before starting this puzzle.", true);
      return;
    }

    if (progress.day7_puzzle_completed) {
      setStatus("You have already completed this puzzle. You can play it again.");
    } else {
      setStatus("Choose one of the three images to begin.");
    }

    document.querySelectorAll(".image-card").forEach((card) => {
      card.addEventListener("click", () => {
        selectImage(card.dataset.image);
      });
    });

    els.changeImage.addEventListener("click", () => {
      stopTimer();
      els.game.classList.add("hidden");
      els.picker.classList.remove("hidden");
      setStatus("Choose an image to start a new puzzle.");
    });

    els.restart.addEventListener("click", resetPuzzle);
    els.continueBtn.addEventListener("click", handleContinue);
  } catch (error) {
    console.error("Day 7 puzzle initialization failed:", error);
    setStatus("Could not initialize the puzzle. Check the browser console.", true);
  }
}

initialize();
