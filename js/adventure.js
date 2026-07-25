const pumpkin =
    document.querySelector(".pumpkin");

const progress =
    document.querySelector(".progress-fill");

const popup =
    document.getElementById("missionComplete");

pumpkin.addEventListener("click",()=>{

    progress.style.width="100%";

    popup.classList.add("show");

    setTimeout(()=>{

        window.location.href="reward.html";

    },2500);

});
/* ==========================================
   VIDLYRA HALLOWEEN FEST 2026
   ADVENTURE CONTROLLER
========================================== */

const Adventure = {

    xp:100,

    init(){

        console.log("🎃 Adventure Started");

        this.cache();

        this.bindEvents();

        this.loadProgress();

    },

    cache(){

        this.pumpkin =
            document.querySelector(".pumpkin");

        this.progress =
            document.querySelector(".progress-fill");

        this.popup =
            document.getElementById("missionComplete");

        this.continueBtn =
            document.getElementById("continueBtn");

        this.bgMusic =
            document.getElementById("bgMusic");

        this.buttonSound =
            document.getElementById("buttonSound");

    },

    bindEvents(){

        if(this.pumpkin){

            this.pumpkin.addEventListener(

                "click",

                ()=>this.completeMission()

            );

        }

        if(this.continueBtn){

            this.continueBtn.addEventListener(

                "click",

                ()=>this.showHint()

            );

        }

    },

    loadProgress(){

        const completed =
            localStorage.getItem("day1Complete");

        if(completed==="true"){

            this.progress.style.width="100%";

        }

    },

    showHint(){

        alert("🎃 Find and click the glowing Pumpkin Gate!");

    },

    completeMission(){

        if(localStorage.getItem("day1Complete")==="true"){

            return;

        }

        if(this.buttonSound){

            this.buttonSound.currentTime=0;

            this.buttonSound.play();

        }

        this.progress.style.width="100%";

        localStorage.setItem(

            "day1Complete",

            "true"

        );

        localStorage.setItem(

            "xp",

            this.xp

        );

        setTimeout(()=>{

            this.popup.classList.add("show");

        },800);

        setTimeout(()=>{

            window.location.href="reward.html";

        },3500);

    }

};

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        Adventure.init();

    }

);
