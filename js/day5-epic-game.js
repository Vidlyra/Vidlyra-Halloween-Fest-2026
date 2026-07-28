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
