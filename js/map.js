import { supabase } from './supabase.js';

const FESTIVAL = 'halloween_2026';
const TOTAL_DAYS = 7;

const FESTIVAL_URL =
  'https://vidlyra.github.io/Vidlyra-Halloween-Fest-2026/';

const EVENT_AVATAR_URL =
  'https://vidlyra.github.io/Creator-Portal/assets/event-avatars/Vidlyra_EventAvatar_HalloweenFest2026_LimitedEdition.png';

const POSTER_PATH =
  'assets/poster/Vidlyra%20halloween%20fest%202026.png';

const SHARE_MESSAGE =
  '🎃 I completed VIDLYRA Halloween Fest 2026! Seven chapters. Seven mysteries. I crossed beyond the veil—your turn! #VidlyraHalloweenFest2026';

const VidlyraMap = {
  progress: null,
  userId: null,
  toastTimer: null,
  slideIndex: 0,
  isLoading: false,
  isClaimingAvatar: false,
  isSharing: false,

  async init() {
    this.createEmbers();
    this.bindEvents();
    this.bindCarousel();
    await this.loadProgress();

    window.addEventListener('pageshow', () => {
      this.loadProgress();
    });

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) this.loadProgress();
    });

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

  bindEvents() {
    // Preserve the existing chapter lock/unlock behaviour.
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

    const finaleLink = document.getElementById('finaleLink');

    finaleLink?.addEventListener('click', event => {
      if (!this.isFestivalComplete()) {
        event.preventDefault();
        this.showToast(
          'Complete all seven chapters before entering the finale.'
        );
      }
    });

    document
      .getElementById('claimAvatarBtn')
      ?.addEventListener('click', () => this.claimEventAvatar());

    document
      .getElementById('shareFestivalBtn')
      ?.addEventListener('click', () => this.shareFestival());
  },

  bindCarousel() {
    document
      .getElementById('rewardPrevBtn')
      ?.addEventListener('click', () => {
        this.setSlide(this.slideIndex - 1);
      });

    document
      .getElementById('rewardNextBtn')
      ?.addEventListener('click', () => {
        this.setSlide(this.slideIndex + 1);
      });

    document.querySelectorAll('[data-reward-dot]').forEach(dot => {
      dot.addEventListener('click', () => {
        this.setSlide(Number(dot.dataset.rewardDot));
      });
    });

    const viewport = document.getElementById('rewardViewport');
    if (!viewport) return;

    // Keyboard navigation while the carousel has focus.
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

    // Touch swipe support for mobile.
    let touchStartX = 0;
    let touchStartY = 0;

    viewport.addEventListener(
      'touchstart',
      event => {
        const touch = event.changedTouches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
      },
      { passive: true }
    );

    viewport.addEventListener(
      'touchend',
      event => {
        const touch = event.changedTouches[0];
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;

        // Do not treat vertical page scrolling as a carousel swipe.
        if (Math.abs(deltaX) < 45 || Math.abs(deltaX) < Math.abs(deltaY)) {
          return;
        }

        this.setSlide(
          deltaX < 0 ? this.slideIndex + 1 : this.slideIndex - 1
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

    const slides = [...document.querySelectorAll('[data-reward-slide]')];
    const dots = [...document.querySelectorAll('[data-reward-dot]')];

    if (!track || slides.length === 0) return;

    this.slideIndex = (index + slides.length) % slides.length;

    track.style.transform =
      `translateX(-${this.slideIndex * 100}%)`;

    slides.forEach((slide, slideIndex) => {
      slide.setAttribute(
        'aria-hidden',
        String(slideIndex !== this.slideIndex)
      );
    });

    dots.forEach((dot, dotIndex) => {
      if (dotIndex === this.slideIndex) {
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
      const slideNames = [
        'Scare performance rank',
        'VIDLYRA Halloween wishes',
        'Limited-edition event avatar',
        'Ghost of My Only Love invitation',
        'Sharing Man announcement',
        'Festival poster sharing'
      ];

      status.textContent = slideNames[this.slideIndex] || 'Festival reward';
    }
  },

  async loadProgress() {
    if (this.isLoading) return;
    this.isLoading = true;

    const status = document.getElementById('syncStatus');
    if (status) status.textContent = 'Syncing your adventure...';

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
        // The map does not silently create or reset festival progress.
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

        this.render();

        if (status) {
          status.textContent =
            'No progress record found. Your festival progress needs to be initialized.';
        }

        return;
      }

      this.progress = data;
      this.render();

      if (status) {
        status.textContent = '✓ Progress synced with the festival realm.';
      }
    } catch (error) {
      console.error('Unable to load festival progress:', error);

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
    if (day === 1) return true;
    return this.isCompleted(day - 1);
  },

  isFestivalComplete() {
    return Array.from(
      { length: TOTAL_DAYS },
      (_, index) => index + 1
    ).every(day => this.isCompleted(day));
  },

  formatScore(value) {
    if (value === null || value === undefined) return 'Not recorded';

    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0
    }).format(value);
  },

  getRecordedScore(key, day) {
    // Scores are read only for chapters the signed-in user completed.
    if (!this.isCompleted(day)) return null;

    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null || raw.trim() === '') return null;

      const value = Number(raw);

      if (!Number.isFinite(value) || value < 0) return null;

      return value;
    } catch (error) {
      console.warn(`Unable to read ${key} from browser storage.`, error);
      return null;
    }
  },

  renderPerformanceRank() {
    const day5Score = this.getRecordedScore('day5Score', 5);
    const day6Score = this.getRecordedScore('day6Score', 6);

    const day5El = document.getElementById('day5ScoreMetric');
    const day6El = document.getElementById('day6ScoreMetric');
    const totalEl = document.getElementById('recordedScoreTotal');
    const rankEl = document.getElementById('rankLabel');
    const descriptionEl = document.getElementById('rankDescription');
    const completionEl = document.getElementById('rankCompletion');
    const footnoteEl = document.getElementById('rankFootnote');

    if (day5El) day5El.textContent = this.formatScore(day5Score);
    if (day6El) day6El.textContent = this.formatScore(day6Score);

    if (completionEl) {
      const completedCount = Array.from(
        { length: TOTAL_DAYS },
        (_, index) => index + 1
      ).filter(day => this.isCompleted(day)).length;

      completionEl.textContent = `${completedCount} / ${TOTAL_DAYS}`;
    }

    const hasDay5 = day5Score !== null;
    const hasDay6 = day6Score !== null;

    if (hasDay5 && hasDay6) {
      const totalScore = day5Score + day6Score;

      if (totalEl) totalEl.textContent = this.formatScore(totalScore);

      /*
       * These are display-only rank bands for the recorded Day 5 + Day 6
       * score total. They do not change the game score or claim to be a
       * global leaderboard.
       */
      let rankName;
      let rankDescription;

      if (totalScore >= 25000) {
        rankName = 'S-RANK · VEIL BREAKER';
        rankDescription =
          'Elite performance! Your recorded Day 5 and Day 6 scores place you in the highest display tier.';
      } else if (totalScore >= 16000) {
        rankName = 'A-RANK · PHANTOM HUNTER';
        rankDescription =
          'Powerful performance! Your recorded scores place you in the Phantom Hunter tier.';
      } else if (totalScore >= 8000) {
        rankName = 'B-RANK · GRAVE GUARDIAN';
        rankDescription =
          'A strong run through the haunted realm. Your recorded scores place you in the Grave Guardian tier.';
      } else {
        rankName = 'C-RANK · SHADOW SEEKER';
        rankDescription =
          'You crossed the veil and completed the festival. Your available recorded scores place you in the Shadow Seeker tier.';
      }

      if (rankEl) rankEl.textContent = rankName;
      if (descriptionEl) descriptionEl.textContent = rankDescription;

      if (footnoteEl) {
        footnoteEl.textContent =
          'Score tier uses the saved Day 5 and Day 6 scores available in this browser. Chapter completion is verified through Supabase. This is a personal tier, not a global leaderboard.';
      }
    } else {
      const availableScores = [];

      if (hasDay5) availableScores.push(day5Score);
      if (hasDay6) availableScores.push(day6Score);

      if (totalEl) {
        totalEl.textContent = availableScores.length
          ? `${this.formatScore(availableScores[0])} · PARTIAL`
          : 'Not recorded';
      }

      if (rankEl) rankEl.textContent = 'PHANTOM CHAMPION';
      if (descriptionEl) {
        descriptionEl.textContent =
          'You completed all seven chapters. A complete persistent score history is not available, so your rank is based on festival completion.';
      }

      if (footnoteEl) {
        footnoteEl.textContent =
          'Only Day 5 and Day 6 write scores to browser storage in the supplied game controllers. Other day scores are not available as persistent score records here; no missing score has been invented.';
      }
    }
  },

  renderRewardCarousel() {
    const section = document.getElementById('festivalRewardCarousel');
    const rewardStatus = document.getElementById('rewardStatus');
    const claimButton = document.getElementById('claimAvatarBtn');
    const claimStatus = document.getElementById('claimAvatarStatus');

    const complete = this.isFestivalComplete();

    if (section) section.hidden = !complete;

    if (rewardStatus) {
      if (!this.userId) {
        rewardStatus.textContent =
          'Log in to sync your progress and unlock the festival reward.';
      } else if (!complete) {
        rewardStatus.textContent =
          'Complete all seven chapters to unlock your reward carousel.';
      } else if (this.progress?.avatar_claimed === true) {
        rewardStatus.textContent =
          'Festival complete! Your event avatar reward is recorded as claimed.';
      } else {
        rewardStatus.textContent =
          'Festival complete! Your limited-edition avatar is ready to claim.';
      }
    }

    if (claimButton && claimStatus) {
      if (this.progress?.avatar_claimed === true) {
        claimButton.textContent = 'APPLY CLAIMED AVATAR';
        claimStatus.textContent =
          'Your reward is recorded as claimed. You can apply it to your profile again.';
      } else {
        claimButton.textContent = 'CLAIM EVENT AVATAR';
        claimStatus.textContent =
          complete
            ? 'Festival completed. You are eligible to claim this avatar.'
            : 'Complete all seven chapters to claim this avatar.';
      }

      claimButton.disabled =
        !complete || !this.userId || this.isClaimingAvatar;
    }

    if (complete) this.renderPerformanceRank();
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
            ? day === 7
              ? 'START DAY 7 ↗'
              : 'ENTER ↗'
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

    if (countEl) {
      countEl.textContent = String(completedCount).padStart(2, '0');
    }

    if (percentEl) percentEl.textContent = `${percent}%`;

    if (progressText) {
      progressText.textContent = `${completedCount} / ${TOTAL_DAYS}`;
    }

    if (progressFill) progressFill.style.width = `${percent}%`;

    if (progressBar) {
      progressBar.setAttribute('aria-valuenow', String(completedCount));
    }

    const finale = document.getElementById('finaleCard');
    const finaleLink = document.getElementById('finaleLink');
    const complete = this.isFestivalComplete();

    finale?.classList.toggle('is-locked', !complete);

    if (finaleLink) {
      finaleLink.setAttribute('aria-disabled', String(!complete));
      finaleLink.textContent = complete
        ? 'WATCH FINALE ↗'
        : 'COMPLETE ALL CHAPTERS 🔒';
    }

    this.renderRewardCarousel();
  },

  async claimEventAvatar() {
    if (this.isClaimingAvatar) return;

    if (!this.userId) {
      this.showToast('Please log in before claiming your event avatar.');
      return;
    }

    if (!this.isFestivalComplete()) {
      this.showToast('Complete all seven chapters before claiming the avatar.');
      return;
    }

    const button = document.getElementById('claimAvatarBtn');
    const status = document.getElementById('claimAvatarStatus');

    this.isClaimingAvatar = true;

    if (button) {
      button.disabled = true;
      button.textContent = 'APPLYING AVATAR...';
    }

    if (status) status.textContent = 'Updating your creator profile...';

    try {
      /*
       * Apply the event avatar to the signed-in user's profile.
       * This uses the existing profiles.user_id and profiles.avatar_url fields.
       */
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

      /*
       * Record the reward as claimed only after the profile update succeeds.
       */
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
          'The avatar was applied to your profile, but the claim status could not be saved. Please try again.'
        );
      }

      if (!reward || reward.avatar_claimed !== true) {
        throw new Error(
          'The avatar was applied to your profile, but the claim status could not be verified. Please try again.'
        );
      }

      this.progress.avatar_claimed = true;

      if (status) {
        status.textContent =
          '✓ Limited-edition event avatar applied to your creator profile!';
      }

      this.showToast('🎃 Event avatar applied successfully!');
      this.render();
    } catch (error) {
      console.error('Event avatar claim failed:', error);

      if (status) status.textContent = error.message
        || 'Unable to claim the avatar. Check your connection and Supabase permissions.';

      this.showToast('Avatar update failed. Check the reward status for details.');
    } finally {
      this.isClaimingAvatar = false;

      if (button) {
        button.disabled = !this.isFestivalComplete() || !this.userId;
        button.textContent = this.progress?.avatar_claimed === true
          ? 'APPLY CLAIMED AVATAR'
          : 'CLAIM EVENT AVATAR';
      }
    }
  },

  async shareFestival() {
    if (this.isSharing) return;

    const button = document.getElementById('shareFestivalBtn');
    const status = document.getElementById('shareStatus');
    const posterUrl = new URL(POSTER_PATH, document.baseURI).href;

    this.isSharing = true;

    if (button) {
      button.disabled = true;
      button.textContent = 'PREPARING SHARE...';
    }

    if (status) {
      status.textContent = 'Preparing the festival message and poster...';
    }

    try {
      // Try to attach the real poster to the native share sheet.
      if (navigator.share) {
        try {
          const response = await fetch(posterUrl, { cache: 'no-cache' });

          if (response.ok) {
            const blob = await response.blob();

            const posterFile = new File(
              [blob],
              'Vidlyra_Halloween_Fest_2026.png',
              { type: blob.type || 'image/png' }
            );

            if (
              navigator.canShare &&
              navigator.canShare({ files: [posterFile] })
            ) {
              await navigator.share({
                title: 'VIDLYRA Halloween Fest 2026',
                text: SHARE_MESSAGE,
                url: FESTIVAL_URL,
                files: [posterFile]
              });

              if (status) {
                status.textContent = 'Festival share opened with the poster attached.';
              }

              return;
            }
          }
        } catch (error) {
          // A cancelled share should not trigger a second share attempt.
          if (error?.name === 'AbortError') {
            if (status) status.textContent = 'Sharing cancelled.';
            return;
          }

          console.warn(
            'Poster attachment is not available; trying link sharing.',
            error
          );
        }

        try {
          await navigator.share({
            title: 'VIDLYRA Halloween Fest 2026',
            text: SHARE_MESSAGE,
            url: FESTIVAL_URL
          });

          if (status) {
            status.textContent =
              'Festival link shared. This browser could not attach the poster.';
          }

          return;
        } catch (error) {
          if (error?.name === 'AbortError') {
            if (status) status.textContent = 'Sharing cancelled.';
            return;
          }

          console.warn('Native sharing unavailable.', error);
        }
      }

      // Browser fallback: copy the message, festival link, and poster link.
      const copyText =
        `${SHARE_MESSAGE}\n\n${FESTIVAL_URL}\n\nFestival poster: ${posterUrl}`;

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(copyText);

        if (status) {
          status.textContent =
            'Share message and poster link copied. Paste them into your favourite app.';
        }

        this.showToast('Festival share message copied!');
      } else {
        window.prompt(
          'Copy this festival share message:',
          copyText
        );

        if (status) {
          status.textContent =
            'Copy the message above and share it with your friends.';
        }
      }
    } catch (error) {
      console.error('Festival sharing failed:', error);

      if (status) {
        status.textContent =
          'Sharing was unavailable. Open the festival link and share the poster manually.';
      }
    } finally {
      this.isSharing = false;

      if (button) {
        button.disabled = false;
        button.textContent = 'SHARE FESTIVAL + POSTER';
      }
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
