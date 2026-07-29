"use strict";

/*=========================================================
VIDLYRA HALLOWEEN FEST 2026
DAY 5 - THE HAUNTED CEMETERY
PART 1.1
=========================================================*/

/*=========================================================
DOM REFERENCES
=========================================================*/

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

/* Loading */

const loadingScreen = $("#loadingScreen");
const loadingFill = $("#loadingFill");
const loadingText = $("#loadingText");

/* World */

const gameWorld = $("#gameWorld");

/* Player */

const player = $("#player");

/* HUD */

const healthFill = $("#healthFill");
const spiritFill = $("#spiritFill");

const healthText = $("#healthText");
const spiritText = $("#spiritText");

const lanternCounter = $("#lanternCounter");
const scoreCounter = $("#scoreCounter");

/* Mission */

const missionPanel = $("#missionPanel");
const objectivePopup = $("#objectivePopup");

/* Dialogue */

const dialogueBox = $("#dialogueBox");
const dialogueText = $("#dialogueText");
const nextDialogue = $("#nextDialogue");

/* Enemy */

const enemyLayer = $("#enemyLayer");

const ghostKing = $("#ghostKing");
const bossHealthFill = $("#bossHealthFill");

/* Lantern */

const lanternLayer = $("#lanternLayer");

/* Inventory */

const inventoryPanel = $("#inventoryPanel");

/* Pause */

const pauseMenu = $("#pauseMenu");

const resumeButton = $("#resumeButton");
const restartButton = $("#restartButton");
const quitButton = $("#quitButton");

/* Mobile */

const joystick = $("#joystick");

const attackButton = $("#attackButton");
const skillButton = $("#skillButton");
const pauseButton = $("#pauseButton");

/* Victory */

const victoryScreen = $("#victoryScreen");
const nextDayButton = $("#nextDayButton");

/* Game Over */

const gameOverScreen = $("#gameOverScreen");

const retryButton = $("#retryButton");
const exitButton = $("#exitButton");

/* Audio */

const bgMusic = $("#bgMusic");

const ghostAttackSound = $("#ghostAttackSound");
const lanternSound = $("#lanternSound");
const bossRoar = $("#bossRoar");

const victorySound = $("#victorySound");
const gameOverSound = $("#gameOverSound");


/*=========================================================
GAME CONFIG
=========================================================*/

const CONFIG = {

PLAYER_SPEED:6,

DASH_SPEED:12,

ATTACK_DAMAGE:25,

MAX_HEALTH:100,

MAX_SPIRIT:100,

TOTAL_LANTERNS:7,

TOTAL_GHOSTS:3,

WORLD_WIDTH:7000,

WORLD_HEIGHT:2600,

CAMERA_SMOOTH:0.08,

SAVE_KEY:"VIDLYRA_DAY5_SAVE"

};


/*=========================================================
GLOBAL GAME STATE
=========================================================*/

const GAME = {

running:false,

paused:false,

loading:true,

victory:false,

gameOver:false,

bossFight:false,

bossDefeated:false,

mobile:false,

debug:false,

fps:0,

score:0,

lanterns:0,

kills:0,

time:0,

frame:0

};


/*=========================================================
PLAYER DATA
=========================================================*/

const PLAYER={

x:600,

y:1800,

width:90,

height:150,

health:100,

spirit:100,

speed:CONFIG.PLAYER_SPEED,

facing:1,

moving:false,

attacking:false,

dashing:false,

invincible:false

};


/*=========================================================
BOSS DATA
=========================================================*/

const BOSS={

alive:false,

phase:0,

health:1000,

maxHealth:1000,

x:6100,

y:1700,

active:false

};


/*=========================================================
INPUT
=========================================================*/

const KEYS={

};


/*=========================================================
AUDIO SETTINGS
=========================================================*/

const AUDIO={

master:1,

music:0.8,

effects:0.8,

muted:false

};


/*=========================================================
SAVE DATA
=========================================================*/

const SAVE={

lanterns:0,

score:0,

boss:false

};


/*=========================================================
HELPERS
=========================================================*/

function clamp(value,min,max){

return Math.max(min,Math.min(max,value));

}

function random(min,max){

return Math.random()*(max-min)+min;

}

function randomInt(min,max){

return Math.floor(random(min,max+1));

}


/*=========================================================
LOADING TEXT
=========================================================*/

const loadingMessages=[

"Entering the cemetery...",

"Summoning spirits...",

"Lighting cursed lanterns...",

"Awakening Ghost King...",

"Preparing your sword...",

"Loading haunted world..."

];


/*=========================================================
BOOT
=========================================================*/

window.addEventListener("load",bootGame);

function bootGame(){

detectDevice();

startLoading();

}


/*=========================================================
DEVICE
=========================================================*/

function detectDevice(){

GAME.mobile=

/Android|iPhone|iPad|Mobile/i.test(

navigator.userAgent

);

}


/*=========================================================
END PART 1.1
=========================================================*/
/*=========================================================
PART 2.1A
KEYBOARD INPUT + PLAYER MOVEMENT
=========================================================*/

const INPUT = {
    left: false,
    right: false,
    up: false,
    down: false,
    attack: false,
    dash: false,
    skill: false,
    pause: false
};

/*=========================================
KEY DOWN
=========================================*/

window.addEventListener("keydown", (e) => {

    if (e.repeat) return;

    switch (e.code) {

        case "ArrowLeft":
        case "KeyA":
            INPUT.left = true;
            break;

        case "ArrowRight":
        case "KeyD":
            INPUT.right = true;
            break;

        case "ArrowUp":
        case "KeyW":
            INPUT.up = true;
            break;

        case "ArrowDown":
        case "KeyS":
            INPUT.down = true;
            break;

        case "Space":
            INPUT.attack = true;
            break;

        case "ShiftLeft":
        case "ShiftRight":
            INPUT.dash = true;
            break;

        case "KeyE":
            INPUT.skill = true;
            break;

        case "Escape":
            INPUT.pause = true;
            togglePause();
            break;

    }

});

/*=========================================
KEY UP
=========================================*/

window.addEventListener("keyup", (e) => {

    switch (e.code) {

        case "ArrowLeft":
        case "KeyA":
            INPUT.left = false;
            break;

        case "ArrowRight":
        case "KeyD":
            INPUT.right = false;
            break;

        case "ArrowUp":
        case "KeyW":
            INPUT.up = false;
            break;

        case "ArrowDown":
        case "KeyS":
            INPUT.down = false;
            break;

        case "Space":
            INPUT.attack = false;
            break;

        case "ShiftLeft":
        case "ShiftRight":
            INPUT.dash = false;
            break;

        case "KeyE":
            INPUT.skill = false;
            break;

    }

});

/*=========================================
PLAYER MOVEMENT
=========================================*/

function updatePlayerMovement() {

    if (!GAME.running) return;
    if (GAME.paused) return;

    let moveX = 0;
    let moveY = 0;

    if (INPUT.left) moveX--;
    if (INPUT.right) moveX++;

    if (INPUT.up) moveY--;
    if (INPUT.down) moveY++;

    PLAYER.moving = false;

    if (moveX !== 0 || moveY !== 0) {

        PLAYER.moving = true;

        let length = Math.hypot(moveX, moveY);

        moveX /= length;
        moveY /= length;

        let speed = PLAYER.speed;

        if (INPUT.dash) {

            speed *= 1.8;

        }

        PLAYER.x += moveX * speed;
        PLAYER.y += moveY * speed;

        PLAYER.x = clamp(
            PLAYER.x,
            0,
            CONFIG.WORLD_WIDTH
        );

        PLAYER.y = clamp(
            PLAYER.y,
            0,
            CONFIG.WORLD_HEIGHT
        );

        if (moveX < 0) {

            PLAYER.facing = -1;

        }

        if (moveX > 0) {

            PLAYER.facing = 1;

        }

    }

    renderPlayer();

}

