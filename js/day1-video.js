/* =========================================
   VIDLYRA HALLOWEEN FEST 2026
   DAY 1 VIDEO
========================================= */


/* =========================================
   ELEMENTS
========================================= */

const video =
    document.getElementById("day1Video");

const loading =
    document.getElementById("loading");

const endOverlay =
    document.getElementById("endOverlay");


/* =========================================
   STATE
========================================= */

let videoEnded = false;

let redirectStarted = false;


/* =========================================
   HIDE LOADING SCREEN
========================================= */

function hideLoading() {

    if (!loading) {
        return;
    }

    loading.classList.add("hidden");

}


/* =========================================
   VIDEO READY
========================================= */

video.addEventListener("canplay", () => {

    hideLoading();

});


/* =========================================
   VIDEO PLAYING
========================================= */

video.addEventListener("playing", () => {

    hideLoading();

});


/* =========================================
   VIDEO ENDED
========================================= */

video.addEventListener("ended", () => {

    /* Prevent duplicate execution */

    if (videoEnded) {
        return;
    }

    videoEnded = true;


    /* Show Day 1 complete overlay */

    endOverlay.classList.add("show");


    /* Start redirect */

    startRedirect();

});


/* =========================================
   REDIRECT TO DAY 2
========================================= */

function startRedirect() {

    if (redirectStarted) {
        return;
    }

    redirectStarted = true;


    setTimeout(() => {

        window.location.href =
            "day2-video.html";

    }, 2500);

}


/* =========================================
   VIDEO ERROR
========================================= */

video.addEventListener("error", () => {

    hideLoading();

    console.error(
        "VidLyra Day 1 video could not be loaded."
    );

});


/* =========================================
   INITIAL VIDEO STATE CHECK
========================================= */

if (video.readyState >= 3) {

    hideLoading();

}
