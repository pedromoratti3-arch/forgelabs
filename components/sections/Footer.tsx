'use client';

const SOCIALS = [
  { label: 'Instagram', href: '#' },
  { label: 'LinkedIn', href: '#' },
  { label: 'Behance', href: '#' },
];

/** 08 — FOOTER. Minimal: wordmark, e-mail, socials, and a slow pulsing rosa ember. */
export function Footer() {
  return (
    <footer className="relative border-t border-line bg-base py-20">
      <div className="mx-auto max-w-grid px-margin">
        <div className="flex flex-col gap-12">
          <a
            href="#contato"
            data-cursor="hover"
            className="group flex max-w-3xl items-center gap-4 font-display text-[clamp(1.75rem,4vw,3rem)] font-medium leading-tight text-ice"
          >
            <span>
              Vamos forjar algo <span className="text-primary">memorável</span>.
            </span>
            <span className="translate-x-0 text-accent transition-transform duration-300 ease-expo group-hover:translate-x-2">
              →
            </span>
          </a>

          <a
            href="mailto:contato@forgelabs.studio"
            data-cursor="hover"
            className="w-fit font-sans text-lg text-muted underline-offset-4 transition-colors duration-300 hover:text-ice hover:underline"
          >
            contato@forgelabs.studio
          </a>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-6 border-t border-line pt-8 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 animate-ember-pulse rounded-full bg-primary shadow-[0_0_10px_rgba(244,114,182,0.9)]" />
            <span className="font-display text-base font-bold tracking-tight text-ice">Forgelabs</span>
            <span className="font-mono text-xs text-muted">© {2026}</span>
          </div>

          <nav className="flex items-center gap-7">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                data-cursor="hover"
                className="font-sans text-sm text-muted transition-colors duration-300 hover:text-ice"
              >
                {s.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
