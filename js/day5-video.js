/* ==========================================================
   VIDLYRA HALLOWEEN FEST 2026
   DAY 5 - VIDEO INTRO
========================================================== */

"use strict";

const Intro = {

    /* ==========================================
       CACHE
    ========================================== */

    video: null,
    bgMusic: null,
    ghostWhisper: null,
    ghostAppear: null,
    ghostKing: null,
    thunder: null,
    battleMusic: null,

    title: null,
    subtitle: null,
    progress: null,
    flash: null,
    fade: null,

    skipButton: null,
    enterContainer: null,
    enterButton: null,

    particleContainer: null,

    /* ==========================================
       INIT
    ========================================== */

    init(){

        this.cache();

        this.bindEvents();

        this.startVideo();

        this.startParticles();

        this.randomGhostWhispers();

    },

    /* ==========================================
       CACHE ELEMENTS
    ========================================== */

    cache(){

        this.video =
        document.getElementById("introVideo");

        this.bgMusic =
        document.getElementById("bgMusic");

        this.ghostWhisper =
        document.getElementById("ghostWhisper");

        this.ghostAppear =
        document.getElementById("ghostAppear");

        this.ghostKing =
        document.getElementById("ghostKing");

        this.thunder =
        document.getElementById("thunder");

        this.battleMusic =
        document.getElementById("battleMusic");

        this.subtitle =
        document.getElementById("storyLine");

        this.progress =
        document.getElementById("videoFill");

        this.flash =
        document.getElementById("lightningFlash");

        this.fade =
        document.getElementById("fadeScreen");

        this.skipButton =
        document.getElementById("skipButton");

        this.enterContainer =
        document.getElementById("enterContainer");

        this.enterButton =
        document.getElementById("enterButton");

        this.particleContainer =
        document.getElementById("particleContainer");

    },
      /* ==========================================
       START
    ========================================== */

    startVideo(){

        if(this.bgMusic){

            this.bgMusic.volume = 0.35;

            this.bgMusic.play().catch(()=>{});

        }

        if(this.video){

            this.video.play().catch(()=>{});

        }

    },

    /* ==========================================
       EVENTS
    ========================================== */

    bindEvents(){

        if(this.skipButton){

            this.skipButton.addEventListener(

                "click",

                ()=>{

                    window.location.href="day5-game.html";

                }

            );

        }

        if(this.enterButton){

            this.enterButton.addEventListener(

                "click",

                ()=>{

                    window.location.href="day5-game.html";

                }

            );

        }

        if(this.video){

            this.video.addEventListener(

                "timeupdate",

                ()=>{

                    this.updateTimeline();

                }

            );

            this.video.addEventListener(

                "ended",

                ()=>{

                    this.finishIntro();

                }

            );

        }

    },
      /* ==========================================
       AUDIO HELPER
    ========================================== */

    play(audio){

        if(!audio) return;

        audio.currentTime = 0;

        audio.play().catch(()=>{});

    },

    stop(audio){

        if(!audio) return;

        audio.pause();

        audio.currentTime = 0;

    },
      /* ==========================================
       PROGRESS BAR
    ========================================== */

    updateProgress(){

        if(!this.video) return;

        const percent =

        (this.video.currentTime/

        this.video.duration)*100;

        if(this.progress){

            this.progress.style.width =

            percent + "%";

        }

    },
      /* ==========================================
       VIDEO TIMELINE
    ========================================== */

    updateTimeline(){

        this.updateProgress();

        if(!this.video) return;

        const t = this.video.currentTime;

        /* ----------------------------------
           PHASE 1 (0-8s)
        ----------------------------------- */

        if(t >= 0 && t < 8){

            this.phaseOne();

        }

        /* ----------------------------------
           PHASE 2 (8-16s)
        ----------------------------------- */

        if(t >= 8 && t < 16){

            this.phaseTwo();

        }

        /* ----------------------------------
           PHASE 3 (16-24s)
        ----------------------------------- */

        if(t >= 16){

            this.phaseThree();

        }

    },

    /* ==========================================
       PHASE 1
    ========================================== */

    phaseOne(){

        this.subtitle.innerHTML =

        "The Forgotten Cemetery awakens...";

    },

    /* ==========================================
       PHASE 2
    ========================================== */

    phaseTwo(){

        this.subtitle.innerHTML =

        "Ancient spirits roam these sacred graves...";

    },

    /* ==========================================
       PHASE 3
    ========================================== */

    phaseThree(){

        this.subtitle.innerHTML =

        "The Ghost King has sensed your arrival...";

    },
      /* ==========================================
       RANDOM GHOST WHISPERS
    ========================================== */

    randomGhostWhispers(){

        setInterval(()=>{

            if(this.video.paused) return;

            if(Math.random() > .45){

                this.play(this.ghostWhisper);

            }

        },9000);

    },
      /* ==========================================
       RANDOM LIGHTNING
    ========================================== */

    lightning(){

        this.flash.classList.add("active");

        this.play(this.thunder);

        setTimeout(()=>{

            this.flash.classList.remove("active");

        },450);

    },

    startLightning(){

        setInterval(()=>{

            if(this.video.paused) return;

            this.lightning();

        },7000);

    },
      /* ==========================================
       GHOST KING APPEAR
    ========================================== */

    ghostKingReveal(){

        this.play(this.ghostAppear);

        setTimeout(()=>{

            this.play(this.ghostKing);

        },1000);

    },
      /* ==========================================
       START BOSS MUSIC
    ========================================== */

    startBossMusic(){

        if(!this.battleMusic) return;

        this.battleMusic.volume = .55;

        this.battleMusic.play().catch(()=>{});

    },
      /* ==========================================
       CREATE PARTICLES
    ========================================== */

    startParticles(){

        if(!this.particleContainer) return;

        for(let i=0;i<70;i++){

            const p=document.createElement("div");

            p.className="particle";

            p.style.left=Math.random()*100+"%";

            p.style.top=Math.random()*100+"%";

            p.style.animationDelay=
            Math.random()*8+"s";

            p.style.animationDuration=
            (5+Math.random()*8)+"s";

            p.style.opacity=
            Math.random();

            this.particleContainer.appendChild(p);

        }

    },

    /* ==========================================
       FINISH INTRO
    ========================================== */

    finishIntro(){

        if(this.bgMusic){

            this.bgMusic.pause();

        }

        this.fade.classList.add("show");

        setTimeout(()=>{

            this.enterContainer.classList.add("show");

        },700);

    },
      /* ==========================================
       AUTO REDIRECT
    ========================================== */

    autoEnter(){

        setTimeout(()=>{

            window.location.href=
            "day5-game.html";

        },3000);

    },

    /* ==========================================
       DESTROY
    ========================================== */

    destroy(){

        this.stop(this.bgMusic);

        this.stop(this.ghostWhisper);

        this.stop(this.ghostAppear);

        this.stop(this.ghostKing);

        this.stop(this.battleMusic);

    }

};

/* ==========================================
START
========================================== */

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        Intro.init();

        Intro.startLightning();

    }

);
