'use client';

/**
 * Animated film grain over the whole site (~4% opacity, no blend mode).
 * The heavy lifting lives in globals.css (`.grain`) — an inline SVG fractal-noise
 * texture drifting via transform (compositor-only). Disabled under prefers-reduced-motion.
 */
export function GrainOverlay() {
  return <div aria-hidden="true" className="grain pointer-events-none z-[55]" />;
}
