
/* =====================================================
   VIDLYRA HALLOWEEN FEST 2026
   HAUNTED ADVENTURE MAP
===================================================== */

"use strict";

const VidlyraMap = {
    totalChapters: 7,

    completionKeys: [
        "day1Complete",
        "day2Complete",
        "day3Complete",
        "day4Complete",
        "day5Complete",
        "day6Complete",
        "day7Complete"
    ],

    toastTimer: null,

    init() {
        this.cacheElements();
        this.createEmbers();
        this.updateProgress();
        this.bindEvents();

        console.log("🎃 VIDLYRA HALLOWEEN FEST 2026");
        console.log("🗺 Haunted Adventure Map initialized.");
    },

    cacheElements() {
        this.embersContainer = document.getElementById("embers");
        this.completedCount = document.getElementById("completedCount");
        this.progressText = document.getElementById("progressText");
        this.progressFill = document.getElementById("progressFill");
        this.progressBar = document.getElementById("progressBar");
        this.resetButton = document.getElementById("resetProgress");
        this.toast = document.getElementById("toast");

        this.chapterRows = document.querySelectorAll(".day-row[data-day]");
    },

    bindEvents() {
        if (this.resetButton) {
            this.resetButton.addEventListener("click", () => {
                this.resetProgress();
            });
        }

        // Refresh completion status when returning to this page.
        window.addEventListener("pageshow", () => {
            this.updateProgress();
        });

        // Also refresh if completion changes in another browser tab.
        window.addEventListener("storage", (event) => {
            if (
                this.completionKeys.includes(event.key) ||
                event.key === null
            ) {
                this.updateProgress();
            }
        });
    },

    createEmbers() {
        if (!this.embersContainer) {
            return;
        }

        const fragment = document.createDocumentFragment();
        const emberCount = window.matchMedia(
            "(max-width: 520px)"
        ).matches ? 16 : 30;

        for (let i = 0; i < emberCount; i++) {
            const ember = document.createElement("span");

            ember.className = "ember";
            ember.setAttribute("aria-hidden", "true");

            ember.style.left = `${Math.random() * 100}%`;
            ember.style.setProperty(
                "--duration",
                `${8 + Math.random() * 12}s`
            );
            ember.style.setProperty(
                "--delay",
                `${-Math.random() * 18}s`
            );
            ember.style.setProperty(
                "--drift",
                `${Math.round(Math.random() * 120 - 60)}px`
            );

            const size = 2 + Math.random() * 2;
            ember.style.width = `${size}px`;
            ember.style.height = `${size}px`;

            fragment.appendChild(ember);
        }

        this.embersContainer.appendChild(fragment);
    },

    getCompletedDays() {
        let completed = 0;

        this.completionKeys.forEach((key) => {
            try {
                if (localStorage.getItem(key) === "true") {
                    completed++;
                }
            } catch (error) {
                console.warn(
                    "Unable to read chapter progress:",
                    error
                );
            }
        });

        return completed;
    },

    isChapterCompleted(dayNumber) {
        const key = this.completionKeys[dayNumber - 1];

        if (!key) {
            return false;
        }

        try {
            return localStorage.getItem(key) === "true";
        } catch (error) {
            console.warn(
                "Unable to read chapter completion:",
                error
            );

            return false;
        }
    },

    updateProgress() {
        let completed = 0;

        this.chapterRows.forEach((row) => {
            const dayNumber = Number(row.dataset.day);
            const isCompleted = this.isChapterCompleted(dayNumber);

            row.classList.toggle("completed", isCompleted);

            const state = row.querySelector(".chapter-state");
            const button = row.querySelector(".chapter-button");

            if (isCompleted) {
                completed++;

                if (state) {
                    state.innerHTML = "<span></span> COMPLETED";
                }

                if (button) {
                    button.classList.add("chapter-completed");
                }
            } else {
                if (state) {
                    state.innerHTML = "<span></span> OPEN";
                }

                if (button) {
                    button.classList.remove("chapter-completed");
                }
            }
        });

        const percentage =
            (completed / this.totalChapters) * 100;

        if (this.completedCount) {
            this.completedCount.textContent =
                String(completed).padStart(2, "0");
        }

        if (this.progressText) {
            this.progressText.textContent =
                `${completed} OF ${this.totalChapters} CHAPTERS COMPLETE`;
        }

        if (this.progressFill) {
            this.progressFill.style.width = `${percentage}%`;
        }

        if (this.progressBar) {
            this.progressBar.setAttribute(
                "aria-valuenow",
                String(completed)
            );
        }
    },

    resetProgress() {
        const confirmed = window.confirm(
            "Reset your Halloween adventure progress?\n\n" +
            "This will clear the completion status of all seven chapters."
        );

        if (!confirmed) {
            return;
        }

        try {
            this.completionKeys.forEach((key) => {
                localStorage.removeItem(key);
            });

            this.updateProgress();

            this.showToast(
                "Your adventure progress has been reset."
            );
        } catch (error) {
            console.error("Unable to reset progress:", error);

            this.showToast(
                "Progress could not be reset. Check your browser storage settings."
            );
        }
    },

    showToast(message) {
        if (!this.toast) {
            return;
        }

        this.toast.textContent = message;
        this.toast.classList.add("visible");

        if (this.toastTimer) {
            window.clearTimeout(this.toastTimer);
        }

        this.toastTimer = window.setTimeout(() => {
            this.toast.classList.remove("visible");
            this.toastTimer = null;
        }, 3000);
    }
};

document.addEventListener("DOMContentLoaded", () => {
    VidlyraMap.init();
});
