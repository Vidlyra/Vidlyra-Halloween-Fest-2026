
import { supabase } from "./supabase.js";

"use strict";

/* ==========================================
   DOM ELEMENTS
========================================== */

const startScreen = document.getElementById("startScreen");
const startBtn = document.getElementById("startBtn");

// IMPORTANT: This ID matches your HTML.
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

let user = null;
let started = false;
let endingShown = false;
let navigatingToGame = false;

/* ==========================================
   CHECK LOGIN + DAY 3 ACCESS
========================================== */

async function checkAccess() {
    try {
        const {
            data: { user: currentUser },
            error
        } = await supabase.auth.getUser();

        if (error || !currentUser) {
            window.location.href = "login.html";
            return false;
        }

        user = currentUser;

        const {
            data,
            error: progressError
        } = await supabase
            .from("festival_progress")
            .select("day3, day4")
            .eq("user_id", user.id)
            .eq("festival", "halloween_2026")
            .maybeSingle();

        if (progressError) {
            console.error("Progress lookup failed:", progressError);
            alert("Unable to load festival progress. Please try again.");
            return false;
        }

        if (!data || data.day3 !== true) {
            alert("🔒 Complete Day 3 before entering Day 4.");
            window.location.href = "map.html";
            return false;
        }

        console.log("🧙 Day 4 access granted.");
        return true;

    } catch (error) {
        console.error("Access check failed:", error);
        alert("Unable to verify access. Please try again.");
        return false;
    }
}

/* ==========================================
   START EXPERIENCE
========================================== */

async function startExperience() {
    if (started || endingShown || navigatingToGame) {
        return;
    }

    started = true;

    if (startBtn) {
        startBtn.disabled = true;
    }

    if (startScreen) {
        startScreen.classList.add("hide");
    }

    try {
        if (!introVideo) {
            throw new Error(
                'Video element "#bgVideo" was not found.'
            );
        }

        await introVideo.play();

        if (skipBtn) {
            skipBtn.classList.add("show");
        }

        playAtmosphere();

    } catch (error) {
        console.error("Unable to start intro video:", error);

        started = false;

        if (startBtn) {
            startBtn.disabled = false;
        }

        if (startScreen) {
            startScreen.classList.remove("hide");
        }

        alert(
            "Unable to play the intro video. Check the video file and browser console."
        );
    }
}

/* ==========================================
   BACKGROUND ATMOSPHERE
========================================== */

function playAtmosphere() {
    if (!bgMusic) {
        console.warn("Background music element was not found.");
        return;
    }

    bgMusic.volume = 0.25;

    bgMusic.play().catch((error) => {
        console.warn("Background music could not play:", error);
    });
}

/* ==========================================
   SHOW VIDEO ENDING / INTRO OVERLAY
========================================== */

function showEnding() {
    if (endingShown || navigatingToGame) {
        return;
    }

    endingShown = true;

    // Pause video safely.
    if (introVideo) {
        introVideo.pause();
    }

    if (skipBtn) {
        skipBtn.classList.remove("show");
    }

    if (videoOverlay) {
        videoOverlay.hidden = false;
        videoOverlay.classList.add("show");
    } else {
        console.error('Element "#videoOverlay" was not found.');
        endingShown = false;
        return;
    }

    playMagicEffects();
}

/* ==========================================
   SKIP INTRO
========================================== */

if (skipBtn) {
    skipBtn.addEventListener("click", () => {
        showEnding();
    });
}

/* ==========================================
   VIDEO ENDED
========================================== */

if (introVideo) {
    introVideo.addEventListener("ended", () => {
        showEnding();
    });

    introVideo.addEventListener("error", () => {
        console.error(
            "Intro video error:",
            introVideo.error,
            introVideo.currentSrc
        );
    });

    console.log("Intro video element connected:", introVideo.currentSrc);
} else {
    console.error(
        'Missing video element: add id="bgVideo" to the HTML video.'
    );
}

/* ==========================================
   ENTER THE FOREST
========================================== */

if (enterGame) {
    enterGame.addEventListener("click", () => {
        if (navigatingToGame) {
            return;
        }

        navigatingToGame = true;

        if (witchLaugh) {
            witchLaugh.currentTime = 0;

            witchLaugh.play().catch((error) => {
                console.warn("Witch laugh could not play:", error);
            });
        }

        if (introVideo) {
            introVideo.pause();
        }

        window.location.href = "day4-game.html";
    });
} else {
    console.error('Missing button: "#enterGame".');
}

/* ==========================================
   MAGIC EFFECTS
========================================== */

function playMagicEffects() {
    if (fogLayer) {
        fogLayer.classList.add("active");
    }

    if (magicParticles) {
        magicParticles.classList.add("active");
    }

    window.setTimeout(() => {
        if (!endingShown || navigatingToGame) {
            return;
        }

        if (lightning) {
            lightning.classList.add("active");
        }

        if (thunderSound) {
            thunderSound.currentTime = 0;

            thunderSound.play().catch((error) => {
                console.warn("Thunder sound could not play:", error);
            });
        }
    }, 1000);
}

/* ==========================================
   INITIALIZE
========================================== */

async function initialize() {
    // Check essential HTML elements first.
    if (!startScreen || !startBtn || !videoOverlay || !enterGame) {
        console.error(
            "Some required Day 4 HTML elements are missing.",
            {
                startScreen: Boolean(startScreen),
                startBtn: Boolean(startBtn),
                videoOverlay: Boolean(videoOverlay),
                enterGame: Boolean(enterGame)
            }
        );

        return;
    }

    const allowed = await checkAccess();

    if (!allowed) {
        return;
    }

    startBtn.addEventListener("click", startExperience);

    console.log("🧙 VIDLYRA Day 4 initialized successfully.");
}

initialize();
