'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect';
import { useScene } from '@/components/providers/SceneProvider';

/**
 * Scroll-driven section transitions that touch the 3D mass / global veils. Per-section
 * gestures (the manifesto mask, the serviços grid) live in those components.
 * Everything here is SCRUBBED (tied to scroll, never time) and ATTACHED to a
 * ScrollTrigger so the start/reverse states are handled correctly.
 *
 * ── HERO → MANIFESTO · "O resfriamento" ──────────────────────────────────────────
 * As the hero scrolls out, the incandescent mass cools: it dims, shrinks and slides up
 * out of frame (driven via `store.cool`, read by ForgeEntity), and a cooler veil fades
 * in over the canvas. Reduced-motion users just get the plain scroll.
 *
 * Tunables: the trigger `end` (how much scroll the cooling spans) and the veil opacity.
 */
export function SectionTransitions() {
  const store = useScene();
  const coolVeil = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const s = store.current;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: '#hero', start: 'top top', end: 'center top', scrub: 1 },
      });
      // cooling completes by the time the hero half-leaves; both drive in parallel
      tl.fromTo(s, { cool: 0 }, { cool: 1, ease: 'none' }, 0);
      if (coolVeil.current) {
        tl.fromTo(coolVeil.current, { opacity: 0 }, { opacity: 0.55, ease: 'none' }, 0);
      }
    });

    const refresh = () => ScrollTrigger.refresh();
    const t = window.setTimeout(refresh, 1200);
    document.fonts?.ready.then(() => window.setTimeout(refresh, 200));
    return () => {
      window.clearTimeout(t);
      ctx.revert();
      s.cool = 0;
    };
  }, [store]);

  return (
    <div
      ref={coolVeil}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[2]"
      style={{
        opacity: 0,
        background:
          'radial-gradient(130% 95% at 50% 32%, rgba(16,22,44,0) 0%, rgba(7,10,22,0.6) 100%)',
      }}
    />
  );
}
