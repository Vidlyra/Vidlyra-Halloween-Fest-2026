/* ==========================================================
   VIDLYRA HALLOWEEN FEST 2026
   DAY 5 VIDEO INTRO
========================================================== */

"use strict";

const Intro = {

    video:null,

    loadingScreen:null,

    loadingFill:null,

    startOverlay:null,

    startButton:null,

    bgMusic:null,

    thunder:null,

    ghostWhisper:null,

    subtitle:null,

    progress:null,

    lightning:null,

    fadeScreen:null,

    endOverlay:null,

    enterButton:null,

    skipButton:null,

    lightningTimer:null,

    whisperTimer:null,

    init(){

        this.cache();

        this.bindEvents();

        this.fakeLoading();

    },

    cache(){

        this.video=document.getElementById("introVideo");

        this.loadingScreen=document.getElementById("loadingScreen");

        this.loadingFill=document.getElementById("loadingFill");

        this.startOverlay=document.getElementById("startOverlay");

        this.startButton=document.getElementById("startButton");

        this.bgMusic=document.getElementById("bgMusic");

        this.thunder=document.getElementById("thunder");

        this.ghostWhisper=document.getElementById("ghostWhisper");

        this.subtitle=document.getElementById("storySubtitle");

        this.progress=document.getElementById("videoFill");

        this.lightning=document.getElementById("lightningFlash");

        this.fadeScreen=document.getElementById("fadeScreen");

        this.endOverlay=document.getElementById("endOverlay");

        this.enterButton=document.getElementById("enterButton");

        this.skipButton=document.getElementById("skipButton");

    },

    bindEvents(){

        if(this.startButton){

            this.startButton.addEventListener(

                "click",

                ()=>{

                    this.startExperience();

                }

            );

        }

        if(this.skipButton){

            this.skipButton.addEventListener(

                "click",

                ()=>{

                    this.skipIntro();

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

        }

    },

    fakeLoading(){

        let value=0;

        const loader=setInterval(()=>{

            value+=2;

            if(this.loadingFill){

                this.loadingFill.style.width=value+"%";

            }

            if(value>=100){

                clearInterval(loader);

                if(this.loadingScreen){

                    this.loadingScreen.classList.add("hide");

                }

                if(this.startOverlay){

                    this.startOverlay.style.display="flex";

                }else{

                    this.startExperience();

                }

            }

        },30);

    },

    startExperience(){

        if(this.startOverlay){

            this.startOverlay.style.display="none";

        }

        if(this.video){

            this.video.muted=false;

            this.video.volume=1;

            this.video.play().catch(()=>{});

        }

        if(this.bgMusic){

            this.bgMusic.volume=0.35;

            this.bgMusic.play().catch(()=>{});

        }

        this.startLightning();

        this.startGhostWhispers();

    },

    updateProgress(){

        if(!this.video.duration) return;

        const percent=(

            this.video.currentTime/

            this.video.duration

        )*100;

        if(this.progress){

            this.progress.style.width=

            percent+"%";

        }

    },

    updateSubtitle(){

        if(!this.subtitle) return;

        const t=this.video.currentTime;

        if(t<4){

            this.subtitle.textContent=

            "The cemetery sleeps...";

        }

        else if(t<8){

            this.subtitle.textContent=

            "Ancient spirits begin to awaken...";

        }

        else if(t<12){

            this.subtitle.textContent=

            "Seven Spirit Lanterns have faded...";

        }

        else if(t<16){

            this.subtitle.textContent=

            "Darkness spreads across every grave...";

        }

        else if(t<20){

            this.subtitle.textContent=

            "The Ghost King has awakened...";

        }

        else{

            this.subtitle.textContent=

            "Prepare to enter the Haunted Cemetery...";

        }

    },

    playSound(audio){

        if(!audio) return;

        audio.currentTime=0;

        audio.play().catch(()=>{});

    },

    startLightning(){

        this.lightningTimer=setInterval(()=>{

            if(this.video.paused) return;

            this.flashLightning();

        },7000);

    },

    flashLightning(){

        if(!this.lightning) return;

        this.lightning.classList.add("active");

        this.playSound(this.thunder);

        setTimeout(()=>{

            this.lightning.classList.remove("active");

        },450);

    },

    startGhostWhispers(){

        this.whisperTimer=setInterval(()=>{

            if(this.video.paused) return;

            if(Math.random()>0.45){

                this.playSound(this.ghostWhisper);

            }

        },9000);

    },
       /* ==========================================
       VIDEO FINISHED
    ========================================== */

    finishVideo(){

        this.stopEffects();

        if(this.fadeScreen){

            this.fadeScreen.classList.add("show");

        }

        setTimeout(()=>{

            if(this.fadeScreen){

                this.fadeScreen.classList.remove("show");

            }

            if(this.endOverlay){

                this.endOverlay.classList.add("show");

            }

        },800);

    },

    /* ==========================================
       SKIP INTRO
    ========================================== */

    skipIntro(){

        this.stopEffects();

        window.location.href="day5-game.html";

    },

    /* ==========================================
       STOP ALL EFFECTS
    ========================================== */

    stopEffects(){

        if(this.lightningTimer){

            clearInterval(this.lightningTimer);

        }

        if(this.whisperTimer){

            clearInterval(this.whisperTimer);

        }

        if(this.video){

            this.video.pause();

        }

        if(this.bgMusic){

            this.bgMusic.pause();

            this.bgMusic.currentTime=0;

        }

        if(this.thunder){

            this.thunder.pause();

            this.thunder.currentTime=0;

        }

        if(this.ghostWhisper){

            this.ghostWhisper.pause();

            this.ghostWhisper.currentTime=0;

        }

    },

    /* ==========================================
       TAB VISIBILITY
    ========================================== */

    handleVisibility(){

        if(!this.video) return;

        if(document.hidden){

            this.video.pause();

        }else{

            if(!this.endOverlay.classList.contains("show")){

                this.video.play().catch(()=>{});

            }

        }

    },

    /* ==========================================
       KEYBOARD
    ========================================== */

    handleKeyboard(event){

        switch(event.code){

            case "Escape":

                this.skipIntro();

            break;

            case "Space":

                event.preventDefault();

                if(!this.video) return;

                if(this.video.paused){

                    this.video.play().catch(()=>{});

                }else{

                    this.video.pause();

                }

            break;

            case "Enter":

                if(

                    this.endOverlay &&
                    this.endOverlay.classList.contains("show")

                ){

                    window.location.href="day5-game.html";

                }

            break;

        }

    },

    /* ==========================================
       VIDEO ERROR
    ========================================== */

    handleVideoError(){

        alert(

            "Unable to load the Day 5 cinematic video."

        );

    },

    /* ==========================================
       GLOBAL EVENTS
    ========================================== */

    registerEvents(){

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

        if(this.video){

            this.video.addEventListener(

                "error",

                ()=>{

                    this.handleVideoError();

                }

            );

        }

    },

    /* ==========================================
       START SYSTEM
    ========================================== */

    start(){

        this.registerEvents();

    },

    /* ==========================================
       DESTROY
    ========================================== */

    destroy(){

        this.stopEffects();

    }

};

/* ==========================================
   START
========================================== */

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        Intro.init();

        Intro.start();

    }

);

/* ==========================================
   CLEANUP
========================================== */

window.addEventListener(

    "beforeunload",

    ()=>{

        Intro.destroy();

    }

);
