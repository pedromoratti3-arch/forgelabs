import { useEffect, useLayoutEffect } from 'react';

/**
 * useLayoutEffect that silently falls back to useEffect during SSR,
 * avoiding React's "useLayoutEffect does nothing on the server" warning.
 * Used by every GSAP/animation hook so layout reads happen pre-paint on the client.
 */
export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;
