/* =========================================================
   VIDLYRA HALLOWEEN FEST 2026
   CINEMATIC END CREDITS

   MUSIC:
   assets/credits.mp3

   TOTAL EXPERIENCE:
   03:00 / 180 seconds

   SECTIONS:
   00:00–00:30  A Silent Halloween Night
   00:30–01:00  Memories of the Festival
   01:00–01:40  Hearts Shine Together
   01:40–02:20  Under the Harvest Moon
   02:20–02:45  The Festival Sleeps
   02:45–03:00  Until Next Halloween
========================================================= */


/* =========================================================
   CONFIGURATION
========================================================= */

const CONFIG = {

    totalDuration: 180000,

    openingDuration: 30000,

    rollStart: 28000,

    musicFadeIn: 3500,

    musicFadeOut: 5000,

    scrollSpeed: 48,

    particleCount: 45,

    finalFadeDuration: 3500,

    redirectAfterFinish: false,

    redirectURL: "index.html"

};


/* =========================================================
   ELEMENTS
========================================================= */

const cinema =
    document.getElementById("creditsCinema");

const opening =
    document.getElementById("opening");

const viewport =
    document.getElementById("creditsViewport");

const creditsRoll =
    document.getElementById("creditsRoll");

const music =
    document.getElementById("creditsMusic");

const soundButton =
    document.getElementById("soundButton");

const particles =
    document.getElementById("particles");


/* =========================================================
   STATE
========================================================= */

let started = false;

let finished = false;

let musicStarted = false;

let musicMuted = false;

let animationFrame = null;

let rollStartTime = 0;

let currentScroll = 0;

let totalScrollDistance = 0;


/* =========================================================
   INITIAL STATE
========================================================= */

if (opening) {

    opening.classList.add("active");

}

if (viewport) {

    viewport.classList.remove("active");

}

if (music) {

    music.volume = 0;

    music.loop = false;

}


/* =========================================================
   PARTICLE SYSTEM
========================================================= */

function createParticles() {

    if (!particles) return;

    particles.innerHTML = "";

    for (
        let i = 0;
        i < CONFIG.particleCount;
        i++
    ) {

        const particle =
            document.createElement("span");

        particle.className =
            "particle";

        const size =
            Math.random() * 2.5 + 1;

        const left =
            Math.random() * 100;

        const delay =
            Math.random() * 18;

        const duration =
            Math.random() * 12 + 10;

        particle.style.width =
            `${size}px`;

        particle.style.height =
            `${size}px`;

        particle.style.left =
            `${left}%`;

        particle.style.bottom =
            `${Math.random() * 15}%`;

        particle.style.animationDelay =
            `${delay}s`;

        particle.style.animationDuration =
            `${duration}s`;

        particles.appendChild(
            particle
        );

    }

}


/* =========================================================
   MUSIC FADE IN
========================================================= */

function fadeMusicIn() {

    if (!music || musicMuted) return;

    music.volume = 0;

    const start =
        performance.now();

    function fade(now) {

        const elapsed =
            now - start;

        const progress =
            Math.min(
                elapsed /
                CONFIG.musicFadeIn,
                1
            );

        music.volume =
            progress * 0.82;

        if (progress < 1) {

            requestAnimationFrame(fade);

        }

    }

    requestAnimationFrame(fade);

}


/* =========================================================
   MUSIC FADE OUT
========================================================= */

function fadeMusicOut() {

    if (!music) return;

    const initialVolume =
        music.volume;

    const start =
        performance.now();

    function fade(now) {

        const elapsed =
            now - start;

        const progress =
            Math.min(
                elapsed /
                CONFIG.musicFadeOut,
                1
            );

        music.volume =
            initialVolume *
            (1 - progress);

        if (progress < 1) {

            requestAnimationFrame(fade);

        } else {

            music.pause();

        }

    }

    requestAnimationFrame(fade);

}


/* =========================================================
   START MUSIC
========================================================= */

function startMusic() {

    if (
        !music ||
        musicStarted ||
        musicMuted
    ) {
        return;
    }

    musicStarted = true;

    music.currentTime = 0;

    const playPromise =
        music.play();

    if (
        playPromise &&
        typeof playPromise.catch ===
        "function"
    ) {

        playPromise
            .then(() => {

                fadeMusicIn();

            })
            .catch(() => {

                musicStarted = false;

            });

    } else {

        fadeMusicIn();

    }

}


/* =========================================================
   BEGIN CREDIT ROLL
========================================================= */

function beginCredits() {

    if (!opening || !viewport) {
        return;
    }

    opening.classList.remove("active");

    setTimeout(() => {

        viewport.classList.add("active");

        calculateScroll();

        rollStartTime =
            performance.now();

        requestAnimationFrame(
            animateCredits
        );

    }, 1200);

}


/* =========================================================
   CALCULATE SCROLL DISTANCE
========================================================= */

function calculateScroll() {

    if (!creditsRoll) return;

    const viewportHeight =
        window.innerHeight;

    const rollHeight =
        creditsRoll.scrollHeight;

    totalScrollDistance =
        rollHeight +
        viewportHeight * 1.15;

}


/* =========================================================
   CINEMATIC CREDIT SCROLL
========================================================= */

