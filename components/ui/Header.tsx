'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { EASE } from '@/lib/constants';
import { useEntered } from '@/components/AppShell';
import { MagneticButton } from './MagneticButton';

const NAV = [
  { label: 'Manifesto', href: '#manifesto' },
  { label: 'Serviços', href: '#servicos' },
  { label: 'Portfólio', href: '#portfolio' },
  { label: 'Processo', href: '#processo' },
  { label: 'Contato', href: '#contato' },
];

/** Slim fixed header — Forgelabs logo + nav + CTA. Fades in on enter. */
export function Header() {
  const play = useEntered();
  const [scrolled, setScrolled] = useState(false);

  // Give the header a frosted base background once scrolled past the hero, so section
  // content reads cleanly as it passes underneath (no text-on-text with the wordmark).
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={play ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: 0.9, duration: 1, ease: EASE.expo }}
      className={`fixed inset-x-0 top-0 z-[80] transition-colors duration-500 ease-expo ${
        scrolled ? 'border-b border-line bg-base/70 backdrop-blur-md' : 'border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-grid items-center justify-between px-margin py-6">
        {/* logo */}
        <a href="#hero" data-cursor="hover" aria-label="Forgelabs — início" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="Forgelabs" className="h-7 w-auto select-none" draggable={false} />
        </a>

        {/* nav */}
        <nav className="hidden items-center gap-9 md:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              data-cursor="hover"
              className="group relative font-sans text-sm text-muted transition-colors duration-300 hover:text-ice"
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-primary transition-all duration-300 ease-expo group-hover:w-full" />
            </a>
          ))}
        </nav>

        <MagneticButton href="#contato" variant="solid" className="!px-5 !py-2.5 !text-sm">
          Iniciar projeto
        </MagneticButton>
      </div>
    </motion.header>
  );
}