/*=========================================
PLAYER RENDER
=========================================*/

function renderPlayer() {

    player.style.left = PLAYER.x + "px";
    player.style.top = PLAYER.y + "px";

    player.style.transform =
        "translate(-50%,-100%) scaleX(" +
        PLAYER.facing +
        ")";

}

/*=========================================
PAUSE
=========================================*/

function togglePause() {

    GAME.paused = !GAME.paused;

    if (pauseMenu) {

        pauseMenu.style.display =
            GAME.paused ? "flex" : "none";

    }

}

/*=========================================
UPDATE LOOP
=========================================*/

function updateControls() {

    updatePlayerMovement();

}
/*=========================================================
PART 2.1B
MOBILE JOYSTICK + TOUCH CONTROLS
=========================================================*/

const JOYSTICK = {

    active: false,

    startX: 0,
    startY: 0,

    currentX: 0,
    currentY: 0,

    dx: 0,
    dy: 0,

    radius: 55

};

const stick = document.getElementById("stick");

/*=========================================================
SHOW MOBILE CONTROLS
=========================================================*/

if (GAME.mobile) {

    const controls = document.getElementById("mobileControls");

    if (controls) {

        controls.style.display = "flex";

    }

}

/*=========================================================
JOYSTICK START
=========================================================*/

joystick.addEventListener("touchstart", function (e) {

    e.preventDefault();

    const touch = e.touches[0];

    JOYSTICK.active = true;

    JOYSTICK.startX = touch.clientX;

    JOYSTICK.startY = touch.clientY;

});

/*=========================================================
JOYSTICK MOVE
=========================================================*/

joystick.addEventListener("touchmove", function (e) {

    e.preventDefault();

    if (!JOYSTICK.active) return;

    const touch = e.touches[0];

    JOYSTICK.currentX = touch.clientX;

    JOYSTICK.currentY = touch.clientY;

    JOYSTICK.dx =

        JOYSTICK.currentX - JOYSTICK.startX;

    JOYSTICK.dy =

        JOYSTICK.currentY - JOYSTICK.startY;

    const distance = Math.hypot(

        JOYSTICK.dx,

        JOYSTICK.dy

    );

    if (distance > JOYSTICK.radius) {

        const angle = Math.atan2(

            JOYSTICK.dy,

            JOYSTICK.dx

        );

        JOYSTICK.dx =

            Math.cos(angle) * JOYSTICK.radius;

        JOYSTICK.dy =

            Math.sin(angle) * JOYSTICK.radius;

    }

    if (stick) {

        stick.style.transform =

            `translate(${JOYSTICK.dx}px, ${JOYSTICK.dy}px)`;

    }

});

/*=========================================================
JOYSTICK END
=========================================================*/

function resetJoystick() {

    JOYSTICK.active = false;

    JOYSTICK.dx = 0;

    JOYSTICK.dy = 0;

    if (stick) {

        stick.style.transform =

            "translate(0px,0px)";

    }

}

joystick.addEventListener("touchend", resetJoystick);

joystick.addEventListener("touchcancel", resetJoystick);

/*=========================================================
MOVE PLAYER FROM JOYSTICK
=========================================================*/

function updateJoystickMovement() {

    if (!JOYSTICK.active) return;

    let moveX = JOYSTICK.dx / JOYSTICK.radius;

    let moveY = JOYSTICK.dy / JOYSTICK.radius;

    PLAYER.moving = true;

    PLAYER.x += moveX * PLAYER.speed;

    PLAYER.y += moveY * PLAYER.speed;

    PLAYER.x = clamp(

        PLAYER.x,

        0,

        CONFIG.WORLD_WIDTH

    );

    PLAYER.y = clamp(

        PLAYER.y,

        0,

        CONFIG.WORLD_HEIGHT

    );

    if (moveX < -0.1) PLAYER.facing = -1;

    if (moveX > 0.1) PLAYER.facing = 1;

}

/*=========================================================
ATTACK BUTTON
=========================================================*/

attackButton.addEventListener("touchstart", function (e) {

    e.preventDefault();

    INPUT.attack = true;

});

attackButton.addEventListener("touchend", function () {

    INPUT.attack = false;

});

/*=========================================================
SKILL BUTTON
=========================================================*/

skillButton.addEventListener("touchstart", function (e) {

    e.preventDefault();

    INPUT.skill = true;

});

skillButton.addEventListener("touchend", function () {

    INPUT.skill = false;

});

/*=========================================================
PAUSE BUTTON
=========================================================*/

pauseButton.addEventListener("touchstart", function (e) {

    e.preventDefault();

    togglePause();

});

/*=========================================================
UPDATE MOBILE INPUT
=========================================================*/

function updateMobileControls() {

    if (!GAME.mobile) return;

    updateJoystickMovement();

}
/*=========================================================
PART 2.1C
PLAYER UPDATE SYSTEM
=========================================================*/

PLAYER.velocityX = 0;
PLAYER.velocityY = 0;

PLAYER.runSpeed = 6;
PLAYER.dashSpeed = 12;

PLAYER.stamina = 100;
PLAYER.maxStamina = 100;

PLAYER.state = "idle";

PLAYER.animation = "idle";

/*=========================================================
UPDATE PLAYER
=========================================================*/

function updatePlayer() {

    if (!GAME.running) return;

    if (GAME.paused) return;

    updateControls();

    updateMobileControls();

    applyMovement();

    updatePlayerState();

    updatePlayerAnimation();

    updatePlayerHUD();

}

/*=========================================================
MOVEMENT
=========================================================*/

function applyMovement() {

    PLAYER.velocityX = 0;
    PLAYER.velocityY = 0;

    /* Keyboard */

    if (INPUT.left) PLAYER.velocityX--;
    if (INPUT.right) PLAYER.velocityX++;

    if (INPUT.up) PLAYER.velocityY--;
    if (INPUT.down) PLAYER.velocityY++;

    /* Mobile */

    if (JOYSTICK.active) {

        PLAYER.velocityX += JOYSTICK.dx / JOYSTICK.radius;

        PLAYER.velocityY += JOYSTICK.dy / JOYSTICK.radius;

    }

    if (
        PLAYER.velocityX !== 0 ||
        PLAYER.velocityY !== 0
    ) {

        const length = Math.hypot(

            PLAYER.velocityX,

            PLAYER.velocityY

        );

        PLAYER.velocityX /= length;
        PLAYER.velocityY /= length;

    }

    let speed = PLAYER.runSpeed;

    /* Dash */

    if (
        INPUT.dash &&
        PLAYER.stamina > 0
    ) {

        speed = PLAYER.dashSpeed;

        PLAYER.stamina -= 0.6;

        PLAYER.state = "dash";

    } else {

        PLAYER.stamina += 0.25;

    }

    PLAYER.stamina = clamp(

        PLAYER.stamina,

        0,

        PLAYER.maxStamina

    );

    PLAYER.x += PLAYER.velocityX * speed;

    PLAYER.y += PLAYER.velocityY * speed;

    PLAYER.x = clamp(

        PLAYER.x,

        0,

        CONFIG.WORLD_WIDTH

    );

    PLAYER.y = clamp(

        PLAYER.y,

        0,

        CONFIG.WORLD_HEIGHT

    );

}

