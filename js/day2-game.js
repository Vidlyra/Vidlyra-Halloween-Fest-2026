
/* ===========================================================
   VIDLYRA HALLOWEEN FEST 2026
   DAY 2 - THE HAUNTED WELL
   Supabase + Crystal Click Fix
=========================================================== */

import { supabase } from "./supabase.js";

"use strict";

const Game = {
    // Game state
    runesFound: 0,
    totalRunes: 3,

    user: null,
    supabaseReady: false,
    day2Finished: false,
    savingProgress: false,

    gameStarted: false,
    canMove: false,
    crystalEnabled: false,

    playerX: 15,
    playerY: 12,
    moveSpeed: 0.30,

    keys: {},
    dialogTimer: null,
    gameLoopStarted: false,

    // DOM elements
    cache() {
        this.player = document.getElementById("player");
        this.runes = document.querySelectorAll(".rune");
        this.progress = document.getElementById("progressFill");
        this.counter = document.getElementById("runeCounter");

        this.dialogBox = document.getElementById("dialogBox");
        this.dialog = document.getElementById("dialogText");
        this.intro = document.getElementById("introScreen");
        this.flash = document.getElementById("flash");

        this.ghost = document.querySelector(".ghost");
        this.crystal = document.querySelector(".crystal");

        this.missionComplete =
            document.getElementById("missionComplete");

        this.nextButton = document.getElementById("nextBtn");

        // Audio elements
        this.bgMusic = document.getElementById("bgMusic");
        this.ghostWhisper = document.getElementById("ghostWhisper");
        this.wellRumble = document.getElementById("wellRumble");
        this.magicSound = document.getElementById("magicSound");
        this.rewardSound = document.getElementById("rewardSound");
        this.collectSound = document.getElementById("collectSound");
    },

    // Check login and Day 1 access
    async checkFestivalAccess() {
        try {
            const {
                data: { user },
                error: authError
            } = await supabase.auth.getUser();

            if (authError || !user) {
                window.location.replace("login.html");
                return false;
            }

            this.user = user;

            const { data, error } = await supabase
                .from("festival_progress")
                .select("day1,day2,day3,day4,day5,day6,day7")
                .eq("user_id", user.id)
                .eq("festival", "halloween_2026")
                .maybeSingle();

            if (error) {
                console.error("Progress read error:", error);
                this.showMessage("Unable to load festival progress.");
                return false;
            }

            if (!data) {
                this.showMessage("Festival progress record not found.");
                return false;
            }

            if (data.day1 !== true) {
                alert("🔒 Complete Day 1 first!");
                window.location.replace("map.html");
                return false;
            }

            this.day2Finished = data.day2 === true;
            this.supabaseReady = true;

            console.log("Day 2 access granted:", {
                userId: user.id,
                day1: data.day1,
                day2: data.day2
            });

            return true;
        } catch (error) {
            console.error("Access check failed:", error);
            this.showMessage("Connection error. Please refresh.");
            return false;
        }
    },

    // Initialize
    async init() {
        this.cache();
        this.bindEvents();

        const allowed = await this.checkFestivalAccess();

        if (!allowed) {
            this.canMove = false;
            return;
        }

        this.startIntro();
    },

    // Keyboard and button events
    bindEvents() {
        window.addEventListener("keydown", (event) => {
            this.keys[event.key.toLowerCase()] = true;
        });

        window.addEventListener("keyup", (event) => {
            this.keys[event.key.toLowerCase()] = false;
        });

        this.runes.forEach((rune) => {
            rune.addEventListener("click", () => {
                this.collectRune(rune);
            });
        });

        if (this.nextButton) {
            this.nextButton.addEventListener("click", () => {
                window.location.href = "map.html";
            });
        }
    },

    // Intro screen
    startIntro() {
        this.showMessage("Find the three Ancient Runes...");

        setTimeout(() => {
            if (this.intro) {
                this.intro.classList.add("hide");
            }

            this.startGame();
        }, 5000);
    },

    // Start game
    startGame() {
        this.gameStarted = true;
        this.canMove = !this.day2Finished;

        if (this.bgMusic) {
            this.bgMusic.volume = 0.35;
            this.bgMusic.play().catch(() => {});
        }

        if (this.day2Finished) {
            this.showMessage("🎃 Day 2 is already complete!");
            this.showMissionComplete();
            return;
        }

        this.gameLoop();
    },

    // Game animation loop
    gameLoop() {
        if (!this.gameStarted) return;

        this.updatePlayer();

        requestAnimationFrame(() => this.gameLoop());
    },

    // Player movement
    updatePlayer() {
        if (!this.canMove) return;

        if (this.keys["arrowleft"] || this.keys["a"]) {
            this.playerX -= this.moveSpeed;
        }

        if (this.keys["arrowright"] || this.keys["d"]) {
            this.playerX += this.moveSpeed;
        }

        if (this.keys["arrowup"] || this.keys["w"]) {
            this.playerY += this.moveSpeed;
        }

        if (this.keys["arrowdown"] || this.keys["s"]) {
            this.playerY -= this.moveSpeed;
        }

        this.playerX = Math.max(3, Math.min(94, this.playerX));
        this.playerY = Math.max(5, Math.min(75, this.playerY));

        if (this.player) {
            this.player.style.left = this.playerX + "%";
            this.player.style.bottom = this.playerY + "%";
        }
    },

    // Dialog
    showMessage(message) {
        if (!this.dialogBox || !this.dialog) return;

        this.dialog.textContent = message;
        this.dialogBox.classList.add("show");

        clearTimeout(this.dialogTimer);

        this.dialogTimer = setTimeout(() => {
            this.dialogBox.classList.remove("show");
        }, 3000);
    },

    // Audio helper
    playSound(audio) {
        if (!audio) return;

        try {
            audio.currentTime = 0;
            audio.play().catch(() => {});
        } catch (error) {
            console.warn("Audio playback unavailable:", error);
        }
    },

    // Collect a rune
    collectRune(rune) {
        if (!this.canMove || rune.classList.contains("found")) {
            return;
        }

        rune.classList.add("found");
        rune.style.opacity = "0";
        rune.style.pointerEvents = "none";

        this.runesFound = Math.min(
            this.runesFound + 1,
            this.totalRunes
        );

        if (this.progress) {
            this.progress.style.width =
                (this.runesFound / this.totalRunes * 100) + "%";
        }

        if (this.counter) {
            this.counter.textContent =
                `🔷 Ancient Runes: ${this.runesFound} / ${this.totalRunes}`;
        }

        this.playSound(this.collectSound);
        this.playSound(this.magicSound);

        if (this.runesFound === 1) {
            this.showMessage("The first rune has awakened...");
        } else if (this.runesFound === 2) {
            this.showMessage("A strange energy surrounds the well...");
        } else if (this.runesFound === 3) {
            this.showMessage("The Haunted Well is awakening...");

            // Prevent collecting anything else during the well event.
            this.canMove = false;

            setTimeout(() => this.awakenWell(), 1500);
        }
    },

    // Well animation and ghost event
    awakenWell() {
        this.canMove = false;

        if (this.flash) {
            this.flash.classList.add("active");

            setTimeout(() => {
                this.flash.classList.remove("active");
            }, 500);
        }

        document.body.classList.add("shake");

        setTimeout(() => {
            document.body.classList.remove("shake");
        }, 1200);

        this.playSound(this.wellRumble);
        this.playSound(this.ghostWhisper);

        setTimeout(() => {
            if (this.ghost) {
                this.ghost.classList.add("active");
            }
        }, 1000);

        setTimeout(() => {
            if (this.crystal) {
                this.crystal.classList.add("active");
            }

            this.showMessage("✨ Touch the Magic Crystal!");

            this.enableCrystal();
        }, 3000);
    },

    // Enable crystal interaction
    enableCrystal() {
        if (!this.crystal) {
            console.error(
                'Crystal element ".crystal" was not found in day2-game.html'
            );

            this.showMessage("Magic Crystal is missing from the game page.");
            return;
        }

        this.crystalEnabled = true;

        this.crystal.style.pointerEvents = "auto";
        this.crystal.style.cursor = "pointer";
        this.crystal.style.touchAction = "manipulation";

        // Keep the original position style where possible.
        this.crystal.style.zIndex = "100";

        // Add the handler only once.
        if (this.crystal.dataset.clickBound === "true") {
            return;
        }

        this.crystal.dataset.clickBound = "true";

        this.crystal.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();

            console.log("✨ Magic Crystal clicked!");

            this.collectCrystal();
        });

        // Mobile touchscreen support
        this.crystal.addEventListener("touchend", (event) => {
            if (!this.crystalEnabled) return;

            event.preventDefault();
            this.collectCrystal();
        }, { passive: false });

        console.log("✨ Crystal interaction enabled");
    },

    // Collect the crystal
    collectCrystal() {
        // IMPORTANT:
        // Player movement is disabled during the well event.
        // Do not check canMove here.
        if (
            !this.crystalEnabled ||
            this.day2Finished ||
            this.savingProgress
        ) {
            return;
        }

        this.crystalEnabled = false;
        this.canMove = false;

        this.playSound(this.rewardSound);

        if (this.flash) {
            this.flash.classList.add("active");

            setTimeout(() => {
                this.flash.classList.remove("active");
            }, 400);
        }

        this.showMessage("The Ancient Spirit accepts you...");

        setTimeout(() => {
            this.finishDay();
        }, 1000);
    },

    // Show completion panel
    showMissionComplete() {
        if (this.missionComplete) {
            this.missionComplete.classList.add("show");
        } else {
            console.error(
                'Element "#missionComplete" was not found in day2-game.html'
            );
        }
    },

    // Save completion to Supabase
    async finishDay() {
        if (this.day2Finished) {
            this.showMissionComplete();
            return;
        }

        if (this.savingProgress) return;

        if (!this.user || !this.supabaseReady) {
            this.showMessage("Please log in and reload the game.");
            return;
        }

        this.savingProgress = true;
        this.canMove = false;
        this.showMessage("Saving your progress...");

        try {
            const {
                data: { user },
                error: authError
            } = await supabase.auth.getUser();

            if (authError || !user || user.id !== this.user.id) {
                throw new Error("Login session expired. Please log in again.");
            }

            const { data, error } = await supabase
                .from("festival_progress")
                .update({ day2: true })
                .eq("user_id", user.id)
                .eq("festival", "halloween_2026")
                .select("day2")
                .maybeSingle();

            if (error) {
                throw error;
            }

            if (!data || data.day2 !== true) {
                throw new Error(
                    "No progress row updated. Check the user's progress row and RLS."
                );
            }

            this.day2Finished = true;

            try {
                localStorage.setItem("vidlyra_day2_complete", "true");
                localStorage.setItem(
                    "vidlyra_day2_runes",
                    String(this.runesFound)
                );
            } catch (storageError) {
                console.warn("Local backup unavailable:", storageError);
            }

            console.log("✅ Day 2 completion saved:", data);

            this.showMessage("🎃 Day 2 Complete! Progress saved.");

            setTimeout(() => {
                this.showMissionComplete();
            }, 1000);

        } catch (error) {
            console.error("DAY 2 SAVE ERROR:", error);

            this.showMessage(
                "⚠️ Progress could not be saved. Tap the crystal to retry."
            );

            // Allow retrying the save without replaying the entire event.
            this.crystalEnabled = true;

            if (this.crystal) {
                this.crystal.style.pointerEvents = "auto";
            }

        } finally {
            this.savingProgress = false;
        }
    },

    // Mobile movement controls
    enableTouchControls() {
        let startX = 0;
        let startY = 0;

        window.addEventListener("touchstart", (event) => {
            if (!event.touches.length) return;

            startX = event.touches[0].clientX;
            startY = event.touches[0].clientY;
        }, { passive: true });

        window.addEventListener("touchmove", (event) => {
            if (!this.canMove || !event.touches.length) return;

            const dx = event.touches[0].clientX - startX;
            const dy = event.touches[0].clientY - startY;

            this.playerX += dx * 0.01;
            this.playerY -= dy * 0.01;

            this.playerX = Math.max(3, Math.min(94, this.playerX));
            this.playerY = Math.max(5, Math.min(75, this.playerY));

            startX = event.touches[0].clientX;
            startY = event.touches[0].clientY;
        }, { passive: true });
    },

    // Restart game
    restart() {
        window.location.reload();
    },

    // Return to festival map
    home() {
        window.location.href = "map.html";
    }
};

// Start the game after the HTML is ready.
document.addEventListener("DOMContentLoaded", async () => {
    await Game.init();
    Game.enableTouchControls();
});

// Preserve compatibility with HTML onclick handlers.
window.Game = Game;
