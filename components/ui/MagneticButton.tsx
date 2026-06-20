'use client';

import { motion } from 'framer-motion';
import { type ReactNode } from 'react';
import { useMagnetic } from '@/hooks/useMagnetic';

interface MagneticButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'solid' | 'outline' | 'ghost';
  arrow?: boolean;
  className?: string;
  ariaLabel?: string;
}

/**
 * Magnetic CTA. The outer wrapper carries the gsap-driven magnetic translate; the
 * inner motion element handles the hover micro-interaction. Three deliberately
 * restrained styles (no generic full-pill): a soft-cornered solid, a hairline
 * outline, and a boxless "ghost" with an incandescent underline.
 */
export function MagneticButton({
  children,
  href,
  onClick,
  type = 'button',
  variant = 'solid',
  arrow = false,
  className = '',
  ariaLabel,
}: MagneticButtonProps) {
  const wrap = useMagnetic<HTMLSpanElement>({ strength: 0.3 });

  const isGhost = variant === 'ghost';

  const base = isGhost
    ? 'group relative inline-flex items-center gap-2 font-sans text-[0.95rem] font-medium text-ice'
    : 'group relative inline-flex items-center gap-2.5 rounded-[10px] px-7 py-4 font-sans text-[0.95rem] font-medium tracking-tight';

  const styles =
    variant === 'solid'
      ? 'bg-primary text-ice transition-colors duration-300 ease-expo hover:bg-accent'
      : variant === 'outline'
        ? 'border border-ice/15 text-ice transition-colors duration-300 ease-expo hover:border-ice/40'
        : '';

  const inner = (
    <motion.span
      className={`${base} ${styles} ${className}`}
      whileHover={{ scale: isGhost ? 1 : 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 150, damping: 15 }}
    >
      {children}
      {arrow && (
        <span
          aria-hidden="true"
          className="inline-block translate-x-0 transition-transform duration-300 ease-expo group-hover:translate-x-1"
        >
          →
        </span>
      )}
      {isGhost && (
        <span className="absolute -bottom-1 left-0 h-px w-0 bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-expo group-hover:w-full" />
      )}
    </motion.span>
  );

  return (
    <span ref={wrap} className="inline-block will-change-transform" data-cursor="hover">
      {href ? (
        <a href={href} aria-label={ariaLabel} className="inline-block">
          {inner}
        </a>
      ) : (
        <button type={type} onClick={onClick} aria-label={ariaLabel} className="inline-block">
          {inner}
        </button>
      )}
    </span>
  );
}