/*=========================================================
PLAYER STATE
=========================================================*/

function updatePlayerState() {

    if (PLAYER.attacking) {

        PLAYER.state = "attack";

        return;

    }

    if (

        PLAYER.velocityX === 0 &&

        PLAYER.velocityY === 0

    ) {

        PLAYER.state = "idle";

    } else {

        if (PLAYER.state !== "dash") {

            PLAYER.state = "walk";

        }

    }

}

/*=========================================================
PLAYER ANIMATION
=========================================================*/

function updatePlayerAnimation() {

    switch (PLAYER.state) {

        case "idle":

            player.dataset.state = "idle";

            break;

        case "walk":

            player.dataset.state = "walk";

            break;

        case "dash":

            player.dataset.state = "dash";

            break;

        case "attack":

            player.dataset.state = "attack";

            break;

    }

}

/*=========================================================
HUD
=========================================================*/

function updatePlayerHUD() {

    healthFill.style.width =

        PLAYER.health + "%";

    spiritFill.style.width =

        PLAYER.spirit + "%";

    healthText.textContent =

        PLAYER.health + " / 100";

    spiritText.textContent =

        PLAYER.spirit + " / 100";

}

/*=========================================================
RENDER PLAYER
=========================================================*/

function renderPlayer() {

    player.style.left = PLAYER.x + "px";

    player.style.top = PLAYER.y + "px";

    player.style.transform =

        `translate(-50%,-100%) scaleX(${PLAYER.facing})`;

}

/*=========================================================
MAIN UPDATE
=========================================================*/

function playerLoop() {

    updatePlayer();

    renderPlayer();

}
/*=========================================================
PART 2.2A
SMOOTH CAMERA SYSTEM
=========================================================*/

const CAMERA = {

    x: 0,
    y: 0,

    targetX: 0,
    targetY: 0,

    smooth: 0.08,

    width: window.innerWidth,
    height: window.innerHeight

};

/*=========================================================
RESIZE
=========================================================*/

window.addEventListener("resize", () => {

    CAMERA.width = window.innerWidth;
    CAMERA.height = window.innerHeight;

});

/*=========================================================
CAMERA TARGET
=========================================================*/

function updateCameraTarget() {

    CAMERA.targetX =
        PLAYER.x - CAMERA.width / 2;

    CAMERA.targetY =
        PLAYER.y - CAMERA.height / 2;

}

/*=========================================================
SMOOTH FOLLOW
=========================================================*/

function updateCamera() {

    updateCameraTarget();

    CAMERA.x +=
        (CAMERA.targetX - CAMERA.x) *
        CAMERA.smooth;

    CAMERA.y +=
        (CAMERA.targetY - CAMERA.y) *
        CAMERA.smooth;

    CAMERA.x = clamp(

        CAMERA.x,

        0,

        CONFIG.WORLD_WIDTH - CAMERA.width

    );

    CAMERA.y = clamp(

        CAMERA.y,

        0,

        CONFIG.WORLD_HEIGHT - CAMERA.height

    );

    gameWorld.style.transform =
        `translate(${-CAMERA.x}px, ${-CAMERA.y}px)`;

}

/*=========================================================
CAMERA SHAKE
=========================================================*/

function cameraShake(
    power = 10,
    duration = 300
) {

    const start = performance.now();

    function shake(time) {

        const elapsed = time - start;

        if (elapsed >= duration) {

            gameWorld.style.transform =
                `translate(${-CAMERA.x}px, ${-CAMERA.y}px)`;

            return;

        }

        const offsetX =
            (Math.random() - 0.5) * power;

        const offsetY =
            (Math.random() - 0.5) * power;

        gameWorld.style.transform =
            `translate(${-CAMERA.x + offsetX}px,
                       ${-CAMERA.y + offsetY}px)`;

        requestAnimationFrame(shake);

    }

    requestAnimationFrame(shake);

}

/*=========================================================
CAMERA LOOP
=========================================================*/

function cameraLoop() {

    updateCamera();

}
/*=========================================================
PART 2.2B
SWORD ATTACK SYSTEM
=========================================================*/

const ATTACK = {

    combo: 0,

    cooldown: false,

    duration: 250,

    comboReset: 700,

    damage: 25,

    range: 140,

    lastAttack: 0

};

/*=========================================================
ATTACK INPUT
=========================================================*/

function updateAttackInput() {

    if (!INPUT.attack) return;

    if (ATTACK.cooldown) return;

    startAttack();

}

/*=========================================================
START ATTACK
=========================================================*/

function startAttack() {

    ATTACK.cooldown = true;

    PLAYER.attacking = true;

    PLAYER.state = "attack";

    ATTACK.combo++;

    if (ATTACK.combo > 3) {

        ATTACK.combo = 1;

    }

    ATTACK.lastAttack = performance.now();

    playAttackAnimation();

    createSlashEffect();

    damageGhosts();

    setTimeout(() => {

        PLAYER.attacking = false;

    }, ATTACK.duration);

    setTimeout(() => {

        ATTACK.cooldown = false;

    }, 180);

}

/*=========================================================
COMBO RESET
=========================================================*/

function updateCombo() {

    if (

        performance.now()

        -

        ATTACK.lastAttack

        >

        ATTACK.comboReset

    ) {

        ATTACK.combo = 0;

    }

}

/*=========================================================
ANIMATION
=========================================================*/

function playAttackAnimation() {

    player.classList.remove(

        "attack1",

        "attack2",

        "attack3"

    );

    player.offsetWidth;

    player.classList.add(

        "attack" + ATTACK.combo

    );

}

/*=========================================================
UPDATE
=========================================================*/

function updateCombat() {

    updateAttackInput();

    updateCombo();

}
/*=========================================================
PART 2.2C
SWORD HITBOX + GHOST DAMAGE
=========================================================*/

const GHOSTS = [];

document.querySelectorAll(".ghost").forEach((ghost, index) => {

    GHOSTS.push({

        id: index,

        element: ghost,

        alive: true,

        health: 100,

        maxHealth: 100,

        damage: 15,

        x: ghost.offsetLeft,

        y: ghost.offsetTop,

        width: 90,

        height: 120,

        lastHit: 0

    });

});

/*=========================================================
HITBOX
=========================================================*/

function getSwordHitbox() {

    const box = {

        x: PLAYER.x,

        y: PLAYER.y,

        width: ATTACK.range,

        height: 120

    };

    if (PLAYER.facing > 0) {

        box.x += 60;

    } else {

        box.x -= ATTACK.range;

    }

    return box;

}

/*=========================================================
RECT COLLISION
=========================================================*/

function rectCollision(a, b) {

    return (

        a.x < b.x + b.width &&

        a.x + a.width > b.x &&

        a.y < b.y + b.height &&

        a.y + a.height > b.y

    );

}

/*=========================================================
DAMAGE GHOSTS
=========================================================*/

