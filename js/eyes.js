/* ==========================================
   HIDDEN EYES
========================================== */

const eyesContainer =
    document.getElementById("eyesContainer");

function createEyes(){

    if(!eyesContainer) return;

    const pair =
        document.createElement("div");

    pair.className="eye-pair";

    pair.style.left =
        (10 + Math.random()*80) + "%";

    pair.style.bottom =
        (8 + Math.random()*20) + "%";

    pair.innerHTML=`

        <div class="eye left"></div>
        <div class="eye right"></div>

    `;

    eyesContainer.appendChild(pair);

    setTimeout(()=>{

        pair.remove();

    },6000);

}

setInterval(()=>{

    createEyes();

},12000);
