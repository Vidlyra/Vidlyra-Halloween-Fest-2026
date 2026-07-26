const video =
document.getElementById("day5Video");


const startOverlay =
document.getElementById("startOverlay");


const startButton =
document.getElementById("startVideo");


const endOverlay =
document.getElementById("endOverlay");





// START VIDEO WITH SOUND


startButton.addEventListener(
"click",

()=>{


startOverlay.style.display="none";


video.muted=false;


video.volume=1;


video.play();



}

);







// VIDEO FINISHED


video.addEventListener(

"ended",

()=>{


setTimeout(()=>{


endOverlay.classList.add("show");


},1000);



}

);








// REDIRECT TO GAME


endOverlay.addEventListener(

"click",

()=>{


window.location.href=
"day5-game.html";


}

);






// FULLSCREEN WHEN VIDEO STARTS


startButton.addEventListener(

"click",

()=>{


if(video.requestFullscreen){


video.requestFullscreen();


}


}

);
