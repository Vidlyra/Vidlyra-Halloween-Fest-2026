/* ==========================================
   VIDLYRA HALLOWEEN FEST 2026
   MAIN CONTROLLER
========================================== */

const World = {

    init() {

        console.log("🎃 Vidlyra Halloween Fest 2026");

        this.cache();
        this.bindEvents();
        this.start();

    },

    cache() {

        this.enterButton = document.getElementById("enterBtn");

        this.background = document.querySelector(".background");

        this.castle = document.querySelector(".castle");

        this.hero = document.querySelector(".hero");

        this.portal = document.getElementById("portal");

        this.world = document.querySelector(".world");

        this.bgMusic = document.getElementById("bgMusic");

        this.buttonSound = document.getElementById("buttonSound");

    },

    bindEvents() {

        if (this.enterButton) {

            this.enterButton.addEventListener("click", () => {

                this.enterWorld();

            });

        }

    },

    start() {

        console.log("🌍 World Loaded");
        console.log("🌧 Rain System Ready");
        console.log("⚡ Lightning Ready");
        console.log("🦇 Bat System Ready");
        console.log("🍂 Leaf System Ready");
        console.log("🎵 Audio Ready");

    },

    enterWorld() {

        console.log("🎮 Entering Halloween World...");

        // Prevent double click
        if (this.enterButton) {

            this.enterButton.disabled = true;

            this.enterButton.innerHTML = "Entering...";

        }

        // Button Sound
        if (this.buttonSound) {

            this.buttonSound.currentTime = 0;

            this.buttonSound.volume = 0.5;

            this.buttonSound.play().catch(error => {

                console.log(error);

            });

        }

        // Portal Animation
        if (this.portal) {

            this.portal.classList.add("active");

        }

        // Camera Zoom
        if (this.world) {

            setTimeout(() => {

                this.world.classList.add("enter");

            }, 500);

        }

        // Background Music Fade In
        setTimeout(() => {

            if (this.bgMusic && this.bgMusic.paused) {

                this.bgMusic.volume = 0;

                this.bgMusic.play().then(() => {

                    let volume = 0;

                    const fade = setInterval(() => {

                        volume += 0.02;

                        if (volume >= 0.35) {

                            volume = 0.35;

                            clearInterval(fade);

                        }

                        this.bgMusic.volume = volume;

                    }, 100);

                }).catch(error => {

                    console.log(error);

                });

            }

        }, 800);

        // Remove Portal
        setTimeout(() => {

            if (this.portal) {

                this.portal.classList.remove("active");

            }

        }, 2200);

        // Restore Button
        setTimeout(() => {

            if (this.enterButton) {

                this.enterButton.disabled = false;

                this.enterButton.innerHTML = "Welcome!";

            }

        }, 2500);

    }

};

document.addEventListener("DOMContentLoaded", () => {

    World.init();

});
