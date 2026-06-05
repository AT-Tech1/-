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
    let dragStartX = 0;
    let dragStartY = 0;
    let startTranslateX = 0;
    let startTranslateY = 0;
    let wasDragging = false;

    let initialPinchDistance = 0;
    let pinchStartScale = 1;
    let lastTapTime = 0;

    function clamp(value, min, max) {
      return Math.min(Math.max(value, min), max);
    }

    function applyTransform() {
      scale = clamp(scale, 0.5, 6);
      zoomImage.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
      stage.classList.toggle('is-zoomed', scale > 1);
    }

    function resetTransform() {
      scale = 1;
      translateX = 0;
      translateY = 0;
      applyTransform();
    }

    function setScale(nextScale) {
      scale = nextScale;
      if (scale <= 1) {
        translateX = 0;
        translateY = 0;
      }
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

    function getDistance(touches) {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.hypot(dx, dy);
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

    document.addEventListener('keydown', function (event) {
      if (!modal.classList.contains('is-open')) return;
      if (event.key === 'Escape') closeImage();
      if (event.key === '+' || event.key === '=') setScale(scale + 0.35);
      if (event.key === '-' || event.key === '_') setScale(scale - 0.35);
      if (event.key === '0') resetTransform();
    });

    modal.addEventListener('wheel', function (event) {
      if (!modal.classList.contains('is-open')) return;
      event.preventDefault();
      setScale(scale + (event.deltaY < 0 ? 0.2 : -0.2));
    }, { passive: false });

    stage.addEventListener('mousedown', function (event) {
      if (scale <= 1) return;
      isDragging = true;
      wasDragging = false;
      dragStartX = event.clientX;
      dragStartY = event.clientY;
      startTranslateX = translateX;
      startTranslateY = translateY;
      stage.classList.add('is-dragging');
    });

    window.addEventListener('mousemove', function (event) {
      if (!isDragging) return;
      const dx = event.clientX - dragStartX;
      const dy = event.clientY - dragStartY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) wasDragging = true;
      translateX = startTranslateX + dx;
      translateY = startTranslateY + dy;
      applyTransform();
    });

    window.addEventListener('mouseup', function () {
      isDragging = false;
      stage.classList.remove('is-dragging');
    });

    stage.addEventListener('touchstart', function (event) {
      if (!modal.classList.contains('is-open')) return;

      if (event.touches.length === 1) {
        const now = Date.now();
        if (now - lastTapTime < 300) {
          event.preventDefault();
          if (scale > 1) {
            resetTransform();
          } else {
            setScale(2.2);
          }
          lastTapTime = 0;
          return;
        }
        lastTapTime = now;

        dragStartX = event.touches[0].clientX;
        dragStartY = event.touches[0].clientY;
        startTranslateX = translateX;
        startTranslateY = translateY;
        wasDragging = false;
      }

      if (event.touches.length === 2) {
        event.preventDefault();
        initialPinchDistance = getDistance(event.touches);
        pinchStartScale = scale;
      }
    }, { passive: false });

    stage.addEventListener('touchmove', function (event) {
      if (!modal.classList.contains('is-open')) return;

      if (event.touches.length === 2) {
        event.preventDefault();
        const currentDistance = getDistance(event.touches);
        if (initialPinchDistance > 0) {
          scale = pinchStartScale * (currentDistance / initialPinchDistance);
          applyTransform();
        }
        return;
      }

      if (event.touches.length === 1 && scale > 1) {
        event.preventDefault();
        const dx = event.touches[0].clientX - dragStartX;
        const dy = event.touches[0].clientY - dragStartY;
        if (Math.abs(dx) > 4 || Math.abs(dy) > 4) wasDragging = true;
        translateX = startTranslateX + dx;
        translateY = startTranslateY + dy;
        applyTransform();
      }
    }, { passive: false });

    stage.addEventListener('touchend', function (event) {
      if (event.touches.length < 2) {
        initialPinchDistance = 0;
        pinchStartScale = scale;
      }

      if (scale <= 1) {
        resetTransform();
      }
    });
  }


  document.addEventListener('DOMContentLoaded', function () {
    makeTopbar();
    enrichCards();
    if (typeof addFooter === 'function') addFooter();
  });
})();
