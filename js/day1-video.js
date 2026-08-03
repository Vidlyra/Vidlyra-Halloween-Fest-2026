/* =========================================
   VIDLYRA HALLOWEEN FEST 2026
   DAY 1 VIDEO
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
   HIDE LOADING
========================================= */

function hideLoading() {

    loading.classList.add("hidden");

}


/* =========================================
   VIDEO READY
========================================= */

video.addEventListener("canplay", () => {

    hideLoading();

});


/* =========================================
   VIDEO STARTED
========================================= */

video.addEventListener("playing", () => {

    hideLoading();

});


/* =========================================
   VIDEO ENDED
========================================= */

video.addEventListener("ended", () => {

    if (videoEnded) {
        return;
    }

    videoEnded = true;


    /* Show ending overlay */

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
        "Day 1 video could not be loaded."
    );

});


/* =========================================
   INITIAL CHECK
========================================= */

if (video.readyState >= 3) {

    hideLoading();

}
```
