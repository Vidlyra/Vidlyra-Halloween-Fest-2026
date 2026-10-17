import { supabase } from "./supabase.js";

/* ============================================================
   CONFIGURATION
   ============================================================ */

const CONFIG = {
  festival: "halloween_2026",

  loginPage: "login.html",
  mapPage: "map.html",
  gamePage: "day5-game.html",

  thunderTime: 8.5,
  whisperAtEnd: true,

  musicVolume: 0.3,
  thunderVolume: 0.7,
  whisperVolume: 0.55,

  loadingDuration: 1600,
  fadeDuration: 1000
};

/* ============================================================
   DAY 5 CONTROLLER
   ============================================================ */

const Day5 = {
  el: {},

  started: false,
  finished: false,
  enteringGame: false,
  thunderPlayed: false,
  whisperPlayed: false,
  accessGranted: false,

  loadingTimer: null,
  animationFrame: null,

  /* ----------------------------------------------------------
     INITIALIZATION
     ---------------------------------------------------------- */

  async init() {
    this.cacheElements();
    this.prepareInitialState();
    this.bindEvents();

    console.log("🎃 VIDLYRA HALLOWEEN FEST 2026 — DAY 5");

    await this.loadingAnimation();

    const allowed = await this.checkAccess();

    if (!allowed) {
      return;
    }

    this.accessGranted = true;

    this.showStartScreen();

    console.log("👻 Day 5 cinematic ready.");
  },

  /* ----------------------------------------------------------
     ELEMENT REFERENCES
     ---------------------------------------------------------- */

  cacheElements() {
    const ids = [
      "loadingScreen",
      "loadingFill",
      "startOverlay",
      "startButton",
      "videoContainer",
      "introVideo",
      "overlay",
      "lightningFlash",
      "fadeScreen",
      "titleContainer",
      "missionPreview",
      "subtitleContainer",
      "storySubtitle",
      "skipButton",
      "videoProgress",
      "videoFill",
      "endOverlay",
      "enterButton",
      "bgMusic",
      "thunder",
      "ghostWhisper"
    ];

    for (const id of ids) {
      this.el[id] = document.getElementById(id);
    }

    const missing = ids.filter(id => !this.el[id]);

    if (missing.length) {
      console.error(
        "❌ Missing HTML elements:",
        missing.join(", ")
      );
    }
  },

  /* ----------------------------------------------------------
     INITIAL SCREEN STATE
     ---------------------------------------------------------- */

  prepareInitialState() {
    const {
      loadingScreen,
      loadingFill,
      startOverlay,
      videoContainer,
      introVideo,
      titleContainer,
      missionPreview,
      subtitleContainer,
      storySubtitle,
      skipButton,
      videoProgress,
      endOverlay,
      fadeScreen
    } = this.el;

    if (loadingScreen) {
      loadingScreen.style.display = "grid";
      loadingScreen.style.opacity = "1";
      loadingScreen.style.visibility = "visible";
    }

    if (loadingFill) {
      loadingFill.style.width = "0%";
    }

    if (startOverlay) {
      startOverlay.style.display = "none";
      startOverlay.style.opacity = "0";
      startOverlay.style.visibility = "hidden";
      startOverlay.style.pointerEvents = "none";
    }

    if (videoContainer) {
      videoContainer.style.display = "block";
    }

    if (introVideo) {
      introVideo.muted = true;
      introVideo.playsInline = true;
      introVideo.preload = "auto";
    }

    if (titleContainer) {
      titleContainer.classList.remove("show");
    }

    if (missionPreview) {
      missionPreview.classList.remove("show");
    }

    if (subtitleContainer) {
      subtitleContainer.style.display = "none";
    }

    if (storySubtitle) {
      storySubtitle.textContent = "";
    }

    if (skipButton) {
      skipButton.style.display = "none";
    }

    if (videoProgress) {
      videoProgress.style.display = "none";
    }

    if (endOverlay) {
      endOverlay.classList.remove("show");
    }

    if (fadeScreen) {
      fadeScreen.style.opacity = "0";
    }

    this.configureAudio();
  },

  /* ----------------------------------------------------------
     AUDIO CONFIGURATION
     Do not play audio here. Browsers require user interaction.
     ---------------------------------------------------------- */

  configureAudio() {
    const { bgMusic, thunder, ghostWhisper } = this.el;

    if (bgMusic) {
      bgMusic.volume = CONFIG.musicVolume;
      bgMusic.loop = true;
      bgMusic.preload = "auto";
    }

    if (thunder) {
      thunder.volume = CONFIG.thunderVolume;
      thunder.preload = "auto";
    }

    if (ghostWhisper) {
      ghostWhisper.volume = CONFIG.whisperVolume;
      ghostWhisper.preload = "auto";
    }
  },

  /* ----------------------------------------------------------
     LOADING ANIMATION
     ---------------------------------------------------------- */

  async loadingAnimation() {
    const { loadingScreen, loadingFill, introVideo } = this.el;

    if (loadingFill) {
      loadingFill.style.width = "15%";
    }

    if (introVideo) {
      try {
        introVideo.load();
      } catch (error) {
        console.warn("Video preload warning:", error);
      }
    }

    await new Promise(resolve => {
      let progress = 15;
      const step = 5;

      const timer = setInterval(() => {
        progress = Math.min(progress + step, 90);

        if (loadingFill) {
          loadingFill.style.width = `${progress}%`;
        }

        if (progress >= 90) {
          clearInterval(timer);
          resolve();
        }
      }, 60);
    });

    if (introVideo && introVideo.readyState >= 1) {
      if (loadingFill) {
        loadingFill.style.width = "100%";
      }
    }

    await this.delay(CONFIG.loadingDuration);

    if (loadingFill) {
      loadingFill.style.width = "100%";
    }

    if (loadingScreen) {
      loadingScreen.style.opacity = "0";
      loadingScreen.style.visibility = "hidden";

      await this.delay(850);

      loadingScreen.style.display = "none";
    }
  },

  /* ----------------------------------------------------------
     SUPABASE ACCESS CHECK
     Requires a logged-in user and completed Day 4.
     ---------------------------------------------------------- */

  async checkAccess() {
    try {
      const {
        data: { user },
        error: authError
      } = await supabase.auth.getUser();

      if (authError || !user) {
        console.warn("🔒 Login required.");

        window.location.replace(CONFIG.loginPage);
        return false;
      }

      const { data: progress, error } = await supabase
        .from("festival_progress")
        .select("day4")
        .eq("user_id", user.id)
        .eq("festival", CONFIG.festival)
        .maybeSingle();

      if (error) {
        console.error("❌ Could not check festival progress:", error);

        this.showAccessError(
          "Unable to verify your festival progress. Please refresh and try again."
        );

        return false;
      }

      if (!progress || progress.day4 !== true) {
        console.warn("🔒 Complete Day 4 before entering Day 5.");

        window.location.replace(CONFIG.mapPage);
        return false;
      }

      console.log("✅ Day 4 completed. Day 5 access granted.");

      return true;
    } catch (error) {
      console.error("❌ Access check failed:", error);

      this.showAccessError(
        "Could not verify access. Check your connection and reload the page."
      );

      return false;
    }
  },

  /* ----------------------------------------------------------
     ACCESS ERROR MESSAGE
     ---------------------------------------------------------- */

  showAccessError(message) {
    const { loadingScreen } = this.el;

    if (loadingScreen) {
      loadingScreen.style.display = "grid";
      loadingScreen.style.opacity = "1";
      loadingScreen.style.visibility = "visible";

      const label = loadingScreen.querySelector(".loading-label");

      if (label) {
        label.textContent = message;
        label.style.maxWidth = "320px";
        label.style.marginInline = "auto";
        label.style.lineHeight = "1.8";
        label.style.color = "#ffb347";
      }
    }
  },

  /* ----------------------------------------------------------
     START SCREEN
     ---------------------------------------------------------- */

  showStartScreen() {
    const { startOverlay } = this.el;

    if (!startOverlay) {
      console.error("❌ startOverlay was not found.");
      return;
    }

    startOverlay.style.display = "grid";

    requestAnimationFrame(() => {
      startOverlay.style.opacity = "1";
      startOverlay.style.visibility = "visible";
      startOverlay.style.pointerEvents = "auto";
    });
  },

  /* ----------------------------------------------------------
     EVENT BINDINGS
     ---------------------------------------------------------- */

  bindEvents() {
    const {
      startButton,
      skipButton,
      enterButton,
      introVideo,
      lightningFlash
    } = this.el;

    startButton?.addEventListener("click", () => {
      this.startExperience();
    });

    skipButton?.addEventListener("click", () => {
      this.finishVideo();
    });

    enterButton?.addEventListener("click", () => {
      this.enterGame();
    });

    introVideo?.addEventListener("loadedmetadata", () => {
      console.log(
        `🎬 Day 5 cinematic loaded: ${introVideo.videoWidth} x ${introVideo.videoHeight}`
      );
    });

    introVideo?.addEventListener("timeupdate", () => {
      this.updateProgress();
      this.updateCinematicEffects();
      this.updateSubtitles();
    });

    introVideo?.addEventListener("ended", () => {
      this.finishVideo();
    });

    introVideo?.addEventListener("error", () => {
      console.error(
        "❌ Intro video failed to load:",
        introVideo.currentSrc
      );
    });

    lightningFlash?.addEventListener("animationend", () => {
      lightningFlash.classList.remove("active");
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden && this.el.bgMusic) {
        this.el.bgMusic.pause();
      } else if (
        !document.hidden &&
        this.started &&
        !this.finished &&
        this.el.bgMusic
      ) {
        this.safePlay(this.el.bgMusic, "background music");
      }
    });
  },

  /* ----------------------------------------------------------
     START CINEMATIC
     All audio playback begins after the button click.
     ---------------------------------------------------------- */

  async startExperience() {
    if (this.started || !this.accessGranted) {
      return;
    }

    this.started = true;

    const {
      startOverlay,
      introVideo,
      bgMusic,
      skipButton,
      video
