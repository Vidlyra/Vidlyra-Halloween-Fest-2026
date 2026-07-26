/* ==========================================================
   VIDLYRA HALLOWEEN FEST 2026
   DAY 5 - THE HAUNTED CEMETERY
   INTRO VIDEO
========================================================== */

"use strict";

const Intro = {

    /* ======================================================
       ELEMENTS
    ====================================================== */

    video:null,

    bgMusic:null,
    ghostWhisper:null,
    ghostAppear:null,
    ghostKing:null,
    thunder:null,
    spiritLight:null,
    battleMusic:null,

    loading:null,

    title:null,
    subtitle:null,
    progress:null,

    flash:null,
    fade:null,

    skipButton:null,

    enterContainer:null,
    enterButton:null,

    particleContainer:null,

    /* ======================================================
       TIMERS
    ====================================================== */

    whisperTimer:null,

    lightningTimer:null,

    /* ======================================================
       FLAGS
    ====================================================== */

    kingTriggered:false,

    introFinished:false,

    /* ======================================================
       START
    ====================================================== */

    init(){

        this.cache();

        this.bindEvents();

        this.prepareVideo();

        this.startParticles();

        this.startGhostWhispers();

        this.startLightning();

    },

    /* ======================================================
       CACHE
    ====================================================== */

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

        this.spiritLight =
        document.getElementById("spiritLight");

        this.thunder =
        document.getElementById("thunder");

        this.battleMusic =
        document.getElementById("battleMusic");

        this.loading =
        document.getElementById("loadingScreen");

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

    /* ======================================================
       AUDIO
    ====================================================== */

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

    /* ======================================================
       VIDEO
    ====================================================== */

    prepareVideo(){

        if(!this.video) return;

        this.video.muted = true;

        this.video.playsInline = true;

        this.video.addEventListener("loadeddata",()=>{

            if(this.loading){

                this.loading.style.opacity="0";

                setTimeout(()=>{

                    this.loading.style.display="none";

                },600);

            }

        });

        this.video.play().catch(()=>{});

        if(this.bgMusic){

            this.bgMusic.volume=.35;

            this.bgMusic.play().catch(()=>{});

        }

    },

    /* ======================================================
       EVENTS
    ====================================================== */

    bindEvents(){

        if(this.skipButton){

            this.skipButton.addEventListener("click",()=>{

                window.location.href="day5-game.html";

            });

        }

        if(this.enterButton){

            this.enterButton.addEventListener("click",()=>{

                window.location.href="day5-game.html";

            });

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
       /* ======================================================
       PROGRESS BAR
    ====================================================== */

    updateProgress(){

        if(!this.video) return;

        if(!this.video.duration) return;

        const percent =

        (this.video.currentTime /

        this.video.duration) * 100;

        if(this.progress){

            this.progress.style.width =

            percent + "%";

        }

    },

    /* ======================================================
       SUBTITLE
    ====================================================== */

    setSubtitle(text){

        if(!this.subtitle) return;

        if(this.subtitle.textContent !== text){

            this.subtitle.textContent = text;

        }

    },

    /* ======================================================
       VIDEO TIMELINE
    ====================================================== */

    updateTimeline(){

        if(!this.video) return;

        this.updateProgress();

        const t = this.video.currentTime;

        /* -----------------------------
           PHASE 1
        ------------------------------ */

        if(t >= 0 && t < 8){

            this.phaseOne();

        }

        /* -----------------------------
           PHASE 2
        ------------------------------ */

        if(t >= 8 && t < 16){

            this.phaseTwo();

        }

        /* -----------------------------
           PHASE 3
        ------------------------------ */

        if(t >= 16){

            this.phaseThree();

        }

    },

    /* ======================================================
       PHASE ONE
    ====================================================== */

    phaseOne(){

        this.setSubtitle(

            "The Forgotten Cemetery awakens..."

        );

    },

    /* ======================================================
       PHASE TWO
    ====================================================== */

    phaseTwo(){

        this.setSubtitle(

            "Ancient spirits roam these sacred graves..."

        );

        if(!this.kingTriggered){

            this.kingTriggered = true;

            this.ghostKingReveal();

        }

    },

    /* ======================================================
       PHASE THREE
    ====================================================== */

    phaseThree(){

        this.setSubtitle(

            "The Ghost King has sensed your arrival..."

        );

    },

    /* ======================================================
       LIGHTNING
    ====================================================== */

    lightning(){

        if(!this.flash) return;

        this.flash.classList.add("active");

        this.play(this.thunder);

        setTimeout(()=>{

            this.flash.classList.remove("active");

        },450);

    },

    startLightning(){

        if(this.lightningTimer) return;

        this.lightningTimer =

        setInterval(()=>{

            if(!this.video) return;

            if(this.video.paused) return;

            this.lightning();

        },7000);

    },

    /* ======================================================
       RANDOM GHOST WHISPERS
    ====================================================== */

    startGhostWhispers(){

        if(this.whisperTimer) return;

        this.whisperTimer =

        setInterval(()=>{

            if(!this.video) return;

            if(this.video.paused) return;

            if(Math.random() > 0.45){

                this.play(

                    this.ghostWhisper

                );

            }

        },9000);

    },

    /* ======================================================
       GHOST KING
    ====================================================== */

    ghostKingReveal(){

        this.play(

            this.ghostAppear

        );

        setTimeout(()=>{

            this.play(

                this.ghostKing

            );

            this.startBossMusic();

        },1000);

    },

    /* ======================================================
       BOSS MUSIC
    ====================================================== */

    startBossMusic(){

        if(!this.battleMusic) return;

        this.battleMusic.volume = .55;

        this.battleMusic.play().catch(()=>{});

    },
       /* ======================================================
       PARTICLES
    ====================================================== */

    startParticles(){

        if(!this.particleContainer) return;

        this.particleContainer.innerHTML = "";

        for(let i=0;i<70;i++){

            const particle =

            document.createElement("div");

            particle.className = "particle";

            particle.style.left =
            Math.random()*100 + "%";

            particle.style.top =
            Math.random()*100 + "%";

            particle.style.animationDelay =
            Math.random()*8 + "s";

            particle.style.animationDuration =
            (5 + Math.random()*8) + "s";

            particle.style.opacity =
            Math.random().toFixed(2);

            particle.style.transform =
            `scale(${0.4 + Math.random()})`;

            this.particleContainer.appendChild(

                particle

            );

        }

    },

    /* ======================================================
       ENTER SCREEN
    ====================================================== */

    showEnterScreen(){

        if(!this.enterContainer) return;

        this.enterContainer.classList.add(

            "show"

        );

    },

    /* ======================================================
       FINISH INTRO
    ====================================================== */

    finishIntro(){

        if(this.introFinished) return;

        this.introFinished = true;

        if(this.bgMusic){

            this.bgMusic.pause();

        }

        if(this.fade){

            this.fade.classList.add(

                "show"

            );

        }

        setTimeout(()=>{

            this.showEnterScreen();

        },700);

    },

    /* ======================================================
       AUTO ENTER
       (Optional)
    ====================================================== */

    autoEnter(){

        setTimeout(()=>{

            window.location.href =

            "day5-game.html";

        },3000);

    },

    /* ======================================================
       LOADING SCREEN
    ====================================================== */

    hideLoading(){

        if(!this.loading) return;

        this.loading.style.opacity = "0";

        setTimeout(()=>{

            this.loading.style.display =

            "none";

        },600);

    },

    /* ======================================================
       PAUSE
    ====================================================== */

    pauseVideo(){

        if(this.video){

            this.video.pause();

        }

    },

    /* ======================================================
       PLAY
    ====================================================== */

    playVideo(){

        if(this.video){

            this.video.play().catch(()=>{});

        }

    },
       /* ======================================================
       DESTROY
    ====================================================== */

    destroy(){

        /* Stop Audio */

        this.stop(this.bgMusic);

        this.stop(this.ghostWhisper);

        this.stop(this.ghostAppear);

        this.stop(this.ghostKing);

        this.stop(this.spiritLight);

        this.stop(this.thunder);

        this.stop(this.battleMusic);

        /* Stop Video */

        if(this.video){

            this.video.pause();

        }

        /* Clear Timers */

        if(this.whisperTimer){

            clearInterval(

                this.whisperTimer

            );

            this.whisperTimer = null;

        }

        if(this.lightningTimer){

            clearInterval(

                this.lightningTimer

            );

            this.lightningTimer = null;

        }

        /* Remove Particles */

        if(this.particleContainer){

            this.particleContainer.innerHTML = "";

        }

    }

};

/* ==========================================================
   PAGE EVENTS
========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        Intro.init();

    }

);

/* ==========================================================
   CLEANUP
========================================================== */

window.addEventListener(

    "beforeunload",

    ()=>{

        Intro.destroy();

    }

);

/* ==========================================================
   TAB VISIBILITY
========================================================== */

document.addEventListener(

    "visibilitychange",

    ()=>{

        if(document.hidden){

            Intro.pauseVideo();

        }else{

            Intro.playVideo();

        }

    }

);

/* ==========================================================
   KEYBOARD SHORTCUTS
========================================================== */

document.addEventListener(

    "keydown",

    (event)=>{

        switch(event.key){

            case "Escape":

                window.location.href =

                "day5-game.html";

                break;

            case " ":

                event.preventDefault();

                if(Intro.video){

                    if(Intro.video.paused){

                        Intro.playVideo();

                    }else{

                        Intro.pauseVideo();

                    }

                }

                break;

        }

    }

);

/* ==========================================================
   END OF FILE
========================================================== */
