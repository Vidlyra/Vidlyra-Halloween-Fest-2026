/* =========================================================
   VIDLYRA HALLOWEEN FEST 2026
   HOME — CINEMATIC WORLD CONTROLLER

   Handles:
   • Atmosphere particles
   • Bats
   • Lightning
   • Ambient audio
   • Story panel
   • Mobile menu
   • Navigation
   • Smooth page transitions
   • Keyboard controls
   • Responsive behavior
========================================================= */

"use strict";


/* =========================================================
   DOM
========================================================= */

const $ = (selector, parent = document) =>
    parent.querySelector(selector);

const $$ = (selector, parent = document) =>
    [...parent.querySelectorAll(selector)];


/* =========================================================
   ELEMENTS
========================================================= */

const homePage =
    $("#homePage");

const lightning =
    $(".lightning");

const particles =
    $(".particles");

const bats =
    $(".bats");

const storyPanel =
    $(".sidePanel");

const mobileMenu =
    $(".mobileMenu");

const menuButton =
    $(".menuButton");

const closePanel =
    $(".closePanel");

const soundButton =
    $(".soundStatus button");

const transition =
    $(".transition");

const ambient =
    $("#ambient");


/* =========================================================
   CONFIGURATION
========================================================= */

const CONFIG = {

    particleCount: 42,

    batCount: 8,

    lightningMinDelay: 6500,

    lightningMaxDelay: 15000,

    transitionDelay: 650,

    ambientVolume: 0.28,

    audioFadeDuration: 1200

};


/* =========================================================
   STATE
========================================================= */

const state = {

    audioEnabled: false,

    transitioning: false,

    panelOpen: false,

    menuOpen: false

};


/* =========================================================
   RANDOM
========================================================= */

function random(min, max) {

    return Math.random() *
        (max - min) + min;

}


/* =========================================================
   CREATE PARTICLES
========================================================= */

function createParticles() {

    if (!particles) return;

    const fragment =
        document.createDocumentFragment();

    for (
        let i = 0;
        i < CONFIG.particleCount;
        i++
    ) {

        const particle =
            document.createElement("span");

        particle.className =
            "particle";

        particle.style.left =
            `${random(0, 100)}%`;

        particle.style.animationDuration =
            `${random(10, 24)}s`;

        particle.style.animationDelay =
            `${random(-20, 0)}s`;

        const size =
            random(1, 3);

        particle.style.width =
            `${size}px`;

        particle.style.height =
            `${size}px`;

        fragment.appendChild(
            particle
        );

    }

    particles.appendChild(
        fragment
    );

}


/* =========================================================
   CREATE BATS
========================================================= */

function createBats() {

    if (!bats) return;

    const fragment =
        document.createDocumentFragment();

    for (
        let i = 0;
        i < CONFIG.batCount;
        i++
    ) {

        const bat =
            document.createElement("span");

        bat.className =
            "bat";

        bat.style.top =
            `${random(7, 43)}%`;

        bat.style.left =
            `${random(-10, 90)}%`;

        bat.style.animationDuration =
            `${random(15, 28)}s`;

        bat.style.animationDelay =
            `${random(-25, 0)}s`;

        const scale =
            random(.55, 1.1);

        bat.style.transform =
            `scale(${scale})`;

        fragment.appendChild(
            bat
        );

    }

    bats.appendChild(
        fragment
    );

}


/* =========================================================
   LIGHTNING
========================================================= */

let lightningTimer = null;


function triggerLightning() {

    if (!lightning) return;

    lightning.classList.remove(
        "flash"
    );

    /*
       Force browser to restart
       animation.
    */
    void lightning.offsetWidth;

    lightning.classList.add(
        "flash"
    );

    /*
       Occasional double flash.
    */

    if (Math.random() < .28) {

        setTimeout(() => {

            lightning.classList.remove(
                "flash"
            );

            void lightning.offsetWidth;

            lightning.classList.add(
                "flash"
            );

        }, 170);

    }

    scheduleLightning();

}


function scheduleLightning() {

    clearTimeout(
        lightningTimer
    );

    const delay =
        random(
            CONFIG.lightningMinDelay,
            CONFIG.lightningMaxDelay
        );

    lightningTimer =
        setTimeout(
            triggerLightning,
            delay
        );

}


