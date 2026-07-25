const video =
document.getElementById("introVideo");

const overlay =
document.getElementById("videoOverlay");

const enterButton =
document.getElementById("enterWell");

video.addEventListener("ended",()=>{

    overlay.classList.add("show");

});

enterButton.addEventListener("click",()=>{

    window.location.href="day2-game.html";

});
