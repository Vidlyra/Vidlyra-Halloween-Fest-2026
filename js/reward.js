/* ==========================================
   VIDLYRA HALLOWEEN FEST 2026
   REWARD CONTROLLER
========================================== */

const Reward = {

    init() {

        console.log("🏆 Reward Screen Loaded");

        this.cache();

        this.bindEvents();

        this.loadXP();

        this.playMusic();

    },

    cache() {

        this.totalXP =
            document.getElementById("totalXP");

        this.mapBtn =
            document.getElementById("mapBtn");

        this.rewardMusic =
            document.getElementById("rewardMusic");

    },

    bindEvents() {

        if (this.mapBtn) {

            this.mapBtn.addEventListener(

                "click",

                () => this.returnToMap()

            );

        }

    },

    loadXP() {

        let xp = parseInt(

            localStorage.getItem("xp") || "0"

        );

        let current = 0;

        const counter = setInterval(() => {

            current++;

            this.totalXP.innerHTML = current;

            if (current >= xp) {

                clearInterval(counter);

            }

        }, 20);

        // Unlock Day 2
        localStorage.setItem(

            "day2Unlocked",

            "true"

        );

    },

    playMusic() {

        if (!this.rewardMusic) return;

        this.rewardMusic.volume = 0;

        this.rewardMusic.play().then(() => {

            let volume = 0;

            const fade = setInterval(() => {

                volume += 0.02;

                if (volume >= 0.40) {

                    volume = 0.40;

                    clearInterval(fade);

                }

                this.rewardMusic.volume = volume;

            }, 100);

        }).catch(() => {

            console.log("Music blocked until interaction.");

        });

    },

    returnToMap() {

        if (this.rewardMusic) {

            const fade = setInterval(() => {

                if (this.rewardMusic.volume > 0.02) {

                    this.rewardMusic.volume -= 0.02;

                } else {

                    clearInterval(fade);

                    window.location.href = "map.html";

                }

            }, 60);

        } else {

            window.location.href = "map.html";

        }

    }

};

document.addEventListener(

    "DOMContentLoaded",

    () => {

        Reward.init();

    }

);
