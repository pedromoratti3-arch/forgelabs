/**
 * FORGE PARTICLES — the whole preloader, in one cloud.
 *
 * The SAME points do everything, so the eye never loses them (continuity):
 *   aScatter (start) → scattered widely, varied directions
 *   position (attr)  = aAnvil  → the anvil silhouette (they "fill the forge")
 *   aMass            → a point on the hero's 3D mass surface
 *
 *   pos = mix( mix(aScatter, aAnvil, fill_staggered), aMass, morph_staggered )
 *
 * `aFillDelay` staggers the convergence so particles arrive from different directions
 * at different times (filling the anvil gradually). `aMorphDelay` (centre → edge)
 * staggers the transform so the centre becomes the mass first.
 */
export const particleVertexShader = /* glsl */ `
uniform float uFill;    // 0 scattered → 1 anvil
uniform float uMorph;   // 0 anvil → 1 mass
uniform float uTime;
uniform float uSize;
uniform float uPixelRatio;

attribute vec3  aScatter;
attribute vec3  aMass;
attribute float aSize;
attribute float aSeed;
attribute float aFillDelay;
attribute float aMorphDelay;

varying float vHeat;

void main(){
  vec3 anvil = position;

  // staggered convergence: each particle reaches the anvil at its own time
  float f = clamp((uFill - aFillDelay * 0.4) / 0.6, 0.0, 1.0);
  f = f * f * (3.0 - 2.0 * f);
  vec3 toAnvil = mix(aScatter, anvil, f);

  // gentle life while still in flight (fades out as it locks into the anvil)
  toAnvil += vec3(
    sin(uTime * 1.3 + aSeed * 6.2831),
    cos(uTime * 1.1 + aSeed * 5.1300),
    sin(uTime * 1.5 + aSeed * 4.4100)
  ) * 0.05 * (1.0 - f);

  // staggered transform anvil → mass (centre first)
  float m = clamp((uMorph - aMorphDelay * 0.25) / 0.75, 0.0, 1.0);
  m = m * m * (3.0 - 2.0 * m);

  vec3 p = mix(toAnvil, aMass, m);

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;

  float depth = max(-mv.z, 0.001);
  gl_PointSize = uSize * aSize * uPixelRatio / depth;

  vHeat = 0.45 + 0.4 * (1.0 - f); // a touch hotter while flying in
}
`;

export const particleFragmentShader = /* glsl */ `
uniform float uAlpha;
uniform vec3  uColorA; // rosa primário
uniform vec3  uColorB; // rosa acento (núcleo quente)

varying float vHeat;

void main(){
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  float mask = smoothstep(0.5, 0.0, d);          // soft round spark
  vec3 col = mix(uColorB, uColorA, clamp(d * 1.6, 0.0, 1.0));
  col *= 1.0 + vHeat * 1.0;                        // hot core → Bloom catches it
  gl_FragColor = vec4(col, mask * uAlpha);
}
`;
