
/* ==========================================================
   VIDLYRA HALLOWEEN FEST 2026
   DAY 3 — THE CURSED FOREST
   Supabase-integrated game controller
========================================================== */

import { supabase } from "./supabase.js";

"use strict";

const Game = {
    crystalsFound: 0,
    totalCrystals: 5,
    user: null,
    festivalReady: false,
    day3Completed: false,
    gameStarted: false,
    canMove: false,
    playerX: 50,
    playerY: 18,
    moveSpeed: 0.35,
    keys: {},
    dialogTimer: null,
    gateOpened: false,
    portalActivated: false,
    completionInProgress: false,
    animationFrame: null,

    cache() {
        const get = id => document.getElementById(id);

        this.introScreen = get("introScreen");
        this.player = get("player");
        this.crystals = document.querySelectorAll(".crystal");
        this.progressFill = get("progressFill");
        this.crystalCounter = get("crystalCounter");
        this.dialogBox = get("dialogBox");
        this.dialogText = get("dialogText");
        this.gate = get("ancientGate");
        this.portal = get("magicPortal");
        this.dracula = get("dracula");
        this.missionComplete = get("missionComplete");
        this.nextBtn = get("nextBtn");
        this.flash = get("flash");
        this.lightning = get("lightningFlash");
        this.screenGlow = get("screenGlow");
        this.shakeLayer = get("shakeLayer");
        this.loadingOverlay = get("loadingOverlay");
        this.loadingFill = get("loadingFill");

        this.bgMusic = get("bgMusic");
        this.rainSound = get("rainSound");
        this.thunderSound = get("thunderSound");
        this.batSound = get("batSound");
        this.crystalSound = get("crystalSound");
        this.gateSound = get("gateSound");
        this.portalSound = get("portalSound");
        this.draculaLaugh = get("draculaLaugh");
        this.missionSound = get("missionSound");
    },

    async init() {
        this.cache();
        this.bindEvents();

        const allowed = await this.checkFestivalAccess();

        if (!allowed) return;

        this.startIntro();
    },

    /* ======================================================
       SUPABASE ACCESS
    ====================================================== */

    async checkFestivalAccess() {
        try {
            const {
                data: { user },
                error: authError
            } = await supabase.auth.getUser();

            if (authError || !user) {
                window.location.href = "login.html";
                return false;
            }

            this.user = user;

            const { data, error } = await supabase
                .from("festival_progress")
                .select("day1, day2, day3")
                .eq("user_id", user.id)
                .eq("festival", "halloween_2026")
                .maybeSingle();

            if (error) {
                console.error("Festival progress error:", error);
                alert("Unable to load festival progress.");
                window.location.href = "map.html";
                return false;
            }

            if (!data) {
                alert("Festival progress not found.");
                window.location.href = "map.html";
                return false;
            }

            if (data.day2 !== true) {
                alert("🔒 Complete Day 2 before entering Day 3.");
                window.location.href = "map.html";
                return false;
            }

            this.day3Completed = data.day3 === true;
            this.festivalReady = true;

            console.log("🌲 Day 3 access granted.");
            return true;
        } catch (error) {
            console.error("Day 3 access check failed:", error);
            alert("Unable to verify festival access.");
            window.location.href = "map.html";
            return false;
        }
    },

    /* ======================================================
       EVENTS
    ====================================================== */

    bindEvents() {
        window.addEventListener("keydown", event => {
            const key = event.key.toLowerCase();
            this.keys[key] = true;

            if (
                ["arrowup", "arrowdown", "arrowleft", "arrowright", " "]
                    .includes(key)
            ) {
                event.preventDefault();
            }
        });

        window.addEventListener("keyup", event => {
            this.keys[event.key.toLowerCase()] = false;
        });

        window.addEventListener("blur", () => {
            this.keys = {};
        });

        this.crystals.forEach(crystal => {
            crystal.addEventListener("click", () => {
                this.collectCrystal(crystal);
            });
        });

        if (this.nextBtn) {
            this.nextBtn.addEventListener("click", () => {
                this.goToMap();
            });
        }

        this.enableTouchControls();
    },

    /* ======================================================
       INTRO
    ====================================================== */

    startIntro() {
        this.showMessage("Enter the Cursed Forest...");

        setTimeout(() => {
            if (this.introScreen) {
                this.introScreen.classList.add("hide");
            }

            this.startGame();
        }, 4500);
    },

    /* ======================================================
       START GAME
    ====================================================== */

    startGame() {
        if (this.gameStarted) return;

        this.gameStarted = true;
        this.canMove = true;

        if (this.bgMusic) {
            this.bgMusic.volume = 0.3;
            this.bgMusic.play().catch(() => {});
        }

        if (this.rainSound) {
            this.rainSound.volume = 0.15;
            this.rainSound.play().catch(() => {});
        }

        this.showMessage("Collect all five Dark Crystals.");
        this.gameLoop();
    },

    /* ======================================================
       GAME LOOP
    ====================================================== */

    gameLoop() {
        if (!this.gameStarted) return;

        if (this.canMove) {
            this.updatePlayer();
        }

        this.animationFrame = requestAnimationFrame(() => {
            this.gameLoop();
        });
    },

    /* ======================================================
       PLAYER MOVEMENT
    ====================================================== */

    updatePlayer() {
        if (!this.canMove || !this.player) return;

        if (this.keys.arrowleft || this.keys.a) {
            this.playerX -= this.moveSpeed;
        }

        if (this.keys.arrowright || this.keys.d) {
            this.playerX += this.moveSpeed;
        }

        if (this.keys.arrowup || this.keys.w) {
            this.playerY += this.moveSpeed;
        }

        if (this.keys.arrowdown || this.keys.s) {
            this.playerY -= this.moveSpeed;
        }

        this.playerX = Math.max(3, Math.min(96, this.playerX));
        this.playerY = Math.max(5, Math.min(82, this.playerY));

        this.player.style.left = `${this.playerX}%`;
        this.player.style.bottom = `${this.playerY}%`;
    },

    /* ======================================================
       CRYSTAL COLLECTION
    ====================================================== */

    collectCrystal(crystal) {
        if (!crystal || !this.canMove) return;
        if (crystal.classList.contains("collected")) return;

        crystal.classList.add("collected");
        crystal.style.pointerEvents = "none";
        crystal.style.opacity = "0";
        crystal.style.transform = "scale(0)";

        if (this.crystalSound) {
            this.crystalSound.currentTime = 0;
            this.crystalSound.play().catch(() => {});
        }

        this.crystalsFound++;

        const percentage =
            (this.crystalsFound / this.totalCrystals) * 100;

        if (this.progressFill) {
            this.progressFill.style.width = `${percentage}%`;
        }

        if (this.crystalCounter) {
            this.crystalCounter.textContent =
                `💎 Dark Crystals : ${this.crystalsFound} / ${this.totalCrystals}`;
        }

        const messages = {
            1: "The forest whispers...",
            2: "Something is watching you.",
            3: "Three crystals awakened.",
            4: "Only one crystal remains...",
            5: "The Ancient Gate is awakening..."
        };

        this.showMessage(messages[this.crystalsFound] || "");

        if (this.crystalsFound >= this.totalCrystals) {
            setTimeout(() => this.openAncientGate(), 1800);
        }
    },

    /* ======================================================
       ANCIENT GATE
    ====================================================== */

    openAncientGate() {
        if (this.gateOpened) return;

        this.gateOpened = true;
        this.canMove = false;

        if (this.gateSound) {
            this.gateSound.currentTime = 0;
            this.gateSound.play().catch(() => {});
        }

        this.flashScreen();
        this.shakeScreen();

        if (this.gate) {
            this.gate.classList.add("open");
        }

        this.showMessage("THE ANCIENT GATE HAS OPENED.");

        setTimeout(() => this.showDracula(), 2200);
    },

    /* ======================================================
       DRACULA
    ====================================================== */

    showDracula() {
        if (this.dracula) {
            this.dracula.classList.add("show");
        }

        if (this.draculaLaugh) {
            this.draculaLaugh.currentTime = 0;
            this.draculaLaugh.play().catch(() => {});
        }

        this.showMessage("A dark presence guards the path...");

        setTimeout(() => this.activatePortal(), 2500);
    },

    /* ======================================================
       PORTAL
    ====================================================== */

    activatePortal() {
        if (this.portalActivated) return;

        this.portalActivated = true;

        if (this.portal) {
            this.portal.classList.add("active");
        }

        if (this.portalSound) {
            this.portalSound.currentTime = 0;
            this.portalSound.play().catch(() => {});
        }

        this.showMessage("The path to the next chapter is open.");

        setTimeout(() => this.completeDay3(), 2500);
    },

    /* ======================================================
       COMPLETE DAY 3 — SUPABASE SAVE
    ====================================================== */

    async completeDay3() {
        if (this.completionInProgress) return;

        if (this.day3Completed) {
            this.showMissionComplete();
            return;
        }

        this.completionInProgress = true;
        this.canMove = false;

        if (!this.user) {
            this.completionInProgress = false;
            window.location.href = "login.html";
            return;
        }

        try {
            const { data, error } = await supabase
                .from("festival_progress")
                .update({ day3: true })
                .eq("user_id", this.user.id)
                .eq("festival", "halloween_2026")
                .select("day3");

            if (error) {
                throw error;
            }

            if (!data || data.length === 0) {
                throw new Error(
                    "No progress row was updated. Check the row and RLS policies."
                );
            }

            this.day3Completed = true;

            if (this.missionSound) {
                this.missionSound.currentTime = 0;
                this.missionSound.play().catch(() => {});
            }

            this.showMessage("🌲 DAY 3 COMPLETE!");

            setTimeout(() => {
                this.showMissionComplete();
            }, 1200);
        } catch (error) {
            console.error("DAY 3 SAVE ERROR:", error);
            this.showMessage("⚠️ Could not save Day 3 progress.");

            // Allow the save attempt to be retried.
            this.completionInProgress = false;
        }
    },

    /* ======================================================
       MISSION COMPLETE SCREEN
    ====================================================== */

    showMissionComplete() {
        if (this.missionComplete) {
            this.missionComplete.classList.add("show");
        }
    },

    /* ======================================================
       DIALOG
    ====================================================== */

    showMessage(message) {
        if (!this.dialogBox || !this.dialogText) return;

        this.dialogText.textContent = message;
        this.dialogBox.classList.add("show");

        clearTimeout(this.dialogTimer);

        this.dialogTimer = setTimeout(() => {
            this.dialogBox.classList.remove("show");
        }, 2800);
    },

    /* ======================================================
       SCREEN EFFECTS
    ====================================================== */

    flashScreen() {
        if (!this.flash) return;

        this.flash.classList.add("active");

        setTimeout(() => {
            this.flash.classList.remove("active");
        }, 500);
    },

    lightningFlash() {
        if (!this.lightning) return;

        this.lightning.classList.add("active");

        if (this.thunderSound) {
            this.thunderSound.currentTime = 0;
            this.thunderSound.play().catch(() => {});
        }

        setTimeout(() => {
            this.lightning.classList.remove("active");
        }, 350);
    },

    shakeScreen() {
        if (!this.shakeLayer) return;

        this.shakeLayer.classList.add("active");

        setTimeout(() => {
            this.shakeLayer.classList.remove("active");
        }, 900);
    },

    /* ======================================================
       MOBILE TOUCH
    ====================================================== */

    enableTouchControls() {
        let startX = 0;
        let startY = 0;

        window.addEventListener("touchstart", event => {
            if (!event.touches || !event.touches[0]) return;

            startX = event.touches[0].clientX;
            startY = event.touches[0].clientY;
        }, { passive: true });

        window.addEventListener("touchmove", event => {
            if (!this.canMove || !event.touches || !event.touches[0]) {
                return;
            }

            const currentX = event.touches[0].clientX;
            const currentY = event.touches[0].clientY;

            this.playerX += (currentX - startX) * 0.012;
            this.playerY -= (currentY - startY) * 0.012;

            this.playerX = Math.max(3, Math.min(96, this.playerX));
            this.playerY = Math.max(5, Math.min(82, this.playerY));

            startX = currentX;
            startY = currentY;
        }, { passive: true });
    },

    /* ======================================================
       RETURN TO MAP
    ====================================================== */

    goToMap() {
        window.location.href = "map.html";
    }
};

/* ==========================================================
   START
========================================================== */

document.addEventListener("DOMContentLoaded", () => {
    Game.init();
});
