import { supabase } from "./supabase.js";

"use strict";

const Day5 = {
    user: null,
    started: false,
    finished: false,
    accessGranted: false,
    lightningTriggered: false,
    loadingTimer: null,

    /* ======================================================
       CACHE ELEMENTS
    ====================================================== */

    cache() {
        this.loadingScreen = document.getElementById("loadingScreen");
        this.loadingFill = document.getElementById("loadingFill");

        this.video = document.getElementById("introVideo");
        this.overlay = document.getElementById("overlay");
        this.lightning = document.getElementById("lightningFlash");
        this.fade = document.getElementById("fadeScreen");

        this.title = document.getElementById("titleContainer");
        this.mission = document.getElementById("missionPreview");
        this.subtitle = document.getElementById("subtitleContainer");

        this.skip = document.getElementById("skipButton");
        this.progress = document.getElementById("videoFill");

        this.endOverlay = document.getElementById("endOverlay");
        this.enterButton = document.getElementById("enterButton");

        this.startOverlay = document.getElementById("startOverlay");
        this.startButton = document.getElementById("startButton");

        this.bgMusic = document.getElementById("bgMusic");
        this.thunder = document.getElementById("thunder");
        this.ghostWhisper = document.getElementById("ghostWhisper");
    },

    /* ======================================================
       AUTHENTICATION + DAY 4 ACCESS
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
                .select("day4, day5")
                .eq("user_id", user.id)
                .eq("festival", "halloween_2026")
                .maybeSingle();

            if (error) {
                console.error("Day 5 progress error:", error);
                alert("Unable to load festival progress. Please try again.");
                window.location.href = "map.html";
                return false;
            }

            if (!data) {
                alert("Festival progress was not found for your account.");
                window.location.href = "map.html";
                return false;
            }

            if (data.day4 !== true) {
                alert("🔒 Complete Day 4 before entering Day 5.");
                window.location.href = "map.html";
                return false;
            }

            this.accessGranted = true;

            console.log("👻 Day 5 video access granted.");
            return true;

        } catch (error) {
            console.error("Day 5 access check failed:", error);

            alert("A connection error occurred. Please try again.");
            window.location.href = "map.html";
            return false;
        }
    },

    /* ======================================================
       EVENTS
    ====================================================== */

    bindEvents() {
        if (this.startButton) {
            this.startButton.addEventListener("click", () => {
                this.startExperience();
            });
        }

        if (this.skip) {
            this.skip.addEventListener("click", () => {
                this.finishVideo();
            });
        }

        if (this.enterButton) {
            this.enterButton.addEventListener("click", () => {
                this.enterGame();
            });
        }

        if (this.video) {
            this.video.addEventListener("timeupdate", () => {
                this.updateProgress();
            });

            this.video.addEventListener("ended", () => {
                this.finishVideo();
            });

            this.video.addEventListener("error", () => {
                console.error(
                    "Day 5 video failed to load:",
                    this.video.error
                );

                this.showMessage(
                    "The cinematic video could not load. You can skip to continue."
                );
            });

            this.video.addEventListener("loadedmetadata", () => {
                console.log(
                    "Day 5 cinematic loaded:",
                    this.video.videoWidth,
                    "x",
                    this.video.videoHeight
                );
            });
        }
    },

    /* ======================================================
       START EXPERIENCE
    ====================================================== */

    async startExperience() {
        if (this.started || !this.accessGranted) return;

        this.started = true;

        if (this.startButton) {
            this.startButton.disabled = true;
        }

        if (this.startOverlay) {
            this.startOverlay.classList.add("hide");
        }

        this.playAudio();

        if (this.video) {
            try {
                await this.video.play();
            } catch (error) {
                console.error("Video playback failed:", error);

                this.started = false;

                if (this.startButton) {
                    this.startButton.disabled = false;
                }

                if (this.startOverlay) {
                    this.startOverlay.classList.remove("hide");
                }

                this.showMessage(
                    "Video playback was blocked. Press Start to try again."
                );

                return;
            }
        } else {
            console.error("Missing video element: #introVideo");

            this.started = false;

            if (this.startButton) {
                this.startButton.disabled = false;
            }

            if (this.startOverlay) {
                this.startOverlay.classList.remove("hide");
            }

            return;
        }

        if (this.loadingScreen) {
            this.loadingScreen.classList.add("hide");
        }

        this.showCinematicUI();
        console.log("🎬 Day 5 cinematic started.");
    },

    /* ======================================================
       AUDIO
    ====================================================== */

    playAudio() {
        if (!this.bgMusic) return;

        this.bgMusic.loop = true;
        this.bgMusic.volume = 0.25;

        this.safePlay(this.bgMusic);
    },

    safePlay(audio) {
        if (!audio) return;

        const result = audio.play();

        if (result && typeof result.catch === "function") {
            result.catch((error) => {
                console.warn(
                    `Audio "${audio.id}" could not play:`,
                    error.message
                );
            });
        }
    },

    /* ======================================================
       CINEMATIC UI
    ====================================================== */

    showCinematicUI() {
        this.title?.classList.add("show");
        this.mission?.classList.add("show");
        this.subtitle?.classList.add("show");
        this.skip?.classList.add("show");
    },

    /* ======================================================
       VIDEO PROGRESS
    ====================================================== */

    updateProgress() {
        if (!this.video || !this.progress) return;

        const duration = this.video.duration;

        if (!Number.isFinite(duration) || duration <= 0) return;

        const percent = Math.min(
            100,
            (this.video.currentTime / duration) * 100
        );

        this.progress.style.width = `${percent}%`;

        // Trigger lightning once when the video passes 8 seconds.
        if (
            this.video.currentTime >= 8 &&
            !this.lightningTriggered
        ) {
            this.lightningTriggered = true;
            this.lightningFlash();
        }
    },

    /* ======================================================
       LIGHTNING
    ====================================================== */

    lightningFlash() {
        if (this.lightning) {
            this.lightning.classList.add("active");

            setTimeout(() => {
                this.lightning?.classList.remove("active");
            }, 250);
        }

        if (this.thunder) {
            this.thunder.currentTime = 0;
            this.safePlay(this.thunder);
        }
    },

    /* ======================================================
       FINISH VIDEO
    ====================================================== */

    finishVideo() {
        if (this.finished) return;

        this.finished = true;

        if (this.video) {
            this.video.pause();
        }

        this.skip?.classList.remove("show");

        if (this.progress) {
            this.progress.style.width = "100%";
        }

        if (this.bgMusic) {
            this.bgMusic.volume = 0.12;
        }

        this.showEndOverlay();

        console.log("Day 5 cinematic finished.");
    },

    /* ======================================================
       END SCREEN
    ====================================================== */

    showEndOverlay() {
        if (this.endOverlay) {
            this.endOverlay.classList.add("show");
        }

        if (this.ghostWhisper) {
            this.ghostWhisper.volume = 0.35;
            this.safePlay(this.ghostWhisper);
        }
    },

    /* ======================================================
       ENTER DAY 5 GAME
    ====================================================== */

    enterGame() {
        if (!this.accessGranted) return;

        if (this.enterButton) {
            this.enterButton.disabled = true;
        }

        if (this.fade) {
            this.fade.classList.add("active");
        }

        if (this.video) {
            this.video.pause();
        }

        if (this.bgMusic) {
            this.bgMusic.pause();
        }

        if (this.thunder) {
            this.thunder.pause();
        }

        if (this.ghostWhisper) {
            this.ghostWhisper.pause();
        }

        setTimeout(() => {
            window.location.href = "day5-game.html";
        }, 900);
    },

    /* ======================================================
       SMALL MESSAGE HELPER
    ====================================================== */

    showMessage(message) {
        console.warn(message);

        // Use an existing message element if your HTML has one.
        const messageElement = document.getElementById("videoMessage");

        if (messageElement) {
            messageElement.textContent = message;
            messageElement.classList.add("show");
        }
    },

    /* ======================================================
       INITIALIZE
    ====================================================== */

    async init() {
        this.cache();
        this.bindEvents();

        // Show a loading animation if the element exists.
        this.loadingAnimation();

        const allowed = await this.checkAccess();

        if (!allowed) return;

        // The cinematic starts when the player presses Start.
        // No duplicate overlay or automatic video playback.
        if (this.startOverlay) {
            this.startOverlay.classList.remove("hide");
        }

        if (this.startButton) {
            this.startButton.disabled = false;
        }

        console.log(
            "🎃 VIDLYRA HALLOWEEN FEST 2026 — DAY 5 VIDEO READY"
        );
    },

    /* ======================================================
       LOADING BAR
    ====================================================== */

    loadingAnimation() {
        if (!this.loadingFill) return;

        let progress = 0;

        const update = () => {
            if (progress >= 100) {
                this.loadingFill.style.width = "100%";
                return;
            }

            progress = Math.min(
                100,
                progress + Math.random() * 8
            );

            this.loadingFill.style.width = `${progress}%`;

            this.loadingTimer = setTimeout(update, 120);
        };

        update();
    }
};

/* ==========================================================
   INITIALIZE ONCE
========================================================== */

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        () => Day5.init(),
        { once: true }
    );
} else {
    Day5.init();
}

// Optional debugging in browser console.
window.VidlyraDay5Video = Day5;
