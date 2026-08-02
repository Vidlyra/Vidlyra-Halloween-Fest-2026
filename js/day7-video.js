"use strict";

/* =========================================================
   VIDLYRA HALLOWEEN FEST 2026
   DAY 7 VIDEO
   DAY 7 VIDEO → END CREDITS

   File:
   js/day7-video.js

   Expected HTML IDs:
   #day7Video
   #startScreen
   #startButton
   #loading
   #dayTitle
   #continueButton
   #fadeScreen
   ========================================================= */


/* =========================================================
   CONFIGURATION
   ========================================================= */

const CONFIG = {

    /* Main Day 7 video */
    VIDEO_SRC: "assets/videos/day7-video.mp4",

    /* End credits page */
    END_CREDITS_URL: "end-credits.html",

    /* If your video is already one combined 24-second video,
       keep this true. */
    AUTO_REDIRECT_AFTER_VIDEO: false,

    /* Show Continue button when video ends */
    SHOW_CONTINUE_BUTTON: true,

    /* Fade duration */
    FADE_DURATION: 1800,

    /* LocalStorage */
    SAVE_PROGRESS: true,

    /* Replay protection */
    PREVENT_MULTIPLE_REDIRECTS: true

};


/* =========================================================
   DOM HELPERS
   ========================================================= */

const $ = (selector) => document.querySelector(selector);

function on(element, event, callback, options) {

    if (!element) return;

    element.addEventListener(
        event,
        callback,
        options
    );
}


/* =========================================================
   DOM REFERENCES
   ========================================================= */

const video = $("#day7Video");

const startScreen = $("#startScreen");

const startButton = $("#startButton");

const loading = $("#loading");

const dayTitle = $("#dayTitle");

const continueButton = $("#continueButton");

const fadeScreen = $("#fadeScreen");

const videoScreen = $("#videoScreen");


/* =========================================================
   GAME STATE
   ========================================================= */

const STATE = {

    started: false,

    playing: false,

    ended: false,

    redirecting: false,

    ready: false

};


/* =========================================================
   INITIAL SETUP
   ========================================================= */

function initializeDay7() {

    if (!video) {

        console.error(
            "Day 7 Error: #day7Video was not found."
        );

        return;

    }


    /* -----------------------------------------------------
       Video settings
       ----------------------------------------------------- */

    video.controls = false;

    video.playsInline = true;

    video.setAttribute(
        "playsinline",
        ""
    );

    video.setAttribute(
        "webkit-playsinline",
        ""
    );

    video.preload = "auto";

    video.muted = false;


    /* -----------------------------------------------------
       Load video source
       ----------------------------------------------------- */

    if (
        CONFIG.VIDEO_SRC &&
        !video.getAttribute("src")
    ) {

        video.src = CONFIG.VIDEO_SRC;

    }


    /* -----------------------------------------------------
       Initial UI
       ----------------------------------------------------- */

    if (continueButton) {

        continueButton.classList.remove("show");

        continueButton.style.pointerEvents =
            "none";

    }


    if (loading) {

        loading.classList.remove("show");

        loading.textContent =
            "PREPARING DAY 7...";

    }


    if (fadeScreen) {

        fadeScreen.classList.remove("active");

    }


    /* -----------------------------------------------------
       Prepare video
       ----------------------------------------------------- */

    try {

        video.load();

    } catch (error) {

        console.warn(
            "Video load warning:",
            error
        );

    }

}


/* =========================================================
   VIDEO READY
   ========================================================= */

function markVideoReady() {

    STATE.ready = true;

    if (loading) {

        loading.classList.remove("show");

    }

}


/* =========================================================
   START DAY 7
   ========================================================= */

async function startDay7() {

    if (STATE.started) return;

    if (!video) return;


    STATE.started = true;

    STATE.playing = true;


    /* -----------------------------------------------------
       Hide start screen
       ----------------------------------------------------- */

    if (startScreen) {

        startScreen.style.opacity = "0";

        startScreen.style.pointerEvents =
            "none";

        setTimeout(() => {

            startScreen.style.display =
                "none";

        }, 1000);

    }


    /* -----------------------------------------------------
       Show loading
       ----------------------------------------------------- */

    if (loading) {

        loading.textContent =
            "ENTERING DAY 7...";

        loading.classList.add("show");

    }


    /* -----------------------------------------------------
       Reset video
       ----------------------------------------------------- */

    try {

        video.currentTime = 0;

    } catch (error) {

        console.warn(
            "Unable to reset video:",
            error
        );

    }


    /* -----------------------------------------------------
       Try normal sound playback
       ----------------------------------------------------- */

    video.muted = false;

    video.volume = 1;


    try {

        const playPromise =
            video.play();

        if (
            playPromise &&
            typeof playPromise.then === "function"
        ) {

            await playPromise;

        }

        markVideoPlaying();

    } catch (error) {

        console.warn(
            "Sound playback blocked:",
            error
        );


        /* -------------------------------------------------
           Some browsers may still reject playback.
           Try muted playback as fallback.
           ------------------------------------------------- */

        try {

            video.muted = true;

            await video.play();

            markVideoPlaying();

        } catch (fallbackError) {

            console.error(
                "Video playback failed:",
                fallbackError
            );

            handleVideoError();

        }

    }

}


