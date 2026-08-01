/* =========================================================
   VIDLYRA HALLOWEEN FEST 2026
   DAY 6 — HAUNTED MANSION
   VIDEO JAVASCRIPT
========================================================= */

"use strict";

/* =========================================================
   ELEMENTS
========================================================= */

const video = document.getElementById("day6Video");
const playButton = document.getElementById("playButton");
const loading = document.getElementById("loading");
const dayLabel = document.getElementById("dayLabel");
const endScreen = document.getElementById("endScreen");
const continueButton = document.getElementById("continueButton");


/* =========================================================
   SETTINGS
========================================================= */

const DAY6 = {

    videoStarted: false,

    videoFinished: false,

    redirectPage: "day6-epic-game.html",

    fadeDuration: 1500,

    titleHideTime: 3,

    loadingText: "ENTERING THE MANSION...",

    readyText: "PRESS ENTER TO BEGIN"

};


/* =========================================================
   INITIAL STATE
========================================================= */

function initializeDay6() {

    loading.textContent = DAY6.loadingText;

    playButton.classList.remove("hidden");

    endScreen.classList.remove("show");

    dayLabel.classList.remove("hidden");

    video.currentTime = 0;

    /*
       Muted allows the browser to attempt autoplay.
       The user can press ENTER if autoplay is blocked.
    */

    video.muted = true;

}


/* =========================================================
   START VIDEO
========================================================= */

function startVideo() {

    if (DAY6.videoStarted) return;

    const promise = video.play();

    if (!promise) {

        videoStartedSuccessfully();

        return;

    }

    promise
        .then(() => {

            videoStartedSuccessfully();

        })
        .catch(() => {

            videoPlaybackBlocked();

        });

}


/* =========================================================
   VIDEO STARTED
========================================================= */

function videoStartedSuccessfully() {

    DAY6.videoStarted = true;

    playButton.classList.add("hidden");

    loading.classList.add("hidden");

}


/* =========================================================
   AUTOPLAY BLOCKED
========================================================= */

function videoPlaybackBlocked() {

    DAY6.videoStarted = false;

    playButton.classList.remove("hidden");

    loading.textContent =
        DAY6.readyText;

    loading.classList.remove("hidden");

}


/* =========================================================
   PLAY BUTTON
========================================================= */

if (playButton) {

    playButton.addEventListener(
        "click",
        function () {

            startVideo();

        }
    );

}


/* =========================================================
   KEYBOARD CONTROL
========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.code === "Enter" ||
            event.code === "Space"
        ) {

            event.preventDefault();

            if (!DAY6.videoStarted) {

                startVideo();

            }

        }

    }
);


/* =========================================================
   VIDEO PLAY EVENT
========================================================= */

video.addEventListener(
    "play",
    function () {

        DAY6.videoStarted = true;

        playButton.classList.add("hidden");

        loading.classList.add("hidden");

    }
);


/* =========================================================
   VIDEO LOADED
========================================================= */

video.addEventListener(
    "loadedmetadata",
    function () {

        loading.textContent =
            DAY6.readyText;

    }
);


/* =========================================================
   VIDEO CAN PLAY
========================================================= */

video.addEventListener(
    "canplay",
    function () {

        loading.classList.add("hidden");

        playButton.classList.remove("hidden");

    }
);


/* =========================================================
   TITLE CONTROL
========================================================= */

video.addEventListener(
    "timeupdate",
    function () {

        if (
            video.currentTime >=
            DAY6.titleHideTime
        ) {

            dayLabel.classList.add("hidden");

        }

    }
);


/* =========================================================
   VIDEO ENDED
========================================================= */

video.addEventListener(
    "ended",
    function () {

        if (DAY6.videoFinished) return;

        DAY6.videoFinished = true;

        dayLabel.classList.add("hidden");

        loading.classList.add("hidden");

        playButton.classList.add("hidden");

        showEndScreen();

    }
);


/* =========================================================
   END SCREEN
========================================================= */

function showEndScreen() {

    setTimeout(
        function () {

            endScreen.classList.add("show");

        },
        500
    );

}


/* =========================================================
   CONTINUE TO DAY 6 GAME
========================================================= */

if (continueButton) {

    continueButton.addEventListener(
        "click",
        function () {

            goToDay6Game();

        }
    );

}


/* =========================================================
   REDIRECT
========================================================= */

function goToDay6Game() {

    const transition =
        document.createElement("div");

    transition.className =
        "fade-transition";

    document.body.appendChild(transition);

    requestAnimationFrame(
        function () {

            transition.classList.add("active");

        }
    );

    setTimeout(
        function () {

            window.location.href =
                DAY6.redirectPage;

        },
        DAY6.fadeDuration
    );

}


/* =========================================================
   ERROR HANDLING
========================================================= */

video.addEventListener(
    "error",
    function () {

        loading.textContent =
            "DAY 6 VIDEO COULD NOT BE LOADED";

        loading.classList.remove("hidden");

        playButton.classList.add("hidden");

        console.error(
            "Day 6 video could not be loaded."
        );

    }
);


/* =========================================================
   PAGE VISIBILITY
========================================================= */

document.addEventListener(
    "visibilitychange",
    function () {

        if (document.hidden) {

            /*
               Pause while the browser tab is hidden.
            */

            if (!video.paused) {

                video.pause();

            }

        }

    }
);


/* =========================================================
   INITIALIZE
========================================================= */

window.addEventListener(
    "load",
    function () {

        initializeDay6();

        /*
           Give the browser a moment to load
           the video before attempting autoplay.
        */

        setTimeout(
            function () {

                startVideo();

            },
            700
        );

    }
);
