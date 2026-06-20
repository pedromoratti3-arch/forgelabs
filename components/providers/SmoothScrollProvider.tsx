'use client';

import { createContext, useContext, useRef, useState, type ReactNode } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect';
import { useScene } from './SceneProvider';
import { SECTIONS } from '@/lib/constants';

/**
 * Smooth scroll (Lenis) wired to GSAP ScrollTrigger, plus a single master trigger
 * that maps page progress → the scene store (`scrollTarget`, `morphTarget`).
 *
 * Lenis runs continuously from mount — we do NOT stop/start it. (An earlier version
 * stopped it during the preloader and tried to `.start()` later, but the start call
 * captured a stale ref and the page stayed scroll-locked. Running continuously is
 * simpler and robust: the preloader covers the screen anyway.)
 */

const LenisContext = createContext<Lenis | null>(null);
export const useLenis = () => useContext(LenisContext);

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const store = useScene();
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const lenisRef = useRef<Lenis | null>(null);

  useIsomorphicLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Always start at the top: the preloader plays from the hero, and a restored
    // scroll position would make ScrollTrigger compute the section transitions at the
    // wrong offset (leaving them stuck in their revealed state).
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);

    // lerp 0.10 — fluid but responsive (0.08 felt too slow/floaty in testing).
    const instance = new Lenis({
      lerp: 0.1,
      wheelMultiplier: 1,
      smoothWheel: true,
      syncTouch: false, // native momentum on touch; smoother on mobile
    });
    lenisRef.current = instance;
    setLenis(instance);

    // Keep ScrollTrigger in sync with Lenis' virtual scroll.
    instance.on('scroll', ScrollTrigger.update);

    // Drive Lenis from GSAP's ticker for a single, consistent rAF loop.
    const raf = (time: number) => instance.raf(time * 1000); // gsap = seconds, lenis = ms
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Master trigger: full-document progress → store.
    const master = ScrollTrigger.create({
      trigger: document.documentElement,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        store.current.scrollTarget = self.progress;
        // continuous phase across the 6 sections (0 → 5)
        store.current.morphTarget = self.progress * (SECTIONS.length - 1);
      },
    });

    return () => {
      master.kill();
      gsap.ticker.remove(raf);
      instance.off('scroll', ScrollTrigger.update);
      instance.destroy();
      lenisRef.current = null;
    };
  }, [store]);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
