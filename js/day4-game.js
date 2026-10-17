import { supabase } from "./supabase.js";

"use strict";

const Game = {
    // Game state
    lanternsFound: 0,
    totalLanterns: 5,

    playerX: 8,
    playerY: 12,
    speed: 0.5,

    keys: {},
    user: null,

    gameStarted: false,
    day4Completed: false,
    finalSequenceStarted: false,
    completionSaving: false,

    messageTimer: null,
    animationFrame: null,
    introTimer: null,
    thunderTimer: null,

    // Prevent duplicate initialization
    initialized: false,

    /* ======================================================
       INITIALIZATION
    ====================================================== */

    async init() {
        if (this.initialized) return;
        this.initialized = true;

        this.cache();
        this.bindEvents();

        if (!this.player) {
            console.error("Day 4: #player element was not found.");
            return;
        }

        if (this.lanterns.length !== this.totalLanterns) {
            console.warn(
                `Expected ${this.totalLanterns} lanterns, found ${this.lanterns.length}.`
            );
        }

        const allowed = await this.checkAccess();

        if (!allowed) {
            this.gameStarted = false;
            return;
        }

        this.createParticles();
        this.start();
        this.startThunder();
    },

    /* ======================================================
       CACHE HTML ELEMENTS
    ====================================================== */

    cache() {
        this.player = document.getElementById("player");
        this.lanterns = Array.from(
            document.querySelectorAll(".lantern")
        );

        this.progress = document.getElementById("progressFill");
        this.counter = document.getElementById("lanternCounter");

        this.dialog = document.getElementById("dialogText");
        this.dialogBox = document.getElementById("dialogBox");

        this.flash = document.getElementById("flash");
        this.witch = document.querySelector(".witch");
        this.portal = document.querySelector(".portal");
        this.cauldron = document.querySelector(".cauldron");

        this.missionComplete =
            document.getElementById("missionComplete");

        this.nextBtn = document.getElementById("nextBtn");
        this.intro = document.getElementById("introScreen");

        this.bgMusic = document.getElementById("bgMusic");
        this.collectSound = document.getElementById("collectSound");
        this.lanternSound = document.getElementById("lanternSound");
        this.spellSound = document.getElementById("spellSound");
        this.cauldronSound = document.getElementById("cauldronSound");

        this.witchAppear =
            document.getElementById("witchAppearSound");

        this.witchLaugh =
            document.getElementById("witchLaughSound");

        this.portalSound =
            document.getElementById("portalSound");

        this.thunder = document.getElementById("thunderSound");

        this.reward =
            document.getElementById("missionCompleteSound");

        this.particleContainer =
            document.getElementById("particleContainer");

        this.restartBtn = document.getElementById("restartBtn");
    },

    /* ======================================================
       SUPABASE ACCESS CHECK
    ====================================================== */

    async checkAccess() {
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
                .select("day3, day4")
                .eq("user_id", user.id)
                .eq("festival", "halloween_2026")
                .maybeSingle();

            if (error) {
                console.error("Festival progress error:", error);
                alert("Unable to load festival progress. Please try again.");
                window.location.href = "map.html";
                return false;
            }

            if (!data) {
                alert("Festival progress was not found for your account.");
                window.location.href = "map.html";
                return false;
            }

            if (data.day3 !== true) {
                alert("🔒 Complete Day 3 before entering Day 4.");
                window.location.href = "map.html";
                return false;
            }

            this.day4Completed = data.day4 === true;

            console.log("🧙 Day 4 access granted.");
            return true;

        } catch (error) {
            console.error("Day 4 access check failed:", error);
            alert("A connection error occurred. Please try again.");
            window.location.href = "map.html";
            return false;
        }
    },

    /* ======================================================
       EVENTS
    ====================================================== */

    bindEvents() {
        // Click or tap to collect each lantern
        this.lanterns.forEach((lantern, index) => {
            lantern.style.cursor = "pointer";
            lantern.style.pointerEvents = "auto";

            lantern.addEventListener("click", (event) => {
                event.stopPropagation();

                console.log(
                    `Lantern ${index + 1} clicked. Game started:`,
                    this.gameStarted
                );

                this.collectLantern(lantern);
            });
        });

        // Keyboard movement
        document.addEventListener("keydown", (event) => {
            const key = event.key;

            if (
                [
                    "ArrowLeft",
                    "ArrowRight",
                    "ArrowUp",
                    "ArrowDown",
                    " "
                ].includes(key)
            ) {
                event.preventDefault();
            }

            this.keys[key] = true;
        });

        document.addEventListener("keyup", (event) => {
            this.keys[event.key] = false;
        });

        window.addEventListener("blur", () => {
            this.keys = {};
        });

        // Continue to Day 5
        if (this.nextBtn) {
            this.nextBtn.addEventListener("click", () => {
                if (!this.day4Completed) {
                    this.showMessage(
                        "Complete the mission before continuing."
                    );
                    return;
                }

                window.location.href = "day5-video.html";
            });
        }

        // Optional restart buttons
        if (this.restartBtn) {
            this.restartBtn.addEventListener("click", () => {
                this.restartGame();
            });
        }

        document
            .querySelectorAll("[data-restart-game]")
            .forEach((button) => {
                button.addEventListener("click", () => {
                    this.restartGame();
                });
            });
    },

    /* ======================================================
       START GAME
    ====================================================== */

    start() {
        console.log("🎃 Day 4 — The Witch's Curse loaded.");

        this.gameStarted = true;
        this.updateProgress();

        if (this.bgMusic) {
            this.bgMusic.loop = true;
            this.bgMusic.volume = 0.35;
            this.playSound(this.bgMusic);
        }

        if (this.cauldronSound) {
            this.cauldronSound.loop = true;
            this.cauldronSound.volume = 0.25;
            this.playSound(this.cauldronSound);
        }

        if (this.intro) {
            clearTimeout(this.introTimer);

            this.introTimer = setTimeout(() => {
                this.intro?.classList.add("hide");
            }, 5000);
        }

        if (this.day4Completed) {
            this.showMessage(
                "✨ You have completed Day 4 before. Find all five lanterns to replay!"
            );
        } else {
            this.showMessage(
                "🏮 Find and click all 5 Enchanted Lanterns!"
            );
        }

        this.movePlayer();
    },

    /* ======================================================
       PLAYER MOVEMENT
    ====================================================== */

    movePlayer() {
        const update = () => {
            if (!this.gameStarted) {
                this.animationFrame = requestAnimationFrame(update);
                return;
            }

            if (
                this.keys["ArrowLeft"] ||
                this.keys["a"] ||
                this.keys["A"]
            ) {
                this.playerX -= this.speed;
            }

            if (
                this.keys["ArrowRight"] ||
                this.keys["d"] ||
                this.keys["D"]
            ) {
                this.playerX += this.speed;
            }

            if (
                this.keys["ArrowUp"] ||
                this.keys["w"] ||
                this.keys["W"]
            ) {
                this.playerY += this.speed;
            }

            if (
                this.keys["ArrowDown"] ||
                this.keys["s"] ||
                this.keys["S"]
            ) {
                this.playerY -= this.speed;
            }

            this.playerX = Math.max(
                2,
                Math.min(94, this.playerX)
            );

            this.playerY = Math.max(
                5,
                Math.min(82, this.playerY)
            );

            if (this.player) {
                this.player.style.left = `${this.playerX}%`;
                this.player.style.bottom = `${this.playerY}%`;
            }

            this.animationFrame = requestAnimationFrame(update);
        };

        if (this.animationFrame !== null) {
            cancelAnimationFrame(this.animationFrame);
        }

        this.animationFrame = requestAnimationFrame(update);
    },

    /* ======================================================
       COLLECT LANTERN
    ====================================================== */

    collectLantern(lantern) {
        if (
            !this.gameStarted ||
            this.finalSequenceStarted ||
            lantern.classList.contains("collected")
        ) {
            return;
        }

        lantern.classList.add("collected");
        lantern.style.pointerEvents = "none";

        this.playSound(this.collectSound);

        setTimeout(() => {
            this.playSound(this.lanternSound);
        }, 150);

        this.lanternsFound = Math.min(
            this.lanternsFound + 1,
            this.totalLanterns
        );

        this.updateProgress();

        lantern.style.transform = "scale(1.6)";
        lantern.style.opacity = "0";

        this.flashScreen();
        this.showMessage("🏮 Enchanted Lantern Lit!");

        console.log(
            `Lanterns collected: ${this.lanternsFound}/${this.totalLanterns}`
        );

        if (this.lanternsFound >= this.totalLanterns) {
            this.gameStarted = false;

            setTimeout(() => {
                this.beginFinalSequence();
            }, 700);
        }
    },

    /* ======================================================
       UPDATE PROGRESS
    ====================================================== */

    updateProgress() {
        const percentage =
            (this.lanternsFound / this.totalLanterns) * 100;

        if (this.progress) {
            this.progress.style.width = `${percentage}%`;
        }

        if (this.counter) {
            this.counter.textContent =
                `🏮 Enchanted Lanterns: ${this.lanternsFound} / ${this.totalLanterns}`;
        }
    },

    /* ======================================================
       DIALOG MESSAGE
    ====================================================== */

    showMessage(message, duration = 2600) {
        if (!this.dialog || !this.dialogBox) return;

        this.dialog.textContent = message;
        this.dialogBox.classList.add("show");

        clearTimeout(this.messageTimer);

        this.messageTimer = setTimeout(() => {
            this.dialogBox?.classList.remove("show");
        }, duration);
    },

    /* ======================================================
       SCREEN FLASH
    ====================================================== */

    flashScreen() {
        if (!this.flash) return;

        this.flash.classList.add("active");

        setTimeout(() => {
            this.flash?.classList.remove("active");
        }, 130);
    },

    /* ======================================================
       FINAL SEQUENCE
    ====================================================== */

    async beginFinalSequence() {
        if (this.finalSequenceStarted) return;

        this.finalSequenceStarted = true;
        this.gameStarted = false;

        this.showMessage(
            "✨ All five lanterns are lit! The Witch is awakening...",
            4000
        );

        this.playSound(this.spellSound);

        await this.wait(1000);

        this.flashScreen();

        if (this.witch) {
            this.witch.classList.add("active");
        }

        this.playSound(this.witchAppear);

        await this.wait(1800);

        this.playSound(this.witchLaugh);

        this.showMessage(
            "🧙‍♀️ You have broken the Witch's spell!",
            3500
        );

        if (this.portal) {
            this.portal.classList.add("active");
        }

        this.playSound(this.portalSound);

        await this.wait(1500);

        await this.completeMission();
    },

    /* ======================================================
       SAVE COMPLETION
    ====================================================== */

    async completeMission() {
        if (this.completionSaving) return;

        this.completionSaving = true;

        try {
            if (!this.user) {
                throw new Error("No authenticated user found.");
            }

            const { data: existing, error: readError } = await supabase
                .from("festival_progress")
                .select("day3, day4")
                .eq("user_id", this.user.id)
                .eq("festival", "halloween_2026")
                .maybeSingle();

            if (readError) {
                throw readError;
            }

            if (!existing || existing.day3 !== true) {
                throw new Error(
                    "Day 3 completion could not be verified."
                );
            }

            // Preserve the user's existing progress fields.
            const { error: saveError } = await supabase
                .from("festival_progress")
                .update({ day4: true })
                .eq("user_id", this.user.id)
                .eq("festival", "halloween_2026");

            if (saveError) {
                throw saveError;
            }

            this.day4Completed = true;

            console.log("✅ Day 4 completion saved.");

        } catch (error) {
            console.error("Could not save Day 4 completion:", error);

            this.showMessage(
                "All lanterns are lit! Progress saving failed. Check your connection or try again.",
                5000
            );

            this.completionSaving = false;
            return;
        }

        this.completionSaving = false;

        this.playSound(this.reward);

        if (this.missionComplete) {
            this.missionComplete.classList.add("show");
            this.missionComplete.setAttribute("aria-hidden", "false");
        }

        this.showMessage(
            "🎉 Mission complete! The Witch's Curse is broken.",
            5000
        );
    },

    /* ======================================================
       RESTART GAME
    ====================================================== */

    restartGame() {
        clearTimeout(this.messageTimer);
        clearTimeout(this.introTimer);

        this.lanternsFound = 0;
        this.playerX = 8;
        this.playerY = 12;

        this.finalSequenceStarted = false;
        this.completionSaving = false;
        this.gameStarted = true;

        this.keys = {};

        this.lanterns.forEach((lantern) => {
            lantern.classList.remove("collected");
            lantern.style.opacity = "1";
            lantern.style.pointerEvents = "auto";
            lantern.style.transform = "";
        });

        if (this.witch) {
            this.witch.classList.remove("active");
        }

        if (this.portal) {
            this.portal.classList.remove("active");
        }

        if (this.missionComplete) {
            this.missionComplete.classList.remove("show");
            this.missionComplete.setAttribute("aria-hidden", "true");
        }

        if (this.intro) {
            this.intro.classList.add("hide");
        }

        if (this.player) {
            this.player.style.left = `${this.playerX}%`;
            this.player.style.bottom = `${this.playerY}%`;
        }

        this.updateProgress();
        this.showMessage("🏮 Find all five enchanted lanterns!");

        this.movePlayer();
    },

    /* ======================================================
       SOUND HELPER
    ====================================================== */

    playSound(audio) {
        if (!audio) return;

        try {
            if (audio === this.bgMusic || audio === this.cauldronSound) {
                // Keep looping ambience playing if already active.
            } else {
                audio.currentTime = 0;
            }

            const promise = audio.play();

            if (promise && typeof promise.catch === "function") {
                promise.catch((error) => {
                    console.warn(
                        `Audio playback blocked for "${audio.id}".`,
                        error.message
                    );
                });
            }
        } catch (error) {
            console.warn("Audio playback error:", error);
        }
    },

    /* ======================================================
       THUNDER EFFECT
    ====================================================== */

    startThunder() {
        const triggerThunder = () => {
            if (!this.gameStarted) {
                this.thunderTimer = setTimeout(
                    triggerThunder,
                    5000
                );
                return;
            }

            if (this.thunder && Math.random() > 0.55) {
                this.playSound(this.thunder);

                const lightning =
                    document.getElementById("lightning");

                if (lightning) {
                    lightning.style.opacity = "0.75";

                    setTimeout(() => {
                        lightning.style.opacity = "0";
                    }, 100);

                    setTimeout(() => {
                        lightning.style.opacity = "0.4";
                    }, 180);

                    setTimeout(() => {
                        lightning.style.opacity = "0";
                    }, 260);
                }
            }

            this.thunderTimer = setTimeout(
                triggerThunder,
                9000 + Math.random() * 10000
            );
        };

        clearTimeout(this.thunderTimer);

        this.thunderTimer = setTimeout(
            triggerThunder,
            5000
        );
    },

    /* ======================================================
       ATMOSPHERIC PARTICLES
    ====================================================== */

    createParticles() {
        if (!this.particleContainer) return;

        this.particleContainer.replaceChildren();

        for (let i = 0; i < 35; i++) {
            const particle = document.createElement("span");

            particle.className = "day4-particle";

            particle.style.position = "absolute";
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            particle.style.width = `${2 + Math.random() * 4}px`;
            particle.style.height = particle.style.width;
            particle.style.borderRadius = "50%";
            particle.style.background = "#ffb347";
            particle.style.boxShadow = "0 0 8px #ff8a00";
            particle.style.opacity = `${0.25 + Math.random() * 0.65}`;
            particle.style.animation =
                `day4ParticleFloat ${4 + Math.random() * 8}s ease-in-out infinite alternate`;

            this.particleContainer.appendChild(particle);
        }
    },

    /* ======================================================
       WAIT HELPER
    ====================================================== */

    wait(milliseconds) {
        return new Promise((resolve) => {
            setTimeout(resolve, milliseconds);
        });
    }
};

/* ==========================================================
   START AFTER HTML IS READY
========================================================== */

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        Game.init();
    }, { once: true });
} else {
    Game.init();
}

/* Optional debugging access */
window.VidlyraDay4 = Game;
