import { supabase } from "./supabase.js";

/* ==========================================
   CONFIG
========================================== */

const FESTIVAL = "halloween_2026";
const LOGIN_URL = "login.html";
const MAP_URL = "map.html";
const NEXT_URL = "day4-video.html";   // change to MAP_URL to return to the map instead

const TOTAL = 5;
const SPEED = 30;        // % of screen per second (same on every refresh rate)
const INTRO_MS = 4000;
const SAVE_ATTEMPTS = 3;

const KEY_DIRS = {
    arrowleft: "left", a: "left",
    arrowright: "right", d: "right",
    arrowup: "up", w: "up",
    arrowdown: "down", s: "down"
};

const MESSAGES = {
    1: "The forest whispers...",
    2: "Something is watching you.",
    3: "Three crystals awakened.",
    4: "Only one crystal remains...",
    5: "The Ancient Gate is awakening..."
};

const $ = (id) => document.getElementById(id);
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/* ==========================================
   GAME
========================================== */

const Game = {
    found: 0,
    x: 50,
    y: 8,
    dir: { left: false, right: false, up: false, down: false },

    user: null,
    running: false,
    sequenceStarted: false,
    saved: false,
    saving: false,
    booting: false,

    last: 0,
    timers: {},

    /* ---------- setup ---------- */

    init() {
        this.world = $("gameWorld");
        this.player = $("player");
        this.crystals = [...document.querySelectorAll(".crystal")];
        this.progressFill = $("progressFill");
        this.counter = $("crystalCounter");
        this.dialogBox = $("dialogBox");
        this.dialogText = $("dialogText");
        this.gate = $("ancientGate");
        this.portal = $("magicPortal");
        this.dracula = $("dracula");
        this.flash = $("flash");
        this.lightning = $("lightningFlash");
        this.particles = $("particleContainer");
        this.intro = $("introScreen");
        this.introStatus = $("introStatus");
        this.introHint = $("introHint");
        this.retryBtn = $("retryBtn");
        this.complete = $("missionComplete");
        this.completeText = $("completeText");
        this.nextBtn = $("nextBtn");
        this.loading = $("loadingOverlay");
        this.loadingFill = $("loadingFill");

        this.snd = {
            music: $("bgMusic"), rain: $("rainSound"), thunder: $("thunderSound"),
            bats: $("batSound"), crystal: $("crystalSound"), gate: $("gateSound"),
            portal: $("portalSound"), laugh: $("draculaLaugh"), mission: $("missionSound")
        };

        if (!this.player || !this.world) {
            console.error("Day 3: #player or #gameWorld not found.");
            return;
        }

        this.render();
        this.bind();
        this.boot();
    },

    bind() {
        this.crystals.forEach((crystal) => {
            crystal.addEventListener("click", (e) => {
                e.stopPropagation();
                this.collect(crystal);
            });
            crystal.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    this.collect(crystal);
                }
            });
        });

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

        document.querySelectorAll("#dpad button").forEach((btn) => {
            const dir = btn.dataset.dir;
            const release = () => {
                this.dir[dir] = false;
                btn.classList.remove("pressed");
            };

            btn.addEventListener("pointerdown", (e) => {
                e.preventDefault();
                this.dir[dir] = true;
                btn.classList.add("pressed");
                btn.setPointerCapture?.(e.pointerId);
            });
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

        // Tap the intro to skip it.
        this.intro.addEventListener("pointerdown", () => {
            if (this.running) this.hideIntro();
        });

        // Browsers block audio until a gesture: retry on each gesture until it plays.
        const gesture = () => {
            if (!this.running) return;
            this.ambience(true);
            if (this.snd.music && !this.snd.music.paused) {
                ["pointerdown", "keydown"].forEach((t) => document.removeEventListener(t, gesture));
            }
        };
        ["pointerdown", "keydown"].forEach((t) => document.addEventListener(t, gesture));

        document.addEventListener("visibilitychange", () => {
            if (this.running) this.ambience(!document.hidden);
            if (document.hidden) stopAll();
        });

        window.addEventListener("pageshow", (e) => { if (e.persisted) location.reload(); });

        this.retryBtn.addEventListener("click", () => this.boot());
        this.nextBtn.addEventListener("click", () => this.onNext());
    },

    /* ---------- supabase ---------- */

    async checkAccess() {
        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();

            if (authError || !user) return "login";

            this.user = user;

            const { data, error } = await supabase
                .from("festival_progress")
                .select("day2, day3")
                .eq("user_id", user.id)
                .eq("festival", FESTIVAL)
                .maybeSingle();

            if (error) {
                console.error("Festival progress error:", error);
                return "error";
            }

            if (!data || data.day2 !== true) return "locked";

            this.saved = data.day3 === true;
            return "ok";

        } catch (error) {
            console.error("Day 3 access check failed:", error);
            return "error";
        }
    },

    async boot() {
        if (this.booting) return;
        this.booting = true;

        this.retryBtn.hidden = true;
        this.setStatus("Checking access…");

        const status = await this.checkAccess();

        this.booting = false;

        if (status === "ok") {
            this.setStatus("");
            this.introHint.hidden = false;
            this.start();
        } else if (status === "login") {
            this.setStatus("Please log in to continue…", true);
            setTimeout(() => location.replace(LOGIN_URL), 1500);
        } else if (status === "locked") {
            this.setStatus("🔒 Complete Day 2 before entering Day 3.", true);
            setTimeout(() => location.replace(MAP_URL), 1800);
        } else {
            this.setStatus("Unable to load your progress. Check your connection.", true);
            this.retryBtn.hidden = false;
        }
    },

    // Update only matches a row where Day 2 is done; .select() confirms a row really changed
    // (a blocked RLS update returns no error and no rows).
    async save() {
        if (this.saved) return true;
        if (this.saving || !this.user) return false;

        this.saving = true;

        try {
            for (let attempt = 1; attempt <= SAVE_ATTEMPTS; attempt++) {
                const { data, error } = await supabase
                    .from("festival_progress")
                    .update({ day3: true })
                    .eq("user_id", this.user.id)
                    .eq("festival", FESTIVAL)
                    .eq("day2", true)
                    .select("day3");

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
        this.createParticles();
        this.ambience(true);
        this.startWeather();

        this.timers.intro = setTimeout(() => this.hideIntro(), INTRO_MS);
        this.last = performance.now();
        requestAnimationFrame((t) => this.frame(t));
    },

    hideIntro() {
        clearTimeout(this.timers.intro);
        this.intro.classList.add("hide");
        this.message(
            this.saved
                ? "✨ Day 3 already complete. Replay if you like!"
                : "Collect all five Dark Crystals.",
            3500
        );
    },

    setStatus(text, isError = false) {
        this.introStatus.textContent = text;
        this.introStatus.classList.toggle("error", isError);
    },

    /* ---------- game loop ---------- */

    frame(now) {
        const dt = Math.min((now - this.last) / 1000, 0.05);
        this.last = now;

        if (this.running && !this.sequenceStarted && !document.hidden) {
            const dx = this.dir.right - this.dir.left;
            const dy = this.dir.up - this.dir.down;

            if (dx || dy) {
                const step = (SPEED * dt) / Math.hypot(dx, dy);

                this.x = Math.max(3, Math.min(96, this.x + dx * step));
                this.y = Math.max(5, Math.min(82, this.y + dy * step));

                this.render();
                this.checkTouching();
            }
        }

        requestAnimationFrame((t) => this.frame(t));
    },

    render() {
        this.player.style.left = `${this.x}%`;
        this.player.style.bottom = `${this.y}%`;
    },

    // Walking into a crystal collects it (tapping works too).
    checkTouching() {
        const p = this.player.getBoundingClientRect();
        const px = p.left + p.width / 2;
        const py = p.top + p.height / 2;

        for (const crystal of this.crystals) {
            if (crystal.classList.contains("collected")) continue;

            const r = crystal.getBoundingClientRect();
            const dist = Math.hypot(px - (r.left + r.width / 2), py - (r.top + r.height / 2));

            if (dist < (p.width + r.width) * 0.4) this.collect(crystal);
        }
    },

    /* ---------- crystals ---------- */

    collect(crystal) {
        if (!this.running || this.sequenceStarted || crystal.classList.contains("collected")) return;

        crystal.classList.add("collected");
        this.play(this.snd.crystal);

        this.found = Math.min(this.found + 1, TOTAL);
        this.progressFill.style.width = `${(this.found / TOTAL) * 100}%`;
        this.counter.textContent = `💎 Dark Crystals : ${this.found} / ${TOTAL}`;
        this.message(MESSAGES[this.found] || "");

        if (this.found >= TOTAL) {
            this.sequenceStarted = true;
            Object.keys(this.dir).forEach((k) => (this.dir[k] = false));
            this.finalSequence();
        }
    },

    /* ---------- final sequence ---------- */

    async finalSequence() {
        await wait(1800);

        this.play(this.snd.gate);
        this.flashScreen();
        this.shakeScreen();
        this.gate?.classList.add("open");
        this.message("THE ANCIENT GATE HAS OPENED.");
        await wait(2200);

        this.dracula?.classList.add("active");
        this.play(this.snd.laugh);
        this.message("A dark presence guards the path...");
        await wait(2500);

        this.portal?.classList.add("active");
        this.play(this.snd.portal);
        this.message("The path to the next chapter is open.");
        await wait(2500);

        await this.finish();
    },

    async finish() {
        const ok = await this.save();

        this.completeText.textContent = ok
            ? "The Ancient Gate has opened."
            : "The gate is open, but your progress could not be saved. Check your connection and retry.";

        this.nextBtn.textContent = ok ? "Continue to Day 4" : "↻ Retry Saving";
        this.nextBtn.disabled = false;

        this.complete.classList.add("show");
        this.complete.setAttribute("aria-hidden", "false");

        if (ok) {
            this.play(this.snd.mission);
            this.message("🌲 DAY 3 COMPLETE!", 3000);
        }
    },

    async onNext() {
        if (this.saved) {
            this.navigate(NEXT_URL);
            return;
        }

        this.nextBtn.disabled = true;
        this.nextBtn.textContent = "Saving…";
        await this.finish();
    },

    navigate(url) {
        this.nextBtn.disabled = true;
        this.loading.classList.add("show");
        void this.loading.offsetWidth;
        this.loadingFill.style.width = "100%";
        setTimeout(() => { location.href = url; }, 1000);
    },

    /* ---------- effects ---------- */

    message(text, duration = 2800) {
        if (!text) return;

        this.dialogText.textContent = text;
        this.dialogBox.classList.add("show");

        clearTimeout(this.timers.msg);
        this.timers.msg = setTimeout(() => this.dialogBox.classList.remove("show"), duration);
    },

    flashScreen() {
        this.flash.classList.add("active");
        setTimeout(() => this.flash.classList.remove("active"), 500);
    },

    shakeScreen() {
        this.world.classList.add("shake");
        setTimeout(() => this.world.classList.remove("shake"), 1300);
    },

    strike() {
        this.lightning.classList.remove("active");
        void this.lightning.offsetWidth;
        this.lightning.classList.add("active");
        this.play(this.snd.thunder);
        setTimeout(() => this.lightning.classList.remove("active"), 500);
    },

    startWeather() {
        const loop = () => {
            if (this.running && !document.hidden && !this.sequenceStarted && Math.random() > 0.4) {
                this.strike();
            }
            this.timers.weather = setTimeout(loop, 9000 + Math.random() * 10000);
        };

        clearTimeout(this.timers.weather);
        this.timers.weather = setTimeout(loop, 6000);
    },

    createParticles() {
        const frag = document.createDocumentFragment();

        for (let i = 0; i < 30; i++) {
            const p = document.createElement("span");
            const size = 2 + Math.random() * 4;

            p.className = "day3-particle";
            p.style.cssText =
                `left:${Math.random() * 100}%;top:${Math.random() * 100}%;` +
                `width:${size}px;height:${size}px;opacity:${0.25 + Math.random() * 0.6};` +
                `animation:day3ParticleFloat ${4 + Math.random() * 8}s ease-in-out infinite alternate`;

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
        [[this.snd.music, 0.3], [this.snd.rain, 0.15]].forEach(([audio, volume]) => {
            if (!audio) return;

            if (on) {
                audio.volume = volume;
                audio.play()?.catch(() => {});   // retried on the next tap/key
            } else {
                audio.pause();
            }
        });
    }
};

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => Game.init(), { once: true });
} else {
    Game.init();
}
