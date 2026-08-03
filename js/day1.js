```javascript
/* =========================================
   VIDLYRA HALLOWEEN FEST 2026
   DAY 1 — THE CURSED GATE
========================================= */


/* =========================================
   ELEMENTS
========================================= */

const gateArea =
    document.getElementById("gateArea");

const symbolPanel =
    document.getElementById("symbolPanel");

const message =
    document.getElementById("message");

const messageTitle =
    document.getElementById("messageTitle");

const messageText =
    document.getElementById("messageText");

const portal =
    document.getElementById("portal");

const continueBtn =
    document.getElementById("continueBtn");

const flash =
    document.getElementById("flash");

const symbols =
    document.querySelectorAll(".symbol");


/* =========================================
   GAME STATE
========================================= */

let completed = false;


/* =========================================
   INTRO
========================================= */

window.addEventListener("load", () => {

    setTimeout(() => {

        messageTitle.textContent =
            "The gate watches...";

        messageText.textContent =
            "Find the symbol that does not belong.";

        message.classList.add("show");

    }, 700);

});


/* =========================================
   SYMBOL CLICK
========================================= */

symbols.forEach((symbol) => {

    symbol.addEventListener("click", () => {

        if (completed) {
            return;
        }

        const isCorrect =
            symbol.dataset.correct === "true";

        if (isCorrect) {

            completeDay();

        } else {

            wrongAnswer();

        }

    });

});


/* =========================================
   WRONG ANSWER
========================================= */

function wrongAnswer() {

    gateArea.classList.remove("shake");

    /* Restart animation */

    void gateArea.offsetWidth;

    gateArea.classList.add("shake");


    messageTitle.textContent =
        "The gate rejects you...";

    messageText.textContent =
        "That symbol belongs to the curse. Try again.";

    message.classList.add("show");

}


/* =========================================
   COMPLETE DAY 1
========================================= */

function completeDay() {

    completed = true;


    /* Disable all symbols */

    symbols.forEach((symbol) => {

        symbol.disabled = true;

        symbol.style.pointerEvents =
            "none";

    });


    /* Hide challenge */

    symbolPanel.style.opacity = "0";

    symbolPanel.style.pointerEvents =
        "none";


    /* Flash effect */

    flash.classList.add("active");


    setTimeout(() => {

        flash.classList.remove("active");

    }, 180);


    /* Success message */

    messageTitle.textContent =
        "THE CURSE HAS BEEN BROKEN.";

    messageText.textContent =
        "The gate has opened. Your journey continues...";

    message.classList.add("show");


    /* Open portal */

    setTimeout(() => {

        portal.classList.add("open");

    }, 450);


    /* Show Day 2 button */

    setTimeout(() => {

        continueBtn.classList.add("show");

    }, 1300);

}


/* =========================================
   DAY 2 REDIRECT
========================================= */

continueBtn.addEventListener("click", () => {

    if (!completed) {
        return;
    }


    continueBtn.textContent =
        "OPENING DAY 2...";


    continueBtn.style.pointerEvents =
        "none";


    /* Fade screen */

    document.body.style.opacity =
        "0";


    /* Redirect */

    setTimeout(() => {

        window.location.href =
            "day2-video.html";

    }, 800);

});


/* =========================================
   ENTER KEY
========================================= */

document.addEventListener("keydown", (event) => {

    if (
        event.key === "Enter" &&
        completed
    ) {

        continueBtn.click();

    }

});
```
