/* ===========================
   Vidlyra Halloween Fest 2026
   animations.js
=========================== */

// AUDIO
const thunder = new Audio("assets/thunder.mp3");
thunder.volume = 0.35;

// Unlock audio after first user interaction
document.addEventListener(
  "click",
  () => {
    thunder.play().then(() => {
      thunder.pause();
      thunder.currentTime = 0;
    }).catch(() => {});
  },
  { once: true }
);

// ELEMENTS
const svg = document.querySelector(".lightning-svg");
const moon = document.querySelector(".moon");
const fog = document.querySelectorAll(".fog");
const rain = document.getElementById("rain");
const bats = document.getElementById("bats");

// =======================
// LIGHTNING
// =======================

function lightning() {

    svg.innerHTML = "";

    const startX = Math.random() * window.innerWidth;

    let x = startX;
    let y = 0;

    let path = `M ${x} ${y}`;

    for (let i = 0; i < 10; i++) {

        x += Math.random() * 80 - 40;
        y += 70;

        path += ` L ${x} ${y}`;

    }

    const bolt = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
    );

    bolt.setAttribute("d", path);
    bolt.setAttribute("class", "lightning-line");

    svg.appendChild(bolt);

    bolt.animate(
        [
            { opacity: 0 },
            { opacity: 1 },
            { opacity: .3 },
            { opacity: 1 },
            { opacity: 0 }
        ],
        {
            duration: 450
        }
    );

    moon.classList.add("flash");

    fog.forEach(f => f.classList.add("flash"));

    document.body.classList.add("shake");

    // Thunder
    thunder.currentTime = 0;
    thunder.play().catch(() => {});

    setTimeout(() => {

        moon.classList.remove("flash");

        fog.forEach(f => f.classList.remove("flash"));

        document.body.classList.remove("shake");

        svg.innerHTML = "";

    }, 450);

}

// Random lightning

setInterval(() => {

    if (Math.random() > 0.55) {

        lightning();

    }

}, 3500);

// =======================
// RAIN
// =======================

for (let i = 0; i < 300; i++) {

    const drop = document.createElement("span");

    drop.className = "drop";

    drop.style.left = Math.random() * 100 + "vw";

    drop.style.animationDuration =
        (0.4 + Math.random() * 0.5) + "s";

    drop.style.animationDelay =
        Math.random() * 2 + "s";

    rain.appendChild(drop);

}

// =======================
// BATS
// =======================

for (let i = 0; i < 50; i++) {

    const bat = document.createElement("div");

    bat.className = "bat";

    bat.innerHTML = "🦇";

    bat.style.left = Math.random() * 100 + "vw";

    bat.style.top = Math.random() * 40 + "vh";

    bat.style.animationDuration =
        (6 + Math.random() * 8) + "s";

    bat.style.animationDelay =
        Math.random() * 5 + "s";

    bats.appendChild(bat);

}
