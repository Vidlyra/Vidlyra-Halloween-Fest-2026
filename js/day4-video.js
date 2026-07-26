/* ==========================================================
   VIDLYRA HALLOWEEN FEST 2026
   DAY 4 VIDEO
========================================================== */

"use strict";

const Video = {

    init() {

        this.cache();

        this.bindEvents();

        this.createParticles();

    },

    /* ==========================================
       CACHE ELEMENTS
    ========================================== */

    cache() {

        this.startScreen =
            document.getElementById("startScreen");

        this.startBtn =
            document.getElementById("startBtn");

        this.video =
            document.getElementById("introVideo");

        this.skipBtn =
            document.getElementById("skipBtn");

        this.overlay =
            document.getElementById("videoOverlay");

        this.enterGame =
            document.getElementById("enterGame");

        this.lightning =
            document.getElementById("lightning");

        this.fog =
            document.getElementById("fogLayer");

        this.witch =
            document.getElementById("witchShadow");

        this.particles =
            document.getElementById("magicParticles");

        /* AUDIO */

        this.bgMusic =
            document.getElementById("bgMusic");

        this.thunder =
            document.getElementById("thunderSound");

        this.witchLaugh =
            document.getElementById("witchLaugh");

    },

    /* ==========================================
       EVENTS
    ========================================== */

    bindEvents() {

        if(this.startBtn){

            this.startBtn.addEventListener(

                "click",

                ()=>this.startVideo()

            );

        }

        if(this.skipBtn){

            this.skipBtn.addEventListener(

                "click",

                ()=>this.finishVideo()

            );

        }

        if(this.video){

            this.video.addEventListener(

                "ended",

                ()=>this.finishVideo()

            );

        }

        if(this.enterGame){

            this.enterGame.addEventListener(

                "click",

                ()=>{

                    window.location.href=

                    "day4-game.html";

                }

            );

        }

    },

    /* ==========================================
       START VIDEO
    ========================================== */

    startVideo(){

        this.startScreen.classList.add("hide");

        this.video.style.display="block";

        this.video.play();

        this.bgMusic.volume=.35;

        this.bgMusic.play().catch(()=>{});

        this.startLightning();

        this.showWitch();

    },
      /* ==========================================
       FINISH VIDEO
    ========================================== */

    finishVideo() {

        if (this.video) {

            this.video.pause();

            this.video.currentTime = 0;

        }

        if (this.overlay) {

            this.overlay.classList.add("show");

        }

    },

    /* ==========================================
       RANDOM LIGHTNING
    ========================================== */

    startLightning() {

        const flash = () => {

            const delay =

                Math.random() * 5000 + 3000;

            setTimeout(() => {

                if (this.lightning) {

                    this.lightning.classList.add("flash");

                    setTimeout(() => {

                        this.lightning.classList.remove("flash");

                    }, 450);

                }

                if (this.thunder) {

                    this.thunder.currentTime = 0;

                    this.thunder.play().catch(() => {});

                }

                flash();

            }, delay);

        };

        flash();

    },

    /* ==========================================
       WITCH APPEARS
    ========================================== */

    showWitch() {

        setTimeout(() => {

            if (this.witch) {

                this.witch.classList.add("show");

            }

            if (this.witchLaugh) {

                this.witchLaugh.currentTime = 0;

                this.witchLaugh.play().catch(() => {});

            }

        }, 5000);

    },

    /* ==========================================
       SCREEN FLASH
    ========================================== */

    flashScreen() {

        if (!this.lightning) return;

        this.lightning.classList.add("flash");

        setTimeout(() => {

            this.lightning.classList.remove("flash");

        }, 450);

    },
      /* ==========================================
       MAGIC PARTICLES
    ========================================== */

    createParticles() {

        if (!this.particles) return;

        for (let i = 0; i < 50; i++) {

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

            particle.style.opacity =

                Math.random();

            this.particles.appendChild(particle);

        }

    },

    /* ==========================================
       STOP AUDIO
    ========================================== */

    stopAudio() {

        if (this.bgMusic) {

            this.bgMusic.pause();

            this.bgMusic.currentTime = 0;

        }

        if (this.thunder) {

            this.thunder.pause();

            this.thunder.currentTime = 0;

        }

        if (this.witchLaugh) {

            this.witchLaugh.pause();

            this.witchLaugh.currentTime = 0;

        }

    }

};

/* ==========================================
START
========================================== */

document.addEventListener(

    "DOMContentLoaded",

    () => {

        Video.init();

    }

);
