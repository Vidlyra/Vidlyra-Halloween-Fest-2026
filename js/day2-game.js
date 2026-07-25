/* ===========================================================
   VIDLYRA HALLOWEEN FEST 2026
   DAY 2 - THE HAUNTED WELL
   PHASE 1
=========================================================== */

"use strict";

const Game = {

    /* ==========================================
       GAME STATE
    ========================================== */

    runesFound: 0,
    totalRunes: 3,

    gameStarted: false,
    canMove: false,

    playerX: 15,
    playerY: 12,

    moveSpeed: 0.30,

    keys: {},

    dialogTimer: null,

    /* ==========================================
       CACHE DOM
    ========================================== */

    cache() {

        this.player = document.getElementById("player");

        this.runes =
            document.querySelectorAll(".rune");

        this.progress =
            document.getElementById("progressFill");

        this.counter =
            document.getElementById("runeCounter");

        this.dialogBox =
            document.getElementById("dialogBox");

        this.dialog =
            document.getElementById("dialogText");

        this.intro =
            document.getElementById("introScreen");

        this.flash =
            document.getElementById("flash");

        this.ghost =
            document.querySelector(".ghost");

        this.crystal =
            document.querySelector(".crystal");

        this.missionComplete =
            document.getElementById("missionComplete");

        this.nextButton =
            document.getElementById("nextBtn");

        /* AUDIO */

        this.bgMusic =
            document.getElementById("bgMusic");

        this.ghostWhisper =
            document.getElementById("ghostWhisper");

        this.wellRumble =
            document.getElementById("wellRumble");

        this.magicSound =
            document.getElementById("magicSound");

        this.rewardSound =
            document.getElementById("rewardSound");

    },

    /* ==========================================
       INITIALIZE
    ========================================== */

    init() {

        this.cache();

        this.bindEvents();

        this.startIntro();

    },

    /* ==========================================
       EVENTS
    ========================================== */

    bindEvents() {

        window.addEventListener(

            "keydown",

            (e) => {

                this.keys[e.key.toLowerCase()] = true;

            }

        );

        window.addEventListener(

            "keyup",

            (e) => {

                this.keys[e.key.toLowerCase()] = false;

            }

        );

        this.runes.forEach((rune) => {

            rune.addEventListener(

                "click",

                () => {

                    this.collectRune(rune);

                }

            );

        });

        if (this.nextButton) {

            this.nextButton.addEventListener(

                "click",

                () => {

                    window.location.href =
                        "day3-video.html";

                }

            );

        }

    },

    /* ==========================================
       INTRO
    ========================================== */

    startIntro() {

        console.log("Day 2 Loaded");

        this.showMessage(

            "Find the three Ancient Runes..."

        );

        setTimeout(() => {

            if (this.intro) {

                this.intro.classList.add("hide");

            }

            this.startGame();

        }, 5000);

    },

    /* ==========================================
       START GAME
    ========================================== */

    startGame() {

        this.gameStarted = true;

        this.canMove = true;

        if (this.bgMusic) {

            this.bgMusic.volume = 0.35;

            this.bgMusic.play().catch(() => {});

        }

        this.gameLoop();

    },

    /* ==========================================
       GAME LOOP
    ========================================== */

    gameLoop() {

        this.updatePlayer();

        requestAnimationFrame(() => {

            this.gameLoop();

        });

    },

    /* ==========================================
       PLAYER MOVEMENT
    ========================================== */

    updatePlayer() {

        if (!this.canMove) return;

        if (this.keys["arrowleft"] || this.keys["a"]) {

            this.playerX -= this.moveSpeed;

        }

        if (this.keys["arrowright"] || this.keys["d"]) {

            this.playerX += this.moveSpeed;

        }

        if (this.keys["arrowup"] || this.keys["w"]) {

            this.playerY += this.moveSpeed;

        }

        if (this.keys["arrowdown"] || this.keys["s"]) {

            this.playerY -= this.moveSpeed;

        }

        this.playerX = Math.max(

            3,

            Math.min(94, this.playerX)

        );

        this.playerY = Math.max(

            5,

            Math.min(75, this.playerY)

        );

        if (this.player) {

            this.player.style.left =

                this.playerX + "%";

            this.player.style.bottom =

                this.playerY + "%";

        }

    },

    /* ==========================================
       DIALOG
    ========================================== */

    showMessage(text) {

        if (!this.dialogBox || !this.dialog)

            return;

        this.dialog.innerHTML = text;

        this.dialogBox.classList.add("show");

        clearTimeout(this.dialogTimer);

        this.dialogTimer = setTimeout(() => {

            this.dialogBox.classList.remove("show");

        }, 2500);

    },
       /* ==========================================
       COLLECT RUNE
    ========================================== */

    collectRune(rune) {

        if (rune.classList.contains("found")) {

            return;

        }

        rune.classList.add("found");

        rune.style.opacity = "0";

        rune.style.pointerEvents = "none";

        this.runesFound++;

        const percent =

            (this.runesFound / this.totalRunes) * 100;

        if (this.progress) {

            this.progress.style.width =

                percent + "%";

        }

        if (this.counter) {

            this.counter.innerHTML =

                "🔷 Ancient Runes : " +

                this.runesFound +

                " / " +

                this.totalRunes;

        }

        if (this.magicSound) {

            this.magicSound.currentTime = 0;

            this.magicSound.play().catch(() => {});

        }

        switch (this.runesFound) {

            case 1:

                this.showMessage(

                    "The first rune has awakened..."

                );

                break;

            case 2:

                this.showMessage(

                    "A strange energy surrounds the well..."

                );

                break;

            case 3:

                this.showMessage(

                    "The Haunted Well is awakening..."

                );

                setTimeout(() => {

                    this.awakenWell();

                }, 1500);

                break;

        }

    },

    /* ==========================================
       WELL EVENT
    ========================================== */

    awakenWell() {

        this.canMove = false;

        if (this.flash) {

            this.flash.classList.add("active");

            setTimeout(() => {

                this.flash.classList.remove("active");

            }, 500);

        }

        document.body.classList.add("shake");

        setTimeout(() => {

            document.body.classList.remove("shake");

        }, 1200);

        if (this.wellRumble) {

            this.wellRumble.currentTime = 0;

            this.wellRumble.play().catch(() => {});

        }

        if (this.ghostWhisper) {

            this.ghostWhisper.currentTime = 0;

            this.ghostWhisper.play().catch(() => {});

        }

        setTimeout(() => {

            if (this.ghost) {

                this.ghost.classList.add("active");

            }

        }, 1000);

        setTimeout(() => {

            if (this.crystal) {

                this.crystal.classList.add("active");

            }

            this.showMessage(

                "Touch the Magic Crystal..."

            );

            this.enableCrystal();

        }, 3000);

    },

    /* ==========================================
       CRYSTAL
    ========================================== */

    enableCrystal() {

        if (!this.crystal) return;

        this.crystal.addEventListener(

            "click",

            () => {

                this.collectCrystal();

            },

            {

                once: true

            }

        );

    },

    collectCrystal() {

        if (this.rewardSound) {

            this.rewardSound.currentTime = 0;

            this.rewardSound.play().catch(() => {});

        }

        if (this.flash) {

            this.flash.classList.add("active");

            setTimeout(() => {

                this.flash.classList.remove("active");

            }, 400);

        }

        this.showMessage(

            "The Ancient Spirit accepts you."

        );

        setTimeout(() => {

            this.showMissionComplete();

        }, 1500);

    },

    /* ==========================================
       MISSION COMPLETE
    ========================================== */

    showMissionComplete() {

        if (!this.missionComplete)

            return;

        this.missionComplete.classList.add(

            "show"

        );

    },
       /* ==========================================
       SAVE PROGRESS
    ========================================== */

    saveProgress() {

        try {

            localStorage.setItem(

                "vidlyra_day2_complete",

                "true"

            );

            localStorage.setItem(

                "vidlyra_day2_runes",

                this.runesFound

            );

        }

        catch (e) {

            console.log(e);

        }

    },

    /* ==========================================
       LOAD PROGRESS
    ========================================== */

    loadProgress() {

        try {

            const runes =

                localStorage.getItem(

                    "vidlyra_day2_runes"

                );

            if (runes) {

                this.runesFound =

                    parseInt(runes);

            }

        }

        catch (e) {

            console.log(e);

        }

    },

    /* ==========================================
       DAY COMPLETE
    ========================================== */

    finishDay() {

        this.canMove = false;

        this.saveProgress();

        this.showMessage(

            "Day 2 Complete!"

        );

        setTimeout(() => {

            if (this.missionComplete) {

                this.missionComplete.classList.add(

                    "show"

                );

            }

        }, 1200);

    },

    /* ==========================================
       MOBILE TOUCH
    ========================================== */

    enableTouchControls() {

        let startX = 0;

        let startY = 0;

        window.addEventListener(

            "touchstart",

            (e) => {

                startX =

                    e.touches[0].clientX;

                startY =

                    e.touches[0].clientY;

            }

        );

        window.addEventListener(

            "touchmove",

            (e) => {

                if (!this.canMove)

                    return;

                const dx =

                    e.touches[0].clientX -

                    startX;

                const dy =

                    e.touches[0].clientY -

                    startY;

                this.playerX += dx * 0.01;

                this.playerY -= dy * 0.01;

                startX =

                    e.touches[0].clientX;

                startY =

                    e.touches[0].clientY;

            }

        );

    },

    /* ==========================================
       RESET
    ========================================== */

    restart() {

        location.reload();

    },

    /* ==========================================
       GO HOME
    ========================================== */

    home() {

        window.location.href =

            "index.html";

    }

};

/* ==========================================
START GAME
========================================== */

document.addEventListener(

    "DOMContentLoaded",

    () => {

        Game.init();

        Game.loadProgress();

        Game.enableTouchControls();

    }

);