function damageGhosts() {

    const sword = getSwordHitbox();

    GHOSTS.forEach((ghost) => {

        if (!ghost.alive) return;

        const enemy = {

            x: ghost.element.offsetLeft,

            y: ghost.element.offsetTop,

            width: ghost.width,

            height: ghost.height

        };

        if (!rectCollision(sword, enemy)) return;

        if (performance.now() - ghost.lastHit < 250) return;

        ghost.lastHit = performance.now();

        ghost.health -= ATTACK.damage;

        updateGhostHealth(ghost);

        createBloodEffect(

            enemy.x + enemy.width / 2,

            enemy.y + enemy.height / 2

        );

        cameraShake(5,120);

        if (ghost.health <= 0) {

            killGhost(ghost);

        }

    });

}

/*=========================================================
HEALTH BAR
=========================================================*/

function updateGhostHealth(ghost) {

    const fill =

        ghost.element.querySelector(

            ".enemyHealthFill"

        );

    if (!fill) return;

    fill.style.width =

        (ghost.health / ghost.maxHealth * 100)

        + "%";

}

/*=========================================================
KILL GHOST
=========================================================*/

function killGhost(ghost) {

    ghost.alive = false;

    GAME.kills++;

    GAME.score += 250;

    scoreCounter.textContent =

        GAME.score

        .toString()

        .padStart(6,"0");

    ghost.element.classList.add("ghostDead");

    setTimeout(() => {

        ghost.element.remove();

    },800);

    showNotification(

        "+250 SCORE"

    );

}

/*=========================================================
BLOOD EFFECT
=========================================================*/

function createBloodEffect(x,y){

    const blood=document.createElement("div");

    blood.className="bloodEffect";

    blood.style.left=x+"px";

    blood.style.top=y+"px";

    gameWorld.appendChild(blood);

    setTimeout(()=>{

        blood.remove();

    },700);

}

/*=========================================================
NOTIFICATION
=========================================================*/

function showNotification(text){

    const n=document.createElement("div");

    n.className="notification";

    n.textContent=text;

    notificationContainer.appendChild(n);

    setTimeout(()=>{

        n.remove();

    },1800);

}
/*=========================================================
PART 2.2D
DASH SYSTEM
=========================================================*/

const DASH = {

    active:false,

    duration:220,

    cooldown:800,

    speed:18,

    timer:0,

    cooldownTimer:0,

    directionX:0,

    directionY:0

};

/*=========================================================
START DASH
=========================================================*/

function startDash(){

    if(DASH.active) return;

    if(DASH.cooldownTimer>0) return;

    if(PLAYER.stamina<20) return;

    let dx=PLAYER.velocityX;
    let dy=PLAYER.velocityY;

    if(dx===0 && dy===0){

        dx=PLAYER.facing;
        dy=0;

    }

    const length=Math.hypot(dx,dy);

    DASH.directionX=dx/length;
    DASH.directionY=dy/length;

    DASH.active=true;

    DASH.timer=DASH.duration;

    DASH.cooldownTimer=DASH.cooldown;

    PLAYER.invincible=true;

    PLAYER.stamina-=20;

    player.classList.add("dash");

    createDashTrail();

}

/*=========================================================
UPDATE DASH
=========================================================*/

function updateDash(delta){

    if(INPUT.dash && !DASH.active){

        startDash();

    }

    if(DASH.cooldownTimer>0){

        DASH.cooldownTimer-=delta;

    }

    if(!DASH.active) return;

    DASH.timer-=delta;

    PLAYER.x+=DASH.directionX*DASH.speed;

    PLAYER.y+=DASH.directionY*DASH.speed;

    PLAYER.x=clamp(
        PLAYER.x,
        0,
        CONFIG.WORLD_WIDTH
    );

    PLAYER.y=clamp(
        PLAYER.y,
        0,
        CONFIG.WORLD_HEIGHT
    );

    createAfterImage();

    if(DASH.timer<=0){

        DASH.active=false;

        PLAYER.invincible=false;

        player.classList.remove("dash");

    }

}

/*=========================================================
AFTER IMAGE
=========================================================*/

function createAfterImage(){

    const clone=player.cloneNode(true);

    clone.classList.add("afterImage");

    clone.style.left=PLAYER.x+"px";
    clone.style.top=PLAYER.y+"px";

    gameWorld.appendChild(clone);

    setTimeout(()=>{

        clone.remove();

    },350);

}

/*=========================================================
DASH TRAIL
=========================================================*/

function createDashTrail(){

    const trail=document.createElement("div");

    trail.className="dashTrail";

    trail.style.left=PLAYER.x+"px";
    trail.style.top=PLAYER.y+"px";

    gameWorld.appendChild(trail);

    setTimeout(()=>{

        trail.remove();

    },500);

}

/*=========================================================
DASH DAMAGE
=========================================================*/

function dashCollision(){

    if(!DASH.active) return;

    GHOSTS.forEach(ghost=>{

        if(!ghost.alive) return;

        const gx=ghost.element.offsetLeft;
        const gy=ghost.element.offsetTop;

        const dist=Math.hypot(

            gx-PLAYER.x,

            gy-PLAYER.y

        );

        if(dist>90) return;

        ghost.health-=15;

        updateGhostHealth(ghost);

        createBloodEffect(gx,gy);

        cameraShake(3,80);

        if(ghost.health<=0){

            killGhost(ghost);

        }

    });

}

/*=========================================================
UPDATE
=========================================================*/

function updatePlayerAbilities(delta){

    updateCombat();

    updateDash(delta);

    dashCollision();

}
/*=========================================================
PART 2.2E
SPIRIT SKILL + PLAYER UTILITIES
=========================================================*/

const SKILL={

    cooldown:12000,

    timer:0,

    spiritCost:35,

    damage:60,

    active:false

};

/*=========================================================
UPDATE SKILL
=========================================================*/

function updateSkill(delta){

    if(SKILL.timer>0){

        SKILL.timer-=delta;

    }

    if(!INPUT.skill) return;

    castSpiritSkill();

}

/*=========================================================
CAST SKILL
=========================================================*/

function castSpiritSkill(){

    if(SKILL.timer>0) return;

    if(PLAYER.spirit<SKILL.spiritCost) return;

    PLAYER.spirit-=SKILL.spiritCost;

    SKILL.timer=SKILL.cooldown;

    PLAYER.state="skill";

    player.classList.add("skillCast");

    setTimeout(()=>{

        player.classList.remove("skillCast");

    },700);

    spiritExplosion();

}

/*=========================================================
SPIRIT EXPLOSION
=========================================================*/

function spiritExplosion(){

    const blast=document.createElement("div");

    blast.className="spiritBlast";

    blast.style.left=PLAYER.x+"px";
    blast.style.top=PLAYER.y+"px";

    gameWorld.appendChild(blast);

    GHOSTS.forEach(ghost=>{

        if(!ghost.alive) return;

        const gx=ghost.element.offsetLeft;
        const gy=ghost.element.offsetTop;

        const distance=Math.hypot(

            gx-PLAYER.x,

            gy-PLAYER.y

        );

        if(distance>250) return;

        ghost.health-=SKILL.damage;

        updateGhostHealth(ghost);

        createBloodEffect(gx,gy);

        if(ghost.health<=0){

            killGhost(ghost);

        }

    });

    setTimeout(()=>{

        blast.remove();

    },900);

}

/*=========================================================
CRITICAL HIT
=========================================================*/

function criticalDamage(baseDamage){

    if(Math.random()<0.20){

        showNotification("CRITICAL!");

        return baseDamage*2;

    }

    return baseDamage;

}

/*=========================================================
SPIRIT REGEN
=========================================================*/