/* =========================================================
   AUDIO
========================================================= */

function setAudioIcon() {

    if (!soundButton) return;

    const icon =
        $(".soundIcon", soundButton);

    const text =
        $(".soundText", soundButton);

    if (icon) {

        icon.textContent =
            state.audioEnabled
                ? "🔊"
                : "🔇";

    }

    if (text) {

        text.textContent =
            state.audioEnabled
                ? "SOUND ON"
                : "SOUND OFF";

    }

}


function fadeAudio(
    targetVolume,
    duration = CONFIG.audioFadeDuration
) {

    if (!ambient) return;

    const start =
        ambient.volume;

    const difference =
        targetVolume - start;

    const startTime =
        performance.now();


    function update(now) {

        const elapsed =
            now - startTime;

        const progress =
            Math.min(
                elapsed / duration,
                1
            );

        const eased =
            1 -
            Math.pow(
                1 - progress,
                3
            );

        ambient.volume =
            start +
            difference * eased;

        if (progress < 1) {

            requestAnimationFrame(
                update
            );

        }

    }

    requestAnimationFrame(
        update
    );

}


async function enableAudio() {

    if (!ambient) return;

    try {

        ambient.volume = 0;

        await ambient.play();

        state.audioEnabled = true;

        fadeAudio(
            CONFIG.ambientVolume
        );

        setAudioIcon();

    } catch (error) {

        /*
           Browser autoplay policies may
           block audio until user interaction.
        */

        state.audioEnabled = false;

        setAudioIcon();

    }

}


function disableAudio() {

    if (!ambient) return;

    fadeAudio(
        0,
        500
    );

    setTimeout(() => {

        ambient.pause();

        state.audioEnabled = false;

        setAudioIcon();

    }, 520);

}


function toggleAudio() {

    if (state.audioEnabled) {

        disableAudio();

    } else {

        enableAudio();

    }

}


/* =========================================================
   STORY PANEL
========================================================= */

function openStory() {

    if (!storyPanel) return;

    state.panelOpen = true;

    storyPanel.classList.add(
        "open"
    );

    document.body.classList.add(
        "panel-open"
    );

}


function closeStory() {

    if (!storyPanel) return;

    state.panelOpen = false;

    storyPanel.classList.remove(
        "open"
    );

    document.body.classList.remove(
        "panel-open"
    );

}


/* =========================================================
   MOBILE MENU
========================================================= */

function openMobileMenu() {

    if (!mobileMenu) return;

    state.menuOpen = true;

    mobileMenu.classList.add(
        "open"
    );

    menuButton?.setAttribute(
        "aria-expanded",
        "true"
    );

}


function closeMobileMenu() {

    if (!mobileMenu) return;

    state.menuOpen = false;

    mobileMenu.classList.remove(
        "open"
    );

    menuButton?.setAttribute(
        "aria-expanded",
        "false"
    );

}


function toggleMobileMenu() {

    if (state.menuOpen) {

        closeMobileMenu();

    } else {

        openMobileMenu();

    }

}


/* =========================================================
   PAGE TRANSITION
========================================================= */

function goToPage(url) {

    if (!url) return;

    if (state.transitioning) return;

    state.transitioning = true;

    closeMobileMenu();

    closeStory();

    if (transition) {

        transition.classList.add(
            "active"
        );

    }

    /*
       Give the cinematic transition
       time to appear before navigation.
    */

    setTimeout(() => {

        window.location.href =
            url;

    }, CONFIG.transitionDelay);

}


/* =========================================================
   NAVIGATION HELPERS
========================================================= */

function bindNavigation(
    selector
) {

    $$(selector).forEach(
        element => {

            element.addEventListener(
                "click",
                () => {

                    const url =
                        element.dataset.url;

                    if (url) {

                        goToPage(url);

                    }

                }
            );

        }
    );

}


/* =========================================================
   ENTER BUTTON
========================================================= */

const enterButton =
    $(".enterButton");

