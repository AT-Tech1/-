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

    const zoomImage = modal.querySelector('.church-zoom-image');
    const closeBtn = modal.querySelector('.church-zoom-close');
    const zoomInBtn = modal.querySelector('.church-zoom-in');
    const zoomOutBtn = modal.querySelector('.church-zoom-out');
    const resetBtn = modal.querySelector('.church-zoom-reset');
    let scale = 1;

    function setScale(nextScale) {
      scale = Math.min(Math.max(nextScale, 0.5), 4);
      zoomImage.style.transform = `scale(${scale})`;
    }

    function openImage(img) {
      zoomImage.src = img.currentSrc || img.src;
      zoomImage.alt = img.alt || 'صورة مكبرة';
      setScale(1);
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('church-zoom-open');
    }

    function closeImage() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('church-zoom-open');
      zoomImage.removeAttribute('src');
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
      setScale(scale + 0.25);
    });

    zoomOutBtn.addEventListener('click', function (event) {
      event.stopPropagation();
      setScale(scale - 0.25);
    });

    resetBtn.addEventListener('click', function (event) {
      event.stopPropagation();
      setScale(1);
    });

    closeBtn.addEventListener('click', closeImage);

    modal.addEventListener('click', function (event) {
      if (event.target === modal || event.target.classList.contains('church-zoom-stage')) {
        closeImage();
      }
    });

    document.addEventListener('keydown', function (event) {
      if (!modal.classList.contains('is-open')) return;
      if (event.key === 'Escape') closeImage();
      if (event.key === '+' || event.key === '=') setScale(scale + 0.25);
      if (event.key === '-' || event.key === '_') setScale(scale - 0.25);
    });

    modal.addEventListener('wheel', function (event) {
      if (!modal.classList.contains('is-open')) return;
      event.preventDefault();
      setScale(scale + (event.deltaY < 0 ? 0.15 : -0.15));
    }, { passive: false });
  }


  document.addEventListener('DOMContentLoaded', function () {
    makeTopbar();
    enrichCards();
    if (typeof addFooter === 'function') addFooter();
    addImageZoom();
  });
})();
