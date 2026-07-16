import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

// dev-only: lets headless/hidden-tab checks fast-forward tweens
if (import.meta.env.DEV) {
  const w = window as unknown as { gsap: typeof gsap; ScrollTrigger: typeof ScrollTrigger };
  w.gsap = gsap;
  w.ScrollTrigger = ScrollTrigger;
}

const html = document.documentElement;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const desktop = window.matchMedia('(pointer: fine)').matches && window.innerWidth >= 1024;

let motionDisabled = false;
let lenis: { destroy(): void } | undefined;

function releaseGuard() {
  html.classList.remove('motion-pending');
}

/* ── hero entrance ─────────────────────────────────────────── */
function heroIntro() {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (!hero) {
    releaseGuard();
    return;
  }

  const lines = hero.querySelectorAll('[data-hero-line]');
  const rises = hero.querySelectorAll('[data-hero-rise]');
  const media = hero.querySelector('[data-hero-media]');

  releaseGuard();
  gsap.set(lines, { yPercent: 110, y: 0 });
  gsap.set(rises, { autoAlpha: 0, y: 24 });
  if (media) gsap.set(media, { autoAlpha: 0, scale: 1.08 });

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  if (media) tl.to(media, { autoAlpha: 1, scale: 1, duration: 1.5, ease: 'power2.out' }, 0);
  tl.to(lines, { yPercent: 0, duration: 1.0, ease: 'power4.out', stagger: 0.14 }, 0.3);
  tl.to(rises, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.12 }, 0.7);
}

/* ── scroll reveals ────────────────────────────────────────── */
const REVEAL_MODE: 'once' | 'replay' = 'replay';
const replay = REVEAL_MODE === 'replay';
const HIDE = { duration: 0.28, ease: 'power1.out', overwrite: true } as const;

const SPLIT_SELECTOR = 'main h2';

function isSplitTarget(el: Element) {
  return el.matches(SPLIT_SELECTOR) && !el.closest('[data-hero]');
}

function splitHeadings() {
  const headings = gsap.utils
    .toArray<HTMLElement>(SPLIT_SELECTOR)
    .filter((h) => !h.closest('[data-hero]'));

  headings.forEach((h) => {
    let st: ScrollTrigger | undefined;
    SplitText.create(h, {
      type: 'lines',
      mask: 'lines',
      linesClass: 'split-line',
      autoSplit: true,
      onSplit(self) {
        st?.kill();
        gsap.set(self.lines, { yPercent: 115 });
        st = ScrollTrigger.create({
          trigger: h,
          start: 'top 88%',
          once: !replay,
          onEnter: () =>
            gsap.to(self.lines, {
              yPercent: 0,
              duration: 0.9,
              ease: 'power4.out',
              stagger: 0.1,
              overwrite: true,
            }),
          onLeaveBack: replay
            ? () => gsap.to(self.lines, { yPercent: 115, ...HIDE })
            : undefined,
        });
      },
    });
  });
}

function scrollReveals() {
  const reveals = gsap.utils
    .toArray<HTMLElement>('.reveal')
    .filter((el) => !el.closest('[data-hero]'));

  const plain: HTMLElement[] = [];
  for (const el of reveals) {
    const heading = Array.from(el.querySelectorAll('h1, h2, h3')).find(isSplitTarget);
    if (!heading) {
      plain.push(el);
      continue;
    }
    const others = Array.from(el.children).filter((c) => !c.contains(heading)) as HTMLElement[];
    if (others.length) {
      gsap.set(others, { autoAlpha: 0, y: 24 });
      ScrollTrigger.create({
        trigger: el,
        start: 'top 88%',
        once: !replay,
        onEnter: () =>
          gsap.to(others, {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            stagger: 0.1,
            overwrite: true,
          }),
        onLeaveBack: replay ? () => gsap.to(others, { autoAlpha: 0, y: 24, ...HIDE }) : undefined,
      });
    }
  }

  // .reveal-scale elements get their own combined tween below — including
  // them in the batch would create two overwrite:true tweens on one target
  const batchable = plain.filter((el) => !el.classList.contains('reveal-scale'));

  gsap.set(batchable, { autoAlpha: 0, y: 32 });
  ScrollTrigger.batch(batchable, {
    start: 'top 88%',
    once: !replay,
    onEnter: (batch) =>
      gsap.to(batch, {
        autoAlpha: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.12,
        overwrite: true,
      }),
    onLeaveBack: replay ? (batch) => gsap.to(batch, { autoAlpha: 0, y: 32, ...HIDE }) : undefined,
  });

  gsap.utils.toArray<HTMLElement>('.reveal-scale').forEach((el) => {
    // one tween owns every animated prop — a fade tween and a scale tween on
    // the same target with overwrite:true would kill each other
    const alsoReveals = el.classList.contains('reveal');
    const hidden = alsoReveals ? { autoAlpha: 0, y: 32, scale: 1.06 } : { scale: 1.06 };
    const shown = alsoReveals ? { autoAlpha: 1, y: 0, scale: 1 } : { scale: 1 };
    gsap.set(el, hidden);
    ScrollTrigger.create({
      trigger: el,
      start: 'top 92%',
      once: !replay,
      onEnter: () =>
        gsap.to(el, { ...shown, duration: 1.4, ease: 'power2.out', overwrite: true }),
      onLeaveBack: replay ? () => gsap.to(el, { ...hidden, ...HIDE }) : undefined,
    });
  });
}

/* ── magnetic buttons (desktop) ────────────────────────────── */
function magneticButtons() {
  document.querySelectorAll<HTMLElement>('.btn').forEach((btn) => {
    const xTo = gsap.quickTo(btn, 'x', { duration: 0.4, ease: 'power3.out' });
    const yTo = gsap.quickTo(btn, 'y', { duration: 0.4, ease: 'power3.out' });
    btn.addEventListener('mousemove', (e) => {
      if (motionDisabled) return;
      const r = btn.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      xTo(dx * 5);
      yTo(dy * 3);
    });
    btn.addEventListener('mouseleave', () => {
      xTo(0);
      yTo(0);
    });
  });
}

/* ── smooth scroll (desktop) ───────────────────────────────── */
async function initSmoothScroll() {
  const { default: Lenis } = await import('lenis');
  if (motionDisabled) return;
  const instance = new Lenis({ duration: 1.1, anchors: true, autoRaf: true });
  instance.on('scroll', ScrollTrigger.update);
  lenis = instance;
}

/* ── boot / teardown ───────────────────────────────────────── */
function neutralizeMotion() {
  motionDisabled = true;
  ScrollTrigger.getAll().forEach((st) => st.kill());
  gsap.killTweensOf('*');
  gsap.set(
    ['.reveal', '.reveal-scale', '.split-line', '.btn', '[data-hero-line]', '[data-hero-rise]', '[data-hero-media]'],
    { clearProps: 'all' }
  );
  lenis?.destroy();
  lenis = undefined;
  releaseGuard();
}

if (reduced) {
  releaseGuard();
} else {
  heroIntro();
  scrollReveals();
  splitHeadings();
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  if (desktop) {
    magneticButtons();
    initSmoothScroll();
  }
  window
    .matchMedia('(prefers-reduced-motion: reduce)')
    .addEventListener('change', (e) => e.matches && neutralizeMotion());
}
