/*==========================================================
VIDLYRA HALLOWEEN FEST 2026
DAY 5 - EPIC GAME
PART 1
==========================================================*/

"use strict";

/*==========================================================
GAME
==========================================================*/

const Game={

    running:false,

    paused:false,

    loading:true,

    score:0,

    lanterns:0,

    maxLanterns:7,

    level:5,

    difficulty:"normal"

};

/*==========================================================
PLAYER
==========================================================*/

const Player={

    x:window.innerWidth/2,

    y:window.innerHeight-180,

    width:90,

    height:90,

    speed:5,

    health:100,

    maxHealth:100,

    spirit:100,

    maxSpirit:100,

    damage:15,

    alive:true,

    attacking:false,

    moving:false,

    direction:"down"

};

/*==========================================================
INPUT
==========================================================*/

const Keys={

    w:false,

    a:false,

    s:false,

    d:false,

    ArrowUp:false,

    ArrowDown:false,

    ArrowLeft:false,

    ArrowRight:false,

    space:false,

    shift:false

};

/*==========================================================
DOM
==========================================================*/

const UI={

    player:null,

    healthFill:null,

    spiritFill:null,

    healthText:null,

    spiritText:null,

    lanternCounter:null,

    scoreCounter:null,

    loadingScreen:null,

    loadingFill:null,

    objectivePopup:null,

    notificationContainer:null

};

/*==========================================================
CACHE
==========================================================*/

function cacheElements(){

    UI.player=document.getElementById("player");

    UI.healthFill=document.getElementById("healthFill");

    UI.spiritFill=document.getElementById("spiritFill");

    UI.healthText=document.getElementById("healthText");

    UI.spiritText=document.getElementById("spiritText");

    UI.lanternCounter=document.getElementById("lanternCounter");

    UI.scoreCounter=document.getElementById("scoreCounter");

    UI.loadingScreen=document.getElementById("loadingScreen");

    UI.loadingFill=document.getElementById("loadingFill");

    UI.objectivePopup=document.getElementById("objectivePopup");

    UI.notificationContainer=document.getElementById("notificationContainer");

}

/*==========================================================
HUD
==========================================================*/

function updateHUD(){

    UI.healthFill.style.width=

    (Player.health/Player.maxHealth*100)+"%";

    UI.spiritFill.style.width=

    (Player.spirit/Player.maxSpirit*100)+"%";

    UI.healthText.textContent=

    Player.health+" / "+Player.maxHealth;

    UI.spiritText.textContent=

    Player.spirit+" / "+Player.maxSpirit;

    UI.lanternCounter.textContent=

    Game.lanterns+" / "+Game.maxLanterns;

    UI.scoreCounter.textContent=

    Game.score.toString().padStart(6,"0");

}

/*==========================================================
PLAYER POSITION
==========================================================*/

function drawPlayer(){

    UI.player.style.left=Player.x+"px";

    UI.player.style.top=Player.y+"px";

}

/*==========================================================
LOADING
==========================================================*/

function startLoading(){

    let progress=0;

    const timer=setInterval(()=>{

        progress+=2;

        UI.loadingFill.style.width=

        progress+"%";

        if(progress>=100){

            clearInterval(timer);

            finishLoading();

        }

    },30);

}

function finishLoading(){

    Game.loading=false;

    UI.loadingScreen.style.display="none";

    Game.running=true;

    updateHUD();

    notify("Mission Started");

}

/*==========================================================
NOTIFICATION
==========================================================*/

function notify(text){

    const box=document.createElement("div");

    box.className="notification";

    box.textContent=text;

    UI.notificationContainer.appendChild(box);

    setTimeout(()=>{

        box.remove();

    },2500);

}

/*==========================================================
KEYBOARD
==========================================================*/

window.addEventListener("keydown",(e)=>{

    if(e.key==="w") Keys.w=true;
    if(e.key==="a") Keys.a=true;
    if(e.key==="s") Keys.s=true;
    if(e.key==="d") Keys.d=true;

    if(e.key==="ArrowUp") Keys.ArrowUp=true;
    if(e.key==="ArrowDown") Keys.ArrowDown=true;
    if(e.key==="ArrowLeft") Keys.ArrowLeft=true;
    if(e.key==="ArrowRight") Keys.ArrowRight=true;

    if(e.code==="Space") Keys.space=true;

    if(e.key==="Shift") Keys.shift=true;

});

