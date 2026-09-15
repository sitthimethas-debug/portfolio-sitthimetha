/**
 * ==========================================================================
 * NEUMORPHIC UI ENHANCER & INTERACTIVE PLAYGROUND
 * Controls:
 * - Real-time light source direction switcher
 * - Dynamic shadow depth & intensity
 * - Tactile Web Audio synthetic click feedback
 * - 3D Card Gyro / Mouse tilt effect
 * ==========================================================================
 */

class NeumorphicController {
  constructor() {
    this.root = document.documentElement;
    this.lightSourceButtons = document.querySelectorAll('.light-angle-btn');
    this.depthSlider = document.getElementById('shadowDepthSlider');
    this.blurSlider = document.getElementById('shadowBlurSlider');
    this.soundToggle = document.getElementById('soundEffectToggle');
    this.audioCtx = null;
    this.isSoundEnabled = true;

    this.init();
  }

  init() {
    this.bindLightControls();
    this.bindShadowSliders();
    this.bind3DTilt();
    this.bindTactileAudioFeedback();
  }

  // Web Audio synthetic soft tactile click sound
  playSoftClick(frequency = 320, duration = 0.04) {
    if (!this.isSoundEnabled) return;
    try {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, this.audioCtx.currentTime + duration);

      gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (err) {
      // AudioContext might be blocked until user interaction
    }
  }

  bindLightControls() {
    this.lightSourceButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const direction = btn.getAttribute('data-direction');
        
        // Update active class
        this.lightSourceButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Update body data-light attribute
        if (direction === 'top-left') {
          document.body.removeAttribute('data-light');
        } else {
          document.body.setAttribute('data-light', direction);
        }

        this.playSoftClick(440, 0.05);
      });
    });
  }

  bindShadowSliders() {
    if (this.depthSlider) {
      this.depthSlider.addEventListener('input', (e) => {
        const val = e.target.value;
        const blur = (val * 2.2).toFixed(0);
        this.root.style.setProperty('--neu-flat', `${val}px ${val}px ${blur}px var(--shadow-dark), -${val}px -${val}px ${blur}px var(--shadow-light)`);
      });
    }
  }

  bindTactileAudioFeedback() {
    document.addEventListener('click', (e) => {
      const isNeuInteractive = e.target.closest('.neu-btn, .carousel-dot, .neu-switch, .neu-tech-card');
      if (isNeuInteractive) {
        this.playSoftClick(380, 0.03);
      }
    });

    if (this.soundToggle) {
      this.soundToggle.addEventListener('change', (e) => {
        this.isSoundEnabled = e.target.checked;
      });
    }
  }

  bind3DTilt() {
    const tiltElements = document.querySelectorAll('[data-tilt]');
    tiltElements.forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;

        el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
      });

      el.addEventListener('mouseleave', () => {
        el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
      });
    });
  }
}

window.NeumorphicController = NeumorphicController;