/* =========================================================
   VIDEO PLAYING
   ========================================================= */

function markVideoPlaying() {

    STATE.playing = true;

    if (loading) {

        loading.classList.remove("show");

    }

    if (dayTitle) {

        dayTitle.style.opacity = "0";

        dayTitle.style.transform =
            "translateX(-50%) translateY(-15px)";

    }

}


/* =========================================================
   VIDEO PAUSE
   ========================================================= */

function handlePause() {

    if (!STATE.started) return;

    if (STATE.ended) return;

    STATE.playing = false;

}


/* =========================================================
   VIDEO RESUME
   ========================================================= */

function handlePlay() {

    if (!STATE.started) return;

    STATE.playing = true;

    if (loading) {

        loading.classList.remove("show");

    }

}


/* =========================================================
   VIDEO ENDED
   ========================================================= */

function handleVideoEnded() {

    if (STATE.ended) return;


    STATE.playing = false;

    STATE.ended = true;


    /* -----------------------------------------------------
       Save Day 7 completion
       ----------------------------------------------------- */

    if (CONFIG.SAVE_PROGRESS) {

        try {

            localStorage.setItem(
                "day7VideoComplete",
                "true"
            );

            localStorage.setItem(
                "vidlyraDay7Complete",
                "true"
            );

        } catch (error) {

            console.warn(
                "Could not save Day 7 progress:",
                error
            );

        }

    }


    /* -----------------------------------------------------
       Show title again
       ----------------------------------------------------- */

    if (dayTitle) {

        dayTitle.style.opacity = "1";

        dayTitle.style.transform =
            "translateX(-50%) translateY(0)";

    }


    /* -----------------------------------------------------
       Show Continue button
       ----------------------------------------------------- */

    if (
        CONFIG.SHOW_CONTINUE_BUTTON &&
        continueButton
    ) {

        continueButton.classList.add("show");

        continueButton.style.pointerEvents =
            "auto";

    }


    /* -----------------------------------------------------
       Optional automatic redirect
       ----------------------------------------------------- */

    if (
        CONFIG.AUTO_REDIRECT_AFTER_VIDEO
    ) {

        setTimeout(() => {

            goToEndCredits();

        }, 2500);

    }

}


/* =========================================================
   CONTINUE → END CREDITS
   ========================================================= */

function goToEndCredits() {

    if (
        CONFIG.PREVENT_MULTIPLE_REDIRECTS &&
        STATE.redirecting
    ) {

        return;

    }


    STATE.redirecting = true;


    /* -----------------------------------------------------
       Disable Continue button
       ----------------------------------------------------- */

    if (continueButton) {

        continueButton.classList.remove("show");

        continueButton.style.pointerEvents =
            "none";

    }


    /* -----------------------------------------------------
       Stop video
       ----------------------------------------------------- */

    if (video) {

        try {

            video.pause();

        } catch (error) {}

    }


    /* -----------------------------------------------------
       Save final progress
       ----------------------------------------------------- */

    if (CONFIG.SAVE_PROGRESS) {

        try {

            localStorage.setItem(
                "vidlyraHalloweenComplete",
                "true"
            );

        } catch (error) {}

    }


    /* -----------------------------------------------------
       Cinematic fade
       ----------------------------------------------------- */

    if (fadeScreen) {

        fadeScreen.classList.add("active");

    }


    /* -----------------------------------------------------
       Redirect
       ----------------------------------------------------- */

    setTimeout(() => {

        window.location.href =
            CONFIG.END_CREDITS_URL;

    }, CONFIG.FADE_DURATION);

}


/* =========================================================
   VIDEO ERROR
   ========================================================= */

