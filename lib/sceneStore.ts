/**
 * The shared, mutable scene store — the spine of the "Material Bruto → Produto" idea.
 *
 * A single 3D entity persists across the whole site and is driven by this store.
 * We deliberately keep it OUTSIDE React state: scroll, pointer and lifecycle write
 * `*Target` fields; the render loop (useFrame) eases the live fields toward them and
 * reads them every frame. Nothing here triggers a React re-render — that is what keeps
 * the experience at 60fps.
 */

export type Quality = 'high' | 'med' | 'low';

export interface Vec2 {
  x: number;
  y: number;
}

export interface SceneStore {
  // ── targets (written by scroll / pointer / lifecycle) ───────────────────────
  /** overall page scroll progress, 0..1 */
  scrollTarget: number;
  /** continuous morph phase the entity evolves through (0 hero → 5 contato) */
  morphTarget: number;
  /** normalized pointer, -1..1 on each axis (0,0 = center) */
  pointerTarget: Vec2;
  /** 0 while the forge is "out of focus" during preload → 1 once the hero is revealed */
  revealTarget: number;
  /** 1 = embers scattered far (cold) → 0 = converged to the mass (preload intro) */
  convergenceTarget: number;

  // ── eased live values (read inside useFrame) ────────────────────────────────
  scroll: number;
  morph: number;
  pointer: Vec2;
  reveal: number;
  convergence: number;

  // ── section-transition scrub values (written by ScrollTriggers, read by the mass) ──
  /** 0 = hot hero mass → 1 = cooled, dimmed, slid out (HERO → MANIFESTO) */
  cool: number;

  // ── preloader particle sequence — driven DIRECTLY by the GSAP master timeline
  //    (not eased by SceneDriver) so the timings stay exact ──────────────────────
  /** 0 = particles scattered (varied directions) → 1 = converged, FILLING the anvil */
  pFill: number;
  /** 0 = at the anvil silhouette → 1 = transformed onto the 3D hero mass surface */
  pMorph: number;
  /** particle cloud opacity (fades in at the start, out as it becomes the solid mass) */
  particleAlpha: number;
  /** set true once the anvil silhouette has been sampled into particles */
  particlesReady: boolean;

  // ── raw pointer in pixels (consumed by the DOM cursor) ──────────────────────
  pointerPx: Vec2;
  /** whether the pointer is currently over an interactive element (cursor grows) */
  pointerActive: boolean;

  // ── environment ─────────────────────────────────────────────────────────────
  reducedMotion: boolean;
  quality: Quality;
  /** true once the preloader curtain has finished and the site is interactive */
  entered: boolean;
}

export function createSceneStore(): SceneStore {
  return {
    scrollTarget: 0,
    morphTarget: 0,
    pointerTarget: { x: 0, y: 0 },
    revealTarget: 0,
    convergenceTarget: 1,

    scroll: 0,
    morph: 0,
    pointer: { x: 0, y: 0 },
    reveal: 0,
    convergence: 1,

    cool: 0,

    pFill: 0,
    pMorph: 0,
    particleAlpha: 0,
    particlesReady: false,

    pointerPx: { x: 0, y: 0 },
    pointerActive: false,

    reducedMotion: false,
    quality: 'high',
    entered: false,
  };
}

/** Frame-rate-independent lerp factor. `lambda` ~ how fast (higher = snappier). */
export function damp(current: number, target: number, lambda: number, dt: number): number {
  return current + (target - current) * (1 - Math.exp(-lambda * dt));
}
