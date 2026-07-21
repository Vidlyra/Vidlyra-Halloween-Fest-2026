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

        this.count =
            window.innerWidth < 768 ? 20 : 40;

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

        const size=20+Math.random()*35;

        bat.style.width=size+"px";

        bat.style.top=(5+Math.random()*45)+"%";

        const duration=10+Math.random()*12;

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
