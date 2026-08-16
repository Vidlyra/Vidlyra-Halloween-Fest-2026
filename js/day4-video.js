import { supabase } from "./supabase.js";

"use strict";


const startScreen =
    document.getElementById("startScreen");

const startBtn =
    document.getElementById("startBtn");

const introVideo =
    document.getElementById("introVideo");

const skipBtn =
    document.getElementById("skipBtn");

const videoOverlay =
    document.getElementById("videoOverlay");

const enterGame =
    document.getElementById("enterGame");

const bgMusic =
    document.getElementById("bgMusic");

const thunderSound =
    document.getElementById("thunderSound");

const witchLaugh =
    document.getElementById("witchLaugh");

const lightning =
    document.getElementById("lightning");

const fogLayer =
    document.getElementById("fogLayer");

const magicParticles =
    document.getElementById("magicParticles");


let user = null;
let started = false;


/* ==========================================
CHECK LOGIN + DAY 3
========================================== */

async function checkAccess() {

    const {
        data: {
            user: currentUser
        },
        error
    } = await supabase.auth.getUser();


    if (error || !currentUser) {

        window.location.href =
            "login.html";

        return false;

    }


    user = currentUser;


    const {
        data,
        error: progressError
    } = await supabase
        .from("festival_progress")
        .select("day3, day4")
        .eq(
            "user_id",
            user.id
        )
        .eq(
            "festival",
            "halloween_2026"
        )
        .maybeSingle();


    if (progressError) {

        console.error(
            progressError
        );

        alert(
            "Unable to load festival progress."
        );

        return false;

    }


    if (!data || data.day3 !== true) {

        alert(
            "🔒 Complete Day 3 before entering Day 4."
        );

        window.location.href =
            "map.html";

        return false;

    }


    return true;

}


/* ==========================================
START EXPERIENCE
========================================== */

async function startExperience() {

    if (started) {

        return;

    }


    started = true;


    startScreen.classList.add(
        "hide"
    );


    try {

        await introVideo.play();

        skipBtn.classList.add(
            "show"
        );

    }

    catch (error) {

        console.log(
            "Video playback requires interaction."
        );

        started = false;

    }


    playAtmosphere();

}


/* ==========================================
ATMOSPHERE
========================================== */

function playAtmosphere() {

    if (bgMusic) {

        bgMusic.volume = 0.25;

        bgMusic
            .play()
            .catch(() => {});

    }

}


/* ==========================================
VIDEO END
========================================== */

function showEnding() {

    introVideo.pause();


    skipBtn.classList.remove(
        "show"
    );


    videoOverlay.classList.add(
        "show"
    );


    playMagicEffects();

}


/* ==========================================
SKIP
========================================== */

skipBtn.addEventListener(
    "click",
    () => {

        showEnding();

    }
);


/* ==========================================
VIDEO ENDED
========================================== */

introVideo.addEventListener(
    "ended",
    () => {

        showEnding();

    }
);


/* ==========================================
ENTER GAME
========================================== */

enterGame.addEventListener(
    "click",
    () => {

        if (witchLaugh) {

            witchLaugh.currentTime = 0;

            witchLaugh
                .play()
                .catch(() => {});

        }


        window.location.href =
            "day4-game.html";

    }
);


/* ==========================================
MAGIC EFFECTS
========================================== */

function playMagicEffects() {

    if (fogLayer) {

        fogLayer.classList.add(
            "active"
        );

    }


    if (magicParticles) {

        magicParticles.classList.add(
            "active"
        );

    }


    setTimeout(
        () => {

            if (lightning) {

                lightning.classList.add(
                    "active"
                );

            }


            if (thunderSound) {

                thunderSound.currentTime = 0;

                thunderSound
                    .play()
                    .catch(() => {});

            }

        },
        1000
    );

}


/* ==========================================
INITIALIZE
========================================== */

async function initialize() {

    const allowed =
        await checkAccess();


    if (!allowed) {

        return;

    }


    console.log(
        "🧙 Day 4 unlocked."
    );

}


startBtn.addEventListener(
    "click",
    startExperience
);


initialize();
