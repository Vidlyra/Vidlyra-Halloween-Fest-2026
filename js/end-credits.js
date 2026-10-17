
"use strict";

/* =========================================================
   VIDLYRA HALLOWEEN FEST 2026
   SYNCHRONIZED CINEMATIC END CREDITS
========================================================= */

const cinema = document.getElementById("creditsCinema");
const startScreen = document.getElementById("startScreen");
const enterButton = document.getElementById("enterButton");
const viewport = document.getElementById("creditViewport");
const creditRoll = document.getElementById("creditRoll");

const leftImageRoll = document.getElementById("leftImageRoll");
const rightImageRoll = document.getElementById("rightImageRoll");

const music = document.getElementById("creditsMusic");
const soundButton = document.getElementById("soundButton");

const timelineTrack = document.getElementById("timelineTrack");
const timelineProgress = document.getElementById("timelineProgress");
const currentTimeDisplay = document.getElementById("currentTime");
const durationTimeDisplay = document.getElementById("durationTime");
const particles = document.getElementById("particles");

const CONFIG = {
    fallbackDuration: 180,
    imageCount: 15,
    volume: 0.85
};

let started = false;
let finished = false;
let frameId = null;
let trackHeight = 0;
let slotHeight = 0;

/* =========================================================
   AUDIO
========================================================= */

music.preload = "auto";
music.volume = CONFIG.volume;
music.loop = false;

function getDuration() {
    return Number.isFinite(music.duration) && music.duration > 0
        ? music.duration
        : CONFIG.fallbackDuration;
}

function formatTime(seconds) {
    seconds = Math.max(0, Math.floor(seconds || 0));

    const minutes = Math.floor(seconds / 60);
    const remainder = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}

/* =========================================================
   PARTICLES
========================================================= */

function createParticles() {
    if (!particles) return;

    const count = window.innerWidth < 700 ? 28 : 55;
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < count; i++) {
        const particle = document.createElement("span");

        particle.className = "particle";
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.animationDuration = `${8 + Math.random() * 16}s`;
        particle.style.animationDelay = `${-Math.random() * 18}s`;
        particle.style.opacity = String(0.2 + Math.random() * 0.7);

        fragment.appendChild(particle);
    }

    particles.replaceChildren(fragment);
}

/* =========================================================
   PRELOAD ALL 30 FILES
========================================================= */

function preloadVisuals() {
    for (let i = 1; i <= CONFIG.imageCount; i++) {
        const number = String(i).padStart(2, "0");

        for (const side of ["left", "right"]) {
            const image = new Image();
            image.src = `assets/images/credits-${side}-${number}.png`;
        }
    }
}

/* =========================================================
   PREPARE ALL THREE SCROLL TRACKS

   All tracks use the same total vertical distance.
   Each side slot occupies 1/15 of that distance.
========================================================= */

function prepareScrollTracks() {
    const viewportHeight = viewport.clientHeight;

    /*
     * The credit text content determines the total journey.
     * Side tracks are sized to exactly the same journey.
     */
    trackHeight = creditRoll.scrollHeight + viewportHeight;
    slotHeight = trackHeight / CONFIG.imageCount;

    for (const track of [leftImageRoll, rightImageRoll]) {
        track.style.height = `${trackHeight}px`;
        track.style.transform = `translate3d(0, ${viewportHeight}px, 0)`;

        const slots = track.querySelectorAll(".creditSideSlot");

        slots.forEach(slot => {
            slot.style.height = `${slotHeight}px`;
            slot.style.flex = "0 0 auto";
        });
    }

    creditRoll.style.transform =
        `translate3d(0, ${viewportHeight}px, 0)`;
}

/* =========================================================
   MASTER SCROLL POSITION

   Music time controls the shared progress.
========================================================= */

