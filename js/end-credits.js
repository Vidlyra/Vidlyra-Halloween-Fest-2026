"use strict";

/*
=========================================================
VIDLYRA HALLOWEEN FEST 2026
PROFESSIONAL CINEMATIC END CREDITS

Files:

end-credits.html
css/end-credits.css
js/end-credits.js
assets/credits.mp3

The system automatically calculates the credit-roll
duration from the actual height of the credits.
=========================================================
*/


/* =========================================
   ELEMENTS
========================================= */

const opening =
    document.getElementById("opening");

const creditsViewport =
    document.getElementById("creditsViewport");

const creditsRoll =
    document.getElementById("creditsRoll");

const postCredit =
    document.getElementById("postCredit");

const finalScreen =
    document.getElementById("finalScreen");

const beginButton =
    document.getElementById("beginButton");

const soundButton =
    document.getElementById("soundButton");

const skipButton =
    document.getElementById("skipButton");

const music =
    document.getElementById("creditsMusic");

const particles =
    document.getElementById("particles");


/* =========================================
   CONFIGURATION
========================================= */

const CONFIG = {

    /*
     * Pixels per second.
     * Lower = slower cinematic credits.
     */
    creditsSpeed: 38,

    /*
     * Minimum credit-roll duration.
     */
    minimumRollSeconds: 65,

    /*
     * Extra breathing room.
     */
    endingPaddingSeconds: 8,

    /*
     * Post-credit timing.
     */
    postCreditDelay: 1200,

    lineOneDelay: 1600,
    lineTwoDelay: 4200,
    lineThreeDelay: 7000,
    lineFourDelay: 9800,

    mysteryDelay: 12800,

    comingSoonDelay: 17000,

    finalDelay: 23000

};


/* =========================================
   STATE
========================================= */

let started = false;
let finished = false;
let musicEnabled = true;

let rollTimer = null;
let postTimer = null;


/* =========================================
   PARTICLES
========================================= */

function createParticles() {

    if (!particles) return;

    const amount =
        window.innerWidth < 700 ? 28 : 55;

    for (let i = 0; i < amount; i++) {

        const particle =
            document.createElement("span");

        particle.className =
            "particle";

        particle.style.left =
            `${Math.random() * 100}%`;

        particle.style.animationDuration =
            `${12 + Math.random() * 18}s`;

        particle.style.animationDelay =
            `${Math.random() * -20}s`;

        particle.style.opacity =
            `${0.15 + Math.random() * 0.55}`;

        const size =
            1 + Math.random() * 2.5;

        particle.style.width =
            `${size}px`;

        particle.style.height =
            `${size}px`;

        particles.appendChild(
            particle
        );
    }
}


/* =========================================
   MUSIC
========================================= */

async function startMusic() {

    if (!music || !musicEnabled) {
        return;
    }

    try {

        music.volume = 0;

        await music.play();

        fadeVolume(
            music,
            0,
            0.75,
            3000
        );

        updateSoundButton();

    } catch (error) {

        /*
         * Browser autoplay policy may prevent
         * playback. Since the user pressed the
         * begin button, playback should normally
         * succeed.
         */

        console.warn(
            "Credits music could not start:",
            error
        );

        musicEnabled = false;

        updateSoundButton();
    }
}


function fadeVolume(
    audio,
    from,
    to,
    duration
) {

    const start =
        performance.now();

    audio.volume = from;

    function step(now) {

        const progress =
            Math.min(
                1,
                (now - start) / duration
            );

        audio.volume =
            from +
            (to - from) *
            progress;

        if (progress < 1) {

            requestAnimationFrame(step);

        }

    }

    requestAnimationFrame(step);
}


/* =========================================
   SOUND CONTROL
========================================= */

function updateSoundButton() {

    if (!soundButton) return;

    soundButton.textContent =
        musicEnabled
            ? "SOUND ON"
            : "SOUND OFF";
}


function toggleSound() {

    if (!music) return;

    if (musicEnabled) {

        fadeVolume(
            music,
            music.volume,
            0,
            500
        );

        setTimeout(() => {

            music.pause();

        }, 520);

        musicEnabled = false;

    } else {

        musicEnabled = true;

        music.play()
            .then(() => {

                fadeVolume(
                    music,
                    0,
                    0.75,
                    800
                );

            })
            .catch(() => {

                musicEnabled = false;

            });

    }

    updateSoundButton();
}


/* =========================================
   CALCULATE CREDIT ROLL
========================================= */

function calculateRollDuration() {

    /*
     * Force browser to calculate the actual
     * content dimensions.
     */

    creditsRoll.style.transform =
        "translateY(0)";

    const contentHeight =
        creditsRoll.scrollHeight;

    const viewportHeight =
        creditsViewport.clientHeight;

    const totalDistance =
        contentHeight +
        viewportHeight;

    const calculated =
        totalDistance /
        CONFIG.creditsSpeed;

    return Math.max(
        calculated,
        CONFIG.minimumRollSeconds
    ) + CONFIG.endingPaddingSeconds;
}


