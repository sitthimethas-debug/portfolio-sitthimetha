/**
 * ==========================================================================
 * MARQUEE & CAROUSEL INTERACTIVE ENGINE
 * Features:
 * - Ultra-smooth 60fps RequestAnimationFrame motion
 * - Multi-directional auto-scroll (Left / Right)
 * - Swipeable & Draggable (Touch & Mouse Drag with inertia)
 * - Hold / Press to Pause ("จิ้มค้างคือหยุด")
 * - Speed control & Dynamic Toggle
 * ==========================================================================
 */

class InteractiveMarquee {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    if (!this.container) return;

    this.track = this.container.querySelector('.marquee-track') || this.container.firstElementChild;
    if (!this.track) return;

    // Configuration
    this.options = {
      speed: options.speed || 1.2, // Pixels per frame
      direction: options.direction || 'left', // 'left' or 'right'
      pauseOnHover: options.pauseOnHover !== undefined ? options.pauseOnHover : false,
      pauseOnHold: options.pauseOnHold !== undefined ? options.pauseOnHold : true,
      draggable: options.draggable !== undefined ? options.draggable : true,
      onHoldStateChange: options.onHoldStateChange || null,
      ...options
    };

    // State
    this.currentOffset = 0;
    this.isPaused = false;
    this.isHolding = false;
    this.isDragging = false;
    this.startX = 0;
    this.dragOffset = 0;
    this.lastX = 0;
    this.velocity = 0;
    this.rafId = null;

    this.init();
  }

  init() {
    // Clone children to ensure seamless infinite looping
    this.setupInfiniteContent();

    // Bind event listeners
    this.bindEvents();

    // Start render loop
    this.start();
  }

  setupInfiniteContent() {
    // Save original items
    const originalItems = Array.from(this.track.children);
    if (originalItems.length === 0) return;

    // Calculate width needed to fill screen + overflow buffer
    const containerWidth = this.container.offsetWidth || window.innerWidth;
    let trackWidth = this.track.scrollWidth;

    // Duplicate until track is at least 3x the container width
    while (trackWidth < containerWidth * 3) {
      originalItems.forEach(item => {
        const clone = item.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        this.track.appendChild(clone);
      });
      trackWidth = this.track.scrollWidth;
    }

    // Half of total scroll width is our loop reset point
    this.singleSetWidth = this.track.scrollWidth / (this.track.children.length / originalItems.length);
  }

  bindEvents() {
    // Touch & Pointer interaction
    if (this.options.draggable || this.options.pauseOnHold) {
      this.container.addEventListener('pointerdown', this.handlePointerDown.bind(this));
      window.addEventListener('pointermove', this.handlePointerMove.bind(this));
      window.addEventListener('pointerup', this.handlePointerUp.bind(this));
      window.addEventListener('pointercancel', this.handlePointerUp.bind(this));
    }

    // Hover interaction (if enabled)
    if (this.options.pauseOnHover) {
      this.container.addEventListener('mouseenter', () => {
        if (!this.isHolding) this.isPaused = true;
      });
      this.container.addEventListener('mouseleave', () => {
        if (!this.isHolding && !this.isDragging) this.isPaused = false;
      });
    }

    // Resize recalculation
    window.addEventListener('resize', () => {
      this.recalculateBounds();
    });
  }

  handlePointerDown(e) {
    this.isHolding = true;
    this.isDragging = false;
    this.startX = e.clientX;
    this.lastX = e.clientX;
    this.dragOffset = 0;
    this.velocity = 0;

    // Visual feedback
    this.container.classList.add('holding');
    if (this.options.onHoldStateChange) {
      this.options.onHoldStateChange(true);
    }
  }

  handlePointerMove(e) {
    if (!this.isHolding) return;

    const deltaX = e.clientX - this.lastX;
    const totalDelta = Math.abs(e.clientX - this.startX);

    // If moved more than 5px, treat as drag
    if (totalDelta > 5) {
      this.isDragging = true;
      this.container.classList.add('dragging');
    }

    if (this.isDragging) {
      this.currentOffset += deltaX;
      this.velocity = deltaX; // store velocity for momentum
      this.lastX = e.clientX;
      this.applyTransform();
    }
  }

  handlePointerUp() {
    if (!this.isHolding) return;

    this.isHolding = false;
    this.container.classList.remove('holding');
    this.container.classList.remove('dragging');

    if (this.options.onHoldStateChange) {
      this.options.onHoldStateChange(false);
    }

    // Apply smooth inertia release if was dragging
    if (this.isDragging) {
      this.isDragging = false;
    }
  }

  recalculateBounds() {
    if (!this.track || !this.track.children.length) return;
    const totalWidth = this.track.scrollWidth;
    this.singleSetWidth = totalWidth / 2;
  }

  applyTransform() {
    if (!this.track) return;

    const loopThreshold = this.track.scrollWidth / 2;

    // Wrap around for infinite effect
    if (this.currentOffset <= -loopThreshold) {
      this.currentOffset += loopThreshold;
    } else if (this.currentOffset >= 0) {
      this.currentOffset -= loopThreshold;
    }

    this.track.style.transform = `translate3d(${this.currentOffset}px, 0, 0)`;
  }

  update() {
    // If not paused, not holding, and not dragging -> Auto scroll
    if (!this.isPaused && !this.isHolding && !this.isDragging) {
      // Apply momentum decay if any velocity remaining
      if (Math.abs(this.velocity) > 0.1) {
        this.currentOffset += this.velocity;
        this.velocity *= 0.92; // friction
      } else {
        this.velocity = 0;
        const dirMultiplier = this.options.direction === 'right' ? 1 : -1;
        this.currentOffset += this.options.speed * dirMultiplier;
      }
      this.applyTransform();
    }

    this.rafId = requestAnimationFrame(this.update.bind(this));
  }

  start() {
    if (!this.rafId) {
      this.rafId = requestAnimationFrame(this.update.bind(this));
    }
  }

  stop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  setSpeed(newSpeed) {
    this.options.speed = parseFloat(newSpeed);
  }

  setDirection(direction) {
    this.options.direction = direction;
  }

  togglePlay(play) {
    if (play !== undefined) {
      this.isPaused = !play;
    } else {
      this.isPaused = !this.isPaused;
    }
    return !this.isPaused;
  }
}

