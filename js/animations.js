console.log("Animations Loaded");
const lightning = document.querySelector(".lightning");

function flashLightning(){

    lightning.classList.add("flash");

    setTimeout(()=>{
        lightning.classList.remove("flash");
    },350);

}

setInterval(()=>{

    const random=Math.random();

    if(random>0.80){

        flashLightning();

    }

},2500);
