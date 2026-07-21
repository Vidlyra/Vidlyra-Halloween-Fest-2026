/* ==========================================
   VIDLYRA LEAF SYSTEM
========================================== */

class LeafSystem {

    constructor(){

        this.container = document.getElementById("leafContainer");

        this.images = [
            "assets/images/leaf 1.svg",
            "assets/images/leaf 2.svg",
            "assets/images/leaf 3.svg",
            "assets/images/leaf-autumn-fall-svgrepo-com.svg",
            "assets/images/leaf-yellow-autumn-svgrepo-com.svg"
        ];

        this.count =
            window.innerWidth < 768 ? 25 : 60;

    }

    init(){

        for(let i=0;i<this.count;i++){

            this.createLeaf();

        }

    }

    createLeaf(){

        const leaf = document.createElement("img");

        leaf.className = "leaf";

        leaf.src =
            this.images[
                Math.floor(Math.random()*this.images.length)
            ];

        const size = 18 + Math.random()*28;

        leaf.style.width = size + "px";

        leaf.style.left = Math.random()*100 + "%";

        leaf.style.animationDuration =
            (8 + Math.random()*8) + "s";

        leaf.style.animationDelay =
            (-Math.random()*12) + "s";

        leaf.style.animationRotation =
            (Math.random()*360) + "deg";

        this.container.appendChild(leaf);

    }

}

document.addEventListener("DOMContentLoaded",()=>{

    new LeafSystem().init();

});
