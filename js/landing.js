/**
 * ==========================================================================
 * LANDING HERO PAGE CONTROLLER
 * Handles Enter button interaction, 3D tilt, Web Audio effects & dynamic date
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  const enterBtn = document.getElementById('enterPortfolioBtn');
  const curtain = document.getElementById('pageTransitionCurtain');
  const posterBoard = document.querySelector('.hero-poster-board');

  // Format today's real-time current date dynamically on badges
  const todayBadges = document.querySelectorAll('.live-today-badge');
  const now = new Date();
  const day = now.getDate();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const formattedTodayDate = `${day} ${monthNames[now.getMonth()]} ${now.getFullYear()}`;
  
  todayBadges.forEach(badge => {
    badge.textContent = formattedTodayDate;
    badge.setAttribute('title', `Active Live Date: ${formattedTodayDate}`);
  });

  // Web Audio Synth for Enter Sound
  let audioCtx = null;
  function playEnterSound() {
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(520, audioCtx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    } catch (err) {
      // Audio not allowed yet
    }
  }

  // Handle Enter Button Click with Transition
  if (enterBtn) {
    enterBtn.addEventListener('click', (e) => {
      e.preventDefault();
      playEnterSound();

      if (curtain) {
        curtain.classList.add('active');
        setTimeout(() => {
          window.location.href = 'portfolio.html';
        }, 400);
      } else {
        window.location.href = 'portfolio.html';
      }
    });
  }

  // Subtle 3D Tilt on Hero Poster Board
  if (posterBoard) {
    posterBoard.addEventListener('mousemove', (e) => {
      const rect = posterBoard.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -3.5;
      const rotateY = ((x - centerX) / centerX) * 3.5;

      posterBoard.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    posterBoard.addEventListener('mouseleave', () => {
      posterBoard.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg)';
    });
  }
});
