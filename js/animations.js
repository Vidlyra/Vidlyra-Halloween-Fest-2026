const lightning = document.querySelector(".lightning");

function flashLightning(){

    lightning.classList.add("flash");

    setTimeout(()=>{
        lightning.classList.remove("flash");
    },800);

}

setInterval(()=>{

    flashLightning();

},5000);
