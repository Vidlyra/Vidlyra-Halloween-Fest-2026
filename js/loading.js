const bar = document.getElementById("bar");

const percent = document.getElementById("percent");

const status = document.getElementById("status");
// Lightning

const lightning=document.querySelector(".lightning");

setInterval(()=>{

if(Math.random()>.6){

lightning.classList.add("flash");

document.body.classList.add("shake");

setTimeout(()=>{

lightning.classList.remove("flash");

document.body.classList.remove("shake");

},350);

}

},4000);


// Particles

const particles=document.getElementById("particles");

for(let i=0;i<300;i++){

const p=document.createElement("div");

p.className="particle";

p.style.left=Math.random()*100+"vw";

p.style.animationDuration=(6+Math.random()*8)+"s";

p.style.animationDelay=Math.random()*8+"s";

particles.appendChild(p);

}
const messages = [

"Initializing Halloween Realm...",

"Summoning Shadow Bats...",

"Awakening Ancient Spirits...",

"Opening the Veil...",

"Preparing Haunted World...",

"Welcome, Spirit Hunter..."

];

let progress = 0;

const loader = setInterval(()=>{

progress++;

bar.style.width = progress + "%";

percent.innerHTML = progress + "%";

if(progress==20){

status.innerHTML=messages[1];

}

if(progress==40){

status.innerHTML=messages[2];

}

if(progress==60){

status.innerHTML=messages[3];

}

if(progress==80){

status.innerHTML=messages[4];

}

if(progress==100){

status.innerHTML=messages[5];

clearInterval(loader);

setTimeout(()=>{

window.location="home.html";

},1200);

}

},50);
