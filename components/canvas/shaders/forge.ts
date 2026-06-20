import { simplexNoise3D } from './noise';

/**
 * FORGE ENTITY — vertex shader.
 *
 * Displaces a unit icosphere along its radial normal with slow, low-frequency simplex
 * noise → big, fluid, lively motion. Normals are re-derived from displaced neighbours
 * so the metal reads with real surface volume. Reacts to the pointer with a bulge,
 * without moving its centre.
 */
export const forgeVertexShader = /* glsl */ `
uniform float uTime;
uniform float uAmp;
uniform float uFreq;
uniform float uMorph;
uniform float uReveal;
uniform float uCool;
uniform vec2  uMouse;

varying vec3  vNormal;
varying vec3  vWorldPos;
varying vec3  vPos;
varying float vDisp;

${simplexNoise3D}

float getDisp(vec3 p){
  // two LOW-frequency layers travelling over time → large, free, fluid motion
  float n1 = snoise(p * uFreq + vec3(0.0, uTime * 0.22, 0.0)) * 0.75;
  float n2 = snoise(p * uFreq * 1.6 + vec3(uTime * 0.17, 0.0, uTime * 0.12)) * 0.4;
  float d = n1 + n2;

  // the mass reaches toward the pointer (reactive, but its centre never moves)
  float md = dot(normalize(p), normalize(vec3(uMouse, 0.55)));
  d += smoothstep(-0.2, 1.0, md) * 0.5 * (0.35 + 0.65 * min(length(uMouse), 1.0));

  float amp = uAmp * mix(1.0, 0.55, uMorph);
  amp *= mix(0.4, 1.0, uReveal);
  amp *= mix(1.0, 0.62, uCool); // settles / stops churning as it cools
  return d * amp;
}

vec3 displaced(vec3 p){
  return p + normalize(p) * getDisp(p);
}

void main(){
  vec3 p = position;
  vec3 dPos = displaced(p);

  // re-derive the normal from two displaced neighbours → real surface volume
  vec3 n = normalize(p);
  vec3 ref = abs(n.y) < 0.99 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
  vec3 t1 = normalize(cross(n, ref));
  vec3 t2 = normalize(cross(n, t1));
  float eps = 0.07;
  vec3 nbA = displaced(p + t1 * eps);
  vec3 nbB = displaced(p + t2 * eps);
  vec3 newNormal = normalize(cross(nbA - dPos, nbB - dPos));
  if (dot(newNormal, n) < 0.0) newNormal = -newNormal;

  vDisp = length(dPos) - 1.0;
  vPos = p;

  vec4 worldPos = modelMatrix * vec4(dPos, 1.0);
  vWorldPos = worldPos.xyz;
  vNormal = normalize(mat3(modelMatrix) * newNormal);

  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
`;

/**
 * FORGE ENTITY — fragment shader (incandescent rosa).
 *
 * Dark metal lit by a key + fill light, with depth from a displacement-based AO term,
 * a glowing rosa fresnel rim and molten heat on the bulges. Outputs LINEAR colour
 * (glow >1.0) so the Bloom pass catches the rim/heat. Tone mapping + sRGB are handled
 * by the post-processing pipeline (EffectComposer), not here.
 */
export const forgeFragmentShader = /* glsl */ `
uniform float uTime;
uniform float uReveal;
uniform float uCool;
uniform float uFresnelPower;
uniform vec3  uColorA; // rosa primário
uniform vec3  uColorB; // rosa acento
uniform vec3  uBase;   // metal escuro

varying vec3  vNormal;
varying vec3  vWorldPos;
varying vec3  vPos;
varying float vDisp;

void main(){
  vec3 N = normalize(vNormal);
  vec3 V = normalize(cameraPosition - vWorldPos);

  // key + fill lights give the form real volume
  vec3 keyL  = normalize(vec3(0.55, 0.8, 0.5));
  vec3 fillL = normalize(vec3(-0.5, -0.15, 0.6));
  float key  = max(dot(N, keyL), 0.0);
  float fill = max(dot(N, fillL), 0.0) * 0.35;

  // ambient occlusion from the displacement: concavities (vDisp<0) sit in shadow
  float ao = smoothstep(-0.30, 0.12, vDisp);

  // high-contrast dark metal base → depth and curvature
  vec3 lit = mix(uBase, uColorA, 0.30);
  vec3 base = mix(uBase * 0.10, lit, clamp(key * 0.95 + fill, 0.0, 1.0));
  base *= mix(0.42, 1.0, ao);

  // tight rosa specular, only on lit/raised areas
  vec3 H = normalize(keyL + V);
  float spec = pow(max(dot(N, H), 0.0), 60.0);
  base += spec * uColorB * 0.7 * ao;

  // incandescent fresnel rim
  float fres = pow(1.0 - max(dot(N, V), 0.0), uFresnelPower);
  vec3 rim = mix(uColorA, uColorB, fres) * fres;

  // molten heat in the bulges + flowing energy (kept out of the crevices by ao)
  float heat = smoothstep(0.02, 0.36, vDisp);
  float flow = 0.5 + 0.5 * sin(vPos.y * 5.0 + uTime * 1.1);
  vec3 hot = mix(uColorA, uColorB, 0.5) * heat * (0.6 + 0.4 * flow);

  vec3 color = base + rim * 0.9 + hot;

  // HERO → MANIFESTO "resfriamento": dim the rosa incandescence and shift cool/dark
  color = mix(color, color * vec3(0.5, 0.56, 0.82), uCool);
  color *= mix(1.0, 0.5, uCool);

  // fade in as the particles fuse into the mass (Act 3). Floor 0 → fully invisible
  // during the preloader's earlier acts, so only the particle cloud is seen.
  color *= smoothstep(0.0, 0.9, uReveal);

  gl_FragColor = vec4(color, 1.0);
}
`;
