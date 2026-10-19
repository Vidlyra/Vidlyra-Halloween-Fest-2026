
/* ==========================================================
   VIDLYRA CHARACTER ENGINE
   Halloween Fest 2026
   Double-tap transformation + responsive visual effects
   ========================================================== */

(() => {
    "use strict";

    const ASSETS = {
        character: {
            idle: "assets/character/vidlyra-main.png",
            awakened: "assets/character/vidlyra-awakened.png",
            rage: "assets/character/vidlyra-rage.png",
            left: "assets/character/vidlyra-left.png",
            right: "assets/character/vidlyra-right.png",
            portrait: "assets/character/vidlyra-portrait.png",
            sprites: "assets/character/vidlyra-sprites.png"
        },

        backgrounds: {
            video: "assets/backgrounds/vidlyra-background.mp4",
            poster: "assets/backgrounds/vidlyra-poster.png",
            castle: "assets/backgrounds/haunted-castle.png",
            overlay: "assets/backgrounds/dark-overlay.png"
        },

        effects: {
            blueAura: "assets/effects/blue-aura.png",
            orangeAura: "assets/effects/orange-aura.png",
            rageBurst: "assets/effects/rage-burst.png",
            magicCircle: "assets/effects/magic-circle.png",
            lightning: "assets/effects/lightning.png",
            ember: "assets/effects/ember.png",
            fog: "assets/effects/fog.png",
            particles: "assets/effects/energy-particles.png"
        },

        ui: {
            logo: "assets/ui/vidlyra-logo.png",
            avatar: "assets/ui/default-avatar.png",
            transformIcon: "assets/ui/transformation-icon.png",
            cursor: "assets/ui/cursor-glow.png"
        },

        audio: {
            ambient: "assets/audio/ambient.mp3",
            awakening: "assets/audio/awakening.mp3",
            rage: "assets/audio/rage.mp3",
            transform: "assets/audio/transformation.mp3",
            click: "assets/audio/button-click.mp3"
        }
    };

    const STATES = ["idle", "awakened", "rage"];

    const SETTINGS = {
        doubleTapWindow: 360,
        effectDuration: 1100,
        particleCount: 24,
        audioEnabled: true,
        particlesEnabled: true,
        parallaxEnabled: true
    };

    let root = null;
    let character = null;
    let effectLayer = null;
    let aura = null;
    let caption = null;
    let controls = null;
    let stateLabel = null;
    let lastTapTime = 0;
    let currentState = "idle";
    let transformTimer = null;
    let pointerFrame = null;
    let initialized = false;

    const audioPlayers = {};
    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

    const stateInfo = {
        idle: {
            title: "THE UNKNOWN PRESENCE",
            color: "blue",
            image: ASSETS.character.idle,
            sound: ASSETS.audio.ambient
        },
        awakened: {
            title: "AN ANCIENT POWER AWAKENS",
            color: "blue",
            image: ASSETS.character.awakened,
            sound: ASSETS.audio.awakening
        },
        rage: {
            title: "UNLEASH THE FORBIDDEN POWER",
            color: "orange",
            image: ASSETS.character.rage,
            sound: ASSETS.audio.rage
        }
    };

    function addStyles() {
        if (document.getElementById("vl-engine-styles")) return;

        const style = document.createElement("style");
        style.id = "vl-engine-styles";

        style.textContent = `
            .heroCharacter {
                position: relative;
                isolation: isolate;
                overflow: visible !important;
                touch-action: manipulation;
                -webkit-tap-highlight-color: transparent;
            }

            .heroCharacter .characterFigure,
            .heroCharacter .characterHood,
            .heroCharacter .characterFace,
            .heroCharacter .characterEye,
            .heroCharacter .characterNeck,
            .heroCharacter .characterCloak,
            .heroCharacter .cloakShoulder,
            .heroCharacter .cloakPendant {
                display: none !important;
            }

            .vl-engine-character {
                position: absolute;
                z-index: 5;
                inset: 0;
                width: 100%;
                height: 100%;
                object-fit: contain;
                object-position: center bottom;
                user-select: none;
                -webkit-user-drag: none;
                cursor: pointer;
                outline: none;
                filter: drop-shadow(0 0 18px rgba(50,160,255,.25));
                transform-origin: center bottom;
                animation: vl-float 4.8s ease-in-out infinite;
                transition:
                    opacity .22s ease,
                    filter .35s ease,
                    transform .35s ease;
            }

            .vl-engine-character:focus-visible {
                filter:
                    drop-shadow(0 0 24px #38aaff)
                    drop-shadow(0 0 4px #fff);
            }

            .vl-engine-character:active {
                transform: scale(.985);
            }

            .heroCharacter.vl-orange .vl-engine-character {
                filter:
                    drop-shadow(0 0 24px rgba(255,95,0,.65))
                    drop-shadow(0 0 7px rgba(255,150,30,.4));
            }

            .heroCharacter.vl-transforming .vl-engine-character {
                opacity: .15;
                transform: scale(.90);
            }

            .vl-engine-aura {
                position: absolute;
                z-index: 2;
                width: 95%;
                aspect-ratio: 1;
                left: 50%;
                top: 42%;
                transform: translate(-50%, -50%);
                pointer-events: none;
                border-radius: 50%;
                background: radial-gradient(
                    circle,
                    rgba(35,155,255,.25) 0%,
                    rgba(25,105,255,.09) 42%,
                    transparent 72%
                );
                animation: vl-aura 3.5s ease-in-out infinite;
            }

            .heroCharacter.vl-orange .vl-engine-aura {
                background: radial-gradient(
                    circle,
                    rgba(255,80,0,.34) 0%,
                    rgba(255,40,0,.12) 42%,
                    transparent 72%
                );
            }

            .vl-engine-effect {
                position: absolute;
                z-index: 8;
                inset: -10%;
                overflow: hidden;
                pointer-events: none;
                opacity: 0;
            }

            .vl-engine-effect.vl-flash {
                animation: vl-flash .9s ease-out both;
            }

            .vl-engine-effect img {
                position: absolute;
                width: 100%;
                height: 100%;
                inset: 0;
                object-fit: contain;
                opacity: .85;
            }

            .vl-engine-particle {
                position: absolute;
                left: var(--x);
                bottom: 8%;
                width: var(--size);
                height: var(--size);
                border-radius: 50%;
                background: #75d7ff;
                box-shadow: 0 0 12px #269cff;
                opacity: 0;
                animation: vl-rise var(--duration) ease-out var(--delay) infinite;
            }

            .heroCharacter.vl-orange .vl-engine-particle {
                background: #ff9b38;
                box-shadow: 0 0 12px #ff4c00;
            }

            .vl-engine-caption {
                position: absolute;
                z-index: 12;
                left: 50%;
                bottom: 4px;
                transform: translateX(-50%);
                width: max-content;
                max-width: 100%;
                text-align: center;
                font: 700 8px/1.5 system-ui, sans-serif;
                letter-spacing: .16em;
                color: #b8e5ff;
                text-shadow: 0 0 12px #249bff;
                pointer-events: none;
            }

            .heroCharacter.vl-orange .vl-engine-caption {
                color: #ffc18c;
                text-shadow: 0 0 12px #ff5a00;
            }

            .vl-engine-controls {
                position: absolute;
                z-index: 20;
                bottom: 28px;
                right: 0;
                display: flex;
                flex-wrap: wrap;
                justify-content: flex-end;
                gap: 5px;
                pointer-events: auto;
            }

            .vl-engine-button {
                border: 1px solid rgba(85,175,255,.36);
                padding: 9px 10px;
                color: #d8efff;
                background: rgba(5,10,22,.82);
                font: 700 8px/1.2 system-ui, sans-serif;
                letter-spacing: .12em;
                cursor: pointer;
                touch-action: manipulation;
                backdrop-filter: blur(8px);
                transition: background .2s, border-color .2s;
            }

            .vl-engine-button[aria-pressed="true"],
            .vl-engine-button:hover {
                border-color: #55bdff;
                background: rgba(20,100,170,.55);
            }

            .heroCharacter.vl-orange .vl-engine-button[aria-pressed="true"] {
                border-color: #ff7b19;
                background: rgba(130,45,0,.55);
            }

            .vl-engine-hint {
                position: absolute;
                z-index: 15;
                top: 4px;
                left: 50%;
                transform: translateX(-50%);
                width: max-content;
                max-width: 100%;
                color: rgba(190,220,255,.72);
                font: 600 7px/1.4 system-ui, sans-serif;
                letter-spacing: .12em;
                text-align: center;
                pointer-events: none;
            }

            .vl-engine-logo {
                max-width: 100%;
                height: auto;
                object-fit: contain;
            }

            .vl-engine-cursor {
                position: fixed;
                z-index: 9999;
                width: 24px;
                height: 24px;
                pointer-events: none;
                transform: translate(-50%,-50%);
                background: radial-gradient(
                    circle,
                    rgba(50,170,255,.25),
                    transparent 70%
                );
            }

            @keyframes vl-float {
                0%,100% { translate: 0 0; }
                50% { translate: 0 -6px; }
            }

            @keyframes vl-aura {
                0%,100% { opacity: .55; scale: .96; }
                50% { opacity: 1; scale: 1.06; }
            }

            @keyframes vl-flash {
                0% {
                    opacity: 0;
                    transform: scale(.35) rotate(-12deg);
                }
                25% { opacity: 1; }
                65% {
                    opacity: .75;
                    transform: scale(1.05) rotate(4deg);
                }
                100% {
                    opacity: 0;
                    transform: scale(1.3) rotate(10deg);
                }
            }

            @keyframes vl-rise {
                0% {
                    opacity: 0;
                    transform: translate(0,0) scale(.5);
                }
                20% { opacity: .9; }
                100% {
                    opacity: 0;
                    transform: translate(var(--drift),-240px) scale(0);
                }
            }

            @media (max-width: 760px) {
                .heroCharacter {
                    max-width: 48vw;
                    max-height: 54vh;
                }

                .vl-engine-controls {
                    right: 0;
                    bottom: 16px;
                    gap: 4px;
                }

                .vl-engine-button {
                    padding: 8px;
                    font-size: 7px;
                }

                .vl-engine-caption {
                    font-size: 6px;
                    letter-spacing: .1em;
                }
            }

            @media (max-width: 420px) {
                .vl-engine-hint {
                    font-size: 6px;
                    letter-spacing: .07em;
                }

                .vl-engine-controls {
                    bottom: 10px;
                }

                .vl-engine-button {
                    padding: 7px 6px;
                }
            }

            @media (orientation: landscape) and (max-height: 520px) {
                .heroCharacter {
                    max-height: 75vh;
                }

                .vl-engine-controls {
                    bottom: 8px;
                }
            }

            @media (prefers-reduced-motion: reduce) {
                .vl-engine-character,
                .vl-engine-aura,
                .vl-engine-particle {
                    animation: none !important;
                }

                .vl-engine-effect.vl-flash {
                    animation-duration: .15s;
                }
            }
        `;

        document.head.appendChild(style);
    }

    function makeElement(tag, className) {
        const element = document.createElement(tag);
        element.className = className;
        return element;
    }

    function loadImage(src, callback) {
        const test = new Image();

        test.onload = () => callback(true, src);
        test.onerror = () => callback(false, src);

        test.src = src;
    }

    function preloadAssets() {
        Object.values(ASSETS.character).forEach(src => {
            const img = new Image();
            img.src = src;
        });
    }

    function getAvailableCharacterImage(state, callback) {
        const requested = stateInfo[state].image;

        loadImage(requested, (success) => {
            if (success) {
                callback(requested);
                return;
            }

            if (state === "idle") {
                callback(null);
                return;
            }

            loadImage(ASSETS.character.idle, (fallbackSuccess) => {
                callback(fallbackSuccess ? ASSETS.character.idle : null);
            });
        });
    }

    function playSound(src) {
        if (!SETTINGS.audioEnabled) return;

        if (src === ASSETS.audio.ambient) {
            // Ambient playback is optional and can be blocked until
            // the visitor interacts with the page.
        }

        try {
            let player = audioPlayers[src];

            if (!player) {
                player = new Audio(src);
                player.preload = "none";
                audioPlayers[src] = player;
            }

            player.pause();
            player.currentTime = 0;

            const result = player.play();

            if (result && typeof result.catch === "function") {
                result.catch(() => {
                    // Missing audio or browser autoplay restrictions.
                });
            }
        } catch (error) {
            console.warn("[VIDLYRA] Audio unavailable:", error);
        }
    }

    function createParticles() {
        if (!SETTINGS.particlesEnabled || reducedMotion.matches) return;

        for (let i = 0; i < SETTINGS.particleCount; i++) {
            const particle = makeElement("span", "vl-engine-particle");

            particle.style.setProperty("--x", `${Math.random() * 100}%`);
            particle.style.setProperty(
                "--size",
                `${2 + Math.random() * 3}px`
            );
            particle.style.setProperty(
                "--duration",
                `${2.5 + Math.random() * 4}s`
            );
            particle.style.setProperty(
                "--delay",
                `${-Math.random() * 6}s`
            );
            particle.style.setProperty(
                "--drift",
                `${Math.round(Math.random() * 100 - 50)}px`
            );

            effectLayer.appendChild(particle);
        }
    }

    function playTransformEffect(state) {
        effectLayer.classList.remove("vl-flash");
        effectLayer.replaceChildren();

        const effectSrc = state === "rage"
            ? ASSETS.effects.rageBurst
            : ASSETS.effects.magicCircle;

        const img = document.createElement("img");
        img.alt = "";
        img.setAttribute("aria-hidden", "true");
        img.src = effectSrc;

        img.onerror = () => {
            img.remove();
        };

        effectLayer.appendChild(img);

        void effectLayer.offsetWidth;
        effectLayer.classList.add("vl-flash");

        window.clearTimeout(transformTimer);

        transformTimer = window.setTimeout(() => {
            effectLayer.classList.remove("vl-flash");
        }, SETTINGS.effectDuration);
    }

    function setMode(nextState) {
        if (!STATES.includes(nextState)) return;

        currentState = nextState;

        root.classList.add("vl-transforming");

        getAvailableCharacterImage(nextState, (src) => {
            if (src) {
                character.src = src;
                character.dataset.state = nextState;
            }

            const info = stateInfo[nextState];

            root.classList.toggle("vl-orange", info.color === "orange");

            caption.textContent = info.title;
            stateLabel.textContent = info.title;

            controls.querySelectorAll("button").forEach(button => {
                button.setAttribute(
                    "aria-pressed",
                    String(button.dataset.state === nextState)
                );
            });

            playTransformEffect(nextState);
            playSound(info.sound);

            root.dispatchEvent(new CustomEvent("vidlyra:transform", {
                bubbles: true,
                detail: { state: nextState }
            }));

            window.setTimeout(() => {
                root.classList.remove("vl-transforming");
            }, 240);
        });
    }

    function transformNext() {
        const index = STATES.indexOf(currentState);
        const next = STATES[(index + 1) % STATES.length];
        setMode(next);
    }

    function handleDoubleTap(event) {
        if (event.target.closest(".vl-engine-controls")) return;

        const now = performance.now();
        const elapsed = now - lastTapTime;

        if (elapsed > 0 && elapsed < SETTINGS.doubleTapWindow) {
            lastTapTime = 0;
            transformNext();
        } else {
            lastTapTime = now;
        }
    }

    function handleKeyboard(event) {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            transformNext();
        }
    }

    function createControls() {
        controls = makeElement("div", "vl-engine-controls");
        controls.setAttribute("aria-label", "Character transformation");

        STATES.forEach(state => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "vl-engine-button";
            button.dataset.state = state;
            button.textContent = state.toUpperCase();
            button.setAttribute("aria-pressed", String(state === currentState));

            button.addEventListener("click", () => {
                setMode(state);
                playSound(ASSETS.audio.click);
            });

            controls.appendChild(button);
        });

        root.appendChild(controls);
    }

    function setupOptionalAssets() {
        // Logo: only replaces an existing logo if the image loads.
        const existingLogo = document.querySelector(
            ".brand img, .logo img, img[data-vidlyra-logo]"
        );

        if (existingLogo) {
            loadImage(ASSETS.ui.logo, success => {
                if (success) {
                    existingLogo.src = ASSETS.ui.logo;
                    existingLogo.classList.add("vl-engine-logo");
                }
            });
        }

        // A background video is optional; preserve the existing scene.
        const world = document.querySelector("#world");

        if (world && !world.querySelector(".vl-background-video")) {
            const video = document.createElement("video");

            video.className = "vl-background-video";
            video.src = ASSETS.backgrounds.video;
            video.autoplay = true;
            video.loop = true;
            video.muted = true;
            video.playsInline = true;
            video.setAttribute("aria-hidden", "true");

            Object.assign(video.style, {
                position: "absolute",
                inset: "0",
                width: "100%",
                height: "100%",
                objectFit: "cover",
                zIndex: "0",
                pointerEvents: "none",
                opacity: "0"
            });

            video.addEventListener("canplay", () => {
                video.style.opacity = ".22";
            }, { once: true });

            video.addEventListener("error", () => video.remove(), {
                once: true
            });

            world.prepend(video);

            const promise = video.play();
            if (promise) promise.catch(() => {});
        }
    }

    function setupParallax() {
        if (!SETTINGS.parallaxEnabled || reducedMotion.matches) return;
        if (!window.matchMedia("(pointer: fine)").matches) return;

        root.addEventListener("pointermove", event => {
            if (pointerFrame) cancelAnimationFrame(pointerFrame);

            pointerFrame = requestAnimationFrame(() => {
                const bounds = root.getBoundingClientRect();

                if (!bounds.width || !bounds.height) return;

                const dx = (event.clientX - bounds.left) / bounds.width - .5;
                const dy = (event.clientY - bounds.top) / bounds.height - .5;

                character.style.setProperty("--vl-x", `${dx * 8}px`);
                character.style.setProperty("--vl-y", `${dy * 6}px`);

                character.style.translate =
                    `${dx * 8}px ${dy * 6}px`;

                pointerFrame = null;
            });
        }, { passive: true });

        root.addEventListener("pointerleave", () => {
            character.style.translate = "0 0";
        });
    }

    function init() {
        if (initialized) return;

        root = document.querySelector(".heroCharacter");

        if (!root) {
            console.warn(
                "[VIDLYRA] .heroCharacter not found. Integration skipped."
            );
            return;
        }

        initialized = true;
        addStyles();
        preloadAssets();

        root.querySelectorAll(
            ".vl-engine-character, .vl-engine-aura, " +
            ".vl-engine-effect, .vl-engine-caption, " +
            ".vl-engine-controls, .vl-engine-hint"
        ).forEach(element => element.remove());

        aura = makeElement("div", "vl-engine-aura");
        aura.setAttribute("aria-hidden", "true");
        root.appendChild(aura);

        character = document.createElement("img");
        character.className = "vl-engine-character";
        character.src = ASSETS.character.idle;
        character.alt = "VIDLYRA dark fantasy character. Double tap to transform.";
        character.draggable = false;
        character.tabIndex = 0;
        character.setAttribute("role", "button");
        character.setAttribute(
            "aria-label",
            "Double tap or press Enter to transform the VIDLYRA character"
        );

        character.addEventListener("error", () => {
            console.error(
                "[VIDLYRA] Main character image missing:",
                ASSETS.character.idle
            );
            character.alt =
                "Character image missing. Check assets/character/vidlyra-main.png";
        });

        character.addEventListener("pointerup", handleDoubleTap);
        character.addEventListener("keydown", handleKeyboard);

        root.appendChild(character);

        effectLayer = makeElement("div", "vl-engine-effect");
        effectLayer.setAttribute("aria-hidden", "true");
        root.appendChild(effectLayer);

        caption = makeElement("div", "vl-engine-caption");
        caption.textContent = stateInfo.idle.title;
        root.appendChild(caption);

        stateLabel = document.createElement("span");
        stateLabel.hidden = true;
        root.appendChild(stateLabel);

        const hint = makeElement("div", "vl-engine-hint");
        hint.textContent = "DOUBLE TAP TO TRANSFORM";
        root.appendChild(hint);

        createParticles();
        createControls();
        setupParallax();
        setupOptionalAssets();

        console.info("[VIDLYRA] Character engine ready.");

        window.VidlyraCharacter = {
            setMode,
            transformNext,
            getMode: () => currentState,
            assets: ASSETS
        };
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init, { once: true });
    } else {
        init();
    }
})();