function regenerateSpirit(delta){

    if(PLAYER.spirit>=PLAYER.maxSpirit) return;

    PLAYER.spirit+=0.012*delta;

    PLAYER.spirit=clamp(

        PLAYER.spirit,

        0,

        PLAYER.maxSpirit

    );

}

/*=========================================================
HEALTH REGEN
=========================================================*/

function regenerateHealth(delta){

    if(PLAYER.health>=PLAYER.maxHealth) return;

    PLAYER.health+=0.003*delta;

    PLAYER.health=clamp(

        PLAYER.health,

        0,

        PLAYER.maxHealth

    );

}

/*=========================================================
PICKUPS
=========================================================*/

function collectPickups(){

    document.querySelectorAll(".pickup").forEach(item=>{

        const dx=item.offsetLeft-PLAYER.x;

        const dy=item.offsetTop-PLAYER.y;

        if(Math.hypot(dx,dy)>70) return;

        if(item.dataset.type==="health"){

            PLAYER.health=Math.min(

                PLAYER.maxHealth,

                PLAYER.health+25

            );

        }

        if(item.dataset.type==="spirit"){

            PLAYER.spirit=Math.min(

                PLAYER.maxSpirit,

                PLAYER.spirit+30

            );

        }

        item.remove();

    });

}

/*=========================================================
PLAYER UPDATE
=========================================================*/

function updatePlayerSystem(delta){

    updatePlayer();

    updateCombat();

    updateDash(delta);

    dashCollision();

    updateSkill(delta);

    regenerateSpirit(delta);

    regenerateHealth(delta);

    collectPickups();

}
/*=========================================================
PART 3.1A
GHOST AI SYSTEM
=========================================================*/

const GHOST_AI = {

    detectRange:450,

    attackRange:80,

    moveSpeed:2,

    wanderSpeed:1,

    attackCooldown:1500

};

/*=========================================================
INITIALIZE
=========================================================*/

GHOSTS.forEach(ghost=>{

    ghost.state="wander";

    ghost.targetX=ghost.element.offsetLeft;

    ghost.targetY=ghost.element.offsetTop;

    ghost.velocityX=0;

    ghost.velocityY=0;

    ghost.attackTimer=0;

    ghost.floatOffset=Math.random()*1000;

});

/*=========================================================
UPDATE ALL
=========================================================*/

function updateGhostAI(delta){

    GHOSTS.forEach(ghost=>{

        if(!ghost.alive) return;

        updateGhostState(ghost);

        updateGhostMovement(ghost,delta);

        updateGhostAttack(ghost,delta);

        renderGhost(ghost);

    });

}

/*=========================================================
STATE
=========================================================*/

function updateGhostState(ghost){

    const dx=PLAYER.x-ghost.element.offsetLeft;

    const dy=PLAYER.y-ghost.element.offsetTop;

    const distance=Math.hypot(dx,dy);

    if(distance<GHOST_AI.attackRange){

        ghost.state="attack";

        return;

    }

    if(distance<GHOST_AI.detectRange){

        ghost.state="chase";

        return;

    }

    ghost.state="wander";

}

/*=========================================================
MOVEMENT
=========================================================*/

function updateGhostMovement(ghost,delta){

    let speed=GHOST_AI.wanderSpeed;

    switch(ghost.state){

        case "wander":

            wanderGhost(ghost);

            break;

        case "chase":

            speed=GHOST_AI.moveSpeed;

            chasePlayer(ghost,speed);

            break;

        case "attack":

            ghost.velocityX=0;

            ghost.velocityY=0;

            break;

    }

    ghost.targetX+=ghost.velocityX;
    ghost.targetY+=ghost.velocityY;

}

/*=========================================================
WANDER
=========================================================*/

function wanderGhost(ghost){

    if(Math.random()<0.01){

        const angle=Math.random()*Math.PI*2;

        ghost.velocityX=Math.cos(angle);

        ghost.velocityY=Math.sin(angle);

    }

}

/*=========================================================
CHASE
=========================================================*/

function chasePlayer(ghost,speed){

    const dx=PLAYER.x-ghost.targetX;

    const dy=PLAYER.y-ghost.targetY;

    const length=Math.hypot(dx,dy);

    if(length===0) return;

    ghost.velocityX=(dx/length)*speed;

    ghost.velocityY=(dy/length)*speed;

}
/*=========================================================
PART 3.1B
GHOST ATTACK SYSTEM
=========================================================*/

/*=========================================================
FLOATING EFFECT
=========================================================*/

function renderGhost(ghost){

    const time = performance.now() * 0.002;

    const floatY =

        Math.sin(time + ghost.floatOffset) * 10;

    ghost.element.style.left =

        ghost.targetX + "px";

    ghost.element.style.top =

        (ghost.targetY + floatY) + "px";

    if(PLAYER.x > ghost.targetX){

        ghost.element.style.transform =
            "scaleX(1)";

    }else{

        ghost.element.style.transform =
            "scaleX(-1)";

    }

}

/*=========================================================
ATTACK
=========================================================*/

function updateGhostAttack(ghost,delta){

    if(ghost.state!=="attack") return;

    ghost.attackTimer-=delta;

    if(ghost.attackTimer>0) return;

    ghost.attackTimer=

        GHOST_AI.attackCooldown;

    attackPlayer(ghost);

}

/*=========================================================
PLAYER DAMAGE
=========================================================*/

function attackPlayer(ghost){

    if(PLAYER.invincible) return;

    PLAYER.health-=ghost.damage;

    PLAYER.health=Math.max(

        PLAYER.health,

        0

    );

    ghostAttackSound.currentTime=0;

    ghostAttackSound.play();

    cameraShake(8,180);

    player.classList.add("hurt");

    setTimeout(()=>{

        player.classList.remove("hurt");

    },250);

    knockbackPlayer(ghost);

    if(PLAYER.health<=0){

        playerDie();

    }

}

/*=========================================================
KNOCKBACK
=========================================================*/

function knockbackPlayer(ghost){

    const dx=

        PLAYER.x-ghost.targetX;

    const dy=

        PLAYER.y-ghost.targetY;

    const length=

        Math.hypot(dx,dy);

    if(length===0) return;

    PLAYER.x+=

        (dx/length)*40;

    PLAYER.y+=

        (dy/length)*40;

}

/*=========================================================
PLAYER DEATH
=========================================================*/

function playerDie(){

    if(GAME.gameOver) return;

    GAME.gameOver=true;

    GAME.running=false;

    gameOverSound.play();

    gameOverScreen.style.display="flex";

}

/*=========================================================
FLASH DAMAGE
=========================================================*/

function flashPlayer(){

    player.classList.add("damageFlash");

    setTimeout(()=>{

        player.classList.remove(

            "damageFlash"

        );

    },180);

}

/*=========================================================
UPDATE LOOP
=========================================================*/

function updateEnemySystem(delta){

    updateGhostAI(delta);

}
/*=========================================================
PART 3.1C
ADVANCED GHOST AI
=========================================================*/

const ELITE = {

    chance:0.25,

    healthMultiplier:2,

    damageMultiplier:2,

    speedMultiplier:1.5

};

/*=========================================================
INITIALIZE ELITE GHOSTS
=========================================================*/

