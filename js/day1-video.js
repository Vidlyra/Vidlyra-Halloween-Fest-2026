"use strict";

/* =========================================================
   VIDLYRA HALLOWEEN FEST 2026
   DAY 1 VIDEO
   DAY 1 VIDEO → DAY 2 VIDEO
========================================================= */

const video = document.getElementById("day1Video");

const loadingScreen =
    document.getElementById("loadingScreen");

const loadingFill =
    document.getElementById("loadingFill");

const loadingPercent =
    document.getElementById("loadingPercent");

const endOverlay =
    document.getElementById("endOverlay");

const continueButton =
    document.getElementById("continueButton");

const skipButton =
    document.getElementById("skipButton");

const videoError =
    document.getElementById("videoError");


/* =========================================================
   SETTINGS
========================================================= */

const NEXT_VIDEO = "day2-video.html";


let videoFinished = false;
let redirecting = false;


/* =========================================================
   LOADING
========================================================= */

function updateLoading(percent) {

    percent = Math.max(
        0,
        Math.min(100, percent)
    );

    if (loadingFill) {
        loadingFill.style.width =
            percent + "%";
    }

    if (loadingPercent) {
        loadingPercent.textContent =
            Math.floor(percent) + "%";
    }
}


function hideLoading() {

    if (!loadingScreen) return;

    loadingScreen.classList.add("hidden");

    setTimeout(() => {

        loadingScreen.style.display =
            "none";

    }, 900);
}


/* =========================================================
   VIDEO READY
========================================================= */

if (video) {

    video.addEventListener(
        "loadedmetadata",
        () => {

            updateLoading(60);

        }
    );


    video.addEventListener(
        "canplay",
        () => {

            updateLoading(100);

            video.classList.add("ready");

            setTimeout(() => {

                hideLoading();

                startVideo();

            }, 300);

        }
    );


    video.addEventListener(
        "error",
        () => {

            if (loadingScreen) {
                loadingScreen.style.display =
                    "none";
            }

            if (videoError) {
                videoError.classList.add("show");
            }

            if (skipButton) {
                skipButton.classList.add("hidden");
            }

        }
    );


    video.addEventListener(
        "ended",
        () => {

            finishDay1();

        }
    );


    video.addEventListener(
        "timeupdate",
        () => {

            if (!video.duration) return;

            const progress =
                (video.currentTime /
                    video.duration) * 100;

            if (
                loadingScreen &&
                !loadingScreen.classList.contains("hidden")
            ) {
                updateLoading(
                    Math.max(60, progress)
                );
            }

        }
    );

}


/* =========================================================
   START VIDEO
========================================================= */

function startVideo() {

    if (!video) return;

    /*
       Browser autoplay policies may block
       unmuted playback.

       Muted autoplay is allowed more reliably.
    */

    video.muted = true;

    const playPromise =
        video.play();

    if (
        playPromise &&
        typeof playPromise.catch === "function"
    ) {

        playPromise.catch(() => {

            /*
                If autoplay is blocked,
                the video controls remain available.
            */

        });

    }

}


/* =========================================================
   DAY 1 COMPLETE
========================================================= */

function finishDay1() {

    if (videoFinished) return;

    videoFinished = true;

    if (skipButton) {
        skipButton.classList.add("hidden");
    }

    if (endOverlay) {
        endOverlay.classList.add("show");
    }

    localStorage.setItem(
        "day1Complete",
        "true"
    );

}


/* =========================================================
   REDIRECT TO DAY 2
========================================================= */

function goToDay2() {

    if (redirecting) return;

    redirecting = true;

    localStorage.setItem(
        "day1Complete",
        "true"
    );

    if (continueButton) {
        continueButton.disabled = true;
        continueButton.textContent =
            "ENTERING DAY 2...";
    }

    if (endOverlay) {

        endOverlay.style.opacity = "0";

    }

    setTimeout(() => {

        window.location.href =
            NEXT_VIDEO;

    }, 700);

}


/* =========================================================
   CONTINUE BUTTON
========================================================= */

if (continueButton) {

    continueButton.addEventListener(
        "click",
        goToDay2
    );

}


/* =========================================================
   SKIP BUTTON
========================================================= */

if (skipButton) {

    skipButton.addEventListener(
        "click",
        () => {

            finishDay1();

        }
    );

}


/* =========================================================
   KEYBOARD
========================================================= */

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Enter" &&
            videoFinished
        ) {

            goToDay2();

        }

    }
);


/* =========================================================
   INITIAL LOADING
========================================================= */

updateLoading(5);

window.addEventListener(
    "load",
    () => {

        updateLoading(20);

        /*
           If the browser has already loaded
           enough video data, canplay will
           finish the process.
        */

        if (
            video &&
            video.readyState >= 3
        ) {

            updateLoading(100);

            video.classList.add("ready");

            setTimeout(() => {

                hideLoading();

                startVideo();

            }, 300);

        }

    }
);
