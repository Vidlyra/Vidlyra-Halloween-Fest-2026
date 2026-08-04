/* =========================================================
   VIDLYRA HALLOWEEN FEST 2026
   OFFICIAL CINEMATIC END CREDITS
   MASTER CLOCK = assets/credits.mp3
========================================================= */

"use strict";


/* =========================================================
   ELEMENTS
========================================================= */

const cinema =
    document.getElementById("creditsCinema");

const startScreen =
    document.getElementById("startScreen");

const enterButton =
    document.getElementById("enterButton");

const viewport =
    document.getElementById("creditViewport");

const creditRoll =
    document.getElementById("creditRoll");

const music =
    document.getElementById("creditsMusic");

const soundButton =
    document.getElementById("soundButton");

const particles =
    document.getElementById("particles");

const timelineProgress =
    document.getElementById("timelineProgress");

const currentTimeDisplay =
    document.getElementById("currentTime");


/* =========================================================
   CONFIGURATION
========================================================= */

const CONFIG = {

    /*
       Your music structure ends at approximately 3:00.
       The actual audio position remains the master clock.
    */

    duration: 180,

    /*
       These values determine the cinematic credit-roll
       speed across the complete 3-minute experience.
    */

    rollStart: 0,

    rollEnd: 180,

    /*
       Extra space before the first real credit.
    */

    openingOffset: 0
};


/* =========================================================
   STATE
========================================================= */

let started = false;
let finished = false;

let animationFrame = null;

let lastAudioTime = 0;

let rollDistance = 0;


/* =========================================================
   AUDIO SETTINGS
========================================================= */

music.volume = 0.85;

music.preload = "auto";

music.loop = false;


/* =========================================================
   PARTICLES
========================================================= */

function createParticles() {

    if (!particles) return;

    const count =
        window.innerWidth < 700
            ? 28
            : 55;

    const fragment =
        document.createDocumentFragment();

    for (let i = 0; i < count; i++) {

        const particle =
            document.createElement("span");

        particle.className =
            "particle";

        particle.style.left =
            Math.random() * 100 + "%";

        particle.style.animationDuration =
            (8 + Math.random() * 16) + "s";

        particle.style.animationDelay =
            (-Math.random() * 18) + "s";

        particle.style.opacity =
            (0.2 + Math.random() * 0.7).toFixed(2);

        particle.style.transform =
            `scale(${0.5 + Math.random() * 1.5})`;

        fragment.appendChild(particle);
    }

    particles.appendChild(fragment);
}


/* =========================================================
   FORMAT TIME
========================================================= */

function formatTime(seconds) {

    seconds =
        Math.max(
            0,
            Math.floor(seconds || 0)
        );

    const minutes =
        Math.floor(seconds / 60);

    const secs =
        seconds % 60;

    return (
        String(minutes).padStart(2, "0") +
        ":" +
        String(secs).padStart(2, "0")
    );
}


/* =========================================================
   CALCULATE ROLL DISTANCE
========================================================= */

function calculateRollDistance() {

    if (!creditRoll) return;

    const viewportHeight =
        window.innerHeight;

    const rollHeight =
        creditRoll.scrollHeight;

    /*
       Start with the first credit below the screen
       and finish after the complete credit sequence.
    */

    rollDistance =
        rollHeight +
        viewportHeight;

    creditRoll.style.transform =
        "translate3d(0, 0, 0)";
}


/* =========================================================
   START EXPERIENCE
========================================================= */

async function startCredits() {

    if (started) return;

    started = true;

    enterButton.disabled = true;

    /*
       Reset everything before playback.
    */

    music.currentTime = 0;

    finished = false;

    cinema.classList.remove("finished");

    creditRoll.style.transform =
        "translate3d(0, 0, 0)";

    /*
       Show the credit viewport immediately.
    */

    viewport.classList.add("active");

    /*
       Fade away the start screen.
    */

    startScreen.classList.add("hidden");

    /*
       Browser autoplay policy allows audio because
       this function is triggered directly by the click.
    */

    try {

        await music.play();

        soundButton.textContent =
            "SOUND ON";

    } catch (error) {

        console.warn(
            "Audio could not start:",
            error
        );

        soundButton.textContent =
            "SOUND OFF";
    }

    /*
       Start the visual clock.
    */

    lastAudioTime =
        music.currentTime;

    animationFrame =
        requestAnimationFrame(
            animationLoop
        );
}


/* =========================================================
   ENTER BUTTON
========================================================= */

enterButton.addEventListener(
    "click",
    startCredits
);


/* =========================================================
   MASTER ANIMATION LOOP
========================================================= */

function animationLoop() {

    if (!started) return;

    const current =
        music.currentTime;

    /*
       Audio is the authority.
       Never use setTimeout for the credit timing.
    */

    updateTimeline(current);

    updateCreditRoll(current);

    /*
       Detect completion through audio itself.
    */

    if (
        !music.paused &&
        music.ended
    ) {

        finishCredits();

        return;
    }

    /*
       Safety fallback for files that are slightly shorter
       or longer than exactly 180 seconds.
    */

    if (
        current >= CONFIG.duration &&
        !music.paused
    ) {

        finishCredits();

        return;
    }

    lastAudioTime =
        current;

    animationFrame =
        requestAnimationFrame(
            animationLoop
        );
}


/* =========================================================
   UPDATE TIMELINE
========================================================= */

function updateTimeline(current) {

    const duration =
        music.duration &&
        Number.isFinite(music.duration)
            ? music.duration
            : CONFIG.duration;

    const progress =
        Math.min(
            1,
            Math.max(
                0,
                current / duration
            )
        );

    if (timelineProgress) {

        timelineProgress.style.width =
            `${progress * 100}%`;
    }

    if (currentTimeDisplay) {

        currentTimeDisplay.textContent =
            formatTime(current);
    }
}


