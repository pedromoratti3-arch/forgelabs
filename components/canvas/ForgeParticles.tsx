'use client';

import { useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { particleVertexShader, particleFragmentShader } from './shaders/particles';
import { useAnvilSamples } from '@/hooks/useAnvilSamples';
import { COLORS } from '@/lib/constants';
import { type SceneStore } from '@/lib/sceneStore';

interface ForgeParticlesProps {
  store: MutableRefObject<SceneStore>;
  /** how many particles to sample (fewer on mobile / low tier) */
  count: number;
}

/**
 * The preloader particle cloud. Lives inside the persistent Canvas, alongside the
 * mass, so the transform particle→mesh happens in the same 3D space (no DOM↔WebGL gap).
 * Reads `pFill` / `pMorph` / `particleAlpha` from the store (set by the GSAP timeline).
 */
export function ForgeParticles({ store, count }: ForgeParticlesProps) {
  const points = useRef<THREE.Points>(null);
  const mat = useRef<THREE.ShaderMaterial>(null);
  const { gl } = useThree();

  const samples = useAnvilSamples(count);

  const geometry = useMemo(() => {
    if (!samples) return null;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(samples.anvil, 3));
    geo.setAttribute('aScatter', new THREE.BufferAttribute(samples.scatter, 3));
    geo.setAttribute('aMass', new THREE.BufferAttribute(samples.mass, 3));
    geo.setAttribute('aSize', new THREE.BufferAttribute(samples.sizes, 1));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(samples.seeds, 1));
    geo.setAttribute('aFillDelay', new THREE.BufferAttribute(samples.fillDelay, 1));
    geo.setAttribute('aMorphDelay', new THREE.BufferAttribute(samples.morphDelay, 1));
    return geo;
  }, [samples]);

  const uniforms = useMemo(
    () => ({
      uFill: { value: 0 },
      uMorph: { value: 0 },
      uAlpha: { value: 0 },
      uTime: { value: 0 },
      uSize: { value: 24 },
      uPixelRatio: { value: 1 },
      uColorA: { value: new THREE.Color(COLORS.primary) },
      uColorB: { value: new THREE.Color(COLORS.accent) },
    }),
    [],
  );

  // tell the orchestrator the cloud is ready (so it can start the sequence)
  useEffect(() => {
    if (geometry) store.current.particlesReady = true;
  }, [geometry, store]);

  useFrame((_, delta) => {
    const s = store.current;
    const dt = Math.min(delta, 1 / 30);
    if (mat.current) {
      const u = mat.current.uniforms;
      u.uTime.value += dt;
      u.uFill.value = s.pFill;
      u.uMorph.value = s.pMorph;
      u.uAlpha.value = s.particleAlpha;
      u.uPixelRatio.value = Math.min(gl.getPixelRatio(), 2);
    }
  });

  if (!geometry) return null;

  return (
    <points ref={points} geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={mat}
        vertexShader={particleVertexShader}
        fragmentShader={particleFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        depthTest={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
