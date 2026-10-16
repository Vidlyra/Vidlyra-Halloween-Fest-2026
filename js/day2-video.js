
import { supabase } from "./supabase.js";

/* ==========================
   DAY 2 VIDEO EXPERIENCE
   VIDLYRA HALLOWEEN FEST 2026
========================== */

/* ELEMENTS */

const startScreen = document.getElementById("startScreen");
const startBtn = document.getElementById("startBtn");
const introVideo = document.getElementById("introVideo");
const skipBtn = document.getElementById("skipBtn");
const videoOverlay = document.getElementById("videoOverlay");
const enterWell = document.getElementById("enterWell");
const videoError = document.getElementById("videoError");

let currentUser = null;
let introStarted = false;
let navigationStarted = false;


/* ==========================
   CHECK LOGIN
========================== */

async function checkUser() {
    try {
        const { data, error } = await supabase.auth.getUser();

        if (error || !data?.user) {
            console.warn("No active login session.");

            window.location.replace("login.html");
            return null;
        }

        return data.user;

    } catch (error) {
        console.error("Login check failed:", error);

        showError(
            "Unable to verify your login. Please refresh and try again."
        );

        return null;
    }
}


/* ==========================
   CHECK DAY 1 PROGRESS
   NO AUTOMATIC MAP REDIRECT
========================== */

async function checkDay2() {
    currentUser = await checkUser();

    if (!currentUser) {
        return false;
    }

    try {
        const { data, error } = await supabase
            .from("festival_progress")
            .select("day1, day2")
            .eq("user_id", currentUser.id)
            .eq("festival", "halloween_2026")
            .maybeSingle();

        if (error) {
            console.error("Progress check failed:", error);

            showError(
                "Unable to load festival progress. Please try again."
            );

            return false;
        }

        if (!data) {
            console.error("Festival progress record not found.");

            showError(
                "Your festival progress record was not found. Please check your account progress."
            );

            return false;
        }

        if (data.day1 !== true) {
            console.warn("Day 1 is not completed.", data.day1);

            showError(
                "Day 1 completion is not recorded. Complete Day 1 before entering Day 2."
            );

            return false;
        }

        console.log("Day 2 access granted.", data);

        return true;

    } catch (error) {
        console.error("Unexpected progress error:", error);

        showError(
            "Something went wrong while checking your progress."
        );

        return false;
    }
}


/* ==========================
   SHOW ERROR
========================== */

function showError(message) {
    if (videoError) {
        const paragraph = videoError.querySelector("p");

        if (paragraph) {
            paragraph.textContent = message;
        }

        videoError.classList.add("show");
    } else {
        alert(message);
    }
}


/* ==========================
   START EXPERIENCE
========================== */

if (startBtn) {
    startBtn.addEventListener("click", async () => {
        if (introStarted || navigationStarted) {
            return;
        }

        introStarted = true;
        startBtn.disabled = true;
        startBtn.textContent = "ENTERING...";

        if (introVideo) {
            try {
                introVideo.currentTime = 0;
                await introVideo.play();

                startScreen?.classList.add("hidden");

            } catch (error) {
                console.error("Video playback failed:", error);

                introStarted = false;
                startBtn.disabled = false;
                startBtn.textContent = "▶ Start Experience";

                showError(
                    "The intro video could not play. Check the video file and try again."
                );
            }
        } else {
            console.error("introVideo element not found.");

            introStarted = false;
            startBtn.disabled = false;

            showError("The video player was not found on this page.");
        }
    });
}


/* ==========================
   VIDEO PLAYING
========================== */

if (introVideo) {
    introVideo.addEventListener("play", () => {
        skipBtn?.classList.add("show");
    });

    introVideo.addEventListener("ended", () => {
        showVideoOverlay();
    });

    introVideo.addEventListener("error", () => {
        console.error(
            "Day 2 video failed to load:",
            introVideo.error
        );

        skipBtn?.classList.remove("show");

        showError(
            "The Day 2 intro video could not load. Check assets/video/haunted-well.mp4."
        );
    });
}


/* ==========================
   SKIP INTRO
========================== */

if (skipBtn) {
    skipBtn.addEventListener("click", () => {
        if (navigationStarted) {
            return;
        }

        if (introVideo) {
            introVideo.pause();
        }

        showVideoOverlay();
    });
}


/* ==========================
   SHOW VIDEO OVERLAY
========================== */

function showVideoOverlay() {
    skipBtn?.classList.remove("show");
    videoOverlay?.classList.add("show");
}


/* ==========================
   ENTER DAY 2 GAME
========================== */

if (enterWell) {
    enterWell.addEventListener("click", () => {
        if (navigationStarted) {
            return;
        }

        navigationStarted = true;
        enterWell.disabled = true;
        enterWell.textContent = "ENTERING THE WELL...";

        window.location.href = "day2-game.html";
    });
}


/* ==========================
   INITIALIZE
========================== */

async function initialize() {
    console.log("Initializing Day 2 video experience...");

    if (!startScreen || !startBtn || !introVideo) {
        console.error("Required Day 2 video HTML elements are missing.");

        showError("Some required page elements are missing. Check day2-video.html.");
        return;
    }

    const allowed = await checkDay2();

    if (!allowed) {
        return;
    }

    console.log("🎃 Day 2 intro unlocked.");
}

initialize();
