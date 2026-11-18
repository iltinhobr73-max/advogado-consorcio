"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { FolhaHeader, revealFolha } from "@/components/doc/Folha";
import { DECLARACOES } from "@/content/escritorio";

/**
 * fl. 05 — Declarações.
 * Cada avaliação de cliente vira uma declaração assinada: texto, linha de
 * assinatura traçada, nome e data.
 */

export function Declaracoes() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      gsap.matchMedia().add(
        { motion: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)" },
        (ctx) => {
          gsap.set(q("[data-gsap-pending]"), { autoAlpha: 1 });
          if ((ctx.conditions as { reduce: boolean }).reduce) return;
          revealFolha(q, root.current!);

          q("[data-declaracao]").forEach((card) => {
            const parts = card.querySelectorAll("[data-decl-part]");
            const sig = card.querySelector("[data-decl-sig]");
            gsap.set(card, { autoAlpha: 0, y: 40 });
            gsap.set(parts, { autoAlpha: 0, y: 20 });
            gsap.set(sig, { scaleX: 0, transformOrigin: "0% 50%" });
            gsap
              .timeline({ scrollTrigger: { trigger: card, start: "top 85%", toggleActions: "play none none reverse" } })
              .to(card, { autoAlpha: 1, y: 0, duration: 0.9, ease: "power3.out" }, 0)
              .to(parts, { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.2 }, 0.2)
              // a assinatura é traçada depois do texto
              .to(sig, { scaleX: 1, duration: 1.0, ease: "expo.inOut" }, 0.6);
          });
        },
      );
    },
    { scope: root },
  );

  return (
    <section ref={root} id="declaracoes" aria-labelledby="declaracoes-titulo" className="bg-paper text-ink">
      <div className="mx-auto max-w-[1680px] px-4 pb-24 pt-5 sm:px-8 lg:px-12 lg:pb-36">
        <FolhaHeader left="Declarações" center="Quem já passou por aqui" fl="05" />

        <div className="mt-14 flex flex-col gap-6 lg:mt-20 lg:flex-row lg:items-end lg:justify-between">
          <h2
            id="declaracoes-titulo"
            data-item
            data-gsap-pending
            className="font-display text-[clamp(2.8rem,12vw,4.5rem)] leading-[0.88] lg:text-[clamp(3.5rem,6vw,7rem)]"
          >
            Declaram, para
            <br />
            os devidos fins:
          </h2>
          <p data-item data-gsap-pending className="max-w-[38ch] font-mono text-xs leading-relaxed text-ink-soft sm:text-sm">
            Avaliações públicas deixadas por clientes no Google. Reproduzidas sem edição.
          </p>
        </div>

        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:mt-20 lg:gap-6">
          {DECLARACOES.map((d, i) => (
            <li
              key={d.nome}
              data-declaracao
              data-gsap-pending
              className="flex flex-col justify-between bg-paper-2/70 px-6 pb-6 pt-6 sm:px-8 sm:pt-8"
            >
              <div>
                <p data-decl-part className="font-mono text-[11px] text-ink-soft">
                  Declaração nº {String(i + 1).padStart(2, "0")}
                </p>
                <blockquote data-decl-part className="mt-5 text-xl leading-snug sm:text-2xl">
                  “{d.texto}”
                </blockquote>
              </div>
              <div className="mt-10">
                <span data-decl-sig className="block h-px w-full max-w-[24rem] bg-ink" />
                <div
                  data-decl-part
                  className="mt-2 flex max-w-[24rem] justify-between gap-4 font-mono text-[11px] text-ink-soft"
                >
                  <span className="text-ink">{d.nome}</span>
                  <span>{d.data} · Google</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
