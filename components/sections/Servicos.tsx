'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { type ReactNode } from 'react';
import { EASE } from '@/lib/constants';

interface Service {
  num: string;
  title: string;
  desc: string;
  icon: ReactNode;
}

const SERVICES: Service[] = [
  {
    num: '01',
    title: 'Sites sob medida',
    desc: 'Experiências completas, do conceito ao deploy. Design, performance e código feitos à mão para a sua marca.',
    icon: (
      <path d="M4 7h24M4 7v18h24V7M9 12h14M9 16h10" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  {
    num: '02',
    title: 'Landing pages de alta conversão',
    desc: 'Páginas focadas em resultado. Narrativa, copy e motion que transformam visita em cliente.',
    icon: (
      <path d="M16 4v24M16 4l-7 8M16 4l7 8M7 28h18" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  {
    num: '03',
    title: 'Sistemas web',
    desc: 'Plataformas, dashboards e apps web sob medida — robustos, escaláveis e bonitos de usar.',
    icon: (
      <path
        d="M6 6h20v14H6zM6 24h20M12 28h8M11 13l3 3-3 3M17 19h4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
];

function TiltCard({ s, i }: { s: Service; i: number }) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  // map cursor offset → rotation, smoothed by a spring (briefing: ±8°, spring 150/15)
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), { stiffness: 150, damping: 15 });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-8, 8]), { stiffness: 150, damping: 15 });

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <motion.div
      data-cursor="hover"
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-12%' }}
      transition={{ duration: 0.8, ease: EASE.expo, delay: i * 0.08 }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX, rotateY, transformPerspective: 1000, transformStyle: 'preserve-3d' }}
      className="group relative flex flex-col rounded-2xl border border-line bg-base/50 p-8 transition-[border-color,box-shadow] duration-300 ease-expo will-change-transform hover:border-accent hover:shadow-[0_0_45px_-10px_rgba(219,39,119,0.4)]"
    >
      <div className="flex flex-col gap-6" style={{ transform: 'translateZ(36px)' }}>
        <div className="flex items-start justify-between">
          <svg
            viewBox="0 0 32 32"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.4}
            className="h-9 w-9 text-primary transition-colors duration-300 group-hover:text-accent"
            aria-hidden="true"
          >
            {s.icon}
          </svg>
          <span className="font-mono text-label text-muted">{s.num}</span>
        </div>
        <h3 className="font-display text-2xl font-medium leading-tight text-ice">{s.title}</h3>
        <p className="font-sans text-base leading-relaxed text-muted">{s.desc}</p>
      </div>
    </motion.div>
  );
}

/** 03 — SERVIÇOS. Three offerings; cards tilt in 3D toward the cursor with a rosa glow. */
export function Servicos() {
  return (
    <section id="servicos" className="relative scroll-mt-24 bg-surface py-[18vh]">
      <div className="mx-auto max-w-grid px-margin">
        <p className="mb-6 font-mono text-label uppercase text-primary">Serviços</p>
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-12%' }}
          transition={{ duration: 0.9, ease: EASE.expo }}
          className="mb-16 max-w-3xl font-display text-h2 text-ice"
        >
          O que forjamos.
        </motion.h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {SERVICES.map((s, i) => (
            <TiltCard key={s.num} s={s} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
