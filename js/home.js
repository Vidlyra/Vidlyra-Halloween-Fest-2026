"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const $ = (s, r = document) => r.querySelector(s);
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const A = "assets/";

  const page = $("#homePage"), video = $("#backgroundVideo");
  const character = $("#heroCharacter"), charImg = $("#characterImage"), caption = $("#characterCaptionText");
  const menuButton = $("#menuButton"), mobileMenu = $("#mobileMenu");
  const storyPanel = $("#storyPanel"), storyButton = $("#storyButton"), closeStory = $("#closeStory");
  const enterButton = $("#enterFestival"), soundButton = $("#soundButton"), soundText = $("#soundText");
  const ambient = $("#ambient"), transition = $("#transition"), lightning = $("#lightning");
  const authModal = $("#authModal");

  let soundEnabled = false, transitionBusy = false, lastTap = 0, stage = 0, hoverPose = "", user = null;

  // ---------- Sound effects (only when sound is on) ----------
  const sfx = {};
  ["awakening", "rage", "transformation", "button-click"].forEach((n) => {
    const a = new Audio(`${A}audio/${n}.mp3`);
    a.preload = "none";
    sfx[n] = a;
  });
  const play = (name, vol = 0.6) => {
    if (!soundEnabled || !sfx[name]) return;
    const a = sfx[name];
    a.volume = vol;
    a.currentTime = 0;
    a.play().catch(() => {});
  };
  document.addEventListener("click", (e) => {
    if (e.target.closest("button, a") && !e.target.closest("#soundButton")) play("button-click", 0.35);
  });

  // ---------- Ember particles ----------
  const particles = $("#particles");
  if (particles && !reduceMotion) {
    const count = matchMedia("(max-width: 700px)").matches ? 12 : 26;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const p = document.createElement("span");
      const size = 8 + Math.random() * 14;
      p.className = "particle";
      p.style.cssText = `left:${Math.random() * 100}%;width:${size}px;height:${size}px;` +
        `animation-duration:${7 + Math.random() * 12}s;animation-delay:${Math.random() * 12}s`;
      frag.appendChild(p);
    }
    particles.appendChild(frag);
  }

  // ---------- Random lightning ----------
  if (lightning && !reduceMotion) {
    (function strike() {
      setTimeout(() => {
        if (!document.hidden) {
          lightning.classList.remove("strike");
          void lightning.offsetWidth;
          lightning.classList.add("strike");
        }
        strike();
      }, 6000 + Math.random() * 9000);
    })();
  }

  // ---------- Cursor glow ----------
  const glow = $("#cursorGlow");
  if (glow && matchMedia("(hover: hover) and (pointer: fine)").matches) {
    addEventListener("pointermove", (e) => {
      glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      glow.classList.add("on");
    }, { passive: true });
    document.addEventListener("mouseleave", () => glow.classList.remove("on"));
  }

  // ---------- Background video ----------
  if (video) {
    video.muted = true;
    video.playsInline = true;
    const go = () => video.play().catch(() => {});
    if (video.readyState >= 2) go(); else video.addEventListener("canplay", go, { once: true });
    video.addEventListener("error", () => page?.classList.add("noVideo"));
    document.addEventListener("visibilitychange", () => (document.hidden ? video.pause() : go()));
  }

  // ---------- Mobile menu ----------
  function setMenu(open) {
    if (!menuButton || !mobileMenu) return;
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    mobileMenu.classList.toggle("open", open);
    mobileMenu.setAttribute("aria-hidden", String(!open));
    mobileMenu.toggleAttribute("inert", !open);
  }
  menuButton?.addEventListener("click", () => setMenu(menuButton.getAttribute("aria-expanded") !== "true"));
  document.addEventListener("click", (e) => {
    if (mobileMenu?.classList.contains("open") && !mobileMenu.contains(e.target) && !menuButton.contains(e.target)) setMenu(false);
  });
  matchMedia("(min-width: 861px)").addEventListener("change", (m) => m.matches && setMenu(false));

  // ---------- Story panel ----------
  function openStory() {
    setMenu(false);
    storyPanel.classList.add("open");
    storyPanel.setAttribute("aria-hidden", "false");
    storyPanel.removeAttribute("inert");
    closeStory?.focus();
  }
  function hideStory() {
    if (!storyPanel.classList.contains("open")) return;
    storyPanel.classList.remove("open");
    storyPanel.setAttribute("aria-hidden", "true");
    storyPanel.setAttribute("inert", "");
    storyButton?.focus();
  }
  storyButton?.addEventListener("click", openStory);
  closeStory?.addEventListener("click", hideStory);
  $("#storyEnter")?.addEventListener("click", () => enterRealm("map.html"));
  document.querySelectorAll('[data-target="story"]').forEach((b) => b.addEventListener("click", openStory));

  // ---------- Character: states, blink, look left/right ----------
  const poses = {
    main: "vidlyra-main", idle: "vidlyra-idle", blink: "vidlyra-blink",
    left: "vidlyra-left", right: "vidlyra-right", awakened: "vidlyra-awakened", rage: "vidlyra-rage",
  };
  Object.values(poses).forEach((n) => { new Image().src = `${A}character/${n}.png`; });
  [ "effects/orange-aura", "effects/blue-aura", "effects/rage-burst", "backgrounds/haunted-castle" ]
    .forEach((n) => { new Image().src = `${A}${n}.png`; });

  const setPose = (key) => {
    const src = `${A}character/${poses[key]}.png`;
    if (!charImg.src.endsWith(src)) charImg.src = src;
  };
  const baseKey = () => (stage === 1 ? "awakened" : stage === 2 ? "rage" : "main");
  const captions = ["UNKNOWN PRESENCE", "VEIL AWAKENED", "UNLEASHED RAGE"];

  function applyStage() {
    character.classList.toggle("is-transformed", stage >= 1);
    character.classList.toggle("is-rage", stage === 2);
    caption.textContent = captions[stage];
    setPose(baseKey());
  }

  function transformCharacter() {
    stage = (stage + 1) % 3;
    character.classList.remove("transforming");
    void character.offsetWidth;
    character.classList.add("transforming");
    applyStage();
    if (stage === 1) play("awakening");
    if (stage === 2) play("rage");
    if (stage === 0) play("transformation", 0.5);
    setTimeout(() => character.classList.remove("transforming"), 750);
  }

  if (character) {
    character.addEventListener("dblclick", (e) => { e.preventDefault(); transformCharacter(); });
    character.addEventListener("pointerup", (e) => {
      if (e.pointerType === "mouse") return;
      const now = Date.now();
      if (now - lastTap < 360) { lastTap = 0; transformCharacter(); } else lastTap = now;
    });
    character.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); transformCharacter(); }
    });

    // Idle <-> main breathing, and blinking (only in the base stage)
    if (!reduceMotion) {
      let breathe = false;
      setInterval(() => {
        if (stage || hoverPose || document.hidden) return;
        breathe = !breathe;
        setPose(breathe ? "idle" : "main");
      }, 2600);
      (function blink() {
        setTimeout(() => {
          if (!stage && !hoverPose && !document.hidden) {
            setPose("blink");
            setTimeout(() => !stage && !hoverPose && setPose("main"), 140);
          }
          blink();
        }, 3000 + Math.random() * 4000);
      })();

      // Character glances toward the cursor
      let raf = 0;
      if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
        addEventListener("pointermove", (e) => {
          if (raf || stage) return;
          raf = requestAnimationFrame(() => {
            raf = 0;
            const r = character.getBoundingClientRect();
            const dx = e.clientX - (r.left + r.width / 2);
            const next = dx < -r.width * 0.7 ? "left" : dx > r.width * 0.7 ? "right" : "";
            if (next !== hoverPose) { hoverPose = next; setPose(next || "main"); }
          });
        }, { passive: true });
      }
    }
  }

  // ---------- Ambient sound ----------
  async function enableSound() {
    try {
      ambient.volume = 0.35;
      await ambient.play();
      soundEnabled = true;
      soundButton.setAttribute("aria-pressed", "true");
      soundText.textContent = "SOUND ON";
    } catch {
      soundEnabled = false;
      soundText.textContent = "TAP TO ENABLE";
    }
  }
  function disableSound() {
    ambient?.pause();
    Object.values(sfx).forEach((a) => a.pause());
    soundEnabled = false;
    soundButton.setAttribute("aria-pressed", "false");
    soundText.textContent = "SOUND OFF";
  }
  soundButton?.addEventListener("click", () => (soundEnabled ? disableSound() : enableSound()));

  // ---------- Page transition ----------
  function enterRealm(dest) {
    if (transitionBusy || !dest) return;
    transitionBusy = true;
    setMenu(false);
    hideStory();
    transition.classList.add("active");
    transition.setAttribute("aria-hidden", "false");
    play("transformation", 0.7);
    setTimeout(() => { location.href = dest; }, 850);
  }
  enterButton?.addEventListener("click", () => enterRealm(enterButton.dataset.url || "map.html"));
  addEventListener("pageshow", () => {
    transitionBusy = false;
    transition.classList.remove("active");
    transition.setAttribute("aria-hidden", "true");
  });

  // ---------- Keyboard ----------
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { setMenu(false); hideStory(); return; }
    if (e.altKey || e.ctrlKey || e.metaKey || e.repeat) return;
    if (authModal.open || storyPanel.classList.contains("open")) return;
    if (["INPUT", "TEXTAREA", "BUTTON", "A", "SELECT"].includes(e.target?.tagName)) return;
    if (e.key === "Enter") enterRealm("map.html");
  });

  // ---------- Progress HUD ----------
  try {
    const q = Math.min(13, Math.max(0, Number(localStorage.getItem("vidlyraCompletedQuests")) || 0));
    const s = Math.max(0, Number(localStorage.getItem("vidlyraSecretsFound")) || 0);
    $("#questCounter").textContent = `${q} / 13`;
    $("#secretCounter").textContent = String(s);
  } catch { /* storage disabled */ }

  // =====================================================
  //  AUTH  (Supabase when configured, local demo otherwise)
  // =====================================================
  const cfg = window.VIDLYRA_SUPABASE || {};
  let sb = null;
  try { if (cfg.url && cfg.key && window.supabase) sb = window.supabase.createClient(cfg.url, cfg.key); } catch { sb = null; }

  const DEFAULT_AVATAR = `${A}ui/default-avatar.png`;
  const store = {
    get: (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } },
    del: (k) => { try { localStorage.removeItem(k); } catch { /* ignore */ } },
  };
  const hash = async (t) => {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
  };
  const fromSb = (u) => u && ({
    email: u.email,
    name: u.user_metadata?.username || u.email.split("@")[0],
    avatar: u.user_metadata?.avatar_url || DEFAULT_AVATAR,
  });

  function renderAuth() {
    $("#authButtons").hidden = !!user;
    $("#userBox").hidden = !user;
    if (user) {
      $("#userName").textContent = user.name;
      const img = $("#userAvatar");
      img.onerror = () => { img.onerror = null; img.src = DEFAULT_AVATAR; };
      img.src = user.avatar || DEFAULT_AVATAR;
    }
  }

  // Mode switching
  let mode = "signin";
  const msg = $("#authMsg");
  function setMode(m) {
    mode = m;
    const up = m === "signup";
    $("#tabIn").setAttribute("aria-selected", String(!up));
    $("#tabUp").setAttribute("aria-selected", String(up));
    $("#nameRow").hidden = !up;
    $("#authTitle").textContent = up ? "Join the festival" : "Welcome back";
    $("#authSubmit").textContent = up ? "Create account" : "Sign in";
    $("#authPass").autocomplete = up ? "new-password" : "current-password";
    msg.textContent = "";
    msg.className = "authMsg";
  }
  function openAuth(m) {
    setMenu(false);
    setMode(m);
    if (!authModal.open) authModal.showModal();
    setTimeout(() => (m === "signup" ? $("#authName") : $("#authEmail")).focus(), 50);
  }
  $("#signInBtn").addEventListener("click", () => openAuth("signin"));
  $("#signUpBtn").addEventListener("click", () => openAuth("signup"));
  $("#tabIn").addEventListener("click", () => setMode("signin"));
  $("#tabUp").addEventListener("click", () => setMode("signup"));
  $("#authClose").addEventListener("click", () => authModal.close());
  authModal.addEventListener("click", (e) => { if (e.target === authModal) authModal.close(); });

  const say = (t, ok = false) => { msg.textContent = t; msg.className = "authMsg" + (ok ? " ok" : ""); };

  $("#authForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = $("#authName").value.trim();
    const email = $("#authEmail").value.trim().toLowerCase();
    const pass = $("#authPass").value;
    if (!/^\S+@\S+\.\S+$/.test(email)) return say("Enter a valid email address.");
    if (pass.length < 6) return say("Password must be at least 6 characters.");
    if (mode === "signup" && name.length < 2) return say("Enter a player name (2+ characters).");

    const btn = $("#authSubmit");
    btn.disabled = true;
    try {
      if (sb) {
        if (mode === "signup") {
          const { data, error } = await sb.auth.signUp({ email, password: pass, options: { data: { username: name } } });
          if (error) throw error;
          if (!data.session) { say("Account created. Check your email to confirm, then sign in.", true); btn.disabled = false; return; }
        } else {
          const { error } = await sb.auth.signInWithPassword({ email, password: pass });
          if (error) throw error;
        }
        // onAuthStateChange updates the UI
      } else {
        const users = store.get("vidlyraUsers", {});
        const h = await hash(pass);
        if (mode === "signup") {
          if (users[email]) throw new Error("This email is already registered. Sign in instead.");
          users[email] = { name, h };
          store.set("vidlyraUsers", users);
        } else if (!users[email] || users[email].h !== h) {
          throw new Error("Wrong email or password.");
        }
        user = { email, name: users[email].name, avatar: DEFAULT_AVATAR };
        store.set("vidlyraSession", user);
        renderAuth();
      }
      authModal.close();
      e.target.reset();
    } catch (err) {
      say(err.message || "Something went wrong. Try again.");
    } finally {
      btn.disabled = false;
    }
  });

  $("#logoutBtn").addEventListener("click", async () => {
    if (sb) await sb.auth.signOut().catch(() => {});
    store.del("vidlyraSession");
    user = null;
    renderAuth();
  });

  // Restore session
  if (sb) {
    sb.auth.getSession().then(({ data }) => { user = fromSb(data.session?.user); renderAuth(); });
    sb.auth.onAuthStateChange((_e, session) => { user = fromSb(session?.user); renderAuth(); });
  } else {
    user = store.get("vidlyraSession", null);
    renderAuth();
  }
});
