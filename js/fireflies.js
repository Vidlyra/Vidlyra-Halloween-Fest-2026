/* ==========================================
   MAGICAL FIREFLIES
========================================== */

const fireflyContainer =
    document.getElementById("fireflies");

function createFirefly(){

    const firefly =
        document.createElement("div");

    firefly.className = "firefly";

    const size =
        4 + Math.random() * 5;

    firefly.style.width = size + "px";
    firefly.style.height = size + "px";

    firefly.style.left =
        Math.random() * 100 + "vw";

    firefly.style.top =
        (50 + Math.random() * 40) + "vh";

    firefly.style.animationDuration =
        (8 + Math.random() * 6) + "s";

    fireflyContainer.appendChild(firefly);

    firefly.addEventListener("animationend",()=>{

        firefly.remove();

    });

}

setInterval(createFirefly,700);