window.addEventListener("keyup",(e)=>{

    if(e.key==="w") Keys.w=false;
    if(e.key==="a") Keys.a=false;
    if(e.key==="s") Keys.s=false;
    if(e.key==="d") Keys.d=false;

    if(e.key==="ArrowUp") Keys.ArrowUp=false;
    if(e.key==="ArrowDown") Keys.ArrowDown=false;
    if(e.key==="ArrowLeft") Keys.ArrowLeft=false;
    if(e.key==="ArrowRight") Keys.ArrowRight=false;

    if(e.code==="Space") Keys.space=false;

    if(e.key==="Shift") Keys.shift=false;

});
/*==========================================================
PART 2
PLAYER MOVEMENT
CAMERA
COLLISION
LANTERNS
==========================================================*/

/*==========================================================
MOVEMENT
==========================================================*/

function movePlayer(){

    if(!Game.running) return;

    if(Game.paused) return;

    let moveX=0;
    let moveY=0;

    if(Keys.w || Keys.ArrowUp){

        moveY-=Player.speed;
        Player.direction="up";

    }

    if(Keys.s || Keys.ArrowDown){

        moveY+=Player.speed;
        Player.direction="down";

    }

    if(Keys.a || Keys.ArrowLeft){

        moveX-=Player.speed;
        Player.direction="left";

    }

    if(Keys.d || Keys.ArrowRight){

        moveX+=Player.speed;
        Player.direction="right";

    }

    Player.x+=moveX;
    Player.y+=moveY;

    keepInsideWorld();

    drawPlayer();

}

/*==========================================================
WORLD LIMITS
==========================================================*/

function keepInsideWorld(){

    const maxX=window.innerWidth-Player.width;

    const maxY=window.innerHeight-Player.height;

    if(Player.x<0){

        Player.x=0;

    }

    if(Player.y<0){

        Player.y=0;

    }

    if(Player.x>maxX){

        Player.x=maxX;

    }

    if(Player.y>maxY){

        Player.y=maxY;

    }

}

/*==========================================================
CAMERA
==========================================================*/

function updateCamera(){

    const world=document.getElementById("gameWorld");

    if(!world) return;

    world.style.transform=

    "translateZ(0)";

}

/*==========================================================
PLAYER ANIMATION
==========================================================*/

function animatePlayer(){

    if(!UI.player) return;

    if(

        Keys.w ||

        Keys.a ||

        Keys.s ||

        Keys.d ||

        Keys.ArrowUp ||

        Keys.ArrowDown ||

        Keys.ArrowLeft ||

        Keys.ArrowRight

    ){

        Player.moving=true;

        UI.player.style.transform=

        "translate(-50%,0) scale(1.03)";

    }

    else{

        Player.moving=false;

        UI.player.style.transform=

        "translate(-50%,0) scale(1)";

    }

}

/*==========================================================
SPIRIT LANTERNS
==========================================================*/

const Lanterns=[];

function registerLanterns(){

    document

    .querySelectorAll(".lantern")

    .forEach((lantern)=>{

        Lanterns.push({

            element:lantern,

            active:true

        });

    });

}

/*==========================================================
COLLECT LANTERN
==========================================================*/

function updateLanterns(){

    Lanterns.forEach((lantern)=>{

        if(!lantern.active) return;

        const rect=

        lantern.element

        .getBoundingClientRect();

        const px=Player.x+45;

        const py=Player.y+45;

        if(

            px>rect.left &&

            px<rect.right &&

            py>rect.top &&

            py<rect.bottom

        ){

            lantern.active=false;

            lantern.element.style.display="none";

            Game.lanterns++;

            Game.score+=500;

            Player.spirit=Math.min(

                Player.maxSpirit,

                Player.spirit+10

            );

            updateHUD();

            notify(

                "Spirit Lantern Restored"

            );

            checkLanternMission();

        }

    });

}

