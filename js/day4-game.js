/* ==========================================================
   VIDLYRA HALLOWEEN FEST 2026
   DAY 4 — THE WITCH'S CURSE
========================================================== */

import { supabase } from "./supabase.js";

"use strict";


const Game = {

    lanternsFound: 0,
    totalLanterns: 5,

    playerX: 8,
    playerY: 12,

    speed: 0.5,

    keys: {},

    gameStarted: false,

    user: null,

    day4Completed: false,

    finalSequenceStarted: false,

    messageTimer: null,


    /* ======================================================
       INIT
    ====================================================== */

    async init() {

        this.cache();

        this.bindEvents();

        const allowed =
            await this.checkAccess();

        if (!allowed) {

            return;

        }

        this.start();

    },


    /* ======================================================
       CACHE
    ====================================================== */

    cache() {

        this.player =
            document.getElementById("player");

        this.lanterns =
            document.querySelectorAll(".lantern");

        this.progress =
            document.getElementById("progressFill");

        this.counter =
            document.getElementById("lanternCounter");

        this.dialog =
            document.getElementById("dialogText");

        this.dialogBox =
            document.getElementById("dialogBox");

        this.flash =
            document.getElementById("flash");

        this.witch =
            document.querySelector(".witch");

        this.portal =
            document.querySelector(".portal");

        this.cauldron =
            document.querySelector(".cauldron");

        this.missionComplete =
            document.getElementById("missionComplete");

        this.nextBtn =
            document.getElementById("nextBtn");

        this.intro =
            document.getElementById("introScreen");


        /* AUDIO */

        this.bgMusic =
            document.getElementById("bgMusic");

        this.collectSound =
            document.getElementById("collectSound");

        this.lanternSound =
            document.getElementById("lanternSound");

        this.spellSound =
            document.getElementById("spellSound");

        this.cauldronSound =
            document.getElementById("cauldronSound");

        this.witchAppear =
            document.getElementById(
                "witchAppearSound"
            );

        this.witchLaugh =
            document.getElementById(
                "witchLaughSound"
            );

        this.portalSound =
            document.getElementById(
                "portalSound"
            );

        this.thunder =
            document.getElementById(
                "thunderSound"
            );

        this.reward =
            document.getElementById(
                "missionCompleteSound"
            );

    },


    /* ======================================================
       SUPABASE ACCESS
    ====================================================== */

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
            .select(
                "day3, day4"
            )
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
         * DAY 3 MUST BE COMPLETE
         */

        if (data.day3 !== true) {

            alert(
                "🔒 Complete Day 3 before entering Day 4."
            );

            window.location.href =
                "map.html";

            return false;

        }


        /*
         * Already completed?
         */

        if (data.day4 === true) {

            this.day4Completed = true;

        }


        console.log(
            "🧙 Day 4 access granted."
        );


        return true;

    },


    /* ======================================================
       EVENTS
    ====================================================== */

    bindEvents() {

        this.lanterns.forEach(
            (lantern) => {

                lantern.addEventListener(
                    "click",
                    () => {

                        this.collectLantern(
                            lantern
                        );

                    }
                );

            }
        );


        document.addEventListener(
            "keydown",
            (event) => {

                this.keys[
                    event.key
                ] = true;

            }
        );


        document.addEventListener(
            "keyup",
            (event) => {

                this.keys[
                    event.key
                ] = false;

            }
        );


        if (this.nextBtn) {

            this.nextBtn.addEventListener(
                "click",
                () => {

                    window.location.href =
                        "day5-video.html";

                }
            );

        }

    },


    /* ======================================================
       START
    ====================================================== */

    start() {

        console.log(
            "🎃 Day 4 Loaded"
        );


        this.gameStarted = true;


        if (this.bgMusic) {

            this.bgMusic.volume = 0.35;

            this.bgMusic
                .play()
                .catch(() => {});

        }


        if (this.cauldronSound) {

            this.cauldronSound.volume =
                0.45;

            this.cauldronSound
                .play()
                .catch(() => {});

        }


        setTimeout(
            () => {

                if (this.intro) {

                    this.intro.classList.add(
                        "hide"
                    );

                }

            },
            5000
        );


        this.showMessage(
            "Find all 5 Enchanted Lanterns."
        );


        this.movePlayer();

    },


    /* ======================================================
       PLAYER MOVEMENT
    ====================================================== */

    movePlayer() {

        const update = () => {

            if (!this.gameStarted) {

                requestAnimationFrame(
                    update
                );

                return;

            }


            if (
                this.keys["ArrowLeft"] ||
                this.keys["a"] ||
                this.keys["A"]
            ) {

                this.playerX -=
                    this.speed;

            }


            if (
                this.keys["ArrowRight"] ||
                this.keys["d"] ||
                this.keys["D"]
            ) {

                this.playerX +=
                    this.speed;

            }


            if (
                this.keys["ArrowUp"] ||
                this.keys["w"] ||
                this.keys["W"]
            ) {

                this.playerY +=
                    this.speed;

            }


            if (
                this.keys["ArrowDown"] ||
                this.keys["s"] ||
                this.keys["S"]
            ) {

                this.playerY -=
                    this.speed;

            }


            this.playerX =
                Math.max(
                    3,
                    Math.min(
                        95,
                        this.playerX
                    )
                );


            this.playerY =
                Math.max(
                    8,
                    Math.min(
                        82,
                        this.playerY
                    )
                );


            if (this.player) {

                this.player.style.left =
                    this.playerX + "%";

                this.player.style.bottom =
                    this.playerY + "%";

            }


            requestAnimationFrame(
                update
            );

        };


        requestAnimationFrame(
            update
        );

    },


    /* ======================================================
       COLLECT LANTERN
    ====================================================== */

    collectLantern(lantern) {

        if (
            this.finalSequenceStarted ||
            lantern.classList.contains(
                "collected"
            )
        ) {

            return;

        }


        lantern.classList.add(
            "collected"
        );


        lantern.style.pointerEvents =
            "none";


        this.playSound(
            this.collectSound
        );


        setTimeout(
            () => {

                this.playSound(
                    this.lanternSound
                );

            },
            150
        );


        this.lanternsFound++;


        this.updateProgress();


        lantern.style.transform =
            "scale(1.6)";


        lantern.style.opacity =
            "0";


        this.flashScreen();


        this.showMessage(
            "🏮 Enchanted Lantern Lit!"
        );


        if (
            this.lanternsFound >=
            this.totalLanterns
        ) {

            setTimeout(
                () => {

                    this.beginFinalSequence();

                },
                1500
            );

        }

    },


    /* ======================================================
       PROGRESS
    ====================================================== */

    updateProgress() {

        const percent =
            (
                this.lanternsFound /
                this.totalLanterns
            ) * 100;


        if (this.progress) {

            this.progress.style.width =
                percent + "%";

        }


        if (this.counter) {

            this.counter.textContent =
                "🏮 Enchanted Lanterns : " +
                this.lanternsFound +
                " / " +
                this.totalLanterns;

        }

    },


    /* ======================================================
       MESSAGE
    ====================================================== */

    showMessage(text) {

        if (
            !this.dialogBox ||
            !this.dialog
        ) {

            return;

        }


        this.dialog.textContent =
            text;


        this.dialogBox.classList.add(
            "show"
        );


        clearTimeout(
            this.messageTimer
        );


        this.messageTimer =
            setTimeout(
                () => {

                    this.dialogBox.classList.remove(
                        "show"
                    );

                },
                2500
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
            450
        );

    },


    /* ======================================================
       SOUND
    ====================================================== */

    playSound(audio) {

        if (!audio) {

            return;

        }


        audio.currentTime = 0;

        audio
            .play()
            .catch(() => {});

    },


    /* ======================================================
       FINAL SEQUENCE
    ====================================================== */

    beginFinalSequence() {

        if (this.finalSequenceStarted) {

            return;

        }


        this.finalSequenceStarted =
            true;


        this.gameStarted =
            false;


        this.showMessage(
            "The Witch senses the ancient light..."
        );


        this.flashScreen();


        this.playSound(
            this.thunder
        );


        setTimeout(
            () => {

                this.showWitch();

            },
            1800
        );

    },


    /* ======================================================
       WITCH
    ====================================================== */

    showWitch() {

        if (this.witch) {

            this.witch.classList.add(
                "active"
            );

        }


        this.playSound(
            this.witchAppear
        );


        this.showMessage(
            "The Witch has appeared!"
        );


        setTimeout(
            () => {

                this.witchCastSpell();

            },
            2500
        );

    },


    /* ======================================================
       SPELL
    ====================================================== */

    witchCastSpell() {

        this.flashScreen();


        this.playSound(
            this.spellSound
        );


        this.showMessage(
            "The Witch is casting a spell..."
        );


        setTimeout(
            () => {

                this.playSound(
                    this.witchLaugh
                );

            },
            800
        );


        setTimeout(
            () => {

                this.openPortal();

            },
            3000
        );

    },


    /* ======================================================
       PORTAL
    ====================================================== */

    openPortal() {

        if (this.portal) {

            this.portal.classList.add(
                "active"
            );

        }


        this.playSound(
            this.portalSound
        );


        this.showMessage(
            "The curse has been broken!"
        );


        setTimeout(
            () => {

                this.finishMission();

            },
            2500
        );

    },


    /* ======================================================
       SAVE DAY 4
    ====================================================== */

    async saveDay4Progress() {

        if (!this.user) {

            window.location.href =
                "login.html";

            return false;

        }


        const {
            error
        } = await supabase
            .from("festival_progress")
            .update({
                day4: true
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
                "Day 4 save error:",
                error
            );

            this.showMessage(
                "⚠️ Could not save progress."
            );

            return false;

        }


        return true;

    },


    /* ======================================================
       MISSION COMPLETE
    ====================================================== */

    async finishMission() {

        if (this.day4Completed) {

            this.showCompletion();

            return;

        }


        const saved =
            await this.saveDay4Progress();


        if (!saved) {

            return;

        }


        this.day4Completed =
            true;


        this.playSound(
            this.reward
        );


        this.showMessage(
            "🎉 DAY 4 COMPLETE!"
        );


        this.showCompletion();

    },


    /* ======================================================
       COMPLETION SCREEN
    ====================================================== */

    showCompletion() {

        if (this.missionComplete) {

            this.missionComplete.classList.add(
                "show"
            );

        }

    },


    /* ======================================================
       PARTICLES
    ====================================================== */

    createParticles() {

        const container =
            document.getElementById(
                "particleContainer"
            );


        if (!container) {

            return;

        }


        for (
            let i = 0;
            i < 60;
            i++
        ) {

            const particle =
                document.createElement(
                    "div"
                );


            particle.className =
                "particle";


            particle.style.left =
                Math.random() * 100 + "%";


            particle.style.top =
                Math.random() * 100 + "%";


            particle.style.animationDelay =
                Math.random() * 8 + "s";


            particle.style.animationDuration =
                (
                    5 +
                    Math.random() * 6
                ) + "s";


            particle.style.opacity =
                Math.random();


            container.appendChild(
                particle
            );

        }

    },


    /* ======================================================
       RANDOM THUNDER
    ====================================================== */

    startThunder() {

        const thunderLoop =
            () => {

                const delay =
                    Math.random() *
                    9000 +
                    5000;


                setTimeout(
                    () => {

                        if (
                            !this.gameStarted
                        ) {

                            thunderLoop();

                            return;

                        }


                        this.flashScreen();


                        this.playSound(
                            this.thunder
                        );


                        thunderLoop();

                    },
                    delay
                );

            };


        thunderLoop();

    },


    /* ======================================================
       RESTART
    ====================================================== */

    restartGame() {

        this.lanternsFound = 0;

        this.playerX = 8;

        this.playerY = 12;

        this.gameStarted = true;

        this.finalSequenceStarted =
            false;


        if (this.player) {

            this.player.style.left =
                "8%";

            this.player.style.bottom =
                "12%";

        }


        this.lanterns.forEach(
            (lantern) => {

                lantern.classList.remove(
                    "collected"
                );

                lantern.style.opacity =
                    "1";

                lantern.style.pointerEvents =
                    "auto";

                lantern.style.transform =
                    "scale(1)";

            }
        );


        if (this.progress) {

            this.progress.style.width =
                "0%";

        }


        if (this.counter) {

            this.counter.textContent =
                "🏮 Enchanted Lanterns : 0 / 5";

        }


        if (this.witch) {

            this.witch.classList.remove(
                "active"
            );

        }


        if (this.portal) {

            this.portal.classList.remove(
                "active"
            );

        }


        if (this.missionComplete) {

            this.missionComplete.classList.remove(
                "show"
            );

        }


        this.showMessage(
            "Find all 5 Enchanted Lanterns."
        );

    }

};


/* ==========================================================
   START
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await Game.init();

        Game.createParticles();

        Game.startThunder();

    }
);
