/**
 * ==========================================================================
 * MAIN APPLICATION SCRIPT
 * Connects Marquee, Carousel, Neumorphic Controller, Project Modals & Toast
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Neumorphic Systems
  const neuController = new NeumorphicController();

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

  // 2. Initialize Tech Marquee Row 1 (Moving Left)
  const marqueeHoldIndicator = document.getElementById('marqueeHoldIndicator');
  
  const techMarqueeRow1 = new InteractiveMarquee('#techMarquee1', {
    speed: 0.4,
    direction: 'left',
    draggable: true,
    pauseOnHold: true,
    pauseOnHover: false,
    onHoldStateChange: (isHolding) => {
      if (marqueeHoldIndicator) {
        if (isHolding) {
          marqueeHoldIndicator.classList.add('paused');
          marqueeHoldIndicator.innerHTML = '<span class="status-dot" style="background:#ef4444;box-shadow:0 0 10px #ef4444"></span> จิ้มค้างอยู่ (Paused)';
        } else {
          marqueeHoldIndicator.classList.remove('paused');
          marqueeHoldIndicator.innerHTML = '<span class="status-dot"></span> หมุนเวียนอัตโนมัติ (Live)';
        }
      }
    }
  });

  // 3. Initialize Tech Marquee Row 2 (Moving Right)
  const techMarqueeRow2 = new InteractiveMarquee('#techMarquee2', {
    speed: 0.35,
    direction: 'right',
    draggable: true,
    pauseOnHold: true,
    pauseOnHover: false,
    onHoldStateChange: (isHolding) => {
      if (marqueeHoldIndicator) {
        if (isHolding) {
          marqueeHoldIndicator.classList.add('paused');
          marqueeHoldIndicator.innerHTML = '<span class="status-dot" style="background:#ef4444;box-shadow:0 0 10px #ef4444"></span> จิ้มค้างอยู่ (Paused)';
        } else {
          marqueeHoldIndicator.classList.remove('paused');
          marqueeHoldIndicator.innerHTML = '<span class="status-dot"></span> หมุนเวียนอัตโนมัติ (Live)';
        }
      }
    }
  });

  // 4. Initialize Featured Project Carousel (if present)
  let projectCarousel = null;
  const projectCarouselEl = document.querySelector('#featuredProjectCarousel');
  if (projectCarouselEl) {
    projectCarousel = new ProjectCarousel(projectCarouselEl, {
      autoPlay: true,
      autoPlaySpeed: 0.9
    });
  }

  // 5. Controls: Marquee Speed Slider
  const speedSlider = document.getElementById('marqueeSpeedSlider');
  const speedDisplay = document.getElementById('speedValueDisplay');
  if (speedSlider) {
    speedSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      techMarqueeRow1.setSpeed(val);
      techMarqueeRow2.setSpeed(val * 0.85);
      if (speedDisplay) {
        speedDisplay.textContent = `${val.toFixed(1)}x`;
      }
    });
  }

  // 6. Controls: Direction Toggle Button
  const dirToggleBtn = document.getElementById('toggleDirectionBtn');
  let isReversed = false;
  if (dirToggleBtn) {
    dirToggleBtn.addEventListener('click', () => {
      isReversed = !isReversed;
      techMarqueeRow1.setDirection(isReversed ? 'right' : 'left');
      techMarqueeRow2.setDirection(isReversed ? 'left' : 'right');
      dirToggleBtn.classList.toggle('active', isReversed);
      showToast(isReversed ? '🔄 สลับทิศทางไปทางขวา' : '🔄 สลับทิศทางไปทางซ้าย');
    });
  }

  // 7. Controls: Master Play/Pause Button
  const playPauseBtn = document.getElementById('masterPlayPauseBtn');
  let isPlaying = true;
  if (playPauseBtn) {
    playPauseBtn.addEventListener('click', () => {
      isPlaying = !isPlaying;
      techMarqueeRow1.togglePlay(isPlaying);
      techMarqueeRow2.togglePlay(isPlaying);
      if (projectCarousel) {
        projectCarousel.toggleAutoPlay();
      }

      playPauseBtn.classList.toggle('active', !isPlaying);
      const icon = playPauseBtn.querySelector('i') || playPauseBtn.querySelector('span');
      if (icon) {
        icon.textContent = isPlaying ? '⏸️ หยุดชั่วคราว' : '▶️ เล่นต่อ';
      }
      showToast(isPlaying ? '▶️ เล่นการเคลื่อนไหวอัตโนมัติ' : '⏸️ หยุดการเคลื่อนไหวทั้งหมด');
    });
  }

  // 8. Project Detail Modal
  const modal = document.getElementById('projectDetailModal');
  const modalTitle = document.getElementById('modalProjectTitle');
  const modalCategory = document.getElementById('modalProjectCategory');
  const modalDesc = document.getElementById('modalProjectDesc');
  const modalTags = document.getElementById('modalProjectTags');
  const modalCloseBtn = document.getElementById('closeModalBtn');

  // Bind view details buttons
  document.querySelectorAll('.view-project-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.neu-project-card');
      if (!card) return;

      const title = card.querySelector('.project-title')?.textContent || 'Project Details';
      const category = card.querySelector('.project-category-badge')?.textContent || 'Showcase';
      const desc = card.querySelector('.project-desc')?.textContent || 'รายละเอียดของโครงการ';
      const tags = Array.from(card.querySelectorAll('.project-tag-pill')).map(t => t.textContent);

      if (modalTitle) modalTitle.textContent = title;
      if (modalCategory) modalCategory.textContent = category;
      if (modalDesc) modalDesc.textContent = desc;
      if (modalTags) {
        modalTags.innerHTML = tags.map(tag => `<span class="neu-badge neu-badge-inset">${tag}</span>`).join('');
      }

      if (modal) modal.classList.add('open');
    });
  });

  if (modalCloseBtn && modal) {
    modalCloseBtn.addEventListener('click', () => {
      modal.classList.remove('open');
    });
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('open');
      }
    });
  }

  // 8.1 Photo Gallery Lightbox Handler
  const lightbox = document.getElementById('photoLightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const closeLightboxBtn = document.getElementById('closeLightboxBtn');

  document.querySelectorAll('.gallery-photo-card').forEach(card => {
    card.addEventListener('click', () => {
      const src = card.getAttribute('data-src');
      const title = card.getAttribute('data-title');
      const caption = card.querySelector('.photo-caption-box')?.textContent || card.getAttribute('data-caption');

      if (lightboxImg) lightboxImg.src = src;
      if (lightboxTitle) lightboxTitle.textContent = title;
      if (lightboxCaption) lightboxCaption.textContent = caption;
      if (lightbox) lightbox.classList.add('open');
    });
  });

  if (closeLightboxBtn && lightbox) {
    closeLightboxBtn.addEventListener('click', () => {
      lightbox.classList.remove('open');
    });
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        lightbox.classList.remove('open');
      }
    });
  }

  // 8.2 Certificate Lightbox Modal Handler
  const certModal = document.getElementById('certLightboxModal');
  const certModalImg = document.getElementById('certModalImg');
  const certModalTitle = document.getElementById('certModalTitle');
  const certModalIssuer = document.getElementById('certModalIssuer');
  const certModalTag = document.getElementById('certModalTag');
  const certModalYear = document.getElementById('certModalYear');
  const certModalPdfLink = document.getElementById('certModalPdfLink');
  const closeCertModalBtn = document.getElementById('closeCertModalBtn');
  const closeCertModalFooterBtn = document.getElementById('closeCertModalFooterBtn');

  function openCertModal(data) {
    if (!certModal) return;

    const singleWrap = document.getElementById('certModalSingleWrap');
    const multiWrap = document.getElementById('certModalMultiWrap');

    if (data.imgs) {
      const imgList = data.imgs.split(',').map(s => s.trim());
      if (singleWrap) singleWrap.style.display = 'none';
      if (multiWrap) {
        multiWrap.style.display = 'flex';
        multiWrap.innerHTML = imgList.map((src, idx) => 
          `<div style="text-align: center; flex: 1; min-width: 260px;">
             <div style="font-size: 0.85rem; font-weight: 800; color: #2563eb; margin-bottom: 6px; background: var(--bg-surface); padding: 5px 14px; border-radius: 14px; display: inline-block; box-shadow: var(--neu-flat-sm);">
               ครั้งที่ ${idx + 1}
             </div>
             <img src="${src}" alt="ครั้งที่ ${idx + 1}" style="max-height: 58vh; width: 100%; object-fit: contain; border-radius: 8px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15); border: 1px solid rgba(173, 185, 203, 0.3);">
           </div>`
        ).join('');
      }
    } else {
      if (multiWrap) {
        multiWrap.style.display = 'none';
        multiWrap.innerHTML = '';
      }
      if (singleWrap) {
        singleWrap.style.display = 'flex';
        if (certModalImg) certModalImg.src = data.img || '';
      }
    }

    if (certModalTitle) certModalTitle.textContent = data.title || 'ใบประกาศนียบัตร';
    if (certModalIssuer) certModalIssuer.textContent = data.issuer || '';
    if (certModalTag) certModalTag.textContent = data.tag || 'ใบรับรอง';
    if (certModalYear) certModalYear.textContent = data.year || '';
    if (certModalPdfLink) certModalPdfLink.href = data.pdf || '#';
    certModal.classList.add('open');
  }

  function closeCertModal() {
    if (certModal) certModal.classList.remove('open');
  }

  // Trigger from "ดูขนาดเต็ม" buttons or clicking thumbnail box
  document.querySelectorAll('.cert-thumbnail-box, .cert-full-btn').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const pdf = el.getAttribute('data-pdf');
      const img = el.getAttribute('data-img');
      const imgs = el.getAttribute('data-imgs');
      const title = el.getAttribute('data-title');
      const issuer = el.getAttribute('data-issuer');
      const year = el.getAttribute('data-year');
      const tag = el.getAttribute('data-tag');

      openCertModal({ pdf, img, imgs, title, issuer, year, tag });
    });
  });

  if (closeCertModalBtn) closeCertModalBtn.addEventListener('click', closeCertModal);
  if (closeCertModalFooterBtn) closeCertModalFooterBtn.addEventListener('click', closeCertModal);
  if (certModal) {
    certModal.addEventListener('click', (e) => {
      if (e.target === certModal) closeCertModal();
    });
  }

  // Global ESC key listener to close any open modal
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeCertModal();
      if (lightbox) lightbox.classList.remove('open');
      if (modal) modal.classList.remove('open');
    }
  });

  // 10. Thumbnail Slider Navigation: Click & ScrollSpy
  const thumbNavPills = document.querySelectorAll('.thumb-slider-track .thumb-nav-pill:not(.landing-pill)');
  const sections = document.querySelectorAll('section[id]');

  thumbNavPills.forEach(pill => {
    pill.addEventListener('click', (e) => {
      const targetId = pill.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
          e.preventDefault();
          targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          thumbNavPills.forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
        }
      }
    });
  });

  // ScrollSpy to update active thumbnail pill on scroll
  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollPos = window.scrollY + 180;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        currentId = section.getAttribute('id');
      }
    });

    if (currentId) {
      thumbNavPills.forEach(pill => {
        const href = pill.getAttribute('href');
        if (href === `#${currentId}`) {
          pill.classList.add('active');
        } else {
          pill.classList.remove('active');
        }
      });
    }
  }, { passive: true });

  // 11. Toast Notification Helper
  function showToast(message) {
    let toast = document.getElementById('appToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'appToast';
      toast.className = 'neu-toast';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<span class="status-dot"></span> <span>${message}</span>`;
    toast.classList.add('show');

    clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  window.showToast = showToast;
});
