'use client';

/**
 * Animated film grain over the whole site (~5% opacity, soft-light blend).
 * The heavy lifting lives in globals.css (`.grain`) — an inline SVG fractal-noise
 * texture flickered via a stepped keyframe. Disabled under prefers-reduced-motion.
 */
export function GrainOverlay() {
  return (
    <div
      aria-hidden="true"
      className="grain pointer-events-none z-[55]"
    />
  );
}