function animateCredits(timestamp) {

    if (finished) return;

    if (!rollStartTime) {

        rollStartTime =
            timestamp;

    }

    const elapsed =
        timestamp -
        rollStartTime;

    /*
       Keep the credits cinematic rather
       than moving at a harsh constant speed.
    */

    const progress =
        Math.min(
            elapsed /
            (
                CONFIG.totalDuration -
                CONFIG.rollStart
            ),
            1
        );

    /*
       Smooth cinematic acceleration/
       deceleration curve.
    */

    const eased =
        progress < 0.5

            ? 2 * progress * progress

            : 1 -
              Math.pow(
                  -2 * progress + 2,
                  2
              ) / 2;


    currentScroll =
        eased *
        totalScrollDistance;


    creditsRoll.style.transform =
        `translate3d(
            0,
            ${-currentScroll}px,
            0
        )`;


    /*
       Finish when the 3-minute
       experience reaches its end.
    */

    if (progress >= 1) {

        finishCredits();

        return;

    }


    animationFrame =
        requestAnimationFrame(
            animateCredits
        );

}


/* =========================================================
   FINISH CREDITS
========================================================= */

function finishCredits() {

    if (finished) return;

    finished = true;

    if (animationFrame) {

        cancelAnimationFrame(
            animationFrame
        );

    }

    fadeMusicOut();

    /*
       Cinematic final fade.
    */

    setTimeout(() => {

        cinema.classList.add(
            "credits-finished"
        );

    }, 250);


    /*
       Optional redirect.
       Disabled by default because the
       final black screen should remain.
    */

    if (CONFIG.redirectAfterFinish) {

        setTimeout(() => {

            window.location.href =
                CONFIG.redirectURL;

        }, CONFIG.finalFadeDuration);

    }

}


/* =========================================================
   SOUND CONTROL
========================================================= */

function updateSoundButton() {

    if (!soundButton) return;

    if (musicMuted) {

        soundButton.textContent =
            "SOUND OFF";

    } else {

        soundButton.textContent =
            "SOUND ON";

    }

}


function toggleSound() {

    if (!music) return;

    musicMuted =
        !musicMuted;

    if (musicMuted) {

        music.volume = 0;

        soundButton.textContent =
            "SOUND OFF";

    } else {

        if (
            !musicStarted
        ) {

            startMusic();

        } else {

            music.volume =
                0.82;

        }

        soundButton.textContent =
            "SOUND ON";

    }

}


/* =========================================================
   USER INTERACTION
========================================================= */

if (soundButton) {

    soundButton.addEventListener(
        "click",
        toggleSound
    );

}


/*
   A click anywhere on the cinema
   starts the music.

   This also solves browser autoplay
   restrictions on mobile/desktop.
*/

function userStartExperience() {

    if (!started) {

        started = true;

        startMusic();

    }

}

document.addEventListener(
    "click",
    userStartExperience,
    {
        once: true
    }
);

document.addEventListener(
    "touchstart",
    userStartExperience,
    {
        once: true,
        passive: true
    }
);


/* =========================================================
   KEYBOARD SUPPORT
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        /*
           Space / Enter:
           start music
        */

        if (
            event.code === "Space" ||
            event.code === "Enter"
        ) {

            if (!started) {

                started = true;

                startMusic();

            }

        }


        /*
           M:
           mute / unmute
        */

        if (
            event.key.toLowerCase() === "m"
        ) {

            toggleSound();

        }

    }
);


/* =========================================================
   RESIZE
========================================================= */

window.addEventListener(
    "resize",
    () => {

        calculateScroll();

    }
);


/* =========================================================
   AUDIO END
========================================================= */

if (music) {

    music.addEventListener(
        "ended",
        () => {

            /*
               Do not immediately end the
               visual credits if the MP3 is
               slightly shorter than 3:00.

               The visual timeline remains
               the master clock.
            */

            musicStarted = false;

        }
    );

}


/* =========================================================
   INITIALIZATION
========================================================= */

function initializeCredits() {

    createParticles();

    calculateScroll();

    updateSoundButton();

}


/* =========================================================
   WAIT FOR PAGE
========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeCredits
    );

} else {

    initializeCredits();

}


/* =========================================================
   AUTOMATIC TIMELINE
========================================================= */

/*
   The credits are designed to begin automatically.

   Audio playback may still require the first user
   interaction because modern browsers can block
   autoplay with sound.

   The visual credit roll does NOT depend on audio.
*/

setTimeout(() => {

    if (!started) {

        started = true;

    }

    startMusic();

}, 800);


/*
   Start the visual sequence after
   the opening title has had time to breathe.
*/

setTimeout(() => {

    beginCredits();

}, CONFIG.rollStart);


/* =========================================================
   SAFETY FALLBACK
========================================================= */

/*
   Guarantees that the page cannot remain
   indefinitely on the credits if a browser
   has unusual animation timing behavior.
*/

setTimeout(() => {

    if (!finished) {

        finishCredits();

    }

}, CONFIG.totalDuration + 4000);


/* =========================================================
   FINAL VISUAL FADE
========================================================= */

const finalStyle =
    document.createElement("style");

finalStyle.textContent = `

    #creditsCinema.credits-finished {
        animation:
            finalCinemaFade
            ${CONFIG.finalFadeDuration}ms
            ease forwards;
    }

    @keyframes finalCinemaFade {

        from {
            opacity: 1;
        }

        to {
            opacity: 0;
        }

    }

`;

document.head.appendChild(
    finalStyle
);