function initializeGhostTypes(){

    GHOSTS.forEach(ghost=>{

        if(Math.random()<ELITE.chance){

            ghost.elite=true;

            ghost.health*=ELITE.healthMultiplier;
            ghost.maxHealth*=ELITE.healthMultiplier;
            ghost.damage*=ELITE.damageMultiplier;

            ghost.speed=GHOST_AI.moveSpeed*
                        ELITE.speedMultiplier;

            ghost.element.classList.add("eliteGhost");

        }else{

            ghost.elite=false;
            ghost.speed=GHOST_AI.moveSpeed;

        }

    });

}

/*=========================================================
TELEPORT
=========================================================*/

function updateGhostTeleport(ghost){

    if(ghost.state!=="chase") return;

    if(Math.random()>0.002) return;

    const angle=Math.random()*Math.PI*2;

    const radius=140;

    ghost.targetX=

        PLAYER.x+
        Math.cos(angle)*radius;

    ghost.targetY=

        PLAYER.y+
        Math.sin(angle)*radius;

    ghost.element.classList.add("ghostTeleport");

    setTimeout(()=>{

        ghost.element.classList.remove(

            "ghostTeleport"

        );

    },600);

}

/*=========================================================
DEATH EFFECT
=========================================================*/

function ghostDeathEffect(x,y){

    for(let i=0;i<10;i++){

        const p=document.createElement("div");

        p.className="ghostParticle";

        p.style.left=x+"px";

        p.style.top=y+"px";

        p.style.setProperty(

            "--dx",

            (Math.random()*120-60)+"px"

        );

        p.style.setProperty(

            "--dy",

            (Math.random()*120-60)+"px"

        );

        gameWorld.appendChild(p);

        setTimeout(()=>{

            p.remove();

        },900);

    }

}

/*=========================================================
LOOT DROP
=========================================================*/

function dropLoot(ghost){

    const chance=Math.random();

    if(chance>0.45) return;

    const item=document.createElement("div");

    item.className="pickup";

    item.style.left=

        ghost.targetX+"px";

    item.style.top=

        ghost.targetY+"px";

    if(chance<0.20){

        item.dataset.type="health";

        item.classList.add("healthPickup");

    }else{

        item.dataset.type="spirit";

        item.classList.add("spiritPickup");

    }

    gameWorld.appendChild(item);

}

/*=========================================================
OVERRIDE GHOST DEATH
=========================================================*/

const oldKillGhost=killGhost;

killGhost=function(ghost){

    ghostDeathEffect(

        ghost.targetX,

        ghost.targetY

    );

    dropLoot(ghost);

    oldKillGhost(ghost);

};

/*=========================================================
UPDATE
=========================================================*/

function updateAdvancedGhosts(){

    GHOSTS.forEach(ghost=>{

        if(!ghost.alive) return;

        updateGhostTeleport(ghost);

    });

}
/*=========================================================
PART 3.2A
GHOST KING INTRO
=========================================================*/

const BOSS = {

    active:false,

    intro:false,

    defeated:false,

    phase:1,

    health:1000,

    maxHealth:1000,

    damage:35,

    speed:2.2,

    attackCooldown:2500,

    attackTimer:0,

    x:0,

    y:0

};

const boss = document.getElementById("ghostKing");
const bossBar = document.getElementById("bossBar");
const bossHealthFill =
document.getElementById("bossHealthFill");

/*=========================================================
SPAWN
=========================================================*/

function activateGhostKing(){

    if(BOSS.active) return;

    BOSS.active=true;

    BOSS.intro=true;

    boss.style.display="block";

    bossBar.style.display="block";

    BOSS.x=4200;
    BOSS.y=1800;

    boss.style.left=BOSS.x+"px";
    boss.style.top=BOSS.y+"px";

    startBossIntro();

}

/*=========================================================
INTRO
=========================================================*/

function startBossIntro(){

    GAME.running=false;

    cameraShake(20,1200);

    bossRoar.currentTime=0;
    bossRoar.play();

    objectivePopup.innerHTML=

        "⚠ GHOST KING AWAKENS ⚠";

    objectivePopup.classList.add("show");

    setTimeout(()=>{

        objectivePopup.classList.remove("show");

    },3500);

    boss.classList.add("bossIntro");

    setTimeout(()=>{

        GAME.running=true;

        BOSS.intro=false;

    },4000);

}

/*=========================================================
UPDATE
=========================================================*/

function updateBoss(){

    if(!BOSS.active) return;

    if(BOSS.intro) return;

    updateBossMovement();

    updateBossAttack();

    updateBossHealth();

}

/*=========================================================
HEALTH BAR
=========================================================*/

function updateBossHealth(){

    bossHealthFill.style.width=

        (BOSS.health/BOSS.maxHealth*100)+"%";

}
/*=========================================================
PART 3.2B
GHOST KING AI
=========================================================*/

BOSS.state="idle";
BOSS.combo=0;
BOSS.invincible=false;

/*=========================================================
MOVEMENT
=========================================================*/

function updateBossMovement(){

    const dx=PLAYER.x-BOSS.x;
    const dy=PLAYER.y-BOSS.y;

    const distance=Math.hypot(dx,dy);

    if(distance>180){

        BOSS.state="chase";

        const angle=Math.atan2(dy,dx);

        BOSS.x+=Math.cos(angle)*BOSS.speed;

        BOSS.y+=Math.sin(angle)*BOSS.speed;

    }else{

        BOSS.state="attack";

    }

    boss.style.left=BOSS.x+"px";
    boss.style.top=BOSS.y+"px";

    if(dx>0){

        boss.style.transform="scaleX(1)";

    }else{

        boss.style.transform="scaleX(-1)";

    }

}

/*=========================================================
ATTACK UPDATE
=========================================================*/

function updateBossAttack(){

    BOSS.attackTimer--;

    if(BOSS.attackTimer>0) return;

    if(BOSS.state!=="attack") return;

    BOSS.attackTimer=BOSS.attackCooldown;

    bossSwordCombo();

}

/*=========================================================
3 HIT COMBO
=========================================================*/

function bossSwordCombo(){

    BOSS.combo++;

    if(BOSS.combo>3){

        BOSS.combo=1;

    }

    boss.classList.remove(

        "bossAttack1",

        "bossAttack2",

        "bossAttack3"

    );

    boss.offsetWidth;

    boss.classList.add(

        "bossAttack"+BOSS.combo

    );

    cameraShake(12,220);

    bossHitPlayer();

}

/*=========================================================
PLAYER DAMAGE
=========================================================*/

function bossHitPlayer(){

    if(PLAYER.invincible) return;

    const distance=Math.hypot(

        PLAYER.x-BOSS.x,

        PLAYER.y-BOSS.y

    );

    if(distance>170) return;

    PLAYER.health-=BOSS.damage;

    PLAYER.health=Math.max(

        PLAYER.health,

        0

    );

    createBloodEffect(

        PLAYER.x,

        PLAYER.y

    );

    flashPlayer();

    knockbackFromBoss();

    if(PLAYER.health<=0){

        playerDie();

    }

}

/*=========================================================
KNOCKBACK
=========================================================*/

function knockbackFromBoss(){

    const angle=Math.atan2(

        PLAYER.y-BOSS.y,

        PLAYER.x-BOSS.x

    );

    PLAYER.x+=Math.cos(angle)*80;

    PLAYER.y+=Math.sin(angle)*80;

}

/*=========================================================
PLAYER ATTACKS BOSS
=========================================================*/

