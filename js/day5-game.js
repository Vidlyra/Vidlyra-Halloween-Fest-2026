/* ==========================================================
   VIDLYRA HALLOWEEN FEST 2026
   DAY 5 — THE HAUNTED CEMETERY
   EPIC GAME JS
========================================================== */

"use strict";

const Game = {

    /* ==========================
       GAME SETTINGS
    ========================== */

    totalLanterns: 7,
    lanternsCollected: 0,

    playerX: 12,
    playerY: 15,

    speed: 0.45,

    keys: {},

    started: false,
    missionActive: false,
    bossActive: false,
    completed: false,

    /* ==========================
       INIT
    ========================== */

    init() {

        this.cache();

        this.bindEvents();

        this.createParticles();

        this.setInitialPositions();

        this.showIntro();

        this.startMovement();

        this.startAmbientEffects();

    },

    /* ==========================
       CACHE ELEMENTS
    ========================== */

    cache() {

        this.player =
            document.getElementById("player");

        this.ghost1 =
            document.getElementById("ghost1");

        this.ghost2 =
            document.getElementById("ghost2");

        this.ghost3 =
            document.getElementById("ghost3");

        this.ghostKing =
            document.getElementById("ghostKing");

        this.portal =
            document.getElementById("portal");

        this.lantern =
            document.getElementById("lantern");

        this.spiritFlame =
            document.getElementById("spiritFlame");

        this.orb =
            document.getElementById("orb");

        this.crow =
            document.getElementById("crow");

        this.dialogueBox =
            document.getElementById("dialogueBox");

        this.dialogueText =
            document.getElementById("dialogueText");

        this.speaker =
            document.getElementById("speaker");

        this.missionPanel =
            document.getElementById("missionPanel");

        this.beginMission =
            document.getElementById("beginMission");

        this.lightning =
            document.getElementById("lightning");

        this.particleContainer =
            document.getElementById("particleContainer");

        /* AUDIO */

        this.bgm =
            document.getElementById("bgm");

        this.whisper =
            document.getElementById("ghostWhisper");

        this.appearSound =
            document.getElementById("ghostAppear");

        this.kingSound =
            document.getElementById("ghostKingSound");

        this.spiritLight =
            document.getElementById("spiritLight");

        this.collectSound =
            document.getElementById("collectSound");

        this.thunder =
            document.getElementById("thunder");

        this.portalSound =
            document.getElementById("portalSound");

        this.missionComplete =
            document.getElementById("missionComplete");

        this.battleMusic =
            document.getElementById("battleMusic");

    },

    /* ==========================
       EVENTS
    ========================== */

    bindEvents() {

        /* Keyboard */

        document.addEventListener(
            "keydown",
            (event) => {

                this.keys[event.key] = true;

            }
        );

        document.addEventListener(
            "keyup",
            (event) => {

                this.keys[event.key] = false;

            }
        );

        /* Begin mission */

        if (this.beginMission) {

            this.beginMission.addEventListener(
                "click",
                () => {

                    this.startMission();

                }
            );

        }

        /* Lantern */

        if (this.lantern) {

            this.lantern.addEventListener(
                "click",
                () => {

                    this.collectLantern();

                }
            );

        }

        /* Portal */

        if (this.portal) {

            this.portal.addEventListener(
                "click",
                () => {

                    this.escapeThroughPortal();

                }
            );

        }

    },

    /* ==========================
       INITIAL POSITION
    ========================== */

    setInitialPositions() {

        if (!this.player) return;

        this.player.style.left =
            this.playerX + "%";

        this.player.style.bottom =
            this.playerY + "%";

    },

    /* ==========================
       INTRO
    ========================== */

    showIntro() {

        this.setDialogue(
            "Narrator",
            "The Forgotten Cemetery awaits..."
        );

        setTimeout(() => {

            this.setDialogue(
                "Spirit",
                "Seven Spirit Lanterns have been scattered across the cemetery."
            );

        }, 3500);

        setTimeout(() => {

            this.setDialogue(
                "Narrator",
                "Find them before the Ghost King awakens."
            );

        }, 7000);

    },

    /* ==========================
       START MISSION
    ========================== */

    startMission() {

        if (this.missionActive) return;

        this.missionActive = true;
        this.started = true;

        if (this.missionPanel) {

            this.missionPanel.classList.remove("show");

        }

        this.setDialogue(
            "Ancient Spirit",
            "Your mission begins..."
        );

        this.playSound(this.bgm, 0.35);

        setTimeout(() => {

            this.setDialogue(
                "Narrator",
                "Explore the cemetery and restore the Spirit Lanterns."
            );

        }, 2500);

        this.revealWorld();

    },

    /* ==========================
       REVEAL WORLD
    ========================== */

    revealWorld() {

        if (this.ghost1)
            this.ghost1.classList.add("ghostShow");

        setTimeout(() => {

            if (this.ghost2)
                this.ghost2.classList.add("ghostShow");

        }, 900);

        setTimeout(() => {

            if (this.ghost3)
                this.ghost3.classList.add("ghostShow");

        }, 1800);

        if (this.spiritFlame) {

            this.spiritFlame.classList.add("fadeIn");

        }

        if (this.lantern) {

            this.lantern.classList.add("fadeIn");

        }

        if (this.orb) {

            this.orb.classList.add("fadeIn");

        }

    },

    /* ==========================
       PLAYER MOVEMENT
    ========================== */

    startMovement() {

        const loop = () => {

            if (this.started && !this.completed) {

                this.updatePlayer();

            }

            requestAnimationFrame(loop);

        };

        requestAnimationFrame(loop);

    },

    updatePlayer() {

        let moving = false;

        /* LEFT */

        if (
            this.keys["ArrowLeft"] ||
            this.keys["a"] ||
            this.keys["A"]
        ) {

            this.playerX -= this.speed;

            moving = true;

        }

        /* RIGHT */

        if (
            this.keys["ArrowRight"] ||
            this.keys["d"] ||
            this.keys["D"]
        ) {

            this.playerX += this.speed;

            moving = true;

        }

        /* UP */

        if (
            this.keys["ArrowUp"] ||
            this.keys["w"] ||
            this.keys["W"]
        ) {

            this.playerY += this.speed;

            moving = true;

        }

        /* DOWN */

        if (
            this.keys["ArrowDown"] ||
            this.keys["s"] ||
            this.keys["S"]
        ) {

            this.playerY -= this.speed;

            moving = true;

        }

        /* BOUNDARIES */

        this.playerX =
            Math.max(
                3,
                Math.min(96, this.playerX)
            );

        this.playerY =
            Math.max(
                8,
                Math.min(85, this.playerY)
            );

        /* APPLY */

        if (this.player) {

            this.player.style.left =
                this.playerX + "%";

            this.player.style.bottom =
                this.playerY + "%";

            if (moving) {

                this.player.classList.add(
                    "playerMoving"
                );

            } else {

                this.player.classList.remove(
                    "playerMoving"
                );

            }

        }

        /* Lantern proximity */

        if (this.missionActive) {

            this.checkLanternDistance();

        }

        /* Portal proximity */

        if (
            this.lanternsCollected >=
            this.totalLanterns
        ) {

            this.checkPortalDistance();

        }

    },

    /* ==========================
       LANTERN DISTANCE
    ========================== */

    checkLanternDistance() {

        if (!this.lantern) return;

        if (
            this.lantern.classList.contains(
                "collected"
            )
        ) return;

        const rect =
            this.lantern.getBoundingClientRect();

        const playerRect =
            this.player.getBoundingClientRect();

        const distance =
            Math.hypot(
                rect.left - playerRect.left,
                rect.top - playerRect.top
            );

        if (distance < 100) {

            this.setDialogue(
                "Spirit",
                "The Spirit Lantern is near..."
            );

        }

    },

    /* ==========================
       COLLECT LANTERN
    ========================== */

    collectLantern() {

        if (!this.missionActive) return;

        if (
            this.lanternsCollected >=
            this.totalLanterns
        ) return;

        this.lanternsCollected++;

        this.playSound(
            this.collectSound,
            0.7
        );

        this.playSound(
            this.spiritLight,
            0.7
        );

        if (this.lantern) {

            this.lantern.classList.add(
                "collected"
            );

            this.lantern.style.pointerEvents =
                "none";

            this.lantern.style.transform =
                "scale(1.5)";

            this.lantern.style.opacity =
                "0.35";

        }

        this.setDialogue(
            "Spirit",
            "Spirit Lantern restored! " +
            this.lanternsCollected +
            " / " +
            this.totalLanterns
        );

        this.flash();

        if (
            this.lanternsCollected >=
            this.totalLanterns
        ) {

            setTimeout(() => {

                this.activateBoss();

            }, 1800);

        }

    },

    /* ==========================
       BOSS
    ========================== */

    activateBoss() {

        this.bossActive = true;

        this.setDialogue(
            "Ghost King",
            "You have awakened me..."
        );

        this.playSound(
            this.kingSound,
            0.9
        );

        if (this.bgm) {

            this.bgm.pause();

        }

        if (this.battleMusic) {

            this.battleMusic.volume = 0.55;

            this.battleMusic.play()
                .catch(() => {});

        }

        this.flash();

        if (this.ghostKing) {

            this.ghostKing.classList.add(
                "kingAppear"
            );

        }

        setTimeout(() => {

            this.openPortal();

        }, 4500);

    },

    /* ==========================
       OPEN PORTAL
    ========================== */

    openPortal() {

        this.setDialogue(
            "Ancient Spirit",
            "The Ghost King's seal is broken. Escape through the portal!"
        );

        if (this.portal) {

            this.portal.classList.add(
                "portalOpen"
            );

        }

        this.playSound(
            this.portalSound,
            0.8
        );

        this.flash();

    },

    /* ==========================
       PORTAL DISTANCE
    ========================== */

    checkPortalDistance() {

        if (!this.portal) return;

        if (
            !this.portal.classList.contains(
                "portalOpen"
            )
        ) return;

        const rect =
            this.portal.getBoundingClientRect();

        const playerRect =
            this.player.getBoundingClientRect();

        const distance =
            Math.hypot(
                rect.left - playerRect.left,
                rect.top - playerRect.top
            );

        if (distance < 120) {

            this.setDialogue(
                "Portal",
                "The portal is ready. Click it to escape."
            );

        }

    },

    /* ==========================
       ESCAPE
    ========================== */

    escapeThroughPortal() {

        if (!this.portal) return;

        if (
            !this.portal.classList.contains(
                "portalOpen"
            )
        ) return;

        if (this.completed) return;

        this.completed = true;

        this.started = false;

        this.setDialogue(
            "Narrator",
            "Day 5 Complete. The journey continues..."
        );

        this.playSound(
            this.missionComplete,
            0.9
        );

        if (this.battleMusic) {

            this.battleMusic.pause();

        }

        this.portal.classList.add(
            "portalVictory"
        );

        setTimeout(() => {

            this.showCompletion();

        }, 2500);

    },

    /* ==========================
       COMPLETION
    ========================== */

    showCompletion() {

        this.setDialogue(
            "VIDLYRA",
            "DAY 5 COMPLETE — THE HAUNTED CEMETERY"
        );

        const next =
            document.createElement("div");

        next.id = "dayComplete";

        next.innerHTML = `
            <div class="day-complete-card">

                <div class="complete-icon">✦</div>

                <h1>DAY 5 COMPLETE</h1>

                <h2>THE HAUNTED CEMETERY</h2>

                <p>
                    The Ghost King has been sealed.
                    The path to Day 6 is open.
                </p>

                <button id="continueDay6">
                    CONTINUE TO DAY 6 →
                </button>

            </div>
        `;

        document.body.appendChild(next);

        const button =
            document.getElementById(
                "continueDay6"
            );

        if (button) {

            button.addEventListener(
                "click",
                () => {

                    window.location.href =
                        "day6-video.html";

                }
            );

        }

    },

    /* ==========================
       DIALOGUE
    ========================== */

    setDialogue(
        speaker,
        text
    ) {

        if (this.speaker) {

            this.speaker.textContent =
                speaker;

        }

        if (this.dialogueText) {

            this.dialogueText.textContent =
                text;

        }

        if (this.dialogueBox) {

            this.dialogueBox.classList.add(
                "show"
            );

        }

    },

    /* ==========================
       FLASH
    ========================== */

    flash() {

        if (!this.lightning) return;

        this.lightning.classList.add(
            "active"
        );

        setTimeout(() => {

            this.lightning.classList.remove(
                "active"
            );

        }, 400);

    },

    /* ==========================
       AUDIO
    ========================== */

    playSound(
        audio,
        volume = 0.5
    ) {

        if (!audio) return;

        audio.volume = volume;

        audio.currentTime = 0;

        audio.play().catch(() => {});

    },

    /* ==========================
       PARTICLES
    ========================== */

    createParticles() {

        if (!this.particleContainer)
            return;

        this.particleContainer.innerHTML =
            "";

        for (
            let i = 0;
            i < 80;
            i++
        ) {

            const particle =
                document.createElement(
                    "div"
                );

            particle.className =
                "particle";

            particle.style.left =
                Math.random() * 100 + "%";

            particle.style.top =
                Math.random() * 100 + "%";

            particle.style.animationDelay =
                Math.random() * 8 + "s";

            particle.style.animationDuration =
                5 + Math.random() * 8 + "s";

            this.particleContainer.appendChild(
                particle
            );

        }

    },

    /* ==========================
       AMBIENT EFFECTS
    ========================== */

    startAmbientEffects() {

        /* Random lightning */

        setInterval(() => {

            if (
                this.missionActive &&
                !this.completed &&
                Math.random() > 0.45
            ) {

                this.flash();

                this.playSound(
                    this.thunder,
                    0.35
                );

            }

        }, 9000);

        /* Ghost whispers */

        setInterval(() => {

            if (
                this.missionActive &&
                !this.completed &&
                Math.random() > 0.55
            ) {

                this.playSound(
                    this.whisper,
                    0.25
                );

            }

        }, 12000);

        /* Crow movement */

        if (this.crow) {

            this.crow.classList.add(
                "crowFly"
            );

        }

    }

};

/* ==========================================================
   START
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        Game.init();

    }
);

/* ==========================================================
   ESC KEY
========================================================== */

document.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "Escape") {

            Game.setDialogue(
                "Narrator",
                "The cemetery waits in silence..."
            );

        }

    }
);

/* ==========================================================
   VISIBILITY
========================================================== */

document.addEventListener(
    "visibilitychange",
    () => {

        if (document.hidden) {

            if (Game.bgm)
                Game.bgm.pause();

            if (Game.battleMusic)
                Game.battleMusic.pause();

        }

    }
);
