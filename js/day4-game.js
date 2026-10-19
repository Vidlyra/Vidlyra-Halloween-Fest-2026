import { supabase } from "./supabase.js";

/* ==========================================
   CONFIG
========================================== */

const FESTIVAL = "halloween_2026";
const LOGIN_URL = "login.html";
const MAP_URL = "map.html";
const NEXT_URL = "day5-video.html";

const TOTAL_LANTERNS = 5;
const SPEED = 30;          // % of screen per second (same on 60Hz and 120Hz)
const INTRO_MS = 3500;
const SAVE_ATTEMPTS = 3;

const KEY_DIRS = {
    arrowleft: "left", a: "left",
    arrowright: "right", d: "right",
    arrowup: "up", w: "up",
    arrowdown: "down", s: "down"
};

const $ = (id) => document.getElementById(id);
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/* ==========================================
   GAME
========================================== */

const Game = {
    found: 0,
    x: 8,
    y: 12,
    dir: { left: false, right: false, up: false, down: false },

    user: null,
    running: false,
    finalStarted: false,
    saved: false,
    saving: false,
    booting: false,

    raf: 0,
    last: 0,
    timers: {},

    /* ---------- setup ---------- */

    init() {
        this.player = $("player");
        this.lanterns = [...document.querySelectorAll(".lantern")];
        this.progress = $("progressFill");
        this.counter = $("lanternCounter");
        this.dialog = $("dialogText");
        this.dialogBox = $("dialogBox");
        this.flash = $("flash");
        this.lightning = $("lightning");
        this.witch = document.querySelector(".witch");
        this.portal = document.querySelector(".portal");
        this.intro = $("introScreen");
        this.introStatus = $("introStatus");
        this.introHint = $("introHint");
        this.retryBtn = $("retryBtn");
        this.complete = $("missionComplete");
        this.completeText = $("completeText");
        this.nextBtn = $("nextBtn");
        this.particles = $("particleContainer");

        const s = (id) => $(id);
        this.snd = {
            music: s("bgMusic"), collect: s("collectSound"), lantern: s("lanternSound"),
            spell: s("spellSound"), cauldron: s("cauldronSound"), appear: s("witchAppearSound"),
            laugh: s("witchLaughSound"), thunder: s("thunderSound"), portal: s("portalSound"),
            reward: s("missionCompleteSound")
        };

        if (!this.player) {
            console.error("Day 4: #player not found.");
            return;
        }

        // Preload the lit lantern image so the swap is instant.
        this.lanterns.forEach((l) => { if (l.dataset.lit) new Image().src = l.dataset.lit; });

        this.bind();
        this.boot();
    },

    bind() {
        // Lanterns: click, tap, or Enter/Space when focused
        this.lanterns.forEach((lantern) => {
            lantern.addEventListener("click", (e) => {
                e.stopPropagation();
                this.collect(lantern);
            });
            lantern.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    this.collect(lantern);
                }
            });
        });

        // Keyboard movement
        document.addEventListener("keydown", (e) => {
            const dir = KEY_DIRS[e.key.toLowerCase()];
            if (!dir) return;
            if (e.key.startsWith("Arrow")) e.preventDefault();
            this.dir[dir] = true;
        });

        document.addEventListener("keyup", (e) => {
            const dir = KEY_DIRS[e.key.toLowerCase()];
            if (dir) this.dir[dir] = false;
        });

        // Touch D-pad (pointer events work for touch, pen and mouse)
        document.querySelectorAll("#dpad button").forEach((btn) => {
            const dir = btn.dataset.dir;
            const press = (e) => {
                e.preventDefault();
                this.dir[dir] = true;
                btn.classList.add("pressed");
                btn.setPointerCapture?.(e.pointerId);
            };
            const release = () => {
                this.dir[dir] = false;
                btn.classList.remove("pressed");
            };
            btn.addEventListener("pointerdown", press);
            btn.addEventListener("pointerup", release);
            btn.addEventListener("pointercancel", release);
            btn.addEventListener("lostpointercapture", release);
            btn.addEventListener("contextmenu", (e) => e.preventDefault());
        });

        const stopAll = () => {
            Object.keys(this.dir).forEach((k) => (this.dir[k] = false));
            document.querySelectorAll("#dpad .pressed").forEach((b) => b.classList.remove("pressed"));
        };
        window.addEventListener("blur", stopAll);

        // Tap anywhere on the intro to skip it; also counts as the audio gesture.
        this.intro.addEventListener("pointerdown", () => {
            if (this.running) this.hideIntro();
        });

        // Browsers block audio until the first gesture: retry on every gesture until it plays.
        const gesture = () => {
            if (!this.running) return;
            this.ambience(true);
            if (this.snd.music && !this.snd.music.paused) {
                ["pointerdown", "keydown"].forEach((t) => document.removeEventListener(t, gesture));
            }
        };
        ["pointerdown", "keydown"].forEach((t) => document.addEventListener(t, gesture));

        // Pause sound when the tab/app is hidden
        document.addEventListener("visibilitychange", () => {
            if (this.running) this.ambience(!document.hidden);
            if (document.hidden) stopAll();
        });

        // Coming back with the Back button: start fresh
        window.addEventListener("pageshow", (e) => { if (e.persisted) location.reload(); });

        this.retryBtn.addEventListener("click", () => this.boot());
        this.nextBtn.addEventListener("click", () => this.onNext());
    },

    /* ---------- supabase ---------- */

    async checkAccess() {
        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();

            if (authError || !user) return { status: "login" };

            this.user = user;

            const { data, error } = await supabase
                .from("festival_progress")
                .select("day3, day4")
                .eq("user_id", user.id)
                .eq("festival", FESTIVAL)
                .maybeSingle();

            if (error) {
                console.error("Festival progress error:", error);
                return { status: "error" };
            }

            if (!data || data.day3 !== true) return { status: "locked" };

            this.saved = data.day4 === true;
            return { status: "ok" };

        } catch (error) {
            console.error("Day 4 access check failed:", error);
            return { status: "error" };
        }
    },

    async boot() {
        if (this.booting) return;
        this.booting = true;

        this.retryBtn.hidden = true;
        this.setIntroStatus("Checking access…");

        const { status } = await this.checkAccess();

        this.booting = false;

        if (status === "ok") {
            this.setIntroStatus("");
            this.introHint.hidden = false;
            this.start();
        } else if (status === "login") {
            this.setIntroStatus("Please log in to continue…", true);
            setTimeout(() => location.replace(LOGIN_URL), 1500);
        } else if (status === "locked") {
            this.setIntroStatus("🔒 Complete Day 3 before entering Day 4.", true);
            setTimeout(() => location.replace(MAP_URL), 1800);
        } else {
            this.setIntroStatus("Unable to load your progress. Check your connection.", true);
            this.retryBtn.hidden = false;
        }
    },

    // Marks Day 4 complete. The update only matches a row where Day 3 is already done,
    // and .select() lets us confirm that a row really changed (RLS can block silently).
    async save() {
        if (this.saved) return true;
        if (this.saving || !this.user) return false;

        this.saving = true;

        try {
            for (let attempt = 1; attempt <= SAVE_ATTEMPTS; attempt++) {
                const { data, error } = await supabase
                    .from("festival_progress")
                    .update({ day4: true })
                    .eq("user_id", this.user.id)
                    .eq("festival", FESTIVAL)
                    .eq("day3", true)
                    .select("day4");

                if (!error && data && data.length > 0) {
                    this.saved = true;
                    break;
                }

                console.error(`Save attempt ${attempt} failed:`, error || "no row updated");
                await wait(700 * attempt);
            }
        } catch (error) {
            console.error("Save crashed:", error);
        } finally {
            this.saving = false;
        }

        return this.saved;
    },

    /* ---------- start ---------- */

    start() {
        this.running = true;
        this.updateProgress();
        this.createParticles();
        this.ambience(true);
        this.startThunder();

        this.timers.intro = setTimeout(() => this.hideIntro(), INTRO_MS);
        this.last = performance.now();
        this.raf = requestAnimationFrame((t) => this.frame(t));
    },

    hideIntro() {
        clearTimeout(this.timers.intro);
        this.intro.classList.add("hide");
        this.message(
            this.saved
                ? "✨ You've completed Day 4 before. Find all five lanterns to replay!"
                : "🏮 Find and tap all 5 Enchanted Lanterns!",
            3500
        );
    },

    setIntroStatus(text, isError = false) {
        this.introStatus.textContent = text;
        this.introStatus.classList.toggle("error", isError);
    },

    /* ---------- game loop ---------- */

    frame(now) {
        const dt = Math.min((now - this.last) / 1000, 0.05);
        this.last = now;

        if (this.running && !document.hidden) {
            const dx = this.dir.right - this.dir.left;
            const dy = this.dir.up - this.dir.down;

            if (dx || dy) {
                const step = (SPEED * dt) / Math.hypot(dx, dy);

                this.x = Math.max(2, Math.min(94, this.x + dx * step));
                this.y = Math.max(5, Math.min(82, this.y + dy * step));

                this.player.style.left = `${this.x}%`;
                this.player.style.bottom = `${this.y}%`;

                this.checkTouching();
            }
        }

        this.raf = requestAnimationFrame((t) => this.frame(t));
    },

    // Walking into a lantern collects it too (so it works without tapping).
    checkTouching() {
        const p = this.player.getBoundingClientRect();
        const px = p.left + p.width / 2;
        const py = p.top + p.height / 2;

        for (const lantern of this.lanterns) {
            if (lantern.classList.contains("collected")) continue;

            const r = lantern.getBoundingClientRect();
            const dist = Math.hypot(px - (r.left + r.width / 2), py - (r.top + r.height / 2));

            if (dist < (p.width + r.width) * 0.4) this.collect(lantern);
        }
    },

    /* ---------- lanterns ---------- */

    collect(lantern) {
        if (!this.running || this.finalStarted || lantern.classList.contains("collected")) return;

        lantern.classList.add("collected");
        if (lantern.dataset.lit) lantern.src = lantern.dataset.lit;

        this.play(this.snd.collect);
        setTimeout(() => this.play(this.snd.lantern), 150);

        this.found = Math.min(this.found + 1, TOTAL_LANTERNS);
        this.updateProgress();
        this.flashScreen();
        this.message("🏮 Enchanted Lantern Lit!");

        if (this.found >= TOTAL_LANTERNS) {
            this.finalStarted = true;
            setTimeout(() => this.finalSequence(), 700);
        }
    },

    updateProgress() {
        this.progress.style.width = `${(this.found / TOTAL_LANTERNS) * 100}%`;
        this.counter.textContent = `🏮 Enchanted Lanterns: ${this.found} / ${TOTAL_LANTERNS}`;
    },

    /* ---------- final sequence ---------- */

    async finalSequence() {
        Object.keys(this.dir).forEach((k) => (this.dir[k] = false));

        this.message("✨ All five lanterns are lit! The Witch is awakening...", 4000);
        this.play(this.snd.spell);
        await wait(1000);

        this.flashScreen();
        this.witch?.classList.add("active");
        this.play(this.snd.appear);
        await wait(1800);

        this.play(this.snd.laugh);
        this.message("🧙‍♀️ You have broken the Witch's spell!", 3500);
        this.portal?.classList.add("active");
        this.play(this.snd.portal);
        await wait(1500);

        await this.finish();
    },

    async finish() {
        const ok = await this.save();

        this.completeText.textContent = ok
            ? "The Witch's Curse has been broken."
            : "The curse is broken, but your progress could not be saved. Check your connection and retry.";

        this.nextBtn.textContent = ok ? "Continue To Day 5 →" : "↻ Retry Saving";
        this.nextBtn.disabled = false;

        this.complete.classList.add("show");
        this.complete.setAttribute("aria-hidden", "false");

        if (ok) this.play(this.snd.reward);
    },

    async onNext() {
        if (this.saved) {
            location.href = NEXT_URL;
            return;
        }

        this.nextBtn.disabled = true;
        this.nextBtn.textContent = "Saving…";
        await this.finish();
    },

    /* ---------- UI helpers ---------- */

    message(text, duration = 2600) {
        this.dialog.textContent = text;
        this.dialogBox.classList.add("show");

        clearTimeout(this.timers.msg);
        this.timers.msg = setTimeout(() => this.dialogBox.classList.remove("show"), duration);
    },

    flashScreen() {
        this.flash.classList.add("active");
        setTimeout(() => this.flash.classList.remove("active"), 130);
    },

    createParticles() {
        const frag = document.createDocumentFragment();

        for (let i = 0; i < 30; i++) {
            const p = document.createElement("span");
            const size = 2 + Math.random() * 4;

            p.className = "day4-particle";
            p.style.cssText =
                `left:${Math.random() * 100}%;top:${Math.random() * 100}%;` +
                `width:${size}px;height:${size}px;opacity:${0.25 + Math.random() * 0.65};` +
                `animation:day4ParticleFloat ${4 + Math.random() * 8}s ease-in-out infinite alternate`;

            frag.appendChild(p);
        }

        this.particles.replaceChildren(frag);
    },

    /* ---------- audio ---------- */

    play(audio) {
        if (!audio) return;

        try {
            audio.currentTime = 0;
            audio.play()?.catch((e) => console.warn(`Audio blocked: ${audio.id}`, e.message));
        } catch (e) {
            console.warn("Audio error:", e);
        }
    },

    ambience(on) {
        const { music, cauldron } = this.snd;

        [[music, 0.35], [cauldron, 0.25]].forEach(([audio, volume]) => {
            if (!audio) return;

            if (on) {
                audio.volume = volume;
                audio.play()?.catch(() => {});   // retried on the next tap/key
            } else {
                audio.pause();
            }
        });
    },

    startThunder() {
        const strike = () => {
            if (this.running && !document.hidden && Math.random() > 0.55) {
                this.play(this.snd.thunder);

                [[0, .75], [100, 0], [180, .4], [260, 0]].forEach(([delay, opacity]) => {
                    setTimeout(() => (this.lightning.style.opacity = opacity), delay);
                });
            }

            this.timers.thunder = setTimeout(strike, 9000 + Math.random() * 10000);
        };

        clearTimeout(this.timers.thunder);
        this.timers.thunder = setTimeout(strike, 5000);
    }
};

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => Game.init(), { once: true });
} else {
    Game.init();
}
