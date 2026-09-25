(() => {
  const chapters = [...document.querySelectorAll('main > section[id]')];
  const header = document.querySelector('.site-header');
  const links = [...document.querySelectorAll('a[href^="#"]')];
  const publication = document.getElementById('publications');
  if (!chapters.length || !header) return;

  const footer = document.querySelector('body > footer');
  if (footer) publication.append(footer);

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let active = Math.max(0, chapters.findIndex(section => `#${section.id}` === location.hash));
  let changing = false;
  let touchStart = null;

  function setChapter(index, { updateHistory = true, instant = false } = {}) {
    const next = Math.max(0, Math.min(chapters.length - 1, index));
    if (next === active && document.body.classList.contains('chapters-ready') && !instant) return;
    const previous = active;
    active = next;
    chapters.forEach((section, i) => {
      section.classList.toggle('is-current', i === next);
      section.classList.toggle('is-before', i < next);
      section.classList.toggle('is-after', i > next);
      section.inert = i !== next;
      if (i === next) section.removeAttribute('aria-hidden');
      else section.setAttribute('aria-hidden', 'true');
    });
    links.forEach(link => {
      if (link.getAttribute('href') === `#${chapters[next].id}`) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    header.style.setProperty('--chapter-progress', String(next / (chapters.length - 1)));
    if (next === 2) publication.scrollTop = 0;
    if (updateHistory) history.pushState(null, '', `#${chapters[next].id}`);
    if (instant || reducedMotion.matches) return;
    changing = true;
    setTimeout(() => { changing = false; }, 850);
  }

  chapters.forEach((section, i) => {
    section.classList.add(i < active ? 'is-before' : i > active ? 'is-after' : 'is-current');
    section.inert = i !== active;
    if (i !== active) section.setAttribute('aria-hidden', 'true');
  });
  document.body.classList.add('chapters-ready');
  setChapter(active, { updateHistory: false, instant: true });

  links.forEach(link => link.addEventListener('click', event => {
    const index = chapters.findIndex(section => `#${section.id}` === link.getAttribute('href'));
    if (index < 0) return;
    event.preventDefault();
    setChapter(index);
  }));

  addEventListener('wheel', event => {
    if (event.ctrlKey || Math.abs(event.deltaY) < 12 || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    const direction = Math.sign(event.deltaY);
    if (active === 0) {
      const heroContent = document.querySelector('.hero-inner');
      if ((direction > 0 && heroContent.scrollTop + heroContent.clientHeight < heroContent.scrollHeight - 2) ||
          (direction < 0 && heroContent.scrollTop > 1)) return;
    }
    if (active === 2) {
      const atTop = publication.scrollTop <= 1;
      const atBottom = publication.scrollTop + publication.clientHeight >= publication.scrollHeight - 2;
      if ((direction > 0 && !atBottom) || (direction < 0 && !atTop)) return;
    }
    event.preventDefault();
    if (!changing) setChapter(active + direction);
  }, { passive: false });

  addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName || '')) return;
    const direction = ['ArrowDown', 'PageDown'].includes(event.key) ? 1 : ['ArrowUp', 'PageUp'].includes(event.key) ? -1 : 0;
    if (!direction) return;
    if (active === 2 && ((direction > 0 && publication.scrollTop + publication.clientHeight < publication.scrollHeight - 2) ||
        (direction < 0 && publication.scrollTop > 1))) {
      event.preventDefault();
      publication.scrollBy({ top: direction * (event.key.startsWith('Page') ? publication.clientHeight * .8 : 88), behavior: reducedMotion.matches ? 'instant' : 'smooth' });
      return;
    }
    event.preventDefault();
    setChapter(active + direction);
  });

  addEventListener('touchstart', event => {
    touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
  }, { passive: true });
  addEventListener('touchend', event => {
    if (!touchStart) return;
    const dx = event.changedTouches[0].clientX - touchStart.x;
    const dy = event.changedTouches[0].clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(dy) < 65 || Math.abs(dy) < Math.abs(dx) || changing) return;
    const direction = dy < 0 ? 1 : -1;
    if (active === 0) {
      const heroContent = document.querySelector('.hero-inner');
      if ((direction > 0 && heroContent.scrollTop + heroContent.clientHeight < heroContent.scrollHeight - 2) ||
          (direction < 0 && heroContent.scrollTop > 1)) return;
    }
    if (active === 2) {
      const atTop = publication.scrollTop <= 1;
      const atBottom = publication.scrollTop + publication.clientHeight >= publication.scrollHeight - 2;
      if ((direction > 0 && !atBottom) || (direction < 0 && !atTop)) return;
    }
    setChapter(active + direction);
  }, { passive: true });

  addEventListener('popstate', () => {
    const index = chapters.findIndex(section => `#${section.id}` === location.hash);
    setChapter(index < 0 ? 0 : index, { updateHistory: false });
  });
})();
