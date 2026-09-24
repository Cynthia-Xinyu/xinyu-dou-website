(() => {
  const sections = [...document.querySelectorAll('main > section[id]')];
  const links = [...document.querySelectorAll('.site-header a[href^="#"]')];
  const header = document.querySelector('.site-header');
  if (!sections.length || !header) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.forEach(link => {
        if (link.getAttribute('href') === `#${entry.target.id}`) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
      });
      entry.target.classList.add('chapter-visible');
    });
  }, { rootMargin: '-40% 0px -40% 0px' });
  sections.forEach(section => observer.observe(section));

  let queued = false;
  function updateProgress() {
    const travel = document.documentElement.scrollHeight - innerHeight;
    header.style.setProperty('--chapter-progress', travel > 0 ? String(Math.min(1, scrollY / travel)) : '0');
    queued = false;
  }
  addEventListener('scroll', () => {
    if (!queued) { queued = true; requestAnimationFrame(updateProgress); }
  }, { passive: true });
  updateProgress();
})();
