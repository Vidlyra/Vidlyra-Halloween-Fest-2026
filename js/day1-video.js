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
   VIDEO READY
========================================= */

video.addEventListener("canplay", () => {

    loading.classList.add("hidden");

});


/* =========================================
   VIDEO STARTED
========================================= */

video.addEventListener("playing", () => {

    loading.classList.add("hidden");

});


/* =========================================
   VIDEO ENDED
========================================= */

video.addEventListener("ended", () => {

    /* Show ending overlay */

    endOverlay.classList.add("show");


    /* Redirect after overlay */

    setTimeout(() => {

        window.location.href =
            "day2-video.html";

    }, 2500);

});


/* =========================================
   VIDEO ERROR
========================================= */

video.addEventListener("error", () => {

    loading.classList.add("hidden");

    console.error(
        "Day 1 video could not be loaded."
    );

});
```
