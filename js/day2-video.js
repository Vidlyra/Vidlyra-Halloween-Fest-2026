/* ==========================================
   VIDLYRA HALLOWEEN FEST 2026
   DAY 2 VIDEO CONTROLLER
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    const video = document.getElementById("introVideo");

    const startScreen = document.getElementById("startScreen");

    const startBtn = document.getElementById("startBtn");

    const overlay = document.getElementById("videoOverlay");

    const enterWell = document.getElementById("enterWell");

    const skipBtn = document.getElementById("skipBtn");

    /* -----------------------------
       Start Experience
    ------------------------------ */

    if (startBtn) {

        startBtn.addEventListener("click", () => {

            startScreen.style.display = "none";

            video.muted = false;

            video.volume = 1;

            video.currentTime = 0;

            video.play().catch(error => {

                console.log(error);

            });

        });

    }

    /* -----------------------------
       Video Finished
    ------------------------------ */

    if (video) {

        video.addEventListener("ended", () => {

            if (overlay) {

                overlay.classList.add("show");

            }

        });

    }

    /* -----------------------------
       Enter the Well
    ------------------------------ */

    if (enterWell) {

        enterWell.addEventListener("click", () => {

            window.location.href = "day2-game.html";

        });

    }

    /* -----------------------------
       Skip Intro
    ------------------------------ */

    if (skipBtn) {

        skipBtn.addEventListener("click", () => {

            if (video) {

                video.pause();

            }

            window.location.href = "day2-game.html";

        });

    }

});
