/* ======================================================
   VIDLYRA HALLOWEEN FEST 2026
   WORLD ENGINE V1
====================================================== */

// -----------------------------
// ELEMENTS
// -----------------------------

const rain = document.getElementById("rain");
const bats = document.getElementById("bats");
const particles = document.getElementById("particles");
const lightning = document.querySelector(".lightning");
const eyes = document.querySelectorAll(".eyes");
const pumpkins = document.querySelectorAll(".pumpkin");

const ambient = document.getElementById("ambient");
const thunder = document.getElementById("thunder");

// -----------------------------
// ENABLE AUDIO AFTER CLICK
// -----------------------------

document.addEventListener("click", () => {

    if (ambient) {

        ambient.volume = 0.25;

        ambient.play().catch(() => {});

    }

}, { once: true });


// -----------------------------
// RAIN
// -----------------------------

for (let i = 0; i < 250; i++) {

    const drop = document.createElement("span");

    drop.className = "drop";

    drop.style.left = Math.random() * 100 + "vw";

    drop.style.animationDuration =
        (0.5 + Math.random() * 0.6) + "s";

    drop.style.animationDelay =
        Math.random() * 2 + "s";

    rain.appendChild(drop);

}


// -----------------------------
// PARTICLES
// -----------------------------

for (let i = 0; i < 180; i++) {

    const p = document.createElement("div");

    p.className = "particle";

    p.style.left = Math.random() * 100 + "vw";

    p.style.top = Math.random() * 100 + "vh";

    p.style.animationDuration =
        (6 + Math.random() * 6) + "s";

    p.style.animationDelay =
        Math.random() * 6 + "s";

    particles.appendChild(p);

}


// -----------------------------
// BATS
// -----------------------------

for (let i = 0; i < 50; i++) {

    const bat = document.createElement("div");

    bat.className = "bat";

    bat.innerHTML = "🦇";

    bat.style.left = Math.random() * 100 + "vw";

    bat.style.top = Math.random() * 40 + "vh";

    bat.style.animationDuration =
        (8 + Math.random() * 8) + "s";

    bat.style.animationDelay =
        Math.random() * 6 + "s";

    bats.appendChild(bat);

}


// -----------------------------
// BLINKING EYES
// -----------------------------

setInterval(() => {

    eyes.forEach(eye => {

        eye.style.opacity = Math.random() > 0.5 ? "1" : "0";

    });

}, 2500);


// -----------------------------
// PUMPKIN GLOW
// -----------------------------

setInterval(() => {

    pumpkins.forEach(p => {

        p.style.filter =
            Math.random() > 0.5
                ? "drop-shadow(0 0 15px orange)"
                : "drop-shadow(0 0 5px red)";

    });

}, 900);


// -----------------------------
// LIGHTNING
// -----------------------------

function flash() {

    if (!lightning) return;

    lightning.style.opacity = 1;

    document.body.classList.add("shake");

    if (thunder) {

        thunder.currentTime = 0;

        thunder.play().catch(() => {});

    }

    setTimeout(() => {

        lightning.style.opacity = 0;

        document.body.classList.remove("shake");

    }, 200);

}

setInterval(() => {

    if (Math.random() > 0.6) {

        flash();

    }

}, 4500);


// -----------------------------
// BUTTONS
// -----------------------------

const enterButton = document.getElementById("enterButton");

if (enterButton) {

    enterButton.addEventListener("click", () => {

        alert("The Haunted Realm will open in Lesson 7!");

    });

}

const aboutButton = document.getElementById("aboutButton");

if (aboutButton) {

    aboutButton.addEventListener("click", () => {

        alert("Story page coming soon!");

    });

}
