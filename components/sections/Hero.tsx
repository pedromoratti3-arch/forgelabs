'use client';

import { motion } from 'framer-motion';
import { RevealText } from '@/components/ui/RevealText';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { useEntered } from '@/components/AppShell';
import { EASE } from '@/lib/constants';

/**
 * 01 — HERO. The persistent forge mass (rendered by the global Canvas) sits behind
 * this content, weighted to the right. Title reveals line-by-line with a mask the
 * moment the curtain lifts; subtitle + CTAs rise in ~0.6s later. Deliberately spacious.
 */
export function Hero() {
  const play = useEntered();

  const riseParent = {
    hidden: {},
    visible: { transition: { delayChildren: 0.6, staggerChildren: 0.08 } },
  };
  const rise = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 1, ease: EASE.expo } },
  };

  return (
    <section
      id="hero"
      className="relative flex min-h-[100svh] items-center overflow-hidden"
    >
      {/* legibility veils — seat the text without hiding the mass. Hidden during the
          preloader (so the particle show reads on pure black), fade in with the hero. */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 bg-gradient-to-r from-base via-base/70 to-transparent transition-opacity duration-1000 ease-expo ${
          play ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 bg-gradient-to-t from-base/80 via-transparent to-base/30 transition-opacity duration-1000 ease-expo ${
          play ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <div className="relative z-10 mx-auto w-full max-w-grid px-margin">
        {/* eyebrow — rosa rule + mono label (more presence than thin rosa text) */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={play ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.35, duration: 0.9, ease: EASE.expo }}
          className="mb-6 flex items-center gap-3.5"
        >
          <span className="h-px w-9 bg-primary" />
          <span className="font-mono text-label uppercase text-ice/75">
            Estúdio de produtos digitais
          </span>
        </motion.div>

        {/* title — masked line reveal */}
        <RevealText
          as="h1"
          play={play}
          delay={0.45}
          className="max-w-[17ch] font-display text-hero text-ice"
          lineClassName="pb-[0.06em]"
          lines={[
            <>
              Moldamos o digital <span className="text-primary">bruto</span>
            </>,
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
          className="mt-8 flex max-w-lg flex-col gap-7"
        >
          <motion.p variants={rise} className="font-sans text-lead text-muted">
            Sites e landing pages sob medida — da ideia bruta ao produto polido, de alto padrão.
          </motion.p>

          <motion.div variants={rise} className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <MagneticButton href="#contato" variant="solid" arrow>
              Iniciar projeto
            </MagneticButton>
            <MagneticButton href="#portfolio" variant="ghost" arrow>
              Ver trabalhos
            </MagneticButton>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
