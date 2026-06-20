'use client';

import { useMemo, useRef, type MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { emberVertexShader, emberFragmentShader } from './shaders/embers';
import { COLORS } from '@/lib/constants';
import { type SceneStore, type Quality } from '@/lib/sceneStore';

const COUNT: Record<Quality, number> = { high: 320, med: 180, low: 90 };

interface EmbersProps {
  store: MutableRefObject<SceneStore>;
  quality: Quality;
}

/**
 * Rosa embers orbiting the mass. Converge from a cold scatter during the preload
 * (driven by store.convergence) and flicker via the ember shader thereafter.
 */
export function Embers({ store, quality }: EmbersProps) {
  const points = useRef<THREE.Points>(null);
  const mat = useRef<THREE.ShaderMaterial>(null);
  const { gl } = useThree();

  const count = COUNT[quality];

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const speeds = new Float32Array(count);
    const seeds = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // even-ish distribution on a sphere shell
      const theta = Math.acos(2 * Math.random() - 1);
      const phi = Math.random() * Math.PI * 2;
      const r = 1.5 + Math.random() * 0.6;
      positions[i * 3] = r * Math.sin(theta) * Math.cos(phi);
      positions[i * 3 + 1] = r * Math.cos(theta);
      positions[i * 3 + 2] = r * Math.sin(theta) * Math.sin(phi);
      scales[i] = 0.5 + Math.random() * 1.5;
      speeds[i] = 0.3 + Math.random() * 0.9;
      seeds[i] = Math.random() * 100;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
    geo.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
    return geo;
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uConvergence: { value: 1 },
      uReveal: { value: 0 },
      uSize: { value: 14 },
      uPixelRatio: { value: 1 },
      uColorA: { value: new THREE.Color(COLORS.primary) },
      uColorB: { value: new THREE.Color(COLORS.accent) },
    }),
    [],
  );

  useFrame((_, delta) => {
    const s = store.current;
    const dt = Math.min(delta, 1 / 30);
    if (mat.current) {
      const u = mat.current.uniforms;
      u.uTime.value += dt * (s.reducedMotion ? 0.2 : 1);
      u.uConvergence.value = s.convergence;
      u.uReveal.value = s.reveal;
      u.uPixelRatio.value = Math.min(gl.getPixelRatio(), 2);
    }
  });

  return (
    <points ref={points} geometry={geometry}>
      <shaderMaterial
        ref={mat}
        vertexShader={emberVertexShader}
        fragmentShader={emberFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
