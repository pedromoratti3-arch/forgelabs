/** @type {import('next').NextConfig} */
const nextConfig = {
  // R3F + GSAP + Lenis register imperative side-effects (ScrollTriggers, RAF loops,
  // WebGL contexts) in effects. React StrictMode double-invokes effects in dev, which
  // double-registers those side-effects and causes flicker/leaks. We disable it so the
  // dev experience matches production. (Production never runs StrictMode double-invoke.)
  reactStrictMode: false,

  // three.js ships untranspiled ESM in a few examples modules; let Next transpile them.
  transpilePackages: ['three'],

  webpack: (config) => {
    // Allow importing raw .glsl/.vert/.frag files as strings if we ever split shaders
    // out of TS. (Currently shaders live as template literals, so this is future-proofing.)
    config.module.rules.push({
      test: /\.(glsl|vert|frag)$/,
      type: 'asset/source',
    });
    return config;
  },
};

export default nextConfig;
