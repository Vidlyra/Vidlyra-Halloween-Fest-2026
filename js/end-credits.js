"use strict";

/* =========================================================
   🎃 VIDLYRA HALLOWEEN FEST 2026
   OFFICIAL END CREDITS
   end-credits.js
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTS
       ===================================================== */

    const loadingScreen = document.getElementById("loadingScreen");
    const creditsScreen = document.getElementById("creditsScreen");
    const creditsContent = document.getElementById("creditsContent");

    const skipButton = document.getElementById("skipButton");
    const replayButton = document.getElementById("replayButton");
    const homeButton = document.getElementById("homeButton");

    const postCreditScene = document.getElementById("postCreditScene");
    const pumpkinLantern = document.getElementById("pumpkinLantern");
    const mysteriousShadow = document.getElementById("mysteriousShadow");

    const finalMessage = document.getElementById("finalMessage");
    const comingSoon = document.getElementById("comingSoon");

    const backgroundMusic = document.getElementById("backgroundMusic");
    const ambientSound = document.getElementById("ambientSound");
    const whisperSound = document.getElementById("whisperSound");
    const fireSound = document.getElementById("fireSound");

    /* =====================================================
       SETTINGS
       ===================================================== */

    const SETTINGS = {
        creditsDuration: 60000,
        postCreditDelay: 3000,
        postCreditDuration: 10000,
        fadeDuration: 1200,

        musicVolume: 0.35,
        ambientVolume: 0.25,
        whisperVolume: 0.45,
        fireVolume: 0.25
    };

    /* =====================================================
       STATE
       ===================================================== */

    let creditsStarted = false;
    let creditsFinished = false;
    let postCreditStarted = false;
    let timers = [];

    /* =====================================================
       SAFE AUDIO
       ===================================================== */

    function playAudio(audio, volume, loop = false) {
        if (!audio) return;

        try {
            audio.volume = volume;
            audio.loop = loop;

            const promise = audio.play();

            if (promise && promise.catch) {
                promise.catch(() => {
                    // Browser autoplay restrictions.
                });
            }
        } catch (error) {
            // Audio is optional.
        }
    }

    function stopAudio(audio) {
        if (!audio) return;

        try {
            audio.pause();
            audio.currentTime = 0;
        } catch (error) {}
    }

    /* =====================================================
       UTILITY
       ===================================================== */

    function delay(callback, milliseconds) {
        const timer = setTimeout(callback, milliseconds);
        timers.push(timer);
        return timer;
    }

    function clearAllTimers() {
        timers.forEach(timer => clearTimeout(timer));
        timers = [];
    }

    function fadeOut(element, duration = SETTINGS.fadeDuration) {
        if (!element) return;

        element.style.transition = `opacity ${duration}ms ease`;
        element.style.opacity = "0";
    }

    function fadeIn(element, duration = SETTINGS.fadeDuration) {
        if (!element) return;

        element.style.transition = `opacity ${duration}ms ease`;
        element.style.opacity = "1";
    }

    /* =====================================================
       LOADING
       ===================================================== */

    function startLoading() {

        if (!loadingScreen) {
            startCredits();
            return;
        }

        loadingScreen.style.display = "flex";
        loadingScreen.style.opacity = "1";

        const progressBar = document.getElementById("loadingFill");
        const percentage = document.getElementById("loadingPercent");
        const loadingText = document.getElementById("loadingMessage");

        let progress = 0;

        const messages = [
            "Closing the gates...",
            "Returning the spirits...",
            "The cemetery grows silent...",
            "The final chapter begins...",
            "Preparing end credits..."
        ];

        const loadingInterval = setInterval(() => {

            progress += Math.random() * 12 + 5;

            if (progress >= 100) {
                progress = 100;
            }

            if (progressBar) {
                progressBar.style.width = `${progress}%`;
            }

            if (percentage) {
                percentage.textContent = `${Math.floor(progress)}%`;
            }

            if (loadingText) {
                const index = Math.min(
                    messages.length - 1,
                    Math.floor((progress / 100) * messages.length)
                );

                loadingText.textContent = messages[index];
            }

            if (progress >= 100) {

                clearInterval(loadingInterval);

                delay(() => {

                    loadingScreen.style.transition =
                        `opacity ${SETTINGS.fadeDuration}ms ease`;

                    loadingScreen.style.opacity = "0";

                    delay(() => {
                        loadingScreen.style.display = "none";
                        startCredits();
                    }, SETTINGS.fadeDuration);

                }, 500);
            }

        }, 180);
    }

    /* =====================================================
       START CREDITS
       ===================================================== */

    function startCredits() {

        if (creditsStarted) return;

        creditsStarted = true;

        if (creditsScreen) {
            creditsScreen.style.display = "flex";
            creditsScreen.style.opacity = "1";
        }

        if (creditsContent) {
            creditsContent.style.transform = "translateY(100vh)";

            requestAnimationFrame(() => {
                creditsContent.style.transition =
                    `transform ${SETTINGS.creditsDuration}ms linear`;

                creditsContent.style.transform =
                    "translateY(-100%)";
            });
        }

        /* Background music */

        playAudio(
            backgroundMusic,
            SETTINGS.musicVolume,
            true
        );

        playAudio(
            ambientSound,
            SETTINGS.ambientVolume,
            true
        );

        /* Start automatic post-credit sequence */

        delay(() => {
            finishCredits();
        }, SETTINGS.creditsDuration);
    }

    /* =====================================================
       FINISH CREDITS
       ===================================================== */

    function finishCredits() {

        if (creditsFinished) return;

        creditsFinished = true;

        if (creditsContent) {
            creditsContent.style.transition =
                "opacity 1s ease";

            creditsContent.style.opacity = "0";
        }

        delay(() => {
            startPostCreditScene();
        }, SETTINGS.postCreditDelay);
    }

    /* =====================================================
       POST-CREDIT SCENE
       ===================================================== */

    function startPostCreditScene() {

        if (postCreditStarted) return;

        postCreditStarted = true;

        if (creditsScreen) {
            creditsScreen.style.display = "none";
        }

        if (!postCreditScene) {
            showFinalMessage();
            return;
        }

        postCreditScene.style.display = "flex";
        postCreditScene.style.opacity = "0";

        requestAnimationFrame(() => {
            fadeIn(postCreditScene, 1800);
        });

        /* Pumpkin appears */

        delay(() => {

            if (pumpkinLantern) {

                pumpkinLantern.style.display = "block";
                pumpkinLantern.style.opacity = "0";
                pumpkinLantern.style.transform =
                    "scale(.7)";

                requestAnimationFrame(() => {

                    pumpkinLantern.style.transition =
                        "opacity 2s ease, transform 2s ease";

                    pumpkinLantern.style.opacity = "1";
                    pumpkinLantern.style.transform =
                        "scale(1)";
                });
            }

            playAudio(
                fireSound,
                SETTINGS.fireVolume,
                true
            );

        }, 1000);

        /* Shadow appears */

        delay(() => {

            if (mysteriousShadow) {

                mysteriousShadow.style.display = "block";
                mysteriousShadow.style.opacity = "0";

                requestAnimationFrame(() => {

                    mysteriousShadow.style.transition =
                        "opacity 3s ease";

                    mysteriousShadow.style.opacity = "1";
                });
            }

        }, 3500);

        /* Whisper */

        delay(() => {

            playAudio(
                whisperSound,
                SETTINGS.whisperVolume,
                false
            );

        }, 5200);

        /* Final message */

        delay(() => {

            showFinalMessage();

        }, SETTINGS.postCreditDuration);
    }

    /* =====================================================
       FINAL MESSAGE
       ===================================================== */

    function showFinalMessage() {

        if (finalMessage) {

            finalMessage.style.display = "flex";
            finalMessage.style.opacity = "0";

            requestAnimationFrame(() => {

                finalMessage.style.transition =
                    "opacity 2s ease";

                finalMessage.style.opacity = "1";
            });
        }

        if (comingSoon) {

            comingSoon.style.opacity = "0";

            delay(() => {

                comingSoon.style.transition =
                    "opacity 2s ease";

                comingSoon.style.opacity = "1";

            }, 2500);
        }

        /* Stop unnecessary sounds */

        stopAudio(ambientSound);

        delay(() => {

            stopAudio(backgroundMusic);
            stopAudio(fireSound);

        }, 5000);
    }

    /* =====================================================
       SKIP CREDITS
       ===================================================== */

    function skipCredits() {

        if (!creditsStarted) {
            startCredits();
            return;
        }

        clearAllTimers();

        if (creditsContent) {
            creditsContent.style.transition = "none";
            creditsContent.style.transform = "translateY(-100%)";
        }

        finishCredits();
    }

    /* =====================================================
       REPLAY EVENT
       ===================================================== */

    function replayEvent() {

        clearAllTimers();

        stopAudio(backgroundMusic);
        stopAudio(ambientSound);
        stopAudio(whisperSound);
        stopAudio(fireSound);

        /*
         * Change this if your Day 1 page
         * has a different filename.
         */

        window.location.href = "index.html";
    }

    /* =====================================================
       HOME
       ===================================================== */

    function goHome() {

        clearAllTimers();

        stopAudio(backgroundMusic);
        stopAudio(ambientSound);
        stopAudio(whisperSound);
        stopAudio(fireSound);

        window.location.href = "index.html";
    }

    /* =====================================================
       BUTTON EVENTS
       ===================================================== */

    if (skipButton) {
        skipButton.addEventListener("click", skipCredits);
    }

    if (replayButton) {
        replayButton.addEventListener("click", replayEvent);
    }

    if (homeButton) {
        homeButton.addEventListener("click", goHome);
    }

    /* =====================================================
       KEYBOARD CONTROLS
       ===================================================== */

    document.addEventListener("keydown", event => {

        if (event.code === "Escape") {
            skipCredits();
        }

        if (event.code === "Enter") {

            if (finalMessage) {

                const visible =
                    getComputedStyle(finalMessage).display !== "none";

                if (visible) {
                    replayEvent();
                }
            }
        }
    });

    /* =====================================================
       MOBILE TOUCH
       ===================================================== */

    document.addEventListener(
        "touchstart",
        event => {

            if (!creditsStarted) return;

            /*
             * Don't skip if the user touched
             * an actual button.
             */

            if (
                event.target.closest &&
                event.target.closest("button")
            ) {
                return;
            }
        },
        {
            passive: true
        }
    );

    /* =====================================================
       PREVENT PAGE SCROLL DURING CREDITS
       ===================================================== */

    document.body.style.overflow = "hidden";

    /* =====================================================
       INITIALIZE
       ===================================================== */

    startLoading();

});
