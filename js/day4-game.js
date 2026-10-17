/* ==========================================================
   VIDLYRA HALLOWEEN FEST 2026
   DAY 4 — THE WITCH'S CURSE
   Fixed Full JavaScript
========================================================== */

import { supabase } from "./supabase.js";

"use strict";

const Game = {
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

    /* ======================================================
       INITIALIZATION
    ====================================================== */

    async init() {
        this.cache();
        this.bindEvents();

        const allowed = await this.checkAccess();

        if (!allowed) return;

        this.createParticles();
        this.start();
        this.startThunder();
    },

    /* ======================================================
       CACHE DOM ELEMENTS
    ====================================================== */

    cache() {
        this.player = document.getElementById("player");
        this.lanterns = document.querySelectorAll(".lantern");

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

        this.thunder =
            document.getElementById("thunderSound");

        this.reward =
            document.getElementById("missionCompleteSound");

        this.particleContainer =
            document.getElementById("particleContainer");

        this.restartBtn =
            document.getElementById("restartBtn");

        // The game expects exactly five lanterns.
        if (this.lanterns.length !== this.totalLanterns) {
            console.warn(
                `Day 4 expects ${this.totalLanterns} lanterns, ` +
                `but found ${this.lanterns.length}.`
            );
        }
    },

    /* ======================================================
       SUPABASE ACCESS
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

            const {
                data,
                error
            } = await supabase
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

            // Day 3 must be completed first.
            if (data.day3 !== true) {
                alert("🔒 Complete Day 3 before entering Day 4.");
                window.location.href = "map.html";
                return false;
            }

            this.day4Completed = data.day4 === true;

            console.log("🧙 Day 4 access granted.");

            if (this.day4Completed) {
                console.log("✅ Day 4 was previously completed.");
            }

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
        this.lanterns.forEach((lantern) => {
            lantern.addEventListener("click", () => {
                this.collectLantern(lantern);
            });
        });

        document.addEventListener("keydown", (event) => {
            const key = event.key;

            if (
                key === "ArrowLeft" ||
                key === "ArrowRight" ||
                key === "ArrowUp" ||
                key === "ArrowDown" ||
                key === " "
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

        if (this.restartBtn) {
            this.restartBtn.addEventListener("click", () => {
                this.restartGame();
            });
        }

        // Optional restart buttons can also use this ID.
        const restartButtons =
            document.querySelectorAll("[data-restart-game]");

        restartButtons.forEach((button) => {
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
                "✅ Day 4 already completed! You may replay the mission."
            );
        } else {
            this.showMessage("Find all 5 Enchanted Lanterns.");
        }

        this.movePlayer();
    },

    /* ======================================================
       PLAYER MOVEMENT
    ====================================================== */

    movePlayer() {
        const update = () => {
            if (!this.gameStarted) {
                this.animationFrame =
                    requestAnimationFrame(update);
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
                3,
                Math.min(95, this.playerX)
            );

            this.playerY = Math.max(
                8,
                Math.min(82, this.playerY)
            );

            if (this.player) {
                this.player.style.left = `${this.playerX}%`;
                this.player.style.bottom = `${this.playerY}%`;
            }

            this.animationFrame =
                requestAnimationFrame(update);
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

        if (this.lanternsFound >= this.totalLanterns) {
            this.gameStarted = false;

            setTimeout(() => {
                this.beginFinalSequence();
