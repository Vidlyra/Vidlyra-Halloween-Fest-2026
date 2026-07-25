/* ======================================================
   VIDLYRA HALLOWEEN FEST 2026
   DAY 2 - THE HAUNTED WELL
====================================================== */

const Game = {

    /* ==========================================
       GAME STATE
    ========================================== */

    runesFound: 0,

    totalRunes: 3,

    gameStarted: false,

    canMove: false,

    playerSpeed: 8,

    keys: {},

    playerX: 15,

    playerY: 12,

    worldWidth: 100,

    worldHeight: 100,

    /* ==========================================
       INITIALIZE
    ========================================== */

    init() {

        this.cache();

        this.bindEvents();

        this.startIntro();

    },

    /* ==========================================
       CACHE DOM
    ========================================== */

    cache() {

        this.player =
            document.getElementById("player");

        this.playerShadow =
            document.getElementById("playerShadow");

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

        this.ghost =
            document.getElementById("ghost");

        this.crystal =
            document.getElementById("crystal");

        this.flash =
            document.getElementById("flash");

        this.intro =
            document.getElementById("introScreen");

        this.objective =
            document.getElementById("objective");

        this.interaction =
            document.getElementById("interactionPrompt");

        this.missionComplete =
            document.getElementById("missionComplete");

        this.dayComplete =
            document.getElementById("dayComplete");

        this.nextButton =
            document.getElementById("nextBtn");

        this.continueButton =
            document.getElementById("continueDay3");

        /* AUDIO */

        this.bgMusic =
            document.getElementById("bgMusic");

        this.magicSound =
            document.getElementById("magicSound");

        this.rewardSound =
            document.getElementById("rewardSound");

        this.ghostWhisper =
            document.getElementById("ghostWhisper");

        this.wellRumble =
            document.getElementById("wellRumble");

        this.collectSound =
            document.getElementById("collectSound");

        this.ambientWind =
            document.getElementById("ambientWind");

        this.stoneMove =
            document.getElementById("stoneMove");

    },

    /* ==========================================
       EVENTS
    ========================================== */

    bindEvents() {

        /* Keyboard */

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

        /* Rune Click */

        this.runes.forEach((rune) => {

            rune.addEventListener(

                "click",

                () => this.collectRune(rune)

            );

        });

        /* Buttons */

        if (this.nextButton) {

            this.nextButton.addEventListener(

                "click",

                () => this.showDayComplete()

            );

        }

        if (this.continueButton) {

            this.continueButton.addEventListener(

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

        console.log(

            "Day 2 Started"

        );

        this.showMessage(

            "The Haunted Well awaits..."

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

        if (this.ambientWind) {

            this.ambientWind.volume = 0.20;

            this.ambientWind.play().catch(() => {});

        }

        this.gameLoop();

    },

    /* ==========================================
       GAME LOOP
    ========================================== */

    gameLoop() {

        this.updatePlayer();

        requestAnimationFrame(

            () => this.gameLoop()

        );

    },

    /* ==========================================
       PLAYER MOVEMENT
    ========================================== */

    updatePlayer() {

        if (!this.canMove) return;

        if (this.keys["arrowleft"] || this.keys["a"]) {

            this.playerX -= 0.25;

        }

        if (this.keys["arrowright"] || this.keys["d"]) {

            this.playerX += 0.25;

        }

        if (this.keys["arrowup"] || this.keys["w"]) {

            this.playerY += 0.25;

        }

        if (this.keys["arrowdown"] || this.keys["s"]) {

            this.playerY -= 0.25;

        }

        /* LIMITS */

        this.playerX =

            Math.max(

                3,

                Math.min(94, this.playerX)

            );

        this.playerY =

            Math.max(

                4,

                Math.min(75, this.playerY)

            );

        /* APPLY */

        this.player.style.left =

            this.playerX + "%";

        this.player.style.bottom =

            this.playerY + "%";

        if (this.playerShadow) {

            this.playerShadow.style.left =

                this.playerX + "%";

        }

    },

    /* ==========================================
       DIALOG
    ========================================== */

    showMessage(text) {

        if (!this.dialog) return;

        this.dialog.innerHTML = text;

        this.dialogBox.classList.add("show");

        clearTimeout(this.dialogTimer);

        this.dialogTimer = setTimeout(() => {

            this.dialogBox.classList.remove("show");

        }, 2500);

    }

};

/* ==========================================
START
========================================== */

document.addEventListener(

    "DOMContentLoaded",

    () => {

        Game.init();

    }

);
/* ==========================================
   RUNE COLLECTION
========================================== */

collectRune(rune) {

    if (rune.classList.contains("found")) {

        return;

    }

    rune.classList.add("found");

    rune.style.pointerEvents = "none";

    this.runesFound++;

    /* Collect Sound */

    if (this.collectSound) {

        this.collectSound.currentTime = 0;

        this.collectSound.play();

    }

    /* Progress */

    const percent =

        (this.runesFound / this.totalRunes) * 100;

    this.progress.style.width =

        percent + "%";

    this.counter.innerHTML =

        "🔷 Ancient Runes : " +

        this.runesFound +

        " / " +

        this.totalRunes;

    /* Messages */

    if (this.runesFound === 1) {

        this.showMessage(

            "The first rune glows with ancient magic..."

        );

    }

    if (this.runesFound === 2) {

        this.showMessage(

            "The Haunted Well begins to tremble..."

        );

    }

    if (this.runesFound === 3) {

        this.showMessage(

            "All Ancient Runes have been restored!"

        );

        setTimeout(() => {

            this.awakenWell();

        }, 1200);

    }

},

/* ==========================================
   WELL AWAKENS
========================================== */

awakenWell() {

    this.canMove = false;

    /* Flash */

    if (this.flash) {

        this.flash.classList.add("active");

        setTimeout(() => {

            this.flash.classList.remove("active");

        }, 500);

    }

    /* Shake */

    document.body.classList.add("shake");

    setTimeout(() => {

        document.body.classList.remove("shake");

    }, 1200);

    /* Sounds */

    if (this.ghostWhisper) {

        this.ghostWhisper.currentTime = 0;

        this.ghostWhisper.volume = 0.8;

        this.ghostWhisper.play();

    }

    if (this.wellRumble) {

        this.wellRumble.currentTime = 0;

        this.wellRumble.play();

    }

    /* Ghost */

    setTimeout(() => {

        if (this.ghost) {

            this.ghost.classList.add("active");

        }

    }, 800);

    /* Crystal */

    setTimeout(() => {

        if (this.crystal) {

            this.crystal.classList.add("active");

        }

        if (this.magicSound) {

            this.magicSound.currentTime = 0;

            this.magicSound.play();

        }

    }, 2200);

    this.showMessage(

        "The Ancient Spirit has awakened..."

    );

    /* Crystal Click */

    if (this.crystal) {

        this.crystal.addEventListener(

            "click",

            () => {

                this.activateCrystal();

            },

            {

                once: true

            }

        );

    }

},

/* ==========================================
   CRYSTAL
========================================== */

activateCrystal() {

    this.showMessage(

        "The Crystal accepts your courage."

    );

    if (this.rewardSound) {

        this.rewardSound.currentTime = 0;

        this.rewardSound.play();

    }

    if (this.flash) {

        this.flash.classList.add("active");

        setTimeout(() => {

            this.flash.classList.remove("active");

        }, 450);

    }

    setTimeout(() => {

        this.showMissionComplete();

    }, 1000);

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

}
/* ==========================================
DAY COMPLETE
========================================== */

showDayComplete() {

    if (this.missionComplete) {

        this.missionComplete.classList.remove("show");

    }

    if (this.dayComplete) {

        this.dayComplete.classList.add("show");

    }

    /* Save Progress */

    try {

        localStorage.setItem(

            "vidlyra_day2_complete",

            "true"

        );

    }

    catch(e){

        console.log(e);

    }

}

/* ==========================================
RESTART DAY
========================================== */

restartGame(){

    location.reload();

}

/* ==========================================
RETURN HOME
========================================== */

goHome(){

    window.location.href="index.html";

}

/* ==========================================
PAUSE GAME
========================================== */

pauseGame(){

    this.canMove=false;

    if(this.pauseMenu){

        this.pauseMenu.style.display="flex";

    }

    if(this.bgMusic){

        this.bgMusic.pause();

    }

}

/* ==========================================
RESUME GAME
========================================== */

resumeGame(){

    this.canMove=true;

    if(this.pauseMenu){

        this.pauseMenu.style.display="none";

    }

    if(this.bgMusic){

        this.bgMusic.play().catch(()=>{});

    }

}

/* ==========================================
MOBILE TOUCH
========================================== */

enableTouchControls(){

    let startX=0;

    let startY=0;

    window.addEventListener(

        "touchstart",

        (e)=>{

            startX=e.touches[0].clientX;

            startY=e.touches[0].clientY;

        }

    );

    window.addEventListener(

        "touchmove",

        (e)=>{

            if(!this.canMove)return;

            const dx=

            e.touches[0].clientX-startX;

            const dy=

            e.touches[0].clientY-startY;

            this.playerX+=dx*0.01;

            this.playerY-=dy*0.01;

            startX=e.touches[0].clientX;

            startY=e.touches[0].clientY;

        }

    );

}

/* ==========================================
AUTO SAVE
========================================== */

saveGame(){

    try{

        localStorage.setItem(

            "day2_runes",

            this.runesFound

        );

    }

    catch(e){}

}

/* ==========================================
LOAD SAVE
========================================== */

loadGame(){

    try{

        const save=

        localStorage.getItem(

            "day2_runes"

        );

        if(save){

            this.runesFound=

            parseInt(save);

        }

    }

    catch(e){}

}

/* ==========================================
DEBUG
========================================== */

debug(){

    console.log({

        runes:this.runesFound,

        playerX:this.playerX,

        playerY:this.playerY

    });

}
