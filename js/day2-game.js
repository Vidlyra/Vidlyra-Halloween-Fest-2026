/* VIDLYRA HALLOWEEN FEST 2026 - DAY 2: THE HAUNTED WELL
   Mobile joystick + enemies + Supabase (with retry & offline sync) */
import { supabase } from "./supabase.js";

const $ = (id) => document.getElementById(id);
const rand = (a, b) => a + Math.random() * (b - a);
const FEST = "halloween_2026";
const ENEMIES = [
    { e: "👻", speed: 55, hp: 1 },
    { e: "🦇", speed: 95, hp: 1 },
    { e: "💀", speed: 42, hp: 2 },
    { e: "🕷️", speed: 75, hp: 1 }
];

const Game = {
    runesFound: 0, totalRunes: 3,
    user: null, supabaseReady: false, day2Finished: false, savingProgress: false,
    phase: "loading", // loading | play | event | crystal | done
    paused: false, crystalEnabled: false,
    px: 15, py: 12, speed: 22, // % per second
    keys: {}, joy: { x: 0, y: 0, id: null },
    hearts: 3, maxHearts: 3, score: 0, invulnUntil: 0,
    enemies: [], lastSpawn: 0, attackReadyAt: 0, last: 0, dialogTimer: null,
    isTouch: window.matchMedia("(pointer:coarse)").matches || "ontouchstart" in window,

    cache() {
        ["player", "playerShadow", "progressFill", "runeCounter", "dialogBox", "dialogText",
         "introScreen", "flash", "missionComplete", "nextBtn", "pauseMenu", "resumeBtn",
         "restartBtn", "homeBtn", "gameWorld", "bgMusic", "ghostWhisper", "wellRumble",
         "magicSound", "rewardSound", "collectSound", "continueDay3", "ambientWind"]
            .forEach((id) => (this[id] = $(id)));
        this.runes = [...document.querySelectorAll(".rune")];
        this.ghost = document.querySelector(".ghost");
        this.crystal = document.querySelector(".crystal");
    },

    buildUI() {
        document.body.classList.toggle("touch", this.isTouch);
        const hud = document.createElement("div");
        hud.id = "hud";
        hud.innerHTML = '<span id="hearts"></span><span id="score">⭐ 0</span>';
        document.body.appendChild(hud);

        this.enemyLayer = document.createElement("div");
        this.enemyLayer.id = "enemyLayer";
        this.gameWorld.appendChild(this.enemyLayer);

        const joy = document.createElement("div");
        joy.id = "joystick";
        joy.innerHTML = '<div id="stick"></div>';
        document.body.appendChild(joy);

        const atk = document.createElement("button");
        atk.id = "attackBtn";
        atk.type = "button";
        atk.textContent = "✨";
        atk.setAttribute("aria-label", "Banish spirits");
        document.body.appendChild(atk);

        const pause = document.createElement("button");
        pause.id = "pauseBtn";
        pause.type = "button";
        pause.textContent = "⏸";
        document.body.appendChild(pause);

        this.joyEl = joy; this.stick = $("stick"); this.attackBtn = atk;
        this.hearts_el = $("hearts"); this.score_el = $("score");
        atk.addEventListener("pointerdown", (e) => { e.preventDefault(); this.banish(); });
        pause.addEventListener("click", () => this.togglePause());
        this.renderHUD();
    },

    renderHUD() {
        this.hearts_el.textContent = "❤️".repeat(this.hearts) + "🖤".repeat(this.maxHearts - this.hearts);
        this.score_el.textContent = "⭐ " + this.score;
    },

    /* ---------- Supabase ---------- */
    async checkFestivalAccess() {
        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) { window.location.replace("login.html"); return false; }
            this.user = user;

            const { data, error } = await supabase.from("festival_progress")
                .select("day1,day2,day3,day4,day5,day6,day7")
                .eq("user_id", user.id).eq("festival", FEST).maybeSingle();

            if (error) { console.error(error); this.showMessage("Unable to load progress. Please refresh."); return false; }
            if (!data) { this.showMessage("Festival progress record not found."); return false; }
            if (data.day1 !== true) { alert("🔒 Complete Day 1 first!"); window.location.replace("map.html"); return false; }

            this.day2Finished = data.day2 === true;
            this.supabaseReady = true;

            // Offline backup: sync a completion that earlier failed to save
            if (!this.day2Finished && localStorage.getItem("vidlyra_day2_complete") === "true") {
                if (await this.saveDay2(1)) this.day2Finished = true;
            }
            return true;
        } catch (err) {
            console.error(err);
            this.showMessage("Connection error. Please refresh.");
            return false;
        }
    },

    async saveDay2(retries = 3) {
        for (let i = 0; i < retries; i++) {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error("Session expired");
                const { data, error } = await supabase.from("festival_progress")
                    .update({ day2: true }).eq("user_id", user.id).eq("festival", FEST)
                    .select("day2").maybeSingle();
                if (error) throw error;
                if (!data || data.day2 !== true) throw new Error("No row updated (check RLS)");
                try { localStorage.removeItem("vidlyra_day2_complete"); } catch (e) {}
                return true;
            } catch (err) {
                console.error("Save attempt failed:", err);
                await new Promise((r) => setTimeout(r, 800 * (i + 1)));
            }
        }
        return false;
    },

    /* ---------- Init ---------- */
    async init() {
        this.cache();
        this.buildUI();
        this.bindEvents();
        if (!(await this.checkFestivalAccess())) return;
        this.startIntro();
    },

    bindEvents() {
        window.addEventListener("keydown", (e) => {
            const k = e.key.toLowerCase();
            this.keys[k] = true;
            if (k === " ") { e.preventDefault(); this.banish(); }
            if (k === "escape" || k === "p") this.togglePause();
        });
        window.addEventListener("keyup", (e) => (this.keys[e.key.toLowerCase()] = false));
        window.addEventListener("blur", () => { this.keys = {}; });
        document.addEventListener("visibilitychange", () => { if (document.hidden) this.setPause(true); });
        window.addEventListener("resize", () => this.updatePlayerEl());

        this.runes.forEach((r) => r.addEventListener("click", () => this.collectRune(r)));

        // Joystick (pointer events: works for touch, pen and mouse)
        const j = this.joyEl;
        const move = (e) => {
            if (this.joy.id !== e.pointerId) return;
            const b = j.getBoundingClientRect(), R = b.width / 2 - 10;
            let dx = e.clientX - (b.left + b.width / 2), dy = e.clientY - (b.top + b.height / 2);
            const d = Math.hypot(dx, dy);
            if (d > R) { dx = (dx / d) * R; dy = (dy / d) * R; }
            this.joy.x = dx / R; this.joy.y = -dy / R;
            this.stick.style.transform = `translate(${dx}px,${dy}px)`;
        };
        const end = (e) => {
            if (this.joy.id !== e.pointerId) return;
            this.joy = { x: 0, y: 0, id: null };
            this.stick.style.transform = "translate(0,0)";
        };
        j.addEventListener("pointerdown", (e) => {
            e.preventDefault(); j.setPointerCapture(e.pointerId); this.joy.id = e.pointerId; move(e);
        });
        j.addEventListener("pointermove", move);
        j.addEventListener("pointerup", end);
        j.addEventListener("pointercancel", end);

        this.nextButton = this.nextBtn;
        [this.nextBtn, this.continueDay3, this.homeBtn].forEach((b) =>
            b && b.addEventListener("click", () => (window.location.href = "map.html")));
        this.resumeBtn?.addEventListener("click", () => this.setPause(false));
        this.restartBtn?.addEventListener("click", () => window.location.reload());

        // Browsers block autoplay until first interaction
        const unlock = () => {
            if (this.phase !== "loading") this.startAudio();
            window.removeEventListener("pointerdown", unlock);
            window.removeEventListener("keydown", unlock);
        };
        window.addEventListener("pointerdown", unlock);
        window.addEventListener("keydown", unlock);
    },

    startAudio() {
        if (this.bgMusic) { this.bgMusic.volume = 0.35; this.bgMusic.play().catch(() => {}); }
        if (this.ambientWind) { this.ambientWind.volume = 0.2; this.ambientWind.play().catch(() => {}); }
    },

    startIntro() {
        this.showMessage("Find the three Ancient Runes...");
        setTimeout(() => {
            this.introScreen?.classList.add("hide");
            this.startGame();
        }, 4500);
    },

    startGame() {
        this.startAudio();
        if (this.day2Finished) {
            this.phase = "done";
            this.showMessage("🎃 Day 2 is already complete!");
            this.showMissionComplete();
            return;
        }
        this.phase = "play";
        this.last = performance.now();
        this.lastSpawn = this.last;
        this.updatePlayerEl();
        requestAnimationFrame((t) => this.loop(t));
    },

    /* ---------- Pause ---------- */
    togglePause() { this.setPause(!this.paused); },
    setPause(v) {
        if (this.phase === "loading" || this.phase === "done") return;
        this.paused = v;
        this.pauseMenu.style.display = v ? "flex" : "none";
        if (!v) this.last = performance.now();
    },

    /* ---------- Loop ---------- */
    loop(now) {
        if (this.phase === "done") return;
        const dt = Math.min((now - this.last) / 1000, 0.05);
        this.last = now;
        if (!this.paused) {
            this.updatePlayer(dt);
            if (this.phase === "play") {
                this.spawnEnemies(now);
                this.updateEnemies(dt, now);
                this.checkRuneProximity();
            }
            this.attackBtn.classList.toggle("cooldown", now < this.attackReadyAt);
        }
        requestAnimationFrame((t) => this.loop(t));
    },

    updatePlayer(dt) {
        if (this.phase !== "play" && this.phase !== "crystal") return;
        const k = this.keys;
        let ix = (k.arrowright || k.d ? 1 : 0) - (k.arrowleft || k.a ? 1 : 0);
        let iy = (k.arrowup || k.w ? 1 : 0) - (k.arrowdown || k.s ? 1 : 0);
        if (!ix && !iy) { ix = this.joy.x; iy = this.joy.y; }
        const len = Math.hypot(ix, iy);
        if (len > 1) { ix /= len; iy /= len; }
        this.px = Math.max(3, Math.min(94, this.px + ix * this.speed * dt));
        this.py = Math.max(5, Math.min(75, this.py + iy * this.speed * dt));
        this.updatePlayerEl();
    },

    updatePlayerEl() {
        this.player.style.left = this.px + "%";
        this.player.style.bottom = this.py + "%";
        this.playerShadow.style.left = this.px + "%";
        this.playerShadow.style.bottom = Math.max(this.py - 2.5, 1) + "%";
    },

    center(el) {
        const w = this.gameWorld.getBoundingClientRect(), r = el.getBoundingClientRect();
        return { x: r.left - w.left + r.width / 2, y: r.top - w.top + r.height / 2 };
    },

    /* ---------- Enemies ---------- */
    maxEnemies() {
        return Math.min((this.isTouch ? 3 : 4) + this.runesFound * 2, this.isTouch ? 7 : 10);
    },

    spawnEnemies(now) {
        if (now - this.lastSpawn < 2200 || this.enemies.length >= this.maxEnemies()) return;
        this.lastSpawn = now;
        const t = ENEMIES[Math.floor(Math.random() * ENEMIES.length)];
        const w = this.gameWorld.getBoundingClientRect();
        const side = Math.floor(Math.random() * 4);
        let x = rand(0, w.width), y = rand(0, w.height);
        if (side === 0) y = -40; else if (side === 1) y = w.height + 40;
        else if (side === 2) x = -40; else x = w.width + 40;

        const el = document.createElement("div");
        el.className = "enemy";
        el.textContent = t.e;
        const en = { el, x, y, hp: t.hp, speed: t.speed * (1 + this.runesFound * 0.12), wob: rand(0, 6) };
        el.addEventListener("pointerdown", (e) => { e.stopPropagation(); this.damageEnemy(en); });
        this.enemyLayer.appendChild(el);
        this.enemies.push(en);
    },

    updateEnemies(dt, now) {
        const p = this.center(this.player);
        for (const en of [...this.enemies]) {
            en.wob += dt * 4;
            const dx = p.x - en.x, dy = p.y - en.y, d = Math.hypot(dx, dy) || 1;
            en.x += (dx / d) * en.speed * dt + Math.cos(en.wob) * 20 * dt;
            en.y += (dy / d) * en.speed * dt + Math.sin(en.wob) * 20 * dt;
            en.el.style.transform = `translate(${en.x - 24}px,${en.y - 24}px)`;
            if (d < 38 && now > this.invulnUntil) this.hurt(en, now);
        }
    },

    damageEnemy(en) {
        en.hp--;
        en.el.classList.add("hit");
        setTimeout(() => en.el.classList.remove("hit"), 150);
        if (en.hp <= 0) {
            this.removeEnemy(en);
            this.score += 10;
            this.renderHUD();
            this.playSound(this.collectSound);
        }
    },

    removeEnemy(en) {
        en.el.remove();
        this.enemies = this.enemies.filter((x) => x !== en);
    },

    clearEnemies() { [...this.enemies].forEach((e) => this.removeEnemy(e)); },

    banish() {
        const now = performance.now();
        if (this.phase !== "play" || this.paused || now < this.attackReadyAt) return;
        this.attackReadyAt = now + 1200;
        const p = this.center(this.player);
        const ring = document.createElement("div");
        ring.className = "banishRing";
        ring.style.left = p.x + "px";
        ring.style.top = p.y + "px";
        this.enemyLayer.appendChild(ring);
        setTimeout(() => ring.remove(), 600);
        this.playSound(this.magicSound);
        const radius = this.isTouch ? 130 : 160;
        this.enemies.filter((e) => Math.hypot(e.x - p.x, e.y - p.y) < radius).forEach((e) => this.damageEnemy(e));
    },

    hurt(en, now) {
        this.hearts--;
        this.invulnUntil = now + 1500;
        this.player.classList.add("hurt");
        setTimeout(() => this.player.classList.remove("hurt"), 1500);
        navigator.vibrate?.(80);
        this.removeEnemy(en);
        this.renderHUD();
        if (this.hearts <= 0) {
            this.showMessage("The spirits overwhelmed you... Try again!");
            this.hearts = this.maxHearts;
            this.px = 15; this.py = 12;
            this.invulnUntil = now + 3000;
            this.lastSpawn = now + 2000;
            this.clearEnemies();
            this.renderHUD();
            this.updatePlayerEl();
        }
    },

    /* ---------- Runes ---------- */
    checkRuneProximity() {
        const p = this.center(this.player);
        for (const r of this.runes) {
            if (r.classList.contains("found")) continue;
            const c = this.center(r);
            if (Math.hypot(c.x - p.x, c.y - p.y) < 60) this.collectRune(r);
        }
    },

    showMessage(msg) {
        if (!this.dialogBox) return;
        this.dialogText.textContent = msg;
        this.dialogBox.classList.add("show");
        clearTimeout(this.dialogTimer);
        this.dialogTimer = setTimeout(() => this.dialogBox.classList.remove("show"), 3000);
    },

    playSound(a) {
        if (!a) return;
        try { a.currentTime = 0; a.play().catch(() => {}); } catch (e) {}
    },

    collectRune(rune) {
        if (this.phase !== "play" || this.paused || rune.classList.contains("found")) return;
        rune.classList.add("found");
        this.runesFound = Math.min(this.runesFound + 1, this.totalRunes);
        this.score += 50;
        this.renderHUD();
        this.progressFill.style.width = (this.runesFound / this.totalRunes) * 100 + "%";
        this.runeCounter.textContent = `🔷 Ancient Runes: ${this.runesFound} / ${this.totalRunes}`;
        this.playSound(this.collectSound);
        this.playSound(this.magicSound);
        const msgs = ["The first rune has awakened...", "A strange energy surrounds the well...",
                      "The Haunted Well is awakening..."];
        this.showMessage(msgs[this.runesFound - 1]);
        if (this.runesFound === this.totalRunes) {
            this.phase = "event";
            this.clearEnemies();
            setTimeout(() => this.awakenWell(), 1500);
        }
    },

    /* ---------- Well event & crystal ---------- */
    awakenWell() {
        this.flash?.classList.add("active");
        setTimeout(() => this.flash?.classList.remove("active"), 500);
        document.body.classList.add("shake");
        setTimeout(() => document.body.classList.remove("shake"), 1200);
        this.playSound(this.wellRumble);
        this.playSound(this.ghostWhisper);
        setTimeout(() => this.ghost?.classList.add("active"), 1000);
        setTimeout(() => {
            this.crystal?.classList.add("active");
            this.showMessage("✨ Touch the Magic Crystal!");
            this.enableCrystal();
        }, 3000);
    },

    enableCrystal() {
        if (!this.crystal) { this.showMessage("Magic Crystal is missing from the page."); return; }
        this.phase = "crystal";
        this.crystalEnabled = true;
        this.crystal.style.pointerEvents = "auto";
        this.crystal.style.zIndex = "190";
        if (this.crystal.dataset.bound === "1") return;
        this.crystal.dataset.bound = "1";
        // pointerdown covers mouse + touch with one handler
        this.crystal.addEventListener("pointerdown", (e) => {
            e.preventDefault(); e.stopPropagation(); this.collectCrystal();
        });
    },

    collectCrystal() {
        if (!this.crystalEnabled || this.day2Finished || this.savingProgress) return;
        this.crystalEnabled = false;
        this.playSound(this.rewardSound);
        this.flash?.classList.add("active");
        setTimeout(() => this.flash?.classList.remove("active"), 400);
        this.showMessage("The Ancient Spirit accepts you...");
        setTimeout(() => this.finishDay(), 1000);
    },

    showMissionComplete() { this.missionComplete?.classList.add("show"); },

    async finishDay() {
        if (this.day2Finished) { this.showMissionComplete(); return; }
        if (this.savingProgress) return;
        if (!this.user || !this.supabaseReady) { this.showMessage("Please log in and reload the game."); return; }

        this.savingProgress = true;
        this.showMessage("Saving your progress...");
        try { localStorage.setItem("vidlyra_day2_complete", "true"); } catch (e) {}

        const ok = await this.saveDay2(3);
        this.savingProgress = false;

        if (ok) {
            this.day2Finished = true;
            this.phase = "done";
            this.showMessage("🎃 Day 2 Complete! Progress saved.");
            setTimeout(() => this.showMissionComplete(), 1000);
        } else {
            this.showMessage("⚠️ Could not save. Tap the crystal to retry.");
            this.crystalEnabled = true;
        }
    }
};

document.addEventListener("DOMContentLoaded", () => Game.init());
window.Game = Game;
