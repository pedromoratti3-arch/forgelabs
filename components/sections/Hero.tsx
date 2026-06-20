'use client';

import { motion } from 'framer-motion';
import { RevealText } from '@/components/ui/RevealText';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { useEntered } from '@/components/AppShell';
import { useScene } from '@/components/providers/SceneProvider';
import { EASE } from '@/lib/constants';

/**
 * 01 — HERO. The living forge mass (global Canvas) sits BEHIND this content, weighted
 * to the centre-right. Layout is intentionally asymmetric: the copy is anchored to the
 * bottom-left while the matter dominates the rest of the frame.
 *
 * Reaction wiring: hovering the primary CTA writes `ctaHoverTarget` to the scene store,
 * which the mass reads (uReact) to flare its inner glow and accelerate its ripples.
 */
export function Hero() {
  const play = useEntered();
  const store = useScene();

  const riseParent = {
    hidden: {},
    visible: { transition: { delayChildren: 0.6, staggerChildren: 0.08 } },
  };
  const rise = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 1, ease: EASE.expo } },
  };

  // mode-3 trigger: tell the mass to "wake" while the cursor is on the primary CTA
  const wake = (on: boolean) => () => {
    store.current.ctaHoverTarget = on ? 1 : 0;
  };

  return (
    <section
      id="hero"
      className="relative flex min-h-[100svh] items-end overflow-hidden"
    >
      {/* legibility veils — seat the text without hiding the mass. Strong on the left
          (where the copy lives) and along the bottom; fade in with the hero. */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 bg-gradient-to-r from-base via-base/75 to-transparent transition-opacity duration-1000 ease-expo ${
          play ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 bg-gradient-to-t from-base via-base/40 to-transparent transition-opacity duration-1000 ease-expo ${
          play ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <div className="relative z-10 mx-auto w-full max-w-grid px-margin pb-[12vh] pt-32 lg:pb-[14vh]">
        {/* eyebrow — rosa rule + mono label */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={play ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.35, duration: 0.9, ease: EASE.expo }}
          className="mb-7 flex items-center gap-3.5"
        >
          <span className="h-px w-9 bg-primary" />
          <span className="font-mono text-label uppercase tracking-[0.25em] text-ice/75">
            Estúdio de produtos digitais
          </span>
        </motion.div>

        {/* title — one continuous phrase, a SINGLE rosa accent, masked line reveal */}
        <RevealText
          as="h1"
          play={play}
          delay={0.45}
          className="max-w-[20ch] font-display font-bold leading-[0.98] tracking-[-0.02em] text-ice text-[clamp(2.5rem,6vw,6rem)]"
          lineClassName="pb-[0.04em]"
          lines={[
            <>Moldamos o digital bruto</>,
            <>
              em produtos <span className="text-primary">memoráveis</span>.
            </>,
          ]}
        />

        {/* subtitle + CTAs */}
        <motion.div
          variants={riseParent}
          initial="hidden"
          animate={play ? 'visible' : 'hidden'}
          className="mt-9 flex max-w-md flex-col gap-9"
        >
          <motion.p variants={rise} className="font-sans text-lead text-muted">
            Sites e landing pages sob medida. Da ideia bruta ao produto final, de alto padrão.
          </motion.p>

          {/* ONE primary CTA + a discreet secondary text link (no twin buttons) */}
          <motion.div variants={rise} className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:gap-9">
            <span
              className="cta-halo relative inline-block"
              onMouseEnter={wake(true)}
              onMouseLeave={wake(false)}
            >
              <MagneticButton href="#contato" variant="solid" arrow>
                Iniciar projeto
              </MagneticButton>
            </span>
            <MagneticButton href="#portfolio" variant="ghost" arrow>
              Ver trabalhos
            </MagneticButton>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