function damageBoss(amount){

    if(!BOSS.active) return;

    if(BOSS.invincible) return;

    BOSS.health-=amount;

    updateBossHealth();

    cameraShake(6,120);

    createBloodEffect(

        BOSS.x,

        BOSS.y

    );

    if(BOSS.health<=0){

        bossDefeated();

        return;

    }

    checkBossPhase();

}

/*=========================================================
PHASE CHECK
=========================================================*/

function checkBossPhase(){

    if(

        BOSS.phase===1 &&

        BOSS.health<650

    ){

        BOSS.phase=2;

        bossPhaseTwo();

    }

    if(

        BOSS.phase===2 &&

        BOSS.health<300

    ){

        BOSS.phase=3;

        bossRageMode();

    }

}
/*=========================================================
PART 3.2C
PHASE 2 + RAGE MODE
=========================================================*/

const BOSS_SKILLS={

    summonCooldown:12000,

    bloodSlashCooldown:9000,

    teleportCooldown:7000,

    moonCooldown:18000,

    summonTimer:0,

    bloodTimer:0,

    teleportTimer:0,

    moonTimer:0

};

/*=========================================================
UPDATE PHASE SKILLS
=========================================================*/

function updateBossSkills(delta){

    if(!BOSS.active) return;

    if(BOSS.intro) return;

    BOSS_SKILLS.summonTimer-=delta;
    BOSS_SKILLS.bloodTimer-=delta;
    BOSS_SKILLS.teleportTimer-=delta;
    BOSS_SKILLS.moonTimer-=delta;

    if(BOSS.phase>=2){

        if(BOSS_SKILLS.summonTimer<=0){

            summonGhostWave();

            BOSS_SKILLS.summonTimer=
            BOSS_SKILLS.summonCooldown;

        }

        if(BOSS_SKILLS.teleportTimer<=0){

            teleportSlash();

            BOSS_SKILLS.teleportTimer=
            BOSS_SKILLS.teleportCooldown;

        }

    }

    if(BOSS.phase>=3){

        if(BOSS_SKILLS.bloodTimer<=0){

            bloodSlashRain();

            BOSS_SKILLS.bloodTimer=
            BOSS_SKILLS.bloodSlashCooldown;

        }

        if(BOSS_SKILLS.moonTimer<=0){

            bloodMoonCurse();

            BOSS_SKILLS.moonTimer=
            BOSS_SKILLS.moonCooldown;

        }

    }

}

/*=========================================================
PHASE TWO
=========================================================*/

function bossPhaseTwo(){

    objectivePopup.innerHTML=

    "PHASE 2<br>THE CURSED KING";

    objectivePopup.classList.add("show");

    setTimeout(()=>{

        objectivePopup.classList.remove("show");

    },3500);

    BOSS.speed+=1;

    BOSS.damage+=10;

    boss.classList.add("phaseTwo");

    cameraShake(20,1200);

}

/*=========================================================
RAGE MODE
=========================================================*/

function bossRageMode(){

    objectivePopup.innerHTML=

    "FINAL PHASE<br>RAGE MODE";

    objectivePopup.classList.add("show");

    setTimeout(()=>{

        objectivePopup.classList.remove("show");

    },3500);

    BOSS.speed+=1.5;

    BOSS.damage+=20;

    BOSS.attackCooldown=1200;

    boss.classList.add("rageMode");

    cameraShake(30,1500);

}

/*=========================================================
SUMMON GHOSTS
=========================================================*/

function summonGhostWave(){

    showNotification("Ghosts Summoned!");

    for(let i=0;i<3;i++){

        createGhost(

            BOSS.x+
            (Math.random()*300-150),

            BOSS.y+
            (Math.random()*300-150)

        );

    }

}

/*=========================================================
TELEPORT SLASH
=========================================================*/

function teleportSlash(){

    boss.classList.add("ghostTeleport");

    setTimeout(()=>{

        boss.classList.remove("ghostTeleport");

    },500);

    const angle=Math.random()*Math.PI*2;

    BOSS.x=

        PLAYER.x+
        Math.cos(angle)*140;

    BOSS.y=

        PLAYER.y+
        Math.sin(angle)*140;

    boss.style.left=BOSS.x+"px";
    boss.style.top=BOSS.y+"px";

    cameraShake(12,250);

}

/*=========================================================
BLOOD SLASH RAIN
=========================================================*/

function bloodSlashRain(){

    showNotification("Blood Slash!");

    for(let i=0;i<10;i++){

        setTimeout(()=>{

            const slash=document.createElement("div");

            slash.className="bloodSlash";

            slash.style.left=

                (PLAYER.x+
                Math.random()*500-250)+"px";

            slash.style.top=

                (PLAYER.y+
                Math.random()*400-200)+"px";

            gameWorld.appendChild(slash);

            setTimeout(()=>{

                slash.remove();

            },1200);

        },i*120);

    }

}

/*=========================================================
BLOOD MOON CURSE
=========================================================*/

function bloodMoonCurse(){

    document.body.classList.add("bloodMoon");

    cameraShake(25,1000);

    PLAYER.spirit-=20;

    PLAYER.spirit=Math.max(

        PLAYER.spirit,

        0

    );

    showNotification("Blood Moon Curse!");

    setTimeout(()=>{

        document.body.classList.remove(

            "bloodMoon"

        );

    },5000);

}
/*=========================================================
PART 4.0A
DYNAMIC WEATHER ENGINE
=========================================================*/

const WEATHER = {

    rain:true,

    fog:true,

    lightning:true,

    wind:true,

    intensity:1,

    lightningDelay:0,

    windAngle:0

};

/*=========================================================
START
=========================================================*/

function startWeather(){

    startRain();

    startFog();

    startWind();

    scheduleLightning();

}

/*=========================================================
RAIN
=========================================================*/

function startRain(){

    const rainLayer=document.getElementById("rainLayer");

    for(let i=0;i<300;i++){

        const drop=document.createElement("div");

        drop.className="rainDrop";

        drop.style.left=Math.random()*100+"%";

        drop.style.animationDelay=

            Math.random()*2+"s";

        drop.style.animationDuration=

            (0.6+Math.random())+"s";

        rainLayer.appendChild(drop);

    }

}

/*=========================================================
FOG
=========================================================*/

function startFog(){

    const fog=document.getElementById("fog");

    let x=0;

    setInterval(()=>{

        x+=0.15;

        fog.style.backgroundPosition=

            x+"px 0";

    },16);

}

/*=========================================================
WIND
=========================================================*/

function startWind(){

    setInterval(()=>{

        WEATHER.windAngle+=0.2;

        document.documentElement.style.setProperty(

            "--wind",

            Math.sin(

                WEATHER.windAngle

            )*6+"deg"

        );

    },16);

}

/*=========================================================
LIGHTNING
=========================================================*/

function scheduleLightning(){

    const delay=

        4000+

        Math.random()*6000;

    setTimeout(()=>{

        lightningStrike();

        scheduleLightning();

    },delay);

}

function lightningStrike(){

    lightning.classList.add("flash");

    cameraShake(12,250);

    thunder.currentTime=0;

    thunder.play();

    setTimeout(()=>{

        lightning.classList.remove("flash");

    },220);

}
/*=========================================================
PART 4.0B
AMBIENT WORLD SYSTEM
=========================================================*/

const AMBIENT = {

    bats:30,

    eyes:18,

    spiders:10,

    leaves:45

};

/*=========================================================
INITIALIZE
=========================================================*/

function initializeAmbientWorld(){

    createBats();

    createEyes();

    createSpiders();

    createLeaves();

}

