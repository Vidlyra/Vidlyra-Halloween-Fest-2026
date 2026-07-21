/* ==========================================
   VIDLYRA RAIN SYSTEM
========================================== */

class Rain {

    constructor(){

        this.container =
            document.getElementById("rain");

        this.count =
            window.innerWidth < 768 ? 180 : 400;

    }

    init(){

        for(let i=0;i<this.count;i++){

            const drop=document.createElement("div");

            drop.className="rain-drop";

            drop.style.left=Math.random()*100+"%";

            drop.style.height=
                12+Math.random()*22+"px";

            drop.style.opacity=
                0.2+Math.random()*0.8;

            drop.style.animationDuration=
                (0.45+Math.random()*0.5)+"s";

            drop.style.animationDelay=
                (-Math.random()*2)+"s";

            this.container.appendChild(drop);

        }

    }

}

document.addEventListener("DOMContentLoaded",()=>{

    new Rain().init();

});
