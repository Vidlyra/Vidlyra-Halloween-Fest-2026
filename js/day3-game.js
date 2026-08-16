/* ==========================================================
   VIDLYRA HALLOWEEN FEST 2026
   DAY 3 — THE CURSED FOREST
========================================================== */

import { supabase } from "./supabase.js";

"use strict";


const Game = {

    /* ======================================================
       STATE
    ====================================================== */

    crystalsFound: 0,
    totalCrystals: 5,

    user: null,

    festivalReady: false,
    day3Completed: false,

    gameStarted: false,
    canMove: false,

    playerX: 50,
    playerY: 18,

    moveSpeed: 0.35,

    keys: {},

    dialogTimer: null,

    gateOpened: false,
    portalActivated: false,


    /* ======================================================
       DOM CACHE
    ====================================================== */

    cache() {

        this.introScreen =
            document.getElementById("introScreen");

        this.player =
            document.getElementById("player");

        this.crystals =
            document.querySelectorAll(".crystal");

        this.progressFill =
            document.getElementById("progressFill");

        this.crystalCounter =
            document.getElementById("crystalCounter");

        this.dialogBox =
            document.getElementById("dialogBox");

        this.dialogText =
            document.getElementById("dialogText");

        this.gate =
            document.getElementById("ancientGate");

        this.portal =
            document.getElementById("magicPortal");

        this.dracula =
            document.getElementById("dracula");

        this.missionComplete =
            document.getElementById("missionComplete");

        this.nextBtn =
            document.getElementById("nextBtn");

        this.flash =
            document.getElementById("flash");

        this.lightning =
            document.getElementById("lightningFlash");

        this.screenGlow =
            document.getElementById("screenGlow");

        this.shakeLayer =
            document.getElementById("shakeLayer");

        this.loadingOverlay =
            document.getElementById("loadingOverlay");

        this.loadingFill =
            document.getElementById("loadingFill");


        /* AUDIO */

        this.bgMusic =
            document.getElementById("bgMusic");

        this.rainSound =
            document.getElementById("rainSound");

        this.thunderSound =
            document.getElementById("thunderSound");

        this.batSound =
            document.getElementById("batSound");

        this.crystalSound =
            document.getElementById("crystalSound");

        this.gateSound =
            document.getElementById("gateSound");

        this.portalSound =
            document.getElementById("portalSound");

        this.draculaLaugh =
            document.getElementById("draculaLaugh");

        this.missionSound =
            document.getElementById("missionSound");

    },


    /* ======================================================
       INITIALIZE
    ====================================================== */

    async init() {

        this.cache();

        this.bindEvents();

        const allowed =
            await this.checkFestivalAccess();

        if (!allowed) {

            return;

        }

        this.startIntro();

    },


    /* ======================================================
       SUPABASE ACCESS
    ====================================================== */

    async checkFestivalAccess() {

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
            .select(`
                day1,
                day2,
                day3
            `)
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
                "Festival progress error:",
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


        /*
         * DAY 2 REQUIRED
         */

        if (data.day2 !== true) {

            alert(
                "🔒 Complete Day 2 before entering Day 3."
            );

            window.location.href =
                "map.html";

            return false;

        }


        if (data.day3 === true) {

            this.day3Completed = true;

        }


        this.festivalReady = true;

        console.log(
            "🌲 Day 3 access granted."
        );

        return true;

    },


    /* ======================================================
       EVENTS
    ====================================================== */

    bindEvents() {

        window.addEventListener(
            "keydown",
            (event) => {

                this.keys[
                    event.key.toLowerCase()
                ] = true;

            }
        );


        window.addEventListener(
            "keyup",
            (event) => {

                this.keys[
                    event.key.toLowerCase()
                ] = false;

            }
        );


        /*
         * CRYSTAL CLICK
         */

        this.crystals.forEach(
            (crystal) => {

                crystal.addEventListener(
                    "click",
                    () => {

                        this.collectCrystal(
                            crystal
                        );

                    }
                );

            }
        );


        /*
         * CONTINUE BUTTON
         */

        if (this.nextBtn) {

            this.nextBtn.addEventListener(
                "click",
                () => {

                    this.goToMap();

                }
            );

        }


        /*
         * MOBILE TOUCH
         */

        this.enableTouchControls();

    },


    /* ======================================================
       INTRO
    ====================================================== */

    startIntro() {

        this.showMessage(
            "Enter the Cursed Forest..."
        );


        setTimeout(
            () => {

                if (this.introScreen) {

                    this.introScreen.classList.add(
                        "hide"
                    );

                }


                this.startGame();

            },
            4500
        );

    },


    /* ======================================================
       START GAME
    ====================================================== */

    startGame() {

        this.gameStarted = true;

        this.canMove = true;


        /*
         * Music
         */

        if (this.bgMusic) {

            this.bgMusic.volume = 0.30;

            this.bgMusic
                .play()
                .catch(() => {});

        }


        /*
         * Rain
         */

        if (this.rainSound) {

            this.rainSound.volume = 0.15;

            this.rainSound
                .play()
                .catch(() => {});

        }


        this.showMessage(
            "Collect all five Dark Crystals."
        );


        this.gameLoop();

    },


    /* ======================================================
       GAME LOOP
    ====================================================== */

    gameLoop() {

        if (this.gameStarted) {

            this.updatePlayer();

        }


        requestAnimationFrame(
            () => {

                this.gameLoop();

            }
        );

    },


    /* ======================================================
       PLAYER MOVEMENT
    ====================================================== */

    updatePlayer() {

        if (!this.canMove) {

            return;

        }


        /*
         * LEFT
         */

        if (
            this.keys["arrowleft"] ||
            this.keys["a"]
        ) {

            this.playerX -=
                this.moveSpeed;

        }


        /*
         * RIGHT
         */

        if (
            this.keys["arrowright"] ||
            this.keys["d"]
        ) {

            this.playerX +=
                this.moveSpeed;

        }


        /*
         * UP
         */

        if (
            this.keys["arrowup"] ||
            this.keys["w"]
        ) {

            this.playerY +=
                this.moveSpeed;

        }


        /*
         * DOWN
         */

        if (
            this.keys["arrowdown"] ||
            this.keys["s"]
        ) {

            this.playerY -=
                this.moveSpeed;

        }


        /*
         * WORLD BOUNDS
         */

        this.playerX =
            Math.max(
                3,
                Math.min(
                    96,
                    this.playerX
                )
            );


        this.playerY =
            Math.max(
                5,
                Math.min(
                    82,
                    this.playerY
                )
            );


        /*
         * PLAYER POSITION
         */

        if (this.player) {

            this.player.style.left =
                this.playerX + "%";

            this.player.style.bottom =
                this.playerY + "%";

        }

    },


    /* ======================================================
       CRYSTAL COLLECTION
    ====================================================== */

    collectCrystal(crystal) {

        if (!crystal) {

            return;

        }


        /*
         * Already collected?
         */

        if (
            crystal.classList.contains(
                "collected"
            )
        ) {

            return;

        }


        crystal.classList.add(
            "collected"
        );


        crystal.style.pointerEvents =
            "none";


        /*
         * Collection sound
         */

        if (this.crystalSound) {

            this.crystalSound.currentTime =
                0;

            this.crystalSound
                .play()
                .catch(() => {});

        }


        /*
         * Crystal disappears
         */

        crystal.style.opacity =
            "0";

        crystal.style.transform =
            "scale(0)";


        this.crystalsFound++;


        /*
         * Progress bar
         */

        const percentage =
            (
                this.crystalsFound /
                this.totalCrystals
            ) * 100;


        if (this.progressFill) {

            this.progressFill.style.width =
                percentage + "%";

        }


        /*
         * Counter
         */

        if (this.crystalCounter) {

            this.crystalCounter.innerHTML =
                "💎 Dark Crystals : " +
                this.crystalsFound +
                " / " +
                this.totalCrystals;

        }


        /*
         * Crystal messages
         */

        if (
            this.crystalsFound === 1
        ) {

            this.showMessage(
                "The forest whispers..."
            );

        }


        if (
            this.crystalsFound === 2
        ) {

            this.showMessage(
                "Something is watching you."
            );

        }


        if (
            this.crystalsFound === 3
        ) {

            this.showMessage(
                "Three crystals awakened."
            );

        }


        if (
            this.crystalsFound === 4
        ) {

            this.showMessage(
                "Only one crystal remains..."
            );

        }


        /*
         * ALL FIVE
         */

        if (
            this.crystalsFound >=
            this.totalCrystals
        ) {

            this.showMessage(
                "The Ancient Gate is awakening..."
            );


            setTimeout(
                () => {

                    this.openAncientGate();

                },
                1800
            );

        }

    },


    /* ======================================================
       ANCIENT GATE
    ====================================================== */

    openAncientGate() {

        if (this.gateOpened) {

            return;

        }


        this.gateOpened = true;

        this.canMove = false;


        /*
         * Gate sound
         */

        if (this.gateSound) {

            this.gateSound.currentTime =
                0;

            this.gateSound
                .play()
                .catch(() => {});

        }


        /*
         * Flash
         */

        this.flashScreen();


        /*
         * Shake
         */

        this.shakeScreen();


        /*
         * Gate animation
         */

        if (this.gate) {

            this.gate.classList.add(
                "open"
            );

        }


        this.showMessage(
            "THE ANCIENT GATE HAS OPENED."
        );


        /*
         * Dracula appears
         */

        setTimeout(
            () => {

                this.showDracula();

            },
            2200
        );

    },


    /* ======================================================
       DRACULA
    ====================================================== */

    showDracula() {

        if (this.dracula) {

            this.dracula.classList.add(
                "show"
            );

        }


        if (this.draculaLaugh) {

            this.draculaLaugh.currentTime =
                0;

            this.draculaLaugh
                .play()
                .catch(() => {});

        }


        this.showMessage(
            "A dark presence guards the path..."
        );


        /*
         * Portal
         */

        setTimeout(
            () => {

                this.activatePortal();

            },
            2500
        );

    },


    /* ======================================================
       PORTAL
    ====================================================== */

    activatePortal() {

        if (this.portalActivated) {

            return;

        }


        this.portalActivated = true;


        if (this.portal) {

            this.portal.classList.add(
                "active"
            );

        }


        if (this.portalSound) {

            this.portalSound.currentTime =
                0;

            this.portalSound
                .play()
                .catch(() => {});

        }


        this.showMessage(
            "The path to the next chapter is open."
        );


        /*
         * Mission complete
         */

        setTimeout(
            () => {

                this.completeDay3();

            },
            2500
        );

    },


    /* ======================================================
       COMPLETE DAY 3
    ====================================================== */

    async completeDay3() {

        if (this.day3Completed) {

            this.showMissionComplete();

            return;

        }


        this.canMove = false;


        if (!this.user) {

            window.location.href =
                "login.html";

            return;

        }


        /*
         * SAVE TO SUPABASE
         */

        const {
            error
        } = await supabase
            .from("festival_progress")
            .update({
                day3: true
            })
            .eq(
                "user_id",
                this.user.id
            )
            .eq(
                "festival",
                "halloween_2026"
            );


        if (error) {

            console.error(
                "DAY 3 SAVE ERROR:",
                error
            );


            this.showMessage(
                "⚠️ Could not save Day 3 progress."
            );

            return;

        }


        /*
         * SUCCESS
         */

        this.day3Completed = true;


        if (this.missionSound) {

            this.missionSound.currentTime =
                0;

            this.missionSound
                .play()
                .catch(() => {});

        }


        this.showMessage(
            "🌲 DAY 3 COMPLETE!"
        );


        /*
         * Show completion panel
         */

        setTimeout(
            () => {

                this.showMissionComplete();

            },
            1200
        );

    },


    /* ======================================================
       MISSION COMPLETE SCREEN
    ====================================================== */

    showMissionComplete() {

        if (!this.missionComplete) {

            return;

        }


        this.missionComplete.classList.add(
            "show"
        );

    },


    /* ======================================================
       DIALOG
    ====================================================== */

    showMessage(message) {

        if (
            !this.dialogBox ||
            !this.dialogText
        ) {

            return;

        }


        this.dialogText.textContent =
            message;


        this.dialogBox.classList.add(
            "show"
        );


        clearTimeout(
            this.dialogTimer
        );


        this.dialogTimer =
            setTimeout(
                () => {

                    this.dialogBox.classList.remove(
                        "show"
                    );

                },
                2800
            );

    },


    /* ======================================================
       FLASH
    ====================================================== */

    flashScreen() {

        if (!this.flash) {

            return;

        }


        this.flash.classList.add(
            "active"
        );


        setTimeout(
            () => {

                this.flash.classList.remove(
                    "active"
                );

            },
            500
        );

    },


    /* ======================================================
       LIGHTNING
    ====================================================== */

    lightningFlash() {

        if (!this.lightning) {

            return;

        }


        this.lightning.classList.add(
            "active"
        );


        if (this.thunderSound) {

            this.thunderSound.currentTime =
                0;

            this.thunderSound
                .play()
                .catch(() => {});

        }


        setTimeout(
            () => {

                this.lightning.classList.remove(
                    "active"
                );

            },
            350
        );

    },


    /* ======================================================
       SCREEN SHAKE
    ====================================================== */

    shakeScreen() {

        if (!this.shakeLayer) {

            return;

        }


        this.shakeLayer.classList.add(
            "active"
        );


        setTimeout(
            () => {

                this.shakeLayer.classList.remove(
                    "active"
                );

            },
            900
        );

    },


    /* ======================================================
       MOBILE TOUCH
    ====================================================== */

    enableTouchControls() {

        let startX = 0;
        let startY = 0;


        window.addEventListener(
            "touchstart",
            (event) => {

                if (
                    !event.touches ||
                    !event.touches[0]
                ) {

                    return;

                }


                startX =
                    event.touches[0].clientX;

                startY =
                    event.touches[0].clientY;

            },
            {
                passive: true
            }
        );


        window.addEventListener(
            "touchmove",
            (event) => {

                if (!this.canMove) {

                    return;

                }


                if (
                    !event.touches ||
                    !event.touches[0]
                ) {

                    return;

                }


                const currentX =
                    event.touches[0].clientX;

                const currentY =
                    event.touches[0].clientY;


                const dx =
                    currentX - startX;

                const dy =
                    currentY - startY;


                this.playerX +=
                    dx * 0.012;


                this.playerY -=
                    dy * 0.012;


                startX =
                    currentX;

                startY =
                    currentY;

            },
            {
                passive: true
            }
        );

    },


    /* ======================================================
       RETURN TO MAP
    ====================================================== */

    goToMap() {

        window.location.href =
            "map.html";

    }

};


/* ==========================================================
   START
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        Game.init();

    }
);
