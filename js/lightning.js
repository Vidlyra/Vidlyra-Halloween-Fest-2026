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
