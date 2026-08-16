import { supabase } from "./supabase.js";

"use strict";


const Day5 = {

    user: null,

    started: false,

    finished: false,

    /* ==========================================
       ELEMENTS
    ========================================== */

    cache() {

        this.loadingScreen =
            document.getElementById("loadingScreen");

        this.loadingFill =
            document.getElementById("loadingFill");

        this.video =
            document.getElementById("introVideo");

        this.overlay =
            document.getElementById("overlay");

        this.lightning =
            document.getElementById("lightningFlash");

        this.fade =
            document.getElementById("fadeScreen");

        this.title =
            document.getElementById("titleContainer");

        this.mission =
            document.getElementById("missionPreview");

        this.subtitle =
            document.getElementById("subtitleContainer");

        this.skip =
            document.getElementById("skipButton");

        this.progress =
            document.getElementById("videoFill");

        this.endOverlay =
            document.getElementById("endOverlay");

        this.enterButton =
            document.getElementById("enterButton");

        this.startOverlay =
            document.getElementById("startOverlay");

        this.startButton =
            document.getElementById("startButton");

        this.bgMusic =
            document.getElementById("bgMusic");

        this.thunder =
            document.getElementById("thunder");

        this.ghostWhisper =
            document.getElementById("ghostWhisper");

    },


    /* ==========================================
       LOGIN + DAY 4 ACCESS
    ========================================== */

    async checkAccess() {

        const {
            data: {
                user
            },
            error
        } = await supabase.auth.getUser();


        if (error || !user) {

            window.location.href =
                "login.html";

            return false;

        }


        this.user = user;


        const {
            data,
            error: progressError
        } = await supabase
            .from("festival_progress")
            .select("day4, day5")
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
                "Progress error:",
                progressError
            );

            alert(
                "Unable to load festival progress."
            );

            window.location.href =
                "map.html";

            return false;

        }


        if (!data) {

            alert(
                "Festival progress not found."
            );

            window.location.href =
                "map.html";

            return false;

        }


        /* ======================================
           DAY 4 REQUIRED
        ====================================== */

        if (data.day4 !== true) {

            alert(
                "🔒 Complete Day 4 before entering Day 5."
            );

            window.location.href =
                "map.html";

            return false;

        }


        console.log(
            "👻 Day 5 unlocked."
        );


        return true;

    },


    /* ==========================================
       EVENTS
    ========================================== */

    bindEvents() {

        if (this.startButton) {

            this.startButton.addEventListener(
                "click",
                () => this.startExperience()
            );

        }


        if (this.skip) {

            this.skip.addEventListener(
                "click",
                () => this.finishVideo()
            );

        }


        if (this.enterButton) {

            this.enterButton.addEventListener(
                "click",
                () => this.enterGame()
            );

        }


        if (this.video) {

            this.video.addEventListener(
                "timeupdate",
                () => this.updateProgress()
            );


            this.video.addEventListener(
                "ended",
                () => this.finishVideo()
            );


            this.video.addEventListener(
                "loadedmetadata",
                () => {

                    console.log(
                        "Day 5 cinematic loaded."
                    );

                }
            );

        }

    },


    /* ==========================================
       START
    ========================================== */

    async startExperience() {

        if (this.started) {

            return;

        }


        this.started = true;


        if (this.startOverlay) {

            this.startOverlay.classList.add(
                "hide"
            );

        }


        this.playAudio();


        try {

            await this.video.play();

        }

        catch (error) {

            console.error(
                "Video playback error:",
                error
            );

        }


        if (this.loadingScreen) {

            setTimeout(
                () => {

                    this.loadingScreen.classList.add(
                        "hide"
                    );

                },
                700
            );

        }


        this.showCinematicUI();

    },


    /* ==========================================
       AUDIO
    ========================================== */

    playAudio() {

        if (!this.bgMusic) {

            return;

        }


        this.bgMusic.volume = 0.25;


        this.bgMusic
            .play()
            .catch(() => {});

    },


    /* ==========================================
       CINEMATIC UI
    ========================================== */

    showCinematicUI() {

        if (this.title) {

            this.title.classList.add(
                "show"
            );

        }


        if (this.mission) {

            this.mission.classList.add(
                "show"
            );

        }


        if (this.subtitle) {

            this.subtitle.classList.add(
                "show"
            );

        }


        if (this.skip) {

            this.skip.classList.add(
                "show"
            );

        }

    },


    /* ==========================================
       VIDEO PROGRESS
    ========================================== */

    updateProgress() {

        if (
            !this.video ||
            !this.progress ||
            !this.video.duration
        ) {

            return;

        }


        const percent =
            (
                this.video.currentTime /
                this.video.duration
            ) * 100;


        this.progress.style.width =
            percent + "%";


        /* Atmospheric effects */

        if (
            this.video.currentTime > 8 &&
            this.video.currentTime < 9
        ) {

            this.lightningFlash();

        }

    },


    /* ==========================================
       LIGHTNING
    ========================================== */

    lightningFlash() {

        if (this.lightning) {

            this.lightning.classList.add(
                "active"
            );


            setTimeout(
                () => {

                    this.lightning.classList.remove(
                        "active"
                    );

                },
                250
            );

        }


        if (this.thunder) {

            this.thunder.currentTime = 0;

            this.thunder
                .play()
                .catch(() => {});

        }

    },


    /* ==========================================
       FINISH VIDEO
    ========================================== */

    finishVideo() {

        if (this.finished) {

            return;

        }


        this.finished = true;


        if (this.video) {

            this.video.pause();

        }


        if (this.skip) {

            this.skip.classList.remove(
                "show"
            );

        }


        if (this.progress) {

            this.progress.style.width =
                "100%";

        }


        if (this.bgMusic) {

            this.bgMusic.volume = 0.12;

        }


        this.showEndOverlay();

    },


    /* ==========================================
       END SCREEN
    ========================================== */

    showEndOverlay() {

        if (this.endOverlay) {

            this.endOverlay.classList.add(
                "show"
            );

        }


        if (this.ghostWhisper) {

            this.ghostWhisper.volume =
                0.35;

            this.ghostWhisper
                .play()
                .catch(() => {});

        }

    },


    /* ==========================================
       ENTER GAME
    ========================================== */

    enterGame() {

        if (this.fade) {

            this.fade.classList.add(
                "active"
            );

        }


        if (this.bgMusic) {

            this.bgMusic.pause();

        }


        setTimeout(
            () => {

                window.location.href =
                    "day5-game.html";

            },
            900
        );

    }

};


/* ==========================================
   LOADING
========================================== */

function loadingAnimation() {

    const fill =
        document.getElementById(
            "loadingFill"
        );


    if (!fill) {

        return;

    }


    let progress = 0;


    const timer =
        setInterval(
            () => {

                progress +=
                    Math.random() * 8;


                if (progress >= 100) {

                    progress = 100;

                    clearInterval(timer);

                }


                fill.style.width =
                    progress + "%";


            },
            120
        );

}


/* ==========================================
   INITIALIZE
========================================== */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        Day5.cache();

        Day5.bindEvents();

        loadingAnimation();


        const allowed =
            await Day5.checkAccess();


        if (!allowed) {

            return;

        }


        console.log(
            "🎃 VIDLYRA HALLOWEEN FEST 2026 — DAY 5 READY"
        );

    }
);
