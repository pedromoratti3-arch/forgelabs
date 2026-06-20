/**
 * Locked design + motion constants for Forgelabs.
 * Mirrors the production briefing — single source of truth shared by
 * Tailwind tokens, GLSL uniforms and JS timelines.
 */

export const COLORS = {
  base: '#0D0A0C',
  surface: '#161214',
  primary: '#DB2777', // rosa primário (marca)
  accent: '#F472B6', // rosa acento (brilho)
  ice: '#F5F0F2', // branco-gelo
  muted: '#A89CA2', // texto secundário
} as const;

/** Bezier control points — the "alma" of the motion language. */
export const EASE = {
  /** entradas — expo out, suave e caro */
  expo: [0.16, 1, 0.3, 1] as [number, number, number, number],
  /** saídas / transições */
  expoIn: [0.7, 0, 0.84, 0] as [number, number, number, number],
} as const;

/** GSAP-string easings (gsap parses "M0,0 ... " or named; we use cubic-bezier via CustomEase-free strings). */
export const GSAP_EASE = {
  expo: 'power4.out',
  expoIn: 'power4.in',
} as const;

/** Text reveal timing (per line/word). */
export const REVEAL = {
  duration: 0.9,
  stagger: 0.06,
} as const;

/** The persistent entity's journey — one phase per section. */
export const SECTIONS = [
  'hero',
  'manifesto',
  'servicos',
  'portfolio',
  'processo',
  'contato',
] as const;

export type SectionId = (typeof SECTIONS)[number];

/** Section copy/labels (mono numbering shown in each section corner). */
export const SECTION_META: Record<SectionId, { index: string; label: string }> = {
  hero: { index: '01', label: 'HERO' },
  manifesto: { index: '02', label: 'MANIFESTO' },
  servicos: { index: '03', label: 'SERVIÇOS' },
  portfolio: { index: '04', label: 'PORTFÓLIO' },
  processo: { index: '05', label: 'PROCESSO' },
  contato: { index: '06', label: 'CONTATO' },
};
