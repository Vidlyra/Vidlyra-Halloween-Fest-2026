import { supabase } from './supabase.js';

const FESTIVAL = 'halloween_2026';
const TOTAL_DAYS = 7;

const FESTIVAL_URL =
  'https://vidlyra.github.io/Vidlyra-Halloween-Fest-2026/';

const EVENT_AVATAR_URL =
  'https://vidlyra.github.io/Creator-Portal/assets/event-avatars/Vidlyra_EventAvatar_HalloweenFest2026_LimitedEdition.png';

const POSTER_PATH =
  'assets/posters/Vidlyra%20halloween%20fest%202026.png';

const SHARE_MESSAGE =
  '🎃 I completed VIDLYRA Halloween Fest 2026! Seven chapters. Seven mysteries. I crossed beyond the veil—your turn! #VidlyraHalloweenFest2026';

const VidlyraMap = {
  progress: null,
  userId: null,
  toastTimer: null,
  slideIndex: 0,
  rewardsOpen: false,
  isLoading: false,
  isClaimingAvatar: false,
  isSharing: false,
  previousBodyOverflow: '',
  previousFocus: null,

  async init() {
    this.createEmbers();
    this.bindEvents();
    this.bindCarousel();
    this.bindImageErrors();

    await this.loadProgress();

    window.addEventListener('pageshow', () => {
      this.loadProgress();
    });

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.loadProgress();
      }
    });

    supabase.auth.onAuthStateChange(() => {
      window.setTimeout(() => this.loadProgress(), 0);
    });
  },

  /* ===============================================
     BACKGROUND
  =============================================== */

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

      ember.style.setProperty(
        '--duration',
        `${8 + Math.random() * 12}s`
      );

      ember.style.setProperty(
        '--delay',
        `${-Math.random() * 18}s`
      );

      ember.style.setProperty(
        '--drift',
        `${Math.round(Math.random() * 100 - 50)}px`
      );

      const size = 2 + Math.random() * 2;

      ember.style.width = `${size}px`;
      ember.style.height = `${size}px`;

      fragment.appendChild(ember);
    }

    container.appendChild(fragment);
  },

  bindImageErrors() {
    document.querySelectorAll(
      '#rewardAvatarPreview, #festivalPosterPreview, .story-poster-frame img'
    ).forEach(image => {
      image.addEventListener('error', () => {
        console.error('Reward image could not be loaded:', image.src);
        image.dataset.loadFailed = 'true';
        image.alt = `${image.alt} — image file could not be loaded`;
      });
    });
  },

  /* ===============================================
     EVENTS
  =============================================== */

  bindEvents() {
    // Chapter access control.
    document.querySelectorAll('.chapter .chapter-button').forEach(button => {
      button.addEventListener('click', event => {
        const chapter = button.closest('.chapter');
        if (!chapter) return;

        if (chapter.classList.contains('is-locked')) {
          event.preventDefault();

          this.showToast(
            '🔒 Complete the previous chapter to unlock this destination.'
          );
        }
      });
    });

    // Finale access control.
    document.getElementById('finaleLink')?.addEventListener(
      'click',
      event => {
        if (!this.isFestivalComplete()) {
          event.preventDefault();

          this.showToast(
            'Complete all seven chapters before entering the finale.'
          );
        }
      }
    );

    // Open and close the rewards popup.
    document.getElementById('openRewardsBtn')?.addEventListener(
      'click',
      () => this.openRewards()
    );

    document.getElementById('closeRewardsBtn')?.addEventListener(
      'click',
      () => this.closeRewards()
    );

    const modal = document.getElementById('festivalRewardCarousel');

    modal?.addEventListener('click', event => {
      if (event.target === modal) {
        this.closeRewards();
      }
    });

    document.addEventListener('keydown', event => {
      if (!this.rewardsOpen) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        this.closeRewards();
      }
    });

    // Avatar claim and festival sharing.
    document.getElementById('claimAvatarBtn')?.addEventListener(
      'click',
      () => this.claimEventAvatar()
    );

    document.getElementById('shareFestivalBtn')?.addEventListener(
      'click',
      () => this.shareFestival()
    );
  },

  /* ===============================================
     SIX-SLIDE CAROUSEL
  =============================================== */

  bindCarousel() {
    document.getElementById('rewardPrevBtn')?.addEventListener(
      'click',
      () => this.setSlide(this.slideIndex - 1)
    );

    document.getElementById('rewardNextBtn')?.addEventListener(
      'click',
      () => this.setSlide(this.slideIndex + 1)
    );

    document.querySelectorAll('[data-reward-dot]').forEach(dot => {
      dot.addEventListener('click', () => {
        this.setSlide(Number(dot.dataset.rewardDot));
      });
    });

    const viewport = document.getElementById('rewardViewport');
    if (!viewport) return;

    viewport.addEventListener('keydown', event => {
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        this.setSlide(this.slideIndex + 1);
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        this.setSlide(this.slideIndex - 1);
      }
    });

    // Touch swipe support.
    let startX = 0;
    let startY = 0;

    viewport.addEventListener(
      'touchstart',
      event => {
        const touch = event.changedTouches[0];
        startX = touch.clientX;
        startY = touch.clientY;
      },
      { passive: true }
    );

    viewport.addEventListener(
      'touchend',
      event => {
        const touch = event.changedTouches[0];
        const deltaX = touch.clientX - startX;
        const deltaY = touch.clientY - startY;

        // Ignore normal vertical page scrolling.
        if (Math.abs(deltaX) < 45) return;
        if (Math.abs(deltaX) <= Math.abs(deltaY)) return;

        this.setSlide(
          deltaX < 0
            ? this.slideIndex + 1
            : this.slideIndex - 1
        );
      },
      { passive: true }
    );

    this.setSlide(0);
  },

  setSlide(index) {
    const track = document.getElementById('rewardTrack');
    const counter = document.getElementById('rewardSlideCounter');
    const status = document.getElementById('rewardCarouselStatus');

    const slides = [
      ...document.querySelectorAll('[data-reward-slide]')
    ];

    const dots = [
      ...document.querySelectorAll('[data-reward-dot]')
    ];

    if (!track || slides.length === 0) return;

    this.slideIndex =
      ((index % slides.length) + slides.length) % slides.length;

    track.style.transform =
      `translateX(-${this.slideIndex * 100}%)`;

    const slideNames = [
      'Scare performance rank',
      'VIDLYRA Halloween wishes',
      'Limited-edition event avatar',
      'Ghost of My Only Love announcement',
      'Shariing Man announcement',
      'Share festival poster'
    ];

    slides.forEach((slide, position) => {
      const active = position === this.slideIndex;

      slide.setAttribute('aria-hidden', String(!active));

      // Keep links and buttons in inactive slides out of keyboard navigation.
      slide.inert = !active;
    });

    dots.forEach((dot, position) => {
      if (position === this.slideIndex) {
        dot.setAttribute('aria-current', 'true');
      } else {
        dot.removeAttribute('aria-current');
      }
    });

    if (counter) {
      counter.textContent =
        `${String(this.slideIndex + 1).padStart(2, '0')} / ` +
        `${String(slides.length).padStart(2, '0')}`;
    }

    if (status) {
      status.textContent = slideNames[this.slideIndex];
    }
  },

  /* ===============================================
     OPEN / CLOSE REWARD POPUP
  =============================================== */

  openRewards() {
    if (!this.userId) {
      this.showToast(
        'Please log in to load your festival rewards.'
      );
      return;
    }

    if (!this.isFestivalComplete()) {
      this.showToast(
        '🔒 Complete all seven chapters to unlock the reward popup.'
      );
      return;
    }

    const modal = document.getElementById('festivalRewardCarousel');
    const shell = modal?.querySelector('.reward-shell');
    const closeButton = document.getElementById('closeRewardsBtn');

    if (!modal || !shell) return;

    this.previousFocus = document.activeElement;
    this.previousBodyOverflow = document.body.style.overflow;
    this.rewardsOpen = true;

    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');

    document.body.style.overflow = 'hidden';

    this.setSlide(this.slideIndex);

    window.requestAnimationFrame(() => {
      closeButton?.focus();
    });
  },

  closeRewards() {
    const modal = document.getElementById('festivalRewardCarousel');

    if (!modal || !this.rewardsOpen) return;

    this.rewardsOpen = false;

    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');

    document.body.style.overflow = this.previousBodyOverflow;

    if (this.previousFocus instanceof HTMLElement) {
      this.previousFocus.focus();
    } else {
      document.getElementById('openRewardsBtn')?.focus();
    }
  },

  /* ===============================================
     SUPABASE PROGRESS
  =============================================== */

  async loadProgress() {
    if (this.isLoading) return;

    this.isLoading = true;

    const status = document.getElementById('syncStatus');

    if (status) {
      status.textContent = 'Syncing your adventure...';
    }

    try {
      const {
        data: authData,
        error: authError
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      const user = authData?.user;

      if (!user) {
        this.userId = null;
        this.progress = null;

        if (this.rewardsOpen) {
          this.closeRewards();
        }

        this.render();

        if (status) {
          status.textContent =
            'Log in to load your saved festival progress.';
        }

        return;
      }

      this.userId = user.id;

      const { data, error } = await supabase
        .from('festival_progress')
        .select(
          'id, day1, day2, day3, day4, day5, day6, day7, avatar_claimed'
        )
        .eq('user_id', user.id)
        .eq('festival', FESTIVAL)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        // Do not create or reset a progress row from the map.
        this.progress = {
          day1: false,
          day2: false,
          day3: false,
          day4: false,
          day5: false,
          day6: false,
          day7: false,
          avatar_claimed: false
        };

        if (this.rewardsOpen) {
          this.closeRewards();
        }

        this.render();

        if (status) {
          status.textContent =
            'No festival progress record was found for this account.';
        }

        return;
      }

      this.progress = data;

      if (this.rewardsOpen && !this.isFestivalComplete()) {
        this.closeRewards();
      }

      this.render();

      if (status) {
        status.textContent =
          '✓ Progress synced with the festival realm.';
      }
    } catch (error) {
      console.error('Unable to load festival progress:', error);

      if (this.rewardsOpen) {
        this.closeRewards();
      }

      this.progress = null;
      this.render();

      if (status) {
        status.textContent =
          'Could not sync progress. Check your connection and Supabase permissions.';
      }
    } finally {
      this.isLoading = false;
    }
  },

  isCompleted(day) {
    return this.progress?.[`day${day}`] === true;
  },

  isUnlocked(day) {
    return day === 1 || this.isCompleted(day - 1);
  },

  isFestivalComplete() {
    for (let day = 1; day <= TOTAL_DAYS; day++) {
      if (!this.isCompleted(day)) return false;
    }

    return true;
  },

  /* ===============================================
     SCORE / PERFORMANCE RANK
  =============================================== */

  getRecordedScore(scoreKey, completionKey, day) {
    // A browser score alone is insufficient unless Supabase
    // also confirms that this chapter is complete.
    if (!this.isCompleted(day)) return null;

    try {
      // These exact keys are saved by the supplied game controllers.
      if (localStorage.getItem(completionKey) !== 'true') {
        return null;
      }

      const raw = localStorage.getItem(scoreKey);

      if (raw === null || raw.trim() === '') return null;

      const value = Number(raw);

      if (!Number.isFinite(value) || value < 0) return null;

      return value;
    } catch (error) {
      console.warn(`Unable to read score ${scoreKey}:`, error);
      return null;
    }
  },

  formatScore(value) {
    if (value === null || value === undefined) {
      return 'Not recorded';
    }

    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0
    }).format(value);
  },

  renderPerformanceRank() {
    const completedCount = Array.from(
      { length: TOTAL_DAYS },
      (_, index) => index + 1
    ).filter(day => this.isCompleted(day)).length;

    const day5Score = this.getRecordedScore(
      'day5Score',
      'day5Complete',
      5
    );

    const day6Score = this.getRecordedScore(
      'day6Score',
      'day6Complete',
      6
    );

    const day5El = document.getElementById('day5ScoreMetric');
    const day6El = document.getElementById('day6ScoreMetric');
    const totalEl = document.getElementById('recordedScoreTotal');
    const rankEl = document.getElementById('rankLabel');
    const descriptionEl = document.getElementById('rankDescription');
    const completionEl = document.getElementById('rankCompletion');
    const footnoteEl = document.getElementById('rankFootnote');

    if (completionEl) {
      completionEl.textContent =
        `${completedCount} / ${TOTAL_DAYS}`;
    }

    if (day5El) {
      day5El.textContent = this.formatScore(day5Score);
    }

    if (day6El) {
      day6El.textContent = this.formatScore(day6Score);
    }

    // All-seven-day completion is the rank basis.
    // We do not invent numerical rank thresholds.
    if (rankEl) {
      rankEl.textContent = 'VEIL CONQUEROR';
    }

    if (descriptionEl) {
      descriptionEl.textContent =
        'You completed all seven festival chapters. Your verified completion rank is VEIL CONQUEROR.';
    }

    if (day5Score !== null && day6Score !== null) {
      if (totalEl) {
        totalEl.textContent = this.formatScore(day5Score + day6Score);
      }
    } else if (day5Score !== null || day6Score !== null) {
      const availableScore = day5Score ?? day6Score;

      if (totalEl) {
        totalEl.textContent =
          `${this.formatScore(availableScore)} · PARTIAL`;
      }
    } else if (totalEl) {
      totalEl.textContent = 'Not recorded';
    }

    if (footnoteEl) {
      footnoteEl.textContent =
        'Rank is based on verified 7/7 chapter completion. Day 5 and Day 6 scores are shown only when their existing browser records are available. Other supplied game controllers do not provide comparable persistent score records here. These scores are not a global leaderboard.';
    }
  },

  /* ===============================================
     RENDER MAP + REWARD STATUS
  =============================================== */

  renderRewardCarousel() {
    const section = document.getElementById('festivalRewardCarousel');
    const rewardStatus = document.getElementById('rewardStatus');
    const claimButton = document.getElementById('claimAvatarBtn');
    const claimStatus = document.getElementById('claimAvatarStatus');
    const mapRewardHint = document.getElementById('mapRewardHint');

    const complete = this.isFestivalComplete();

    // Keep the modal closed until the map reward button is clicked.
    // If it is already open, leave it open while progress stays complete.
    if (section && !this.rewardsOpen) {
      section.hidden = true;
      section.setAttribute('aria-hidden', 'true');
    }

    if (mapRewardHint) {
      if (!this.userId) {
        mapRewardHint.textContent =
          'Log in to sync your festival progress.';
      } else if (!complete) {
        mapRewardHint.textContent =
          'Complete all seven chapters to unlock your rewards.';
      } else {
        mapRewardHint.textContent =
          'All seven chapters completed. Your rewards are ready!';
      }
    }

    if (rewardStatus) {
      if (!this.userId) {
        rewardStatus.textContent =
          'Log in to sync your progress and unlock festival rewards.';
      } else if (!complete) {
        rewardStatus.textContent =
          'Complete all seven chapters to become eligible for your festival reward.';
      } else if (this.progress?.avatar_claimed === true) {
        rewardStatus.textContent =
          'Festival complete! Your event avatar reward is recorded as claimed.';
      } else {
        rewardStatus.textContent =
          'Festival complete! Your limited-edition event avatar is ready to claim.';
      }
    }

    if (claimButton && claimStatus) {
      if (this.progress?.avatar_claimed === true) {
        claimButton.textContent = 'APPLY CLAIMED AVATAR';
        claimStatus.textContent =
          'Your reward is recorded as claimed. You can apply it to your profile again.';
      } else {
        claimButton.textContent = 'CLAIM EVENT AVATAR';
        claimStatus.textContent = complete
          ? 'Festival completed. You are eligible to claim this avatar.'
          : 'Complete all seven chapters to claim this avatar.';
      }

      claimButton.disabled =
        !complete || !this.userId || this.isClaimingAvatar;
    }

    if (complete) {
      this.renderPerformanceRank();
    }
  },

  render() {
    const chapters = document.querySelectorAll(
      '.chapter[data-day]'
    );

    let completedCount = 0;

    chapters.forEach(chapter => {
      const day = Number(chapter.dataset.day);
      const completed = this.isCompleted(day);
      const unlocked = this.isUnlocked(day);

      chapter.classList.toggle('is-completed', completed);
      chapter.classList.toggle('is-locked', !unlocked);
      chapter.classList.toggle(
        'is-current',
        unlocked && !completed
      );

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
        button.setAttribute(
          'aria-disabled',
          String(!unlocked)
        );

        button.textContent = completed
          ? 'REPLAY ↗'
          : unlocked
            ? day === 7
              ? 'START DAY 7 ↗'
              : 'ENTER ↗'
            : 'LOCKED 🔒';
      }

      if (completed) completedCount++;
    });

    const percent = Math.round(
      (completedCount / TOTAL_DAYS) * 100
    );

    const countEl = document.getElementById('completedCount');
    const percentEl = document.getElementById('percentCount');
    const progressText = document.getElementById('progressText');
    const progressFill = document.getElementById('progressFill');
    const progressBar = document.getElementById('progressBar');

    if (countEl) {
      countEl.textContent =
        String(completedCount).padStart(2, '0');
    }

    if (percentEl) {
      percentEl.textContent = `${percent}%`;
    }

    if (progressText) {
      progressText.textContent =
        `${completedCount} / ${TOTAL_DAYS}`;
    }

    if (progressFill) {
      progressFill.style.width = `${percent}%`;
    }

    if (progressBar) {
      progressBar.setAttribute(
        'aria-valuenow',
        String(completedCount)
      );
    }

    const finale = document.getElementById('finaleCard');
    const finaleLink = document.getElementById('finaleLink');
    const complete = this.isFestivalComplete();

    finale?.classList.toggle('is-locked', !complete);

    if (finaleLink) {
      finaleLink.setAttribute(
        'aria-disabled',
        String(!complete)
      );

      finaleLink.textContent = complete
        ? 'WATCH FINALE ↗'
        : 'COMPLETE ALL CHAPTERS 🔒';
    }

    this.renderRewardCarousel();
  },

  /* ===============================================
     CLAIM EVENT AVATAR
  =============================================== */

  async claimEventAvatar() {
    if (this.isClaimingAvatar) return;

    if (!this.userId) {
      this.showToast(
        'Please log in before claiming your event avatar.'
      );
      return;
    }

    if (!this.isFestivalComplete()) {
      this.showToast(
        'Complete all seven chapters before claiming the avatar.'
      );
      return;
    }

    const button = document.getElementById('claimAvatarBtn');
    const status = document.getElementById('claimAvatarStatus');

    this.isClaimingAvatar = true;

    if (button) {
      button.disabled = true;
      button.textContent = 'APPLYING AVATAR...';
    }

    if (status) {
      status.textContent =
        'Updating your creator profile...';
    }

    try {
      // Apply the event avatar to the signed-in user's profile.
      const {
        data: profile,
        error: profileError
      } = await supabase
        .from('profiles')
        .update({
          avatar_url: EVENT_AVATAR_URL
        })
        .eq('user_id', this.userId)
        .select('user_id, avatar_url')
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profile) {
        throw new Error(
          'No profile row was updated. Check the profiles table and its RLS policies.'
        );
      }

      // Mark the reward claimed only after the profile update succeeds.
      const {
        data: reward,
        error: rewardError
      } = await supabase
        .from('festival_progress')
        .update({
          avatar_claimed: true
        })
        .eq('user_id', this.userId)
        .eq('festival', FESTIVAL)
        .select('avatar_claimed')
        .maybeSingle();

      if (rewardError) {
        throw new Error(
          'The avatar was applied, but the reward claim status could not be saved. Please try again.'
        );
      }

      if (!reward || reward.avatar_claimed !== true) {
        throw new Error(
          'The avatar was applied, but the reward claim status could not be verified.'
        );
      }

      this.progress.avatar_claimed = true;

      if (status) {
        status.textContent =
          '✓ Limited-edition event avatar applied to your creator profile!';
      }

      this.showToast(
        '🎃 Event avatar applied successfully!'
      );

      this.render();
    } catch (error) {
      console.error('Event avatar claim failed:', error);

      if (status) {
        status.textContent =
          error.message ||
          'Unable to claim the avatar. Check your connection and Supabase permissions.';
      }

      this.showToast(
        'Avatar update failed. Check the reward status for details.'
      );
    } finally {
      this.isClaimingAvatar = false;

      if (button) {
        button.disabled =
          !this.isFestivalComplete() || !this.userId;

        button.textContent =
          this.progress?.avatar_claimed === true
            ? 'APPLY CLAIMED AVATAR'
            : 'CLAIM EVENT AVATAR';
      }
    }
  },

  /* ===============================================
     SHARE FESTIVAL + POSTER
  =============================================== */

  async shareFestival() {
    if (this.isSharing) return;

    const button = document.getElementById('shareFestivalBtn');
    const status = document.getElementById('shareStatus');

    const posterUrl = new URL(
      POSTER_PATH,
      document.baseURI
    ).href;

    this.isSharing = true;

    if (button) {
      button.disabled = true;
      button.textContent = 'PREPARING SHARE...';
    }

    if (status) {
      status.textContent =
        'Preparing the festival message and poster...';
    }

    try {
      // Prefer attaching the real poster to the native share sheet.
      if (navigator.share) {
        let posterFile = null;

        try {
          const response = await fetch(
            posterUrl,
            { cache: 'no-cache' }
          );

          if (response.ok) {
            const blob = await response.blob();

            posterFile = new File(
              [blob],
              'Vidlyra_Halloween_Fest_2026.png',
              { type: blob.type || 'image/png' }
            );
          }
        } catch (error) {
          console.warn(
            'Could not fetch poster for attachment:',
            error
          );
        }

        if (
          posterFile &&
          navigator.canShare &&
          navigator.canShare({ files: [posterFile] })
        ) {
          try {
            await navigator.share({
              title: 'VIDLYRA Halloween Fest 2026',
              text: SHARE_MESSAGE,
              url: FESTIVAL_URL,
              files: [posterFile]
            });

            if (status) {
              status.textContent =
                'Festival share opened with the poster attached.';
            }

            return;
          } catch (error) {
            if (error?.name === 'AbortError') {
              if (status) status.textContent = 'Sharing cancelled.';
              return;
            }

            console.warn(
              'Poster attachment failed; trying link share:',
              error
            );
          }
        }

        try {
          await navigator.share({
            title: 'VIDLYRA Halloween Fest 2026',
            text: SHARE_MESSAGE,
            url: FESTIVAL_URL
          });

          if (status) {
            status.textContent =
              'Festival shared. This browser did not attach the poster.';
          }

          return;
        } catch (error) {
          if (error?.name === 'AbortError') {
            if (status) status.textContent = 'Sharing cancelled.';
            return;
          }

          console.warn('Link sharing failed:', error);
        }
      }

      // Desktop/browser fallback.
      const textToCopy =
        `${SHARE_MESSAGE}\n\n` +
        `${FESTIVAL_URL}\n\n` +
        `Festival poster: ${posterUrl}`;

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(textToCopy);

        if (status) {
          status.textContent =
            'Share message and poster link copied. Paste them into your favourite app.';
        }

        this.showToast(
          'Festival share message copied!'
        );
      } else {
        window.prompt(
          'Copy your festival share message:',
          textToCopy
        );

        if (status) {
          status.textContent =
            'Copy the message and share it with your friends.';
        }
      }
    } catch (error) {
      console.error('Festival sharing failed:', error);

      if (status) {
        status.textContent =
          'Sharing was unavailable. You can share the festival link and poster manually.';
      }
    } finally {
      this.isSharing = false;

      if (button) {
        button.disabled = false;
        button.textContent = 'SHARE FESTIVAL + POSTER';
      }
    }
  },

  /* ===============================================
     TOAST
  =============================================== */

  showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add('visible');

    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }

    this.toastTimer = setTimeout(() => {
      toast.classList.remove('visible');
      this.toastTimer = null;
    }, 2800);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  VidlyraMap.init();
});