/*==========================================================
MISSION CHECK
==========================================================*/

function checkLanternMission(){

    if(

        Game.lanterns>=

        Game.maxLanterns

    ){

        notify(

            "Ghost King Awakened!"

        );

    }

}

/*==========================================================
MAIN UPDATE
==========================================================*/

function updatePlayerSystem(){

    movePlayer();

    animatePlayer();

    updateCamera();

    updateLanterns();

}
/*==========================================================
PART 3
GHOST AI
COMBAT
BOSS
==========================================================*/

/*==========================================================
ENEMIES
==========================================================*/

const Ghosts=[];

let GhostKing={

    element:null,

    health:500,

    maxHealth:500,

    active:false,

    alive:true

};

/*==========================================================
REGISTER ENEMIES
==========================================================*/

function registerGhosts(){

    document.querySelectorAll(".ghost").forEach((ghost)=>{

        Ghosts.push({

            element:ghost,

            x:ghost.offsetLeft,

            y:ghost.offsetTop,

            health:100,

            maxHealth:100,

            alive:true,

            speed:1.2

        });

    });

    GhostKing.element=document.getElementById("ghostKing");

}

/*==========================================================
MOVE GHOSTS
==========================================================*/

function updateGhosts(){

    Ghosts.forEach((ghost)=>{

        if(!ghost.alive) return;

        const dx=Player.x-ghost.x;
        const dy=Player.y-ghost.y;

        const distance=Math.sqrt(dx*dx+dy*dy);

        if(distance<350){

            ghost.x+=(dx/distance)*ghost.speed;
            ghost.y+=(dy/distance)*ghost.speed;

            ghost.element.style.left=ghost.x+"px";
            ghost.element.style.top=ghost.y+"px";

        }

        if(distance<70){

            damagePlayer(1);

        }

    });

}

/*==========================================================
PLAYER DAMAGE
==========================================================*/

function damagePlayer(amount){

    if(!Player.alive) return;

    Player.health-=amount;

    if(Player.health<0){

        Player.health=0;

    }

    updateHUD();

    if(Player.health<=0){

        playerDead();

    }

}

/*==========================================================
PLAYER ATTACK
==========================================================*/

function playerAttack(){

    if(Player.attacking) return;

    Player.attacking=true;

    Ghosts.forEach((ghost)=>{

        if(!ghost.alive) return;

        const dx=ghost.x-Player.x;
        const dy=ghost.y-Player.y;

        const distance=Math.sqrt(dx*dx+dy*dy);

        if(distance<110){

            ghost.health-=Player.damage;

            if(ghost.health<=0){

                ghost.alive=false;

                ghost.element.style.display="none";

                Game.score+=1000;

                notify("Ghost Defeated");

            }

        }

    });

    if(GhostKing.active){

        attackBoss();

    }

    updateHUD();

    setTimeout(()=>{

        Player.attacking=false;

    },400);

}

/*==========================================================
ACTIVATE BOSS
==========================================================*/

function activateBoss(){

    if(GhostKing.active) return;

    GhostKing.active=true;

    notify("Ghost King Appears!");

}

/*==========================================================
ATTACK BOSS
==========================================================*/

function attackBoss(){

    const bossRect=

    GhostKing.element.getBoundingClientRect();

    const dx=(bossRect.left+110)-Player.x;
    const dy=(bossRect.top+110)-Player.y;

    const distance=Math.sqrt(dx*dx+dy*dy);

    if(distance<150){

        GhostKing.health-=Player.damage;

        document.getElementById("bossHealthFill").style.width=

        (GhostKing.health/GhostKing.maxHealth*100)+"%";

        if(GhostKing.health<=0){

            bossDefeated();

        }

    }

}

/*==========================================================
BOSS DAMAGE
==========================================================*/

function updateBoss(){

    if(!GhostKing.active) return;

    if(!GhostKing.alive) return;

    const rect=

    GhostKing.element.getBoundingClientRect();

    const dx=(rect.left+100)-Player.x;

    const dy=(rect.top+100)-Player.y;

    const distance=Math.sqrt(dx*dx+dy*dy);

    if(distance<150){

        damagePlayer(2);

    }

}

