const rain = document.getElementById("rain");

const TOTAL_DROPS = 220;

for(let i = 0; i < TOTAL_DROPS; i++){

    const drop = document.createElement("div");

    drop.className = "raindrop";

    drop.style.left = Math.random()*100 + "%";

    drop.style.animationDuration =
        (0.5 + Math.random()*0.8) + "s";

    drop.style.animationDelay =
        Math.random()*2 + "s";

    drop.style.opacity =
        0.2 + Math.random()*0.6;

    drop.style.height =
        (12 + Math.random()*28) + "px";

    drop.style.transform =
        `rotate(${12 + Math.random()*8}deg)`;

    rain.appendChild(drop);

}
