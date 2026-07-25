/* ==========================================
   VIDLYRA HALLOWEEN FEST 2026
   DAY 2 GAME
========================================== */

const Game = {

    runesFound:0,

    totalRunes:3,

    init(){

        this.cache();

        this.bindEvents();

        this.start();

    },

    cache(){

        this.player =
            document.getElementById("player");

        this.runes =
            document.querySelectorAll(".rune");

        this.progress =
            document.getElementById("progressFill");

        this.counter =
            document.getElementById("runeCounter");

        this.dialog =
            document.getElementById("dialogText");

        this.dialogBox =
            document.getElementById("dialogBox");

        this.ghost =
            document.querySelector(".ghost");

        this.crystal =
            document.querySelector(".crystal");

        this.flash =
            document.getElementById("flash");

        this.missionComplete =
            document.getElementById("missionComplete");

        this.nextButton =
            document.getElementById("nextBtn");

        this.intro =
            document.getElementById("introScreen");

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

    bindEvents(){

        this.runes.forEach(rune=>{

            rune.addEventListener(

                "click",

                ()=>this.collectRune(rune)

            );

        });

        if(this.nextButton){

            this.nextButton.addEventListener(

                "click",

                ()=>{

                    window.location.href="day3-video.html";

                }

            );

        }

    },

    start(){

        console.log("Day 2 Loaded");

        if(this.bgMusic){

            this.bgMusic.volume=.35;

            this.bgMusic.play().catch(()=>{});

        }

        setTimeout(()=>{

            if(this.intro){

                this.intro.classList.add("hide");

            }

        },5000);

    },
      collectRune(rune){

        if(rune.classList.contains("found")){

            return;

        }

        rune.classList.add("found");

        rune.style.opacity="0";

        rune.style.pointerEvents="none";

        this.runesFound++;

        const percent=

        (this.runesFound/this.totalRunes)*100;

        this.progress.style.width=

        percent+"%";

        this.counter.innerHTML=

        "🔷 Ancient Runes : "+

        this.runesFound+

        " / 3";

        this.showMessage(

        "Ancient Rune Collected"

        );

        if(this.magicSound){

            this.magicSound.currentTime=0;

            this.magicSound.play();

        }

        if(this.runesFound===3){

            setTimeout(()=>{

                this.awakenWell();

            },1200);

        }

    },
      /* ==========================================
       WELL AWAKENS
    ========================================== */

    awakenWell(){

        this.showMessage(

            "The Haunted Well has awakened..."

        );

        /* Flash */

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

        },1200);

        /* Ghost Whisper */

        if(this.ghostWhisper){

            this.ghostWhisper.currentTime=0;

            this.ghostWhisper.volume=.8;

            this.ghostWhisper.play();

        }

        /* Well Rumble */

        if(this.wellRumble){

            this.wellRumble.currentTime=0;

            this.wellRumble.play();

        }

        /* Ghost Appears */

        if(this.ghost){

            this.ghost.classList.add("active");

        }

        /* Crystal Rises */

        if(this.crystal){

            this.crystal.classList.add("active");

        }

        /* Reward */

        setTimeout(()=>{

            if(this.rewardSound){

                this.rewardSound.play();

            }

            this.showMissionComplete();

        },4000);

    },

    /* ==========================================
       DIALOG
    ========================================== */

    showMessage(text){

        if(!this.dialogBox || !this.dialog) return;

        this.dialog.innerHTML=text;

        this.dialogBox.classList.add("show");

        setTimeout(()=>{

            this.dialogBox.classList.remove("show");

        },2500);

    },

    /* ==========================================
       MISSION COMPLETE
    ========================================== */

    showMissionComplete(){

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
