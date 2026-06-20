'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';
import { useReducedMotion } from './useReducedMotion';

interface MagneticOptions {
  /** how strongly the element follows the cursor (0..1). Briefing default ~0.3 */
  strength?: number;
  /** spring back stiffness/damping feel via gsap duration */
  ease?: string;
}

/**
 * Magnetic hover: the element drifts toward the cursor while hovered and springs
 * back on leave. Implemented with gsap.quickTo for per-frame buttery interpolation
 * (no React re-renders). Disabled under reduced-motion and on coarse pointers.
 *
 * Returns a ref to spread onto the target element.
 *
 *   const ref = useMagnetic<HTMLButtonElement>({ strength: 0.3 });
 *   <button ref={ref}>…</button>
 */
export function useMagnetic<T extends HTMLElement>({
  strength = 0.3,
  ease = 'power3.out',
}: MagneticOptions = {}) {
  const ref = useRef<T>(null);
  const reduced = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect reduced-motion and touch devices — no magnetism there.
    const fine = window.matchMedia('(pointer: fine)').matches;
    if (reduced || !fine) return;

    // quickTo gives us a primed tween we can re-fire every mousemove cheaply.
    const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease });

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const relX = e.clientX - (rect.left + rect.width / 2);
      const relY = e.clientY - (rect.top + rect.height / 2);
      xTo(relX * strength);
      yTo(relY * strength);
    };

    const onLeave = () => {
      xTo(0);
      yTo(0);
    };

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [strength, ease, reduced]);

  return ref;
}
