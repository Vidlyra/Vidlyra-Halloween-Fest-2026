/* ==========================================================
   VIDLYRA HALLOWEEN FEST 2026
   DAY 5
   THE HAUNTED CEMETERY
========================================================== */

"use strict";

const Game = {

    /* ==========================================
       ELEMENTS
    ========================================== */

    player:null,

    gate:null,

    ghost1:null,
    ghost2:null,
    ghost3:null,

    ghostKing:null,

    portal:null,

    lantern:null,

    spiritFlame:null,

    orb:null,

    dialogue:null,

    speaker:null,

    mission:null,

    beginButton:null,

    lightning:null,

    /* ==========================================
       AUDIO
    ========================================== */

    bgm:null,

    whisper:null,

    appear:null,

    kingSound:null,

    spiritSound:null,

    thunder:null,

    portalSound:null,

    battle:null,

    /* ==========================================
       FLAGS
    ========================================== */

    started:false,

    bossAppeared:false,

    /* ==========================================
       INIT
    ========================================== */

    init(){

        this.cache();

        this.audio();

        this.events();

        this.startScene();

    },

    /* ==========================================
       CACHE
    ========================================== */

    cache(){

        this.player=document.getElementById("player");

        this.gate=document.getElementById("gate");

        this.ghost1=document.getElementById("ghost1");

        this.ghost2=document.getElementById("ghost2");

        this.ghost3=document.getElementById("ghost3");

        this.ghostKing=document.getElementById("ghostKing");

        this.portal=document.getElementById("portal");

        this.lantern=document.getElementById("lantern");

        this.spiritFlame=document.getElementById("spiritFlame");

        this.orb=document.getElementById("orb");

        this.dialogue=document.getElementById("dialogueText");

        this.speaker=document.getElementById("speaker");

        this.mission=document.getElementById("missionPanel");

        this.beginButton=document.getElementById("beginMission");

        this.lightning=document.getElementById("lightning");

        this.bgm=document.getElementById("bgm");

        this.whisper=document.getElementById("ghostWhisper");

        this.appear=document.getElementById("ghostAppear");

        this.kingSound=document.getElementById("ghostKingSound");

        this.spiritSound=document.getElementById("spiritLight");

        this.portalSound=document.getElementById("portalSound");

        this.battle=document.getElementById("battleMusic");

    },

    /* ==========================================
       AUDIO
    ========================================== */

    audio(){

        if(this.bgm){

            this.bgm.volume=.35;

            this.bgm.play().catch(()=>{});

        }

    },

    play(sound){

        if(!sound) return;

        sound.currentTime=0;

        sound.play().catch(()=>{});

    },

    /* ==========================================
       EVENTS
    ========================================== */

    events(){

        this.beginButton.addEventListener(

            "click",

            ()=>{

                window.location.href=

                "day5-epic-game.html";

            }

        );

    },

    /* ==========================================
       START STORY
    ========================================== */

    startScene(){

        if(this.started) return;

        this.started=true;

        this.player.classList.add(

            "playerWalk"

        );

        this.dialogue.innerHTML=

        "The Forgotten Cemetery awaits...";

        this.speaker.innerHTML=

        "Narrator";

        setTimeout(()=>{

            this.sceneTwo();

        },5000);

    },
      /* ==========================================
       SCENE 2
       Cemetery Gate
    ========================================== */

    sceneTwo(){

        this.dialogue.innerHTML=

        "The cemetery gate slowly opens...";

        this.speaker.innerHTML=

        "Spirit";

        this.play(this.whisper);

        this.gate.animate([

            {

                transform:

                "translateX(-50%) rotateY(0deg)"

            },

            {

                transform:

                "translateX(-50%) rotateY(-18deg)"

            }

        ],{

            duration:2200,

            fill:"forwards",

            easing:"ease-out"

        });

        setTimeout(()=>{

            this.sceneThree();

        },3500);

    },

    /* ==========================================
       SCENE 3
       Spirit Flame
    ========================================== */

    sceneThree(){

        this.dialogue.innerHTML=

        "Follow the blue spirit...";

        this.speaker.innerHTML=

        "Spirit";

        this.play(this.spiritSound);

        this.spiritFlame.classList.add(

            "fadeIn"

        );

        this.lantern.classList.add(

            "fadeIn"

        );

        this.orb.classList.add(

            "fadeIn"

        );

        setTimeout(()=>{

            this.sceneFour();

        },4500);

    },

    /* ==========================================
       SCENE 4
       Ghosts
    ========================================== */

    sceneFour(){

        this.dialogue.innerHTML=

        "The restless souls have awakened...";

        this.speaker.innerHTML=

        "Narrator";

        this.play(this.appear);

        this.ghost1.classList.add(

            "ghostShow"

        );

        setTimeout(()=>{

            this.ghost2.classList.add(

                "ghostShow"

            );

        },600);

        setTimeout(()=>{

            this.ghost3.classList.add(

                "ghostShow"

            );

        },1200);

        setTimeout(()=>{

            this.flashLightning();

        },1600);

        setTimeout(()=>{

            this.sceneFive();

        },4500);

    },

    /* ==========================================
       LIGHTNING
    ========================================== */

    flashLightning(){

        this.lightning.classList.add(

            "active"

        );

        this.play(this.thunder);

        document.body.classList.add(

            "cameraShake"

        );

        setTimeout(()=>{

            this.lightning.classList.remove(

                "active"

            );

            document.body.classList.remove(

                "cameraShake"

            );

        },450);

    },
      /* ==========================================
       SCENE 5
       GHOST KING REVEAL
    ========================================== */

    sceneFive(){

        if(this.bossAppeared) return;

        this.bossAppeared = true;

        this.dialogue.innerHTML =

        "You have awakened me...";

        this.speaker.innerHTML =

        "Ghost King";

        this.play(this.kingSound);

        this.ghostKing.classList.add(

            "kingAppear"

        );

        setTimeout(()=>{

            this.startBossMusic();

        },1200);

        setTimeout(()=>{

            this.sceneSix();

        },4500);

    },

    /* ==========================================
       START BOSS MUSIC
    ========================================== */

    startBossMusic(){

        if(!this.battle) return;

        this.bgm.pause();

        this.battle.volume = .55;

        this.battle.play().catch(()=>{});

    },

    /* ==========================================
       SCENE 6
       PORTAL OPENS
    ========================================== */

    sceneSix(){

        this.dialogue.innerHTML =

        "Restore the Seven Spirit Lanterns...";

        this.speaker.innerHTML =

        "Ancient Spirit";

        this.portal.classList.add(

            "portalOpen"

        );

        this.play(this.portalSound);

        setTimeout(()=>{

            this.sceneSeven();

        },3500);

    },

    /* ==========================================
       SCENE 7
       FINAL MISSION
    ========================================== */

    sceneSeven(){

        this.dialogue.innerHTML =

        "Your journey begins now...";

        this.speaker.innerHTML =

        "Narrator";

        this.mission.classList.add(

            "show"

        );

    },
      /* ==========================================
       AMBIENT WORLD
    ========================================== */

    startAmbient(){

        this.startParticles();

        this.randomWhispers();

        this.randomLightning();

    },

    /* ==========================================
       PARTICLES
    ========================================== */

    startParticles(){

        const container =

        document.getElementById(

            "particleContainer"

        );

        if(!container) return;

        container.innerHTML = "";

        for(let i=0;i<80;i++){

            const p =

            document.createElement("div");

            p.className = "particle";

            p.style.left =

            Math.random()*100 + "%";

            p.style.animationDelay =

            Math.random()*8 + "s";

            p.style.animationDuration =

            (6+Math.random()*8) + "s";

            p.style.opacity =

            Math.random();

            container.appendChild(p);

        }

    },

    /* ==========================================
       RANDOM GHOST WHISPERS
    ========================================== */

    randomWhispers(){

        setInterval(()=>{

            if(Math.random()>0.55){

                this.play(

                    this.whisper

                );

            }

        },10000);

    },

    /* ==========================================
       RANDOM LIGHTNING
    ========================================== */

    randomLightning(){

        setInterval(()=>{

            this.flashLightning();

        },8000);

    },

    /* ==========================================
       CAMERA SHAKE
    ========================================== */

    shakeScreen(){

        document.body.classList.add(

            "cameraShake"

        );

        setTimeout(()=>{

            document.body.classList.remove(

                "cameraShake"

            );

        },450);

    },

    /* ==========================================
       DIALOGUE
    ========================================== */

    setDialogue(

        speaker,

        text

    ){

        this.speaker.textContent =

        speaker;

        this.dialogue.textContent =

        text;

    },
      /* ==========================================
       CLEANUP
    ========================================== */

    destroy(){

        /* Stop all audio */

        if(this.bgm){

            this.bgm.pause();

            this.bgm.currentTime = 0;

        }

        if(this.battle){

            this.battle.pause();

            this.battle.currentTime = 0;

        }

        if(this.whisper){

            this.whisper.pause();

        }

        if(this.appear){

            this.appear.pause();

        }

        if(this.kingSound){

            this.kingSound.pause();

        }

        if(this.spiritSound){

            this.spiritSound.pause();

        }

        if(this.portalSound){

            this.portalSound.pause();

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

        Game.startAmbient();

    }

);

/* ==========================================
   TAB VISIBILITY
========================================== */

document.addEventListener(

    "visibilitychange",

    ()=>{

        if(document.hidden){

            if(Game.bgm){

                Game.bgm.pause();

            }

            if(Game.battle){

                Game.battle.pause();

            }

        }

        else{

            if(Game.battle &&
               !Game.battle.paused){

                Game.battle.play().catch(()=>{});

            }

            else if(Game.bgm){

                Game.bgm.play().catch(()=>{});

            }

        }

    }

);

/* ==========================================
   ESC KEY
========================================== */

document.addEventListener(

    "keydown",

    (event)=>{

        if(event.key==="Escape"){

            const leave = confirm(

                "Leave this scene and start the mission?"

            );

            if(leave){

                window.location.href =

                "day5-epic-game.html";

            }

        }

    }

);

/* ==========================================
   BEFORE UNLOAD
========================================== */

window.addEventListener(

    "beforeunload",

    ()=>{

        Game.destroy();

    }

);

/* ==========================================
   END OF FILE
========================================== */
