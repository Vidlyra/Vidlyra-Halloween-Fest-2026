
/* ===========================================================
   VIDLYRA HALLOWEEN FEST 2026
   DAY 2 - THE HAUNTED WELL
   Supabase Progress Integration
=========================================================== */

import { supabase } from "./supabase.js";

"use strict";

const Game = {
    runesFound: 0,
    totalRunes: 3,

    user: null,
    supabaseReady: false,
    day2Finished: false,
    savingProgress: false,

    gameStarted: false,
    canMove: false,

    playerX: 15,
    playerY: 12,
    moveSpeed: 0.30,

    keys: {},
    dialogTimer: null,

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
        this.missionComplete = document.getElementById("missionComplete");
        this.nextButton = document.getElementById("nextBtn");

        this.bgMusic = document.getElementById("bgMusic");
        this.ghostWhisper = document.getElementById("ghostWhisper");
        this.wellRumble = document.getElementById("wellRumble");
        this.magicSound = document.getElementById("magicSound");
        this.rewardSound = document.getElementById("rewardSound");
        this.collectSound = document.getElementById("collectSound");
    },

    /* ================= ACCESS & PROGRESS ================= */

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
                console.error("Festival progress read error:", error);
                this.showMessage("Unable to load your festival progress.");
                return false;
            }

            if (!data) {
                console.error("No festival progress row found for:", user.id);
                this.showMessage("Festival progress not found. Please contact the festival administrator.");
                return false;
            }

            // Day 2 requires Day 1 completion.
            if (data.day1 !== true) {
                alert("🔒 Complete Day 1 first!");
                window.location.replace("map.html");
                return false;
            }

            this.day2Finished = data.day2 === true;
            this.supabaseReady = true;

            console.log("🎃 Day 2 access granted", {
                userId: user.id,
                day1: data.day1,
                day2: data.day2
            });

            return true;
        } catch (error) {
            console.error("Festival access check failed:", error);
            this.showMessage("Connection error. Please refresh and try again.");
            return false;
        }
    },

    async init() {
        this.cache();
        this.bindEvents();

        const allowed = await this.checkFestivalAccess();

        if (!allowed) {
            this.canMove = false;
            return;
        }

        if (this.day2Finished) {
            this.showMessage("🎃 You have already completed Day 2!");
        }

        this.startIntro();
    },

    /* ================= EVENTS ================= */

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

    /* ================= INTRO ================= */

    startIntro() {
        console.log("Day 2 Loaded");
        this.showMessage("Find the three Ancient Runes...");

        setTimeout(() => {
            if (this.intro) {
                this.intro.classList.add("hide");
            }
            this.startGame();
        }, 5000);
    },

    startGame() {
        this.gameStarted = true;
        this.canMove = !this.day2Finished;

        if (this.bgMusic) {
            this.bgMusic.volume = 0.35;
            this.bgMusic.play().catch(() => {});
        }

        if (this.day2Finished) {
            this.showMissionComplete();
            return;
        }

        this.gameLoop();
    },

    /* ================= GAME LOOP ================= */

    gameLoop() {
        if (!this.gameStarted) return;

        this.updatePlayer();

        requestAnimationFrame(() => this.gameLoop());
    },

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

    /* ================= DIALOG ================= */

    showMessage(message) {
        if (!this.dialogBox || !this.dialog) return;

        // Use textContent rather than innerHTML for messages.
        this.dialog.textContent = message;
        this.dialogBox.classList.add("show");

        clearTimeout(this.dialogTimer);

        this.dialogTimer = setTimeout(() => {
            this.dialogBox.classList.remove("show");
        }, 3000);
    },

    /* ================= COLLECT RUNES ================= */

    collectRune(rune) {
        if (!this.canMove || rune.classList.contains("found")) return;

        rune.classList.add("found");
        rune.style.opacity = "0";
        rune.style.pointerEvents = "none";

        this.runesFound++;

        const percent = (this.runesFound / this.totalRunes) * 100;

        if (this.progress) {
            this.progress.style.width = percent + "%";
        }

        if (this.counter) {
            this.counter.textContent =
                `🔷 Ancient Runes: ${this.runesFound} / ${this.totalRunes}`;
        }

        this.playSound(this.collectSound);
        this.playSound(this.magicSound);

        switch (this.runesFound) {
            case 1:
                this.showMessage("The first rune has awakened...");
                break;

            case 2:
                this.showMessage("A strange energy surrounds the well...");
                break;

            case 3:
                this.showMessage("The Haunted Well is awakening...");
                setTimeout(() => this.awakenWell(), 1500);
                break;
        }
    },

    /* ================= SOUND ================= */

    playSound(audio) {
        if (!audio) return;

        audio.currentTime = 0;
        audio.play().catch((error) => {
            console.debug("Audio playback unavailable:", error.message);
        });
    },

    /* ================= WELL EVENT ================= */

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

            this.showMessage("Touch the Magic Crystal...");
            this.enableCrystal();
        }, 3000);
    },

    /* ================= CRYSTAL ================= */

    enableCrystal() {
        if (!this.crystal) {
            this.showMessage("Magic Crystal is missing from the game page.");
            console.error("Missing .crystal element in day2-game.html");
            return;
        }

        this.crystal.addEventListener("click", () => {
            this.collectCrystal();
        }, { once: true });
    },

    collectCrystal() {
        if (!this.canMove || this.savingProgress || this.day2Finished) return;

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
        }, 1500);
    },

    /* ================= MISSION COMPLETE ================= */

    showMissionComplete() {
        if (this.missionComplete) {
            this.missionComplete.classList.add("show");
        }
    },

    /* ================= SUPABASE SAVE ================= */

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
        this.showMessage("Saving your festival progress...");

        try {
            // Verify the current session before writing progress.
            const {
                data: { user },
                error: authError
            } = await supabase.auth.getUser();

            if (authError || !user || user.id !== this.user.id) {
                throw new Error("Your login session expired. Please log in again.");
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

            // Prevent showing success if no row was updated.
            if (!data || data.day2 !== true) {
                throw new Error(
                    "No progress row was updated. Check the user row and RLS policies."
                );
            }

            this.day2Finished = true;

            try {
                localStorage.setItem("vidlyra_day2_complete", "true");
                localStorage.setItem("vidlyra_day2_runes", String(this.runesFound));
            } catch (storageError) {
                console.warn("Local backup could not be saved:", storageError);
            }

            console.log("✅ Day 2 progress saved to Supabase:", data);

            this.showMessage("🎃 Day 2 Complete! Progress saved.");
            setTimeout(() => this.showMissionComplete(), 1200);

        } catch (error) {
            console.error("DAY 2 SUPABASE SAVE ERROR:", error);

            this.showMessage(
                "⚠️ Progress could not be saved. Check your connection and try again."
            );

            // Allow a retry without recollecting the crystal.
            this.canMove = false;

            if (this.missionComplete) {
                const retryButton = document.getElementById("retrySaveBtn");

                if (retryButton) {
                    retryButton.onclick = () => this.finishDay();
                } else {
                    console.error(
                        "Add a button with id='retrySaveBtn' to retry saving progress."
                    );
                }
            }
        } finally {
            this.savingProgress = false;
        }
    },

    /* ================= MOBILE TOUCH ================= */

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

    /* ================= RESET / HOME ================= */

    restart() {
        window.location.reload();
    },

    home() {
        window.location.href = "map.html";
    }
};

/* ================= START GAME ================= */

document.addEventListener("DOMContentLoaded", async () => {
    await Game.init();
    Game.enableTouchControls();
});

// Keep the existing inline HTML buttons compatible if they call Game methods.
window.Game = Game;
