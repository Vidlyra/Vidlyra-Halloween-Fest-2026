"use strict";

/* =========================================================
   VIDLYRA HALLOWEEN FEST 2026
   ANIME END CREDITS ENGINE
========================================================= */

const introScreen =
    document.getElementById("introScreen");

const credits =
    document.getElementById("credits");

const postCredit =
    document.getElementById("postCredit");

const creditsMusic =
    document.getElementById("creditsMusic");

const skipButton =
    document.getElementById("skipButton");

const homeButton =
    document.getElementById("homeButton");

const stars =
    document.getElementById("stars");

const particles =
    document.getElementById("particles");


/* =========================================================
   SETTINGS
========================================================= */

const SETTINGS = {

    introDuration: 3500,

    creditSpeed: 1,

    postCreditDelay: 2500,

    homePage: "index.html"

};


/* =========================================================
   STATE
========================================================= */

let creditsStarted = false;

let creditsFinished = false;


/* =========================================================
   CREATE STARS
========================================================= */

function createStars() {

    if (!stars) return;

    const count =
        window.innerWidth < 600
            ? 45
            : 90;

    for (let i = 0; i < count; i++) {

        const star =
            document.createElement("div");

        star.className = "star";

        star.style.left =
            Math.random() * 100 + "%";

        star.style.top =
            Math.random() * 100 + "%";

        star.style.animationDelay =
            Math.random() * 3 + "s";

        star.style.animationDuration =
            1.5 + Math.random() * 3 + "s";

        stars.appendChild(star);

    }

}


/* =========================================================
   CREATE PARTICLES
========================================================= */

function createParticles() {

    if (!particles) return;

    const count =
        window.innerWidth < 600
            ? 18
            : 35;

    for (let i = 0; i < count; i++) {

        const particle =
            document.createElement("div");

        particle.className =
            "particle";

        particle.style.left =
            Math.random() * 100 + "%";

        particle.style.animationDuration =
            8 + Math.random() * 15 + "s";

        particle.style.animationDelay =
            Math.random() * 10 + "s";

        particles.appendChild(particle);

    }

}


/* =========================================================
   MUSIC
========================================================= */

function startMusic() {

    if (!creditsMusic) return;

    creditsMusic.volume = 0.65;

    const promise =
        creditsMusic.play();

    if (promise) {

        promise.catch(() => {

            /*
                Browser autoplay may be blocked.

                The first user interaction will
                start the music.
            */

        });

    }

}


function enableMusicInteraction() {

    if (!creditsMusic) return;

    if (!creditsMusic.paused) return;

    creditsMusic.volume = 0.65;

    creditsMusic.play().catch(() => {});

}


document.addEventListener(
    "click",
    enableMusicInteraction,
    { once: true }
);

document.addEventListener(
    "touchstart",
    enableMusicInteraction,
    {
        once: true,
        passive: true
    }
);


/* =========================================================
   START INTRO
========================================================= */

function startIntro() {

    setTimeout(() => {

        if (introScreen) {

            introScreen.classList.add("hide");

        }

        if (credits) {

            credits.classList.add("visible");

        }

        startCredits();

    }, SETTINGS.introDuration);

}


/* =========================================================
   CREDIT CARDS
========================================================= */

function setupCreditObserver() {

    const cards =
        document.querySelectorAll(
            ".credit-card"
        );

    if (!cards.length) return;

    const observer =
        new IntersectionObserver(
            (entries) => {

                entries.forEach((entry) => {

                    if (entry.isIntersecting) {

                        entry.target.classList.add(
                            "active"
                        );

                    }

                });

            },
            {
                threshold: 0.35
            }
        );

    cards.forEach((card) => {

        observer.observe(card);

    });

}


/* =========================================================
   START CREDITS
========================================================= */

function startCredits() {

    if (creditsStarted) return;

    creditsStarted = true;

    setupCreditObserver();

    /*
        Music begins with the actual credits.
    */

    startMusic();

    /*
        Slowly scroll toward post-credit scene.
    */

    const duration =
        window.innerWidth < 600
            ? 170000
            : 145000;

    setTimeout(() => {

        showPostCredit();

    }, duration);

}


/* =========================================================
   POST CREDIT
========================================================= */

function showPostCredit() {

    if (creditsFinished) return;

    creditsFinished = true;

    if (postCredit) {

        postCredit.classList.add("show");

        postCredit.scrollIntoView({
            behavior: "smooth"
        });

    }

}


/* =========================================================
   SKIP
========================================================= */

function skipCredits() {

    if (creditsFinished) {

        return;

    }

    showPostCredit();

}


if (skipButton) {

    skipButton.addEventListener(
        "click",
        skipCredits
    );

}


/* =========================================================
   RETURN HOME
========================================================= */

if (homeButton) {

    homeButton.addEventListener(
        "click",
        () => {

            window.location.href =
                SETTINGS.homePage;

        }
    );

}


/* =========================================================
   KEYBOARD
========================================================= */

document.addEventListener(
    "keydown",
    (event) => {

        if (event.code === "Escape") {

            skipCredits();

        }

    }
);


/* =========================================================
   PREVENT ACCIDENTAL DRAG
========================================================= */

document.addEventListener(
    "dragstart",
    (event) => {

        event.preventDefault();

    }
);


/* =========================================================
   INITIALIZE
========================================================= */

window.addEventListener(
    "load",
    () => {

        createStars();

        createParticles();

        startIntro();

    }
);
