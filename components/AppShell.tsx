'use client';

import dynamic from 'next/dynamic';
import { createContext, useContext, useState, type ReactNode } from 'react';
import { SceneProvider } from '@/components/providers/SceneProvider';
import { SmoothScrollProvider } from '@/components/providers/SmoothScrollProvider';
import { GrainOverlay } from '@/components/ui/GrainOverlay';
import { AnvilForge } from '@/components/ui/AnvilForge';
import { SectionTransitions } from '@/components/transitions/SectionTransitions';
import { Header } from '@/components/ui/Header';

// Lazy, client-only Canvas — defers all of three.js/shaders past first paint.
const SceneCanvas = dynamic(() => import('@/components/canvas/SceneCanvas'), {
  ssr: false,
});

/** True once the preloader curtain has lifted — gates every entrance animation. */
const EnteredContext = createContext(false);
export const useEntered = () => useContext(EnteredContext);

/**
 * Top-level client shell: providers, the persistent Canvas, global overlays
 * (grain, cursor), the header and the preloader. Wraps the page content (`children`)
 * and broadcasts the "entered" state so sections animate in as the curtain rises.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const [entered, setEntered] = useState(false);

  return (
    <SceneProvider>
      <SmoothScrollProvider>
        <EnteredContext.Provider value={entered}>
          <SceneCanvas />
          <SectionTransitions />
          <GrainOverlay />
          <Header />
          <main className="relative z-10">{children}</main>
          <AnvilForge onComplete={() => setEntered(true)} />
        </EnteredContext.Provider>
      </SmoothScrollProvider>
    </SceneProvider>
  );
}
