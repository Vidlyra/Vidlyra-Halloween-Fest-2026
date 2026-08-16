import { supabase } from "./supabase.js";


/* ==========================================
   ELEMENTS
========================================== */

const video =
    document.getElementById("introVideo");

const skipBtn =
    document.getElementById("skipBtn");

const overlay =
    document.getElementById("videoOverlay");

const enterForest =
    document.getElementById("enterForest");

const clickSound =
    document.getElementById("clickSound");


let currentUser = null;
let started = false;


/* ==========================================
   GET LOGIN USER
========================================== */

async function getUser() {

    const {
        data: {
            user
        },
        error
    } = await supabase.auth.getUser();


    if (error || !user) {

        window.location.href =
            "login.html";

        return null;
    }


    return user;
}


/* ==========================================
   CHECK DAY 3 ACCESS
========================================== */

async function checkDay3Access() {

    currentUser =
        await getUser();


    if (!currentUser) {

        return false;

    }


    const {
        data,
        error
    } = await supabase
        .from("festival_progress")
        .select(`
            day1,
            day2,
            day3
        `)
        .eq(
            "user_id",
            currentUser.id
        )
        .eq(
            "festival",
            "halloween_2026"
        )
        .maybeSingle();


    if (error) {

        console.error(
            "Festival progress error:",
            error
        );

        alert(
            "Unable to load festival progress."
        );

        window.location.href =
            "map.html";

        return false;
    }


    if (!data) {

        window.location.href =
            "map.html";

        return false;
    }


    /*
     * Day 2 must be complete.
     */

    if (data.day2 !== true) {

        alert(
            "🔒 Complete Day 2 before entering Day 3."
        );

        window.location.href =
            "map.html";

        return false;
    }


    return true;
}


/* ==========================================
   START VIDEO
========================================== */

async function startVideo() {

    if (started) {

        return;

    }


    started = true;


    try {

        await video.play();

        skipBtn.classList.add(
            "show"
        );

    }

    catch (error) {

        console.log(
            "Video autoplay blocked:",
            error
        );

        started = false;

    }

}


/* ==========================================
   VIDEO FINISHED
========================================== */

function showOverlay() {

    video.pause();


    skipBtn.classList.remove(
        "show"
    );


    overlay.classList.add(
        "show"
    );

}


/* ==========================================
   SKIP
========================================== */

skipBtn.addEventListener(
    "click",
    () => {

        showOverlay();

    }
);


/* ==========================================
   VIDEO END
========================================== */

video.addEventListener(
    "ended",
    () => {

        showOverlay();

    }
);


/* ==========================================
   ENTER FOREST
========================================== */

enterForest.addEventListener(
    "click",
    () => {

        if (clickSound) {

            clickSound.currentTime =
                0;

            clickSound
                .play()
                .catch(() => {});

        }


        /*
         * Day 3 gameplay page.
         */

        window.location.href =
            "day3-game.html";

    }
);


/* ==========================================
   INITIALIZE
========================================== */

async function initialize() {

    const allowed =
        await checkDay3Access();


    if (!allowed) {

        return;

    }


    /*
     * User has Day 2 complete.
     */

    console.log(
        "🌲 Day 3 unlocked."
    );


    /*
     * Start video.
     *
     * Browser may require user interaction.
     */

    startVideo();

}


/* ==========================================
   START
========================================== */

initialize();
