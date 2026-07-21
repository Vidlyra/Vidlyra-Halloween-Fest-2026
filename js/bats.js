const batContainer = document.getElementById("batContainer");

const BAT_IMAGES = [
    "assets/images/bat.svg.png",
    "assets/images/bat1.svg.png"
];

const BAT_COUNT = 50;

for(let i=0;i<BAT_COUNT;i++){

    const bat=document.createElement("img");

    bat.src=BAT_IMAGES[
        Math.floor(Math.random()*BAT_IMAGES.length)
    ];

    bat.className="bat";

    const size=20+Math.random()*35;

    bat.style.width=size+"px";

    bat.style.top=(5+Math.random()*45)+"%";

    const duration=10+Math.random()*15;

    bat.style.animationDuration=duration+"s";

    bat.style.animationDelay=(-Math.random()*duration)+"s";

    if(Math.random()>0.5){

        bat.classList.add("reverse");

    }

    batContainer.appendChild(bat);

}
