'use client';

import { useEffect, useRef } from 'react';
import { useScene } from '@/components/providers/SceneProvider';

/**
 * Custom cursor: a precise ice dot + a trailing ring that grows and glows rosa near
 * interactive elements. Reads the shared pointer (in px) from the store and runs its
 * own rAF loop — no React state per frame. Hidden entirely on coarse pointers.
 */
export function Cursor() {
  const store = useScene();
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    if (!fine) return; // mobile/touch keep the native cursor (there is none)

    document.body.classList.add('cursor-none');

    let rx = window.innerWidth / 2;
    let ry = window.innerHeight / 2;
    let scale = 1;
    let raf = 0;

    const loop = () => {
      const { x, y } = store.current.pointerPx;
      const active = store.current.pointerActive;

      // dot tracks exactly
      if (dot.current) {
        dot.current.style.opacity = '1';
        dot.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      }
      // ring eases behind and scales up when hovering something interactive
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      scale += ((active ? 1.9 : 1) - scale) * 0.18;
      if (ring.current) {
        ring.current.style.opacity = active ? '1' : '0.6';
        ring.current.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%) scale(${scale})`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // event-delegated interactive detection
    const sel = 'a, button, input, textarea, select, [data-cursor="hover"]';
    const over = (e: Event) => {
      if ((e.target as HTMLElement)?.closest?.(sel)) store.current.pointerActive = true;
    };
    const out = (e: Event) => {
      if ((e.target as HTMLElement)?.closest?.(sel)) store.current.pointerActive = false;
    };
    document.addEventListener('mouseover', over);
    document.addEventListener('mouseout', out);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('mouseover', over);
      document.removeEventListener('mouseout', out);
      document.body.classList.remove('cursor-none');
    };
  }, [store]);

  return (
    <>
      <div
        ref={ring}
        aria-hidden="true"
        style={{ opacity: 0 }}
        className="cursor-ring pointer-events-none fixed left-0 top-0 z-[120] hidden h-10 w-10 rounded-full border border-accent/60 will-change-transform md:block"
      />
      <div
        ref={dot}
        aria-hidden="true"
        style={{ opacity: 0 }}
        className="pointer-events-none fixed left-0 top-0 z-[120] hidden h-1.5 w-1.5 rounded-full bg-ice will-change-transform md:block"
      />
    </>
  );
}
