const bar = document.getElementById("bar");

const percent = document.getElementById("percent");

const status = document.getElementById("status");

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
