
/* =========================================================
   VIDLYRA HALLOWEEN FEST 2026
   REAL CHARACTER INTEGRATION
   File: js/vidlyra-character.js
   ========================================================= */

(() => {
    "use strict";

    const CONFIG = {
        mainImage: "assets/character/vidlyra-main.png",
        awakenedImage: "assets/character/vidlyra-awakened.png",
        rageImage: "assets/character/vidlyra-rage.png",
        portraitImage: "assets/character/vidlyra-portrait.png",
        enableMouseParallax: true,
        enableParticles: true
    };

    const MODES = {
        idle: {
            label: "IDLE",
            image: CONFIG.mainImage,
            aura: "blue",
            description: "THE UNKNOWN PRESENCE"
        },
        awakened: {
            label: "AWAKENED",
            image: CONFIG.awakenedImage,
            aura: "blue",
            description: "AN ANCIENT POWER AWAKENS"
        },
        rage: {
            label: "RAGE",
            image: CONFIG.rageImage,
            aura: "orange",
            description: "UNLEASH THE FORBIDDEN POWER"
        }
    };

    let root;
    let image;
    let aura;
    let modeLabel;
    let caption;
    let particleLayer;
    let activeMode = "idle";
    let mouseFrame = null;

    function injectStyles() {
        if (document.getElementById("vidlyra-character-styles")) {
            return;
        }

        const style = document.createElement("style");
        style.id = "vidlyra-character-styles";

        style.textContent = `
            .heroCharacter {
                overflow: visible !important;
                pointer-events: none;
                isolation: isolate;
            }

            .heroCharacter .characterFigure,
            .heroCharacter .characterHood,
            .heroCharacter .characterFace,
            .heroCharacter .characterEye,
            .heroCharacter .characterNeck,
            .heroCharacter .characterCloak,
            .heroCharacter .cloakShoulder,
            .heroCharacter .cloakPendant,
            .heroCharacter .characterHalo {
                display: none !important;
            }

            .heroCharacter .characterAura {
                border-color: rgba(60, 190, 255, .35);
                box-shadow:
                    0 0 55px rgba(30, 140, 255, .22),
                    inset 0 0 45px rgba(30, 140, 255, .13);
            }

            .heroCharacter.vl-mode-orange .characterAura {
                border-color: rgba(255, 105, 0, .42);
                box-shadow:
                    0 0 65px rgba(255, 80, 0, .28),
                    inset 0 0 45px rgba(255, 80, 0, .15);
            }

            .vl-character-image {
                position: absolute;
                z-index: 4;
                left: 50%;
                bottom: 2%;
                width: 100%;
                height: 96%;
                object-fit: contain;
                object-position: center bottom;
                transform: translateX(-50%);
                filter:
                    drop-shadow(0 0 18px rgba(36, 155, 255, .24));
                animation: vlCharacterFloat 5s ease-in-out infinite;
                transition:
                    filter .5s ease,
                    opacity .35s ease,
                    transform .5s ease;
                user-select: none;
                -webkit-user-drag: none;
            }

            .heroCharacter.vl-mode-orange .vl-character-image {
                filter:
                    drop-shadow(0 0 22px rgba(255, 75, 0, .48));
            }

            .heroCharacter.vl-switching .vl-character-image {
                opacity: .15;
                transform: translateX(-50%) scale(.96);
            }

            .vl-character-aura {
                position: absolute;
                z-index: 2;
                left: 50%;
                top: 38%;
                width: 86%;
                aspect-ratio: 1;
                border-radius: 50%;
                transform: translate(-50%, -50%);
                background: radial-gradient(
                    circle,
                    rgba(40, 145, 255, .2),
                    rgba(40, 145, 255, .07) 38%,
                    transparent 72%
                );
                filter: blur(16px);
                pointer-events: none;
                animation: vlAuraPulse 4s ease-in-out infinite;
            }

            .heroCharacter.vl-mode-orange .vl-character-aura {
                background: radial-gradient(
                    circle,
                    rgba(255, 95, 0, .27),
                    rgba(255, 45, 0, .08) 42%,
                    transparent 72%
                );
            }

            .vl-character-particles {
                position: absolute;
                z-index: 5;
                inset: 0;
                overflow: hidden;
                pointer-events: none;
            }

            .vl-character-particle {
                position: absolute;
                bottom: 4%;
                width: 3px;
                height: 3px;
                border-radius: 50%;
                background: #8bdcff;
                box-shadow: 0 0 10px #299fff;
                animation: vlParticleRise var(--duration, 5s) linear infinite;
                animation-delay: var(--delay, 0s);
                opacity: 0;
            }

            .heroCharacter.vl-mode-orange .vl-character-particle {
                background: #ff8a00;
                box-shadow: 0 0 12px #ff5200;
            }

            .vl-character-controls {
                position: absolute;
                z-index: 80;
                right: 0;
                bottom: 28px;
                display: flex;
                justify-content: flex-end;
                flex-wrap: wrap;
                gap: 6px;
                pointer-events: auto;
            }

            .vl-character-mode {
                min-width: 76px;
                padding: 9px 11px;
                color: rgba(255,255,255,.72);
                background: rgba(3,8,18,.78);
                border: 1px solid rgba(100,170,255,.28);
                font: 600 8px/1.2 "Segoe UI", Arial, sans-serif;
                letter-spacing: .12em;
                cursor: pointer;
                backdrop-filter: blur(10px);
                transition: .25s ease;
            }

            .vl-character-mode:hover,
            .vl-character-mode[aria-pressed="true"] {
                color: #fff;
                border-color: #48bfff;
                background: rgba(20,95,155,.42);
                box-shadow: 0 0 18px rgba(35,145,255,.2);
            }

            .heroCharacter.vl-mode-orange .vl-character-mode[aria-pressed="true"] {
                border-color: #ff7a18;
                background: rgba(130,40,0,.42);
                box-shadow: 0 0 18px rgba(255,80,0,.22);
            }

            .vl-character-caption {
                position: absolute;
                z-index: 6;
                left: 50%;
                bottom: 4px;
                transform: translateX(-50%);
                width: max-content;
                max-width: 100%;
                color: rgba(180,220,255,.82);
                font: 600 7px/1.4 "Segoe UI", Arial, sans-serif;
                letter-spacing: .18em;
                text-align: center;
                text-shadow: 0 0 12px rgba(40,145,255,.6);
                pointer-events: none;
            }

            .heroCharacter.vl-mode-orange .vl-character-caption {
                color: rgba(255,175,115,.9);
                text-shadow: 0 0 12px rgba(255,75,0,.65);
            }

            .vl-character-caption::before {
                content: "";
                display: inline-block;
                width: 5px;
                height: 5px;
                margin-right: 7px;
                border-radius: 50%;
                background: currentColor;
                box-shadow: 0 0 8px currentColor;
                vertical-align: 1px;
            }

            .heroCharacter .characterGroundGlow {
                background: radial-gradient(
                    ellipse,
                    rgba(35,145,255,.24),
                    transparent 70%
                ) !important;
            }

            .heroCharacter.vl-mode-orange .characterGroundGlow {
                background: radial-gradient(
                    ellipse,
                    rgba(255,75,0,.28),
                    transparent 70%
                ) !important;
            }

            @keyframes vlCharacterFloat {
                0%, 100% {
                    margin-bottom: 0;
                    translate: 0 0;
                }
                50% {
                    margin-bottom: 7px;
                    translate: 0 -3px;
                }
            }

            @keyframes vlAuraPulse {
                0%, 100% { opacity: .55; scale: .96; }
                50% { opacity: 1; scale: 1.06; }
            }

            @keyframes vlParticleRise {
                0% {
                    opacity: 0;
                    transform: translate(0, 0) scale(.6);
                }
                15% { opacity: .85; }
                85% { opacity: .65; }
                100% {
                    opacity: 0;
                    transform: translate(var(--drift, 18px), -420px) scale(0);
                }
            }

            @media (max-width: 760px) {
                .heroCharacter {
                    right: -2% !important;
                    bottom: 9% !important;
                    width: clamp(155px, 43vw, 245px) !important;
                    height: 48vh !important;
                    opacity: .88 !important;
                }

                .vl-character-controls {
                    right: 0;
                    bottom: 17px;
                    gap: 4px;
                }

                .vl-character-mode {
                    min-width: 0;
                    padding: 7px 8px;
                    font-size: 7px;
                }

                .vl-character-caption {
                    display: none;
                }
            }

            @media (max-width: 420px) {
                .heroCharacter {
                    right: -5% !important;
                    bottom: 10% !important;
                    width: 165px !important;
                    height: 40vh !important;
                    opacity: .72 !important;
                }

                .vl-character-controls {
                    bottom: 12px;
                }
            }

            @media (max-height: 520px) and (orientation: landscape) {
                .heroCharacter {
                    right: 1% !important;
                    bottom: 5% !important;
                    width: 135px !important;
                    height: 70vh !important;
                }

                .vl-character-mode {
                    padding: 6px 8px;
                }
            }

            @media (prefers-reduced-motion: reduce) {
                .vl-character-image,
                .vl-character-aura,
                .vl-character-particle {
                    animation: none !important;
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

    function setImageSource(src) {
        image.src = src;
        image.onerror = () => {
            image.onerror = null;

            if (activeMode !== "idle") {
                setMode("idle");
                return;
            }

            caption.textContent =
                "IMAGE NOT FOUND — CHECK assets/character/vidlyra-main.png";

            console.error(
                "[VIDLYRA] Character image could not load:",
                src
            );
        };
    }

    function setMode(mode) {
        if (!MODES[mode] || !image || !root) return;

        activeMode = mode;
        const settings = MODES[mode];

        root.classList.add("vl-switching");

        window.setTimeout(() => {
            root.classList.toggle(
                "vl-mode-orange",
                settings.aura === "orange"
            );

            setImageSource(settings.image);
            caption.textContent = settings.description;
            modeLabel.textContent = settings.label;

            root.querySelectorAll(".vl-character-mode").forEach(button => {
                const selected = button.dataset.mode === mode;
                button.setAttribute("aria-pressed", String(selected));
            });

            root.classList.remove("vl-switching");

            root.dispatchEvent(new CustomEvent("vidlyra:charactermode", {
                bubbles: true,
                detail: { mode }
            }));
        }, 160);
    }

    function createControls() {
        const controls = makeElement("div", "vl-character-controls");
        controls.setAttribute("aria-label", "Character transformation modes");

        Object.entries(MODES).forEach(([key, mode]) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "vl-character-mode";
            button.dataset.mode = key;
            button.textContent = mode.label;
            button.setAttribute("aria-pressed", String(key === activeMode));
            button.setAttribute("aria-label", `Switch character to ${mode.label}`);

            button.addEventListener("click", () => setMode(key));
            controls.appendChild(button);
        });

        root.appendChild(controls);
    }

    function createParticles() {
        if (!CONFIG.enableParticles) return;

        particleLayer = makeElement("div", "vl-character-particles");
        particleLayer.setAttribute("aria-hidden", "true");

        for (let i = 0; i < 20; i++) {
            const particle = makeElement("span", "vl-character-particle");

            particle.style.left = `${8 + Math.random() * 84}%`;
            particle.style.setProperty(
                "--duration",
                `${3.5 + Math.random() * 5}s`
            );
            particle.style.setProperty(
                "--delay",
                `${-Math.random() * 7}s`
            );
            particle.style.setProperty(
                "--drift",
                `${Math.round(Math.random() * 70 - 35)}px`
            );

            particleLayer.appendChild(particle);
        }

        root.appendChild(particleLayer);
    }

    function addMouseParallax() {
        if (!CONFIG.enableMouseParallax ||
            !window.matchMedia("(pointer: fine)").matches) {
            return;
        }

        const home = document.querySelector("#homePage");
        if (!home) return;

        home.addEventListener("mousemove", event => {
            if (mouseFrame !== null) {
                cancelAnimationFrame(mouseFrame);
            }

            mouseFrame = requestAnimationFrame(() => {
                const rect = root.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;

                const x = (event.clientX - centerX) / Math.max(innerWidth, 1);
                const y = (event.clientY - centerY) / Math.max(innerHeight, 1);

                image.style.marginLeft = `${x * 12}px`;
                image.style.marginTop = `${y * 10}px`;

                mouseFrame = null;
            });
        }, { passive: true });

        home.addEventListener("mouseleave", () => {
            image.style.marginLeft = "0";
            image.style.marginTop = "0";
        });
    }

    function init() {
        root = document.querySelector(".heroCharacter");

        if (!root) {
            console.warn(
                "[VIDLYRA] .heroCharacter was not found. Character integration skipped."
            );
            return;
        }

        if (root.dataset.vidlyraIntegrated === "true") return;
        root.dataset.vidlyraIntegrated = "true";

        injectStyles();

        aura = makeElement("div", "vl-character-aura");
        aura.setAttribute("aria-hidden", "true");
        root.appendChild(aura);

        image = document.createElement("img");
        image.className = "vl-character-image";
        image.alt = "VIDLYRA dark fantasy anime character";
        image.draggable = false;
        image.decoding = "async";
        image.fetchPriority = "high";
        root.appendChild(image);

        modeLabel = makeElement("span", "vl-character-mode-label");
        modeLabel.hidden = true;
        root.appendChild(modeLabel);

        caption = makeElement("div", "vl-character-caption");
        caption.textContent = MODES.idle.description;
        root.appendChild(caption);

        createParticles();
        createControls();
        addMouseParallax();
        setMode("idle");

        console.info("[VIDLYRA] Character integration initialized.");
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init, { once: true });
    } else {
        init();
    }

    // Optional console controls:
    // window.VidlyraCharacter.setMode("idle" | "awakened" | "rage")
    window.VidlyraCharacter = {
        setMode,
        getMode: () => activeMode
    };
})();
