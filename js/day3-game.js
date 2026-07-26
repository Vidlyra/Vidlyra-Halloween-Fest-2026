/* ==========================================================
   VIDLYRA HALLOWEEN FEST 2026
   DAY 3 - THE CURSED FOREST
========================================================== */

"use strict";

const Game = {

    /* ==========================================
       GAME STATE
    ========================================== */

    crystalsFound: 0,

    totalCrystals: 5,

    playerX: 8,

    playerY: 10,

    speed: 1,

    gameStarted: false,

    keys: {},

    /* ==========================================
       INITIALIZE
    ========================================== */

    init() {

        this.cache();

        this.bindEvents();

        this.start();

    },

    /* ==========================================
       CACHE ELEMENTS
    ========================================== */

    cache() {

        /* Intro */

        this.intro =
            document.getElementById("introScreen");

        /* Player */

        this.player =
            document.getElementById("player");

        /* Collectibles */

        this.crystals =
            document.querySelectorAll(".crystal");

        /* Objects */

        this.gate =
            document.querySelector(".gate");

        this.portal =
            document.querySelector(".portal");

        this.dracula =
            document.querySelector(".dracula");

        /* UI */

        this.progress =
            document.getElementById("progressFill");

        this.counter =
            document.getElementById("crystalCounter");

        this.dialogBox =
            document.getElementById("dialogBox");

        this.dialog =
            document.getElementById("dialogText");

        this.missionComplete =
            document.getElementById("missionComplete");

        this.nextBtn =
            document.getElementById("nextBtn");

        /* Effects */

        this.flash =
            document.getElementById("flash");

        this.lightning =
            document.getElementById("lightningFlash");

        this.loading =
            document.getElementById("loadingOverlay");

        /* Audio */

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

    /* ==========================================
       EVENTS
    ========================================== */

    bindEvents() {

        /* Keyboard */

        document.addEventListener(

            "keydown",

            (event) => {

                this.keys[event.key] = true;

            }

        );

        document.addEventListener(

            "keyup",

            (event) => {

                this.keys[event.key] = false;

            }

        );

        /* Crystal Click */

        this.crystals.forEach((crystal) => {

            crystal.addEventListener(

                "click",

                () => this.collectCrystal(crystal)

            );

        });

        /* Continue */

        if (this.nextBtn) {

            this.nextBtn.addEventListener(

                "click",

                () => {

                    window.location.href =
                        "day4-video.html";

                }

            );

        }

    },

    /* ==========================================
       START GAME
    ========================================== */

    start() {

        console.log("DAY 3 STARTED");

        this.gameStarted = true;

        if (this.bgMusic) {

            this.bgMusic.volume = 0.35;

            this.bgMusic.play().catch(() => {});

        }

        if (this.rainSound) {

            this.rainSound.volume = 0.25;

            this.rainSound.play().catch(() => {});

        }

        setTimeout(() => {

            if (this.intro) {

                this.intro.classList.add("hide");

            }

        }, 5000);

    },
       /* ==========================================
       PLAYER MOVEMENT
    ========================================== */

    movePlayer() {

        const update = () => {

            if (!this.gameStarted) {

                requestAnimationFrame(update);

                return;

            }

            /* LEFT */

            if (this.keys["ArrowLeft"] || this.keys["a"] || this.keys["A"]) {

                this.playerX -= this.speed;

            }

            /* RIGHT */

            if (this.keys["ArrowRight"] || this.keys["d"] || this.keys["D"]) {

                this.playerX += this.speed;

            }

            /* UP */

            if (this.keys["ArrowUp"] || this.keys["w"] || this.keys["W"]) {

                this.playerY += this.speed;

            }

            /* DOWN */

            if (this.keys["ArrowDown"] || this.keys["s"] || this.keys["S"]) {

                this.playerY -= this.speed;

            }

            /* LIMIT PLAYER */

            this.playerX = Math.max(3, Math.min(95, this.playerX));

            this.playerY = Math.max(6, Math.min(82, this.playerY));

            if (this.player) {

                this.player.style.left = this.playerX + "%";

                this.player.style.bottom = this.playerY + "%";

            }

            requestAnimationFrame(update);

        };

        requestAnimationFrame(update);

    },

    /* ==========================================
       SHOW MESSAGE
    ========================================== */

    showMessage(text) {

        if (!this.dialogBox || !this.dialog) {

            return;

        }

        this.dialog.textContent = text;

        this.dialogBox.classList.add("show");

        clearTimeout(this.dialogTimer);

        this.dialogTimer = setTimeout(() => {

            this.dialogBox.classList.remove("show");

        }, 2500);

    },

    /* ==========================================
       SCREEN SHAKE
    ========================================== */

    shakeScreen(duration = 800) {

        document.body.classList.add("shake");

        setTimeout(() => {

            document.body.classList.remove("shake");

        }, duration);

    },

    /* ==========================================
       FLASH EFFECT
    ========================================== */

    flashScreen() {

        if (!this.flash) return;

        this.flash.classList.add("active");

        setTimeout(() => {

            this.flash.classList.remove("active");

        }, 400);

    },

    /* ==========================================
       PLAY SOUND
    ========================================== */

    playSound(audio) {

        if (!audio) return;

        audio.currentTime = 0;

        audio.play().catch(() => {});

    },
       /* ==========================================
       COLLECT CRYSTAL
    ========================================== */

    collectCrystal(crystal) {

        if (crystal.classList.contains("collected")) {

            return;

        }

        crystal.classList.add("collected");

        crystal.style.pointerEvents = "none";

        /* Play Sound */

        this.playSound(this.crystalSound);

        /* Increase Count */

        this.crystalsFound++;

        /* Update Progress */

        this.updateProgress();

        /* Collection Animation */

        crystal.style.transition =

            "transform .4s ease, opacity .4s ease";

        crystal.style.transform =

            "scale(1.8)";

        crystal.style.opacity = "0";

        /* Dialog */

        this.showMessage(

            "Dark Crystal Collected!"

        );

        /* Small Flash */

        this.flashScreen();

        /* Finished? */

        if (

            this.crystalsFound >=

            this.totalCrystals

        ) {

            setTimeout(() => {

                this.openGate();

            }, 1500);

        }

    },

    /* ==========================================
       UPDATE PROGRESS
    ========================================== */

    updateProgress() {

        const percent =

            (this.crystalsFound /

            this.totalCrystals) * 100;

        if (this.progress) {

            this.progress.style.width =

                percent + "%";

        }

        if (this.counter) {

            this.counter.innerHTML =

                "💎 Dark Crystals : " +

                this.crystalsFound +

                " / " +

                this.totalCrystals;

        }

    },

    /* ==========================================
       RESET CRYSTALS
    ========================================== */

    resetCrystals() {

        this.crystalsFound = 0;

        this.updateProgress();

        this.crystals.forEach((crystal) => {

            crystal.classList.remove(

                "collected"

            );

            crystal.style.opacity = "1";

            crystal.style.pointerEvents =

                "auto";

            crystal.style.transform =

                "scale(1)";

        });

    },

    /* ==========================================
       RANDOM THUNDER
    ========================================== */

    randomThunder() {

        const delay =

            Math.random() * 8000 + 6000;

        setTimeout(() => {

            this.flashScreen();

            this.playSound(

                this.thunderSound

            );

            this.randomThunder();

        }, delay);

    },
       /* ==========================================
       OPEN ANCIENT GATE
    ========================================== */

    openGate() {

        this.showMessage(

            "The Ancient Gate is opening..."

        );

        this.flashScreen();

        this.shakeScreen(1200);

        this.playSound(this.thunderSound);

        setTimeout(() => {

            this.playSound(this.gateSound);

            if (this.gate) {

                this.gate.classList.add("open");

            }

        }, 500);

        setTimeout(() => {

            this.activatePortal();

        }, 2500);

    },

    /* ==========================================
       PORTAL ACTIVATION
    ========================================== */

    activatePortal() {

        this.showMessage(

            "A mysterious portal has appeared..."

        );

        if (this.portal) {

            this.portal.classList.add("active");

        }

        this.playSound(this.portalSound);

        this.flashScreen();

        setTimeout(() => {

            this.showDracula();

        }, 3000);

    },

    /* ==========================================
       DRACULA APPEARS
    ========================================== */

    showDracula() {

        this.showMessage(

            "Dracula has awakened..."

        );

        if (this.dracula) {

            this.dracula.classList.add("active");

        }

        this.playSound(this.draculaLaugh);

        this.playSound(this.batSound);

        this.flashScreen();

        this.shakeScreen(1800);

        setTimeout(() => {

            this.spawnBats();

        }, 500);

        setTimeout(() => {

            this.completeMission();

        }, 4500);

    },

    /* ==========================================
       BAT ATTACK
    ========================================== */

    spawnBats() {

        const bats =

        document.querySelectorAll(".bat");

        bats.forEach((bat,index)=>{

            bat.style.opacity="1";

            bat.style.transition=

            "transform 3s linear";

            setTimeout(()=>{

                bat.style.transform=

                "translateX(900px) translateY(-120px)";

            },index*200);

        });

    },

    /* ==========================================
       MISSION COMPLETE
    ========================================== */

    completeMission() {

        this.showMessage(

            "Mission Complete!"

        );

        this.playSound(

            this.missionSound

        );

        setTimeout(()=>{

            if(this.missionComplete){

                this.missionComplete

                .classList.add("show");

            }

        },1200);

    },
       /* ==========================================
       CREATE MAGIC PARTICLES
    ========================================== */

    createParticles() {

        const container =
            document.getElementById("particleContainer");

        if (!container) return;

        for (let i = 0; i < 40; i++) {

            const particle =
                document.createElement("div");

            particle.className = "particle";

            particle.style.left =
                Math.random() * 100 + "%";

            particle.style.top =
                Math.random() * 100 + "%";

            particle.style.animationDelay =
                Math.random() * 6 + "s";

            particle.style.animationDuration =
                (4 + Math.random() * 5) + "s";

            container.appendChild(particle);

        }

    },

    /* ==========================================
       RANDOM LIGHTNING
    ========================================== */

    startLightning() {

        const lightningLoop = () => {

            const delay =
                Math.random() * 9000 + 6000;

            setTimeout(() => {

                this.flashScreen();

                this.playSound(this.thunderSound);

                lightningLoop();

            }, delay);

        };

        lightningLoop();

    },

    /* ==========================================
       RESTART GAME
    ========================================== */

    restartGame() {

        this.crystalsFound = 0;

        this.playerX = 8;

        this.playerY = 10;

        if (this.player) {

            this.player.style.left = "8%";
            this.player.style.bottom = "10%";

        }

        this.resetCrystals();

        if (this.portal) {

            this.portal.classList.remove("active");

        }

        if (this.gate) {

            this.gate.classList.remove("open");

        }

        if (this.dracula) {

            this.dracula.classList.remove("active");

        }

        if (this.missionComplete) {

            this.missionComplete.classList.remove("show");

        }

        this.showMessage(

            "Collect all 5 Dark Crystals."

        );

    }

};

/* ==========================================
START GAME
========================================== */

document.addEventListener(

    "DOMContentLoaded",

    () => {

        Game.init();

        Game.createParticles();

        Game.startLightning();

    }

);
