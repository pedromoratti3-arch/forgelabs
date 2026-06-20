'use client';

import { useRef, useState } from 'react';
import gsap from 'gsap';
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect';
import { useScene } from '@/components/providers/SceneProvider';

const NAME = 'Forgelabs';

/**
 * THE FORGE PRELOADER — one continuous particle gesture.
 *
 *   1. Particles fade in SCATTERED (varied directions / sizes).
 *   2. They CONVERGE, filling the anvil silhouette ("as bolas preenchendo a forja").
 *   3. As the anvil forms, the name "Forgelabs" enters below it, LETTER BY LETTER.
 *   4. A clean TRANSFORM: the name exits and the anvil-of-particles becomes the hero's
 *      rosa mass (the real 3D mass fades in beneath, particles fuse out) → hero reveals.
 *
 * The cloud + mass live in the persistent <Canvas> (ForgeParticles / ForgeEntity);
 * this is the GSAP master timeline driving the shared store + the name.
 *
 * ── TUNE the feel via the durations / easings below (all labelled). ──
 */
export function AnvilForge({ onComplete }: { onComplete: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const store = useScene();
  const [hidden, setHidden] = useState(false);

  useIsomorphicLayoutEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const s = store.current;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true });

      if (reduced) {
        gsap.set('.fl-letter', { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' });
        tl.to(s, { particleAlpha: 1, duration: 0.3 })
          .to(s, { pFill: 1, duration: 0.5, ease: 'power2.out' })
          .to('.fl-name', { opacity: 0, duration: 0.3 })
          .to(s, { pMorph: 1, duration: 0.5, ease: 'power2.out' })
          .add(() => { s.revealTarget = 1; }, '<')
          .to(s, { particleAlpha: 0, duration: 0.4 })
          .add(() => { onComplete(); s.entered = true; })
          .add(() => setHidden(true), '>+0.1');
      } else {
        // name hidden until the anvil forms — letters "materialise" (blur + rise)
        gsap.set('.fl-letter', { opacity: 0, y: 38, filter: 'blur(12px)', scale: 0.8 });

        // 1 — particles fade in fast, scattered
        tl.to(s, { particleAlpha: 1, duration: 0.25, ease: 'power1.out' });

        // 2 — CONVERGE from the very first frame (power2.out = active start, no slow
        //     lead-in) so the effect kicks off the instant the cloud is ready.
        tl.to(s, { pFill: 1, duration: 2.2, ease: 'power2.out' }, '<');

        // 3 — NAME enters LETTER BY LETTER as the anvil completes (materialise in)
        tl.to(
          '.fl-letter',
          {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: 'blur(0px)',
            duration: 0.8,
            stagger: 0.075,
            ease: 'power4.out',
          },
          '>-0.5',
        );
        // hold the formed anvil + name a beat
        tl.to({}, { duration: 0.6 });

        // 4 — name exits up, then CLEAN TRANSFORM anvil → hero mass
        tl.to('.fl-name', { opacity: 0, y: -14, duration: 0.4, ease: 'power2.in' });
        tl.to(s, { pMorph: 1, duration: 1.15, ease: 'expo.out' }, '>-0.1');
        tl.add(() => { s.revealTarget = 1; }, '<'); // mass grows + brightens at same spot
        tl.to(s, { particleAlpha: 0, duration: 0.6, ease: 'power2.in' }, '>-0.55');
        tl.add(() => { onComplete(); s.entered = true; }, '>-0.25'); // hero UI ~200ms early
        tl.add(() => setHidden(true), '>+0.2');
      }

      // Start once the silhouette has been sampled, with a safety timeout so we never
      // hang. The `started` guard makes the sequence run EXACTLY ONCE — previously the
      // ready-check AND the safety timeout could both fire (the timeout landed mid-run
      // and restarted the timeline), which played the whole animation twice.
      let started = false;
      const start = () => {
        if (started) return;
        started = true;
        tl.play(0);
      };
      if (s.particlesReady) start();
      else {
        const check = () => {
          if (s.particlesReady) {
            gsap.ticker.remove(check);
            start();
          }
        };
        gsap.ticker.add(check);
        gsap.delayedCall(5, () => {
          gsap.ticker.remove(check);
          start();
        });
      }
    }, root);

    return () => ctx.revert();
    // run once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (hidden) return null;

  return (
    // transparent — the show is the particle cloud in the Canvas behind. This layer
    // blocks interaction during the intro and carries the name lock-up.
    <div ref={root} className="fixed inset-0 z-[100]" aria-hidden="true">
      <div
        className="fl-name absolute left-1/2 -translate-x-1/2 whitespace-nowrap font-display text-[clamp(2.8rem,8vw,5.5rem)] font-bold leading-none tracking-[-0.025em] text-ice"
        // sits just below the particle anvil (the camera framing is viewport-independent)
        style={{ top: 'calc(50% + 25vh)', textShadow: '0 0 34px rgba(219,39,119,0.55)' }}
      >
        {NAME.split('').map((ch, i) => (
          // opacity:0 inline → hidden from the very first paint, before GSAP runs
          // (otherwise the name flashes in before the animation starts)
          <span key={i} className="fl-letter inline-block will-change-transform" style={{ opacity: 0 }}>
            {ch}
          </span>
        ))}
      </div>
    </div>
  );
}
