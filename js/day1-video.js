
import { supabase } from './supabase.js';

// VIDLYRA HALLOWEEN FEST 2026 — DAY 1 VIDEO CONTROLLER

const CONFIG = {
    nextPage: 'day2-video.html',
    festival: 'halloween_2026',
    endOverlayLeadSeconds: 3,
    redirectDelayMs: 2600,
    skipAfterSeconds: 4
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
let savingCompletion = false;
let completionSaved = false;

function setLoadingText(text) {
    if (els.loadingText) els.loadingText.textContent = text;
}

function hideLoading() {
    els.loading?.classList.add('is-hidden');
}

function showError(message = 'Unable to load the video. Please try again.') {
    hideLoading();

    if (els.videoError) {
        els.videoError.classList.add('is-visible');

        const messageElement = els.videoError.querySelector(
            '[data-error-message]'
        );

        if (messageElement) {
            messageElement.textContent = message;
        }
    }

    els.video?.classList.remove('is-playing');
}

async function saveDay1Completion() {
    if (completionSaved) return true;
    if (savingCompletion) return false;

    savingCompletion = true;
    setLoadingText('SAVING YOUR PROGRESS...');

    try {
        const {
            data: { user },
            error: authError
        } = await supabase.auth.getUser();

        if (authError) throw authError;

        if (!user) {
            window.location.href = 'login.html';
            return false;
        }

        // Find this user's progress record for this festival.
        const { data: existing, error: selectError } = await supabase
            .from('festival_progress')
            .select('id, day1')
            .eq('user_id', user.id)
            .eq('festival', CONFIG.festival)
            .maybeSingle();

        if (selectError) throw selectError;

        if (existing) {
            // Never reset an already-completed day.
            if (existing.day1 !== true) {
                const { error: updateError } = await supabase
                    .from('festival_progress')
                    .update({
                        day1: true,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', existing.id)
                    .eq('user_id', user.id)
                    .eq('festival', CONFIG.festival);

                if (updateError) throw updateError;
            }
        } else {
            // Create a progress record if the user does not have one.
            const { error: insertError } = await supabase
                .from('festival_progress')
                .insert({
                    user_id: user.id,
                    festival: CONFIG.festival,
                    day1: true
                });

            if (insertError) throw insertError;
        }

        // Verify that the database now reports Day 1 as completed.
        const { data: verified, error: verifyError } = await supabase
            .from('festival_progress')
            .select('day1')
            .eq('user_id', user.id)
            .eq('festival', CONFIG.festival)
            .maybeSingle();

        if (verifyError) throw verifyError;

        if (!verified || verified.day1 !== true) {
            throw new Error(
                'Day 1 progress could not be verified in the database.'
            );
        }

        completionSaved = true;
        return true;

    } catch (error) {
        console.error('Day 1 completion save failed:', error);

        showError(
            'Your progress could not be saved. Check your connection and try again.'
        );

        return false;

    } finally {
        savingCompletion = false;
    }
}

async function completeDay1() {
    if (hasNavigated || savingCompletion || completionSaved) return;

    endOverlayShown = true;

    els.skipBtn?.classList.remove('is-visible');
    els.endOverlay?.classList.add('is-visible');

    const saved = await saveDay1Completion();

    if (!saved || hasNavigated) return;

    setLoadingText('DAY 1 COMPLETED!');

    window.setTimeout(() => {
        if (hasNavigated) return;

        hasNavigated = true;
        window.location.href = CONFIG.nextPage;
    }, CONFIG.redirectDelayMs);
}

function attemptPlay() {
    const video = els.video;
    if (!video) return;

    video.play()
        .then(() => {
            els.tapToPlay?.classList.remove('is-visible');
        })
        .catch(() => {
            setLoadingText('TAP TO BEGIN');
            hideLoading();
            els.tapToPlay?.classList.add('is-visible');
        });
}

function initTapToPlay() {
    els.tapToPlay?.addEventListener('click', async () => {
        els.tapToPlay.classList.remove('is-visible');

        try {
            await els.video?.play();
        } catch (error) {
            console.error('Video playback failed:', error);
            showError('Video playback failed. Please reload and try again.');
        }
    });
}

function initSkip() {
    els.skipBtn?.addEventListener('click', () => {
        const video = els.video;

        // Only allow skipping after the configured playback time.
        if (!video || video.currentTime < CONFIG.skipAfterSeconds) return;

        // Skipping is treated as completing the video.
        completeDay1();
    });
}

function initVideo() {
    const video = els.video;

    if (!video) {
        showError('The Day 1 video element was not found in the HTML.');
        return;
    }

    video.addEventListener('loadeddata', () => {
        video.classList.add('is-playing');
    });

    video.addEventListener('canplaythrough', hideLoading, {
        once: true
    });

    video.addEventListener('playing', hideLoading);

    video.addEventListener('timeupdate', () => {
        if (!video.duration || !Number.isFinite(video.duration)) return;

        if (
            !endOverlayShown &&
            video.duration - video.currentTime <=
                CONFIG.endOverlayLeadSeconds
        ) {
            // Show the ending overlay only.
            // Actual completion is saved when playback ends.
            endOverlayShown = true;
            els.skipBtn?.classList.remove('is-visible');
            els.endOverlay?.classList.add('is-visible');
        }

        if (
            els.skipBtn &&
            !completionSaved &&
            !savingCompletion &&
            video.currentTime >= CONFIG.skipAfterSeconds &&
            !video.ended
        ) {
            els.skipBtn.classList.add('is-visible');
        }
    });

    video.addEventListener('ended', () => {
        completeDay1();
    });

    video.addEventListener('error', () => {
        showError('The video file could not be loaded. Please check its path.');
    });

    const loadTimeout = window.setTimeout(() => {
        if (video.readyState < 2) {
            showError('The video took too long to load. Please try again.');
        }
    }, 12000);

    video.addEventListener('loadeddata', () => {
        window.clearTimeout(loadTimeout);
    }, { once: true });

    attemptPlay();
}

document.addEventListener('DOMContentLoaded', () => {
    setLoadingText('ENTERING DAY 1...');
    initTapToPlay();
    initSkip();
    initVideo();
});