/* =========================================
   START CREDIT ROLL
========================================= */

function startCredits() {

    if (started) return;

    started = true;

    beginButton.disabled = true;

    startMusic();

    opening.classList.remove(
        "active"
    );

    setTimeout(() => {

        creditsViewport.classList.add(
            "active"
        );

        startRoll();

    }, 1500);
}


/* =========================================
   ROLL
========================================= */

function startRoll() {

    const duration =
        calculateRollDuration();

    creditsRoll.style.animation =
        "none";

    /*
     * Force reflow so the animation can
     * restart reliably.
     */

    void creditsRoll.offsetHeight;

    creditsRoll.style.animation =
        `professionalCreditsRoll ${duration}s linear forwards`;

    /*
     * Dynamically create the animation
     * using the measured content height.
     */

    const style =
        document.createElement("style");

    style.id =
        "dynamicCreditsAnimation";

    const distance =
        creditsRoll.scrollHeight +
        creditsViewport.clientHeight;

    style.textContent = `

        @keyframes professionalCreditsRoll {

            from {
                transform:
                    translateY(0);
            }

            to {
                transform:
                    translateY(-${distance}px);
            }

        }

    `;

    document.head.appendChild(
        style
    );

    rollTimer =
        setTimeout(() => {

            beginPostCredit();

        }, duration * 1000 + CONFIG.postCreditDelay);
}


/* =========================================
   POST CREDIT
========================================= */

function beginPostCredit() {

    if (finished) return;

    finished = true;

    if (rollTimer) {

        clearTimeout(
            rollTimer
        );

    }

    creditsViewport.classList.remove(
        "active"
    );

    setTimeout(() => {

        postCredit.classList.add(
            "active"
        );

        playPostCreditScene();

    }, 1800);
}


/* =========================================
   POST CREDIT SCENE
========================================= */

function playPostCreditScene() {

    const line1 =
        document.getElementById(
            "sceneLine1"
        );

    const line2 =
        document.getElementById(
            "sceneLine2"
        );

    const line3 =
        document.getElementById(
            "sceneLine3"
        );

    const line4 =
        document.getElementById(
            "sceneLine4"
        );

    const mystery =
        document.getElementById(
            "mysteryLine"
        );

    const comingSoon =
        document.getElementById(
            "comingSoon"
        );


    setTimeout(() => {

        line1.classList.add(
            "show"
        );

    }, CONFIG.lineOneDelay);


    setTimeout(() => {

        line2.classList.add(
            "show"
        );

    }, CONFIG.lineTwoDelay);


    setTimeout(() => {

        line3.classList.add(
            "show"
        );

    }, CONFIG.lineThreeDelay);


    setTimeout(() => {

        line4.classList.add(
            "show"
        );

    }, CONFIG.lineFourDelay);


    setTimeout(() => {

        mystery.classList.add(
            "show"
        );

    }, CONFIG.mysteryDelay);


    setTimeout(() => {

        comingSoon.classList.add(
            "show"
        );

    }, CONFIG.comingSoonDelay);


    postTimer =
        setTimeout(() => {

            showFinalScreen();

        }, CONFIG.finalDelay);
}


/* =========================================
   FINAL SCREEN
========================================= */

function showFinalScreen() {

    postCredit.classList.remove(
        "active"
    );

    setTimeout(() => {

        finalScreen.classList.add(
            "active"
        );

        /*
         * Lower music slightly for the
         * final title reveal.
         */

        if (
            music &&
            !music.paused
        ) {

            fadeVolume(
                music,
                music.volume,
                0.35,
                2500
            );

        }

    }, 1800);
}


/* =========================================
   SKIP
========================================= */

function skipCredits() {

    if (!started) {

        startCredits();

        return;

    }

    if (!finished) {

        beginPostCredit();

        return;

    }

    showFinalScreen();
}


/* =========================================
   BUTTONS
========================================= */

beginButton.addEventListener(
    "click",
    startCredits
);

soundButton.addEventListener(
    "click",
    toggleSound
);

skipButton.addEventListener(
    "click",
    skipCredits
);


/* =========================================
   KEYBOARD
========================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === " " &&
            !started
        ) {

            event.preventDefault();

            startCredits();

        }

        if (
            event.key.toLowerCase() === "m"
        ) {

            toggleSound();

        }

        if (
            event.key === "Escape"
        ) {

            skipCredits();

        }

    }
);


/* =========================================
   INITIALIZE
========================================= */

function initialize() {

    createParticles();

    updateSoundButton();

    /*
     * Opening screen is visible.
     */

    opening.classList.add(
        "active"
    );

}


/* =========================================
   RESIZE
========================================= */

window.addEventListener(
    "resize",
    () => {

        if (
            started &&
            !finished
        ) {

            /*
             * Do not restart the credits
             * while the user is watching them.
             */

            return;

        }

        createParticles();

    }
);


/* =========================================
   START
========================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initialize
    );

} else {

    initialize();

}
