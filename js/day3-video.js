/* ==========================================
   VIDLYRA HALLOWEEN FEST 2026
   DAY 3 VIDEO
========================================== */

"use strict";

/* ==========================================
ELEMENTS
========================================== */

const video =
document.getElementById("introVideo");

const overlay =
document.getElementById("videoOverlay");

const skipBtn =
document.getElementById("skipBtn");

const enterBtn =
document.getElementById("enterForest");

const clickSound =
document.getElementById("clickSound");

/* ==========================================
PLAY VIDEO
========================================== */

function playIntro(){

    if(!video) return;

    video.volume = 1;

    video.muted = false;

    const promise = video.play();

    if(promise){

        promise.catch(()=>{

            console.log(
                "Autoplay blocked."
            );

        });

    }

}

/* ==========================================
SHOW OVERLAY
========================================== */

function showOverlay(){

    overlay.classList.add("show");

    skipBtn.style.display="none";

}

/* ==========================================
SKIP INTRO
========================================== */

function skipIntro(){

    if(video){

        video.pause();

    }

    showOverlay();

}

/* ==========================================
VIDEO ENDED
========================================== */

if(video){

    video.addEventListener(

        "ended",

        ()=>{

            showOverlay();

        }

    );

}

/* ==========================================
SKIP BUTTON
========================================== */

if(skipBtn){

    skipBtn.addEventListener(

        "click",

        ()=>{

            if(clickSound){

                clickSound.currentTime=0;

                clickSound.play().catch(()=>{});

            }

            skipIntro();

        }

    );

}

/* ==========================================
ENTER GAME
========================================== */

if(enterBtn){

    enterBtn.addEventListener(

        "click",

        ()=>{

            if(clickSound){

                clickSound.currentTime=0;

                clickSound.play().catch(()=>{});

            }

            overlay.style.opacity="0";

            setTimeout(()=>{

                window.location.href=

                "day3-game.html";

            },700);

        }

    );

}

/* ==========================================
KEYBOARD
========================================== */

document.addEventListener(

    "keydown",

    (e)=>{

        if(e.code==="Space"){

            e.preventDefault();

            skipIntro();

        }

        if(e.code==="Enter" &&

            overlay.classList.contains("show")){

            window.location.href=

            "day3-game.html";

        }

    }

);

/* ==========================================
START
========================================== */

window.addEventListener(

    "load",

    ()=>{

        playIntro();

    }

);

/* ==========================================
SAFETY
========================================== */

setTimeout(()=>{

    if(video &&

        video.ended===false &&

        video.currentTime===0){

        console.log(

            "Waiting for user interaction..."

        );

    }

},3000);
