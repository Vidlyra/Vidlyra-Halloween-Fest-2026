import { supabase } from "./supabase.js";

/* ==========================================
   CONFIG
========================================== */

const FESTIVAL_ID = "halloween_2026";
const LOGIN_URL = "login.html";
const MAP_URL = "map.html";
const GAME_URL = "day4-game.html";

const START_LABEL = "▶ Start Experience";
const UNMUTE_VIDEO = false;     // set true if day4.mp4 has its own audio
const LEAVE_DELAY_MS = 1600;    // lets the witch laugh play before leaving

/* ==========================================
   DOM ELEMENTS
========================================== */

const startScreen = document.getElementById("startScreen");
const startBtn = document.getElementById("startBtn");
const statusMsg = document.getElementById("statusMsg");

const introVideo = document.getElementById("bgVideo");
const skipBtn = document.getElementById("skipBtn");
const videoOverlay = document.getElementById("videoOverlay");
const enterGame = document.getElementById("enterGame");

const bgMusic = document.getElementById("bgMusic");
const thunderSound = document.getElementById("thunderSound");
const witchLaugh = document.getElementById("witchLaugh");

const lightning = document.getElementById("lightning");
const fogLayer = document.getElementById("fogLayer");
const magicParticles = document.getElementById("magicParticles");

/* ==========================================
   STATE
========================================== */

let accessGranted = false;
let checkingAccess = false;
let started = false;
let endingShown = false;
let navigatingToGame = false;

/* ==========================================
   HELPERS
========================================== */

function setStatus(text = "", isError = false) {
    if (!statusMsg) return;
    statusMsg.textContent = text;
    statusMsg.classList.toggle("error", isError);
}

function redirectTo(url, message) {
    setStatus(message, true);
    if (startBtn) startBtn.disabled = true;
    window.setTimeout(() => window.location.replace(url), 1500);
}

/* ==========================================
   ACCESS CHECK: LOGIN + DAY 3
   Returns "granted" | "denied" | "error"
========================================== */

async function checkAccess() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            redirectTo(LOGIN_URL, "Please log in to continue…");
            return "denied";
        }

        const { data, error: progressError } = await supabase
            .from("festival_progress")
            .select("day3, day4")
            .eq("user_id", user.id)
            .eq("festival", FESTIVAL_ID)
            .maybeSingle();

        if (progressError) {
            console.error("Progress lookup failed:", progressError);
            return "error";
        }

        if (!data || data.day3 !== true) {
            redirectTo(MAP_URL, "🔒 Complete Day 3 before entering Day 4.");
            return "denied";
        }

        return "granted";

    } catch (error) {
        console.error("Access check failed:", error);
        return "error";
    }
}

async function verifyAccess() {
    if (checkingAccess) return;

    checkingAccess = true;
    startBtn.disabled = true;
    startBtn.textContent = "Checking access…";
    setStatus("");

    const result = await checkAccess();

    checkingAccess = false;

    if (result === "granted") {
        accessGranted = true;
        startBtn.disabled = false;
        startBtn.textContent = START_LABEL;
    } else if (result === "error") {
        startBtn.disabled = false;
        startBtn.textContent = "↻ Try Again";
        setStatus("Unable to verify access. Check your connection and try again.", true);
    }
}

/* ==========================================
   AUDIO
========================================== */

// Mobile browsers only allow each audio element to play after a tap.
// Briefly "touch" the sound effects during the Start click so they
// can play later (thunder timer, witch laugh) without being blocked.
function unlockSoundEffects() {
    [thunderSound, witchLaugh].forEach((audio) => {
        if (!audio) return;

        audio.muted = true;

        audio.play()
            .then(() => {
                audio.pause();
                audio.currentTime = 0;
                audio.muted = false;
            })
            .catch(() => {
                audio.muted = false;
            });
    });
}

function playAtmosphere() {
    if (!bgMusic) return;

    bgMusic.volume = 0.25;

    bgMusic.play().catch((error) => {
        console.warn("Background music could not play:", error);
    });
}

/* ==========================================
   START EXPERIENCE
========================================== */

async function startExperience() {
    if (started || endingShown || navigatingToGame) return;

    started = true;
    startBtn.disabled = true;
    startScreen.classList.add("hide");

    // Audio calls must happen synchronously inside the click,
    // before any await, or Safari/iOS will block them.
    unlockSoundEffects();
    playAtmosphere();

    try {
        if (!introVideo) {
            throw new Error('Video element "#bgVideo" was not found.');
        }

        introVideo.muted = !UNMUTE_VIDEO;
        introVideo.currentTime = 0;

        await introVideo.play();

        skipBtn?.classList.add("show");

    } catch (error) {
        // Never leave the player stuck: go straight to the Enter screen.
        console.error("Intro video failed, skipping to ending:", error);
        showEnding();
    }
}

/* ==========================================
   ENDING / ENTER OVERLAY
========================================== */

function showEnding() {
    if (endingShown || navigatingToGame) return;

    endingShown = true;
    started = true;

    introVideo?.pause();
    skipBtn?.classList.remove("show");
    startScreen?.classList.add("hide");

    videoOverlay.hidden = false;
    // Force a reflow so the fade-in transition runs.
    void videoOverlay.offsetWidth;
    videoOverlay.classList.add("show");

    enterGame.focus({ preventScroll: true });

    // Make sure the atmosphere is running even if we skipped straight here.
    if (bgMusic && bgMusic.paused) playAtmosphere();

    playMagicEffects();
}

/* ==========================================
   MAGIC EFFECTS
========================================== */

function playMagicEffects() {
    fogLayer?.classList.add("active");
    magicParticles?.classList.add("active");

    window.setTimeout(() => {
        if (navigatingToGame) return;

        lightning?.classList.add("active");

        if (thunderSound) {
            thunderSound.currentTime = 0;
            thunderSound.play().catch((error) => {
                console.warn("Thunder sound could not play:", error);
            });
        }
    }, 1000);
}

/* ==========================================
   ENTER THE FOREST
========================================== */

function enterTheForest() {
    if (navigatingToGame) return;

    navigatingToGame = true;
    enterGame.disabled = true;

    introVideo?.pause();

    if (witchLaugh) {
        witchLaugh.currentTime = 0;
        witchLaugh.play().catch((error) => {
            console.warn("Witch laugh could not play:", error);
        });
    }

    document.body.classList.add("leaving");

    window.setTimeout(() => {
        window.location.href = GAME_URL;
    }, LEAVE_DELAY_MS);
}

/* ==========================================
   INITIALIZE
========================================== */

function initialize() {
    const missing = Object.entries({
        startScreen, startBtn, introVideo, videoOverlay, enterGame
    }).filter(([, el]) => !el).map(([name]) => name);

    if (missing.length) {
        console.error("Missing required Day 4 elements:", missing);
        return;
    }

    startBtn.addEventListener("click", () => {
        if (accessGranted) {
            startExperience();
        } else {
            verifyAccess();   // acts as "Try Again" after a failed check
        }
    });

    skipBtn?.addEventListener("click", showEnding);
    enterGame.addEventListener("click", enterTheForest);

    introVideo.addEventListener("ended", showEnding);

    introVideo.addEventListener("error", () => {
        console.error("Intro video error:", introVideo.error, introVideo.currentSrc);
        // If it breaks mid-intro, don't leave the player stranded.
        if (started && !endingShown) showEnding();
    });

    // Back button restores the page from cache in its old state: reload cleanly.
    window.addEventListener("pageshow", (event) => {
        if (event.persisted) window.location.reload();
    });

    verifyAccess();
}

initialize();
