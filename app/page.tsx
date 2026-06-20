import { Hero } from '@/components/sections/Hero';
import { Manifesto } from '@/components/sections/Manifesto';
import { Servicos } from '@/components/sections/Servicos';
import { Contato } from '@/components/sections/Contato';
import { Footer } from '@/components/sections/Footer';

/**
 * Forgelabs — single-page experience. The persistent 3D forge entity lives in the
 * global Canvas (see AppShell) and morphs as the page scrolls.
 * Order: 01 HERO → 02 MANIFESTO → 03 SERVIÇOS → 06 CONTATO → FOOTER.
 * (Portfólio + Processo are the next blocks to land.)
 */
export default function Home() {
  return (
    <>
      <Hero />
      <Manifesto />
      <Servicos />
      <Contato />
      <Footer />
    </>
  );
}
