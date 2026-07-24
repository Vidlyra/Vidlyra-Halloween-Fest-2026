const lightning = document.getElementById("lightning");

function createLightning(){

    lightning.innerHTML = "";

    const svgNS = "http://www.w3.org/2000/svg";

    const path = document.createElementNS(svgNS,"path");

    let d = "";

    let x = 20 + Math.random()*60;
    let y = 0;

    d += `M ${x} ${y}`;

    while(y < 100){

        x += (Math.random()-0.5)*8;
        y += 8 + Math.random()*12;

        d += ` L ${x} ${y}`;

    }

    path.setAttribute("d",d);
    path.setAttribute("fill","none");
    path.setAttribute("stroke","white");
    path.setAttribute("stroke-width","0.6");
    path.setAttribute("stroke-linecap","round");

    lightning.appendChild(path);

    flashScene();

    setTimeout(()=>{
        lightning.innerHTML="";
    },180);

}

function flashScene(){

    document.body.classList.add("flash");

    setTimeout(()=>{
        document.body.classList.remove("flash");
    },180);

}

function randomLightning(){

    createLightning();

    const next = 3000 + Math.random()*7000;

    setTimeout(randomLightning,next);

}

randomLightning();
/* ==========================================
   VIDLYRA LIGHTNING SYSTEM
========================================== */

class Lightning {

    constructor(){

        this.svg = document.getElementById("lightning");

        this.thunder = document.getElementById("thunderSound");

        this.flash = null;

        this.start();

    }

    start(){

        this.schedule();

    }

    schedule(){

        const delay = 5000 + Math.random() * 8000;

        setTimeout(()=>{

            this.strike();

            this.schedule();

        },delay);

    }

    strike(){

        this.createBolt();

        document.body.classList.add("flash");

        document.body.classList.add("shake");

        setTimeout(()=>{

            document.body.classList.remove("flash");

        },180);

        setTimeout(()=>{

            document.body.classList.remove("shake");

        },350);

        if(this.thunder){

            this.thunder.currentTime = 0;

            this.thunder.volume = 0.8;

            setTimeout(()=>{

                this.thunder.play();

            },400);

        }

    }

    createBolt(){

        this.svg.innerHTML="";

        const path=document.createElementNS(
            "http://www.w3.org/2000/svg",
            "path"
        );

        const startX =
            Math.random()*window.innerWidth;

        let d=`M ${startX} 0`;

        let x=startX;

        let y=0;

        while(y<window.innerHeight*0.8){

            x+=Math.random()*80-40;

            y+=40+Math.random()*40;

            d+=` L ${x} ${y}`;

        }

        path.setAttribute("d",d);

        path.setAttribute("stroke","#ffffff");

        path.setAttribute("stroke-width","4");

        path.setAttribute("fill","none");

        path.setAttribute("stroke-linecap","round");

        path.setAttribute("filter","url(#glow)");

        this.svg.appendChild(path);

        setTimeout(()=>{

            this.svg.innerHTML="";

        },180);

    }

}

document.addEventListener("DOMContentLoaded",()=>{

    new Lightning();

});
