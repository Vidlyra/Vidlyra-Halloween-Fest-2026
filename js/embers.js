/* ==========================================
   EMBERS
========================================== */

const emberContainer =
    document.getElementById("embers");

function createEmber(){

    const ember =
        document.createElement("div");

    ember.className = "ember";

    const size =
        Math.random()*4+2;

    ember.style.width = size+"px";
    ember.style.height = size+"px";

    ember.style.left =
        Math.random()*100+"vw";

    ember.style.bottom =
        "-10px";

    ember.style.animationDuration =
        (6+Math.random()*6)+"s";

    ember.style.animationDelay =
        Math.random()*2+"s";

    emberContainer.appendChild(ember);

    ember.addEventListener("animationend",()=>{

        ember.remove();

    });

}

setInterval(createEmber,250);
