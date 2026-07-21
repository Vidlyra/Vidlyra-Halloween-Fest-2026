/* ==========================================================
   VIDLYRA HALLOWEEN FEST 2026
   Loading Engine v1.0
========================================================== */

"use strict";

// ==========================================================
// ELEMENTS
// ==========================================================

const bar = document.getElementById("bar");
const percent = document.getElementById("percent");
const status = document.getElementById("status");

const portal = document.getElementById("portalContainer");

const lightning = document.querySelector(".lightning");

const particles = document.getElementById("particles");

const thunder = document.getElementById("thunder");
const wind = document.getElementById("wind");

// ==========================================================
// LOADING MESSAGES
// ==========================================================

const messages = [

"Initializing Halloween Realm...",

"Scanning Ancient Ruins...",

"Summoning Shadow Bats...",

"Awakening Forgotten Spirits...",

"Opening the Veil...",

"Charging the Portal...",

"Entering the Haunted Realm..."

];

// ==========================================================
// SETTINGS
// ==========================================================

let progress = 0;

let finished = false;

const LOADING_SPEED = 45;

// ==========================================================
// AUDIO
// ==========================================================

document.addEventListener("click", () => {

    if (wind) {

        wind.volume = 0.25;

        wind.play().catch(() => {});

    }

}, { once:true });

// ==========================================================
// PARTICLES
// ==========================================================

function createParticles(){

    if(!particles) return;

    for(let i=0;i<300;i++){

        const p=document.createElement("div");

        p.className="particle";

        p.style.left=Math.random()*100+"vw";

        p.style.top=Math.random()*100+"vh";

        p.style.animationDuration=
        (6+Math.random()*8)+"s";

        p.style.animationDelay=
        Math.random()*6+"s";

        particles.appendChild(p);

    }

}

createParticles();

// ==========================================================
// UPDATE MESSAGE
// ==========================================================

function updateMessage(value){

    if(value>=15)
        status.innerHTML=messages[1];

    if(value>=30)
        status.innerHTML=messages[2];

    if(value>=50)
        status.innerHTML=messages[3];

    if(value>=70)
        status.innerHTML=messages[4];

    if(value>=90)
        status.innerHTML=messages[5];

}

// ==========================================================
// LOADING BAR
// ==========================================================

const loader=setInterval(()=>{

    if(finished) return;

    progress++;

    bar.style.width=progress+"%";

    percent.innerHTML=progress+"%";

    updateMessage(progress);

    if(progress>=100){

        finished=true;

        clearInterval(loader);

        status.innerHTML=messages[6];

        startPortalSequence();

    }

},LOADING_SPEED);

// ==========================================================
// PLACEHOLDER
// Part 2 will replace this.
// ==========================================================

function startPortalSequence(){

    console.log("Portal sequence...");

}
