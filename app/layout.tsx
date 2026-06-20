import type { Metadata, Viewport } from 'next';
import { JetBrains_Mono } from 'next/font/google';
import { AppShell } from '@/components/AppShell';
import './globals.css';

// Technical/label typeface — exposed as the --font-mono CSS variable for Tailwind.
const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://forgelabs.studio'),
  title: 'Forgelabs — Moldamos o digital bruto em produtos memoráveis',
  description:
    'Estúdio de criação de sites e landing pages sob medida. Transformamos ideias brutas em produtos digitais polidos, de alto padrão.',
  keywords: ['estúdio digital', 'sites sob medida', 'landing pages', 'desenvolvimento web', 'design'],
  authors: [{ name: 'Forgelabs' }],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    title: 'Forgelabs — Moldamos o digital bruto em produtos memoráveis',
    description:
      'Estúdio de criação de sites e landing pages sob medida. Do material bruto ao produto polido.',
    siteName: 'Forgelabs',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Forgelabs',
    description: 'Moldamos o digital bruto em produtos memoráveis.',
  },
};

export const viewport: Viewport = {
  themeColor: '#0D0A0C',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={mono.variable}>
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="anonymous" />
      </head>
      <body className="font-sans antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
