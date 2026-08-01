document.addEventListener("DOMContentLoaded", function () {

    const video = document.getElementById("day6Video");
    const winScreen = document.getElementById("winScreen");
    const darkOverlay = document.getElementById("darkOverlay");
    const enterButton = document.getElementById("enterButton");
    const loading = document.getElementById("loading");


    /* =========================
       VIDEO LOADED
    ========================= */

    video.addEventListener("loadeddata", function () {

        loading.classList.add("hide");

        /*
         * Try autoplay.
         * Muted autoplay is allowed by most browsers.
         */

        video.muted = true;

        const playPromise = video.play();

        if (playPromise !== undefined) {

            playPromise.catch(function () {

                /*
                 * Browser blocked autoplay.
                 * User can press the normal video play button.
                 */

                console.log("Autoplay blocked. User interaction required.");

            });

        }

    });


    /* =========================
       VIDEO ERROR
    ========================= */

    video.addEventListener("error", function () {

        loading.classList.add("hide");

        console.log("Day 6 video could not be loaded.");

    });


    /* =========================
       VIDEO ENDED
    ========================= */

    video.addEventListener("ended", function () {

        /*
         * Freeze the video on the final frame.
         */

        video.pause();

        /*
         * Darken the screen.
         */

        darkOverlay.classList.add("active");


        /*
         * Small delay before showing
         * the WIN screen.
         */

        setTimeout(function () {

            winScreen.classList.add("show");

        }, 900);

    });


    /* =========================
       ENTER DAY 6 GAME
    ========================= */

    enterButton.addEventListener("click", function () {

        /*
         * Redirect to Day 6 game.
         */

        window.location.href = "day6-game.html";

    });


    /* =========================
       KEYBOARD SUPPORT
    ========================= */

    document.addEventListener("keydown", function (event) {

        if (
            event.key === "Enter" &&
            winScreen.classList.contains("show")
        ) {

            window.location.href = "day6-game.html";

        }

    });


});
