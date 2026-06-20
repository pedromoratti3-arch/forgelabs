'use client';

import { motion } from 'framer-motion';
import { RevealText } from '@/components/ui/RevealText';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { useEntered } from '@/components/AppShell';
import { EASE } from '@/lib/constants';

/**
 * 01 — HERO · "Massa Central".
 *
 * The living rosa mass (global Canvas, z-0) stays exactly where it is — this file only
 * builds the UI layer on top of it: a centred lock-up (label · title · subtitle · CTA)
 * that reads OVER the matter, with a soft radial darkening seated between the canvas and
 * the text for legibility. Nothing here touches the 3D / shader / store.
 *
 * Type: Clash Display (title) + Satoshi (body/CTA) + JetBrains Mono (label).
 */
export function Hero() {
  const play = useEntered();

  const riseParent = {
    hidden: {},
    visible: { transition: { delayChildren: 0.75, staggerChildren: 0.1 } },
  };
  const rise = {
    hidden: { opacity: 0, y: 22 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE.expo } },
  };

  return (
    <section
      id="hero"
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden text-center"
    >
      {/* legibility — a soft radial darkening BEHIND the text (above the canvas, below the
          copy) so the matter stays visible while the text reads cleanly over it. Fades in
          with the hero so the preloader particle show still plays on pure black. */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 transition-opacity duration-1000 ease-expo ${
          play ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background:
            'radial-gradient(ellipse 58% 52% at 50% 46%, rgba(13,10,12,0.62) 0%, rgba(13,10,12,0.28) 46%, rgba(13,10,12,0) 72%)',
        }}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center px-margin">
        {/* eyebrow — mono label + short rosa rule, centred */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={play ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4, duration: 0.8, ease: EASE.expo }}
          className="mb-7 flex flex-col items-center gap-3"
        >
          <span className="font-mono text-[0.8rem] uppercase tracking-[0.25em] text-primary">
            Estúdio de produtos digitais
          </span>
          <span className="h-px w-10 bg-primary" />
        </motion.div>

        {/* title — Clash Display, one continuous phrase, a SINGLE rosa accent, masked reveal */}
        <RevealText
          as="h1"
          play={play}
          delay={0.5}
          className="font-display font-bold leading-[1.0] tracking-[-0.02em] text-ice text-[clamp(2.75rem,7vw,7rem)] [text-shadow:0_2px_30px_rgba(0,0,0,0.45)]"
          lineClassName="pb-[0.04em]"
          lines={[
            <>Forjamos o digital</>,
            <>
              em algo <span className="text-primary">memorável</span>.
            </>,
          ]}
        />

        {/* subtitle + CTAs */}
        <motion.div
          variants={riseParent}
          initial="hidden"
          animate={play ? 'visible' : 'hidden'}
          className="flex flex-col items-center"
        >
          <motion.p
            variants={rise}
            className="mt-8 max-w-[620px] font-sans text-[clamp(1.05rem,1.6vw,1.35rem)] font-normal leading-[1.5] text-muted"
          >
            Sites e landing pages sob medida — da ideia bruta ao produto polido, de alto padrão.
          </motion.p>

          {/* ONE primary CTA (rosa, pulsing halo) + a discreet secondary text link below */}
          <motion.div variants={rise} className="mt-11 flex flex-col items-center gap-6">
            <span className="cta-halo relative inline-block">
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

      {/* scroll indicator — discreet, at the foot of the hero */}
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={play ? { opacity: 1 } : {}}
        transition={{ delay: 1.4, duration: 1, ease: EASE.expo }}
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
      >
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.3em] text-muted">
          Scroll
        </span>
        <span className="h-8 w-px animate-scroll-pulse bg-gradient-to-b from-muted/70 to-transparent" />
      </motion.div>
    </section>
  );
}
