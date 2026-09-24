const stage = document.getElementById('research');
const panels = [...stage.querySelectorAll('.research-panel')];
const slides = stage.querySelector('.research-stage');
const artwork = [...stage.querySelectorAll('.art-scene')];
const artFigure = stage.querySelector('.research-art');
const artDescriptions = ['A dancer moving beneath classical arches', 'An artist in a sunlit studio', 'A dance instructor in a group studio', 'A dancer using movement technology'];
const dots = [...stage.querySelectorAll('.research-dots button')];
const position = document.getElementById('research-position');
let current = 0;
let lockedUntil = 0;
let touchX = null;

function showInterest(index, travelDirection) {
  const next = (index + panels.length) % panels.length;
  if (next === current) return;
  const direction = travelDirection || (next > current ? 'right' : 'left');
  const previous = panels[current];
  const incoming = panels[next];
  panels.forEach(panel => panel.classList.remove('is-leaving-left', 'is-leaving-right', 'from-left', 'from-right'));
  incoming.classList.add(direction === 'right' ? 'from-right' : 'from-left');
  previous.classList.remove('is-active');
  previous.classList.add(direction === 'right' ? 'is-leaving-left' : 'is-leaving-right');
  previous.setAttribute('aria-hidden', 'true');
  previous.inert = true;
  dots[current].classList.remove('is-active');
  dots[current].removeAttribute('aria-current');
  current = next;
  incoming.removeAttribute('aria-hidden');
  incoming.inert = false;
  void incoming.offsetWidth;
  incoming.classList.add('is-active');
  incoming.classList.remove('from-left', 'from-right');
  setTimeout(() => previous.classList.remove('is-leaving-left', 'is-leaving-right'), 750);
  slides.dataset.active = String(current + 1);
  artwork.forEach((scene, sceneIndex) => scene.classList.toggle('is-active', sceneIndex === current));
  artFigure.setAttribute('aria-label', artDescriptions[current]);
  dots[current].classList.add('is-active');
  dots[current].setAttribute('aria-current', 'true');
  position.textContent = `${String(current + 1).padStart(2, '0')} / 04`;
}

function move(direction) {
  showInterest(current + direction, direction > 0 ? 'right' : 'left');
}

dots.forEach((dot, index) => dot.addEventListener('click', () => showInterest(index)));
document.getElementById('interest-prev').addEventListener('click', () => move(-1));
document.getElementById('interest-next').addEventListener('click', () => move(1));

stage.addEventListener('wheel', event => {
  // Vertical scrolling moves between chapters; horizontal scrolling changes interests.
  if (Math.abs(event.deltaX) < 8 || Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
  const direction = Math.sign(event.deltaX);
  event.preventDefault();
  if (Date.now() < lockedUntil) return;
  move(direction);
  lockedUntil = Date.now() + 750;
}, { passive: false });

stage.addEventListener('keydown', event => {
  const direction = ['ArrowRight', 'PageDown'].includes(event.key) ? 1 : ['ArrowLeft', 'PageUp'].includes(event.key) ? -1 : 0;
  if (!direction) return;
  event.preventDefault();
  move(direction);
});

stage.addEventListener('touchstart', event => { touchX = event.touches[0].clientX; }, { passive: true });
stage.addEventListener('touchend', event => {
  if (touchX === null) return;
  const distance = touchX - event.changedTouches[0].clientX;
  touchX = null;
  if (Math.abs(distance) > 40) move(Math.sign(distance));
}, { passive: true });
