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
    if (coarse || cores <= 4) s.quality = 'low';
    else if (cores <= 8 || dpr > 2) s.quality = 'med';
    else s.quality = 'high';

    return () => motionMq.removeEventListener('change', applyMotion);
  }, []);

  // ── global pointer tracking ──────────────────────────────────────────────────
  useEffect(() => {
    const s = store.current;
    const onMove = (e: PointerEvent) => {
      // pixels — consumed by the DOM cursor
      s.pointerPx.x = e.clientX;
      s.pointerPx.y = e.clientY;
      // normalized -1..1 — consumed by the 3D entity for parallax / rotation
      s.pointerTarget.x = (e.clientX / window.innerWidth) * 2 - 1;
      s.pointerTarget.y = -((e.clientY / window.innerHeight) * 2 - 1);
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
