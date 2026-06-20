'use client';

import { Suspense, useEffect, useState, type MutableRefObject } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, ToneMapping, SMAA } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import { ForgeEntity } from './ForgeEntity';
import { ForgeParticles } from './ForgeParticles';
import { useScene } from '@/components/providers/SceneProvider';
import { damp, type SceneStore, type Quality } from '@/lib/sceneStore';

/**
 * Eases every "live" store field toward its target once per frame, BEFORE the
 * entity reads them. Registered first so consumers see fresh values.
 */
function SceneDriver({ store }: { store: MutableRefObject<SceneStore> }) {
  useFrame((_, delta) => {
    const s = store.current;
    const dt = Math.min(delta, 1 / 30);
    s.scroll = damp(s.scroll, s.scrollTarget, 4, dt);
    s.morph = damp(s.morph, s.morphTarget, 3, dt);
    s.reveal = damp(s.reveal, s.revealTarget, 3, dt);
    s.convergence = damp(s.convergence, s.convergenceTarget, 2.5, dt);
    s.pointer.x = damp(s.pointer.x, s.pointerTarget.x, 7, dt);
    s.pointer.y = damp(s.pointer.y, s.pointerTarget.y, 7, dt);
  });
  return null;
}

/**
 * The single persistent <Canvas>, fixed behind all content.
 *
 * Quality + dpr are resolved ONCE (client-only) and never change — no AdaptiveDpr /
 * PerformanceMonitor churn. Bloom gives the rosa incandescence; ToneMapping the colour
 * roll-off; SMAA the edges.
 */
export default function SceneCanvas() {
  const store = useScene();

  // Resolved a single time on the client (ssr:false guarantees window/navigator).
  const [{ quality, dpr }] = useState<{ quality: Quality; dpr: number }>(() => {
    const cores = navigator.hardwareConcurrency ?? 4;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const ratio = window.devicePixelRatio ?? 1;
    let q: Quality = 'high';
    if (coarse || cores <= 4) q = 'low';
    else if (cores <= 8 || ratio > 2) q = 'med';
    const cap = q === 'high' ? 1.6 : 1.25;
    return { quality: q, dpr: Math.min(ratio, cap) };
  });

  useEffect(() => {
    store.current.quality = quality;
  }, [store, quality]);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden="true"
      // promote the canvas to its own compositor layer so overlays above it never
      // force the browser to re-composite it (a flicker source on Intel iGPUs)
      style={{ transform: 'translateZ(0)', willChange: 'transform' }}
    >
      <Canvas
        dpr={dpr}
        camera={{ position: [0, 0, 5.2], fov: 35 }}
        // preserveDrawingBuffer keeps the last frame in the buffer between presents, so
        // the compositor can never grab a cleared / half-drawn buffer — this is the fix
        // for the intermittent "flash" flicker of WebGL canvases on Intel integrated GPUs.
        gl={{
          antialias: false,
          alpha: false,
          powerPreference: 'high-performance',
          preserveDrawingBuffer: true,
        }}
      >
        {/* the scene's own background — same as the site base, so the hero is seamless */}
        <color attach="background" args={['#0D0A0C']} />
        <Suspense fallback={null}>
          <SceneDriver store={store} />
          <ForgeEntity store={store} quality={quality} />
          {/* preloader particle cloud (anvil → shatter → mass). ~1500 on low/mobile. */}
          <ForgeParticles store={store} count={quality === 'low' ? 1500 : 4000} />

          <EffectComposer enableNormalPass={false} multisampling={0}>
            <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
            {/* luminanceSmoothing kept high (0.7): a wide soft knee keeps the glow
                temporally stable as the mass churns. Mass shader untouched. */}
            <Bloom
              intensity={0.8}
              luminanceThreshold={0.6}
              luminanceSmoothing={0.7}
              radius={0.65}
              mipmapBlur
            />
            <SMAA />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
}
