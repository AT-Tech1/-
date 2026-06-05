(function () {
  const root = document.documentElement;
  const storedTheme = localStorage.getItem('churchTheme');
  const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  root.setAttribute('data-theme', storedTheme || (prefersLight ? 'light' : 'dark'));

  function makeTopbar() {
    if (document.querySelector('.church-topbar')) return;
    const topbar = document.createElement('div');
    topbar.className = 'church-topbar';
    topbar.innerHTML = `
      <div class="church-brand">
        <div class="church-logo" aria-hidden="true">☩</div>
        <div>
          كنيسة مارجرجس بشبين الكوم
          <small>مسابقات • ألحان • كورال</small>
        </div>
      </div>
      <div class="church-actions">
        <a class="home-link" href="index.html" title="الرئيسية" aria-label="الرئيسية">⌂</a>
        <button class="theme-toggle" type="button" title="تغيير الوضع" aria-label="تغيير الوضع">
          <span>🌙</span><span>☀️</span>
        </button>
      </div>`;
    document.body.prepend(topbar);
    topbar.querySelector('.theme-toggle').addEventListener('click', function () {
      const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', next);
      localStorage.setItem('churchTheme', next);
    });
  }

  function enrichCards() {
    document.querySelectorAll('.card').forEach((card, index) => {
      card.style.animationDelay = `${Math.min(index * 70, 420)}ms`;
    });
    document.querySelectorAll('.accordion-item').forEach((item, index) => {
      item.style.animationDelay = `${Math.min(index * 55, 420)}ms`;
    });
  }



  function addImageZoom() {
    if (document.querySelector('.church-image-zoom-modal')) return;

    const modal = document.createElement('div');
    modal.className = 'church-image-zoom-modal';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
      <button class="church-zoom-close" type="button" aria-label="إغلاق الصورة">×</button>
      <div class="church-zoom-tools" aria-label="أدوات التحكم في حجم الصورة">
        <button class="church-zoom-in" type="button" aria-label="تكبير الصورة">+</button>
        <button class="church-zoom-out" type="button" aria-label="تصغير الصورة">−</button>
        <button class="church-zoom-reset" type="button" aria-label="إرجاع الحجم الطبيعي">100%</button>
      </div>
      <div class="church-zoom-stage">
        <img class="church-zoom-image" alt="">
      </div>`;

    document.body.appendChild(modal);

    const stage = modal.querySelector('.church-zoom-stage');
    const zoomImage = modal.querySelector('.church-zoom-image');
    const closeBtn = modal.querySelector('.church-zoom-close');
    const zoomInBtn = modal.querySelector('.church-zoom-in');
    const zoomOutBtn = modal.querySelector('.church-zoom-out');
    const resetBtn = modal.querySelector('.church-zoom-reset');

    let scale = 1;
    let translateX = 0;
    let translateY = 0;
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let startTranslateX = 0;
    let startTranslateY = 0;
    let wasDragging = false;

    function clamp(value, min, max) {
      return Math.min(Math.max(value, min), max);
    }

    function getMoveLimits() {
      const stageRect = stage.getBoundingClientRect();
      const imageRect = zoomImage.getBoundingClientRect();

      const naturalWidth = imageRect.width / scale;
      const naturalHeight = imageRect.height / scale;

      const scaledWidth = naturalWidth * scale;
      const scaledHeight = naturalHeight * scale;

      return {
        x: Math.max(0, (scaledWidth - stageRect.width) / 2),
        y: Math.max(0, (scaledHeight - stageRect.height) / 2)
      };
    }

    function limitMove() {
      const limits = getMoveLimits();
      translateX = clamp(translateX, -limits.x, limits.x);
      translateY = clamp(translateY, -limits.y, limits.y);
    }

    function applyTransform() {
      scale = clamp(scale, 1, 5);
      if (scale <= 1) {
        translateX = 0;
        translateY = 0;
      } else {
        limitMove();
      }

      zoomImage.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`;
      stage.classList.toggle('is-zoomed', scale > 1);
    }

    function resetTransform() {
      scale = 1;
      translateX = 0;
      translateY = 0;
      applyTransform();
    }

    function setScale(nextScale) {
      scale = clamp(nextScale, 1, 5);
      applyTransform();
    }

    function openImage(img) {
      zoomImage.src = img.currentSrc || img.src;
      zoomImage.alt = img.alt || 'صورة مكبرة';
      resetTransform();
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('church-zoom-open');
    }

    function closeImage() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('church-zoom-open');
      zoomImage.removeAttribute('src');
      resetTransform();
    }

    document.querySelectorAll('img').forEach((img) => {
      if (img.closest('.church-image-zoom-modal')) return;
      img.classList.add('church-clickable-image');
      img.addEventListener('click', function () {
        openImage(img);
      });
    });

    zoomInBtn.addEventListener('click', function (event) {
      event.stopPropagation();
      setScale(scale + 0.35);
    });

    zoomOutBtn.addEventListener('click', function (event) {
      event.stopPropagation();
      setScale(scale - 0.35);
    });

    resetBtn.addEventListener('click', function (event) {
      event.stopPropagation();
      resetTransform();
    });

    closeBtn.addEventListener('click', closeImage);

    modal.addEventListener('click', function (event) {
      if (wasDragging) {
        wasDragging = false;
        return;
      }

      if (event.target === modal || event.target === stage) {
        closeImage();
      }
    });

    function startDrag(clientX, clientY) {
      if (scale <= 1) return;
      isDragging = true;
      wasDragging = false;
      startX = clientX;
      startY = clientY;
      startTranslateX = translateX;
      startTranslateY = translateY;
      stage.classList.add('is-dragging');
    }

    function moveDrag(clientX, clientY) {
      if (!isDragging || scale <= 1) return;

      const dx = clientX - startX;
      const dy = clientY - startY;

      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) wasDragging = true;

      translateX = startTranslateX + dx;
      translateY = startTranslateY + dy;
      applyTransform();
    }

    function endDrag() {
      isDragging = false;
      stage.classList.remove('is-dragging');
    }

    stage.addEventListener('mousedown', function (event) {
      event.preventDefault();
      startDrag(event.clientX, event.clientY);
    });

    window.addEventListener('mousemove', function (event) {
      moveDrag(event.clientX, event.clientY);
    });

    window.addEventListener('mouseup', endDrag);

    stage.addEventListener('touchstart', function (event) {
      if (event.touches.length !== 1) return;
      startDrag(event.touches[0].clientX, event.touches[0].clientY);
    }, { passive: true });

    stage.addEventListener('touchmove', function (event) {
      if (event.touches.length !== 1 || scale <= 1) return;
      event.preventDefault();
      moveDrag(event.touches[0].clientX, event.touches[0].clientY);
    }, { passive: false });

    stage.addEventListener('touchend', endDrag);
    stage.addEventListener('touchcancel', endDrag);

    modal.addEventListener('wheel', function (event) {
      if (!modal.classList.contains('is-open')) return;
      event.preventDefault();
      setScale(scale + (event.deltaY < 0 ? 0.2 : -0.2));
    }, { passive: false });

    window.addEventListener('resize', applyTransform);

    document.addEventListener('keydown', function (event) {
      if (!modal.classList.contains('is-open')) return;

      if (event.key === 'Escape') closeImage();
      if (event.key === '+' || event.key === '=') setScale(scale + 0.35);
      if (event.key === '-' || event.key === '_') setScale(scale - 0.35);
      if (event.key === '0') resetTransform();

      const step = 45;
      if (scale > 1 && event.key === 'ArrowRight') {
        translateX += step;
        applyTransform();
      }
      if (scale > 1 && event.key === 'ArrowLeft') {
        translateX -= step;
        applyTransform();
      }
      if (scale > 1 && event.key === 'ArrowUp') {
        translateY -= step;
        applyTransform();
      }
      if (scale > 1 && event.key === 'ArrowDown') {
        translateY += step;
        applyTransform();
      }
    });
  }


  document.addEventListener('DOMContentLoaded', function () {
    makeTopbar();
    enrichCards();
    if (typeof addFooter === 'function') addFooter();
    addImageZoom();
  });
})();