function updateScrollPosition(currentTime) {
    const duration = getDuration();

    const progress = Math.min(
        1,
        Math.max(0, currentTime / duration)
    );

    const viewportHeight = viewport.clientHeight;

    if (!trackHeight || !slotHeight) {
        prepareScrollTracks();
    }

    /*
     * Begin below the screen.
     * End above the screen.
     */
    const y = viewportHeight - trackHeight * progress;

    /*
     * Same Y position for:
     * 1. Center text
     * 2. Left visual track
     * 3. Right visual track
     */
    const transform = `translate3d(0, ${y}px, 0)`;

    creditRoll.style.transform = transform;
    leftImageRoll.style.transform = transform;
    rightImageRoll.style.transform = transform;

    updateTimeline(currentTime);
}

/* =========================================================
   TIMELINE
========================================================= */

function updateTimeline(currentTime) {
    const duration = getDuration();

    const progress = Math.min(
        1,
        Math.max(0, currentTime / duration)
    );

    timelineProgress.style.width = `${progress * 100}%`;

    currentTimeDisplay.textContent = formatTime(currentTime);
    durationTimeDisplay.textContent = formatTime(duration);

    timelineTrack.setAttribute("aria-valuemax", String(Math.round(duration)));
    timelineTrack.setAttribute("aria-valuenow", String(Math.round(currentTime)));
}

/* =========================================================
   SYNCHRONIZED UPDATE
========================================================= */

function updateExperience() {
    if (!started || finished) return;

    const currentTime = music.currentTime;

    updateScrollPosition(currentTime);

    if (music.ended || currentTime >= getDuration()) {
        finishCredits();
    }
}

/* =========================================================
   ANIMATION LOOP

   The animation stops when the audio pauses.
========================================================= */

function animate() {
    frameId = null;

    if (!started || finished || music.paused) return;

    updateExperience();

    if (!finished && !music.paused) {
        frameId = requestAnimationFrame(animate);
    }
}

function startAnimation() {
    if (frameId !== null || music.paused || finished || !started) return;

    frameId = requestAnimationFrame(animate);
}

function stopAnimation() {
    if (frameId !== null) {
        cancelAnimationFrame(frameId);
        frameId = null;
    }
}

/* =========================================================
   ENTER / START
========================================================= */

async function startCredits() {
    if (started) {
        if (music.paused && !finished) {
            try {
                await music.play();
            } catch (error) {
                console.warn("Audio playback could not start:", error);
            }
        }
        return;
    }

    started = true;
    finished = false;
    enterButton.disabled = true;

    music.currentTime = 0;

    cinema.classList.remove("finished");
    viewport.classList.add("active");
    startScreen.classList.add("hidden");

    /*
     * Wait for the browser to apply the visible layout
     * before measuring the scroll tracks.
     */
    requestAnimationFrame(async () => {
        prepareScrollTracks();
        updateScrollPosition(0);

        try {
            await music.play();
            soundButton.textContent = music.muted ? "SOUND OFF" : "SOUND ON";
            startAnimation();
        } catch (error) {
            console.warn("Audio playback could not start:", error);
            soundButton.textContent = music.muted ? "SOUND OFF" : "SOUND READY";
            enterButton.disabled = false;
        }
    });
}

enterButton.addEventListener("click", startCredits);

/* =========================================================
   SOUND ON / OFF
========================================================= */

soundButton.addEventListener("click", async () => {
    if (!started) {
        await startCredits();
        return;
    }

    music.muted = !music.muted;

    soundButton.textContent = music.muted ? "SOUND OFF" : "SOUND ON";

    /*
     * Muting does not pause the music clock or the animation.
     * Use Space to pause and resume the entire sequence.
     */
});

/* =========================================================
   PLAY / PAUSE EVENTS
========================================================= */

music.addEventListener("play", () => {
    if (!started || finished) return;

    soundButton.textContent = music.muted ? "SOUND OFF" : "SOUND ON";
    startAnimation();
});

music.addEventListener("pause", () => {
    stopAnimation();

    if (started && !finished) {
        updateScrollPosition(music.currentTime);
    }
});

music.addEventListener("ended", finishCredits);

/* =========================================================
   TIMELINE SEEK
========================================================= */

