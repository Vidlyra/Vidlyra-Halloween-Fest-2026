/* ==========================================
   VIDLYRA RAIN SYSTEM
========================================== */

class RainSystem {

    constructor(){

        this.container = document.getElementById("rain");

        this.totalDrops =
            window.innerWidth < 768 ? 180 : 350;

    }

    create(){

        for(let i=0;i<this.totalDrops;i++){

            const drop=document.createElement("div");

            drop.className="rain-drop";

            drop.style.left=Math.random()*100+"%";

            drop.style.animationDelay=
                Math.random()*2+"s";

            drop.style.animationDuration=
                (0.5+Math.random()*0.7)+"s";

            drop.style.opacity=
                0.2+Math.random()*0.5;

            drop.style.height=
                10+Math.random()*25+"px";

            this.container.appendChild(drop);

        }

    }

}

document.addEventListener("DOMContentLoaded",()=>{

    const rain=new RainSystem();

    rain.create();

});