/*==========================================================
BOSS DEFEATED
==========================================================*/

function bossDefeated(){

    GhostKing.alive=false;

    GhostKing.element.style.display="none";

    Game.score+=5000;

    updateHUD();

    notify("Ghost King Defeated");

    showVictory();

}

/*==========================================================
PLAYER DEAD
==========================================================*/

function playerDead(){

    Player.alive=false;

    Game.running=false;

    document.getElementById("gameOverScreen").style.display="flex";

}

/*==========================================================
ATTACK KEY
==========================================================*/

window.addEventListener("keydown",(e)=>{

    if(e.code==="Space"){

        playerAttack();

    }

});

/*==========================================================
ENEMY UPDATE
==========================================================*/

function updateEnemySystem(){

    updateGhosts();

    updateBoss();

    if(Game.lanterns>=Game.maxLanterns){

        activateBoss();

    }

}
/*==========================================================
PART 4
INVENTORY
DIALOGUE
PAUSE
SETTINGS
AUDIO
MOBILE
==========================================================*/

/*==========================================================
INVENTORY
==========================================================*/

const Inventory={

    items:[],

    maxSlots:8

};

function addItem(name){

    if(Inventory.items.length>=Inventory.maxSlots){

        notify("Inventory Full");

        return;

    }

    Inventory.items.push(name);

    notify(name+" Collected");

}

/*==========================================================
DIALOGUE
==========================================================*/

const Dialogues=[

"Lyra: The cemetery is cursed...",

"Restore all Spirit Lanterns.",

"Only then will the Ghost King appear.",

"Be careful..."

];

let dialogueIndex=0;

const dialogueBox=document.getElementById("dialogueBox");
const dialogueText=document.getElementById("dialogueText");
const nextDialogue=document.getElementById("nextDialogue");

function startDialogue(){

    dialogueIndex=0;

    dialogueBox.style.display="block";

    dialogueText.textContent=Dialogues[0];

}

nextDialogue.addEventListener("click",()=>{

    dialogueIndex++;

    if(dialogueIndex>=Dialogues.length){

        dialogueBox.style.display="none";

        return;

    }

    dialogueText.textContent=

    Dialogues[dialogueIndex];

});

/*==========================================================
PAUSE
==========================================================*/

const pauseMenu=

document.getElementById("pauseMenu");

window.addEventListener("keydown",(e)=>{

    if(e.key==="Escape"){

        togglePause();

    }

});

function togglePause(){

    Game.paused=!Game.paused;

    pauseMenu.style.display=

    Game.paused?"flex":"none";

}

document

.getElementById("resumeButton")

.addEventListener("click",()=>{

    Game.paused=false;

    pauseMenu.style.display="none";

});

/*==========================================================
SETTINGS
==========================================================*/

const settings=

document.getElementById("settingsPanel");

document

.getElementById("closeSettings")

.addEventListener("click",()=>{

    settings.style.display="none";

});

/*==========================================================
AUDIO
==========================================================*/

const AudioManager={

    music:

    document.getElementById("bgMusic"),

    attack:

    document.getElementById("ghostAttackSound"),

    lantern:

    document.getElementById("lanternSound"),

    boss:

    document.getElementById("bossRoar"),

    victory:

    document.getElementById("victorySound"),

    gameover:

    document.getElementById("gameOverSound")

};

function playMusic(){

    if(AudioManager.music){

        AudioManager.music.volume=.5;

        AudioManager.music.play().catch(()=>{});

    }

}

function stopMusic(){

    if(AudioManager.music){

        AudioManager.music.pause();

    }

}

function playSound(sound){

    if(!sound) return;

    sound.currentTime=0;

    sound.play().catch(()=>{});

}

/*==========================================================
MOBILE CONTROLS
==========================================================*/

const attackButton=

document.getElementById("attackButton");

const pauseButton=

document.getElementById("pauseButton");

const joystick=

document.getElementById("joystick");

const stick=

document.getElementById("stick");

if(attackButton){

    attackButton.addEventListener(

        "touchstart",

        ()=>{

            playerAttack();

        }

    );

}

