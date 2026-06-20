'use client';

import { useState } from 'react';

/**
 * Animated film grain over the whole site (~4% opacity, no blend mode).
 * The heavy lifting lives in globals.css (`.grain`) — an inline SVG fractal-noise
 * texture drifting via transform. Disabled under prefers-reduced-motion.
 */
export function GrainOverlay() {
  // TEMP DIAGNOSTIC — ?grain=0 removes the overlay so the live site can test whether
  // the grain layer is what makes the canvas flicker. Remove after diagnosis.
  const [show] = useState(
    () =>
      typeof window === 'undefined' ||
      new URLSearchParams(window.location.search).get('grain') !== '0',
  );
  if (!show) return null;

  return (
    <div
      aria-hidden="true"
      className="grain pointer-events-none z-[55]"
    />
  );
}
