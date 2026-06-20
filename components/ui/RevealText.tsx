'use client';

import { motion } from 'framer-motion';
import { type ReactNode, type ElementType } from 'react';
import { EASE, REVEAL } from '@/lib/constants';

/**
 * Masked line reveal — each line sits in an overflow-hidden box and rises from
 * y:110% → 0 with a staggered expo-out, exactly as specified in the briefing.
 * Pass `play` to trigger (e.g. after the preloader curtain). Lines can be rich
 * nodes so a highlighted word can be wrapped in <span className="text-primary">.
 *
 * The semantic tag (`as`, e.g. h1) is rendered plainly for SEO/a11y; motion lives
 * on the inner spans, so no dynamic motion-factory is needed.
 */

interface RevealTextProps {
  lines: ReactNode[];
  play: boolean;
  as?: ElementType;
  className?: string;
  lineClassName?: string;
  /** initial delay before the first line (s) */
  delay?: number;
}

export function RevealText({
  lines,
  play,
  as: TagProp = 'div',
  className,
  lineClassName,
  delay = 0,
}: RevealTextProps) {
  // `as` is polymorphic; cast relaxes TS's children inference for arbitrary tags.
  const Tag = TagProp as React.ElementType<{ className?: string; children?: ReactNode }>;
  return (
    <Tag className={className}>
      {lines.map((node, i) => (
        <span key={i} className="block overflow-hidden">
          <motion.span
            className={`block will-change-transform ${lineClassName ?? ''}`}
            initial={{ y: '110%' }}
            animate={play ? { y: '0%' } : { y: '110%' }}
            transition={{
              duration: REVEAL.duration,
              ease: EASE.expo,
              delay: delay + i * REVEAL.stagger,
            }}
          >
            {node}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
