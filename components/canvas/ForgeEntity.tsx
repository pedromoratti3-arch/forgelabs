'use client';

import { useMemo, useRef, type MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { forgeVertexShader, forgeFragmentShader } from './shaders/forge';
import { COLORS } from '@/lib/constants';
import { damp, type SceneStore, type Quality } from '@/lib/sceneStore';

/** Icosphere subdivision per quality tier. */
const DETAIL: Record<Quality, number> = { high: 26, med: 18, low: 12 };

interface ForgeEntityProps {
  store: MutableRefObject<SceneStore>;
  quality: Quality;
}

/**
 * The persistent entity: a molten metal mass that churns via the forge shader and
 * reacts to pointer + scroll. This is phase 0 (HERO) of its journey; the same mesh
 * will later cristallize / open / polish as `uMorph` is driven by scroll.
 */
export function ForgeEntity({ store, quality }: ForgeEntityProps) {
  const mesh = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.ShaderMaterial>(null);

  const geometry = useMemo(
    () => new THREE.IcosahedronGeometry(1, DETAIL[quality]),
    [quality],
  );

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAmp: { value: 0.36 },
      uFreq: { value: 0.85 },
      uMorph: { value: 0 },
      uReveal: { value: 0 },
      uCool: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uFresnelPower: { value: 3.0 },
      uColorA: { value: new THREE.Color(COLORS.primary) },
      uColorB: { value: new THREE.Color(COLORS.accent) },
      uBase: { value: new THREE.Color(COLORS.base) },
    }),
    [],
  );

  useFrame((_, delta) => {
    const s = store.current;
    // clamp delta so a tab refocus can't fling the animation
    const dt = Math.min(delta, 1 / 30);
    const reduced = s.reducedMotion;

    if (mat.current) {
      const u = mat.current.uniforms;
      // advance time slowly under reduced motion
      u.uTime.value += dt * (reduced ? 0.15 : 1);
      // hero phase only uses 0..1 of the morph range; later sections remap the rest
      u.uMorph.value = Math.min(s.morph, 1);
      u.uReveal.value = s.reveal;
      u.uCool.value = s.cool;
      (u.uMouse.value as THREE.Vector2).set(s.pointer.x, s.pointer.y);
    }

    if (mesh.current) {
      // grow into being as it's revealed; then shrink + slide up out of frame as the
      // hero scrolls out and the mass "cools" (HERO → MANIFESTO transition).
      const sc = 1.2 * (0.72 + 0.28 * s.reveal) * (1 - 0.5 * s.cool);
      mesh.current.scale.setScalar(sc);
      mesh.current.position.y = s.cool * 2.8;

      if (!reduced) {
        // mouse-reactive WITHOUT displacing: it leans (rotates) toward the cursor and
        // bulges toward it (shader uMouse) — but its centre stays fixed on screen.
        mesh.current.rotation.y = damp(mesh.current.rotation.y, s.pointer.x * 0.55, 4.5, dt) + dt * 0.04;
        mesh.current.rotation.x = damp(mesh.current.rotation.x, -s.pointer.y * 0.38, 4.5, dt);
      }
    }
  });

  return (
    // centred — the hero copy reads over it thanks to the legibility veil
    <mesh ref={mesh} geometry={geometry} scale={1.2}>
      <shaderMaterial
        ref={mat}
        vertexShader={forgeVertexShader}
        fragmentShader={forgeFragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}
