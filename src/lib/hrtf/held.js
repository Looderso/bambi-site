/*  On a wide screen, a paper's figures are held beside the text: they move into a column on the right that stays on
    screen, and the one shown is the one whose place in the text is nearest the line being read (40 % down the
    screen), as a product page shows the part being read. Each figure leaves a marker where it stood. On a narrow
    screen the figures stay inline, after the paragraph that cites them. */
const WIDE = '(min-width: 1100px)';

export function held(paper, stage) {
  const figures = [...paper.querySelectorAll('figure[data-n]')];
  const marks = figures.map((figure) => {
    const mark = document.createElement('span');
    mark.className = 'figure-mark';
    mark.dataset.n = figure.dataset.n;
    figure.before(mark);
    return mark;
  });
  const wide = matchMedia(WIDE);
  let shown = null;

  const show = (figure) => {
    if (figure === shown) return;
    shown?.classList.remove('shown');
    figure.classList.add('shown');
    shown = figure;
    stage.style.height = `${figure.offsetHeight}px`;
  };
  const reading = () => {
    if (!wide.matches) return;
    const line = innerHeight * 0.4;
    let best = 0, distance = Infinity;
    marks.forEach((mark, i) => {
      const d = Math.abs(mark.getBoundingClientRect().top - line);
      if (d < distance) [distance, best] = [d, i];
    });
    show(figures[best]);
  };
  const place = () => {
    if (wide.matches) {
      figures.forEach((f) => stage.append(f));
      shown = null;
      reading();
    } else {
      figures.forEach((f, i) => { marks[i].after(f); f.classList.remove('shown'); });
      shown = null;
      stage.style.height = '';
    }
    window.dispatchEvent(new Event('resize')); // the figures drawn at a size redraw at their new one
  };
  addEventListener('scroll', reading, { passive: true });
  addEventListener('resize', () => shown && (stage.style.height = `${shown.offsetHeight}px`));
  wide.addEventListener('change', place);
  place();
}
