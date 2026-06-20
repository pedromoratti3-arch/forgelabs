import { simplexNoise3D } from './noise';

/**
 * FORGE ENTITY — vertex shader. "Matéria viva."
 *
 * Displaces a unit icosphere along its radial normal. Three layers combine:
 *   1. continuous organic churn — 2 low-freq simplex octaves (kept cheap for weak GPUs)
 *   2. FLUID PUSH — the surface facing the cursor bulges; cursor SPEED (uVel) sends
 *      viscous ripples emanating from the contact point (the "touch a liquid" feel)
 *   3. WAKE — when the cursor is on the primary CTA (uReact) the churn speeds up and
 *      the bulge deepens, as if the matter is waking up to be shaped.
 * Normals are re-derived from displaced neighbours so the metal reads with real volume.
 */
export const forgeVertexShader = /* glsl */ `
uniform float uTime;
uniform float uAmp;
uniform float uFreq;
uniform float uMorph;
uniform float uReveal;
uniform float uCool;
uniform vec2  uMouse;   // eased pointer direction (-1..1)
uniform float uVel;     // decaying cursor speed 0..1 → fluid distortion strength
uniform float uReact;   // 0..1 CTA-hover "wake"

varying vec3  vNormal;
varying vec3  vWorldPos;
varying vec3  vPos;
varying float vDisp;

${simplexNoise3D}

float getDisp(vec3 p){
  float t = uTime;

  // 1 — organic churn (2 octaves). Accelerates slightly when the mass "wakes".
  float wake = 1.0 + uReact * 0.5;
  float n1 = snoise(p * uFreq + vec3(0.0, t * 0.22 * wake, 0.0)) * 0.75;
  float n2 = snoise(p * uFreq * 1.9 + vec3(t * 0.17 * wake, 0.0, t * 0.12 * wake)) * 0.38;
  float d = n1 + n2;

  // 2 — FLUID PUSH toward the cursor + speed-driven ripples
  vec3  mdir   = normalize(vec3(uMouse, 0.6));
  float facing = smoothstep(-0.15, 1.0, dot(normalize(p), mdir));
  d += facing * (0.16 + 0.34 * uReact);                       // steady viscous bulge
  d += sin(facing * 7.0 - t * 5.0 * wake) * facing * uVel * 0.24; // ripples on flick

  float amp = uAmp * mix(1.0, 0.55, uMorph);
  amp *= mix(0.45, 1.0, uReveal);
  amp *= mix(1.0, 0.6, uCool);   // settles / stops churning as it cools (scroll)
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
 * FORGE ENTITY — fragment shader. The material that kills the "rubbery" look:
 *
 *   • cool KEY light sculpts the form (blue-ish) while a warm ROSA FILL gives identity
 *     and depth — the cool/warm contrast reads as real lit metal, not matte rubber.
 *   • FRESNEL RIM — a luminous rosa contour on the silhouette (etereal edge glow).
 *   • INTERNAL GLOW (fake subsurface) — a soft warm core, strongest on the bulges, so
 *     the mass looks lit from within (molten / alive).
 *   • WAKE (uReact) intensifies the inner glow + rim when the CTA is hovered.
 *
 * Outputs LINEAR colour (glow >1.0) so the Bloom pass catches the rim/glow. Tone mapping
 * + sRGB are handled by the post-processing pipeline (EffectComposer), not here.
 */
export const forgeFragmentShader = /* glsl */ `
uniform float uTime;
uniform float uReveal;
uniform float uCool;
uniform float uReact;
uniform float uFresnelPower;
uniform vec3  uColorA; // rosa primário
uniform vec3  uColorB; // rosa acento (brilho)
uniform vec3  uBase;   // metal escuro

varying vec3  vNormal;
varying vec3  vWorldPos;
varying vec3  vPos;
varying float vDisp;

void main(){
  vec3 N = normalize(vNormal);
  vec3 V = normalize(cameraPosition - vWorldPos);
  float ndv = max(dot(N, V), 0.0);

  // cool key (top-right) + warm rosa fill (lower-left) → sculpted, metallic depth
  vec3 keyDir  = normalize(vec3(0.5, 0.85, 0.55));
  vec3 fillDir = normalize(vec3(-0.6, -0.25, 0.5));
  vec3 coolLight = vec3(0.55, 0.62, 0.85);
  float key  = max(dot(N, keyDir), 0.0);
  float fill = max(dot(N, fillDir), 0.0);

  // ambient occlusion from displacement: concavities (vDisp<0) sit in shadow
  float ao = smoothstep(-0.30, 0.14, vDisp);

  // dark metal body lit by the two sources
  vec3 body = uBase * 0.07;
  body += coolLight * key * 0.34 * ao;     // cool sculpting
  body += uColorA   * fill * 0.55 * ao;    // warm rosa fill (identity + depth)

  // tight, cool-tinted specular glint → metallic, not matte
  vec3 H = normalize(keyDir + V);
  float spec = pow(max(dot(N, H), 0.0), 80.0);
  body += spec * (coolLight * 0.5 + uColorB * 0.5) * 1.1 * ao;

  // FRESNEL rim — luminous rosa contour (brightens on wake)
  float fres = pow(1.0 - ndv, uFresnelPower);
  vec3  rim  = mix(uColorA, uColorB, fres) * fres * (1.25 + uReact * 1.1);

  // INTERNAL GLOW (fake subsurface) — broad soft warm core, strongest on raised matter
  float inner = pow(1.0 - ndv, 1.5);
  float core  = smoothstep(-0.10, 0.40, vDisp);
  vec3  glow  = mix(uColorA, uColorB, 0.5) * inner * (0.32 + 0.5 * core);
  glow *= (0.8 + uReact * 1.7); // CTA hover → glows from within

  // molten flow on the bulges (kept out of crevices by displacement)
  float flow = 0.5 + 0.5 * sin(vPos.y * 5.0 + uTime * 1.2);
  vec3  hot  = mix(uColorA, uColorB, 0.5) * smoothstep(0.05, 0.40, vDisp)
             * (0.5 + 0.5 * flow) * (0.55 + uReact * 0.8);

  vec3 color = body + rim + glow + hot;

  // HERO → MANIFESTO "resfriamento": shift cool/dark + dim as it scrolls out
  color = mix(color, color * vec3(0.5, 0.56, 0.82), uCool);
  color *= mix(1.0, 0.45, uCool);

  // fade in as the mass is revealed (preloader → hero)
  color *= smoothstep(0.0, 0.9, uReveal);

  gl_FragColor = vec4(color, 1.0);
}
`;
