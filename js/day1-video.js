// VIDLYRA HALLOWEEN FEST 2026 — DAY 1 VIDEO CONTROLLER

const CONFIG = {
    nextPage: 'day2-video.html', // where to go after Day 1 finishes
    endOverlayLeadSeconds: 3,     // show "DAY 1 COMPLETE" this many seconds before the video ends
    redirectDelayMs: 2600,        // how long the end overlay stays up before redirecting
    skipAfterSeconds: 4           // reveal the skip button after this many seconds of playback
};

const els = {
    loading: document.getElementById('loading'),
    loadingText: document.getElementById('loadingText'),
    video: document.getElementById('day1Video'),
    endOverlay: document.getElementById('endOverlay'),
    videoError: document.getElementById('videoError'),
    tapToPlay: document.getElementById('tapToPlay'),
    skipBtn: document.getElementById('skipBtn')
};

let hasNavigated = false;
let endOverlayShown = false;

function goToNextPage() {
    if (hasNavigated) return;
    hasNavigated = true;
    window.location.href = CONFIG.nextPage;
}

function setLoadingText(text) {
    if (els.loadingText) els.loadingText.textContent = text;
}

function hideLoading() {
    els.loading?.classList.add('is-hidden');
}

function showError() {
    hideLoading();
    els.videoError?.classList.add('is-visible');
    els.video?.classList.remove('is-playing');
}

function showEndOverlay() {
    if (endOverlayShown) return;
    endOverlayShown = true;
    els.skipBtn?.classList.remove('is-visible');
    els.endOverlay?.classList.add('is-visible');
    window.setTimeout(goToNextPage, CONFIG.redirectDelayMs);
}

function attemptPlay() {
    const video = els.video;
    if (!video) return;

    const playPromise = video.play();
    if (playPromise !== undefined) {
        playPromise
            .then(() => {
                els.tapToPlay?.classList.remove('is-visible');
            })
            .catch(() => {
                // Autoplay was blocked (common with unmuted video) — ask for a tap.
                setLoadingText('TAP TO BEGIN');
                hideLoading();
                els.tapToPlay?.classList.add('is-visible');
            });
    }
}

function initTapToPlay() {
    if (!els.tapToPlay) return;
    els.tapToPlay.addEventListener('click', () => {
        els.tapToPlay.classList.remove('is-visible');
        els.video?.play().catch(() => {
            // Still blocked — nothing more we can do without user gesture, but this IS one.
            showError();
        });
    });
}

function initSkip() {
    if (!els.skipBtn) return;
    els.skipBtn.addEventListener('click', goToNextPage);
}

function initVideo() {
    const video = els.video;
    if (!video) {
        showError();
        return;
    }

    // First frame is ready — safe to reveal the video element under the loading screen.
    video.addEventListener('loadeddata', () => {
        video.classList.add('is-playing');
    });

    // Enough is buffered to play through without immediate stalling.
    video.addEventListener('canplaythrough', () => {
        hideLoading();
    }, { once: true });

    video.addEventListener('playing', () => {
        hideLoading();
    });

    video.addEventListener('timeupdate', () => {
        if (!video.duration || Number.isNaN(video.duration)) return;

        if (
            !endOverlayShown &&
            video.duration - video.currentTime <= CONFIG.endOverlayLeadSeconds
        ) {
            showEndOverlay();
        }

        if (
            els.skipBtn &&
            !endOverlayShown &&
            video.currentTime >= CONFIG.skipAfterSeconds
        ) {
            els.skipBtn.classList.add('is-visible');
        }
    });

    video.addEventListener('ended', showEndOverlay);

    video.addEventListener('error', showError);

    // If nothing loads within a reasonable window, treat it as a missing/broken file.
    const loadTimeout = window.setTimeout(() => {
        if (video.readyState < 2) {
            showError();
        }
    }, 12000);
    video.addEventListener('loadeddata', () => window.clearTimeout(loadTimeout), { once: true });

    attemptPlay();
}

document.addEventListener('DOMContentLoaded', () => {
    setLoadingText('ENTERING DAY 1...');
    initTapToPlay();
    initSkip();
    initVideo();
});

// Safety net: if the tab is backgrounded right as the video ends, still redirect.
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && els.video?.ended && !hasNavigated) {
        goToNextPage();
    }
});
