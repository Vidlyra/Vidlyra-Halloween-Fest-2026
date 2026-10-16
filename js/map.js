
import { supabase } from './supabase.js';

const FESTIVAL = 'halloween_2026';
const TOTAL_DAYS = 7;

const VidlyraMap = {
  progress: null,
  userId: null,
  toastTimer: null,

  async init() {
    this.createEmbers();
    this.bindEvents();
    await this.loadProgress();

    window.addEventListener('pageshow', () => {
      this.loadProgress();
    });

    // Recheck when the user returns to this tab.
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) this.loadProgress();
    });

    // Listen for login/logout in the same browser session.
    supabase.auth.onAuthStateChange(() => {
      window.setTimeout(() => this.loadProgress(), 0);
    });
  },

  createEmbers() {
    const container = document.getElementById('embers');
    if (!container) return;

    const fragment = document.createDocumentFragment();
    const count = window.innerWidth < 600 ? 18 : 38;

    for (let i = 0; i < count; i++) {
      const ember = document.createElement('span');
      ember.className = 'ember';
      ember.setAttribute('aria-hidden', 'true');
      ember.style.left = `${Math.random() * 100}%`;
      ember.style.setProperty('--duration', `${8 + Math.random() * 12}s`);
      ember.style.setProperty('--delay', `${-Math.random() * 18}s`);
      ember.style.setProperty('--drift', `${Math.round(Math.random() * 100 - 50)}px`);

      const size = 2 + Math.random() * 2;
      ember.style.width = `${size}px`;
      ember.style.height = `${size}px`;
      fragment.appendChild(ember);
    }

    container.appendChild(fragment);
  },

  bindEvents() {
    document.querySelectorAll('.chapter-button').forEach(button => {
      button.addEventListener('click', event => {
        const chapter = button.closest('.chapter');
        if (!chapter) return;

        if (chapter.classList.contains('is-locked')) {
          event.preventDefault();
          this.showToast('🔒 Complete the previous chapter to unlock this destination.');
        }
      });
    });

    const finaleLink = document.getElementById('finaleLink');
    finaleLink?.addEventListener('click', event => {
      if (!this.isFestivalComplete()) {
        event.preventDefault();
        this.showToast('Complete all seven chapters before entering the finale.');
      }
    });
  },

  async loadProgress() {
    const status = document.getElementById('syncStatus');

    if (status) status.textContent = 'Syncing your adventure...';

    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();

      if (authError) throw authError;

      const user = authData?.user;

      if (!user) {
        this.userId = null;
        this.progress = null;
        this.render();
        if (status) status.textContent = 'Log in to load your saved festival progress.';
        return;
      }

      this.userId = user.id;

      const { data, error } = await supabase
        .from('festival_progress')
        .select('id, day1, day2, day3, day4, day5, day6, day7, avatar_claimed')
        .eq('user_id', user.id)
        .eq('festival', FESTIVAL)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        // Do not silently create a row here. Progress creation should be
        // handled by the registration/onboarding flow or a secure RPC.
        this.progress = {
          day1: false, day2: false, day3: false, day4: false,
          day5: false, day6: false, day7: false,
          avatar_claimed: false
        };

        this.render();
        if (status) status.textContent = 'No progress record found. Your saved chapter progress needs to be initialized.';
        return;
      }

      this.progress = data;
      this.render();

      if (status) status.textContent = '✓ Progress synced with the festival realm.';

    } catch (error) {
      console.error('Unable to load festival progress:', error);
      this.progress = null;
      this.render();

      if (status) {
        status.textContent = 'Could not sync progress. Check your connection and Supabase permissions.';
      }
    }
  },

  isCompleted(day) {
    return this.progress?.[`day${day}`] === true;
  },

  isUnlocked(day) {
    if (day === 1) return true;
    return this.isCompleted(day - 1);
  },

  isFestivalComplete() {
    return Array.from({ length: TOTAL_DAYS }, (_, index) => index + 1)
      .every(day => this.isCompleted(day));
  },

  render() {
    const chapters = document.querySelectorAll('.chapter[data-day]');
    let completedCount = 0;

    chapters.forEach(chapter => {
      const day = Number(chapter.dataset.day);
      const completed = this.isCompleted(day);
      const unlocked = this.isUnlocked(day);

      chapter.classList.toggle('is-completed', completed);
      chapter.classList.toggle('is-locked', !unlocked);
      chapter.classList.toggle('is-current', unlocked && !completed);

      const state = chapter.querySelector('.chapter-state');
      const button = chapter.querySelector('.chapter-button');

      if (state) {
        state.textContent = completed
          ? 'COMPLETED ✓'
          : unlocked
            ? 'UNLOCKED'
            : 'LOCKED 🔒';
      }

      if (button) {
        button.setAttribute('aria-disabled', String(!unlocked));
        button.textContent = completed
          ? 'REPLAY ↗'
          : unlocked
            ? 'ENTER ↗'
            : 'LOCKED 🔒';
      }

      if (completed) completedCount++;
    });

    const percent = Math.round((completedCount / TOTAL_DAYS) * 100);

    const countEl = document.getElementById('completedCount');
    const percentEl = document.getElementById('percentCount');
    const progressText = document.getElementById('progressText');
    const progressFill = document.getElementById('progressFill');
    const progressBar = document.getElementById('progressBar');

    if (countEl) countEl.textContent = String(completedCount).padStart(2, '0');
    if (percentEl) percentEl.textContent = `${percent}%`;
    if (progressText) progressText.textContent = `${completedCount} / ${TOTAL_DAYS}`;
    if (progressFill) progressFill.style.width = `${percent}%`;
    if (progressBar) progressBar.setAttribute('aria-valuenow', String(completedCount));

    const finale = document.getElementById('finaleCard');
    const finaleLink = document.getElementById('finaleLink');
    const rewardStatus = document.getElementById('rewardStatus');
    const complete = this.isFestivalComplete();

    finale?.classList.toggle('is-locked', !complete);

    if (finaleLink) {
      finaleLink.setAttribute('aria-disabled', String(!complete));
      finaleLink.textContent = complete ? 'WATCH FINALE ↗' : 'COMPLETE ALL CHAPTERS 🔒';
    }

    if (rewardStatus) {
      rewardStatus.textContent = complete
        ? (this.progress?.avatar_claimed
            ? 'Festival complete! Your avatar reward is recorded as claimed.'
            : 'Festival complete! Avatar reward eligibility unlocked.')
        : 'Complete all seven chapters to become eligible for your avatar reward.';
    }
  },

  showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add('visible');

    if (this.toastTimer) clearTimeout(this.toastTimer);

    this.toastTimer = setTimeout(() => {
      toast.classList.remove('visible');
      this.toastTimer = null;
    }, 2800);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  VidlyraMap.init();
});
