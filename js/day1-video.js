"use strict";

/* =========================================================
   VIDLYRA HALLOWEEN FEST 2026
   DAY 1 VIDEO
   DAY 1 → DAY 2 VIDEO
========================================================= */

const video = document.getElementById("day1Video");
const loading = document.getElementById("loading");
const loadingText = document.getElementById("loadingText");
const endOverlay = document.getElementById("endOverlay");
const videoError = document.getElementById("videoError");


/* =========================================================
   NEXT PAGE
========================================================= */

const NEXT_VIDEO = "day2-video.html";


/* =========================================================
   STATE
========================================================= */

let finished = false;
let redirecting = false;


/* =========================================================
   VIDEO READY
========================================================= */

video.addEventListener("canplay", () => {

    video.classList.add("ready");

    if (loading) {
        loading.classList.add("hidden");
    }

    /*
        Start automatically.
        Muted first because browsers may block
        autoplay with sound.
    */

    video.muted = true;

    const playPromise = video.play();

    if (playPromise) {

        playPromise
            .then(() => {

                /*
                    Keep video silent for autoplay.
                    If you want sound after user interaction,
                    the video can be unmuted by interaction.
                */

            })
            .catch(() => {

                /*
                    If autoplay is blocked,
                    show a simple interaction message.
                */

                if (loadingText) {

                    loadingText.textContent =
                        "CLICK TO ENTER DAY 1";

                }

            });

    }

});


/* =========================================================
   USER INTERACTION
========================================================= */

function startVideoWithInteraction() {

    if (!video) return;

    video.muted = false;

    video.play()
        .then(() => {

            if (loading) {
                loading.classList.add("hidden");
            }

        })
        .catch(() => {

            video.muted = true;

            video.play().catch(() => {});

        });

}


document.addEventListener(
    "click",
    startVideoWithInteraction,
    {
        once: true
    }
);


document.addEventListener(
    "touchstart",
    startVideoWithInteraction,
    {
        once: true,
        passive: true
    }
);


/* =========================================================
   VIDEO ENDED
========================================================= */

video.addEventListener("ended", () => {

    finishDay1();

});


/* =========================================================
   FINISH DAY 1
========================================================= */

function finishDay1() {

    if (finished) return;

    finished = true;

    /*
        Save completion.
    */

    try {

        localStorage.setItem(
            "day1Complete",
            "true"
        );

    } catch (error) {}


    /*
        Show cinematic ending.
    */

    if (endOverlay) {

        endOverlay.classList.add("show");

    }


    /*
        Redirect to Day 2.
    */

    setTimeout(() => {

        redirectToDay2();

    }, 2200);

}


/* =========================================================
   REDIRECT
========================================================= */

function redirectToDay2() {

    if (redirecting) return;

    redirecting = true;

    window.location.href = NEXT_VIDEO;

}


/* =========================================================
   VIDEO ERROR
========================================================= */

video.addEventListener("error", () => {

    if (loading) {
        loading.classList.add("hidden");
    }

    if (videoError) {
        videoError.classList.add("show");
    }

});


/* =========================================================
   SOURCE CHECK
========================================================= */

window.addEventListener("load", () => {

    if (!video) return;

    /*
        If the browser cannot find the source,
        the error event will handle it.
    */

    video.load();

});


/* =========================================================
   PREVENT CONTEXT MENU
========================================================= */

video.addEventListener("contextmenu", (event) => {

    event.preventDefault();

});


/* =========================================================
   PREVENT DOUBLE TOUCH ACTIONS
========================================================= */

video.addEventListener(
    "touchstart",
    (event) => {

        event.preventDefault();

    },
    {
        passive: false
    }
);