function handleVideoError() {

    STATE.playing = false;


    console.error(
        "DAY 7 VIDEO COULD NOT BE PLAYED."
    );


    /* -----------------------------------------------------
       Show helpful message instead of blank screen
       ----------------------------------------------------- */

    if (loading) {

        loading.textContent =
            "VIDEO COULD NOT LOAD — TAP TO RETRY";

        loading.classList.add("show");

    }


    if (startScreen) {

        startScreen.style.display =
            "flex";

        startScreen.style.opacity =
            "1";

        startScreen.style.pointerEvents =
            "auto";

    }


    STATE.started = false;

}


/* =========================================================
   RETRY VIDEO
   ========================================================= */

function retryVideo() {

    if (!video) return;


    STATE.started = false;

    STATE.playing = false;

    STATE.ended = false;

    STATE.redirecting = false;


    if (loading) {

        loading.textContent =
            "RELOADING DAY 7...";

        loading.classList.add("show");

    }


    try {

        video.load();

    } catch (error) {}


    if (startScreen) {

        startScreen.style.display =
            "flex";

        startScreen.style.opacity =
            "1";

        startScreen.style.pointerEvents =
            "auto";

    }

}


/* =========================================================
   KEYBOARD CONTROLS
   ========================================================= */

function handleKeyboard(event) {

    if (!event) return;


    /* Space / Enter starts video */

    if (
        !STATE.started &&
        (
            event.code === "Space" ||
            event.code === "Enter"
        )
    ) {

        event.preventDefault();

        startDay7();

        return;

    }


    /* Escape does nothing during cinematic */

    if (event.code === "Escape") {

        event.preventDefault();

    }


    /* Enter continues after video */

    if (
        STATE.ended &&
        (
            event.code === "Enter" ||
            event.code === "Space"
        )
    ) {

        event.preventDefault();

        goToEndCredits();

    }

}


/* =========================================================
   PREVENT ACCIDENTAL VIDEO INTERACTION
   ========================================================= */

on(
    video,
    "click",
    () => {

        if (!STATE.started) {

            startDay7();

        } else if (STATE.ended) {

            goToEndCredits();

        }

    }
);


/* =========================================================
   START BUTTON
   ========================================================= */

on(
    startButton,
    "click",
    (event) => {

        event.preventDefault();

        startDay7();

    }
);


/* =========================================================
   CONTINUE BUTTON
   ========================================================= */

on(
    continueButton,
    "click",
    (event) => {

        event.preventDefault();

        goToEndCredits();

    }
);


/* =========================================================
   VIDEO EVENTS
   ========================================================= */

on(
    video,
    "loadedmetadata",
    () => {

        markVideoReady();

        console.log(
            "Day 7 video duration:",
            video.duration
        );

    }
);


on(
    video,
    "canplay",
    () => {

        markVideoReady();

    }
);


on(
    video,
    "playing",
    () => {

        markVideoPlaying();

    }
);


on(
    video,
    "play",
    () => {

        handlePlay();

    }
);


on(
    video,
    "pause",
    () => {

        handlePause();

    }
);


on(
    video,
    "ended",
    () => {

        handleVideoEnded();

    }
);


on(
    video,
    "error",
    () => {

        handleVideoError();

    }
);


/* =========================================================
   PREVENT RIGHT CLICK ON VIDEO
   ========================================================= */

on(
    video,
    "contextmenu",
    (event) => {

        event.preventDefault();

    }
);


/* =========================================================
   KEYBOARD
   ========================================================= */

document.addEventListener(
    "keydown",
    handleKeyboard
);


/* =========================================================
   VISIBILITY HANDLING
   ========================================================= */

document.addEventListener(
    "visibilitychange",
    () => {

        if (!video) return;

        if (document.hidden) {

            if (
                STATE.playing &&
                !STATE.ended
            ) {

                try {

                    video.pause();

                } catch (error) {}

            }

        }

    }
);


/* =========================================================
   MOBILE ORIENTATION
   ========================================================= */

window.addEventListener(
    "orientationchange",
    () => {

        setTimeout(() => {

            if (!video) return;

            try {

                video.style.width =
                    "100%";

                video.style.height =
                    "100%";

            } catch (error) {}

        }, 300);

    }
);


/* =========================================================
   INITIALIZE
   ========================================================= */

function bootDay7() {

    initializeDay7();

    console.log(
        "VIDLYRA HALLOWEEN FEST 2026 — DAY 7 VIDEO READY"
    );

}


/* =========================================================
   DOM READY
   ========================================================= */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        bootDay7
    );

} else {

    bootDay7();

}