if(pauseButton){

    pauseButton.addEventListener(

        "touchstart",

        ()=>{

            togglePause();

        }

    );

}

/*==========================================================
JOYSTICK
==========================================================*/

let joystickActive=false;

let joyCenter={x:0,y:0};

if(joystick){

joystick.addEventListener(

"touchstart",

(e)=>{

joystickActive=true;

const r=

joystick.getBoundingClientRect();

joyCenter.x=r.left+r.width/2;

joyCenter.y=r.top+r.height/2;

}

);

joystick.addEventListener(

"touchmove",

(e)=>{

if(!joystickActive) return;

const touch=e.touches[0];

const dx=touch.clientX-joyCenter.x;

const dy=touch.clientY-joyCenter.y;

const max=35;

stick.style.transform=

`translate(${Math.max(-max,Math.min(max,dx))}px,
${Math.max(-max,Math.min(max,dy))}px)`;

Keys.w=dy<-15;
Keys.s=dy>15;
Keys.a=dx<-15;
Keys.d=dx>15;

}

);

joystick.addEventListener(

"touchend",

()=>{

joystickActive=false;

stick.style.transform=

"translate(-50%,-50%)";

Keys.w=false;
Keys.a=false;
Keys.s=false;
Keys.d=false;

}

);

}
/*==========================================================
PART 5
VICTORY
GAME OVER
GAME LOOP
INITIALIZATION
==========================================================*/

/*==========================================================
VICTORY
==========================================================*/

function showVictory(){

    Game.running=false;

    stopMusic();

    playSound(AudioManager.victory);

    const screen=document.getElementById("victoryScreen");

    if(screen){

        screen.style.display="flex";

    }

}

/*==========================================================
GAME OVER
==========================================================*/

function showGameOver(){

    Game.running=false;

    stopMusic();

    playSound(AudioManager.gameover);

    const screen=document.getElementById("gameOverScreen");

    if(screen){

        screen.style.display="flex";

    }

}

/*==========================================================
BUTTONS
==========================================================*/

const retryButton=document.getElementById("retryButton");

const exitButton=document.getElementById("exitButton");

const nextDayButton=document.getElementById("nextDayButton");

if(retryButton){

    retryButton.addEventListener("click",()=>{

        location.reload();

    });

}

if(exitButton){

    exitButton.addEventListener("click",()=>{

        window.location.href="day5.html";

    });

}

if(nextDayButton){

    nextDayButton.addEventListener("click",()=>{

        window.location.href="day6-video.html";

    });

}

/*==========================================================
SAVE
==========================================================*/

function saveProgress(){

    const save={

        score:Game.score,

        lanterns:Game.lanterns,

        health:Player.health,

        spirit:Player.spirit

    };

    localStorage.setItem(

        "day5_save",

        JSON.stringify(save)

    );

}

function loadProgress(){

    const data=

    localStorage.getItem("day5_save");

    if(!data) return;

    const save=

    JSON.parse(data);

    Game.score=save.score||0;

    Game.lanterns=save.lanterns||0;

    Player.health=save.health||100;

    Player.spirit=save.spirit||100;

    updateHUD();

}

/*==========================================================
AUTO SAVE
==========================================================*/

setInterval(()=>{

    if(Game.running){

        saveProgress();

    }

},10000);

/*==========================================================
GAME LOOP
==========================================================*/

function update(){

    if(!Game.running) return;

    if(Game.paused) return;

    updatePlayerSystem();

    updateEnemySystem();

    updateHUD();

}

function render(){

    drawPlayer();

}

function gameLoop(){

    update();

    render();

    requestAnimationFrame(gameLoop);

}

/*==========================================================
RESIZE
==========================================================*/

window.addEventListener(

"resize",

()=>{

    keepInsideWorld();

    drawPlayer();

}

);

/*==========================================================
START
==========================================================*/

function init(){

    cacheElements();

    registerLanterns();

    registerGhosts();

    loadProgress();

    updateHUD();

    drawPlayer();

    playMusic();

    startDialogue();

    startLoading();

    gameLoop();

}

window.addEventListener(

"load",

init

);
