'use client';

import { useMemo, useRef, type MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { forgeVertexShader, forgeFragmentShader } from './shaders/forge';
import { COLORS } from '@/lib/constants';
import { damp, type SceneStore, type Quality } from '@/lib/sceneStore';

/** Icosphere subdivision per quality tier. */
const DETAIL: Record<Quality, number> = { high: 26, med: 18, low: 12 };

/* ──────────────────────────────────────────────────────────────────────────────
 * TUNABLES — the feel of the living matter. Safe to nudge.
 * ────────────────────────────────────────────────────────────────────────────── */
const FRESNEL_POWER = 2.6; // edge-glow tightness (lower = broader, softer halo)
const MOUSE_DISTORT = 1.0; // multiplier on cursor-speed → fluid distortion strength
const NOISE_SPEED = 1.0; // organic churn speed
const FOLLOW_AMOUNT = 0.16; // parallax follow distance in world units (kept small so the
//                             mass trails the cursor with inertia but never drifts off)
const ROTATE_TO_POINTER = 0.5; // how far the mass leans/rotates toward the cursor

interface ForgeEntityProps {
  store: MutableRefObject<SceneStore>;
  quality: Quality;
}

/**
 * The persistent entity: a molten metal mass that churns via the forge shader and
 * reacts to THREE stimuli (HERO phase):
 *   1. MOUSE — leans + parallax-follows the cursor (heavy inertia) and bulges/ripples
 *      toward it; faster cursor → stronger fluid distortion (uVel), relaxing on stop.
 *   2. SCROLL — `uCool` compresses, darkens and dims it as the hero scrolls out.
 *   3. CTA HOVER — `uReact` (store.ctaHover) makes the inner glow flare and the
 *      ripples accelerate, as if the matter wakes to be shaped.
 * No real cursor (touch/coarse) → it animates autonomously. Reduced-motion → minimal.
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
      uVel: { value: 0 },
      uReact: { value: 0 },
      uFresnelPower: { value: FRESNEL_POWER },
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
    const auto = s.coarse && !reduced; // mobile / no cursor → self-animate

    if (mat.current) {
      const u = mat.current.uniforms;
      u.uTime.value += dt * NOISE_SPEED * (reduced ? 0.15 : 1);
      const t = u.uTime.value;

      // hero phase only uses 0..1 of the morph range; later sections remap the rest
      u.uMorph.value = Math.min(s.morph, 1);
      u.uReveal.value = s.reveal;
      u.uCool.value = s.cool;

      if (auto) {
        // gentle autonomous orbit so the matter stays alive without a pointer
        (u.uMouse.value as THREE.Vector2).set(Math.cos(t * 0.3) * 0.45, Math.sin(t * 0.23) * 0.32);
        u.uVel.value = 0.1 + 0.1 * (0.5 + 0.5 * Math.sin(t * 0.7));
        u.uReact.value = s.ctaHover; // taps on the CTA still register on touch
      } else if (reduced) {
        (u.uMouse.value as THREE.Vector2).set(0, 0);
        u.uVel.value = 0;
        u.uReact.value = 0;
      } else {
        (u.uMouse.value as THREE.Vector2).set(s.pointer.x, s.pointer.y);
        u.uVel.value = s.pointerVel * MOUSE_DISTORT;
        u.uReact.value = s.ctaHover;
      }
    }

    if (mesh.current) {
      const m = mesh.current;

      // grow into being as it's revealed; shrink + slide up out of frame as it cools
      const sc = 1.2 * (0.72 + 0.28 * s.reveal) * (1 - 0.5 * s.cool);
      m.scale.setScalar(sc);

      // PARALLAX FOLLOW — trail the cursor with heavy inertia (store.follow is the
      // slow-eased pointer). Small amplitude → viscous lag without drifting off-screen.
      if (auto) {
        const t = mat.current ? mat.current.uniforms.uTime.value : 0;
        m.position.x = Math.cos(t * 0.3) * FOLLOW_AMOUNT;
        m.position.y = Math.sin(t * 0.23) * FOLLOW_AMOUNT + s.cool * 2.8;
      } else if (reduced) {
        m.position.set(0, s.cool * 2.8, 0);
      } else {
        m.position.x = s.follow.x * FOLLOW_AMOUNT;
        m.position.y = s.follow.y * FOLLOW_AMOUNT + s.cool * 2.8;
      }

      if (!reduced) {
        // lean toward the cursor (rotation only — centre handled by the small follow above)
        const tx = (auto ? Math.cos(mat.current!.uniforms.uTime.value * 0.3) * 0.45 : s.pointer.x);
        const ty = (auto ? Math.sin(mat.current!.uniforms.uTime.value * 0.23) * 0.32 : s.pointer.y);
        m.rotation.y = damp(m.rotation.y, tx * ROTATE_TO_POINTER, 4.5, dt) + dt * 0.04;
        m.rotation.x = damp(m.rotation.x, -ty * (ROTATE_TO_POINTER * 0.7), 4.5, dt);
      }
    }
  });

  return (
    // centred — the hero copy reads over it thanks to the legibility veil. frustumCulled
    // off because the displacement pushes vertices well beyond the base bounding sphere.
    <mesh ref={mesh} geometry={geometry} scale={1.2} frustumCulled={false}>
      <shaderMaterial
        ref={mat}
        vertexShader={forgeVertexShader}
        fragmentShader={forgeFragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}
