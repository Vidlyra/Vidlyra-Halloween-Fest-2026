/* ==========================================
   STORY CONTROLLER
========================================== */

const storyLines = [

"The moon hides behind the drifting clouds...",

"A cold wind whispers through the ancient forest...",

"The old castle watches every traveler...",

"Tonight...",

"Your journey begins."

];

const storyText = document.getElementById("storyText");

const nextBtn = document.getElementById("nextBtn");

const bgMusic = document.getElementById("bgMusic");

let index = 0;

function showNextLine(){

    if(index >= storyLines.length){

        return;

    }

    const line = document.createElement("p");

    line.textContent = storyLines[index];

    line.style.opacity = "0";

    storyText.appendChild(line);

    setTimeout(()=>{

        line.style.transition = "opacity 1s";

        line.style.opacity = "1";

    },100);

    index++;

    setTimeout(showNextLine,1800);

}

document.addEventListener("DOMContentLoaded",()=>{

    if(bgMusic){

        bgMusic.volume = 0.3;

        bgMusic.play().catch(()=>{});

    }

    showNextLine();

});

nextBtn.addEventListener("click",()=>{

    window.location.href="adventure.html";

});