if (enterButton) {

    enterButton.addEventListener(
        "click",
        () => {

            /*
               Start music because the user
               has now interacted with page.
            */

            if (!state.audioEnabled) {

                enableAudio();

            }

            const target =
                enterButton.dataset.url ||
                "map.html";

            goToPage(target);

        }
    );

}


/* =========================================================
   STORY BUTTON
========================================================= */

const storyButton =
    $(".storyButton");

if (storyButton) {

    storyButton.addEventListener(
        "click",
        () => {

            openStory();

        }
    );

}


/* =========================================================
   CLOSE STORY
========================================================= */

if (closePanel) {

    closePanel.addEventListener(
        "click",
        closeStory
    );

}


/* =========================================================
   MENU
========================================================= */

if (menuButton) {

    menuButton.addEventListener(
        "click",
        toggleMobileMenu
    );

}


/* =========================================================
   MOBILE MENU LINKS
========================================================= */

$$(
    ".mobileMenu button"
).forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                const action =
                    button.dataset.action;

                if (action === "story") {

                    closeMobileMenu();

                    openStory();

                    return;

                }

                const url =
                    button.dataset.url;

                if (url) {

                    goToPage(url);

                }

            }
        );

    }
);


/* =========================================================
   SOUND
========================================================= */

if (soundButton) {

    soundButton.addEventListener(
        "click",
        toggleAudio
    );

}


/* =========================================================
   FIRST USER INTERACTION
========================================================= */

document.addEventListener(
    "pointerdown",
    () => {

        /*
           Do not automatically force audio.
           Only prepare the browser after interaction.
        */

        if (
            !state.audioEnabled &&
            ambient &&
            ambient.paused
        ) {

            /*
               Audio remains OFF until the
               user explicitly enables it.
            */

        }

    },
    {
        once: true,
        passive: true
    }
);


/* =========================================================
   KEYBOARD
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        switch (
            event.key.toLowerCase()
        ) {

            case "escape":

                if (state.panelOpen) {

                    closeStory();

                }

                if (state.menuOpen) {

                    closeMobileMenu();

                }

                break;


            case "m":

                toggleAudio();

                break;


            case "enter":

                if (
                    document.activeElement ===
                    enterButton
                ) {

                    enterButton.click();

                }

                break;

        }

    }
);


/* =========================================================
   CLICK OUTSIDE STORY PANEL
========================================================= */

document.addEventListener(
    "click",
    event => {

        if (!state.panelOpen) return;

        if (
            storyPanel &&
            storyPanel.contains(event.target)
        ) {

            return;

        }

        if (
            storyButton &&
            storyButton.contains(event.target)
        ) {

            return;

        }

        closeStory();

    }
);


/* =========================================================
   RESPONSIVE CLEANUP
========================================================= */

window.addEventListener(
    "resize",
    () => {

        /*
           Close mobile navigation when
           returning to desktop.
        */

        if (
            window.innerWidth > 760 &&
            state.menuOpen
        ) {

            closeMobileMenu();

        }

    },
    {
        passive: true
    }
);


/* =========================================================
   VISIBILITY
========================================================= */

document.addEventListener(
    "visibilitychange",
    () => {

        if (!ambient) return;

        if (
            document.hidden
        ) {

            if (
                state.audioEnabled
            ) {

                ambient.pause();

            }

        } else {

            if (
                state.audioEnabled
            ) {

                ambient.play()
                    .catch(() => {});

            }

        }

    }
);


/* =========================================================
   INITIALIZATION
========================================================= */

function initializeHome() {

    createParticles();

    createBats();

    scheduleLightning();

    setAudioIcon();

    bindNavigation(
        "[data-url]"
    );

    /*
       Small entrance class.
    */

    if (homePage) {

        requestAnimationFrame(
            () => {

                homePage.classList.add(
                    "loaded"
                );

            }
        );

    }

}


/* =========================================================
   START
========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeHome
    );

} else {

    initializeHome();

}


/* =========================================================
   PUBLIC DEBUG API
   Useful during development.
========================================================= */

window.VidlyraHome = {

    lightning:
        triggerLightning,

    openStory,

    closeStory,

    enableAudio,

    disableAudio,

    goToPage

};
