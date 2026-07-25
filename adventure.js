const pumpkin =
    document.querySelector(".pumpkin");

const progress =
    document.querySelector(".progress-fill");

const popup =
    document.getElementById("missionComplete");

pumpkin.addEventListener("click",()=>{

    progress.style.width="100%";

    popup.classList.add("show");

    setTimeout(()=>{

        window.location.href="reward.html";

    },2500);

});
