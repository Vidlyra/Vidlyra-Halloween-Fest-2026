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

    },

    enterWorld(){

        console.log("Entering Halloween World...");

    }

};

document.addEventListener(
    "DOMContentLoaded",
    () => World.init()
);
