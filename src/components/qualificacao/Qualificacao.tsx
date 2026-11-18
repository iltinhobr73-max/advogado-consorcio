"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { FolhaHeader, revealFolha } from "@/components/doc/Folha";
import { Monograma } from "@/components/doc/Logo";
import { ESCRITORIO, QUALIFICACAO, WHATSAPP_URL } from "@/content/escritorio";

/**
 * fl. 04 — Qualificação.
 * O "sobre o advogado" escrito como a qualificação de uma peça jurídica,
 * com a foto 3×4 presa por um clipe. Os temas de atuação recebem o
 * marca-texto em sequência.
 */

export function Qualificacao() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      gsap.matchMedia().add(
        { motion: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)" },
        (ctx) => {
          gsap.set(q("[data-gsap-pending]"), { autoAlpha: 1 });
          if ((ctx.conditions as { reduce: boolean }).reduce) {
            gsap.set(q("[data-mark]"), { backgroundSize: "100% 100%" });
            gsap.set(q("[data-foto]"), { rotation: -2.5 });
            return;
          }
          const tl = revealFolha(q, root.current!);
          // A foto chega como papel sendo preso no documento.
          gsap.set(q("[data-foto]"), { autoAlpha: 0, y: 60, rotation: -9 });
          tl.to(q("[data-foto]"), { autoAlpha: 1, y: 0, rotation: -2.5, duration: 1.2, ease: "expo.out" }, 0.4);
          // Marca-texto nos temas de atuação, um após o outro.
          gsap.set(q("[data-mark]"), { backgroundSize: "0% 100%" });
          gsap.to(q("[data-mark]"), {
            backgroundSize: "100% 100%",
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.2,
            scrollTrigger: { trigger: q("[data-paragrafo]")[0], start: "top 75%", toggleActions: "play none none reverse" },
          });
        },
      );
    },
    { scope: root },
  );

  const iniciais = ESCRITORIO.advogado
    .split(" ")
    .filter((p) => p.length > 2)
    .map((p) => p[0])
    .join("");

  return (
    <section ref={root} id="qualificacao" aria-labelledby="qualificacao-titulo" className="bg-ink text-paper">
      <div className="mx-auto max-w-[1680px] px-4 pb-24 pt-5 sm:px-8 lg:px-12 lg:pb-36">
        <FolhaHeader left="Qualificação" center="Sobre o advogado" fl="04" dark />

        <div className="mt-14 grid items-start gap-14 lg:mt-20 lg:grid-cols-[minmax(0,24rem)_1fr] lg:gap-24">
          {/* Foto 3×4 com clipe */}
          <figure data-foto data-gsap-pending className="relative mx-auto w-[min(74%,17rem)] lg:mx-0 lg:w-[19rem]">
            <svg
              aria-hidden
              viewBox="0 0 24 64"
              className="absolute -top-6 left-10 z-10 h-16 w-6 text-marker-2"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            >
              <path d="M8 40V10a4 4 0 0 1 8 0v40a7 7 0 0 1-14 0V16" />
            </svg>
            <div className="bg-paper p-3 pb-12 shadow-[0_2px_0_rgba(0,0,0,0.2),0_40px_80px_-25px_rgba(5,15,22,0.8)]">
              <div className="relative aspect-[3/4] overflow-hidden bg-ink">
                {ESCRITORIO.temFoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src="/media/advogado.jpg"
                    alt={`Foto de ${ESCRITORIO.advogado}`}
                    className="h-full w-full object-cover object-[50%_18%]"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center">
                    <span className="font-display text-[7rem] leading-none text-paper/90">{iniciais}</span>
                    <span className="absolute bottom-3 left-3 font-mono text-[10px] text-paper/50">
                      foto 3×4 · public/media/advogado.jpg
                    </span>
                  </div>
                )}
              </div>
              <figcaption className="absolute bottom-4 left-3 right-3 flex justify-between font-mono text-[10px] text-ink-soft">
                <span className="flex items-center gap-1.5"><Monograma className="h-3.5" />{ESCRITORIO.sigla}</span>
                <span>{ESCRITORIO.cidade}</span>
              </figcaption>
            </div>
          </figure>

          <div>
            <p data-item data-gsap-pending className="font-mono text-xs text-marker sm:text-sm">
              {ESCRITORIO.oabs.join("  ·  ")}
            </p>
            <h2
              id="qualificacao-titulo"
              data-item
              data-gsap-pending
              className="font-display mt-4 text-[clamp(2.8rem,12vw,4.5rem)] leading-[0.88] lg:text-[clamp(3.5rem,6vw,7rem)]"
            >
              {ESCRITORIO.advogado}
            </h2>
            <span data-draw className="mt-8 block h-px w-full bg-marker/60" />

            <p
              data-item
              data-gsap-pending
              data-paragrafo
              className="mt-8 max-w-[62ch] text-lg leading-[1.7] sm:text-xl"
            >
              <span className="font-semibold uppercase tracking-[0.02em] [font-stretch:85%]">
                {ESCRITORIO.advogado}
              </span>
              , advogado, inscrito na {ESCRITORIO.oabs.join(" e na ")}, formado pelo {QUALIFICACAO.formacao},{" "}
              {QUALIFICACAO.cargo}, com atuação em Direito do Consumidor e, em especial, em contratos de
              consórcio, envolvendo{" "}
              {QUALIFICACAO.temas.map((t, i) => (
                <span key={t}>
                  <span
                    data-mark
                    className="bg-[linear-gradient(transparent_80%,var(--color-marker)_80%,var(--color-marker)_94%,transparent_94%)] text-marker-2 bg-no-repeat [background-size:100%_100%]"
                  >
                    {t}
                  </span>
                  {i < QUALIFICACAO.temas.length - 2 ? ", " : i === QUALIFICACAO.temas.length - 2 ? " e " : "."}
                </span>
              ))}
            </p>

            <div data-item data-gsap-pending className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-stretch bg-marker text-ink outline-offset-4 focus-visible:outline-2 focus-visible:outline-marker"
              >
                <span className="px-5 py-3.5 text-[15px] font-semibold [font-stretch:88%] sm:px-6">
                  Falar com o Dr. Luiz
                </span>
                <span className="grid w-14 place-items-center border-l border-ink/15 transition-colors group-hover:bg-marker-2">
                  ↗
                </span>
              </a>
              <span className="font-mono text-[11px] text-paper/60">pelo WhatsApp · {ESCRITORIO.whatsapp.exibicao}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
