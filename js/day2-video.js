import { supabase } from "./supabase.js";


/* ==========================
   ELEMENTS
========================== */

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

const enterWell =
    document.getElementById("enterWell");

const videoError =
    document.getElementById("videoError");


let currentUser = null;
let introStarted = false;


/* ==========================
   CHECK LOGIN
========================== */

async function checkUser(){

    const {
        data: {
            user
        },
        error
    } = await supabase.auth.getUser();


    if(error || !user){

        window.location.href =
            "login.html";

        return null;
    }


    return user;
}


/* ==========================
   CHECK FESTIVAL PROGRESS
========================== */

async function checkDay2(){

    currentUser =
        await checkUser();


    if(!currentUser){
        return false;
    }


    const {
        data,
        error
    } = await supabase
        .from("festival_progress")
        .select(`
            day1,
            day2
        `)
        .eq("user_id", currentUser.id)
        .eq("festival", "halloween_2026")
        .maybeSingle();


    if(error){

        console.error(error);

        alert(
            "Unable to load your festival progress."
        );

        window.location.href =
            "map.html";

        return false;
    }


    /*
     * No progress record.
     */

    if(!data){

        window.location.href =
            "map.html";

        return false;
    }


    /*
     * Day 1 must be completed.
     */

    if(data.day1 !== true){

        alert(
            "🔒 Complete Day 1 before entering Day 2."
        );

        window.location.href =
            "map.html";

        return false;
    }


    /*
     * If Day 2 is already completed,
     * allow the player to replay the intro.
     */

    return true;
}


/* ==========================
   START EXPERIENCE
========================== */

startBtn.addEventListener(
    "click",
    async () => {

        if(introStarted){
            return;
        }

        introStarted = true;

        startBtn.disabled = true;

        startBtn.textContent =
            "ENTERING...";


        introVideo.currentTime = 0;


        try{

            await introVideo.play();

            startScreen.classList.add(
                "hidden"
            );

        }catch(error){

            console.error(error);

            introStarted = false;

            startBtn.disabled = false;

            startBtn.textContent =
                "▶ Start Experience";

        }

    }
);


/* ==========================
   VIDEO PLAYING
========================== */

introVideo.addEventListener(
    "play",
    () => {

        skipBtn.classList.add(
            "show"
        );

    }
);


/* ==========================
   VIDEO ENDED
========================== */

introVideo.addEventListener(
    "ended",
    () => {

        showVideoOverlay();

    }
);


/* ==========================
   VIDEO ERROR
   (missing file, bad codec, network failure)
========================== */

introVideo.addEventListener(
    "error",
    () => {

        console.error(
            "Day 2 intro video failed to load."
        );

        skipBtn.classList.remove(
            "show"
        );

        startScreen.classList.add(
            "hidden"
        );

        if(videoError){

            videoError.classList.add(
                "show"
            );

        }else{

            // No error element in the DOM — fall back to letting
            // the player continue instead of getting stuck.
            showVideoOverlay();
        }

    }
);


/* ==========================
   SKIP INTRO
========================== */

skipBtn.addEventListener(
    "click",
    () => {

        introVideo.pause();

        showVideoOverlay();

    }
);


/* ==========================
   SHOW OVERLAY
========================== */

function showVideoOverlay(){

    skipBtn.classList.remove(
        "show"
    );

    videoOverlay.classList.add(
        "show"
    );

}


/* ==========================
   ENTER THE WELL
========================== */

enterWell.addEventListener(
    "click",
    () => {

        window.location.href =
            "day2-game.html";

    }
);


/* ==========================
   INITIALIZE
========================== */

async function initialize(){

    const allowed =
        await checkDay2();

    if(!allowed){
        return;
    }

    console.log(
        "🎃 Day 2 intro unlocked."
    );

}


initialize();
