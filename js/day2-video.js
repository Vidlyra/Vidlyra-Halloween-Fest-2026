/* ==========================================
   VIDLYRA HALLOWEEN FEST 2026
   DAY 2 VIDEO
========================================== */

const video = document.getElementById("introVideo");

const overlay = document.getElementById("videoOverlay");

const enterButton = document.getElementById("enterWell");

const skipButton = document.getElementById("skipBtn");

/* -------------------------
Video Finished
-------------------------- */

if(video){

    video.addEventListener("ended",()=>{

        overlay.classList.add("show");

    });

}

/* -------------------------
Enter Game
-------------------------- */

if(enterButton){

    enterButton.addEventListener("click",()=>{

        window.location.href="day2-game.html";

    });

}

/* -------------------------
Skip Intro
-------------------------- */

if(skipButton){

    skipButton.addEventListener("click",()=>{

        if(video){

            video.pause();

        }

        window.location.href="day2-game.html";

    });

}
