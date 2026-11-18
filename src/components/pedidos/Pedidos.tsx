"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useScrollTo } from "@/components/providers/SmoothScroll";
import { FolhaHeader, revealFolha } from "@/components/doc/Folha";
import { MODO, PEDIDOS } from "@/content/escritorio";

/**
 * fl. 03 — Dos pedidos.
 * Os serviços escritos como os pedidos de uma petição: a), b), c).
 * O modo de atendimento vem como incisos (I a IV).
 */

const ROMANOS = ["I", "II", "III", "IV"];

export function Pedidos() {
  const root = useRef<HTMLElement>(null);
  const scrollTo = useScrollTo();

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      gsap.matchMedia().add(
        { motion: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)" },
        (ctx) => {
          gsap.set(q("[data-gsap-pending]"), { autoAlpha: 1 });
          if ((ctx.conditions as { reduce: boolean }).reduce) return;
          revealFolha(q, root.current!);

          // Cada pedido entra quando chega à tela: letra, título, linha, texto — 0.2s entre cada.
          q("[data-pedido]").forEach((el) => {
            const parts = el.querySelectorAll("[data-pedido-part]");
            const line = el.querySelector("[data-pedido-line]");
            gsap.set(parts, { autoAlpha: 0, y: 26 });
            gsap.set(line, { scaleX: 0, transformOrigin: "0% 50%" });
            gsap
              .timeline({ scrollTrigger: { trigger: el, start: "top 80%", toggleActions: "play none none reverse" } })
              .to(line, { scaleX: 1, duration: 1.1, ease: "expo.inOut" }, 0)
              .to(parts, { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.2 }, 0.15);
          });

          const incisos = q("[data-inciso]");
          gsap.set(incisos, { autoAlpha: 0, y: 26 });
          gsap.to(incisos, {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.2,
            scrollTrigger: { trigger: q("[data-incisos]")[0], start: "top 80%", toggleActions: "play none none reverse" },
          });
        },
      );
    },
    { scope: root },
  );

  return (
    <section ref={root} id="pedidos" aria-labelledby="pedidos-titulo" className="bg-paper text-ink">
      <div className="mx-auto max-w-[1680px] px-4 pb-24 pt-5 sm:px-8 lg:px-12 lg:pb-36">
        <FolhaHeader left="Dos pedidos" center="O que o escritório faz" fl="03" />

        <div className="mt-14 grid gap-10 lg:mt-20 lg:grid-cols-[minmax(0,26rem)_1fr] lg:gap-20">
          <div className="lg:sticky lg:top-16 lg:self-start">
            <p data-item data-gsap-pending className="font-mono text-xs text-ink-soft sm:text-sm">
              Diante do exposto, requer-se:
            </p>
            <h2
              id="pedidos-titulo"
              data-item
              data-gsap-pending
              className="font-display mt-4 text-[clamp(2.8rem,12vw,4.5rem)] leading-[0.88] lg:text-[clamp(3.5rem,5.4vw,6.5rem)]"
            >
              Três pedidos. Um só contrato.
            </h2>
            <p data-item data-gsap-pending className="mt-6 max-w-[36ch] text-base leading-snug text-ink-soft lg:text-lg">
              Cada caso começa pela leitura do contrato. Daí sai o que pedir — e o que não vale a pena.
            </p>
          </div>

          <ol className="space-y-14 lg:space-y-20">
            {PEDIDOS.map((p) => (
              <li key={p.letra} data-pedido className="grid grid-cols-[2.5rem_1fr] sm:grid-cols-[4rem_1fr]">
                <span
                  data-pedido-part
                  data-gsap-pending
                  className="font-display text-[2.4rem] leading-none text-ink-faint sm:text-[3.4rem]"
                >
                  {p.letra})
                </span>
                <div>
                  <h3
                    data-pedido-part
                    data-gsap-pending
                    className="font-display text-[2.2rem] leading-[0.92] sm:text-[3.4rem]"
                  >
                    {p.titulo}
                  </h3>
                  <span data-pedido-line className="mt-5 block h-px w-full bg-ink/30" />
                  <p
                    data-pedido-part
                    data-gsap-pending
                    className="mt-5 max-w-[56ch] text-base leading-relaxed text-ink-soft sm:text-lg"
                  >
                    {p.texto}
                  </p>
                </div>
              </li>
            ))}
            <li className="font-mono text-xs italic text-ink-soft sm:pl-16 sm:text-sm">
              Nestes termos, pede deferimento.
            </li>
          </ol>
        </div>

        {/* Do atendimento — incisos */}
        <div data-incisos className="mt-24 border-t border-ink/15 pt-6 lg:mt-36">
          <p className="font-mono text-xs text-ink-soft sm:text-sm">Do atendimento</p>
          <ul className="mt-8 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {MODO.map((m, i) => (
              <li key={m.titulo} data-inciso data-gsap-pending>
                <span className="font-mono text-xs tabular-nums text-ink">{ROMANOS[i]} —</span>
                <h3 className="font-display mt-3 text-[1.9rem] leading-[0.95]">{m.titulo}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{m.texto}</p>
              </li>
            ))}
          </ul>
          <a
            href="#contato"
            onClick={(e) => {
              e.preventDefault();
              scrollTo("#contato");
            }}
            className="mt-14 inline-flex items-center gap-3 border-b border-ink pb-1 text-[15px] font-semibold [font-stretch:88%] hover:bg-marker"
          >
            Enviar meu contrato para análise <span aria-hidden>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
