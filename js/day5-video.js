import { supabase } from "./supabase.js";

"use strict";

const Day5 = {
  user: null,
  started: false,
  finished: false,
  enteringGame: false,
  thunderPlayed: false,
  whisperPlayed: false,

  /* ==========================================================
     CACHE HTML ELEMENTS
     ========================================================== */

  cache() {
    const get = id => document.getElementById(id);

    this.loadingScreen = get("loadingScreen");
    this.loadingFill = get("loadingFill");

    this.video = get("introVideo");
    this.overlay = get("overlay");
    this.lightning = get("lightningFlash");
    this.fade = get("fadeScreen");

    this.title = get("titleContainer");
    this.mission = get("missionPreview");
    this.subtitle = get("subtitleContainer");
    this.storySubtitle = get("storySubtitle");

    this.skip = get("skipButton");
    this.progress = get("videoFill");

    this.endOverlay = get("endOverlay");
    this.enterButton = get("enterButton");

    this.startOverlay = get("startOverlay");
    this.startButton = get("startButton");

    this.bgMusic = get("bgMusic");
    this.thunder = get("thunder");
    this.ghostWhisper = get("ghostWhisper");

    if (!this.video) {
      console.error("❌ Missing #introVideo in Day 5 HTML.");
    }

    if (!this.startButton) {
      console.error("❌ Missing #startButton in Day 5 HTML.");
    }

    if (!this.enterButton) {
      console.error("❌ Missing #enterButton in Day 5 HTML.");
    }
  },

  /* ==========================================================
     INITIALIZE
     ========================================================== */

  async init() {
    this.cache();
    this.prepareUI();
    this.bindEvents();

    this.configureAudio();
    await this.loadingAnimation();

    const allowed = await this.checkAccess();

    if (!allowed) return;

    this.showStartScreen();

    console.log(
      "🎃 VIDLYRA HALLOWEEN FEST 2026 — DAY 5 READY"
    );
  },

  prepareUI() {
    if (this.startOverlay) {
      this.startOverlay.style.display = "none";
      this.startOverlay.style.opacity = "0";
      this.startOverlay.style.visibility = "hidden";
      this.startOverlay.style.pointerEvents = "none";
    }

    if (this.endOverlay) {
      this.endOverlay.classList.remove("show");
    }

    if (this.title) {
      this.title.classList.remove("show");
    }

    if (this.mission) {
      this.mission.classList.remove("show");
    }

    if (this.subtitle) {
      this.subtitle.style.display = "none";
    }

    if (this.skip) {
      this.skip.style.display = "none";
    }

    const progressBar = document.getElementById("videoProgress");

    if (progressBar) {
      progressBar.style.display = "none";
    }

    if (this.progress) {
      this.progress.style.width = "0%";
    }

    if (this.fade) {
      this.fade.style.opacity = "0";
      this.fade.classList.remove("active");
    }

    if (this.video) {
      this.video.pause();
      this.video.muted = true;
      this.video.playsInline = true;
    }
  },

  configureAudio() {
    if (this.bgMusic) {
      this.bgMusic.volume = 0.25;
      this.bgMusic.loop = true;
    }

    if (this.thunder) {
      this.thunder.volume = 0.7;
    }

    if (this.ghostWhisper) {
      this.ghostWhisper.volume = 0.35;
    }
  },

  /* ==========================================================
     SUPABASE — LOGIN AND DAY 4 ACCESS
     ========================================================== */

  async checkAccess() {
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
        .select("day4, day5")
        .eq("user_id", user.id)
        .eq("festival", "halloween_2026")
        .maybeSingle();

      if (error) {
        console.error("❌ Supabase progress error:", error);

        this.showError(
          "Unable to check festival progress. Please refresh and try again."
        );

        return false;
      }

      if (!data) {
        this.showError(
          "Festival progress was not found for your account."
        );

        return false;
      }

      if (data.day4 !== true) {
        alert("🔒 Complete Day 4 before entering Day 5.");
        window.location.replace("map.html");
        return false;
      }

      console.log("👻 Day 5 access granted.");

      return true;
    } catch (error) {
      console.error("❌ Day 5 access check failed:", error);

      this.showError(
        "Connection error while checking access. Please reload the page."
      );

      return false;
    }
  },

  showError(message) {
    if (this.loadingScreen) {
      this.loadingScreen.style.display = "grid";
      this.loadingScreen.style.opacity = "1";
      this.loadingScreen.style.visibility = "visible";

      const label = this.loadingScreen.querySelector(".loading-label");

      if (label) {
        label.textContent = message;
        label.style.whiteSpace = "normal";
        label.style.lineHeight = "1.8";
      }
    } else {
      alert(message);
    }
  },

  /* ==========================================================
     LOADING ANIMATION
     ========================================================== */

  async loadingAnimation() {
    const screen = this.loadingScreen;
    const fill = this.loadingFill;

    if (screen) {
      screen.style.display = "grid";
      screen.style.opacity = "1";
      screen.style.visibility = "visible";
    }

    if (fill) {
      fill.style.width = "0%";
    }

    const video = this.video;

    if (video) {
      try {
        video.load();
      } catch (error) {
        console.warn("Video preload warning:", error);
      }
    }

    const start = Date.now();
    const duration = 1400;

    await new Promise(resolve => {
      const tick = () => {
        const elapsed = Date.now() - start;
        const percentage = Math.min(
          100,
          (elapsed / duration) * 100
        );

        if (fill) {
          fill.style.width = `${percentage}%`;
        }

        if (percentage >= 100) {
          resolve();
        } else {
          requestAnimationFrame(tick);
        }
      };

      requestAnimationFrame(tick);
    });

    if (screen) {
      screen.style.opacity = "0";
      screen.style.visibility = "hidden";

      await this.delay(850);

      screen.style.display = "none";
    }
  },

  /* ==========================================================
     SHOW START SCREEN
     ========================================================== */

  showStartScreen() {
    if (!this.startOverlay) return;

    this.startOverlay.style.display = "grid";

    requestAnimationFrame(() => {
      this.startOverlay.style.opacity = "1";
      this.startOverlay.style.visibility = "visible";
      this.startOverlay.style.pointerEvents = "auto";
    });
  },

  /* ==========================================================
     EVENTS
     ========================================================== */

  bindEvents() {
    this.startButton?.addEventListener("click", () => {
      this.startExperience();
    });

    this.skip?.addEventListener("click", () => {
      this.finishVideo();
    });

    this.enterButton?.addEventListener("click", () => {
      this.enterGame();
    });

    this.video?.addEventListener("timeupdate", () => {
      this.updateProgress();
      this.updateTimeline();
      this.updateSubtitles();
    });

    this.video?.addEventListener("ended", () => {
      this.finishVideo();
    });

    this.video?.addEventListener("loadedmetadata", () => {
      console.log(
        `🎬 Day 5 video loaded: ${this.video.videoWidth} × ${this.video.videoHeight}`
      );
    });

    this.video?.addEventListener("error", () => {
      console.error(
        "❌ Could not load video:",
        this.video.currentSrc,
        this.video.error
      );

      this.showError(
        "The Day 5 video could not load. Check assets/video/day5-intro.mp4."
      );
    });

    this.lightning?.addEventListener("animationend", () => {
      this.lightning.classList.remove("active");
    });
  },

  /* ==========================================================
     START EXPERIENCE
     Audio is initiated only after the user's click.
     ========================================================== */

  async startExperience() {
    if (this.started || !this.video) return;

    this.started = true;

    if (this.startButton) {
      this.startButton.disabled = true;
    }

    if (this.startOverlay) {
      this.startOverlay.style.opacity = "0";
      this.startOverlay.style.visibility = "hidden";
      this.startOverlay.style.pointerEvents = "none";

      await this.delay(450);

      this.startOverlay.style.display = "none";
    }

    if (this.video) {
      this.video.currentTime = 0;
      this.video.muted = true;
    }

    /*
     * Initiate audio playback inside the user's click flow.
     */
    const musicPromise = this.playAudio(this.bgMusic, "music");
    const videoPromise = this.video.play();

    try {
      await videoPromise;
    } catch (error) {
      console.error("❌ Video playback failed:", error);

      this.started = false;

      if (this.startOverlay) {
        this.startOverlay.style.display = "grid";
        this.startOverlay.style.opacity = "1";
        this.startOverlay.style.visibility = "visible";
        this.startOverlay.style.pointerEvents = "auto";
      }

      if (this.startButton) {
        this.startButton.disabled = false;
        this.startButton.textContent = "RETRY EXPERIENCE";
      }

      return;
    }

    await musicPromise;

    const progressBar = document.getElementById("videoProgress");

    if (progressBar) {
      progressBar.style.display = "block";
    }

    if (this.skip) {
      this.skip.style.display = "block";
    }

    if (this.subtitle) {
      this.subtitle.style.display = "flex";
    }

    console.log("▶️ Day 5 cinematic playing.");
  },

  async playAudio(audio, name) {
    if (!audio) {
      console.warn(`Audio element not found: ${name}`);
      return false;
    }

    try {
      const result = audio.play();

      if (result && typeof result.then === "function") {
        await result;
      }

      return true;
    } catch (error) {
      console.warn(`Audio "${name}" could not play:`, error);
      return false;
    }
  },

  /* ==========================================================
     TIMELINE EFFECTS
     ========================================================== */

  updateTimeline() {
    if (!this.video || !this.started || this.finished) return;

    const time = this.video.currentTime;

    if (time >= 2 && time < 8) {
      this.title?.classList.add("show");
    } else {
      this.title?.classList.remove("show");
    }

    if (time >= 12) {
      this.mission?.classList.add("show");
    } else {
      this.mission?.classList.remove("show");
    }

    /*
     * Thunder and lightning play only once per cinematic.
     */
    if (time >= 8.5 && !this.thunderPlayed) {
      this.thunderPlayed = true;
      this.playThunder();
    }
  },

  async playThunder() {
    if (this.finished || !this.started) return;

    if (this.lightning) {
      this.lightning.classList.remove("active");

      // Force a reflow so the animation can restart.
      void this.lightning.offsetWidth;

      this.lightning.classList.add("active");
    }

    if (this.thunder) {
      this.thunder.currentTime = 0;
      await this.playAudio(this.thunder, "thunder");
    }
  },

  /* ==========================================================
     SUBTITLES
     Adjust timings to match the actual video.
     ========================================================== */

  updateSubtitles() {
    if (!this.video || !this.storySubtitle) return;

    const time = this.video.currentTime;

    const captions = [
      [0, 4, "When the final light fades, the spirit world awakens..."],
      [4, 9, "Seven ancient lanterns guard the boundary between worlds."],
      [9, 14, "Something ancient is coming for them."],
      [14, 20, "The Ghost King has awakened."],
      [20, 27, "Find the seven Spirit Lanterns before darkness consumes everything."]
    ];

    const current = captions.find(
      ([start, end]) => time >= start && time < end
    );

    this.storySubtitle.textContent = current ? current[2] : "";
  },

  /* ==========================================================
     VIDEO PROGRESS
     ========================================================== */

  updateProgress() {
    if (
      !this.video ||
      !this.progress ||
      !Number.isFinite(this.video.duration) ||
      this.video.duration <= 0
    ) {
      return;
    }

    const percent = Math.min(
      100,
      (this.video.currentTime / this.video.duration) * 100
    );

    this.progress.style.width = `${percent}%`;
  },

  /* ==========================================================
     FINISH INTRO OR SKIP
     This does NOT mark Day 5 complete.
     ========================================================== */

  finishVideo() {
    if (this.finished || !this.started) return;

    this.finished = true;

    if (this.video) {
      this.video.pause();
    }

    if (this.skip) {
      this.skip.style.display = "none";
    }

    if (this.title) {
      this.title.classList.remove("show");
    }

    if (this.mission) {
      this.mission.classList.remove("show");
    }

    if (this.subtitle) {
      this.subtitle.style.display = "none";
    }

    if (this.progress) {
      this.progress.style.width = "100%";
    }

    if (this.bgMusic) {
      this.bgMusic.volume = 0.12;
    }

    if (this.endOverlay) {
      this.endOverlay.classList.add("show");
    }

    if (this.ghostWhisper && !this.whisperPlayed) {
      this.whisperPlayed = true;
      this.ghostWhisper.currentTime = 0;
      this.playAudio(this.ghostWhisper, "ghost whisper");
    }

    console.log("🎬 Cinematic finished. Ready to enter Day 5 game.");
  },

  /* ==========================================================
     ENTER DAY 5 GAME
     ========================================================== */

  async enterGame() {
    if (this.enteringGame || !this.finished) return;

    this.enteringGame = true;

    if (this.enterButton) {
      this.enterButton.disabled = true;
      this.enterButton.textContent = "ENTERING THE SPIRIT WORLD...";
    }

    this.bgMusic?.pause();
    this.thunder?.pause();
    this.ghostWhisper?.pause();

    if (this.fade) {
      this.fade.style.opacity = "1";
      this.fade.classList.add("active");
    }

    await this.delay(900);

    /*
     * This is the playable Day 5 game page.
     * Change only if your actual filename is different.
     */
    window.location.href = "day5-epic-game.html";
  },

  /* ==========================================================
     UTILITIES
     ========================================================== */

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
};

/* ============================================================
   BOOT
   ============================================================ */

function bootDay5() {
  Day5.init().catch(error => {
    console.error("❌ Day 5 initialization failed:", error);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootDay5, {
    once: true
  });
} else {
  bootDay5();
}
