/* =====================================
   VIDLYRA HALLOWEEN FEST 2026
   DAY 5 VIDEO INTRO JS
   THE HAUNTED CEMETERY
===================================== */


const video = document.getElementById("day5Video");

const overlay = document.getElementById("endOverlay");





// WAIT FOR PAGE LOAD

window.addEventListener("load", () => {


    video.play().catch(() => {

        console.log(
        "Autoplay blocked. User interaction required."
        );

    });


});







// VIDEO END EVENT


video.addEventListener("ended", () => {


    setTimeout(() => {


        overlay.classList.add("show");


    },1000);



});







// CLICK TO ENTER GAME


overlay.addEventListener("click",()=>{


    overlay.style.opacity="0";


    setTimeout(()=>{


        window.location.href =
        "day5-game.html";


    },800);



});







// OPTIONAL: SKIP VIDEO WITH KEY


document.addEventListener(
"keydown",

(event)=>{


    if(event.key === "Enter" ||
       event.key === " "){


        video.currentTime =
        video.duration;


    }



});







// HANDLE VIDEO ERROR


video.addEventListener(
"error",

()=>{


console.error(
"Day 5 video failed to load"
);


});







// MOBILE SCREEN RESIZE FIX


function resizeVideo(){


    video.style.height =
    window.innerHeight + "px";


}


window.addEventListener(
"resize",
resizeVideo
);


resizeVideo();
