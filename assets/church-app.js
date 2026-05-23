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

 

  document.addEventListener('DOMContentLoaded', function () {
    makeTopbar();
    enrichCards();
    addFooter();
  });
})();
