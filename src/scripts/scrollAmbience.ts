// scrollAmbience.ts
// Dynamic ambient lighting: shifts radial gradient anchors as user scrolls.
// Updates CSS custom properties on :root — works with body::before in global.css.
// Creates the sensation of content moving through a field, not a filter painted onto it.

export function initScrollAmbience(): void {
  if (typeof window === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const root = document.documentElement;
  let ticking = false;

  function update(): void {
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const p = maxScroll > 0 ? Math.max(0, Math.min(1, window.scrollY / maxScroll)) : 0;

    // Anchor 1: top-left drifts right and down as you scroll
    const a1x = Math.round(13 + p * 24);
    const a1y = Math.round(18 + p * 30);

    // Anchor 2: bottom-right drifts left and up
    const a2x = Math.round(87 - p * 24);
    const a2y = Math.round(82 - p * 20);

    root.style.setProperty('--amb-a1x', `${a1x}%`);
    root.style.setProperty('--amb-a1y', `${a1y}%`);
    root.style.setProperty('--amb-a2x', `${a2x}%`);
    root.style.setProperty('--amb-a2y', `${a2y}%`);

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  update();
}
