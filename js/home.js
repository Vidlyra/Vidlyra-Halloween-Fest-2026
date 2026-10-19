
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const $ = (selector, root = document) => root.querySelector(selector);

  const page = $("#homePage");
  const video = $("#backgroundVideo");
  const character = $("#heroCharacter");
  const characterImage = $("#characterImage");
  const characterCaption = $("#characterCaptionText");
  const menuButton = $("#menuButton");
  const navigation = $("#mainNavigation");
  const mobileMenu = $("#mobileMenu");
  const storyPanel = $("#storyPanel");
  const storyButton = $("#storyButton");
  const closeStory = $("#closeStory");
  const storyEnter = $("#storyEnter");
  const enterButton = $("#enterFestival");
  const soundButton = $("#soundButton");
  const soundText = $("#soundText");
  const ambient = $("#ambient");
  const thunder = $("#thunder");
  const transition = $("#transition");
  const particles = $("#particles");

  let transformed = false;
  let lastTap = 0;
  let soundEnabled = false;
  let transitionBusy = false;

  // Create floating magical particles.
  if (particles && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const count = window.matchMedia("(max-width: 700px)").matches ? 14 : 30;
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < count; i++) {
      const particle = document.createElement("span");
      particle.className = "particle";
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.animationDuration = `${7 + Math.random() * 12}s`;
      particle.style.animationDelay = `${Math.random() * 12}s`;
      particle.style.width = `${1 + Math.random() * 3}px`;
      particle.style.height = particle.style.width;
      fragment.appendChild(particle);
    }

    particles.appendChild(fragment);
  }

  // Background video: autoplay must be muted in most browsers.
  if (video) {
    video.muted = true;
    video.playsInline = true;

    const playVideo = () => {
      const promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(() => {
          // A browser may block autoplay; keep the visual background intact.
        });
      }
    };

    if (video.readyState >= 2) playVideo();
    else video.addEventListener("canplay", playVideo, { once: true });

    video.addEventListener("error", () => {
      video.classList.add("videoUnavailable");
      if (page) page.classList.add("noVideo");
    });
  }

  // Navigation menu.
  function setMenu(open) {
    if (!menuButton || !mobileMenu) return;

    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    mobileMenu.classList.toggle("open", open);
    mobileMenu.setAttribute("aria-hidden", String(!open));
  }

  menuButton?.addEventListener("click", () => {
    setMenu(menuButton.getAttribute("aria-expanded") !== "true");
  });

  document.addEventListener("click", (event) => {
    if (!mobileMenu?.classList.contains("open")) return;

    const insideMenu = mobileMenu.contains(event.target);
    const isMenuButton = menuButton?.contains(event.target);

    if (!insideMenu && !isMenuButton) setMenu(false);
  });

  // Story panel.
  function openStory() {
    setMenu(false);
    if (!storyPanel) return;

    storyPanel.classList.add("open");
    storyPanel.setAttribute("aria-hidden", "false");
    storyPanel.removeAttribute("inert");
    closeStory?.focus();
  }

  function hideStory() {
    if (!storyPanel) return;

    storyPanel.classList.remove("open");
    storyPanel.setAttribute("aria-hidden", "true");
    storyPanel.setAttribute("inert", "");
    storyButton?.focus();
  }

  storyButton?.addEventListener("click", openStory);
  closeStory?.addEventListener("click", hideStory);

  storyPanel?.addEventListener("click", (event) => {
    if (event.target === storyPanel) hideStory();
  });

  // Character transformation: double-click on desktop, double-tap on touch.
  function transformCharacter() {
    if (!character) return;

    transformed = !transformed;
    character.classList.toggle("is-transformed", transformed);
    character.classList.remove("transforming");

    // Restart the flash animation.
    void character.offsetWidth;
    character.classList.add("transforming");

    if (characterCaption) {
      characterCaption.textContent = transformed
        ? "VEIL AWAKENED"
        : "UNKNOWN PRESENCE";
    }

    if (transformed && soundEnabled && thunder) {
      thunder.currentTime = 0;
      thunder.play().catch(() => {});
    }

    window.setTimeout(() => {
      character.classList.remove("transforming");
    }, 750);
  }

  if (character) {
    character.addEventListener("dblclick", (event) => {
      event.preventDefault();
      transformCharacter();
    });

    character.addEventListener("pointerup", (event) => {
      if (event.pointerType === "mouse") return;

      const now = Date.now();
      if (now - lastTap < 360) {
        lastTap = 0;
        transformCharacter();
      } else {
        lastTap = now;
      }
    });

    // Also support keyboard users.
    character.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        transformCharacter();
      }
    });
  }

  // Ambient sound is opt-in because browsers block autoplay audio.
  async function enableSound() {
    if (!ambient) return;

    try {
      ambient.volume = 0.35;
      await ambient.play();
      soundEnabled = true;
      soundButton?.setAttribute("aria-pressed", "true");
      if (soundText) soundText.textContent = "SOUND ON";
    } catch {
      soundEnabled = false;
      soundButton?.setAttribute("aria-pressed", "false");
      if (soundText) soundText.textContent = "TAP TO ENABLE";
    }
  }

  function disableSound() {
    ambient?.pause();
    if (thunder) thunder.pause();

    soundEnabled = false;
    soundButton?.setAttribute("aria-pressed", "false");
    if (soundText) soundText.textContent = "SOUND OFF";
  }

  soundButton?.addEventListener("click", () => {
    if (soundEnabled) disableSound();
    else enableSound();
  });

  // Cinematic transition and safe local navigation.
  function enterRealm(destination) {
    if (transitionBusy || !destination) return;
    transitionBusy = true;

    setMenu(false);
    hideStory();

    if (transition) {
      transition.classList.add("active");
      transition.setAttribute("aria-hidden", "false");
    }

    if (soundEnabled && thunder) {
      thunder.currentTime = 0;
      thunder.play().catch(() => {});
    }

    window.setTimeout(() => {
      window.location.href = destination;
    }, 850);
  }

  enterButton?.addEventListener("click", () => {
    enterRealm(enterButton.dataset.url || "map.html");
  });

  storyEnter?.addEventListener("click", () => {
    enterRealm("map.html");
  });

  // Support both desktop and mobile navigation buttons.
  document.querySelectorAll("[data-target]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.target;

      if (target === "story") {
        openStory();
      } else if (target === "map") {
        enterRealm("map.html");
      } else if (target === "rewards") {
        enterRealm("rewards.html");
      } else if (target === "credits") {
        enterRealm("credits.html");
      }
    });
  });

  // Keyboard shortcuts.
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setMenu(false);
      if (storyPanel?.classList.contains("open")) hideStory();
      return;
    }

    const tag = event.target?.tagName;
    if (event.altKey || event.ctrlKey || event.metaKey ||
        tag === "INPUT" || tag === "TEXTAREA" || tag === "BUTTON" ||
        tag === "A") return;

    if (event.key === "Enter") {
      enterRealm("map.html");
    }
  });

  // Avoid leaving the page stuck in transition if navigation is interrupted.
  window.addEventListener("pageshow", () => {
    transitionBusy = false;
    transition?.classList.remove("active");
    transition?.setAttribute("aria-hidden", "true");
  });

  // A mobile orientation hint: browsers generally require a user gesture
  // before fullscreen or orientation lock can be requested.
  async function requestLandscapeMode() {
    if (!window.matchMedia("(max-width: 900px)").matches) return;

    try {
      if (document.documentElement.requestFullscreen &&
          !document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }

      if (screen.orientation?.lock) {
        await screen.orientation.lock("landscape");
      }
    } catch {
      // Unsupported or denied: responsive CSS still adapts to the device.
    }
  }

  // Long-press brand is not required; orientation is optional via double-tap.
  // Keep normal single-tap navigation unchanged.
  const brand = $("#brandHome");
  let brandTap = 0;

  brand?.addEventListener("pointerup", (event) => {
    if (event.pointerType === "mouse") return;

    const now = Date.now();
    if (now - brandTap < 360) {
      requestLandscapeMode();
      brandTap = 0;
    } else {
      brandTap = now;
    }
  });

  // Preserve existing progress display if another feature populates it.
  const questCounter = $("#questCounter");
  const secretCounter = $("#secretCounter");

  try {
    const completed = Number(localStorage.getItem("vidlyraCompletedQuests") || 0);
    const secrets = Number(localStorage.getItem("vidlyraSecretsFound") || 0);

    if (questCounter && questCounter.textContent.trim() === "0 / 13") {
      questCounter.textContent = `${Math.min(13, Math.max(0, completed))} / 13`;
    }

    if (secretCounter && secretCounter.textContent.trim() === "0") {
      secretCounter.textContent = String(Math.max(0, secrets));
    }
  } catch {
    // Storage may be disabled; default HUD values remain visible.
  }
});