/* =========================================================
   CREDIT ROLL
========================================================= */

function updateCreditRoll(current) {

    if (!creditRoll) return;

    const duration =
        music.duration &&
        Number.isFinite(music.duration)
            ? music.duration
            : CONFIG.duration;

    /*
       Normalize the actual audio time.
    */

    const progress =
        Math.min(
            1,
            Math.max(
                0,
                current / duration
            )
        );

    /*
       Move the entire credit roll continuously.
       At 0 seconds it begins below the viewport.
       At the end it has completely passed the screen.
    */

    const viewportHeight =
        window.innerHeight;

    const totalDistance =
        creditRoll.scrollHeight +
        viewportHeight;

    const y =
        viewportHeight -
        totalDistance * progress;

    creditRoll.style.transform =
        `translate3d(0, ${y}px, 0)`;
}


/* =========================================================
   SOUND BUTTON
========================================================= */

soundButton.addEventListener(
    "click",
    async () => {

        if (!started) return;

        if (music.muted) {

            music.muted = false;

            soundButton.textContent =
                "SOUND ON";

            /*
               If the music was paused by the browser,
               resume it.
            */

            if (music.paused) {

                try {
                    await music.play();
                } catch (error) {
                    console.warn(error);
                }
            }

        } else {

            music.muted = true;

            soundButton.textContent =
                "SOUND OFF";
        }
    }
);


/* =========================================================
   AUDIO PAUSE / RESUME
========================================================= */

music.addEventListener(
    "play",
    () => {

        if (!started) return;

        if (!animationFrame) {

            animationFrame =
                requestAnimationFrame(
                    animationLoop
                );
        }
    }
);


music.addEventListener(
    "pause",
    () => {

        /*
           Do not reset the credits.

           Because the visual position is calculated from
           music.currentTime, the credits naturally freeze
           exactly where the music stops.
        */

        if (animationFrame) {

            cancelAnimationFrame(
                animationFrame
            );

            animationFrame = null;
        }
    }
);


/* =========================================================
   AUDIO SEEK SUPPORT
========================================================= */

music.addEventListener(
    "timeupdate",
    () => {

        if (!started) return;

        updateTimeline(
            music.currentTime
        );

        updateCreditRoll(
            music.currentTime
        );
    }
);


/* =========================================================
   AUDIO METADATA
========================================================= */

music.addEventListener(
    "loadedmetadata",
    () => {

        /*
           Use the real audio duration whenever available.
        */

        if (
            Number.isFinite(music.duration) &&
            music.duration > 0
        ) {

            CONFIG.duration =
                music.duration;
        }

        calculateRollDistance();
    }
);


/* =========================================================
   FINISH
========================================================= */

function finishCredits() {

    if (finished) return;

    finished = true;

    if (animationFrame) {

        cancelAnimationFrame(
            animationFrame
        );

        animationFrame = null;
    }

    /*
       Force the timeline to its final position.
    */

    updateTimeline(
        music.duration || CONFIG.duration
    );

    updateCreditRoll(
        music.duration || CONFIG.duration
    );

    /*
       Let the final card remain visible briefly,
       then perform the cinematic fade.
    */

    setTimeout(() => {

        cinema.classList.add("finished");

    }, 800);
}


/* =========================================================
   RESIZE
========================================================= */

let resizeTimer = null;

window.addEventListener(
    "resize",
    () => {

        clearTimeout(resizeTimer);

        resizeTimer =
            setTimeout(() => {

                calculateRollDistance();

                if (started) {

                    updateCreditRoll(
                        music.currentTime
                    );
                }

            }, 150);

    }
);


/* =========================================================
   PREVENT ACCIDENTAL PAGE SCROLL
========================================================= */

document.addEventListener(
    "wheel",
    event => {

        event.preventDefault();

    },
    {
        passive: false
    }
);


/* =========================================================
   KEYBOARD CONTROL
========================================================= */

document.addEventListener(
    "keydown",
    async event => {

        /*
           Space = pause/resume
        */

        if (
            event.code === "Space" &&
            started
        ) {

            event.preventDefault();

            if (music.paused) {

                try {
                    await music.play();
                } catch (error) {
                    console.warn(error);
                }

            } else {

                music.pause();
            }
        }

        /*
           M = mute
        */

        if (
            event.key.toLowerCase() === "m" &&
            started
        ) {

            music.muted =
                !music.muted;

            soundButton.textContent =
                music.muted
                    ? "SOUND OFF"
                    : "SOUND ON";
        }
    }
);


/* =========================================================
   INITIALIZATION
========================================================= */

createParticles();

calculateRollDistance();

updateTimeline(0);

updateCreditRoll(0);


/* =========================================================
   PAGE VISIBILITY
========================================================= */

document.addEventListener(
    "visibilitychange",
    () => {

        if (!started) return;

        /*
           We deliberately do not create another timer.

           Audio remains the source of truth.
        */

        if (
            document.visibilityState ===
            "visible"
        ) {

            updateTimeline(
                music.currentTime
            );

            updateCreditRoll(
                music.currentTime
            );
        }
    }
);


/* =========================================================
   DEBUG HELPER
   Remove this section later if desired.
========================================================= */

window.VidlyraCredits = {

    getTime() {
        return music.currentTime;
    },

    getDuration() {
        return music.duration;
    },

    pause() {
        music.pause();
    },

    play() {
        return music.play();
    },

    mute() {
        music.muted = true;
    },

    unmute() {
        music.muted = false;
    }
};
