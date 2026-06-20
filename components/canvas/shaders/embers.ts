import { simplexNoise3D } from './noise';

/**
 * EMBERS — rosa "brasas" orbiting the forge mass.
 * During the preload they sit scattered/cold (uConvergence → 1, large radius) and
 * converge inward as the mass forms (uConvergence → 0). Additively blended points
 * with a soft round mask and per-particle flicker.
 */
export const emberVertexShader = /* glsl */ `
uniform float uTime;
uniform float uConvergence; // 1 = scattered far, 0 = settled near the mass
uniform float uReveal;
uniform float uSize;
uniform float uPixelRatio;

attribute float aScale; // per-particle size variance
attribute float aSpeed; // per-particle drift/flicker speed
attribute float aSeed;  // per-particle phase

varying float vAlpha;
varying float vHeat;

${simplexNoise3D}

void main(){
  vec3 pos = position;

  // convergence inflates the orbit radius (cold embers drift outward)
  float radius = 1.0 + uConvergence * 2.4;
  pos *= radius;

  // bounded wander so embers never escape the frame
  float t = uTime * aSpeed;
  pos.y += sin(t + aSeed) * 0.22;
  pos.x += snoise(vec3(aSeed, uTime * 0.1, 0.0)) * 0.14;
  pos.z += snoise(vec3(0.0, uTime * 0.1, aSeed)) * 0.14;

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;

  float size = uSize * aScale * (0.6 + 0.4 * uReveal);
  gl_PointSize = size * uPixelRatio * (1.0 / -mv.z);

  float flick = 0.5 + 0.5 * sin(uTime * 3.0 * aSpeed + aSeed * 6.2831);
  vAlpha = flick * mix(0.12, 0.9, uReveal);
  vHeat = flick;
}
`;

export const emberFragmentShader = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;

varying float vAlpha;
varying float vHeat;

void main(){
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  // soft round falloff
  float mask = smoothstep(0.5, 0.0, d);
  // hotter core (accent) → cooler edge (primary)
  vec3 col = mix(uColorB, uColorA, clamp(d * 2.0, 0.0, 1.0));
  col *= 1.0 + vHeat * 0.6; // let bloom catch the brightest
  gl_FragColor = vec4(col, mask * vAlpha);
}
`;
