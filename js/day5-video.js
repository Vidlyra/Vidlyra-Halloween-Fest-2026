/* ==========================================================
   VIDLYRA HALLOWEEN FEST 2026
   DAY 5 VIDEO INTRO
========================================================== */

"use strict";

const Intro = {

    video:null,

    progress:null,

    subtitle:null,

    loadingScreen:null,

    loadingFill:null,

    fadeScreen:null,

    endOverlay:null,

    skipButton:null,

    enterButton:null,

    lightning:null,

    loaded:false,

    init(){

        this.cache();

        this.bindEvents();

        this.fakeLoading();

    },

    cache(){

        this.video=document.getElementById("introVideo");

        this.progress=document.getElementById("videoFill");

        this.subtitle=document.getElementById("storySubtitle");

        this.loadingScreen=document.getElementById("loadingScreen");

        this.loadingFill=document.getElementById("loadingFill");

        this.fadeScreen=document.getElementById("fadeScreen");

        this.endOverlay=document.getElementById("endOverlay");

        this.skipButton=document.getElementById("skipButton");

        this.enterButton=document.getElementById("enterButton");

        this.lightning=document.getElementById("lightningFlash");

    },

    bindEvents(){

        this.video.addEventListener(

            "timeupdate",

            ()=>{

                this.updateProgress();

                this.updateSubtitle();

            }

        );

        this.video.addEventListener(

            "ended",

            ()=>{

                this.finishVideo();

            }

        );

        this.skipButton.addEventListener(

            "click",

            ()=>{

                this.skip();

            }

        );

        this.enterButton.addEventListener(

            "click",

            ()=>{

                this.enter();

            }

        );

    },
      /* ==========================================
       LOADING
    ========================================== */

    fakeLoading(){

        let value = 0;

        const loader = setInterval(()=>{

            value += 2;

            if(this.loadingFill){

                this.loadingFill.style.width =

                value + "%";

            }

            if(value >= 100){

                clearInterval(loader);

                this.startVideo();

            }

        },30);

    },

    /* ==========================================
       START VIDEO
    ========================================== */

    startVideo(){

        if(this.loadingScreen){

            this.loadingScreen.classList.add(

                "hide"

            );

        }

        if(this.video){

            this.video.play().catch(()=>{

                console.log(

                    "Autoplay blocked."

                );

            });

        }

    },

    /* ==========================================
       PROGRESS BAR
    ========================================== */

    updateProgress(){

        if(!this.video.duration) return;

        const percent =

        (this.video.currentTime /

        this.video.duration) * 100;

        this.progress.style.width =

        percent + "%";

    },

    /* ==========================================
       SUBTITLE TIMELINE
    ========================================== */

    updateSubtitle(){

        const t = this.video.currentTime;

        if(t < 4){

            this.subtitle.textContent =

            "The cemetery sleeps...";

        }

        else if(t < 8){

            this.subtitle.textContent =

            "Ancient spirits begin to awaken...";

        }

        else if(t < 12){

            this.subtitle.textContent =

            "Seven Spirit Lanterns have faded...";

        }

        else if(t < 16){

            this.subtitle.textContent =

            "Darkness spreads through every grave...";

        }

        else if(t < 20){

            this.subtitle.textContent =

            "The Ghost King has awakened...";

        }

        else{

            this.subtitle.textContent =

            "Prepare to enter the Haunted Cemetery...";

        }

    },
      /* ==========================================
       RANDOM LIGHTNING
    ========================================== */

    startLightning(){

        this.lightningTimer = setInterval(()=>{

            if(!this.video) return;

            if(this.video.paused) return;

            this.flashLightning();

        },7000);

    },

    flashLightning(){

        if(!this.lightning) return;

        this.lightning.classList.add(

            "active"

        );

        setTimeout(()=>{

            this.lightning.classList.remove(

                "active"

            );

        },450);

    },

    /* ==========================================
       VIDEO END
    ========================================== */

    finishVideo(){

        if(this.fadeScreen){

            this.fadeScreen.classList.add(

                "show"

            );

        }

        setTimeout(()=>{

            if(this.fadeScreen){

                this.fadeScreen.classList.remove(

                    "show"

                );

            }

            if(this.endOverlay){

                this.endOverlay.classList.add(

                    "show"

                );

            }

        },800);

    },

    /* ==========================================
       SKIP INTRO
    ========================================== */

    skip(){

        if(this.video){

            this.video.pause();

        }

        window.location.href =

        "day5-game.html";

    },

    /* ==========================================
       ENTER GAME
    ========================================== */

    enter(){

        window.location.href =

        "day5-game.html";

    },
      /* ==========================================
       TAB VISIBILITY
    ========================================== */

    handleVisibility(){

        if(document.hidden){

            if(this.video){

                this.video.pause();

            }

        }

        else{

            if(this.video &&
               !this.endOverlay.classList.contains("show")){

                this.video.play().catch(()=>{});

            }

        }

    },

    /* ==========================================
       VIDEO ERROR
    ========================================== */

    handleVideoError(){

        console.error(

            "Unable to load day5-intro.mp4"

        );

        alert(

            "The Day 5 cinematic could not be loaded."

        );

    },

    /* ==========================================
       KEYBOARD SHORTCUTS
    ========================================== */

    handleKeyboard(event){

        switch(event.code){

            case "Space":

                event.preventDefault();

                if(this.video.paused){

                    this.video.play().catch(()=>{});

                }

                else{

                    this.video.pause();

                }

            break;

            case "Enter":

                if(this.endOverlay.classList.contains("show")){

                    this.enter();

                }

            break;

            case "Escape":

                this.skip();

            break;

        }

    },

    /* ==========================================
       REGISTER GLOBAL EVENTS
    ========================================== */

    registerGlobalEvents(){

        document.addEventListener(

            "visibilitychange",

            ()=>{

                this.handleVisibility();

            }

        );

        document.addEventListener(

            "keydown",

            (event)=>{

                this.handleKeyboard(event);

            }

        );

        this.video.addEventListener(

            "error",

            ()=>{

                this.handleVideoError();

            }

        );

    },
      /* ==========================================
       DESTROY
    ========================================== */

    destroy(){

        if(this.lightningTimer){

            clearInterval(this.lightningTimer);

        }

        if(this.video){

            this.video.pause();

            this.video.currentTime = 0;

        }

    },

    /* ==========================================
       START EVERYTHING
    ========================================== */

    start(){

        this.startLightning();

        this.registerGlobalEvents();

    }

};

/* ==========================================
START INTRO
========================================== */

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        Intro.init();

        Intro.start();

    }

);

/* ==========================================
WINDOW UNLOAD
========================================== */

window.addEventListener(

    "beforeunload",

    ()=>{

        Intro.destroy();

    }

);