function seekTo(clientX) {
    if (!started || !timelineTrack) return;

    const rect = timelineTrack.getBoundingClientRect();
    if (!rect.width) return;

    const fraction = Math.max(
        0,
        Math.min(1, (clientX - rect.left) / rect.width)
    );

    music.currentTime = fraction * getDuration();

    /*
     * Immediately reposition every track to the same
     * music timestamp, including when paused.
     */
    updateScrollPosition(music.currentTime);

    if (!music.paused) startAnimation();
}

timelineTrack.addEventListener("click", event => {
    seekTo(event.clientX);
});

timelineTrack.addEventListener("keydown", event => {
    if (!started) return;

    let targetTime = music.currentTime;
    const duration = getDuration();

    switch (event.key) {
        case "ArrowRight":
            targetTime += 5;
            break;
        case "ArrowLeft":
            targetTime -= 5;
            break;
        case "Home":
            targetTime = 0;
            break;
        case "End":
            targetTime = duration;
            break;
        default:
            return;
    }

    event.preventDefault();

    music.currentTime = Math.max(0, Math.min(duration, targetTime));
    updateScrollPosition(music.currentTime);
});

/* =========================================================
   AUDIO TIME / METADATA
========================================================= */

music.addEventListener("timeupdate", () => {
    if (started && !finished) {
        updateScrollPosition(music.currentTime);
    }
});

music.addEventListener("loadedmetadata", () => {
    updateTimeline(music.currentTime || 0);

    if (started && !finished) {
        prepareScrollTracks();
        updateScrollPosition(music.currentTime || 0);
    }
});

music.addEventListener("durationchange", () => {
    updateTimeline(music.currentTime || 0);
});

/* =========================================================
   FINISH
========================================================= */

/* =========================================================
   FINISH CREDITS — CINEMATIC FADE OUT + MAP REDIRECT
========================================================= */

function finishCredits() {
    if (finished) return;

    finished = true;

    // Stop the animation loop.
    stopAnimation();

    // Move all credit tracks to their final position.
    const duration = getDuration();

    updateScrollPosition(duration);
    updateTimeline(duration);

    // Stop the background music.
    music.pause();

    // Trigger the cinematic fade-out CSS animation.
    cinema.classList.add("finished");

    // Redirect to the festival map after the fade completes.
    const FADE_DURATION = 2200;

    setTimeout(() => {
        window.location.replace("map.html");
    }, FADE_DURATION);
}

/* =========================================================
   SPACE = PAUSE / RESUME
   M = MUTE / UNMUTE
========================================================= */

document.addEventListener("keydown", async event => {
    const target = event.target;

    if (
        target instanceof HTMLButtonElement ||
        target instanceof HTMLInputElement
    ) {
        return;
    }

    if (event.code === "Space" && started && !finished) {
        event.preventDefault();

        if (music.paused) {
            try {
                await music.play();
            } catch (error) {
                console.warn("Unable to resume audio:", error);
            }
        } else {
            music.pause();
        }
    }

    if (event.key.toLowerCase() === "m" && started) {
        music.muted = !music.muted;
        soundButton.textContent = music.muted ? "SOUND OFF" : "SOUND ON";
    }
});

/* =========================================================
   RESIZE
========================================================= */

window.addEventListener("resize", () => {
    if (!started || finished) return;

    prepareScrollTracks();
    updateScrollPosition(music.currentTime);
});

/* =========================================================
   TAB VISIBILITY
========================================================= */

document.addEventListener("visibilitychange", () => {
    if (!started || finished) return;

    if (document.visibilityState === "visible") {
        prepareScrollTracks();
        updateScrollPosition(music.currentTime);

        if (!music.paused) startAnimation();
    }
});

/* =========================================================
   INITIALIZATION
========================================================= */

createParticles();
preloadVisuals();
updateTimeline(0);

/*
 * Expose simple controls for testing in the browser console.
 */
window.VidlyraCredits = {
    play: () => music.play(),
    pause: () => music.pause(),
    seek: seconds => {
        music.currentTime = Math.max(0, Math.min(getDuration(), seconds));
        updateScrollPosition(music.currentTime);
    },
    mute: () => {
        music.muted = true;
        soundButton.textContent = "SOUND OFF";
    },
    unmute: () => {
        music.muted = false;
        soundButton.textContent = "SOUND ON";
    }
};
