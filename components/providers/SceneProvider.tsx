'use client';

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
  type MutableRefObject,
} from 'react';
import { createSceneStore, type SceneStore } from '@/lib/sceneStore';

/**
 * Provides the single mutable scene store to the whole tree and wires the global
 * inputs that drive the persistent 3D entity: pointer position, reduced-motion and
 * an initial GPU-quality guess. Everything is written onto a ref — zero re-renders.
 */

const SceneContext = createContext<MutableRefObject<SceneStore> | null>(null);

export function SceneProvider({ children }: { children: ReactNode }) {
  const store = useRef<SceneStore>(createSceneStore());

  // ── reduced motion + coarse quality heuristic ────────────────────────────────
  useEffect(() => {
    const s = store.current;

    const motionMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const applyMotion = () => {
      s.reducedMotion = motionMq.matches;
    };
    applyMotion();
    motionMq.addEventListener('change', applyMotion);

    // Cheap, synchronous quality tier. PerformanceMonitor inside the Canvas refines
    // this at runtime; this just sets a sane starting geometry/particle budget.
    const cores = navigator.hardwareConcurrency ?? 4;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const dpr = window.devicePixelRatio ?? 1;
    s.coarse = coarse; // no cursor → the mass self-animates (see ForgeEntity)
    if (coarse || cores <= 4) s.quality = 'low';
    else if (cores <= 8 || dpr > 2) s.quality = 'med';
    else s.quality = 'high';

    return () => motionMq.removeEventListener('change', applyMotion);
  }, []);

  // ── global pointer tracking (position + SPEED) ────────────────────────────────
  useEffect(() => {
    const s = store.current;
    let lastX = 0;
    let lastY = 0;
    let primed = false;

    const onMove = (e: PointerEvent) => {
      // pixels — consumed by the DOM cursor
      s.pointerPx.x = e.clientX;
      s.pointerPx.y = e.clientY;
      // normalized -1..1 — consumed by the 3D entity for parallax / rotation
      s.pointerTarget.x = (e.clientX / window.innerWidth) * 2 - 1;
      s.pointerTarget.y = -((e.clientY / window.innerHeight) * 2 - 1);

      // cursor SPEED → fluid distortion. Accumulate normalized px/frame into a 0..1
      // value; SceneDriver dissipates it (~0.95/frame), so fast flicks spike the
      // perturbation and it relaxes smoothly when the cursor slows/stops.
      if (primed) {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        const speed = Math.hypot(dx, dy);
        s.pointerVel = Math.min(1, s.pointerVel + speed * 0.012);
      }
      lastX = e.clientX;
      lastY = e.clientY;
      primed = true;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  return <SceneContext.Provider value={store}>{children}</SceneContext.Provider>;
}

/**
 * Access the shared scene store ref. Stable across renders — read/write its fields
 * inside useFrame (in-Canvas) or rAF loops (DOM) rather than via React state.
 */
export function useScene(): MutableRefObject<SceneStore> {
  const ctx = useContext(SceneContext);
  if (!ctx) throw new Error('useScene must be used within <SceneProvider>');
  return ctx;
}
