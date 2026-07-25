/* ==========================================
   VIDLYRA HALLOWEEN FEST 2026
   EVENT MAP
========================================== */

const EventMap = {

    init(){

        console.log("🗺 Event Map Loaded");

        this.cache();

        this.bindEvents();

        this.start();

    },

    cache(){

        this.nodes =
            document.querySelectorAll(".node");

        this.activeNode =
            document.querySelector(".node.active");

        this.buttonSound =
            document.getElementById("buttonSound");

    },

    bindEvents(){

        this.nodes.forEach(node=>{

            node.addEventListener("click",()=>{

                this.handleNode(node);

            });

        });

    },

    start(){

        console.log("🎃 Ready");

    },

    handleNode(node){

        if(node.classList.contains("active")){

            this.openDay1();

        }else{

            this.showLocked(node);

        }

    },

    openDay1(){

        if(this.buttonSound){

            this.buttonSound.currentTime = 0;

            this.buttonSound.play();

        }

        this.activeNode.classList.add("selected");

        setTimeout(()=>{

            window.location.href="story.html";

        },800);

    },

    showLocked(node){

        node.classList.add("shake");

        setTimeout(()=>{

            node.classList.remove("shake");

        },500);

        alert("🔒 This chapter is still locked!");

    }

};

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        EventMap.init();

    }

);
