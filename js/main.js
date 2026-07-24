/* ==========================================
   VIDLYRA HALLOWEEN FEST 2026
   MAIN CONTROLLER
========================================== */

const World = {

    init(){

        console.log("🎃 Vidlyra Halloween Fest 2026");

        this.cache();

        this.bindEvents();

        this.start();

    },

    cache(){

        this.enterButton =
            document.getElementById("enterBtn");

        this.background =
            document.querySelector(".background");

        this.castle =
            document.querySelector(".castle");

        this.hero =
            document.querySelector(".hero");

    },

    bindEvents(){

        if(this.enterButton){

            this.enterButton.addEventListener(
                "click",
                () => this.enterWorld()
            );

        }

    },

    start(){

    console.log("World Loaded");

    console.log("Rain System Ready");

}

    enterWorld(){

        console.log("Entering Halloween World...");

    }

};

document.addEventListener(
    "DOMContentLoaded",
    () => World.init()
);
const bgMusic = document.getElementById("bgMusic");
const buttonSound = document.getElementById("buttonSound");

const enterBtn = document.getElementById("enterBtn");

enterBtn.addEventListener("click", () => {

    buttonSound.currentTime = 0;
    buttonSound.play();

    bgMusic.volume = 0.35;

    bgMusic.play();

});
const thunder =
    document.getElementById("thunderSound");

thunder.currentTime = 0;

thunder.volume = 0.7;

thunder.play();