/*=========================================================
BATS
=========================================================*/

function createBats(){

    const layer=document.getElementById("particleLayer");

    for(let i=0;i<AMBIENT.bats;i++){

        const bat=document.createElement("div");

        bat.className="ambientBat";

        bat.style.left=Math.random()*5000+"px";
        bat.style.top=Math.random()*1200+"px";

        bat.style.animationDelay=
            Math.random()*8+"s";

        bat.style.animationDuration=
            (8+Math.random()*6)+"s";

        layer.appendChild(bat);

    }

}

/*=========================================================
GLOWING EYES
=========================================================*/

function createEyes(){

    const forest=document.getElementById("treeLayer");

    for(let i=0;i<AMBIENT.eyes;i++){

        const eye=document.createElement("div");

        eye.className="glowingEyes";

        eye.style.left=Math.random()*5000+"px";
        eye.style.top=(300+Math.random()*700)+"px";

        eye.style.animationDelay=
            Math.random()*6+"s";

        forest.appendChild(eye);

    }

}

/*=========================================================
SPIDERS
=========================================================*/

function createSpiders(){

    const layer=document.getElementById("graveLayer");

    for(let i=0;i<AMBIENT.spiders;i++){

        const spider=document.createElement("div");

        spider.className="spider";

        spider.style.left=Math.random()*4800+"px";
        spider.style.top=(200+Math.random()*900)+"px";

        spider.style.animationDelay=
            Math.random()*10+"s";

        layer.appendChild(spider);

    }

}

/*=========================================================
LEAVES
=========================================================*/

function createLeaves(){

    const layer=document.getElementById("particleLayer");

    for(let i=0;i<AMBIENT.leaves;i++){

        const leaf=document.createElement("div");

        leaf.className="deadLeaf";

        leaf.style.left=Math.random()*5000+"px";
        leaf.style.top=Math.random()*1000+"px";

        leaf.style.animationDelay=
            Math.random()*5+"s";

        layer.appendChild(leaf);

    }

}

/*=========================================================
FOG PARTICLES
=========================================================*/

function createFogParticle(x,y){

    const fog=document.createElement("div");

    fog.className="fogParticle";

    fog.style.left=x+"px";
    fog.style.top=y+"px";

    gameWorld.appendChild(fog);

    setTimeout(()=>{

        fog.remove();

    },10000);

}

setInterval(()=>{

    createFogParticle(

        CAMERA.x-150,

        Math.random()*1200

    );

},900);

/*=========================================================
AMBIENT AUDIO
=========================================================*/

function playAmbientSound(){

    const sounds=[

        "crow",

        "wolf",

        "wind",

        "whisper"

    ];

    const sound=

        sounds[

            Math.floor(

                Math.random()*sounds.length

            )

        ];

    playSound(sound);

}

setInterval(

    playAmbientSound,

    12000

);

/*=========================================================
RANDOM SHADOW
=========================================================*/

function randomShadow(){

    const shadow=document.createElement("div");

    shadow.className="shadowFigure";

    shadow.style.left=

        PLAYER.x+

        (Math.random()*900-450)+"px";

    shadow.style.top=

        PLAYER.y+

        (Math.random()*500-250)+"px";

    gameWorld.appendChild(shadow);

    setTimeout(()=>{

        shadow.remove();

    },2500);

}

setInterval(()=>{

    if(Math.random()<0.35){

        randomShadow();

    }

},18000);
/*=========================================================
PART 4.0D
FINAL GAME SYSTEM
=========================================================*/

const ENGINE = {

    fps:60,

    lastTime:0,

    delta:0,

    frame:0,

    autoSaveTimer:0,

    weatherTimer:0

};

/*=========================================================
AUTO SAVE
=========================================================*/

function autoSave(){

    const saveData={

        player:{

            x:PLAYER.x,
            y:PLAYER.y,
            health:PLAYER.health,
            spirit:PLAYER.spirit

        },

        boss:{

            health:BOSS.health,
            phase:BOSS.phase,
            defeated:BOSS.defeated

        },

        game:{

            score:GAME.score,
            kills:GAME.kills,
            lanterns:GAME.lanterns,
            checkpoint:GAME.checkpoint||0

        }

    };

    localStorage.setItem(

        "vidlyra_day5_save",

        JSON.stringify(saveData)

    );

}

/*=========================================================
LOAD SAVE
=========================================================*/

function loadSave(){

    const data=

        localStorage.getItem(

            "vidlyra_day5_save"

        );

    if(!data) return;

    const save=JSON.parse(data);

    PLAYER.x=save.player.x;
    PLAYER.y=save.player.y;

    PLAYER.health=save.player.health;
    PLAYER.spirit=save.player.spirit;

    GAME.score=save.game.score;
    GAME.kills=save.game.kills;

    BOSS.health=save.boss.health;
    BOSS.phase=save.boss.phase;
    BOSS.defeated=save.boss.defeated;

}

/*=========================================================
CHECKPOINT
=========================================================*/

function createCheckpoint(x,y){

    GAME.checkpoint={x,y};

    showNotification("Checkpoint Reached");

    autoSave();

}

/*=========================================================
RESPAWN
=========================================================*/

function respawnPlayer(){

    if(!GAME.checkpoint) return;

    PLAYER.x=GAME.checkpoint.x;
    PLAYER.y=GAME.checkpoint.y;

    PLAYER.health=100;
    PLAYER.spirit=100;

    GAME.running=true;
    GAME.gameOver=false;

    gameOverScreen.style.display="none";

}

/*=========================================================
PERFORMANCE
=========================================================*/

function optimizePerformance(){

    if(!GAME.mobile) return;

    WEATHER.intensity=0.6;

    document
        .querySelectorAll(".ambientBat")
        .forEach((bat,index)=>{

            if(index>15){

                bat.remove();

            }

        });

    document
        .querySelectorAll(".deadLeaf")
        .forEach((leaf,index)=>{

            if(index>20){

                leaf.remove();

            }

        });

}

/*=========================================================
FPS COUNTER
=========================================================*/

function updateFPS(delta){

    ENGINE.frame++;

    ENGINE.delta+=delta;

    if(ENGINE.delta>=1000){

        ENGINE.fps=ENGINE.frame;

        ENGINE.frame=0;

        ENGINE.delta=0;

    }

}

/*=========================================================
GAME LOOP
=========================================================*/

function gameLoop(time){

    const delta=

        time-

        ENGINE.lastTime;

    ENGINE.lastTime=time;

    if(GAME.running){

        updatePlayerSystem(delta);

        updateEnemySystem(delta);

        updateAdvancedGhosts();

        updateBoss();

        updateBossSkills(delta);

        updateCinematicEffects();

        cameraLoop();

    }

    ENGINE.autoSaveTimer+=delta;

    if(ENGINE.autoSaveTimer>30000){

        ENGINE.autoSaveTimer=0;

        autoSave();

    }

    updateFPS(delta);

    requestAnimationFrame(gameLoop);

}

/*=========================================================
INITIALIZE
=========================================================*/

function initializeGame(){

    loadSave();

    optimizePerformance();

    initializeGhostTypes();

    initializeAmbientWorld();

    startWeather();

    ENGINE.lastTime=performance.now();

    requestAnimationFrame(gameLoop);

}

/*=========================================================
START
=========================================================*/

window.addEventListener("load",()=>{

    initializeGame();

});
