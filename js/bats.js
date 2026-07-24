/* ==========================================
   VIDLYRA BAT SYSTEM
========================================== */

class BatSystem {

    constructor(){

        this.container = document.getElementById("batContainer");

        this.images = [
            "assets/images/bat 1.svg",
            "assets/images/bat 2.svg",
            "assets/images/bat 3.svg"
        ];

       // Desktop : 24 bats
      // Mobile  : 12 bats

this.count =
    window.innerWidth < 768 ? 12 : 24;

    }

    init(){

        for(let i=0;i<this.count;i++){

            this.createBat();

        }

    }

    createBat(){

        const bat=document.createElement("img");

        bat.src=this.images[
            Math.floor(Math.random()*this.images.length)
        ];

        bat.className="bat";

        const size = 18 + Math.random() * 20;

        bat.style.width=size+"px";

        bat.style.top = (8 + Math.random() * 35) + "%";
        const duration = 14 + Math.random() * 10;

        bat.style.animationDuration=duration+"s";

        bat.style.animationDelay=(-Math.random()*duration)+"s";

        if(Math.random()>0.5){

            bat.classList.add("reverse");

        }

        this.container.appendChild(bat);

    }

}

document.addEventListener("DOMContentLoaded",()=>{

    new BatSystem().init();

});
