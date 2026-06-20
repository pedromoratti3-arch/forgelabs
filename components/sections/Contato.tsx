'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { EASE } from '@/lib/constants';

/** A field with a floating label and an incandescent focus underline. */
function Field({
  label,
  name,
  type = 'text',
  textarea = false,
}: {
  label: string;
  name: string;
  type?: string;
  textarea?: boolean;
}) {
  const shared =
    'peer w-full resize-none border-b border-line bg-transparent pb-3 pt-7 font-sans text-ice outline-none transition-colors duration-300 placeholder-transparent';
  return (
    <div className="relative">
      {textarea ? (
        <textarea id={name} name={name} rows={4} placeholder=" " required className={shared} />
      ) : (
        <input id={name} name={name} type={type} placeholder=" " required className={shared} />
      )}
      <label
        htmlFor={name}
        className="pointer-events-none absolute left-0 top-7 font-sans text-muted transition-all duration-300 ease-expo peer-focus:top-0 peer-focus:text-xs peer-focus:tracking-wide peer-focus:text-accent peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs"
      >
        {label}
      </label>
      {/* incandescent underline grows from the left on focus */}
      <span className="absolute bottom-0 left-0 h-px w-0 bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-expo peer-focus:w-full" />
    </div>
  );
}

/**
 * 06 — CONTATO. The headline + an elegant form. No backend wired yet — submit shows a
 * soft success state (placeholder until an endpoint is connected).
 */
export function Contato() {
  const [sent, setSent] = useState(false);

  return (
    <section id="contato" className="relative scroll-mt-24 bg-base py-[20vh]">
      <div className="mx-auto grid max-w-grid grid-cols-1 gap-16 px-margin lg:grid-cols-2 lg:gap-24">
        <div>
          <p className="mb-6 font-mono text-label uppercase text-primary">Contato</p>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-12%' }}
            transition={{ duration: 0.9, ease: EASE.expo }}
            className="max-w-[14ch] font-display text-h2 text-ice"
          >
            Pronto para forjar o <span className="text-primary">seu</span>?
          </motion.h2>
          <p className="mt-8 max-w-md font-sans text-lg leading-relaxed text-muted">
            Conte sua ideia. Respondemos em até 24h com os próximos passos para tirar o
            projeto do bruto.
          </p>
        </div>

        {sent ? (
          <div className="flex items-center">
            <p className="font-display text-2xl text-ice">
              Mensagem enviada. <span className="text-accent">Em breve falamos.</span>
            </p>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
            className="flex flex-col gap-10"
          >
            <Field label="Seu nome" name="name" />
            <Field label="E-mail" name="email" type="email" />
            <Field label="Sobre o projeto" name="message" textarea />
            <div className="pt-2">
              <MagneticButton type="submit" variant="solid">
                Enviar projeto
              </MagneticButton>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
