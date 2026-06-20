'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect';

const TEXT =
  'Toda marca memorável começa como matéria bruta. Nós forjamos essa matéria — lapidando cada detalhe, cada interação, cada milissegundo — até virar um produto digital que as pessoas não esquecem.';

/**
 * 02 — MANIFESTO.
 *
 * HERO → MANIFESTO transition (the manifesto's half): the whole block EMERGES from
 * below through a horizontal clip-path mask as the section enters — "as if the words
 * solidify as the matter cools" (scrubbed). Then the statement lights up word by word.
 *
 * Tunables: the mask trigger `end` (how fast it solidifies) and the rise distance.
 */
export function Manifesto() {
  const ref = useRef<HTMLParagraphElement>(null);
  const mask = useRef<HTMLDivElement>(null);
  const section = useRef<HTMLElement>(null);
  const words = TEXT.split(' ');

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    gsap.registerPlugin(ScrollTrigger);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      // word-by-word lighting (muted → ice), scrubbed
      const spans = el.querySelectorAll('.mf-word');
      gsap.fromTo(
        spans,
        { opacity: 0.16 },
        {
          opacity: 1,
          ease: 'none',
          stagger: 0.4,
          scrollTrigger: { trigger: el, start: 'top 78%', end: 'bottom 65%', scrub: true },
        },
      );

      // clip-path mask: the block EMERGES from below as the section enters viewport.
      // Attached to the ScrollTrigger (scrub) → correct covered/revealed states + reverse.
      if (!reduced && mask.current) {
        gsap.fromTo(
          mask.current,
          { clipPath: 'inset(100% 0% 0% 0%)', y: 34 },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            y: 0,
            ease: 'none',
            // use the SECTION element (not a string selector — gsap.context would scope
            // the string to `el` and resolve it to null)
            scrollTrigger: { trigger: section.current, start: 'top bottom', end: 'top 58%', scrub: 1 },
          },
        );
      }
    }, el);

    // recalc trigger positions once layout (and fonts) settle
    const refresh = () => ScrollTrigger.refresh();
    const t = window.setTimeout(refresh, 1200);
    document.fonts?.ready.then(() => window.setTimeout(refresh, 200));
    return () => {
      window.clearTimeout(t);
      ctx.revert();
    };
  }, []);

  return (
    <section ref={section} id="manifesto" className="relative scroll-mt-24 bg-base py-[20vh]">
      <div ref={mask} className="mx-auto max-w-grid px-margin will-change-transform">
        <p className="mb-12 font-mono text-label uppercase text-primary">Manifesto</p>
        <p
          ref={ref}
          className="max-w-5xl font-display text-[clamp(1.75rem,4vw,3.25rem)] font-medium leading-[1.28] text-ice"
        >
          {words.map((w, i) => (
            <span key={i} className="mf-word">
              {w}{' '}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
