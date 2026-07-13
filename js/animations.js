const thunder=new Audio("assets/audio/thunder.mp3");

thunder.volume=.35;
const svg=document.querySelector(".lightning-svg");
const moon=document.querySelector(".moon");
const fog=document.querySelectorAll(".fog");

function lightning(){

svg.innerHTML="";

const startX=Math.random()*window.innerWidth;

let x=startX;

let y=0;

let path=`M ${x} ${y}`;

for(let i=0;i<10;i++){

x+=Math.random()*80-40;

y+=70;

path+=` L ${x} ${y}`;

}

const bolt=document.createElementNS("http://www.w3.org/2000/svg","path");

bolt.setAttribute("d",path);

bolt.setAttribute("class","lightning-line");

svg.appendChild(bolt);

bolt.animate(

[
{opacity:0},
{opacity:1},
{opacity:.3},
{opacity:1},
{opacity:0}
],

{
duration:450
}

);

moon.classList.add("flash");

fog.forEach(f=>f.classList.add("flash"));

document.body.classList.add("shake");

setTimeout(()=>{

moon.classList.remove("flash");

fog.forEach(f=>f.classList.remove("flash"));

document.body.classList.remove("shake");

svg.innerHTML="";

},450);

}

setInterval(()=>{

if(Math.random()>0.55){

lightning();
thunder.currentTime=0;
thunder.play();

}

},3500);
