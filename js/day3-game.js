/* ==========================================================
   VIDLYRA HALLOWEEN FEST 2026
   DAY 3 - THE CURSED FOREST
========================================================== */

"use strict";

const Game = {

    crystalsFound:0,

    totalCrystals:5,

    playerX:8,

    playerY:10,

    speed:1,

    keys:{},

    init(){

        this.cache();

        this.bindEvents();

        this.start();

    },

    cache(){

        /* Player */

        this.player =
        document.getElementById("player");

        /* Crystals */

        this.crystals =
        document.querySelectorAll(".crystal");

        /* UI */

        this.progress =
        document.getElementById("progressFill");

        this.counter =
        document.getElementById("crystalCounter");

        this.dialog =
        document.getElementById("dialogText");

        this.dialogBox =
        document.getElementById("dialogBox");

        this.intro =
        document.getElementById("introScreen");

        /* Objects */

        this.gate =
        document.querySelector(".gate");

        this.portal =
        document.querySelector(".portal");

        this.dracula =
        document.querySelector(".dracula");

        this.flash =
        document.getElementById("flash");

        this.missionComplete =
        document.getElementById("missionComplete");

        this.nextBtn =
        document.getElementById("nextBtn");

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

    bindEvents(){

        /* Crystal Click */

        this.crystals.forEach(crystal=>{

            crystal.addEventListener(

                "click",

                ()=>this.collectCrystal(crystal)

            );

        });

        /* Keyboard */

        document.addEventListener(

            "keydown",

            (e)=>{

                this.keys[e.key]=true;

            }

        );

        document.addEventListener(

            "keyup",

            (e)=>{

                this.keys[e.key]=false;

            }

        );

        /* Continue */

        if(this.nextBtn){

            this.nextBtn.addEventListener(

                "click",

                ()=>{

                    window.location.href="day4-video.html";

                }

            );

        }

    },

    start(){

        console.log("Day 3 Started");

        /* Music */

        if(this.bgMusic){

            this.bgMusic.volume=.35;

            this.bgMusic.play().catch(()=>{});

        }

        if(this.rainSound){

            this.rainSound.volume=.25;

            this.rainSound.play().catch(()=>{});

        }

        /* Intro */

        setTimeout(()=>{

            if(this.intro){

                this.intro.classList.add("hide");

            }

        },5000);

        /* Movement Loop */

        this.movePlayer();

    },
      /* ==========================================
       PLAYER MOVEMENT
    ========================================== */

    movePlayer(){

        const update = ()=>{

            if(this.keys["ArrowLeft"] || this.keys["a"]){

                this.playerX -= this.speed;

            }

            if(this.keys["ArrowRight"] || this.keys["d"]){

                this.playerX += this.speed;

            }

            if(this.keys["ArrowUp"] || this.keys["w"]){

                this.playerY += this.speed;

            }

            if(this.keys["ArrowDown"] || this.keys["s"]){

                this.playerY -= this.speed;

            }

            /* Limit movement */

            this.playerX = Math.max(2, Math.min(95, this.playerX));

            this.playerY = Math.max(5, Math.min(85, this.playerY));

            if(this.player){

                this.player.style.left = this.playerX + "%";

                this.player.style.bottom = this.playerY + "%";

            }

            requestAnimationFrame(update);

        };

        update();

    },

    /* ==========================================
       COLLECT CRYSTAL
    ========================================== */

    collectCrystal(crystal){

        if(crystal.classList.contains("collected")){

            return;

        }

        crystal.classList.add("collected");

        this.crystalsFound++;

        /* Progress */

        const percent =

        (this.crystalsFound / this.totalCrystals) * 100;

        if(this.progress){

            this.progress.style.width = percent + "%";

        }

        /* Counter */

        if(this.counter){

            this.counter.innerHTML =

            "💎 Dark Crystals : " +

            this.crystalsFound +

            " / " +

            this.totalCrystals;

        }

        /* Sound */

        if(this.crystalSound){

            this.crystalSound.currentTime = 0;

            this.crystalSound.play().catch(()=>{});

        }

        /* Dialog */

        this.showMessage(

            "Dark Crystal Collected!"

        );

        /* Effects */

        crystal.style.pointerEvents = "none";

        crystal.style.opacity = "0";

        crystal.style.transform =

        "scale(2)";

        /* Finished */

        if(this.crystalsFound === this.totalCrystals){

            setTimeout(()=>{

                this.openGate();

            },1500);

        }

    },

    /* ==========================================
       DIALOG
    ========================================== */

    showMessage(text){

        if(!this.dialogBox || !this.dialog){

            return;

        }

        this.dialog.innerHTML = text;

        this.dialogBox.classList.add("show");

        setTimeout(()=>{

            this.dialogBox.classList.remove("show");

        },2500);

    },
      /* ==========================================
       OPEN GATE
    ========================================== */

    openGate(){

        this.showMessage(

            "The Ancient Gate is opening..."

        );

        /* Lightning */

        if(this.flash){

            this.flash.classList.add("active");

            setTimeout(()=>{

                this.flash.classList.remove("active");

            },500);

        }

        /* Screen Shake */

        document.body.classList.add("shake");

        setTimeout(()=>{

            document.body.classList.remove("shake");

        },1000);

        /* Thunder */

        if(this.thunderSound){

            this.thunderSound.currentTime=0;

            this.thunderSound.play().catch(()=>{});

        }

        /* Gate */

        if(this.gate){

            this.gate.classList.add("open");

        }

        /* Gate Sound */

        if(this.gateSound){

            setTimeout(()=>{

                this.gateSound.play().catch(()=>{});

            },600);

        }

        /* Portal */

        setTimeout(()=>{

            this.activatePortal();

        },2000);

    },

    /* ==========================================
       PORTAL
    ========================================== */

    activatePortal(){

        this.showMessage(

            "A mysterious portal has appeared..."

        );

        if(this.portal){

            this.portal.classList.add("active");

        }

        if(this.portalSound){

            this.portalSound.currentTime=0;

            this.portalSound.play().catch(()=>{});

        }

        setTimeout(()=>{

            this.showDracula();

        },2500);

    },

    /* ==========================================
       DRACULA
    ========================================== */

    showDracula(){

        this.showMessage(

            "Dracula has awakened!"

        );

        if(this.dracula){

            this.dracula.classList.add("active");

        }

        if(this.draculaLaugh){

            this.draculaLaugh.currentTime=0;

            this.draculaLaugh.play().catch(()=>{});

        }

        if(this.batSound){

            this.batSound.currentTime=0;

            this.batSound.play().catch(()=>{});

        }

        document.body.classList.add("shake");

        setTimeout(()=>{

            document.body.classList.remove("shake");

        },1500);

        setTimeout(()=>{

            this.completeMission();

        },4000);

    },

    /* ==========================================
       COMPLETE
    ========================================== */

    completeMission(){

        this.showMessage(

            "Mission Complete!"

        );

        if(this.missionSound){

            this.missionSound.currentTime=0;

            this.missionSound.play().catch(()=>{});

        }

        if(this.missionComplete){

            this.missionComplete.classList.add("show");

        }

    }

};

/* ==========================================
START GAME
========================================== */

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        Game.init();

    }

);
