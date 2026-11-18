"use client";

import { useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { FolhaHeader, revealFolha } from "@/components/doc/Folha";
import { QUESITOS } from "@/content/escritorio";

/**
 * fl. 06 — Quesitos.
 * Perguntas frequentes no formato de quesitos e respostas.
 * Respostas vêm abertas no HTML (legível sem JS / indexável); o GSAP fecha
 * todas menos a primeira ao montar e anima abrir/fechar.
 */

export function Quesitos() {
  const root = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(0);

  const { contextSafe } = useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      gsap.matchMedia().add(
        { motion: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)" },
        (ctx) => {
          gsap.set(q("[data-gsap-pending]"), { autoAlpha: 1 });
          // Estado inicial do acordeão (vale para os dois ramos).
          q("[data-resposta]").forEach((el, i) => gsap.set(el, i === 0 ? { height: "auto" } : { height: 0, autoAlpha: 0 }));
          q("[data-sinal]").forEach((el, i) => gsap.set(el, { rotation: i === 0 ? 45 : 0 }));
          if ((ctx.conditions as { reduce: boolean }).reduce) return;
          revealFolha(q, root.current!);
        },
      );
    },
    { scope: root },
  );

  const toggle = contextSafe((i: number, items: HTMLElement[]) => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const next = open === i ? -1 : i;
    items.forEach((item, k) => {
      const resp = item.querySelector("[data-resposta]");
      const sinal = item.querySelector("[data-sinal]");
      const willOpen = k === next;
      const isOpen = k === open;
      if (!willOpen && !isOpen) return;
      gsap.to(resp, {
        height: willOpen ? "auto" : 0,
        autoAlpha: willOpen ? 1 : 0,
        duration: reduce ? 0 : willOpen ? 0.8 : 0.6,
        ease: willOpen ? "power3.out" : "power3.inOut",
        overwrite: true,
        // A altura da página mudou: recalcula os gatilhos abaixo.
        onComplete: () => ScrollTrigger.refresh(),
      });
      gsap.to(sinal, { rotation: willOpen ? 45 : 0, duration: reduce ? 0 : 0.6, ease: "power3.inOut", overwrite: true });
    });
    setOpen(next);
  });

  return (
    <section ref={root} id="quesitos" aria-labelledby="quesitos-titulo" className="bg-ink text-paper">
      <div className="mx-auto max-w-[1680px] px-4 pb-24 pt-5 sm:px-8 lg:px-12 lg:pb-36">
        <FolhaHeader left="Quesitos" center="Perguntas frequentes" fl="06" dark />

        <div className="mt-14 grid gap-12 lg:mt-20 lg:grid-cols-[minmax(0,26rem)_1fr] lg:gap-20">
          <div>
            <p data-item data-gsap-pending className="font-mono text-xs text-paper/65 sm:text-sm">
              O que mais nos perguntam.
            </p>
            <h2
              id="quesitos-titulo"
              data-item
              data-gsap-pending
              className="font-display mt-4 text-[clamp(2.8rem,12vw,4.5rem)] leading-[0.88] lg:text-[clamp(3.5rem,5.4vw,6.5rem)]"
            >
              Quesitos e respostas.
            </h2>
          </div>

          <ol>
            {QUESITOS.map((item, i) => {
              const id = `quesito-${i}`;
              const isOpen = open === i;
              return (
                <li key={id} data-item data-gsap-pending data-quesito className="border-t border-paper/20 last:border-b">
                  <h3>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`${id}-resp`}
                      id={`${id}-btn`}
                      onClick={(e) => {
                        const list = e.currentTarget.closest("ol");
                        if (list) toggle(i, Array.from(list.querySelectorAll<HTMLElement>("[data-quesito]")));
                      }}
                      className="grid w-full grid-cols-[3.5rem_1fr_2rem] items-start gap-2 py-6 text-left outline-offset-4 focus-visible:outline-2 focus-visible:outline-marker sm:grid-cols-[5rem_1fr_2rem] sm:py-8"
                    >
                      <span className="pt-1.5 font-mono text-[11px] text-marker sm:text-xs">{i + 1}º quesito</span>
                      <span className="font-display text-[1.6rem] leading-[1] sm:text-[2.3rem]">{item.pergunta}</span>
                      <span data-sinal aria-hidden className="mt-1 block justify-self-end font-mono text-2xl leading-none text-marker">
                        +
                      </span>
                    </button>
                  </h3>
                  <div
                    id={`${id}-resp`}
                    role="region"
                    aria-labelledby={`${id}-btn`}
                    data-resposta
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-[3.5rem_1fr] gap-2 pb-8 sm:grid-cols-[5rem_1fr]">
                      <span className="font-mono text-[11px] text-paper/65 sm:text-xs">Resposta</span>
                      <p className="max-w-[60ch] text-base leading-relaxed text-paper/65 sm:text-lg">{item.resposta}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