/**
 * ==========================================================================
 * PROJECT CAROUSEL CONTROLLER
 * Enhanced card carousel with swipe physics, prev/next buttons & hold-to-pause
 * ==========================================================================
 */
class ProjectCarousel {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    if (!this.container) return;

    this.viewport = this.container.querySelector('.carousel-viewport');
    this.track = this.container.querySelector('.carousel-track');
    this.prevBtn = this.container.querySelector('.carousel-prev-btn');
    this.nextBtn = this.container.querySelector('.carousel-next-btn');
    this.dotsContainer = this.container.querySelector('.carousel-dots');
    this.thumbnailsContainer = this.container.querySelector('.project-thumbnail-slider') || document.getElementById('projectThumbnails');

    this.options = {
      autoPlay: options.autoPlay !== undefined ? options.autoPlay : true,
      autoPlaySpeed: options.autoPlaySpeed || 1.0,
      pauseOnHold: true,
      ...options
    };

    this.items = Array.from(this.track.children);
    this.currentIndex = 0;
    this.currentOffset = 0;
    this.isHolding = false;
    this.isDragging = false;
    this.isAutoPlaying = this.options.autoPlay;
    this.startX = 0;
    this.lastX = 0;
    this.velocity = 0;
    this.rafId = null;

    this.init();
  }

  init() {
    this.setupClones();
    this.createDots();
    this.bindThumbnails();
    this.bindEvents();
    this.startAutoPlay();
  }

  setupClones() {
    // Clone items to make continuous carousel
    const originalItems = [...this.items];
    originalItems.forEach(item => {
      const clone = item.cloneNode(true);
      this.track.appendChild(clone);
    });
    this.totalWidth = this.track.scrollWidth / 2;
  }

  createDots() {
    if (!this.dotsContainer) return;
    this.dotsContainer.innerHTML = '';
    this.items.forEach((_, idx) => {
      const dot = document.createElement('button');
      dot.classList.add('carousel-dot');
      dot.setAttribute('aria-label', `Go to slide ${idx + 1}`);
      if (idx === 0) dot.classList.add('active');
      dot.addEventListener('click', () => this.goToIndex(idx));
      this.dotsContainer.appendChild(dot);
    });
  }

  bindThumbnails() {
    if (!this.thumbnailsContainer) return;
    const thumbs = this.thumbnailsContainer.querySelectorAll('.project-thumb-item');
    thumbs.forEach((thumb, idx) => {
      thumb.addEventListener('click', () => {
        this.goToIndex(idx);
      });
    });
  }

  updateDots(index) {
    const activeIdx = (index % this.items.length + this.items.length) % this.items.length;
    
    if (this.dotsContainer) {
      const dots = this.dotsContainer.querySelectorAll('.carousel-dot');
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === activeIdx);
      });
    }

    if (this.thumbnailsContainer) {
      const thumbs = this.thumbnailsContainer.querySelectorAll('.project-thumb-item');
      thumbs.forEach((thumb, idx) => {
        thumb.classList.toggle('active', idx === activeIdx);
      });
    }
  }

  bindEvents() {
    // Pointer Drag & Hold-to-pause
    this.viewport.addEventListener('pointerdown', this.onPointerDown.bind(this));
    window.addEventListener('pointermove', this.onPointerMove.bind(this));
    window.addEventListener('pointerup', this.onPointerUp.bind(this));
    window.addEventListener('pointercancel', this.onPointerUp.bind(this));

    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.stepByCard(-1));
    }
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.stepByCard(1));
    }
  }

  onPointerDown(e) {
    this.isHolding = true;
    this.isDragging = false;
    this.startX = e.clientX;
    this.lastX = e.clientX;
    this.velocity = 0;
    this.viewport.classList.add('holding');

    // Notify UI hold indicator if present
    const indicator = document.getElementById('carouselHoldIndicator');
    if (indicator) {
      indicator.classList.add('paused');
      indicator.innerHTML = '<span class="status-dot" style="background:#ef4444;box-shadow:0 0 8px #ef4444"></span> หยุดชั่วคราว (Paused)';
    }
  }

  onPointerMove(e) {
    if (!this.isHolding) return;

    const deltaX = e.clientX - this.lastX;
    const totalDelta = Math.abs(e.clientX - this.startX);

    if (totalDelta > 6) {
      this.isDragging = true;
      this.viewport.classList.add('dragging');
    }

    if (this.isDragging) {
      this.currentOffset += deltaX;
      this.velocity = deltaX;
      this.lastX = e.clientX;
      this.applyTransform();
    }
  }

  onPointerUp() {
    if (!this.isHolding) return;
    this.isHolding = false;
    this.viewport.classList.remove('holding');
    this.viewport.classList.remove('dragging');

    const indicator = document.getElementById('carouselHoldIndicator');
    if (indicator) {
      indicator.classList.remove('paused');
      indicator.innerHTML = '<span class="status-dot"></span> เลื่อนอัตโนมัติ (Live)';
    }
  }

  stepByCard(direction) {
    const cardWidth = (this.items[0]?.offsetWidth || 360) + 32; // card width + gap
    this.currentOffset -= direction * cardWidth;
    this.applyTransform();
  }

  goToIndex(index) {
    const cardWidth = (this.items[0]?.offsetWidth || 360) + 32;
    this.currentOffset = -(index * cardWidth);
    this.applyTransform();
    this.updateDots(index);
  }

  applyTransform() {
    const halfWidth = this.track.scrollWidth / 2;
    if (this.currentOffset <= -halfWidth) {
      this.currentOffset += halfWidth;
    } else if (this.currentOffset >= 0) {
      this.currentOffset -= halfWidth;
    }
    this.track.style.transform = `translate3d(${this.currentOffset}px, 0, 0)`;

    // Calculate current visible card index
    const cardWidth = (this.items[0]?.offsetWidth || 360) + 32;
    const approxIndex = Math.floor(Math.abs(this.currentOffset) / cardWidth) % this.items.length;
    this.updateDots(approxIndex);
  }

  update() {
    if (this.isAutoPlaying && !this.isHolding && !this.isDragging) {
      if (Math.abs(this.velocity) > 0.1) {
        this.currentOffset += this.velocity;
        this.velocity *= 0.94;
      } else {
        this.velocity = 0;
        this.currentOffset -= this.options.autoPlaySpeed;
      }
      this.applyTransform();
    }
    this.rafId = requestAnimationFrame(this.update.bind(this));
  }

  startAutoPlay() {
    if (!this.rafId) {
      this.rafId = requestAnimationFrame(this.update.bind(this));
    }
  }

  toggleAutoPlay() {
    this.isAutoPlaying = !this.isAutoPlaying;
    return this.isAutoPlaying;
  }
}

// Export classes to global window
window.InteractiveMarquee = InteractiveMarquee;
window.ProjectCarousel = ProjectCarousel;
