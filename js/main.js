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

    this.bgMusic =
        document.getElementById("bgMusic");

}

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

    this.startBackgroundMusic();

}
startBackgroundMusic(){

    if(!this.bgMusic) return;

    this.bgMusic.volume = 0;

    this.bgMusic.play().catch(() => {
        console.log("Music autoplay blocked.");
    });

    let volume = 0;

    const fade = setInterval(() => {

        volume += 0.02;

        if(volume >= 0.35){

            volume = 0.35;

            clearInterval(fade);

        }

        this.bgMusic.volume = volume;

    },100);

}
};

document.addEventListener(
    "DOMContentLoaded",
    () => World.init()
);
