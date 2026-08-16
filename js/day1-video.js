import { supabase } from "./supabase.js";

const video = document.getElementById("day1Video");
const loading = document.getElementById("loading");
const endOverlay = document.getElementById("endOverlay");
const videoError = document.getElementById("videoError");
const loadingText = document.getElementById("loadingText");

let user = null;
let completed = false;


/* ================================
   CHECK LOGIN
================================ */

async function checkUser() {

    const {
        data: {
            user: currentUser
        }
    } = await supabase.auth.getUser();

    if (!currentUser) {
        window.location.href = "login.html";
        return false;
    }

    user = currentUser;

    return true;
}


/* ================================
   CHECK EXISTING PROGRESS
================================ */

async function checkProgress() {

    const {
        data,
        error
    } = await supabase
        .from("festival_progress")
        .select("day1")
        .eq("user_id", user.id)
        .eq("festival", "halloween_2026")
        .maybeSingle();

    if (error) {

        console.error(error);

        loadingText.textContent =
            "COULD NOT LOAD FESTIVAL PROGRESS";

        return false;
    }

    /*
     * Already completed.
     */

    if (data?.day1 === true) {

        loadingText.textContent =
            "DAY 1 ALREADY COMPLETE";

        setTimeout(() => {

            window.location.href =
                "map.html";

        }, 900);

        return false;
    }

    return true;
}


/* ================================
   COMPLETE DAY 1
================================ */

async function completeDay1() {

    if (completed) {
        return;
    }

    completed = true;

    loadingText.textContent =
        "SAVING FESTIVAL PROGRESS...";


    const {
        error
    } = await supabase
        .from("festival_progress")
        .update({
            day1: true
        })
        .eq("user_id", user.id)
        .eq("festival", "halloween_2026");


    if (error) {

        console.error(error);

        loadingText.textContent =
            "COULD NOT SAVE PROGRESS";

        return;
    }


    /*
     * Show ending screen.
     */

    endOverlay.classList.add("show");


    /*
     * Give the animation time to play.
     */

    setTimeout(() => {

        window.location.href =
            "map.html";

    }, 2500);
}


/* ================================
   VIDEO EVENTS
================================ */

video.addEventListener(
    "loadeddata",
    () => {

        loading.classList.add("hidden");

    }
);


video.addEventListener(
    "ended",
    () => {

        completeDay1();

    }
);


video.addEventListener(
    "error",
    () => {

        loading.classList.add("hidden");

        videoError.classList.add("show");

    }
);


/* ================================
   START
================================ */

async function startDay1() {

    const loggedIn =
        await checkUser();

    if (!loggedIn) {
        return;
    }


    const canPlay =
        await checkProgress();

    if (!canPlay) {
        return;
    }


    /*
     * Try to start video.
     * Browser autoplay policies may block
     * videos with sound.
     */

    try {

        await video.play();

    } catch (error) {

        console.log(
            "Autoplay blocked. User can press play."
        );

    }
}

startDay1();
